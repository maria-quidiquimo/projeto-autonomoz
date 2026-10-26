const loteRepository = require('../repositories/loteRepository');
const db = require('../config/database');
const movimentacaoService = require('./movimentacaoService');
const { registrarLog } = require('./logAuditoriaHelper');

class LoteService {
    async listarTodos(pagina = 1, limite = 20) {
        return await loteRepository.listarTodos(pagina, limite);
    }

    async buscarPorId(id, incluirInativos = false) {
        const lote = await loteRepository.buscarPorId(id, incluirInativos);

        if (!lote) {
            throw new Error('Lote não encontrado.');
        }

        return lote;
    }

    async cadastrar(dados, idUsuario) {
        if (!dados.codigo_lote) {
            throw new Error('O código do lote é obrigatório.');
        }

        if (!dados.fk_produto) {
            throw new Error('O produto é obrigatório.');
        }

        if (!dados.localizacao_fisica) {
            throw new Error('A localização física é obrigatória.');
        }

        if (!idUsuario) {
            throw new Error('O usuário autenticado é obrigatório.');
        }

        const quantidadeInicial = Number(dados.quantidade ?? 0);
        if (!Number.isInteger(quantidadeInicial) || quantidadeInicial < 0) {
            throw new Error('A quantidade inicial do lote deve ser um inteiro não negativo.');
        }

        const conexao = await db.getConnection();
        let resultado;

        try {
            await conexao.beginTransaction();

            resultado = await loteRepository.salvar(
                { ...dados, quantidade: 0 },
                conexao
            );

            if (quantidadeInicial > 0) {
                await movimentacaoService.cadastrar({
                    fk_lote: resultado.insertId,
                    fk_usuario: idUsuario,
                    tipo_movimento: 'ENTRADA',
                    quantidade: quantidadeInicial,
                    motivo_saida: `Estoque inicial do lote ${dados.codigo_lote}`
                }, conexao);
            } else {
                const [rows] = await conexao.query(
                    `
                    SELECT COALESCE(SUM(quantidade), 0) AS total
                    FROM Lote_Produto
                    WHERE fk_produto = ?
                    AND ativo = TRUE
                    `,
                    [dados.fk_produto]
                );

                await conexao.query(
                    'UPDATE Produto SET estoque_atual = ? WHERE id_produto = ?',
                    [rows[0].total, dados.fk_produto]
                );
            }

            await conexao.commit();
        } catch (erro) {
            await conexao.rollback();
            throw erro;
        } finally {
            conexao.release();
        }

        // Log de auditoria
        await registrarLog(
            'ENTRADA_LOTE',
            `Novo lote ${dados.codigo_lote} cadastrado para produto #${dados.fk_produto} com ${quantidadeInicial} unidades.`,
            idUsuario
        );

        return resultado;
    }

    async atualizar(id, dados) {
        if (dados.quantidade !== undefined) {
            throw new Error(
                'A quantidade do lote não pode ser alterada diretamente. Utilize movimentações de estoque.'
            );
        }

        const loteExistente = await this.buscarPorId(id, true);

        const conexao = await db.getConnection();

        try {
            await conexao.beginTransaction();

            const resultado = await loteRepository.atualizar(id, dados, conexao);

            if (
                dados.ativo !== undefined &&
                Boolean(dados.ativo) !== Boolean(loteExistente.ativo)
            ) {
                const [rows] = await conexao.query(
                    `
                    SELECT COALESCE(SUM(quantidade), 0) AS total
                    FROM Lote_Produto
                    WHERE fk_produto = ?
                    AND ativo = TRUE
                    `,
                    [loteExistente.fk_produto]
                );

                await conexao.query(
                    'UPDATE Produto SET estoque_atual = ? WHERE id_produto = ?',
                    [rows[0].total, loteExistente.fk_produto]
                );
            }

            await conexao.commit();
            return resultado;
        } catch (error) {
            await conexao.rollback();
            throw error;
        } finally {
            conexao.release();
        }
    }

    async excluir(id) {
        const lote = await this.buscarPorId(id);

        const resultado = await loteRepository.excluir(id);

        // Recalcular estoque atual após exclusão
        const [rows] = await db.query(
            `
            SELECT COALESCE(SUM(quantidade), 0) AS total
            FROM Lote_Produto
            WHERE fk_produto = ?
            AND ativo = TRUE
            `,
            [lote.fk_produto]
        );

        await db.query(
            'UPDATE Produto SET estoque_atual = ? WHERE id_produto = ?',
            [rows[0].total, lote.fk_produto]
        );

        return resultado;
    }
}

module.exports = new LoteService();
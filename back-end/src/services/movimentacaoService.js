const movimentacaoRepository = require('../repositories/movimentacaoRepository');
const loteRepository = require('../repositories/loteRepository');
const db = require('../config/database');
const { registrarLog } = require('./logAuditoriaHelper');

class MovimentacaoService {
    async listarTodos(pagina = 1, limite = 20) {
        return await movimentacaoRepository.listarTodos(
            pagina,
            limite
        );
    }

    async buscarPorId(id) {
        const movimentacao =
            await movimentacaoRepository.buscarPorId(id);

        if (!movimentacao) {
            throw new Error('Movimentação não encontrada.');
        }

        return movimentacao;
    }

    async cadastrar(dados, conexaoExterna = null) {
        if (!dados.fk_lote) {
            throw new Error('O lote (fk_lote) é obrigatório.');
        }

        if (!dados.fk_usuario) {
            throw new Error('O usuário (fk_usuario) é obrigatório.');
        }

        const tiposPermitidos = [
            'ENTRADA',
            'SAIDA',
            'AJUSTE_POSITIVO',
            'AJUSTE_NEGATIVO'
        ];

        if (
            !dados.tipo_movimento ||
            !tiposPermitidos.includes(dados.tipo_movimento)
        ) {
            throw new Error(
                `Tipo de movimento inválido. Use um dos seguintes: ${tiposPermitidos.join(', ')}.`
            );
        }

        if (!dados.quantidade || dados.quantidade <= 0) {
            throw new Error(
                'A quantidade deve ser maior que zero.'
            );
        }

        const exigeMotivo = [
            'SAIDA',
            'AJUSTE_POSITIVO',
            'AJUSTE_NEGATIVO'
        ].includes(dados.tipo_movimento);

        const motivo =
            dados.motivo_saida ||
            dados.justificativa ||
            dados.motivo;

        if (
            exigeMotivo &&
            (!motivo || motivo.trim() === '')
        ) {
            throw new Error(
                `O motivo/justificativa é obrigatório para operações de ${dados.tipo_movimento}.`
            );
        }

        const conexao = conexaoExterna || await db.getConnection();
        const gerenciaTransacao = !conexaoExterna;

        try {
            if (gerenciaTransacao) {
                await conexao.beginTransaction();
            }

            const [lotes] = await conexao.query(
                `
                SELECT lp.*, p.ativo AS produto_ativo
                FROM Lote_Produto lp
                INNER JOIN Produto p ON p.id_produto = lp.fk_produto
                WHERE lp.id_lote = ?
                FOR UPDATE
                `,
                [dados.fk_lote]
            );

            if (!lotes || lotes.length === 0) {
                throw new Error('Lote não encontrado.');
            }

            const lote = lotes[0];

            if (lote.ativo !== undefined && (lote.ativo === 0 || lote.ativo === false)) {
                throw new Error('Lote inativo, não é possível movimentar.');
            }

            if (lote.produto_ativo !== undefined && (lote.produto_ativo === 0 || lote.produto_ativo === false)) {
                throw new Error('Produto inativo, não é possível movimentar.');
            }

            if (
                (
                    dados.tipo_movimento === 'SAIDA' ||
                    dados.tipo_movimento === 'AJUSTE_NEGATIVO'
                ) &&
                dados.quantidade > lote.quantidade
            ) {
                const identificadorLote =
                    lote.codigo_lote || dados.fk_lote;

                throw new Error(
                    `Saldo insuficiente no lote ${identificadorLote}. Solicitado: ${dados.quantidade}, Disponível: ${lote.quantidade}.`
                );
            }

            let novaQuantidade = lote.quantidade;

            if (
                dados.tipo_movimento === 'ENTRADA' ||
                dados.tipo_movimento === 'AJUSTE_POSITIVO'
            ) {
                novaQuantidade += dados.quantidade;
            } else if (
                dados.tipo_movimento === 'SAIDA' ||
                dados.tipo_movimento === 'AJUSTE_NEGATIVO'
            ) {
                novaQuantidade -= dados.quantidade;
            }

            await conexao.query(
                `
                UPDATE Lote_Produto
                SET quantidade = ?
                WHERE id_lote = ?
                `,
                [
                    novaQuantidade,
                    dados.fk_lote
                ]
            );

            const [soma] = await conexao.query(
                `
                SELECT COALESCE(SUM(quantidade), 0) AS total
                FROM Lote_Produto
                WHERE fk_produto = ?
                AND ativo = TRUE
                `,
                [lote.fk_produto]
            );

            const estoqueAtual =
                soma[0]?.total || 0;

            await conexao.query(
                `
                UPDATE Produto
                SET estoque_atual = ?
                WHERE id_produto = ?
                `,
                [
                    estoqueAtual,
                    lote.fk_produto
                ]
            );

            const sqlMov = `
                INSERT INTO Movimentacao (
                    fk_lote,
                    fk_usuario,
                    tipo_movimento,
                    quantidade,
                    motivo_saida
                )
                VALUES (?, ?, ?, ?, ?)
            `;

            const [resultado] = await conexao.query(
                sqlMov,
                [
                    dados.fk_lote,
                    dados.fk_usuario,
                    dados.tipo_movimento,
                    dados.quantidade,
                    motivo || null
                ]
            );

            if (gerenciaTransacao) {
                await conexao.commit();
            }

            let tipoLog = 'ENTRADA_ESTOQUE';

            if (dados.tipo_movimento === 'SAIDA') {
                tipoLog = 'SAIDA_ESTOQUE';
            } else if (
                dados.tipo_movimento.startsWith('AJUSTE')
            ) {
                tipoLog = 'AJUSTE_ESTOQUE';
            }

            await registrarLog(
                tipoLog,
                `${dados.tipo_movimento} de ${dados.quantidade} unidades no lote ${lote.codigo_lote || dados.fk_lote}.${motivo ? ' Motivo: ' + motivo : ''}`,
                dados.fk_usuario
            );

            return {
                id_movimentacao: resultado.insertId,
                ...dados,
                motivo_saida: motivo
            };

        } catch (error) {
            if (gerenciaTransacao) {
                await conexao.rollback();
            }
            throw error;
        } finally {
            if (gerenciaTransacao) {
                conexao.release();
            }
        }
    }

    async ajustarEstoque(dados) {
        if (!dados.fk_lote || !dados.fk_usuario) {
            throw new Error(
                'Lote (fk_lote) e Usuário (fk_usuario) são obrigatórios.'
            );
        }

        const motivo =
            dados.justificativa ||
            dados.motivo ||
            dados.motivo_saida;

        if (!motivo || motivo.trim() === '') {
            throw new Error(
                'O motivo do ajuste de inventário é obrigatório.'
            );
        }

        let tipo_movimento =
            dados.tipo_movimento;

        let quantidade = Number(
            dados.quantidade_ajuste !== undefined
                ? dados.quantidade_ajuste
                : dados.quantidade
        );

        if (
            dados.tipo_ajuste === 'NEGATIVO' ||
            quantidade < 0
        ) {
            tipo_movimento = 'AJUSTE_NEGATIVO';
            quantidade = Math.abs(quantidade);
        } else if (
            dados.tipo_ajuste === 'POSITIVO' ||
            !tipo_movimento
        ) {
            tipo_movimento = 'AJUSTE_POSITIVO';
            quantidade = Math.abs(quantidade);
        }

        if (!quantidade || quantidade <= 0) {
            throw new Error(
                'A quantidade de ajuste deve ser maior que zero.'
            );
        }

        return await this.cadastrar({
            fk_lote: dados.fk_lote,
            fk_usuario: dados.fk_usuario,
            tipo_movimento,
            quantidade,
            motivo_saida: motivo
        });
    }

}

module.exports = new MovimentacaoService();
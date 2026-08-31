const movimentacaoRepository = require('../repositories/movimentacaoRepository');
const loteRepository = require('../repositories/loteRepository');
const db = require('../config/database');
const { registrarLog } = require('./logAuditoriaHelper');

class MovimentacaoService {
    async listarTodos() {
        return await movimentacaoRepository.listarTodos();
    }

    async buscarPorId(id) {
        const movimentacao = await movimentacaoRepository.buscarPorId(id);
        if (!movimentacao) {
            throw new Error('Movimentação não encontrada.');
        }
        return movimentacao;
    }

    async cadastrar(dados) {
        if (!dados.fk_lote) {
            throw new Error('O lote (fk_lote) é obrigatório.');
        }
        if (!dados.fk_usuario) {
            throw new Error('O usuário (fk_usuario) é obrigatório.');
        }
        if (!dados.tipo_movimento || !['ENTRADA', 'SAIDA'].includes(dados.tipo_movimento)) {
            throw new Error('Tipo de movimento inválido. Use "ENTRADA" ou "SAIDA".');
        }
        if (!dados.quantidade || dados.quantidade <= 0) {
            throw new Error('A quantidade deve ser maior que zero.');
        }
        if (dados.tipo_movimento === 'SAIDA' && !dados.motivo_saida) {
            throw new Error('O motivo da saída é obrigatório para movimentações de saída.');
        }

        const conexao = await db.getConnection();

        try {
            await conexao.beginTransaction();

            // 1. Bloqueia o lote para evitar concorrência (SELECT ... FOR UPDATE)
            const [lotes] = await conexao.query(
                'SELECT * FROM Lote_Produto WHERE id_lote = ? FOR UPDATE',
                [dados.fk_lote]
            );

            if (!lotes || lotes.length === 0) {
                throw new Error('Lote não encontrado.');
            }

            const lote = lotes[0];

            // 2. Validação de saldo para saída
            if (dados.tipo_movimento === 'SAIDA' && lote.quantidade < dados.quantidade) {
                throw new Error(`Quantidade insuficiente no lote. Disponível: ${lote.quantidade}, solicitado: ${dados.quantidade}.`);
            }

            // 3. Atualizar quantidade do Lote_Produto
            const novaQtdLote = dados.tipo_movimento === 'ENTRADA'
                ? lote.quantidade + dados.quantidade
                : lote.quantidade - dados.quantidade;

            await conexao.query(
                'UPDATE Lote_Produto SET quantidade = ? WHERE id_lote = ?',
                [novaQtdLote, dados.fk_lote]
            );

            // 4. Recalcular e atualizar estoque_atual do Produto (dispara o trigger de estoque mínimo)
            const [somaLotes] = await conexao.query(
                'SELECT COALESCE(SUM(quantidade), 0) AS total FROM Lote_Produto WHERE fk_produto = ? AND ativo = TRUE',
                [lote.fk_produto]
            );
            const estoqueAtual = somaLotes[0].total;

            await conexao.query(
                'UPDATE Produto SET estoque_atual = ? WHERE id_produto = ?',
                [estoqueAtual, lote.fk_produto]
            );

            // 5. Inserir o registro de Movimentação
            const sqlMov = `INSERT INTO Movimentacao (fk_lote, fk_usuario, tipo_movimento, quantidade, motivo_saida) 
                            VALUES (?, ?, ?, ?, ?)`;
            const [resultado] = await conexao.query(sqlMov, [
                dados.fk_lote,
                dados.fk_usuario,
                dados.tipo_movimento,
                dados.quantidade,
                dados.motivo_saida || null
            ]);

            await conexao.commit();

            // 6. Log de auditoria (RF-009)
            const tipoLog = dados.tipo_movimento === 'ENTRADA' ? 'ENTRADA_ESTOQUE' : 'SAIDA_ESTOQUE';
            await registrarLog(
                tipoLog,
                `${dados.tipo_movimento} de ${dados.quantidade} unidades no lote ${lote.codigo_lote}.${dados.motivo_saida ? ' Motivo: ' + dados.motivo_saida : ''}`,
                dados.fk_usuario
            );

            return { id_movimentacao: resultado.insertId, ...dados };
        } catch (error) {
            await conexao.rollback();
            throw error;
        } finally {
            conexao.release();
        }
    }

    async atualizar(id, dados) {
        await this.buscarPorId(id);
        return await movimentacaoRepository.atualizar(id, dados);
    }

    async excluir(id) {
        await this.buscarPorId(id);
        return await movimentacaoRepository.excluir(id);
    }
}

module.exports = new MovimentacaoService();

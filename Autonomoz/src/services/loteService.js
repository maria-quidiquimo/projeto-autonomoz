const loteRepository = require('../repositories/loteRepository');
const db = require('../config/database');
const { registrarLog } = require('./logAuditoriaHelper');

class LoteService {
    async listarTodos(pagina = 1, limite = 20) {
        return await loteRepository.listarTodos(pagina, limite);
    }

    async buscarPorId(id) {
        const lote = await loteRepository.buscarPorId(id);

        if (!lote) {
            throw new Error('Lote não encontrado.');
        }

        return lote;
    }

    async cadastrar(dados) {
        if (!dados.codigo_lote) {
            throw new Error('O código do lote é obrigatório.');
        }

        if (!dados.fk_produto) {
            throw new Error('O produto é obrigatório.');
        }

        if (!dados.localizacao_fisica) {
            throw new Error('A localização física é obrigatória.');
        }

        const resultado = await loteRepository.salvar(dados);

        // Recalcular estoque atual do produto
        const [rows] = await db.query(
            `
            SELECT COALESCE(SUM(quantidade), 0) AS total
            FROM Lote_Produto
            WHERE fk_produto = ?
            AND ativo = TRUE
            `,
            [dados.fk_produto]
        );

        await db.query(
            'UPDATE Produto SET estoque_atual = ? WHERE id_produto = ?',
            [rows[0].total, dados.fk_produto]
        );

        // Log de auditoria
        await registrarLog(
            'ENTRADA_LOTE',
            `Novo lote ${dados.codigo_lote} cadastrado para produto #${dados.fk_produto} com ${dados.quantidade || 0} unidades.`,
            null
        );

        return resultado;
    }

    async atualizar(id, dados) {
        await this.buscarPorId(id);

        return await loteRepository.atualizar(id, dados);
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
const db = require('../config/database');

class LocalizacaoRepository {
    async listarTodos() {
        const sql = 'SELECT DISTINCT localizacao_fisica FROM Lote_Produto WHERE ativo = TRUE ORDER BY localizacao_fisica';
        const [linhas] = await db.query(sql);
        return linhas.map((row, index) => ({
            id: index + 1,
            localizacao_fisica: row.localizacao_fisica
        }));
    }

    async buscarPorId(id) {
        // Busca lotes por localização com base no índice
        const todos = await this.listarTodos();
        return todos[id - 1] || null;
    }

    async buscarPorNome(nome) {
        const sql = 'SELECT DISTINCT localizacao_fisica FROM Lote_Produto WHERE localizacao_fisica = ? AND ativo = TRUE';
        const [linhas] = await db.query(sql, [nome]);
        return linhas[0] || null;
    }

    async listarLotesPorLocalizacao(localizacao) {
        const sql = `SELECT lp.*, p.nome_produto, p.codigo_item 
                     FROM Lote_Produto lp 
                     JOIN Produto p ON lp.fk_produto = p.id_produto 
                     WHERE lp.localizacao_fisica = ? AND lp.ativo = TRUE`;
        const [linhas] = await db.query(sql, [localizacao]);
        return linhas;
    }
}

module.exports = new LocalizacaoRepository();

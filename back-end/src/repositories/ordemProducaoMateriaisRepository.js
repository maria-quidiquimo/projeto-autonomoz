const db = require('../config/database');

class OrdemProducaoMateriaisRepository {
    async listarTodos() {
        const sql = 'SELECT * FROM Ordem_Producao_Materiais';
        const [linhas] = await db.query(sql);
        return linhas;
    }

    async buscarPorId(id) {
        const sql = 'SELECT * FROM Ordem_Producao_Materiais WHERE fk_ordem_producao = ?';
        const [linhas] = await db.query(sql, [id]);
        return linhas;
    }

    async salvar(dados) {
        const { fk_ordem_producao, fk_produto, quantidade_utilizada } = dados;
        const sql = `INSERT INTO Ordem_Producao_Materiais (fk_ordem_producao, fk_produto, quantidade_utilizada) 
                     VALUES (?, ?, ?)`;
        const [resultado] = await db.query(sql, [fk_ordem_producao, fk_produto, quantidade_utilizada || 1]);
        return resultado;
    }

    async atualizar(id, dados) {
        const { fk_produto, quantidade_utilizada } = dados;
        const sql = `UPDATE Ordem_Producao_Materiais SET fk_produto = ?, quantidade_utilizada = ? 
                     WHERE fk_ordem_producao = ?`;
        const [resultado] = await db.query(sql, [fk_produto, quantidade_utilizada, id]);
        return resultado;
    }

    async excluir(id) {
        const sql = 'DELETE FROM Ordem_Producao_Materiais WHERE fk_ordem_producao = ?';
        const [resultado] = await db.query(sql, [id]);
        return resultado;
    }
}

module.exports = new OrdemProducaoMateriaisRepository();

const db = require('../config/database');

class AlertasEstoqueRepository {
    async listarTodos() {
        const sql = 'SELECT * FROM Alertas_Estoque';
        const [linhas] = await db.query(sql);
        return linhas;
    }

    async buscarPorId(id) {
        const sql = 'SELECT * FROM Alertas_Estoque WHERE id_alerta = ?';
        const [linhas] = await db.query(sql, [id]);
        return linhas[0];
    }

    async salvar(alerta) {
        const { tipo_alerta, fk_produto, fk_lote, descricao, resolvido } = alerta;
        const sql = `INSERT INTO Alertas_Estoque (tipo_alerta, fk_produto, fk_lote, descricao, resolvido) 
                     VALUES (?, ?, ?, ?, ?)`;
        const [resultado] = await db.query(sql, [
            tipo_alerta, fk_produto || null, fk_lote || null, 
            descricao, resolvido ?? false
        ]);
        return resultado;
    }

    async atualizar(id, alerta) {
        const { resolvido } = alerta;
        const sql = `UPDATE Alertas_Estoque SET resolvido = ?, resolvido_em = ? WHERE id_alerta = ?`;
        const [resultado] = await db.query(sql, [resolvido, resolvido ? new Date() : null, id]);
        return resultado;
    }

    async excluir(id) {
        const sql = 'DELETE FROM Alertas_Estoque WHERE id_alerta = ?';
        const [resultado] = await db.query(sql, [id]);
        return resultado;
    }
}

module.exports = new AlertasEstoqueRepository();

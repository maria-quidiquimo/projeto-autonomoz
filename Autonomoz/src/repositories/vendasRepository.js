const db = require('../config/database');

class VendasRepository {
    async listarTodos() {
        const sql = 'SELECT * FROM Vendas';
        const [linhas] = await db.query(sql);
        return linhas;
    }

    async buscarPorId(id) {
        const sql = 'SELECT * FROM Vendas WHERE id_venda = ?';
        const [linhas] = await db.query(sql, [id]);
        return linhas[0];
    }

    async salvar(venda) {
        const { fk_ordem_producao, fk_usuario_gerente, valor_venda, data_venda, data_entrega_final, status_venda, observacoes } = venda;
        const sql = `INSERT INTO Vendas (fk_ordem_producao, fk_usuario_gerente, valor_venda, data_venda, data_entrega_final, status_venda, observacoes) 
                     VALUES (?, ?, ?, ?, ?, ?, ?)`;
        const [resultado] = await db.query(sql, [
            fk_ordem_producao, fk_usuario_gerente, valor_venda, 
            data_venda || new Date(), data_entrega_final || null, status_venda || 'PENDENTE', observacoes || null
        ]);
        return resultado;
    }

    async atualizar(id, venda) {
        const { valor_venda, data_entrega_final, status_venda, observacoes } = venda;
        const sql = `UPDATE Vendas SET valor_venda = ?, data_entrega_final = ?, status_venda = ?, observacoes = ? 
                     WHERE id_venda = ?`;
        const [resultado] = await db.query(sql, [valor_venda, data_entrega_final, status_venda, observacoes, id]);
        return resultado;
    }

    async excluir(id) {
        const sql = 'DELETE FROM Vendas WHERE id_venda = ?';
        const [resultado] = await db.query(sql, [id]);
        return resultado;
    }
}

module.exports = new VendasRepository();

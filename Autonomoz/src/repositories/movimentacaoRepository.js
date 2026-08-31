const db = require('../config/database');

class MovimentacaoRepository {
    async listarTodos() {
        const sql = 'SELECT * FROM Movimentacao';
        const [linhas] = await db.query(sql);
        return linhas;
    }

    async buscarPorId(id) {
        const sql = 'SELECT * FROM Movimentacao WHERE id_movimentacao = ?';
        const [linhas] = await db.query(sql, [id]);
        return linhas[0];
    }

    async salvar(movimentacao) {
        const { fk_lote, fk_usuario, tipo_movimento, quantidade, motivo_saida } = movimentacao;
        const sql = `INSERT INTO Movimentacao (fk_lote, fk_usuario, tipo_movimento, quantidade, motivo_saida) 
                     VALUES (?, ?, ?, ?, ?)`;
        const [resultado] = await db.query(sql, [fk_lote, fk_usuario, tipo_movimento, quantidade, motivo_saida || null]);
        return resultado;
    }

    async atualizar(id, movimentacao) {
        const { tipo_movimento, quantidade, motivo_saida } = movimentacao;
        const sql = `UPDATE Movimentacao SET tipo_movimento = ?, quantidade = ?, motivo_saida = ? 
                     WHERE id_movimentacao = ?`;
        const [resultado] = await db.query(sql, [tipo_movimento, quantidade, motivo_saida, id]);
        return resultado;
    }

    async excluir(id) {
        const sql = 'DELETE FROM Movimentacao WHERE id_movimentacao = ?';
        const [resultado] = await db.query(sql, [id]);
        return resultado;
    }
}

module.exports = new MovimentacaoRepository();

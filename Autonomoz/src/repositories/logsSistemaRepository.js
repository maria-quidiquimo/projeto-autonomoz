const db = require('../config/database');

class LogsSistemaRepository {
    async listarTodos() {
        const sql = 'SELECT * FROM Logs_Sistema';
        const [linhas] = await db.query(sql);
        return linhas;
    }

    async buscarPorId(id) {
        const sql = 'SELECT * FROM Logs_Sistema WHERE id_log = ?';
        const [linhas] = await db.query(sql, [id]);
        return linhas[0];
    }

    async salvar(log) {
        const { tipo_evento, mensagem, fk_usuario } = log;
        const sql = `INSERT INTO Logs_Sistema (tipo_evento, mensagem, fk_usuario) VALUES (?, ?, ?)`;
        const [resultado] = await db.query(sql, [tipo_evento, mensagem, fk_usuario || null]);
        return resultado;
    }

    async atualizar(id, log) {
        const { tipo_evento, mensagem, fk_usuario } = log;
        const sql = `UPDATE Logs_Sistema SET tipo_evento = ?, mensagem = ?, fk_usuario = ? WHERE id_log = ?`;
        const [resultado] = await db.query(sql, [tipo_evento, mensagem, fk_usuario, id]);
        return resultado;
    }

    async excluir(id) {
        const sql = 'DELETE FROM Logs_Sistema WHERE id_log = ?';
        const [resultado] = await db.query(sql, [id]);
        return resultado;
    }
}

module.exports = new LogsSistemaRepository();

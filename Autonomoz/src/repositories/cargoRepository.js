const db = require('../config/database');
const { tratarErroBanco } = require('../helpers/tratarErroBanco');

class CargoRepository {
    async listarTodos() {
        const [rows] = await db.query('SELECT * FROM Cargo ORDER BY nome_cargo ASC');
        return rows;
    }

    async buscarPorId(id) {
        const [rows] = await db.query('SELECT * FROM Cargo WHERE id_cargo = ?', [id]);
        return rows[0] || null;
    }

    async salvar(cargo) {
        const [res] = await db.query(
            'INSERT INTO Cargo (nome_cargo, descricao) VALUES (?, ?)',
            [cargo.nome_cargo, cargo.descricao || null]
        );
        return res.insertId;
    }

    async atualizar(id, cargo) {
        const [res] = await db.query(
            'UPDATE Cargo SET nome_cargo = ?, descricao = ? WHERE id_cargo = ?',
            [cargo.nome_cargo, cargo.descricao || null, id]
        );
        return res.affectedRows > 0;
    }

    async excluir(id) {
        try {
            // Mantém o DELETE físico, mas captura exceções de chave estrangeira (FK)
            const [res] = await db.query('DELETE FROM Cargo WHERE id_cargo = ?', [id]);
            return res.affectedRows > 0;
        } catch (error) {
            // Se houver usuários vinculados a este cargo, dispara a mensagem amigável
            tratarErroBanco(error, 'Cargo');
        }
    }
}

module.exports = new CargoRepository();
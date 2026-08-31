const db = require('../config/database');

class CargoRepository {
    async findAll() {
        const [rows] = await db.query('SELECT * FROM Cargo ORDER BY nome_cargo ASC');
        return rows;
    }

    async findById(id) {
        const [rows] = await db.query('SELECT * FROM Cargo WHERE id_cargo = ?', [id]);
        return rows[0] || null;
    }

    async save(cargo) {
        const [res] = await db.query(
            'INSERT INTO Cargo (nome_cargo, descricao) VALUES (?, ?)',
            [cargo.nome_cargo, cargo.descricao || null]
        );
        return res.insertId;
    }

    async update(id, cargo) {
        const [res] = await db.query(
            'UPDATE Cargo SET nome_cargo = ?, descricao = ? WHERE id_cargo = ?',
            [cargo.nome_cargo, cargo.descricao || null, id]
        );
        return res.affectedRows > 0;
    }

    async delete(id) {
        const [res] = await db.query('DELETE FROM Cargo WHERE id_cargo = ?', [id]);
        return res.affectedRows > 0;
    }

    // Aliases para padronização em português
    async listarTodos() { return this.findAll(); }
    async buscarPorId(id) { return this.findById(id); }
    async salvar(cargo) { return this.save(cargo); }
    async atualizar(id, cargo) { return this.update(id, cargo); }
    async excluir(id) { return this.delete(id); }
}

module.exports = new CargoRepository();
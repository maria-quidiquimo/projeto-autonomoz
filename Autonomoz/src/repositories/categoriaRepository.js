const db = require('../config/database');

class CategoriaRepository {
    async listarTodos() {
        const sql = 'SELECT * FROM Categoria ORDER BY nome_categoria ASC';
        const [linhas] = await db.query(sql);
        return linhas;
    }

    async buscarPorId(id) {
        const sql = 'SELECT * FROM Categoria WHERE id_categoria = ?';
        const [linhas] = await db.query(sql, [id]);
        return linhas[0] || null;
    }

    async salvar(categoria) {
        const { nome_categoria, descricao } = categoria;
        const sql = 'INSERT INTO Categoria (nome_categoria, descricao) VALUES (?, ?)';
        const [resultado] = await db.query(sql, [nome_categoria, descricao || null]);
        return resultado;
    }

    async atualizar(id, categoria) {
        const { nome_categoria, descricao } = categoria;
        const sql = 'UPDATE Categoria SET nome_categoria = ?, descricao = ? WHERE id_categoria = ?';
        const [resultado] = await db.query(sql, [nome_categoria, descricao || null, id]);
        return resultado;
    }

    async excluir(id) {
        const sql = 'DELETE FROM Categoria WHERE id_categoria = ?';
        const [resultado] = await db.query(sql, [id]);
        return resultado;
    }

    // Aliases para compatibilidade
    async findAll() { return this.listarTodos(); }
    async findById(id) { return this.buscarPorId(id); }
    async save(categoria) { return this.salvar(categoria); }
    async update(id, categoria) { return this.atualizar(id, categoria); }
    async delete(id) { return this.excluir(id); }
}

module.exports = new CategoriaRepository();
const db = require('../config/database');

class SubcategoriaRepository {
    async listarTodos() {
        const sql = 'SELECT * FROM Sub_Categoria';
        const [linhas] = await db.query(sql);
        return linhas;
    }

    async buscarPorId(id) {
        const sql = 'SELECT * FROM Sub_Categoria WHERE id_subcategoria = ?';
        const [linhas] = await db.query(sql, [id]);
        return linhas[0];
    }

    async salvar(subcategoria) {
        const { fk_categoria, nome_subcategoria, descricao } = subcategoria;
        const sql = `INSERT INTO Sub_Categoria (fk_categoria, nome_subcategoria, descricao) VALUES (?, ?, ?)`;
        const [resultado] = await db.query(sql, [fk_categoria, nome_subcategoria, descricao]);
        return resultado;
    }

    async atualizar(id, subcategoria) {
        const { fk_categoria, nome_subcategoria, descricao } = subcategoria;
        const sql = `UPDATE Sub_Categoria SET fk_categoria = ?, nome_subcategoria = ?, descricao = ? WHERE id_subcategoria = ?`;
        const [resultado] = await db.query(sql, [fk_categoria, nome_subcategoria, descricao, id]);
        return resultado;
    }

    async excluir(id) {
        const sql = 'DELETE FROM Sub_Categoria WHERE id_subcategoria = ?';
        const [resultado] = await db.query(sql, [id]);
        return resultado;
    }
}

module.exports = new SubcategoriaRepository();

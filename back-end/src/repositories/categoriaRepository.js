const db = require('../config/database');
const { tratarErroBanco } = require('../helpers/databaseErrorHelper');

class CategoriaRepository {
    async listarTodos() {
        const sql = 'SELECT * FROM Categoria';
        const [linhas] = await db.query(sql);
        return linhas;
    }

    async buscarPorId(id) {
        const sql = 'SELECT * FROM Categoria WHERE id_categoria = ?';
        const [linhas] = await db.query(sql, [id]);
        return linhas[0];
    }

    async salvar(categoria) {
        const { nome_categoria, descricao } = categoria;
        const sql = 'INSERT INTO Categoria (nome_categoria, descricao) VALUES (?, ?)';
        const [resultado] = await db.query(sql, [nome_categoria, descricao]);
        return resultado;
    }

    async atualizar(id, categoria) {
        const { nome_categoria, descricao } = categoria;
        const sql = 'UPDATE Categoria SET nome_categoria = ?, descricao = ? WHERE id_categoria = ?';
        const [resultado] = await db.query(sql, [nome_categoria, descricao, id]);
        return resultado;
    }

    // DELETE FÍSICO COM TRATAMENTO DE FK (Captura o erro 1451)
    async excluir(id) {
        try {
            const sql = 'DELETE FROM Categoria WHERE id_categoria = ?';
            const [resultado] = await db.query(sql, [id]);
            return resultado;
        } catch (error) {
            tratarErroBanco(error, 'Categoria');
        }
    }
}

module.exports = new CategoriaRepository();
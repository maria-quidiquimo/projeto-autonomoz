const db = require('../config/database');
const { tratarErroBanco } = require('../helpers/tratarErroBanco');

class SubcategoriaRepository {
    async listarTodos() {
        // Traz apenas as subcategorias ativas na listagem padrão
        const sql = 'SELECT * FROM Sub_Categoria WHERE ativo = TRUE';
        const [linhas] = await db.query(sql);
        return linhas;
    }

    async buscarPorId(id) {
        // Busca a subcategoria apenas se ela estiver ativa
        const sql = 'SELECT * FROM Sub_Categoria WHERE id_subcategoria = ? AND ativo = TRUE';
        const [linhas] = await db.query(sql, [id]);
        return linhas[0];
    }

    async salvar(subcategoria) {
        const { fk_categoria, nome_subcategoria, descricao, ativo } = subcategoria;
        const sql = `INSERT INTO Sub_Categoria (fk_categoria, nome_subcategoria, descricao, ativo) VALUES (?, ?, ?, ?)`;
        const [resultado] = await db.query(sql, [
            fk_categoria,
            nome_subcategoria,
            descricao,
            ativo ?? true
        ]);
        return resultado;
    }

    async atualizar(id, subcategoria) {
        const { fk_categoria, nome_subcategoria, descricao, ativo } = subcategoria;
        const sql = `UPDATE Sub_Categoria SET fk_categoria = ?, nome_subcategoria = ?, descricao = ?, ativo = ? WHERE id_subcategoria = ?`;
        const [resultado] = await db.query(sql, [
            fk_categoria,
            nome_subcategoria,
            descricao,
            ativo ?? true,
            id
        ]);
        return resultado;
    }

    async excluir(id) {
        try {
            // Soft Delete: desativa a subcategoria alterando 'ativo' para FALSE
            const sql = 'UPDATE Sub_Categoria SET ativo = FALSE WHERE id_subcategoria = ?';
            const [resultado] = await db.query(sql, [id]);
            return resultado;
        } catch (error) {
            // Captura o erro e lança a mensagem amigável com 'Subcategoria'
            tratarErroBanco(error, 'Subcategoria');
        }
    }
}

module.exports = new SubcategoriaRepository();
const db = require('../config/database');
const { tratarErroBanco } = require('../helpers/tratarErroBanco');

class FornecedorRepository {
    async listarTodos() {
        // Traz apenas fornecedores ativos na listagem padrão
        const sql = 'SELECT * FROM Fornecedor WHERE ativo = TRUE';
        const [linhas] = await db.query(sql);
        return linhas;
    }

    async buscarPorId(id) {
        // Traz o fornecedor somente se ele estiver ativo
        const sql = 'SELECT * FROM Fornecedor WHERE id_fornecedor = ? AND ativo = TRUE';
        const [linhas] = await db.query(sql, [id]);
        return linhas[0];
    }

    async salvar(fornecedor) {
        const { razao_social, contato_email, contato_telefone, ativo } = fornecedor;
        const sql = `INSERT INTO Fornecedor (razao_social, contato_email, contato_telefone, ativo) VALUES (?, ?, ?, ?)`;
        const [resultado] = await db.query(sql, [razao_social, contato_email, contato_telefone, ativo ?? true]);
        return resultado;
    }

    async atualizar(id, fornecedor) {
        const { razao_social, contato_email, contato_telefone, ativo } = fornecedor;
        const sql = `UPDATE Fornecedor SET razao_social = ?, contato_email = ?, contato_telefone = ?, ativo = ? WHERE id_fornecedor = ?`;
        const [resultado] = await db.query(sql, [razao_social, contato_email, contato_telefone, ativo, id]);
        return resultado;
    }

    async excluir(id) {
        try {
            // Soft Delete: desativa o fornecedor alterando 'ativo' para FALSE
            const sql = 'UPDATE Fornecedor SET ativo = FALSE WHERE id_fornecedor = ?';
            const [resultado] = await db.query(sql, [id]);
            return resultado;
        } catch (error) {
            // Captura o erro e lança a mensagem amigável com 'Fornecedor'
            tratarErroBanco(error, 'Fornecedor');
        }
    }
}

module.exports = new FornecedorRepository();
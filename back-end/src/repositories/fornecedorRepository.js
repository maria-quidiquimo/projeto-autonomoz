const db = require('../config/database');

class FornecedorRepository {
    async listarTodos() {
        const sql = 'SELECT * FROM Fornecedor';
        const [linhas] = await db.query(sql);
        return linhas;
    }

    async buscarPorId(id) {
        const sql = 'SELECT * FROM Fornecedor WHERE id_fornecedor = ?';
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
        const sql = 'DELETE FROM Fornecedor WHERE id_fornecedor = ?';
        const [resultado] = await db.query(sql, [id]);
        return resultado;
    }
}

module.exports = new FornecedorRepository();

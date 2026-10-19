const db = require('../config/database');

class OrdemProducaoFuncionarioRepository {
    async listarTodos() {
        const sql = 'SELECT * FROM Ordem_Producao_Funcionarios';
        const [linhas] = await db.query(sql);
        return linhas;
    }

    async buscarPorId(id) {
        // Tabela pivô com chave composta (fk_ordem_producao, fk_usuario) ou parâmetro id
        const sql = 'SELECT * FROM Ordem_Producao_Funcionarios WHERE fk_ordem_producao = ?';
        const [linhas] = await db.query(sql, [id]);
        return linhas;
    }

    async salvar(dados) {
        const { fk_ordem_producao, fk_usuario, data_alocacao } = dados;
        const sql = `INSERT INTO Ordem_Producao_Funcionarios (fk_ordem_producao, fk_usuario, data_alocacao) 
                     VALUES (?, ?, ?)`;
        const [resultado] = await db.query(sql, [
            fk_ordem_producao, 
            fk_usuario, 
            data_alocacao || new Date()
        ]);
        return resultado;
    }

    async atualizar(id, dados) {
        const { fk_usuario, data_alocacao } = dados;
        const sql = `UPDATE Ordem_Producao_Funcionarios SET fk_usuario = ?, data_alocacao = ? 
                     WHERE fk_ordem_producao = ?`;
        const [resultado] = await db.query(sql, [fk_usuario, data_alocacao, id]);
        return resultado;
    }

    async excluir(id) {
        const sql = 'DELETE FROM Ordem_Producao_Funcionarios WHERE fk_ordem_producao = ?';
        const [resultado] = await db.query(sql, [id]);
        return resultado;
    }
}

module.exports = new OrdemProducaoFuncionarioRepository();

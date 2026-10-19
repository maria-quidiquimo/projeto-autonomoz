const db = require('../config/database');

class OrdemProducaoRepository {
    async listarTodos() {
        const sql = 'SELECT * FROM Ordem_Producao';
        const [linhas] = await db.query(sql);
        return linhas;
    }

    async buscarPorId(id) {
        const sql = 'SELECT * FROM Ordem_Producao WHERE id_ordem_producao = ?';
        const [linhas] = await db.query(sql, [id]);
        return linhas[0];
    }

    async salvar(ordem) {
        const { nome_projeto, descricao, fk_usuario_responsavel, data_inicio, data_previsao_entrega, status_ordem } = ordem;
        const sql = `INSERT INTO Ordem_Producao (nome_projeto, descricao, fk_usuario_responsavel, data_inicio, data_previsao_entrega, status_ordem) 
                     VALUES (?, ?, ?, ?, ?, ?)`;
        const [resultado] = await db.query(sql, [
            nome_projeto, descricao, fk_usuario_responsavel || null, 
            data_inicio || new Date(), data_previsao_entrega || null, status_ordem || 'EM_ANDAMENTO'
        ]);
        return resultado;
    }

    async atualizar(id, ordem) {
        const { nome_projeto, descricao, fk_usuario_responsavel, data_previsao_entrega, status_ordem } = ordem;
        const sql = `UPDATE Ordem_Producao SET nome_projeto = ?, descricao = ?, fk_usuario_responsavel = ?, data_previsao_entrega = ?, status_ordem = ? 
                     WHERE id_ordem_producao = ?`;
        const [resultado] = await db.query(sql, [nome_projeto, descricao, fk_usuario_responsavel, data_previsao_entrega, status_ordem, id]);
        return resultado;
    }

    async excluir(id) {
        const sql = 'DELETE FROM Ordem_Producao WHERE id_ordem_producao = ?';
        const [resultado] = await db.query(sql, [id]);
        return resultado;
    }
}

module.exports = new OrdemProducaoRepository();

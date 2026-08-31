const db = require('../config/database');

class ProdutoRepository {
    // Busca todos os produtos - Nome da tabela: Produto
    async listarTodos() {
        const sql = 'SELECT * FROM Produto';
        const [linhas] = await db.query(sql); // [1, 3]
        return linhas;
    }

    async buscarPorId(id) {
        const sql = 'SELECT * FROM Produto WHERE id_produto = ?';
        const [linhas] = await db.query(sql, [id]);
        return linhas[0]; // Retorna apenas o objeto do produto
    }

    // Salvar agora inclui o codigo_item (obrigatório e único)
    async salvar(produto) {
        const { codigo_item, nome_produto, descricao, fk_subcategoria, fk_fornecedor, unidade_medida, valor_unitario, estoque_minimo, estoque_atual } = produto;
        
        const sql = `INSERT INTO Produto (codigo_item, nome_produto, descricao, fk_subcategoria, fk_fornecedor, unidade_medida, valor_unitario, estoque_minimo, estoque_atual) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`;
        
        const [resultado] = await db.query(sql, [
            codigo_item, nome_produto, descricao, fk_subcategoria, 
            fk_fornecedor, unidade_medida, valor_unitario, estoque_minimo, estoque_atual || 0
        ]);
        return resultado;
    }

    async atualizar(id, produto) {
        const { nome_produto, descricao, estoque_minimo } = produto;
        const sql = 'UPDATE Produto SET nome_produto = ?, descricao = ?, estoque_minimo = ? WHERE id_produto = ?';
        const [resultado] = await db.query(sql, [nome_produto, descricao, estoque_minimo, id]);
        return resultado;
    }

    async excluir(id) {
        const sql = 'DELETE FROM Produto WHERE id_produto = ?';
        const [resultado] = await db.query(sql, [id]);
        return resultado;
    }
}

module.exports = new ProdutoRepository(); // Exportação necessária [4]
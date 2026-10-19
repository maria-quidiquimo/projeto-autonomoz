const db = require('../config/database');
const { tratarErroBanco } = require('../helpers/databaseErrorHelper');

class ProdutoRepository {
    // Busca todos os produtos ativos
    async listarTodos() {
        const sql = 'SELECT * FROM Produto WHERE ativo = TRUE';
        const [linhas] = await db.query(sql);
        return linhas;
    }

    async buscarPorId(id) {
        const [linhas] = await db.query(
            'SELECT * FROM Produto WHERE id_produto = ? AND ativo = TRUE',
            [id]
        );
        return linhas[0];
    }

    async salvar(produto) {
        const {
            codigo_item,
            nome_produto,
            descricao,
            fk_subcategoria,
            fk_fornecedor,
            unidade_medida,
            valor_unitario,
            estoque_minimo,
            estoque_atual
        } = produto;

        const sql = `INSERT INTO Produto (codigo_item, nome_produto, descricao, fk_subcategoria, fk_fornecedor, unidade_medida, valor_unitario, estoque_minimo, estoque_atual) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`;

        const [resultado] = await db.query(sql, [
            codigo_item,
            nome_produto,
            descricao,
            fk_subcategoria,
            fk_fornecedor,
            unidade_medida,
            valor_unitario,
            estoque_minimo,
            estoque_atual || 0
        ]);
        return resultado;
    }

    async atualizar(id, produto) {
        const colunasPermitidas = [
            'codigo_item',
            'nome_produto',
            'descricao',
            'fk_subcategoria',
            'fk_fornecedor',
            'unidade_medida',
            'valor_unitario',
            'estoque_minimo',
            'ativo'
        ];

        const camposParaAtualizar = [];
        const valores = [];

        Object.keys(produto).forEach((campo) => {
            if (colunasPermitidas.includes(campo) && produto[campo] !== undefined) {
                camposParaAtualizar.push(`${campo} = ?`);
                valores.push(produto[campo]);
            }
        });

        if (camposParaAtualizar.length === 0) {
            return { affectedRows: 0 };
        }

        valores.push(id);

        const sql = `UPDATE Produto SET ${camposParaAtualizar.join(', ')} WHERE id_produto = ?`;
        const [resultado] = await db.query(sql, valores);
        
        return resultado;
    }

    // SOFT DELETE: inativa o produto sem apagar o histórico de movimentações/lotes
    async excluir(id) {
        try {
            const sql = 'UPDATE Produto SET ativo = FALSE WHERE id_produto = ?';
            const [resultado] = await db.query(sql, [id]);
            return resultado;
        } catch (error) {
            tratarErroBanco(error, 'Produto');
        }
    }
}

module.exports = new ProdutoRepository();
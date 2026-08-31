const produtoService = require('../services/produtoService');

class ProdutoController {
    async listar(req, res) {
        try {
            const produtos = await produtoService.listarTodos();
            res.status(200).json(produtos);
        } catch (erro) {
            res.status(500).json({ mensagem: 'Erro ao buscar produtos.', erro: erro.message });
        }
    }

    async buscarPorId(req, res) {
        try {
            const produto = await produtoService.buscarPorId(req.params.id);
            res.status(200).json(produto);
        } catch (erro) {
            res.status(404).json({ mensagem: erro.message });
        }
    }

    async cadastrar(req, res) {
        try {
            const resultado = await produtoService.cadastrar(req.body);
            res.status(201).json({ 
                id_produto: resultado.insertId, 
                ...req.body 
            });
        } catch (erro) {
            // Captura o erro de duplicidade (Entry Duplicate) do MySQL
            res.status(400).json({ mensagem: erro.message });
        }
    }

    async atualizar(req, res) {
        try {
            await produtoService.atualizar(req.params.id, req.body);
            res.status(200).json({ mensagem: 'Produto atualizado.' });
        } catch (erro) {
            res.status(400).json({ mensagem: erro.message });
        }
    }

    async excluir(req, res) {
        try {
            await produtoService.excluir(req.params.id);
            res.status(200).json({ mensagem: 'Produto removido.' });
        } catch (erro) {
            res.status(400).json({ mensagem: erro.message });
        }
    }
}

module.exports = new ProdutoController();
const fornecedorService = require('../services/fornecedorService');

class FornecedorController {
    async listar(req, res) {
        try {
            const fornecedores = await fornecedorService.listarTodos();
            res.status(200).json(fornecedores);
        } catch (erro) {
            res.status(500).json({ mensagem: 'Erro ao buscar fornecedores.', erro: erro.message });
        }
    }

    async buscarPorId(req, res) {
        try {
            const fornecedor = await fornecedorService.buscarPorId(req.params.id);
            res.status(200).json(fornecedor);
        } catch (erro) {
            res.status(404).json({ mensagem: erro.message });
        }
    }

    async cadastrar(req, res) {
        try {
            const resultado = await fornecedorService.cadastrar(req.body);
            res.status(201).json({ 
                id_fornecedor: resultado.insertId, 
                ...req.body 
            });
        } catch (erro) {
            res.status(400).json({ mensagem: erro.message });
        }
    }

    async atualizar(req, res) {
        try {
            await fornecedorService.atualizar(req.params.id, req.body);
            res.status(200).json({ mensagem: 'Fornecedor atualizado.' });
        } catch (erro) {
            res.status(400).json({ mensagem: erro.message });
        }
    }

    async excluir(req, res) {
        try {
            await fornecedorService.excluir(req.params.id);
            res.status(200).json({ mensagem: 'Fornecedor removido.' });
        } catch (erro) {
            res.status(400).json({ mensagem: erro.message });
        }
    }
}

module.exports = new FornecedorController();

const fornecedorService = require('../services/fornecedorService');
const { tratarErroController } = require('../helpers/tratarErroController');

class FornecedorController {
    async listar(req, res) {
        try {
            const fornecedores = await fornecedorService.listarTodos();
            return res.status(200).json(fornecedores);
        } catch (erro) {
            return tratarErroController(res, erro, 'Fornecedor.listar');
        }
    }

    async buscarPorId(req, res) {
        try {
            const fornecedor = await fornecedorService.buscarPorId(req.params.id);
            return res.status(200).json(fornecedor);
        } catch (erro) {
            return tratarErroController(res, erro, 'Fornecedor.buscarPorId');
        }
    }

    async cadastrar(req, res) {
        try {
            const resultado = await fornecedorService.cadastrar(req.body);
            return res.status(201).json({ 
                id_fornecedor: resultado.insertId, 
                ...req.body 
            });
        } catch (erro) {
            return tratarErroController(res, erro, 'Fornecedor.cadastrar');
        }
    }

    async atualizar(req, res) {
        try {
            await fornecedorService.atualizar(req.params.id, req.body);
            return res.status(200).json({ mensagem: 'Fornecedor atualizado.' });
        } catch (erro) {
            return tratarErroController(res, erro, 'Fornecedor.atualizar');
        }
    }

    async excluir(req, res) {
        try {
            await fornecedorService.excluir(req.params.id);
            return res.status(200).json({ mensagem: 'Fornecedor removido.' });
        } catch (erro) {
            return tratarErroController(res, erro, 'Fornecedor.excluir');
        }
    }
}

module.exports = new FornecedorController();
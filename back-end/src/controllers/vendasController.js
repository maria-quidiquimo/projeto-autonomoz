const vendasService = require('../services/vendasService');
const { tratarErroController } = require('../helpers/tratarErroController');

class VendasController {
    async listar(req, res) {
        try {
            const vendas = await vendasService.listarTodos();
            return res.status(200).json(vendas);
        } catch (erro) {
            return tratarErroController(res, erro, 'Vendas.listar');
        }
    }

    async buscarPorId(req, res) {
        try {
            const venda = await vendasService.buscarPorId(req.params.id);
            return res.status(200).json(venda);
        } catch (erro) {
            return tratarErroController(res, erro, 'Vendas.buscarPorId');
        }
    }

    async cadastrar(req, res) {
        try {
            const resultado = await vendasService.cadastrar(req.body);
            return res.status(201).json({ 
                id_venda: resultado.insertId, 
                ...req.body 
            });
        } catch (erro) {
            return tratarErroController(res, erro, 'Vendas.cadastrar');
        }
    }

    async atualizar(req, res) {
        try {
            await vendasService.atualizar(req.params.id, req.body);
            return res.status(200).json({ mensagem: 'Venda atualizada.' });
        } catch (erro) {
            return tratarErroController(res, erro, 'Vendas.atualizar');
        }
    }

    async excluir(req, res) {
        try {
            await vendasService.excluir(req.params.id);
            return res.status(200).json({ mensagem: 'Venda removida.' });
        } catch (erro) {
            return tratarErroController(res, erro, 'Vendas.excluir');
        }
    }
}

module.exports = new VendasController();
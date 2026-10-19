const vendasService = require('../services/vendasService');

class VendasController {
    async listar(req, res) {
        try {
            const vendas = await vendasService.listarTodos();
            res.status(200).json(vendas);
        } catch (erro) {
            res.status(500).json({ mensagem: 'Erro ao buscar vendas.', erro: erro.message });
        }
    }

    async buscarPorId(req, res) {
        try {
            const venda = await vendasService.buscarPorId(req.params.id);
            res.status(200).json(venda);
        } catch (erro) {
            res.status(404).json({ mensagem: erro.message });
        }
    }

    async cadastrar(req, res) {
        try {
            const resultado = await vendasService.cadastrar(req.body);
            res.status(201).json({ 
                id_venda: resultado.insertId, 
                ...req.body 
            });
        } catch (erro) {
            res.status(400).json({ mensagem: erro.message });
        }
    }

    async atualizar(req, res) {
        try {
            await vendasService.atualizar(req.params.id, req.body);
            res.status(200).json({ mensagem: 'Venda atualizada.' });
        } catch (erro) {
            res.status(400).json({ mensagem: erro.message });
        }
    }

    async excluir(req, res) {
        try {
            await vendasService.excluir(req.params.id);
            res.status(200).json({ mensagem: 'Venda removida.' });
        } catch (erro) {
            res.status(400).json({ mensagem: erro.message });
        }
    }
}

module.exports = new VendasController();

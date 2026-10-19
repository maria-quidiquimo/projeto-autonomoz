const alertasEstoqueService = require('../services/alertasEstoqueService');

class AlertasEstoqueController {
    async listar(req, res) {
        try {
            const alertas = await alertasEstoqueService.listarTodos();
            res.status(200).json(alertas);
        } catch (erro) {
            res.status(500).json({ mensagem: 'Erro ao buscar alertas.', erro: erro.message });
        }
    }

    async buscarPorId(req, res) {
        try {
            const alerta = await alertasEstoqueService.buscarPorId(req.params.id);
            res.status(200).json(alerta);
        } catch (erro) {
            res.status(404).json({ mensagem: erro.message });
        }
    }

    async cadastrar(req, res) {
        try {
            const resultado = await alertasEstoqueService.cadastrar(req.body);
            res.status(201).json({ 
                id_alerta: resultado.insertId, 
                ...req.body 
            });
        } catch (erro) {
            res.status(400).json({ mensagem: erro.message });
        }
    }

    async atualizar(req, res) {
        try {
            await alertasEstoqueService.atualizar(req.params.id, req.body);
            res.status(200).json({ mensagem: 'Alerta atualizado.' });
        } catch (erro) {
            res.status(400).json({ mensagem: erro.message });
        }
    }

    async excluir(req, res) {
        try {
            await alertasEstoqueService.excluir(req.params.id);
            res.status(200).json({ mensagem: 'Alerta removido.' });
        } catch (erro) {
            res.status(400).json({ mensagem: erro.message });
        }
    }
}

module.exports = new AlertasEstoqueController();

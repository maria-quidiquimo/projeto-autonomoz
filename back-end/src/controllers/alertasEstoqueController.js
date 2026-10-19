const alertasEstoqueService = require('../services/alertasEstoqueService');
const { tratarErroController } = require('../helpers/tratarErroController');

class AlertasEstoqueController {
    async listar(req, res) {
        try {
            const alertas = await alertasEstoqueService.listarTodos();
            return res.status(200).json(alertas);
        } catch (erro) {
            return tratarErroController(res, erro, 'AlertasEstoque.listar');
        }
    }

    async buscarPorId(req, res) {
        try {
            const alerta = await alertasEstoqueService.buscarPorId(req.params.id);
            return res.status(200).json(alerta);
        } catch (erro) {
            return tratarErroController(res, erro, 'AlertasEstoque.buscarPorId');
        }
    }

    async cadastrar(req, res) {
        try {
            const resultado = await alertasEstoqueService.cadastrar(req.body);
            return res.status(201).json({ id_alerta: resultado.insertId, ...req.body });
        } catch (erro) {
            return tratarErroController(res, erro, 'AlertasEstoque.cadastrar');
        }
    }

    async atualizar(req, res) {
        try {
            await alertasEstoqueService.atualizar(req.params.id, req.body);
            return res.status(200).json({ mensagem: 'Alerta atualizado.' });
        } catch (erro) {
            return tratarErroController(res, erro, 'AlertasEstoque.atualizar');
        }
    }

    async excluir(req, res) {
        try {
            await alertasEstoqueService.excluir(req.params.id);
            return res.status(200).json({ mensagem: 'Alerta removido.' });
        } catch (erro) {
            return tratarErroController(res, erro, 'AlertasEstoque.excluir');
        }
    }
}

module.exports = new AlertasEstoqueController();
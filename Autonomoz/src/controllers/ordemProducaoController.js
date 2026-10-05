const ordemProducaoService = require('../services/ordemProducaoService');
const { tratarErroController } = require('../helpers/tratarErroController');

class OrdemProducaoController {
    async listar(req, res) {
        try {
            const ordens = await ordemProducaoService.listarTodos();
            return res.status(200).json(ordens);
        } catch (erro) {
            return tratarErroController(res, erro, 'OrdemProducao.listar');
        }
    }

    async buscarPorId(req, res) {
        try {
            const ordem = await ordemProducaoService.buscarPorId(req.params.id);
            return res.status(200).json(ordem);
        } catch (erro) {
            return tratarErroController(res, erro, 'OrdemProducao.buscarPorId');
        }
    }

    async cadastrar(req, res) {
        try {
            const resultado = await ordemProducaoService.cadastrar(req.body);
            return res.status(201).json({ 
                id_ordem_producao: resultado.insertId, 
                ...req.body 
            });
        } catch (erro) {
            return tratarErroController(res, erro, 'OrdemProducao.cadastrar');
        }
    }

    async atualizar(req, res) {
        try {
            await ordemProducaoService.atualizar(req.params.id, req.body);
            return res.status(200).json({ mensagem: 'Ordem de produção atualizada.' });
        } catch (erro) {
            return tratarErroController(res, erro, 'OrdemProducao.atualizar');
        }
    }

    async excluir(req, res) {
        try {
            await ordemProducaoService.excluir(req.params.id);
            return res.status(200).json({ mensagem: 'Ordem de produção removida.' });
        } catch (erro) {
            return tratarErroController(res, erro, 'OrdemProducao.excluir');
        }
    }
}

module.exports = new OrdemProducaoController();
const localizacaoService = require('../services/localizacaoService');
const { tratarErroController } = require('../helpers/tratarErroController');

class LocalizacaoController {
    async listar(req, res) {
        try {
            const localizacoes = await localizacaoService.listarTodos();
            return res.status(200).json(localizacoes);
        } catch (erro) {
            return tratarErroController(res, erro, 'Localizacao.listar');
        }
    }

    async buscarPorId(req, res) {
        try {
            const localizacao = await localizacaoService.buscarPorId(req.params.id);
            return res.status(200).json(localizacao);
        } catch (erro) {
            return tratarErroController(res, erro, 'Localizacao.buscarPorId');
        }
    }

    async buscarLotes(req, res) {
        try {
            const { nome } = req.query;
            const lotes = await localizacaoService.buscarLotesPorLocalizacao(nome);
            return res.status(200).json(lotes);
        } catch (erro) {
            return tratarErroController(res, erro, 'Localizacao.buscarLotes');
        }
    }
}

module.exports = new LocalizacaoController();
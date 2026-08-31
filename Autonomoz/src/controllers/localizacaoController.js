const localizacaoService = require('../services/localizacaoService');

class LocalizacaoController {
    async listar(req, res) {
        try {
            const localizacoes = await localizacaoService.listarTodos();
            res.status(200).json(localizacoes);
        } catch (erro) {
            res.status(500).json({ mensagem: 'Erro ao buscar localizações.', erro: erro.message });
        }
    }

    async buscarPorId(req, res) {
        try {
            const localizacao = await localizacaoService.buscarPorId(req.params.id);
            res.status(200).json(localizacao);
        } catch (erro) {
            res.status(404).json({ mensagem: erro.message });
        }
    }

    async buscarLotes(req, res) {
        try {
            const { nome } = req.query;
            const lotes = await localizacaoService.buscarLotesPorLocalizacao(nome);
            res.status(200).json(lotes);
        } catch (erro) {
            res.status(400).json({ mensagem: erro.message });
        }
    }
}

module.exports = new LocalizacaoController();

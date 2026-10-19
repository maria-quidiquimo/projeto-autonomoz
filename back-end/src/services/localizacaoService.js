const localizacaoRepository = require('../repositories/localizacaoRepository');

class LocalizacaoService {
    async listarTodos() {
        return await localizacaoRepository.listarTodos();
    }

    async buscarPorId(id) {
        const localizacao = await localizacaoRepository.buscarPorId(id);
        if (!localizacao) {
            throw new Error('Localização não encontrada.');
        }
        return localizacao;
    }

    async buscarLotesPorLocalizacao(nome) {
        if (!nome) {
            throw new Error('O nome da localização é obrigatório.');
        }
        return await localizacaoRepository.listarLotesPorLocalizacao(nome);
    }
}

module.exports = new LocalizacaoService();

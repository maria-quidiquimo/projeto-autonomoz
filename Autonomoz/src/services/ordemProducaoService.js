const ordemProducaoRepository = require('../repositories/ordemProducaoRepository');
const {registrarLog} = require('./logService')

class OrdemProducaoService {
    async listarTodos() {
        return await ordemProducaoRepository.listarTodos();
    }

    async buscarPorId(id) {
        const ordem = await ordemProducaoRepository.buscarPorId(id);
        if (!ordem) {
            throw new Error('Ordem de produção não encontrada.');
        }
        return ordem;
    }

    async cadastrar(dados) {
        if (!dados.nome_projeto) {
            throw new Error('O nome do projeto é obrigatório.');
        }

        const novaOrdem = await ordemProducaoRepository.salvar(dados);

        await registrarLog(
            'CRIACAO_ORDEM_PRODUCAO',
            `Ordem de Produção "${dados.nome_projeto}" foi criada.`,
            idUsuarioLogado
        )
        return novaOrdem;
    }

    async atualizar(id, dados) {
        const novaExistente = await this.buscarPorId(id);
        const ordemAtualizada = await ordemProducaoRepository.atualizar(id, dados);
        
        // CONTINUAR...
    }

    async excluir(id) {
        await this.buscarPorId(id);
        return await ordemProducaoRepository.excluir(id);
    }
}

module.exports = new OrdemProducaoService();

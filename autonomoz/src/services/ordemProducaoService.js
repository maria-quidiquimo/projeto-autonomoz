const ordemProducaoRepository = require('../repositories/ordemProducaoRepository');

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

        return await ordemProducaoRepository.salvar(dados);
    }

    async atualizar(id, dados) {
        await this.buscarPorId(id);
        return await ordemProducaoRepository.atualizar(id, dados);
    }

    async excluir(id) {
        await this.buscarPorId(id);
        return await ordemProducaoRepository.excluir(id);
    }

    // Aliases para compatibilidade
    async getAll() { return this.listarTodos(); }
    async getById(id) { return this.buscarPorId(id); }
    async create(dados) { return this.cadastrar(dados); }
    async update(id, dados) { return this.atualizar(id, dados); }
    async delete(id) { return this.excluir(id); }
}

module.exports = new OrdemProducaoService();

const ordemProducaoMateriaisRepository = require('../repositories/ordemProducaoMateriaisRepository');

class OrdemProducaoMateriaisService {
    async listarTodos() {
        return await ordemProducaoMateriaisRepository.listarTodos();
    }

    async buscarPorId(id) {
        const registro = await ordemProducaoMateriaisRepository.buscarPorId(id);
        if (!registro || registro.length === 0) {
            throw new Error('Registro de material da ordem de produção não encontrado.');
        }
        return registro;
    }

    async cadastrar(dados) {
        if (!dados.fk_ordem_producao) {
            throw new Error('A Ordem de Produção é obrigatória.');
        }
        if (!dados.fk_produto) {
            throw new Error('O Produto é obrigatório.');
        }
        if (!dados.quantidade_utilizada || dados.quantidade_utilizada <= 0) {
            throw new Error('A quantidade utilizada deve ser maior que zero.');
        }

        return await ordemProducaoMateriaisRepository.salvar(dados);
    }

    async atualizar(id, dados) {
        await this.buscarPorId(id);
        return await ordemProducaoMateriaisRepository.atualizar(id, dados);
    }

    async excluir(id) {
        await this.buscarPorId(id);
        return await ordemProducaoMateriaisRepository.excluir(id);
    }
}

module.exports = new OrdemProducaoMateriaisService();

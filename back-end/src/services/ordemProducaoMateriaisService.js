const ordemProducaoMateriaisRepository = require('../repositories/ordemProducaoMateriaisRepository');
const produtoRepository = require('../repositories/produtoRepository');
const ordemProducaoRepository = require('../repositories/ordemProducaoRepository');

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

        const ordem = await ordemProducaoRepository.buscarPorId(dados.fk_ordem_producao);
        if (ordem && ordem.status_ordem === 'CONCLUIDA') {
            throw new Error('Não é possível vincular materiais a uma ordem de produção já concluída.');
        }

        const produto = await produtoRepository.buscarPorId(dados.fk_produto);
        if (!produto) {
            throw new Error('Produto não encontrado ou inativo.');
        }

        const saldoDisponivel = produto.estoque_atual !== undefined ? Number(produto.estoque_atual) : 0;
        if (saldoDisponivel < Number(dados.quantidade_utilizada)) {
            throw new Error(
                `Saldo insuficiente para o produto. Solicitado: ${dados.quantidade_utilizada}, Disponível: ${saldoDisponivel}.`
            );
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

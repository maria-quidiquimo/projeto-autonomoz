const produtoRepository = require('../repositories/produtoRepository');

class ProdutoService {
    async listarTodos() {
        return await produtoRepository.listarTodos();
    }

    async buscarPorId(id) {
        const produto = await produtoRepository.buscarPorId(id);
        if (!produto) {
            throw new Error('Produto não encontrado.');
        }
        return produto;
    }

    async cadastrar(dados) {
        // Validação de regra de negócio (RN-04 e RES-06) [6, 7]
        if (!dados.codigo_item) throw new Error('O código do item é obrigatório.');
        if (dados.estoque_minimo < 0) throw new Error('Estoque mínimo inválido.');

        return await produtoRepository.salvar(dados);
    }

    async atualizar(id, dados) {
        await this.buscarPorId(id);
        return await produtoRepository.atualizar(id, dados);
    }

    async excluir(id) {
        await this.buscarPorId(id);
        return await produtoRepository.excluir(id);
    }
}

module.exports = new ProdutoService();;
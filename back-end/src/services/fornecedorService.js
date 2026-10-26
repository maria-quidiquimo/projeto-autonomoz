const fornecedorRepository = require('../repositories/fornecedorRepository');

class FornecedorService {
    async listarTodos(incluirInativos = false) {
        return await fornecedorRepository.listarTodos(incluirInativos);
    }

    async buscarPorId(id) {
        const fornecedor = await fornecedorRepository.buscarPorId(id);
        if (!fornecedor) {
            throw new Error('Fornecedor não encontrado.');
        }
        return fornecedor;
    }

    async cadastrar(dados) {
        if (!dados.razao_social) {
            throw new Error('A razão social é obrigatória.');
        }
        return await fornecedorRepository.salvar(dados);
    }

    async atualizar(id, dados) {
        const fornecedor = await fornecedorRepository.buscarPorId(id, true);
        if (!fornecedor) {
            throw new Error('Fornecedor não encontrado.');
        }
        return await fornecedorRepository.atualizar(id, dados);
    }

    async excluir(id) {
        await this.buscarPorId(id);
        return await fornecedorRepository.excluir(id);
    }
}

module.exports = new FornecedorService();

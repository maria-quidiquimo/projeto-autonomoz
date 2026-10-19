const categoriaRepository = require('../repositories/categoriaRepository');

class CategoriaService {
    async listarTodos() {
        return await categoriaRepository.listarTodos();
    }

    async buscarPorId(id) {
        const categoria = await categoriaRepository.buscarPorId(id);
        if (!categoria) {
            throw new Error('Categoria não encontrada.');
        }
        return categoria;
    }

    async cadastrar(dados) {
        if (!dados.nome_categoria) {
            throw new Error('O nome da categoria é obrigatório.');
        }
        return await categoriaRepository.salvar(dados);
    }

    async atualizar(id, dados) {
        await this.buscarPorId(id);
        return await categoriaRepository.atualizar(id, dados);
    }

    async excluir(id) {
        await this.buscarPorId(id);
        return await categoriaRepository.excluir(id);
    }
}

module.exports = new CategoriaService();
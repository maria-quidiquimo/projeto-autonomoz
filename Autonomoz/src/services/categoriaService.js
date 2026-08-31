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

    // Aliases para compatibilidade
    async getAll() { return this.listarTodos(); }
    async getById(id) { return this.buscarPorId(id); }
    async create(dados) { return this.cadastrar(dados); }
    async update(id, dados) { return this.atualizar(id, dados); }
    async delete(id) { return this.excluir(id); }
}

module.exports = new CategoriaService();
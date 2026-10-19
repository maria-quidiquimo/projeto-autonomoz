const subcategoriaRepository = require('../repositories/subcategoriaRepository');

class SubcategoriaService {
    async listarTodos() {
        return await subcategoriaRepository.listarTodos();
    }

    async buscarPorId(id) {
        const subcategoria = await subcategoriaRepository.buscarPorId(id);
        if (!subcategoria) {
            throw new Error('Subcategoria não encontrada.');
        }
        return subcategoria;
    }

    async cadastrar(dados) {
        if (!dados.fk_categoria) {
            throw new Error('A categoria é obrigatória.');
        }
        if (!dados.nome_subcategoria) {
            throw new Error('O nome da subcategoria é obrigatório.');
        }
        return await subcategoriaRepository.salvar(dados);
    }

    async atualizar(id, dados) {
        await this.buscarPorId(id);
        return await subcategoriaRepository.atualizar(id, dados);
    }

    async excluir(id) {
        await this.buscarPorId(id);
        return await subcategoriaRepository.excluir(id);
    }
}

module.exports = new SubcategoriaService();

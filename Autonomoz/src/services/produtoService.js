const produtoRepository = require('../repositories/produtoRepository');
const { registrarLog } = require('./logService')

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

        const novoProduto = await produtoRepository.salvar(dados)

        // Registro de Log
        await registrarLog(
            'CRIACAO_PRODUTO',
            `Produto "${dadosProduto.nome_produto}" (Código: ${dadosProduto.codigo_item}) foi cadastrado.`,
            idUsuarioLogado
        );

        return novoProduto;
    }

    async atualizar(id, dados) {
        const produtoExistente = await this.buscarPorId(id);
        
        const produtoAtualizado = await produtoRepository.atualizar(id, dados);

        // Log de Auditoria
        await registrarLog(
            'EDICAO_PRODUTO',
            `Produto ID ${id} ("${produtoExistente.nome_produto}") foi atualizado.`,
            idUsuarioLogado
        )
        return produtoAtualizado
    }

    async excluir(id) {
        const resultado = await this.buscarPorId(id);
        
        await registrarLog(
            'INATIVACAO_PRODUTO',
            `Produto ID ${id} ("${produtoExistente.nome_produto}") foi removido/inativado.`,
            idUsuarioLogado
        )
        return resultado
    }
}

module.exports = new ProdutoService();;
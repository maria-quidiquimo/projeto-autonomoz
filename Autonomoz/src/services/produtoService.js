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

    async cadastrar(dados, idUsuarioLogado) {
        // Validação de regra de negócio (RN-04 e RES-06) [1, 2]
        if (!dados.codigo_item) throw new Error('O código do item é obrigatório.');
        if (dados.estoque_minimo < 0) throw new Error('Estoque mínimo inválido.');

        // 1. Sobrescreve para garantir que o estoque inicial seja 0 (RES-06) [1]
        const dadosComEstoqueZerado = {
            ...dados,
            estoque_atual: 0
        };

        // 2. Salva no banco de dados enviando o objeto com estoque zerado
        const novoProduto = await produtoRepository.salvar(dadosComEstoqueZerado);

        // 3. Registro de Log do Sistema
        await registrarLog(
            'CRIACAO_PRODUTO',
            `Produto "${dados.nome_produto}" (Código: ${dados.codigo_item}) foi cadastrado.`,
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
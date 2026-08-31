const ordemProducaoFuncionarioRepository = require('../repositories/ordemProducaoFuncionarioRepository');

class OrdemProducaoFuncionarioService {
    async listarTodos() {
        return await ordemProducaoFuncionarioRepository.listarTodos();
    }

    async buscarPorId(id) {
        const registro = await ordemProducaoFuncionarioRepository.buscarPorId(id);
        if (!registro) {
            throw new Error('Registro de ordem de produção / funcionário não encontrado.');
        }
        return registro;
    }

    async cadastrar(dados) {
        if (!dados.fk_ordem_producao) {
            throw new Error('A Ordem de Produção é obrigatória.');
        }
        if (!dados.fk_usuario) {
            throw new Error('O funcionário (usuário) é obrigatório.');
        }

        return await ordemProducaoFuncionarioRepository.salvar(dados);
    }

    async atualizar(id, dados) {
        await this.buscarPorId(id);
        return await ordemProducaoFuncionarioRepository.atualizar(id, dados);
    }

    async excluir(id) {
        await this.buscarPorId(id);
        return await ordemProducaoFuncionarioRepository.excluir(id);
    }
}

module.exports = new OrdemProducaoFuncionarioService();

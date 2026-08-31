const alertasEstoqueRepository = require('../repositories/alertasEstoqueRepository');

class AlertasEstoqueService {
    async listarTodos() {
        return await alertasEstoqueRepository.listarTodos();
    }

    async buscarPorId(id) {
        const alerta = await alertasEstoqueRepository.buscarPorId(id);
        if (!alerta) {
            throw new Error('Alerta não encontrado.');
        }
        return alerta;
    }

    async cadastrar(dados) {
        if (!dados.tipo_alerta) {
            throw new Error('O tipo de alerta é obrigatório.');
        }
        if (!dados.descricao) {
            throw new Error('A descrição é obrigatória.');
        }
        return await alertasEstoqueRepository.salvar(dados);
    }

    async atualizar(id, dados) {
        await this.buscarPorId(id);
        return await alertasEstoqueRepository.atualizar(id, dados);
    }

    async excluir(id) {
        await this.buscarPorId(id);
        return await alertasEstoqueRepository.excluir(id);
    }
}

module.exports = new AlertasEstoqueService();

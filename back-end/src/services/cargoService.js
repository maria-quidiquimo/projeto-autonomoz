const cargoRepository = require('../repositories/cargoRepository');

class CargoService {
    async listarTodos() {
        return await cargoRepository.listarTodos();
    }

    async buscarPorId(id) {
        const cargo = await cargoRepository.buscarPorId(id);
        if (!cargo) {
            throw new Error('Cargo não encontrado.');
        }
        return cargo;
    }

    async cadastrar(dados) {
        if (!dados.nome_cargo) {
            throw new Error('O nome do cargo é obrigatório.');
        }
        return await cargoRepository.salvar(dados);
    }

    async atualizar(id, dados) {
        await this.buscarPorId(id);
        return await cargoRepository.atualizar(id, dados);
    }

    async excluir(id) {
        await this.buscarPorId(id);
        return await cargoRepository.excluir(id);
    }
}

module.exports = new CargoService();
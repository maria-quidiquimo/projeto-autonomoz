const cargoRepository = require('../repositories/cargoRepository');

class CargoService {
    async getAll() {
        return await cargoRepository.findAll();
    }

    async getById(id) {
        const cargo = await cargoRepository.findById(id);
        if (!cargo) {
            throw new Error('Cargo não encontrado.');
        }
        return cargo;
    }

    async create(dados) {
        if (!dados.nome_cargo) {
            throw new Error('O nome do cargo é obrigatório.');
        }
        return await cargoRepository.save(dados);
    }

    async update(id, dados) {
        await this.getById(id);
        return await cargoRepository.update(id, dados);
    }

    async delete(id) {
        await this.getById(id);
        return await cargoRepository.delete(id);
    }

    // Aliases para compatibilidade em português
    async listarTodos() { return this.getAll(); }
    async buscarPorId(id) { return this.getById(id); }
    async cadastrar(dados) { return this.create(dados); }
    async atualizar(id, dados) { return this.update(id, dados); }
    async excluir(id) { return this.delete(id); }
}

module.exports = new CargoService();
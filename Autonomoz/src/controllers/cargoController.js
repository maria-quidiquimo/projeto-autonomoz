const cargoService = require('../services/cargoService');
const { tratarErroController } = require('../helpers/tratarErroController');

class CargoController {
    async listar(req, res) {
        try {
            const cargos = await cargoService.listarTodos();
            return res.status(200).json(cargos);
        } catch (error) {
            return tratarErroController(res, error, 'Cargo.listar');
        }
    }

    async buscarPorId(req, res) {
        try {
            const cargo = await cargoService.buscarPorId(req.params.id);
            return res.status(200).json(cargo);
        } catch (error) {
            return tratarErroController(res, error, 'Cargo.buscarPorId');
        }
    }

    async cadastrar(req, res) {
        try {
            const novoCargo = await cargoService.cadastrar(req.body);
            return res.status(201).json(novoCargo);
        } catch (error) {
            return tratarErroController(res, error, 'Cargo.cadastrar');
        }
    }

    async atualizar(req, res) {
        try {
            await cargoService.atualizar(req.params.id, req.body);
            return res.status(200).json({ message: 'Cargo atualizado com sucesso.' });
        } catch (error) {
            return tratarErroController(res, error, 'Cargo.atualizar');
        }
    }

    async excluir(req, res) {
        try {
            await cargoService.excluir(req.params.id);
            return res.status(200).json({ message: 'Cargo removido com sucesso.' });
        } catch (error) {
            return tratarErroController(res, error, 'Cargo.excluir');
        }
    }
}

module.exports = new CargoController();
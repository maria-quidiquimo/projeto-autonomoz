const cargoService = require('../services/cargoService');

class CargoController {
    async listar(req, res) {
        try {
            const cargos = await cargoService.listarTodos();
            return res.status(200).json(cargos);
        } catch (error) {
            return res.status(500).json({ error: error.message });
        }
    }

    async buscarPorId(req, res) {
        try {
            const cargo = await cargoService.buscarPorId(req.params.id);
            return res.status(200).json(cargo);
        } catch (error) {
            return res.status(404).json({ message: error.message });
        }
    }

    async cadastrar(req, res) {
        try {
            const novoCargo = await cargoService.cadastrar(req.body);
            return res.status(201).json(novoCargo);
        } catch (error) {
            return res.status(400).json({ error: error.message });
        }
    }

    async atualizar(req, res) {
        try {
            await cargoService.atualizar(req.params.id, req.body);
            return res.status(200).json({ message: 'Cargo atualizado com sucesso.' });
        } catch (error) {
            return res.status(400).json({ error: error.message });
        }
    }

    async excluir(req, res) {
        try {
            await cargoService.excluir(req.params.id);
            return res.status(200).json({ message: 'Cargo removido com sucesso.' });
        } catch (error) {
            return res.status(400).json({ error: error.message });
        }
    }
}

module.exports = new CargoController();
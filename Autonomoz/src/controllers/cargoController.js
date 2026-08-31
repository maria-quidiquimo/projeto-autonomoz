const cargoService = require('../services/cargoService');

class CargoController {
    async getAll(req, res) {
        try {
            const cargos = await cargoService.getAll();
            return res.status(200).json(cargos);
        } catch (error) {
            return res.status(500).json({ error: error.message });
        }
    }

    async getById(req, res) {
        try {
            const cargo = await cargoService.getById(req.params.id);
            return res.status(200).json(cargo);
        } catch (error) {
            return res.status(404).json({ message: error.message });
        }
    }

    async create(req, res) {
        try {
            const novoCargo = await cargoService.create(req.body);
            return res.status(201).json(novoCargo);
        } catch (error) {
            return res.status(400).json({ error: error.message });
        }
    }

    async update(req, res) {
        try {
            await cargoService.update(req.params.id, req.body);
            return res.status(200).json({ message: 'Cargo atualizado com sucesso.' });
        } catch (error) {
            return res.status(400).json({ error: error.message });
        }
    }

    async delete(req, res) {
        try {
            await cargoService.delete(req.params.id);
            return res.status(200).json({ message: 'Cargo removido com sucesso.' });
        } catch (error) {
            return res.status(400).json({ error: error.message });
        }
    }
}

module.exports = new CargoController();
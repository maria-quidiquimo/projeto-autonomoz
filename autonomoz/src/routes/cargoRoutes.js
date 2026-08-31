const express = require('express');
const router = express.Router();
const cargoController = require('../controllers/cargoController');
const { autenticar, apenasGerente } = require('../middlewares/auth');

router.get('/', autenticar, cargoController.getAll.bind(cargoController));
router.get('/:id', autenticar, cargoController.getById.bind(cargoController));
router.post('/', autenticar, apenasGerente, cargoController.create.bind(cargoController));
router.put('/:id', autenticar, apenasGerente, cargoController.update.bind(cargoController));
router.delete('/:id', autenticar, apenasGerente, cargoController.delete.bind(cargoController));

module.exports = router;
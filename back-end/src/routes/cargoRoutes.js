const express = require('express');
const router = express.Router();
const cargoController = require('../controllers/cargoController');
const { autenticar, apenasGerente } = require('../middlewares/auth');

router.get('/', autenticar, cargoController.listar.bind(cargoController));
router.get('/:id', autenticar, cargoController.buscarPorId.bind(cargoController));
router.post('/', autenticar, apenasGerente, cargoController.cadastrar.bind(cargoController));
router.put('/:id', autenticar, apenasGerente, cargoController.atualizar.bind(cargoController));
router.delete('/:id', autenticar, apenasGerente, cargoController.excluir.bind(cargoController));

module.exports = router;
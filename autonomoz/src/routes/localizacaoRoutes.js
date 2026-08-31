const express = require('express');
const router = express.Router();
const localizacaoController = require('../controllers/localizacaoController');

router.get('/', localizacaoController.listar.bind(localizacaoController));
router.get('/lotes', localizacaoController.buscarLotes.bind(localizacaoController));
router.get('/:id', localizacaoController.buscarPorId.bind(localizacaoController));

module.exports = router;

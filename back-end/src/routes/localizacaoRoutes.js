const express = require('express');
const router = express.Router();
const localizacaoController = require('../controllers/localizacaoController');
const { autenticar } = require('../middlewares/auth');

router.get('/', autenticar, localizacaoController.listar.bind(localizacaoController));
router.get('/lotes', autenticar, localizacaoController.buscarLotes.bind(localizacaoController));
router.get('/:id', autenticar, localizacaoController.buscarPorId.bind(localizacaoController));

module.exports = router;

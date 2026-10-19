const express = require('express');
const router = express.Router();
const logsSistemaController = require('../controllers/logsSistemaController');
const { autenticar, apenasGerente } = require('../middlewares/auth');

router.get('/', autenticar, apenasGerente, logsSistemaController.listar);
router.get('/:id', autenticar, apenasGerente, logsSistemaController.buscarPorId);

module.exports = router;


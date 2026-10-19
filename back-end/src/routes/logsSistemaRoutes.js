const express = require('express');
const router = express.Router();
const logsSistemaController = require('../controllers/logsSistemaController');
const { autenticar, apenasGerente } = require('../middlewares/auth');

router.get('/', autenticar, apenasGerente, logsSistemaController.listar);
router.get('/:id', autenticar, apenasGerente, logsSistemaController.buscarPorId);
router.post('/', autenticar, apenasGerente, logsSistemaController.cadastrar);
router.put('/:id', autenticar, apenasGerente, logsSistemaController.atualizar);
router.delete('/:id', autenticar, apenasGerente, logsSistemaController.excluir);

module.exports = router;

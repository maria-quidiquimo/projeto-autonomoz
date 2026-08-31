const express = require('express');
const router = express.Router();
const logsSistemaController = require('../controllers/logsSistemaController');

router.get('/', logsSistemaController.listar);
router.get('/:id', logsSistemaController.buscarPorId);
router.post('/', logsSistemaController.cadastrar);
router.put('/:id', logsSistemaController.atualizar);
router.delete('/:id', logsSistemaController.excluir);

module.exports = router;

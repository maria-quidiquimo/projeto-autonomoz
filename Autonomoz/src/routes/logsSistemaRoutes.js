const express = require('express');
const router = express.Router();
const logsSistemaController = require('../controllers/logsSistemaController');
const { autenticar } = require('../middlewares/auth');

router.get('/', autenticar, logsSistemaController.listar);
router.get('/:id', autenticar, logsSistemaController.buscarPorId);
router.post('/', autenticar, logsSistemaController.cadastrar);
router.put('/:id', autenticar, logsSistemaController.atualizar);
router.delete('/:id', autenticar, logsSistemaController.excluir);

module.exports = router;

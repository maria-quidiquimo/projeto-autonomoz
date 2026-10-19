const express = require('express');
const router = express.Router();
const loteController = require('../controllers/loteController');
const { autenticar, apenasGerente } = require('../middlewares/auth');

router.get('/', autenticar, loteController.listar);
router.get('/:id', autenticar, loteController.buscarPorId);
router.post('/', autenticar, apenasGerente, loteController.cadastrar);
router.put('/:id', autenticar, apenasGerente, loteController.atualizar);
router.delete('/:id', autenticar, apenasGerente, loteController.excluir);

module.exports = router;

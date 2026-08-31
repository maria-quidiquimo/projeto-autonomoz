const express = require('express');
const router = express.Router();
const loteController = require('../controllers/loteController');

router.get('/', loteController.listar);
router.get('/:id', loteController.buscarPorId);
router.post('/', loteController.cadastrar);
router.put('/:id', loteController.atualizar);
router.delete('/:id', loteController.excluir);

module.exports = router;

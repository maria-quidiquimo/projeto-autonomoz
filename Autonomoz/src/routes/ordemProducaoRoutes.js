const express = require('express');
const router = express.Router();
const ordemProducaoController = require('../controllers/ordemProducaoController');

router.get('/', ordemProducaoController.listar);
router.get('/:id', ordemProducaoController.buscarPorId);
router.post('/', ordemProducaoController.cadastrar);
router.put('/:id', ordemProducaoController.atualizar);
router.delete('/:id', ordemProducaoController.excluir);

module.exports = router;

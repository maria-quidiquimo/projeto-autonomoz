const express = require('express');
const router = express.Router();
const ordemProducaoMateriaisController = require('../controllers/ordemProducaoMateriaisController');

router.get('/', ordemProducaoMateriaisController.listar);
router.get('/:id', ordemProducaoMateriaisController.buscarPorId);
router.post('/', ordemProducaoMateriaisController.cadastrar);
router.put('/:id', ordemProducaoMateriaisController.atualizar);
router.delete('/:id', ordemProducaoMateriaisController.excluir);

module.exports = router;

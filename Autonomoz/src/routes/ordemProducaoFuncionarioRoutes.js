const express = require('express');
const router = express.Router();
const ordemProducaoFuncionarioController = require('../controllers/ordemProducaoFuncionarioController');

router.get('/', ordemProducaoFuncionarioController.listar);
router.get('/:id', ordemProducaoFuncionarioController.buscarPorId);
router.post('/', ordemProducaoFuncionarioController.cadastrar);
router.put('/:id', ordemProducaoFuncionarioController.atualizar);
router.delete('/:id', ordemProducaoFuncionarioController.excluir);

module.exports = router;

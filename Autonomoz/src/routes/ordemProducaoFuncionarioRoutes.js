const express = require('express');
const router = express.Router();
const ordemProducaoFuncionarioController = require('../controllers/ordemProducaoFuncionarioController');
const { autenticar } = require('../middlewares/auth');

router.get('/', autenticar, ordemProducaoFuncionarioController.listar);
router.get('/:id', autenticar, ordemProducaoFuncionarioController.buscarPorId);
router.post('/', autenticar, ordemProducaoFuncionarioController.cadastrar);
router.put('/:id', autenticar, ordemProducaoFuncionarioController.atualizar);
router.delete('/:id', autenticar, ordemProducaoFuncionarioController.excluir);

module.exports = router;

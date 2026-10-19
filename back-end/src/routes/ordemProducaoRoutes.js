const express = require('express');
const router = express.Router();
const ordemProducaoController = require('../controllers/ordemProducaoController');
const { autenticar } = require('../middlewares/auth');

router.get('/', autenticar, ordemProducaoController.listar);
router.get('/:id', autenticar, ordemProducaoController.buscarPorId);
router.post('/', autenticar, ordemProducaoController.cadastrar);
router.put('/:id', autenticar, ordemProducaoController.atualizar);
router.delete('/:id', autenticar, ordemProducaoController.excluir);

module.exports = router;

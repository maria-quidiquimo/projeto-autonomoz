const express = require('express');
const router = express.Router();
const ordemProducaoMateriaisController = require('../controllers/ordemProducaoMateriaisController');
const { autenticar } = require('../middlewares/auth');

router.get('/', autenticar, ordemProducaoMateriaisController.listar);
router.get('/:id', autenticar, ordemProducaoMateriaisController.buscarPorId);
router.post('/', autenticar, ordemProducaoMateriaisController.cadastrar);
router.put('/:id', autenticar, ordemProducaoMateriaisController.atualizar);
router.delete('/:id', autenticar, ordemProducaoMateriaisController.excluir);

module.exports = router;

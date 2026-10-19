const express = require('express');
const router = express.Router();
const alertasEstoqueController = require('../controllers/alertasEstoqueController');
const { autenticar } = require('../middlewares/auth');

router.get('/', autenticar, alertasEstoqueController.listar);
router.get('/:id', autenticar, alertasEstoqueController.buscarPorId);
router.post('/', autenticar, alertasEstoqueController.cadastrar);
router.put('/:id', autenticar, alertasEstoqueController.atualizar);
router.delete('/:id', autenticar, alertasEstoqueController.excluir);

module.exports = router;

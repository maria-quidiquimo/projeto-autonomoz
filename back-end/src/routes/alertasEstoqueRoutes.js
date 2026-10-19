const express = require('express');
const router = express.Router();
const alertasEstoqueController = require('../controllers/alertasEstoqueController');
const { autenticar, apenasGerente } = require('../middlewares/auth');

router.get('/', autenticar, alertasEstoqueController.listar);
router.get('/:id', autenticar, alertasEstoqueController.buscarPorId);
router.post('/', autenticar, apenasGerente, alertasEstoqueController.cadastrar);
router.put('/:id', autenticar, apenasGerente, alertasEstoqueController.atualizar);
router.delete('/:id', autenticar, apenasGerente, alertasEstoqueController.excluir);

module.exports = router;

const express = require('express');
const router = express.Router();
const alertasEstoqueController = require('../controllers/alertasEstoqueController');

router.get('/', alertasEstoqueController.listar);
router.get('/:id', alertasEstoqueController.buscarPorId);
router.post('/', alertasEstoqueController.cadastrar);
router.put('/:id', alertasEstoqueController.atualizar);
router.delete('/:id', alertasEstoqueController.excluir);

module.exports = router;

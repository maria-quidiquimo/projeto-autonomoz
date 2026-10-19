const express = require('express');
const router = express.Router();
const fornecedorController = require('../controllers/fornecedorController');
const { autenticar, apenasGerente } = require('../middlewares/auth');

router.get('/', autenticar, fornecedorController.listar);
router.get('/:id', autenticar, fornecedorController.buscarPorId);
router.post('/', autenticar, apenasGerente, fornecedorController.cadastrar);
router.put('/:id', autenticar, apenasGerente, fornecedorController.atualizar);
router.delete('/:id', autenticar, apenasGerente, fornecedorController.excluir);

module.exports = router;

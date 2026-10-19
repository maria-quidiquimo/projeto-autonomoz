const express = require('express');
const router = express.Router();
const fornecedorController = require('../controllers/fornecedorController');
const { autenticar } = require('../middlewares/auth');

router.get('/', autenticar, fornecedorController.listar);
router.get('/:id', autenticar, fornecedorController.buscarPorId);
router.post('/', autenticar, fornecedorController.cadastrar);
router.put('/:id', autenticar, fornecedorController.atualizar);
router.delete('/:id', autenticar, fornecedorController.excluir);

module.exports = router;

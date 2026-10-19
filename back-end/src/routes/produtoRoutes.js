const express = require('express');
const router = express.Router();
const produtoController = require('../controllers/produtoController');
const { autenticar } = require('../middlewares/auth');

router.get('/', autenticar, produtoController.listar);
router.get('/:id', autenticar, produtoController.buscarPorId);
router.post('/', autenticar, produtoController.cadastrar);
router.put('/:id', autenticar, produtoController.atualizar);
router.delete('/:id', autenticar, produtoController.excluir);

module.exports = router;
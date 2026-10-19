const express = require('express');
const router = express.Router();
const produtoController = require('../controllers/produtoController');
const { autenticar, apenasGerente } = require('../middlewares/auth');

router.get('/', autenticar, produtoController.listar);
router.get('/:id', autenticar, produtoController.buscarPorId);
router.post('/', autenticar, apenasGerente, produtoController.cadastrar);
router.put('/:id', autenticar, apenasGerente, produtoController.atualizar);
router.delete('/:id', autenticar, apenasGerente, produtoController.excluir);

module.exports = router;
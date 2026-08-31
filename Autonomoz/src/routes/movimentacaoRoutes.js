const express = require('express');
const router = express.Router();
const movimentacaoController = require('../controllers/movimentacaoController');
const { autenticar } = require('../middlewares/auth');

// Movimentações requerem autenticação (Funcionário ou Gerente podem fazer)
router.get('/', autenticar, movimentacaoController.listar.bind(movimentacaoController));
router.get('/:id', autenticar, movimentacaoController.buscarPorId.bind(movimentacaoController));
router.post('/', autenticar, movimentacaoController.cadastrar.bind(movimentacaoController));
router.put('/:id', autenticar, movimentacaoController.atualizar.bind(movimentacaoController));
router.delete('/:id', autenticar, movimentacaoController.excluir.bind(movimentacaoController));

module.exports = router;

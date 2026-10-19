const express = require('express');
const router = express.Router();
const movimentacaoController = require('../controllers/movimentacaoController');
const { autenticar, apenasGerente } = require('../middlewares/auth');

// Consultas e movimentações operacionais (entrada/saída) permitidas para FUNCIONARIO e GERENTE.
// Ajustes de inventário restritos para GERENTE.
router.get('/', autenticar, movimentacaoController.listar.bind(movimentacaoController));
router.get('/:id', autenticar, movimentacaoController.buscarPorId.bind(movimentacaoController));
router.post('/ajuste', autenticar, apenasGerente, movimentacaoController.ajustar.bind(movimentacaoController));
router.post('/', autenticar, movimentacaoController.cadastrar.bind(movimentacaoController));

module.exports = router;

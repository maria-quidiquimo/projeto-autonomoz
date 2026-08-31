const express = require('express');
const router = express.Router();
const vendasController = require('../controllers/vendasController');
const { autenticar, apenasGerente } = require('../middlewares/auth');

// Todas as rotas de vendas requerem autenticação
// POST/PUT/DELETE requerem GERENTE (RN-02)
router.get('/', autenticar, vendasController.listar.bind(vendasController));
router.get('/:id', autenticar, vendasController.buscarPorId.bind(vendasController));
router.post('/', autenticar, apenasGerente, vendasController.cadastrar.bind(vendasController));
router.put('/:id', autenticar, apenasGerente, vendasController.atualizar.bind(vendasController));
router.delete('/:id', autenticar, apenasGerente, vendasController.excluir.bind(vendasController));

module.exports = router;

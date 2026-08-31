const express = require('express');
const router = express.Router();
const usuarioController = require('../controllers/usuarioController');
const { autenticar, apenasGerente } = require('../middlewares/auth');

// 1. Rota de autenticação/login (pública, sem middleware)
router.post('/login', usuarioController.login.bind(usuarioController));

// 2. Rotas protegidas por autenticação
router.get('/', autenticar, usuarioController.listar.bind(usuarioController));
router.get('/cargos', autenticar, usuarioController.buscarCargos.bind(usuarioController));
router.get('/:id', autenticar, usuarioController.buscarPorId.bind(usuarioController));

// 3. Rotas exclusivas do gerente (RN-01, RN-05)
router.post('/', autenticar, apenasGerente, usuarioController.cadastrar.bind(usuarioController));
router.patch('/:id', autenticar, apenasGerente, usuarioController.atualizar.bind(usuarioController));
router.put('/:id', autenticar, apenasGerente, usuarioController.atualizar.bind(usuarioController));
router.delete('/:id', autenticar, apenasGerente, usuarioController.excluir.bind(usuarioController));

module.exports = router;
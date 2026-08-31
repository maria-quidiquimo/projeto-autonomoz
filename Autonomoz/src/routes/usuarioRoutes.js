const express = require('express');
const router = express.Router();
const usuarioController = require('../controllers/usuarioController');
const { autenticar, apenasGerente } = require('../middlewares/auth');

// 1. Rota de autenticação/login (pública, sem middleware)
router.post('/login', usuarioController.login.bind(usuarioController));

// 2. Rotas protegidas por autenticação
router.get('/', autenticar, usuarioController.getAll.bind(usuarioController));
router.get('/:id', autenticar, usuarioController.getById.bind(usuarioController));

// 3. Rotas exclusivas do gerente (RN-01, RN-05)
router.post('/', autenticar, apenasGerente, usuarioController.create.bind(usuarioController));
router.patch('/:id', autenticar, apenasGerente, usuarioController.update.bind(usuarioController));
router.put('/:id', autenticar, apenasGerente, usuarioController.update.bind(usuarioController));
router.delete('/:id', autenticar, apenasGerente, usuarioController.delete.bind(usuarioController));

module.exports = router;
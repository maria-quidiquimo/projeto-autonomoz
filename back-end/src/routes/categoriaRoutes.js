const express = require('express');
const router = express.Router();
const categoriaController = require('../controllers/categoriaController');
const { autenticar, apenasGerente } = require('../middlewares/auth');

router.get('/', autenticar, categoriaController.listar);
router.get('/:id', autenticar, categoriaController.buscarPorId);
router.post('/', autenticar, apenasGerente, categoriaController.cadastrar);
router.put('/:id', autenticar, apenasGerente, categoriaController.atualizar);
router.delete('/:id', autenticar, apenasGerente, categoriaController.excluir);

module.exports = router;
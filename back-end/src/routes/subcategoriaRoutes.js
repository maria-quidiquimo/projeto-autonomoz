const express = require('express');
const router = express.Router();
const subcategoriaController = require('../controllers/subcategoriaController');
const { autenticar, apenasGerente } = require('../middlewares/auth');

router.get('/', autenticar, subcategoriaController.listar);
router.get('/:id', autenticar, subcategoriaController.buscarPorId);
router.post('/', autenticar, apenasGerente, subcategoriaController.cadastrar);
router.put('/:id', autenticar, apenasGerente, subcategoriaController.atualizar);
router.delete('/:id', autenticar, apenasGerente, subcategoriaController.excluir);

module.exports = router;

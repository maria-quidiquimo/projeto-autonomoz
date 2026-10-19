const express = require('express');
const router = express.Router();
const categoriaController = require('../controllers/categoriaController');
const { autenticar } = require('../middlewares/auth');

router.get('/', autenticar, categoriaController.listar);
router.get('/:id', autenticar, categoriaController.buscarPorId);
router.post('/', autenticar, categoriaController.cadastrar);
router.put('/:id', autenticar, categoriaController.atualizar);
router.delete('/:id', autenticar, categoriaController.excluir);

module.exports = router;
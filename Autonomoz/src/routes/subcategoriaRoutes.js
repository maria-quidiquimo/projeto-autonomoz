const express = require('express');
const router = express.Router();
const subcategoriaController = require('../controllers/subcategoriaController');
const { autenticar } = require('../middlewares/auth');

router.get('/', autenticar, subcategoriaController.listar);
router.get('/:id', autenticar, subcategoriaController.buscarPorId);
router.post('/', autenticar, subcategoriaController.cadastrar);
router.put('/:id', autenticar, subcategoriaController.atualizar);
router.delete('/:id', autenticar, subcategoriaController.excluir);

module.exports = router;

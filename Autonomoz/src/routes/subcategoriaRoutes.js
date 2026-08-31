const express = require('express');
const router = express.Router();
const subcategoriaController = require('../controllers/subcategoriaController');

router.get('/', subcategoriaController.listar);
router.get('/:id', subcategoriaController.buscarPorId);
router.post('/', subcategoriaController.cadastrar);
router.put('/:id', subcategoriaController.atualizar);
router.delete('/:id', subcategoriaController.excluir);

module.exports = router;

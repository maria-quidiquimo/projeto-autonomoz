const express = require('express');
const router = express.Router();
const categoriaController = require('../controllers/categoriaController');

router.get('/', categoriaController.listar.bind(categoriaController));
router.get('/:id', categoriaController.buscarPorId.bind(categoriaController));
router.post('/', categoriaController.cadastrar.bind(categoriaController));
router.put('/:id', categoriaController.atualizar.bind(categoriaController));
router.delete('/:id', categoriaController.excluir.bind(categoriaController));

module.exports = router;
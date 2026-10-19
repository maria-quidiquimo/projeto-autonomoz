const express = require('express');
const router = express.Router();
const loteController = require('../controllers/loteController');
const { autenticar } = require('../middlewares/auth');

router.get('/', autenticar, loteController.listar);
router.get('/:id', autenticar, loteController.buscarPorId);
router.post('/', autenticar, loteController.cadastrar);
router.put('/:id', autenticar, loteController.atualizar);
router.delete('/:id', autenticar, loteController.excluir);

module.exports = router;

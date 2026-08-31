const express = require('express');
const router = express.Router();

const usuarioRoutes = require('./usuarioRoutes');
const fornecedorRoutes = require('./fornecedorRoutes');
const produtoRoutes = require('./produtoRoutes');
const subcategoriaRoutes = require('./subcategoriaRoutes');
const loteRoutes = require('./loteRoutes');
const movimentacaoRoutes = require('./movimentacaoRoutes');
const ordemProducaoRoutes = require('./ordemProducaoRoutes');
const ordemProducaoMateriaisRoutes = require('./ordemProducaoMateriaisRoutes');
const ordemProducaoFuncionarioRoutes = require('./ordemProducaoFuncionarioRoutes');
const vendasRoutes = require('./vendasRoutes');
const alertasEstoqueRoutes = require('./alertasEstoqueRoutes');
const logsSistemaRoutes = require('./logsSistemaRoutes');

// Mapeamento de todas as rotas ativas do sistema Autonomoz
router.use('/usuarios', usuarioRoutes);
router.use('/fornecedores', fornecedorRoutes);
router.use('/produtos', produtoRoutes);
router.use('/subcategoria', subcategoriaRoutes);
router.use('/lotes', loteRoutes);
router.use('/movimentacoes', movimentacaoRoutes);
router.use('/ordem_producao', ordemProducaoRoutes);
router.use('/ordem_producao_materiais', ordemProducaoMateriaisRoutes);
router.use('/ordem_producao_funcionario', ordemProducaoFuncionarioRoutes);
router.use('/vendas', vendasRoutes);
router.use('/alertas_estoque', alertasEstoqueRoutes);
router.use('/logs_sistema', logsSistemaRoutes);

module.exports = router;
const pool = require('../config/database');

class DashboardController {
    async obterMetricas(req, res) {
        try {
            // 1. Total itens e SKUs
            const [produtos] = await pool.query(`
                SELECT 
                    COALESCE(SUM(estoque_atual), 0) AS total_itens,
                    COUNT(*) AS total_skus
                FROM Produto
                WHERE ativo = TRUE
            `);

            // 2. Alertas ativos e críticos
            const [alertas] = await pool.query(`
                SELECT 
                    COUNT(*) AS total_alertas_ativos,
                    COALESCE(SUM(CASE WHEN tipo_alerta = 'ESTOQUE_MINIMO' THEN 1 ELSE 0 END), 0) AS alertas_criticos
                FROM Alertas_Estoque
                WHERE resolvido = FALSE
            `);

            // 3. OPs em andamento e total
            const [ordens] = await pool.query(`
                SELECT 
                    COUNT(*) AS total_ordens,
                    COALESCE(SUM(CASE WHEN status_ordem = 'EM_ANDAMENTO' THEN 1 ELSE 0 END), 0) AS ordens_em_andamento
                FROM Ordem_Producao
            `);

            // 4. Movimentações total e hoje
            const [movimentacoes] = await pool.query(`
                SELECT 
                    COUNT(*) AS total_movimentacoes,
                    COALESCE(SUM(CASE WHEN DATE(registrado_em) = CURDATE() THEN 1 ELSE 0 END), 0) AS movimentacoes_hoje
                FROM Movimentacao
            `);

            // 5. Total faturado (Vendas)
            const [vendas] = await pool.query(`
                SELECT 
                    COALESCE(SUM(valor_venda), 0) AS total_faturado
                FROM Vendas
                WHERE status_venda = 'PAGO'
            `);

            // 6. Últimas movimentações
            const [recentes] = await pool.query(`
                SELECT 
                    m.id_movimentacao,
                    m.fk_lote,
                    m.tipo_movimento,
                    m.quantidade,
                    m.motivo_saida,
                    m.registrado_em AS data_movimento,
                    lp.codigo_lote,
                    p.nome_produto,
                    u.nome_completo AS nome_usuario
                FROM Movimentacao m
                LEFT JOIN Lote_Produto lp ON m.fk_lote = lp.id_lote
                LEFT JOIN Produto p ON lp.fk_produto = p.id_produto
                LEFT JOIN Usuarios u ON m.fk_usuario = u.id_usuario
                ORDER BY m.registrado_em DESC
                LIMIT 10
            `);

            // 7. Alertas recentes pendentes
            const [alertasRecentes] = await pool.query(`
                SELECT 
                    a.id_alerta,
                    a.tipo_alerta,
                    a.descricao,
                    a.gerado_em AS created_at,
                    p.nome_produto,
                    p.codigo_item
                FROM Alertas_Estoque a
                LEFT JOIN Produto p ON a.fk_produto = p.id_produto
                WHERE a.resolvido = FALSE
                ORDER BY a.gerado_em DESC
                LIMIT 5
            `);

            return res.status(200).json({
                kpis: {
                    total_itens: Number(produtos[0]?.total_itens || 0),
                    total_skus: Number(produtos[0]?.total_skus || 0),
                    alertas_ativos: Number(alertas[0]?.total_alertas_ativos || 0),
                    alertas_criticos: Number(alertas[0]?.alertas_criticos || 0),
                    ordens_em_andamento: Number(ordens[0]?.ordens_em_andamento || 0),
                    total_ordens: Number(ordens[0]?.total_ordens || 0),
                    total_movimentacoes: Number(movimentacoes[0]?.total_movimentacoes || 0),
                    movimentacoes_hoje: Number(movimentacoes[0]?.movimentacoes_hoje || 0),
                    total_faturado: Number(vendas[0]?.total_faturado || 0)
                },
                movimentacoes_recentes: recentes,
                alertas_recentes: alertasRecentes
            });
        } catch (error) {
            return res.status(500).json({
                mensagem: 'Erro ao consolidar métricas do dashboard industrial.',
                erro: error.message
            });
        }
    }
}

module.exports = new DashboardController();

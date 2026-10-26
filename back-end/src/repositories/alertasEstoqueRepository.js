const db = require('../config/database');

class AlertasEstoqueRepository {
    async gerarAlertasValidade() {
        const connection = await db.getConnection();

        try {
            await connection.beginTransaction();

            await connection.query(`
                SELECT id_lote
                FROM Lote_Produto
                WHERE ativo = TRUE
                  AND data_validade IS NOT NULL
                  AND data_validade <= DATE_ADD(CURRENT_DATE, INTERVAL 7 DAY)
                FOR UPDATE
            `);

            await connection.query(`
                UPDATE Alertas_Estoque AS alerta
                INNER JOIN Lote_Produto AS lote ON lote.id_lote = alerta.fk_lote
                SET alerta.resolvido = TRUE,
                    alerta.resolvido_em = CURRENT_TIMESTAMP
                WHERE alerta.tipo_alerta = 'VALIDADE_PROXIMA'
                  AND alerta.resolvido = FALSE
                  AND lote.ativo = TRUE
                  AND lote.data_validade < CURRENT_DATE
            `);

            await connection.query(`
                INSERT INTO Alertas_Estoque (tipo_alerta, fk_lote, descricao)
                SELECT
                    'VALIDADE_VENCIDA',
                    lote.id_lote,
                    CONCAT('Lote ', lote.codigo_lote, ' está vencido (validade: ', lote.data_validade, ').')
                FROM Lote_Produto AS lote
                WHERE lote.ativo = TRUE
                  AND lote.data_validade < CURRENT_DATE
                  AND NOT EXISTS (
                      SELECT 1
                      FROM Alertas_Estoque AS alerta
                      WHERE alerta.fk_lote = lote.id_lote
                        AND alerta.tipo_alerta = 'VALIDADE_VENCIDA'
                  )
            `);

            await connection.query(`
                INSERT INTO Alertas_Estoque (tipo_alerta, fk_lote, descricao)
                SELECT
                    'VALIDADE_PROXIMA',
                    lote.id_lote,
                    CONCAT('Lote ', lote.codigo_lote, ' vence em breve (validade: ', lote.data_validade, ').')
                FROM Lote_Produto AS lote
                WHERE lote.ativo = TRUE
                  AND lote.data_validade >= CURRENT_DATE
                  AND lote.data_validade <= DATE_ADD(CURRENT_DATE, INTERVAL 7 DAY)
                  AND NOT EXISTS (
                      SELECT 1
                      FROM Alertas_Estoque AS alerta
                      WHERE alerta.fk_lote = lote.id_lote
                        AND alerta.tipo_alerta = 'VALIDADE_PROXIMA'
                  )
            `);

            await connection.commit();
        } catch (erro) {
            await connection.rollback();
            throw erro;
        } finally {
            connection.release();
        }
    }

    async listarTodos() {
        const sql = 'SELECT * FROM Alertas_Estoque';
        const [linhas] = await db.query(sql);
        return linhas;
    }

    async buscarPorId(id) {
        const sql = 'SELECT * FROM Alertas_Estoque WHERE id_alerta = ?';
        const [linhas] = await db.query(sql, [id]);
        return linhas[0];
    }

    async salvar(alerta) {
        const { tipo_alerta, fk_produto, fk_lote, descricao, resolvido } = alerta;
        const sql = `INSERT INTO Alertas_Estoque (tipo_alerta, fk_produto, fk_lote, descricao, resolvido) 
                     VALUES (?, ?, ?, ?, ?)`;
        const [resultado] = await db.query(sql, [
            tipo_alerta, fk_produto || null, fk_lote || null, 
            descricao, resolvido ?? false
        ]);
        return resultado;
    }

    async atualizar(id, alerta) {
        const { resolvido } = alerta;
        const sql = `UPDATE Alertas_Estoque SET resolvido = ?, resolvido_em = ? WHERE id_alerta = ?`;
        const [resultado] = await db.query(sql, [resolvido, resolvido ? new Date() : null, id]);
        return resultado;
    }

    async excluir(id) {
        const sql = 'DELETE FROM Alertas_Estoque WHERE id_alerta = ?';
        const [resultado] = await db.query(sql, [id]);
        return resultado;
    }
}

module.exports = new AlertasEstoqueRepository();

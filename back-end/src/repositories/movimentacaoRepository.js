const db = require('../config/database');

class MovimentacaoRepository {
    montarConsultaMovimentacoes(where = '') {
        return `
            SELECT m.*, lp.codigo_lote, p.nome_produto, u.nome_completo AS nome_usuario
            FROM Movimentacao m
            INNER JOIN Lote_Produto lp ON lp.id_lote = m.fk_lote
            INNER JOIN Produto p ON p.id_produto = lp.fk_produto
            LEFT JOIN Usuarios u ON u.id_usuario = m.fk_usuario
            ${where}
        `;
    }

    async listarTodos(pagina = 1, limite = 20) {
        const offset = (pagina - 1) * limite;

        const sqlTotal = `
            SELECT COUNT(*) AS total
            FROM Movimentacao
        `;

        const [resultadoTotal] = await db.query(
            sqlTotal
        );

        const total = resultadoTotal[0].total;

        const sql = `
            ${this.montarConsultaMovimentacoes()}
            ORDER BY m.id_movimentacao DESC
            LIMIT ? OFFSET ?
        `;

        const [linhas] = await db.query(
            sql,
            [
                limite,
                offset
            ]
        );

        return {
            dados: linhas,
            paginacao: {
                pagina,
                limite,
                total,
                totalPaginas: Math.ceil(
                    total / limite
                )
            }
        };
    }

    async buscarPorId(id) {
        const sql = this.montarConsultaMovimentacoes('WHERE m.id_movimentacao = ?');

        const [linhas] = await db.query(
            sql,
            [id]
        );

        return linhas[0];
    }

    async salvar(movimentacao) {
        const {
            fk_lote,
            fk_usuario,
            tipo_movimento,
            quantidade,
            motivo_saida
        } = movimentacao;

        const sql = `
            INSERT INTO Movimentacao (
                fk_lote,
                fk_usuario,
                tipo_movimento,
                quantidade,
                motivo_saida
            )
            VALUES (?, ?, ?, ?, ?)
        `;

        const [resultado] = await db.query(
            sql,
            [
                fk_lote,
                fk_usuario,
                tipo_movimento,
                quantidade,
                motivo_saida || null
            ]
        );

        return resultado;
    }

}

module.exports = new MovimentacaoRepository();
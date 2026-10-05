const db = require('../config/database');
const { tratarErroBanco } = require('../helpers/tratarErroBanco'); // Importação do helper

class LoteRepository {

    async listarTodos(pagina = 1, limite = 20) {
        const offset = (pagina - 1) * limite;

        const sqlTotal = `
            SELECT COUNT(*) AS total
            FROM Lote_Produto
            WHERE ativo = TRUE
        `;

        const [resultadoTotal] = await db.query(sqlTotal);

        const total = resultadoTotal[0].total;

        const sql = `
            SELECT *
            FROM Lote_Produto
            WHERE ativo = TRUE
            ORDER BY id_lote DESC
            LIMIT ? OFFSET ?
        `;

        const [linhas] = await db.query(sql, [
            limite,
            offset
        ]);

        return {
            dados: linhas,
            paginacao: {
                pagina,
                limite,
                total,
                totalPaginas: Math.ceil(total / limite)
            }
        };
    }

    async buscarPorId(id) {
        const sql = `
            SELECT *
            FROM Lote_Produto
            WHERE id_lote = ? AND ativo = TRUE
        `;

        const [linhas] = await db.query(sql, [id]);

        return linhas[0];
    }

    async salvar(lote) {
        const {
            codigo_lote,
            fk_produto,
            fk_fornecedor,
            quantidade,
            localizacao_fisica,
            data_entrada,
            data_validade,
            ativo
        } = lote;

        const sql = `
            INSERT INTO Lote_Produto (
                codigo_lote,
                fk_produto,
                fk_fornecedor,
                quantidade,
                localizacao_fisica,
                data_entrada,
                data_validade,
                ativo
            )
            VALUES (?, ?, ?, ?, ?, ?, ?, ?)
        `;

        const [resultado] = await db.query(sql, [
            codigo_lote,
            fk_produto,
            fk_fornecedor || null,
            quantidade || 0,
            localizacao_fisica,
            data_entrada || new Date(),
            data_validade || null,
            ativo ?? true
        ]);

        return resultado;
    }

    async atualizar(id, lote) {
        const {
            codigo_lote,
            quantidade,
            localizacao_fisica,
            data_validade,
            ativo
        } = lote;

        const sql = `
            UPDATE Lote_Produto
            SET
                codigo_lote = ?,
                quantidade = ?,
                localizacao_fisica = ?,
                data_validade = ?,
                ativo = ?
            WHERE id_lote = ?
        `;

        const [resultado] = await db.query(sql, [
            codigo_lote,
            quantidade,
            localizacao_fisica,
            data_validade,
            ativo,
            id
        ]);

        return resultado;
    }

    async excluir(id) {
        try {
            // Soft Delete: Inativa o lote alterando o campo 'ativo' para FALSE
            const sql = `
                UPDATE Lote_Produto
                SET ativo = FALSE
                WHERE id_lote = ?
            `;

            const [resultado] = await db.query(sql, [id]);

            return resultado;
        } catch (error) {
            // Trata o erro e lança a mensagem amigável da pasta helpers
            tratarErroBanco(error, 'Lote');
        }
    }
}

module.exports = new LoteRepository();
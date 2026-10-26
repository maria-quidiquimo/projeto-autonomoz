const db = require('../config/database');
const { tratarErroBanco } = require('../helpers/databaseErrorHelper');

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

    async buscarPorId(id, incluirInativos = false) {
        const sql = incluirInativos
            ? 'SELECT * FROM Lote_Produto WHERE id_lote = ?'
            : 'SELECT * FROM Lote_Produto WHERE id_lote = ? AND ativo = TRUE';

        const [linhas] = await db.query(sql, [id]);

        return linhas[0];
    }

    async salvar(lote, conexao = db) {
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

        const [resultado] = await conexao.query(sql, [
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

    async atualizar(id, lote, conexao = db) {
        const colunasPermitidas = [
            'codigo_lote',
            'fk_fornecedor',
            'localizacao_fisica',
            'data_validade',
            'ativo'
        ];

        const camposParaAtualizar = [];
        const valores = [];

        Object.keys(lote).forEach((campo) => {
            if (
                colunasPermitidas.includes(campo) &&
                lote[campo] !== undefined
            ) {
                camposParaAtualizar.push(`${campo} = ?`);
                valores.push(campo === 'data_validade' ? lote[campo] || null : lote[campo]);
            }
        });

        if (camposParaAtualizar.length === 0) {
            return {
                affectedRows: 0
            };
        }

        valores.push(id);

        const sql = `
            UPDATE Lote_Produto
            SET ${camposParaAtualizar.join(', ')}
            WHERE id_lote = ?
        `;

        const [resultado] = await conexao.query(sql, valores);

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
            tratarErroBanco(error, 'Lote');
        }
    }

    async inativarPorProduto(fk_produto) {
        try {
            const sql = `
                UPDATE Lote_Produto
                SET ativo = FALSE
                WHERE fk_produto = ?
            `;

            const [resultado] = await db.query(sql, [fk_produto]);
            return resultado;
        } catch (error) {
            tratarErroBanco(error, 'Lote');
        }
    }
}

module.exports = new LoteRepository();
const ordemProducaoRepository = require('../repositories/ordemProducaoRepository');
const movimentacaoService = require('./movimentacaoService');
const db = require('../config/database');
const { registrarLog } = require('./logService');

class OrdemProducaoService {
    async listarTodos() {
        return await ordemProducaoRepository.listarTodos();
    }

    async buscarPorId(id) {
        const ordem = await ordemProducaoRepository.buscarPorId(id);
        if (!ordem) {
            throw new Error('Ordem de produção não encontrada.');
        }
        return ordem;
    }

    async cadastrar(dados, idUsuarioLogado) {
        if (!dados.nome_projeto) {
            throw new Error('O nome do projeto é obrigatório.');
        }
        this.validarStatus(dados.status_ordem);

        const novaOrdem = await ordemProducaoRepository.salvar(dados);

        await registrarLog(
            'CRIACAO_ORDEM_PRODUCAO',
            `Ordem de Produção "${dados.nome_projeto}" foi criada.`,
            idUsuarioLogado
        );
        return novaOrdem;
    }

    async atualizar(id, dados, idUsuarioLogado) {
        this.validarStatus(dados.status_ordem);
        const ordemExistente = await this.buscarPorId(id);

        if (dados.status_ordem === 'CONCLUIDA' && ordemExistente.status_ordem !== 'CONCLUIDA') {
            const conexao = await db.getConnection();
            try {
                await conexao.beginTransaction();

                await this.baixarMateriaisOrdem(
                    id,
                    idUsuarioLogado || ordemExistente.fk_usuario_responsavel,
                    conexao
                );

                const dadosCompletos = { ...ordemExistente, ...dados };
                const ordemAtualizada = await ordemProducaoRepository.atualizar(id, dadosCompletos, conexao);

                await conexao.commit();

                await registrarLog(
                    'CONCLUSAO_ORDEM_PRODUCAO',
                    `Ordem de Produção "${ordemExistente.nome_projeto}" (ID: ${id}) foi concluída e os materiais foram baixados do estoque.`,
                    idUsuarioLogado
                );

                return ordemAtualizada;
            } catch (error) {
                await conexao.rollback();
                throw error;
            } finally {
                conexao.release();
            }
        }

        const dadosCompletos = { ...ordemExistente, ...dados };
        const ordemAtualizada = await ordemProducaoRepository.atualizar(id, dadosCompletos);
        await registrarLog(
            'EDICAO_ORDEM_PRODUCAO',
            `Ordem de Produção "${ordemExistente.nome_projeto}" (ID: ${id}) foi atualizada.`,
            idUsuarioLogado
        );
        return ordemAtualizada;
    }

    validarStatus(status) {
        const statusPermitidos = ['PENDENTE', 'EM_ANDAMENTO', 'CONCLUIDA', 'CANCELADA'];
        if (status !== undefined && !statusPermitidos.includes(status)) {
            throw new Error('O status da ordem de produção é inválido.');
        }
    }

    async baixarMateriaisOrdem(idOrdem, idUsuario, conexao) {
        const [materiais] = await conexao.query(
            `
            SELECT fk_produto, quantidade_utilizada
            FROM Ordem_Producao_Materiais
            WHERE fk_ordem_producao = ?
            `,
            [idOrdem]
        );

        if (!materiais || materiais.length === 0) {
            return;
        }

        for (const mat of materiais) {
            const quantidadeNecessaria = Number(mat.quantidade_utilizada);
            if (quantidadeNecessaria <= 0) continue;

            const [lotes] = await conexao.query(
                `
                SELECT id_lote, codigo_lote, quantidade
                FROM Lote_Produto
                WHERE fk_produto = ?
                  AND ativo = TRUE
                  AND quantidade > 0
                ORDER BY data_validade ASC, data_entrada ASC, id_lote ASC
                FOR UPDATE
                `,
                [mat.fk_produto]
            );

            const saldoTotal = (lotes || []).reduce((acc, l) => acc + Number(l.quantidade), 0);

            if (saldoTotal < quantidadeNecessaria) {
                throw new Error(
                    `Saldo insuficiente em estoque para o produto ID ${mat.fk_produto} ao concluir a OP #${idOrdem}. Solicitado: ${quantidadeNecessaria}, Disponível: ${saldoTotal}.`
                );
            }

            let restante = quantidadeNecessaria;

            for (const lote of lotes) {
                if (restante <= 0) break;

                const qtdBaixar = Math.min(Number(lote.quantidade), restante);

                await movimentacaoService.cadastrar({
                    fk_lote: lote.id_lote,
                    fk_usuario: idUsuario || 1,
                    tipo_movimento: 'SAIDA',
                    quantidade: qtdBaixar,
                    motivo_saida: `OP #${idOrdem}`
                }, conexao);

                restante -= qtdBaixar;
            }
        }
    }

    async excluir(id, idUsuarioLogado) {
        const ordemExistente = await this.buscarPorId(id);
        const resultado = await ordemProducaoRepository.excluir(id);
        await registrarLog(
            'INATIVACAO_ORDEM_PRODUCAO',
            `Ordem de Produção "${ordemExistente.nome_projeto}" (ID: ${id}) foi removida.`,
            idUsuarioLogado
        );
        return resultado;
    }
}

module.exports = new OrdemProducaoService();

const movimentacaoRepository = require('../repositories/movimentacaoRepository');
const loteRepository = require('../repositories/loteRepository');
const db = require('../config/database');
const { registrarLog } = require('./logAuditoriaHelper');

class MovimentacaoService {
    async listarTodos() {
        return await movimentacaoRepository.listarTodos();
    }

    async buscarPorId(id) {
        const movimentacao = await movimentacaoRepository.buscarPorId(id);
        if (!movimentacao) {
            throw new Error('Movimentação não encontrada.');
        }
        return movimentacao;
    }

    async cadastrar(dados) {
        if (!dados.fk_lote) {
            throw new Error('O lote (fk_lote) é obrigatório.');
        }
        if (!dados.fk_usuario) {
            throw new Error('O usuário (fk_usuario) é obrigatório.');
        }
        if (!dados.tipo_movimento || !['ENTRADA', 'SAIDA'].includes(dados.tipo_movimento)) {
            throw new Error('Tipo de movimento inválido. Use "ENTRADA" ou "SAIDA".');
        }
        if (!dados.quantidade || dados.quantidade <= 0) {
            throw new Error('A quantidade deve ser maior que zero.');
        }
        if (dados.tipo_movimento === 'SAIDA' && !dados.motivo_saida) {
            throw new Error('O motivo da saída é obrigatório para movimentações de saída.');
        }

        // Buscar o lote para validar e obter o fk_produto
        const lote = await loteRepository.buscarPorId(dados.fk_lote);
        if (!lote) {
            throw new Error('Lote não encontrado.');
        }

        // Se for SAIDA, verificar se a quantidade do lote é suficiente
        if (dados.tipo_movimento === 'SAIDA' && lote.quantidade < dados.quantidade) {
            throw new Error(`Quantidade insuficiente no lote. Disponível: ${lote.quantidade}, solicitado: ${dados.quantidade}.`);
        }

        // Registrar a movimentação
        const resultado = await movimentacaoRepository.salvar(dados);

        // Atualizar quantidade do lote
        const novaQtdLote = dados.tipo_movimento === 'ENTRADA'
            ? lote.quantidade + dados.quantidade
            : lote.quantidade - dados.quantidade;

        await db.query('UPDATE Lote_Produto SET quantidade = ? WHERE id_lote = ?', [novaQtdLote, dados.fk_lote]);

        // Recalcular estoque_atual do produto (soma de todos os lotes ativos)
        const [rows] = await db.query(
            'SELECT COALESCE(SUM(quantidade), 0) AS total FROM Lote_Produto WHERE fk_produto = ? AND ativo = TRUE',
            [lote.fk_produto]
        );
        const estoqueAtual = rows[0].total;

        await db.query('UPDATE Produto SET estoque_atual = ? WHERE id_produto = ?', [estoqueAtual, lote.fk_produto]);

        // Log de auditoria (RF-009)
        const tipoLog = dados.tipo_movimento === 'ENTRADA' ? 'ENTRADA_ESTOQUE' : 'SAIDA_ESTOQUE';
        await registrarLog(
            tipoLog,
            `${dados.tipo_movimento} de ${dados.quantidade} unidades no lote ${lote.codigo_lote}.${dados.motivo_saida ? ' Motivo: ' + dados.motivo_saida : ''}`,
            dados.fk_usuario
        );

        return resultado;
    }

    async atualizar(id, dados) {
        await this.buscarPorId(id);
        return await movimentacaoRepository.atualizar(id, dados);
    }

    async excluir(id) {
        await this.buscarPorId(id);
        return await movimentacaoRepository.excluir(id);
    }

    // Aliases para compatibilidade
    async getAll() { return this.listarTodos(); }
    async getById(id) { return this.buscarPorId(id); }
    async create(dados) { return this.cadastrar(dados); }
    async update(id, dados) { return this.atualizar(id, dados); }
    async delete(id) { return this.excluir(id); }
}

module.exports = new MovimentacaoService();

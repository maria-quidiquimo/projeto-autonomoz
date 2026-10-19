const request = require('supertest');
const app = require('../app');
const loteRepository = require('../repositories/loteRepository');
const movimentacaoRepository = require('../repositories/movimentacaoRepository');
const db = require('../config/database');
const { registrarLog } = require('../services/logAuditoriaHelper');
const { headerOperador, headerGerente } = require('./helpers/authHelper');

jest.mock('../config/database');
jest.mock('../services/logAuditoriaHelper', () => ({
  registrarLog: jest.fn().mockResolvedValue()
}));

describe('Módulo: Lote Produto e Movimentação Física', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('Rotas de Lotes (/api/lotes)', () => {
    it('deve listar todos os lotes ativos (GET /api/lotes)', async () => {
      const mockLotes = [
        { id_lote: 1, codigo_lote: 'LOTE-2026-A', fk_produto: 1, quantidade: 100, ativo: 1 }
      ];
      jest.spyOn(loteRepository, 'listarTodos').mockResolvedValue(mockLotes);

      const res = await request(app).get('/api/lotes').set(headerOperador());

      expect(res.status).toBe(200);
      expect(Array.isArray(res.body)).toBe(true);
      expect(res.body[0].codigo_lote).toBe('LOTE-2026-A');
    });

    it('deve retornar detalhes de um lote existente (GET /api/lotes/:id)', async () => {
      jest.spyOn(loteRepository, 'buscarPorId').mockResolvedValue({
        id_lote: 1,
        codigo_lote: 'LOTE-2026-A',
        fk_produto: 1,
        quantidade: 100
      });

      const res = await request(app).get('/api/lotes/1').set(headerOperador());

      expect(res.status).toBe(200);
      expect(res.body.id_lote).toBe(1);
    });

    it('deve retornar 404 para lote inexistente (GET /api/lotes/:id)', async () => {
      jest.spyOn(loteRepository, 'buscarPorId').mockResolvedValue(null);

      const res = await request(app).get('/api/lotes/999').set(headerOperador());

      expect(res.status).toBe(404);
      expect(res.body.mensagem).toMatch(/não encontrado/i);
    });

    it('deve cadastrar um novo lote com sucesso e recalcular estoque (POST /api/lotes)', async () => {
      const mockConn = db._mockConnection;
      mockConn.query
        .mockResolvedValueOnce([{ insertId: 5 }]) // Insere o lote com quantidade zero
        .mockResolvedValueOnce([[
          { id_lote: 5, codigo_lote: 'LOTE-2026-B', quantidade: 0, fk_produto: 1 }
        ]]) // Lê o lote para a entrada inicial
        .mockResolvedValueOnce([{ affectedRows: 1 }]) // Atualiza quantidade do lote
        .mockResolvedValueOnce([[{ total: 150 }]]) // Recalcula estoque do produto
        .mockResolvedValueOnce([{ affectedRows: 1 }]) // Atualiza produto
        .mockResolvedValueOnce([{ insertId: 10 }]); // Registra movimentação ENTRADA

      const novoLote = {
        codigo_lote: 'LOTE-2026-B',
        fk_produto: 1,
        localizacao_fisica: 'Prateleira A1',
        quantidade: 50,
        data_fabricacao: '2026-01-10',
        data_validade: '2027-01-10'
      };

      const res = await request(app)
        .post('/api/lotes')
        .set(headerOperador())
        .send(novoLote);

      expect(res.status).toBe(201);
      expect(res.body).toHaveProperty('id_lote', 5);
      expect(res.body.codigo_lote).toBe('LOTE-2026-B');
      expect(res.body.quantidade).toBe(50);
      expect(mockConn.beginTransaction).toHaveBeenCalledTimes(1);
      expect(mockConn.query.mock.calls[0][1]).toEqual([
        'LOTE-2026-B',
        1,
        null,
        0,
        'Prateleira A1',
        expect.any(Date),
        '2027-01-10',
        true
      ]);
      expect(mockConn.query.mock.calls[5][1]).toEqual([
        5,
        2,
        'ENTRADA',
        50,
        null
      ]);
      expect(mockConn.commit).toHaveBeenCalledTimes(1);
      expect(registrarLog).toHaveBeenCalledWith(
        'ENTRADA_LOTE',
        expect.stringContaining('com 50 unidades'),
        2
      );
    });

    it('deve reverter o cadastro do lote e a movimentação se a atualização do produto falhar', async () => {
      const mockConn = db._mockConnection;
      const databaseError = new Error('Falha ao atualizar produto');
      databaseError.sqlMessage = 'Falha ao atualizar produto';
      mockConn.query
        .mockResolvedValueOnce([{ insertId: 6 }])
        .mockResolvedValueOnce([[
          { id_lote: 6, codigo_lote: 'LOTE-ROLLBACK', quantidade: 0, fk_produto: 1 }
        ]])
        .mockResolvedValueOnce([{ affectedRows: 1 }])
        .mockResolvedValueOnce([[{ total: 20 }]])
        .mockRejectedValueOnce(databaseError);

      const res = await request(app)
        .post('/api/lotes')
        .set(headerOperador())
        .send({
          codigo_lote: 'LOTE-ROLLBACK',
          fk_produto: 1,
          localizacao_fisica: 'Prateleira A1',
          quantidade: 20
        });

      expect(res.status).toBe(500);
      expect(mockConn.rollback).toHaveBeenCalledTimes(1);
      expect(mockConn.commit).not.toHaveBeenCalled();
      expect(mockConn.release).toHaveBeenCalled();
    });

    it('deve rejeitar cadastro de lote sem localização física (POST /api/lotes)', async () => {
      const res = await request(app)
        .post('/api/lotes')
        .set(headerOperador())
        .send({
          codigo_lote: 'LOTE-SEM-LOC',
          fk_produto: 1
        });

      expect(res.status).toBe(400);
      expect(res.body.mensagem).toMatch(/localização física é obrigatória/i);
    });

    it('deve inativar lote existente (DELETE /api/lotes/:id)', async () => {
      jest.spyOn(loteRepository, 'buscarPorId').mockResolvedValue({ id_lote: 1, fk_produto: 1 });
      jest.spyOn(loteRepository, 'excluir').mockResolvedValue({ affectedRows: 1 });
      db.query
        .mockResolvedValueOnce([[{ total: 0 }]])
        .mockResolvedValueOnce([{ affectedRows: 1 }]);

      const res = await request(app).delete('/api/lotes/1').set(headerOperador());

      expect(res.status).toBe(200);
      expect(res.body.mensagem).toMatch(/removido/i);
    });

    it('deve atualizar dados permitidos do lote (PUT /api/lotes/:id)', async () => {
      jest.spyOn(loteRepository, 'buscarPorId').mockResolvedValue({ id_lote: 1, fk_produto: 1, ativo: 1 });
      jest.spyOn(loteRepository, 'atualizar').mockResolvedValue({ affectedRows: 1 });

      const res = await request(app)
        .put('/api/lotes/1')
        .set(headerOperador())
        .send({ localizacao_fisica: 'Prateleira B3' });

      expect(res.status).toBe(200);
      expect(res.body.mensagem).toMatch(/atualizado/i);
    });

    it('deve recusar tentativa de alterar quantidade diretamente pelo lote (PUT /api/lotes/:id)', async () => {
      const res = await request(app)
        .put('/api/lotes/1')
        .set(headerOperador())
        .send({ quantidade: 100 });

      expect(res.status).toBe(400);
      expect(res.body.mensagem).toMatch(/quantidade.*não pode ser alterada diretamente/i);
    });

    it('deve recalcular estoque do produto ao inativar lote via atualização (PUT /api/lotes/:id)', async () => {
      const mockConn = db._mockConnection;
      jest.spyOn(loteRepository, 'buscarPorId').mockResolvedValue({ id_lote: 1, fk_produto: 1, ativo: 1 });
      jest.spyOn(loteRepository, 'atualizar').mockResolvedValue({ affectedRows: 1 });
      mockConn.query
        .mockResolvedValueOnce([[{ total: 0 }]])
        .mockResolvedValueOnce([{ affectedRows: 1 }]);

      const res = await request(app)
        .put('/api/lotes/1')
        .set(headerOperador())
        .send({ ativo: false });

      expect(res.status).toBe(200);
      expect(res.body.mensagem).toMatch(/atualizado/i);
    });
  });

  describe('Rotas de Movimentação Física de Estoque (/api/movimentacoes)', () => {
    it('deve barrar acesso a movimentações sem autenticação (401)', async () => {
      const res = await request(app).get('/api/movimentacoes');
      expect(res.status).toBe(401);
    });

    it('deve listar movimentações com usuário autenticado (GET /api/movimentacoes)', async () => {
      jest.spyOn(movimentacaoRepository, 'listarTodos').mockResolvedValue([
        { id_movimentacao: 1, tipo_movimento: 'ENTRADA', quantidade: 50 }
      ]);

      const res = await request(app)
        .get('/api/movimentacoes')
        .set(headerOperador());

      expect(res.status).toBe(200);
      expect(Array.isArray(res.body)).toBe(true);
    });

    it('deve rejeitar edição ou exclusão de movimentações para preservar o histórico', async () => {
      const mockConn = db._mockConnection;

      const resAtualizacao = await request(app)
        .put('/api/movimentacoes/1')
        .set(headerOperador())
        .send({ quantidade: 500 });
      const resExclusao = await request(app)
        .delete('/api/movimentacoes/1')
        .set(headerOperador());

      expect(resAtualizacao.status).toBe(404);
      expect(resExclusao.status).toBe(404);
      expect(mockConn.query).not.toHaveBeenCalled();
    });

    it('deve registrar movimentação de ENTRADA com sucesso (POST /api/movimentacoes)', async () => {
      const mockConn = db._mockConnection;
      mockConn.query
        .mockResolvedValueOnce([[{ id_lote: 1, codigo_lote: 'LOTE-1', quantidade: 100, fk_produto: 1 }]])
        .mockResolvedValueOnce([{ affectedRows: 1 }]) // Update lote
        .mockResolvedValueOnce([[{ total: 150 }]]) // Recalculo produto
        .mockResolvedValueOnce([{ affectedRows: 1 }]) // Update produto
        .mockResolvedValueOnce([{ insertId: 10 }]); // Insert movimentacao

      jest.spyOn(movimentacaoRepository, 'salvar').mockResolvedValue({ insertId: 10 });

      const payload = {
        fk_lote: 1,
        fk_usuario: 2,
        tipo_movimento: 'ENTRADA',
        quantidade: 50
      };

      const res = await request(app)
        .post('/api/movimentacoes')
        .set(headerOperador())
        .send(payload);

      expect(res.status).toBe(201);
      expect(res.body).toHaveProperty('id_movimentacao', 10);
    });

    it('deve recusar SAIDA quando saldo for insuficiente no lote (POST /api/movimentacoes)', async () => {
      const mockConn = db._mockConnection;
      mockConn.query.mockResolvedValueOnce([[{ id_lote: 1, codigo_lote: 'LOTE-1', quantidade: 10, fk_produto: 1 }]]);

      const payload = {
        fk_lote: 1,
        fk_usuario: 2,
        tipo_movimento: 'SAIDA',
        quantidade: 50,
        motivo_saida: 'Uso em produção'
      };

      const res = await request(app)
        .post('/api/movimentacoes')
        .set(headerOperador())
        .send(payload);

      expect(res.status).toBe(400);
      expect(res.body.mensagem).toMatch(/saldo insuficiente/i);
    });

    it('deve registrar SAIDA com saldo suficiente e justificativa (POST /api/movimentacoes)', async () => {
      const mockConn = db._mockConnection;
      mockConn.query
        .mockResolvedValueOnce([[{ id_lote: 1, codigo_lote: 'LOTE-1', quantidade: 100, fk_produto: 1 }]])
        .mockResolvedValueOnce([{ affectedRows: 1 }]) // Update lote
        .mockResolvedValueOnce([[{ total: 70 }]]) // Recalculo produto
        .mockResolvedValueOnce([{ affectedRows: 1 }]) // Update produto
        .mockResolvedValueOnce([{ insertId: 11 }]);

      jest.spyOn(movimentacaoRepository, 'salvar').mockResolvedValue({ insertId: 11 });

      const payload = {
        fk_lote: 1,
        fk_usuario: 2,
        tipo_movimento: 'SAIDA',
        quantidade: 30,
        motivo_saida: 'Baixa de linha de montagem'
      };

      const res = await request(app)
        .post('/api/movimentacoes')
        .set(headerOperador())
        .send(payload);

      expect(res.status).toBe(201);
      expect(res.body).toHaveProperty('id_movimentacao', 11);
    });

    it('deve realizar ajuste de inventário com sucesso (POST /api/movimentacoes/ajuste)', async () => {
      const mockConn = db._mockConnection;
      mockConn.query
        .mockResolvedValueOnce([[{ id_lote: 1, codigo_lote: 'LOTE-1', quantidade: 100, fk_produto: 1 }]])
        .mockResolvedValueOnce([{ affectedRows: 1 }]) // Update lote
        .mockResolvedValueOnce([[{ total: 110 }]]) // Recalculo produto
        .mockResolvedValueOnce([{ affectedRows: 1 }]) // Update produto
        .mockResolvedValueOnce([{ insertId: 12 }]);

      jest.spyOn(movimentacaoRepository, 'salvar').mockResolvedValue({ insertId: 12 });

      const payload = {
        fk_lote: 1,
        fk_usuario: 2,
        quantidade_ajuste: 10,
        tipo_ajuste: 'POSITIVO',
        justificativa: 'Contagem cíclica de inventário'
      };

      const res = await request(app)
        .post('/api/movimentacoes/ajuste')
        .set(headerOperador())
        .send(payload);

      expect(res.status).toBe(200);
      expect(res.body.mensagem).toMatch(/ajuste de inventário realizado/i);
    });

    it('deve recusar ajuste negativo maior que o saldo disponível', async () => {
      const mockConn = db._mockConnection;
      mockConn.query.mockResolvedValueOnce([[
        { id_lote: 1, codigo_lote: 'LOTE-1', quantidade: 3, fk_produto: 1 }
      ]]);

      const res = await request(app)
        .post('/api/movimentacoes/ajuste')
        .set(headerOperador())
        .send({
          fk_lote: 1,
          quantidade_ajuste: -10,
          justificativa: 'Correção de inventário'
        });

      expect(res.status).toBe(400);
      expect(res.body.mensagem).toMatch(/saldo insuficiente/i);
      expect(mockConn.query).toHaveBeenCalledTimes(1);
    });

    it('deve registrar somente a diferença exata no ajuste negativo', async () => {
      const mockConn = db._mockConnection;
      mockConn.query
        .mockResolvedValueOnce([[
          { id_lote: 1, codigo_lote: 'LOTE-1', quantidade: 10, fk_produto: 1 }
        ]])
        .mockResolvedValueOnce([{ affectedRows: 1 }]) // Update lote
        .mockResolvedValueOnce([[{ total: 3 }]]) // Recalculo produto
        .mockResolvedValueOnce([{ affectedRows: 1 }]) // Update produto
        .mockResolvedValueOnce([{ insertId: 13 }]); // Insert movimentacao

      const res = await request(app)
        .post('/api/movimentacoes/ajuste')
        .set(headerOperador())
        .send({
          fk_lote: 1,
          quantidade_ajuste: -7,
          justificativa: 'Inventário físico encontrou três unidades'
        });

      expect(res.status).toBe(200);
      expect(res.body.movimentacao).toMatchObject({
        tipo_movimento: 'AJUSTE_NEGATIVO',
        quantidade: 7
      });
      expect(mockConn.query.mock.calls[1][1]).toEqual([3, 1]);
      expect(mockConn.query.mock.calls[4][1]).toEqual([
        1,
        expect.any(Number),
        'AJUSTE_NEGATIVO',
        7,
        'Inventário físico encontrou três unidades'
      ]);
    });

    it('deve recusar movimentação em lote inativo (POST /api/movimentacoes)', async () => {
      const mockConn = db._mockConnection;
      mockConn.query.mockResolvedValueOnce([[{ id_lote: 1, codigo_lote: 'LOTE-1', quantidade: 100, fk_produto: 1, ativo: 0, produto_ativo: 1 }]]);

      const payload = {
        fk_lote: 1,
        fk_usuario: 2,
        tipo_movimento: 'ENTRADA',
        quantidade: 10
      };

      const res = await request(app)
        .post('/api/movimentacoes')
        .set(headerOperador())
        .send(payload);

      expect(res.status).toBe(400);
      expect(res.body.mensagem).toMatch(/Lote inativo, não é possível movimentar/i);
    });

    it('deve recusar movimentação quando o produto estiver inativo (POST /api/movimentacoes)', async () => {
      const mockConn = db._mockConnection;
      mockConn.query.mockResolvedValueOnce([[{ id_lote: 1, codigo_lote: 'LOTE-1', quantidade: 100, fk_produto: 1, ativo: 1, produto_ativo: 0 }]]);

      const payload = {
        fk_lote: 1,
        fk_usuario: 2,
        tipo_movimento: 'ENTRADA',
        quantidade: 10
      };

      const res = await request(app)
        .post('/api/movimentacoes')
        .set(headerOperador())
        .send(payload);

      expect(res.status).toBe(400);
      expect(res.body.mensagem).toMatch(/Produto inativo, não é possível movimentar/i);
    });
  });
});

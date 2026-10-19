const request = require('supertest');
const app = require('../app');
const loteRepository = require('../repositories/loteRepository');
const movimentacaoRepository = require('../repositories/movimentacaoRepository');
const db = require('../config/database');
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
      jest.spyOn(loteRepository, 'salvar').mockResolvedValue({ insertId: 5 });
      db.query
        .mockResolvedValueOnce([[{ total: 150 }]]) // Recálculo da soma
        .mockResolvedValueOnce([{ affectedRows: 1 }]); // Update do produto

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
  });
});

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

      const res = await request(app).get('/api/lotes');

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

      const res = await request(app).get('/api/lotes/1');

      expect(res.status).toBe(200);
      expect(res.body.id_lote).toBe(1);
    });

    it('deve retornar 404 para lote inexistente (GET /api/lotes/:id)', async () => {
      jest.spyOn(loteRepository, 'buscarPorId').mockResolvedValue(null);

      const res = await request(app).get('/api/lotes/999');

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
        .send(novoLote);

      expect(res.status).toBe(201);
      expect(res.body).toHaveProperty('id_lote', 5);
      expect(res.body.codigo_lote).toBe('LOTE-2026-B');
    });

    it('deve rejeitar cadastro de lote sem localização física (POST /api/lotes)', async () => {
      const res = await request(app)
        .post('/api/lotes')
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

      const res = await request(app).delete('/api/lotes/1');

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
      expect(res.body.length).toBe(1);
    });

    it('deve registrar movimentação de ENTRADA com sucesso (POST /api/movimentacoes)', async () => {
      const mockConn = db._mockConnection;
      mockConn.query
        .mockResolvedValueOnce([[{ id_lote: 1, codigo_lote: 'LOTE-01', quantidade: 20, fk_produto: 1 }]]) // SELECT FOR UPDATE
        .mockResolvedValueOnce([{ affectedRows: 1 }]) // UPDATE Lote_Produto
        .mockResolvedValueOnce([[{ total: 30 }]]) // SUM Lote_Produto
        .mockResolvedValueOnce([{ affectedRows: 1 }]) // UPDATE Produto
        .mockResolvedValueOnce([{ insertId: 10 }]); // INSERT Movimentacao

      const res = await request(app)
        .post('/api/movimentacoes')
        .set(headerOperador())
        .send({
          fk_lote: 1,
          tipo_movimento: 'ENTRADA',
          quantidade: 10
        });

      expect(res.status).toBe(201);
      expect(res.body).toHaveProperty('id_movimentacao', 10);
      expect(res.body.tipo_movimento).toBe('ENTRADA');
    });

    it('deve recusar SAIDA quando saldo for insuficiente no lote (POST /api/movimentacoes)', async () => {
      const mockConn = db._mockConnection;
      mockConn.query.mockResolvedValueOnce([
        [{ id_lote: 1, codigo_lote: 'LOTE-01', quantidade: 5, fk_produto: 1 }]
      ]);

      const res = await request(app)
        .post('/api/movimentacoes')
        .set(headerOperador())
        .send({
          fk_lote: 1,
          tipo_movimento: 'SAIDA',
          quantidade: 50,
          motivo_saida: 'Ordem de Produção #10'
        });

      expect(res.status).toBe(400);
      expect(res.body.mensagem).toMatch(/saldo insuficiente/i);
    });

    it('deve registrar SAIDA com saldo suficiente e justificativa (POST /api/movimentacoes)', async () => {
      const mockConn = db._mockConnection;
      mockConn.query
        .mockResolvedValueOnce([[{ id_lote: 1, codigo_lote: 'LOTE-01', quantidade: 50, fk_produto: 1 }]])
        .mockResolvedValueOnce([{ affectedRows: 1 }])
        .mockResolvedValueOnce([[{ total: 40 }]])
        .mockResolvedValueOnce([{ affectedRows: 1 }])
        .mockResolvedValueOnce([{ insertId: 11 }]);

      const res = await request(app)
        .post('/api/movimentacoes')
        .set(headerOperador())
        .send({
          fk_lote: 1,
          tipo_movimento: 'SAIDA',
          quantidade: 10,
          motivo_saida: 'Uso na produção'
        });

      expect(res.status).toBe(201);
      expect(res.body).toHaveProperty('id_movimentacao', 11);
    });

    it('deve realizar ajuste de inventário com sucesso (POST /api/movimentacoes/ajuste)', async () => {
      const mockConn = db._mockConnection;
      mockConn.query
        .mockResolvedValueOnce([[{ id_lote: 1, codigo_lote: 'LOTE-01', quantidade: 40, fk_produto: 1 }]])
        .mockResolvedValueOnce([{ affectedRows: 1 }])
        .mockResolvedValueOnce([[{ total: 45 }]])
        .mockResolvedValueOnce([{ affectedRows: 1 }])
        .mockResolvedValueOnce([{ insertId: 12 }]);

      const res = await request(app)
        .post('/api/movimentacoes/ajuste')
        .set(headerGerente())
        .send({
          fk_lote: 1,
          quantidade_ajuste: 5,
          motivo: 'Contagem física trimestral'
        });

      expect(res.status).toBe(201);
      expect(res.body.mensagem).toMatch(/ajuste de inventário/i);
      expect(res.body.movimentacao).toHaveProperty('id_movimentacao', 12);
    });
  });
});

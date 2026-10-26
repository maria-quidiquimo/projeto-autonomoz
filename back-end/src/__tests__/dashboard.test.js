jest.mock('../config/database');

const request = require('supertest');
const app = require('../app');
const db = require('../config/database');
const { headerOperador } = require('./helpers/authHelper');

describe('Dashboard API', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('retorna os indicadores e listas esperados pelo painel', async () => {
    db.query
      .mockResolvedValueOnce([[{ total_itens: '120', total_skus: 5 }]])
      .mockResolvedValueOnce([[{ total_alertas_ativos: 2, alertas_criticos: 1 }]])
      .mockResolvedValueOnce([[{ total_ordens: 3, ordens_em_andamento: 2 }]])
      .mockResolvedValueOnce([[{ total_movimentacoes: 8, movimentacoes_hoje: 4 }]])
      .mockResolvedValueOnce([[{ total_faturado: '45000.00' }]])
      .mockResolvedValueOnce([[{ id_movimentacao: 10, quantidade: 5 }]])
      .mockResolvedValueOnce([[{ id_alerta: 4, tipo_alerta: 'ESTOQUE_MINIMO' }]]);

    const response = await request(app)
      .get('/api/dashboard')
      .set(headerOperador());

    expect(response.status).toBe(200);
    expect(response.body.kpis).toEqual({
      total_itens: 120,
      total_skus: 5,
      alertas_ativos: 2,
      alertas_criticos: 1,
      ordens_em_andamento: 2,
      total_ordens: 3,
      total_movimentacoes: 8,
      movimentacoes_hoje: 4,
      total_faturado: 45000
    });
    expect(response.body.movimentacoes_recentes).toHaveLength(1);
    expect(response.body.alertas_recentes).toHaveLength(1);
  });
});

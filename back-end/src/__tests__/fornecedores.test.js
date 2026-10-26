jest.mock('../config/database');

const request = require('supertest');
const app = require('../app');
const db = require('../config/database');
const { headerGerente, headerOperador } = require('./helpers/authHelper');

describe('Fornecedores API', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('includes inactive suppliers when requested for the homologation table', async () => {
    const suppliers = [
      { id_fornecedor: 1, razao_social: 'Ativo', ativo: 1 },
      { id_fornecedor: 2, razao_social: 'Inativo', ativo: 0 }
    ];
    db.query.mockResolvedValueOnce([suppliers]);

    const response = await request(app)
      .get('/api/fornecedores?incluir_inativos=true')
      .set(headerOperador());

    expect(response.status).toBe(200);
    expect(response.body).toEqual(suppliers);
    expect(db.query.mock.calls[0][0]).not.toContain('ativo = TRUE');
  });

  it('allows editing an inactive supplier so it can be reactivated', async () => {
    db.query
      .mockResolvedValueOnce([[{ id_fornecedor: 2, ativo: 0 }]])
      .mockResolvedValueOnce([{ affectedRows: 1 }]);

    const response = await request(app)
      .put('/api/fornecedores/2')
      .set(headerGerente())
      .send({ razao_social: 'Reativado', contato_email: '', contato_telefone: '', ativo: 1 });

    expect(response.status).toBe(200);
    expect(db.query.mock.calls[0][0]).not.toContain('ativo = TRUE');
    expect(db.query.mock.calls[1][1]).toEqual(['Reativado', '', '', 1, '2']);
  });
});

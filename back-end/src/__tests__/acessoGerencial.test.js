const request = require('supertest');
const app = require('../app');
const usuarioService = require('../services/usuarioService');
const { headerGerente, headerOperador } = require('./helpers/authHelper');

jest.mock('../config/database');

describe('Acesso de gerente a dados e logs restritos', () => {
  it('rejeita funcionário na consulta de logs do sistema', async () => {
    const response = await request(app)
      .get('/api/logs_sistema')
      .set(headerOperador());

    expect(response.status).toBe(403);
  });

  it('rejeita funcionário nos dados pessoais do gerenciamento de usuários', async () => {
    const response = await request(app)
      .get('/api/usuarios/gerenciamento')
      .set(headerOperador());

    expect(response.status).toBe(403);
  });

  it('retorna os dados de gerenciamento apenas ao gerente', async () => {
    jest.spyOn(usuarioService, 'listarTodosGerenciamento').mockResolvedValue([
      { id_usuario: 1, cpf: '529.982.247-25', data_nascimento: '2000-01-01' },
    ]);

    const response = await request(app)
      .get('/api/usuarios/gerenciamento')
      .set(headerGerente());

    expect(response.status).toBe(200);
    expect(response.body[0].cpf).toBe('529.982.247-25');
  });

  describe('Imutabilidade da rota de logs (/api/logs_sistema)', () => {
    it('permite que gerente consulte os logs do sistema (GET)', async () => {
      const db = require('../config/database');
      db.query.mockResolvedValueOnce([[{ total: 1 }]]).mockResolvedValueOnce([[{ id_log: 1, tipo_evento: 'LOGIN' }]]);

      const response = await request(app)
        .get('/api/logs_sistema')
        .set(headerGerente());

      expect(response.status).toBe(200);
      expect(response.body.dados).toBeDefined();
    });

    it('não permite criação de logs via API externa (POST)', async () => {
      const response = await request(app)
        .post('/api/logs_sistema')
        .set(headerGerente())
        .send({ tipo_evento: 'TESTE', mensagem: 'Log falso' });

      expect(response.status).toBe(404);
    });

    it('não permite alteração de logs existentes via API (PUT)', async () => {
      const response = await request(app)
        .put('/api/logs_sistema/1')
        .set(headerGerente())
        .send({ mensagem: 'Mensagem alterada' });

      expect(response.status).toBe(404);
    });

    it('não permite exclusão de logs via API (DELETE)', async () => {
      const response = await request(app)
        .delete('/api/logs_sistema/1')
        .set(headerGerente());

      expect(response.status).toBe(404);
    });
  });
});

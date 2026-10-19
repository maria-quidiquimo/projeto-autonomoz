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
});

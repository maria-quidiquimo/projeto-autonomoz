const request = require('supertest');
const bcrypt = require('bcrypt');
const app = require('../app');
const usuarioRepository = require('../repositories/usuarioRepository');
const cargoRepository = require('../repositories/cargoRepository');
const { headerGerente, headerOperador, tokenInvalido } = require('./helpers/authHelper');

jest.mock('../config/database');
jest.mock('../services/logAuditoriaHelper', () => ({
  registrarLog: jest.fn().mockResolvedValue()
}));

describe('Módulo: Usuários e Controle de Permissão', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('POST /api/usuarios/login (Autenticação)', () => {
    it('deve realizar login com sucesso e retornar token JWT para credenciais válidas', async () => {
      const hashSenha = await bcrypt.hash('senha123', 10);
      jest.spyOn(usuarioRepository, 'buscarPorMatricula').mockResolvedValue({
        id_usuario: 1,
        nome: 'Lucas Gerente',
        matricula: 'GER001',
        senha: hashSenha,
        tipo_acesso: 'GERENTE'
      });

      const res = await request(app)
        .post('/api/usuarios/login')
        .send({ matricula: 'GER001', senha: 'senha123' });

      expect(res.status).toBe(200);
      expect(res.body).toHaveProperty('token');
      expect(res.body.usuario).toHaveProperty('matricula', 'GER001');
      expect(res.body.usuario).not.toHaveProperty('senha');
    });

    it('deve retornar 401 ao tentar login com senha incorreta', async () => {
      const hashSenha = await bcrypt.hash('senhaCorreta', 10);
      jest.spyOn(usuarioRepository, 'buscarPorMatricula').mockResolvedValue({
        id_usuario: 1,
        matricula: 'GER001',
        senha: hashSenha,
        tipo_acesso: 'GERENTE'
      });

      const res = await request(app)
        .post('/api/usuarios/login')
        .send({ matricula: 'GER001', senha: 'senhaErrada' });

      expect(res.status).toBe(401);
      expect(res.body).toHaveProperty('error');
    });

    it('deve retornar 401 para usuário não existente', async () => {
      jest.spyOn(usuarioRepository, 'buscarPorMatricula').mockResolvedValue(null);

      const res = await request(app)
        .post('/api/usuarios/login')
        .send({ matricula: 'INEXISTENTE', senha: '123' });

      expect(res.status).toBe(401);
    });

    it('deve retornar 401 quando matrícula ou senha não forem fornecidas', async () => {
      const res = await request(app)
        .post('/api/usuarios/login')
        .send({});

      expect(res.status).toBe(401);
    });
  });

  describe('Middleware de Autenticação e Permissão', () => {
    it('deve retornar 401 ao acessar rota protegida sem token', async () => {
      const res = await request(app).get('/api/usuarios');
      expect(res.status).toBe(401);
      expect(res.body.mensagem).toMatch(/não fornecido/i);
    });

    it('deve retornar 403 ao acessar rota protegida com token inválido', async () => {
      const res = await request(app)
        .get('/api/usuarios')
        .set('Authorization', `Bearer ${tokenInvalido}`);

      expect(res.status).toBe(403);
      expect(res.body.mensagem).toMatch(/inválido ou expirado/i);
    });

    it('deve retornar 403 ao tentar cadastrar usuário com perfil sem permissão (OPERADOR)', async () => {
      const res = await request(app)
        .post('/api/usuarios')
        .set(headerOperador())
        .send({
          nome: 'Teste',
          matricula: 'TEST01',
          senha: '123'
        });

      expect(res.status).toBe(403);
      expect(res.body.mensagem).toMatch(/apenas gerentes/i);
    });
  });

  describe('CRUD de Usuários (com permissão de GERENTE)', () => {
    it('deve listar usuários com token válido', async () => {
      jest.spyOn(usuarioRepository, 'listarTodos').mockResolvedValue([
        { id_usuario: 1, nome: 'Lucas', matricula: 'GER001' }
      ]);

      const res = await request(app)
        .get('/api/usuarios')
        .set(headerOperador());

      expect(res.status).toBe(200);
      expect(Array.isArray(res.body)).toBe(true);
      expect(res.body.length).toBe(1);
    });

    it('deve buscar usuário por ID existente', async () => {
      jest.spyOn(usuarioRepository, 'buscarPorId').mockResolvedValue({
        id_usuario: 1,
        nome: 'Lucas',
        matricula: 'GER001'
      });

      const res = await request(app)
        .get('/api/usuarios/1')
        .set(headerOperador());

      expect(res.status).toBe(200);
      expect(res.body.id_usuario).toBe(1);
    });

    it('deve retornar 404 ao buscar usuário inexistente', async () => {
      jest.spyOn(usuarioRepository, 'buscarPorId').mockResolvedValue(null);

      const res = await request(app)
        .get('/api/usuarios/999')
        .set(headerOperador());

      expect(res.status).toBe(404);
      expect(res.body.message).toMatch(/não encontrado/i);
    });

    it('deve cadastrar novo usuário com sucesso quando requisitado por GERENTE', async () => {
      jest.spyOn(cargoRepository, 'buscarPorId').mockResolvedValue({ id_cargo: 2, nome_cargo: 'Operador' });
      jest.spyOn(usuarioRepository, 'salvar').mockResolvedValue({ insertId: 10 });

      const res = await request(app)
        .post('/api/usuarios')
        .set(headerGerente())
        .send({
          nome: 'Novo Operador',
          matricula: 'OP005',
          senha: 'senhaSegura123',
          fk_cargo: 2
        });

      expect(res.status).toBe(201);
      expect(res.body).toHaveProperty('insertId', 10);
    });

    it('deve atualizar usuário com sucesso por GERENTE', async () => {
      jest.spyOn(usuarioRepository, 'buscarPorId').mockResolvedValue({ id_usuario: 5, nome: 'Antigo' });
      jest.spyOn(usuarioRepository, 'atualizar').mockResolvedValue(true);

      const res = await request(app)
        .put('/api/usuarios/5')
        .set(headerGerente())
        .send({ nome: 'Nome Atualizado' });

      expect(res.status).toBe(200);
      expect(res.body.message).toMatch(/atualizados com sucesso/i);
    });

    it('deve excluir usuário por GERENTE', async () => {
      jest.spyOn(usuarioRepository, 'buscarPorId').mockResolvedValue({ id_usuario: 5 });
      jest.spyOn(usuarioRepository, 'excluir').mockResolvedValue(true);

      const res = await request(app)
        .delete('/api/usuarios/5')
        .set(headerGerente());

      expect(res.status).toBe(200);
      expect(res.body.message).toMatch(/removido do sistema/i);
    });
  });

  describe('Módulo de Cargos', () => {
    it('deve listar cargos com usuário autenticado', async () => {
      jest.spyOn(cargoRepository, 'listarTodos').mockResolvedValue([
        { id_cargo: 1, nome_cargo: 'Gerente' }
      ]);

      const res = await request(app)
        .get('/api/cargos')
        .set(headerOperador());

      expect(res.status).toBe(200);
      expect(res.body.length).toBe(1);
    });

    it('deve bloquear criação de cargo por OPERADOR (403)', async () => {
      const res = await request(app)
        .post('/api/cargos')
        .set(headerOperador())
        .send({ nome_cargo: 'Novo Cargo' });

      expect(res.status).toBe(403);
    });

    it('deve permitir criação de cargo por GERENTE (201)', async () => {
      jest.spyOn(cargoRepository, 'salvar').mockResolvedValue(3);

      const res = await request(app)
        .post('/api/cargos')
        .set(headerGerente())
        .send({ nome_cargo: 'Supervisor' });

      expect(res.status).toBe(201);
      expect(res.body).toBe(3);
    });
  });
});

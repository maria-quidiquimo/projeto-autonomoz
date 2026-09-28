const request = require('supertest');
const app = require('../app');
const ordemProducaoRepository = require('../repositories/ordemProducaoRepository');
const ordemProducaoFuncionarioRepository = require('../repositories/ordemProducaoFuncionarioRepository');
const ordemProducaoMateriaisRepository = require('../repositories/ordemProducaoMateriaisRepository');
const { headerOperador } = require('./helpers/authHelper');

jest.mock('../config/database');

describe('Módulo: Ordem de Produção e Equipes', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('Rotas de Ordem de Produção (/api/ordem_producao)', () => {
    it('deve listar todas as ordens de produção (GET /api/ordem_producao)', async () => {
      const mockOrdens = [
        { id_ordem_producao: 1, nome_projeto: 'Lote Especial A', status_ordem: 'EM_ANDAMENTO' }
      ];
      jest.spyOn(ordemProducaoRepository, 'listarTodos').mockResolvedValue(mockOrdens);

      const res = await request(app).get('/api/ordem_producao').set(headerOperador());

      expect(res.status).toBe(200);
      expect(Array.isArray(res.body)).toBe(true);
      expect(res.body[0].nome_projeto).toBe('Lote Especial A');
    });

    it('deve buscar ordem de produção por ID existente (GET /api/ordem_producao/:id)', async () => {
      jest.spyOn(ordemProducaoRepository, 'buscarPorId').mockResolvedValue({
        id_ordem_producao: 1,
        nome_projeto: 'Lote Especial A',
        status_ordem: 'PLANEJADA'
      });

      const res = await request(app).get('/api/ordem_producao/1').set(headerOperador());

      expect(res.status).toBe(200);
      expect(res.body.id_ordem_producao).toBe(1);
    });

    it('deve retornar 404 para ordem inexistente (GET /api/ordem_producao/:id)', async () => {
      jest.spyOn(ordemProducaoRepository, 'buscarPorId').mockResolvedValue(null);

      const res = await request(app).get('/api/ordem_producao/999').set(headerOperador());

      expect(res.status).toBe(404);
      expect(res.body.mensagem).toMatch(/não encontrada/i);
    });

    it('deve cadastrar nova ordem de produção (POST /api/ordem_producao)', async () => {
      jest.spyOn(ordemProducaoRepository, 'salvar').mockResolvedValue({ insertId: 7 });

      const novaOrdem = {
        nome_projeto: 'Produção Chapa Acrílica',
        descricao: 'Produção sob medida',
        fk_usuario_responsavel: 1,
        data_previsao_entrega: '2026-10-15',
        status_ordem: 'PLANEJADA'
      };

      const res = await request(app)
        .post('/api/ordem_producao')
        .set(headerOperador())
        .send(novaOrdem);

      expect(res.status).toBe(201);
      expect(res.body).toHaveProperty('id_ordem_producao', 7);
      expect(res.body.nome_projeto).toBe('Produção Chapa Acrílica');
    });

    it('deve retornar 400 ao cadastrar ordem sem nome do projeto', async () => {
      const res = await request(app)
        .post('/api/ordem_producao')
        .set(headerOperador())
        .send({ descricao: 'Sem nome' });

      expect(res.status).toBe(400);
      expect(res.body.mensagem).toMatch(/nome do projeto é obrigatório/i);
    });

    it('deve atualizar status de ordem de produção (PUT /api/ordem_producao/:id)', async () => {
      jest.spyOn(ordemProducaoRepository, 'buscarPorId').mockResolvedValue({ id_ordem_producao: 1 });
      jest.spyOn(ordemProducaoRepository, 'atualizar').mockResolvedValue({ affectedRows: 1 });

      const res = await request(app)
        .put('/api/ordem_producao/1')
        .set(headerOperador())
        .send({ status_ordem: 'CONCLUIDA' });

      expect(res.status).toBe(200);
      expect(res.body.mensagem).toMatch(/atualizada/i);
    });

    it('deve remover ordem de produção (DELETE /api/ordem_producao/:id)', async () => {
      jest.spyOn(ordemProducaoRepository, 'buscarPorId').mockResolvedValue({ id_ordem_producao: 1 });
      jest.spyOn(ordemProducaoRepository, 'excluir').mockResolvedValue({ affectedRows: 1 });

      const res = await request(app).delete('/api/ordem_producao/1').set(headerOperador());

      expect(res.status).toBe(200);
      expect(res.body.mensagem).toMatch(/removida/i);
    });
  });

  describe('Alocação de Funcionários/Equipes (/api/ordem_producao_funcionario)', () => {
    it('deve listar vínculos de funcionários em ordens (GET /api/ordem_producao_funcionario)', async () => {
      jest.spyOn(ordemProducaoFuncionarioRepository, 'listarTodos').mockResolvedValue([
        { id: 1, fk_ordem_producao: 1, fk_usuario: 2, nome_funcionario: 'Operador 1' }
      ]);

      const res = await request(app).get('/api/ordem_producao_funcionario').set(headerOperador());

      expect(res.status).toBe(200);
      expect(res.body.length).toBe(1);
    });

    it('deve alocar funcionário a uma ordem com sucesso (POST /api/ordem_producao_funcionario)', async () => {
      jest.spyOn(ordemProducaoFuncionarioRepository, 'salvar').mockResolvedValue({ insertId: 3 });

      const res = await request(app)
        .post('/api/ordem_producao_funcionario')
        .set(headerOperador())
        .send({
          fk_ordem_producao: 1,
          fk_usuario: 2,
          horas_trabalhadas: 8
        });

      expect(res.status).toBe(201);
      expect(res.body).toHaveProperty('id', 3);
      expect(res.body.fk_ordem_producao).toBe(1);
    });

    it('deve recusar alocação sem funcionário especificado (POST /api/ordem_producao_funcionario)', async () => {
      const res = await request(app)
        .post('/api/ordem_producao_funcionario')
        .set(headerOperador())
        .send({ fk_ordem_producao: 1 });

      expect(res.status).toBe(400);
      expect(res.body.mensagem).toMatch(/funcionário.*é obrigatório/i);
    });

    it('deve desalocar funcionário de ordem (DELETE /api/ordem_producao_funcionario/:id)', async () => {
      jest.spyOn(ordemProducaoFuncionarioRepository, 'buscarPorId').mockResolvedValue({ id: 3 });
      jest.spyOn(ordemProducaoFuncionarioRepository, 'excluir').mockResolvedValue({ affectedRows: 1 });

      const res = await request(app).delete('/api/ordem_producao_funcionario/3').set(headerOperador());

      expect(res.status).toBe(200);
      expect(res.body.mensagem).toMatch(/removido/i);
    });
  });

  describe('Materiais e Insumos da Ordem (/api/ordem_producao_materiais)', () => {
    it('deve listar materiais vinculados a ordens (GET /api/ordem_producao_materiais)', async () => {
      jest.spyOn(ordemProducaoMateriaisRepository, 'listarTodos').mockResolvedValue([
        { id: 1, fk_ordem_producao: 1, fk_produto: 2, quantidade_utilizada: 10 }
      ]);

      const res = await request(app).get('/api/ordem_producao_materiais').set(headerOperador());

      expect(res.status).toBe(200);
      expect(res.body.length).toBe(1);
    });

    it('deve vincular material à ordem de produção (POST /api/ordem_producao_materiais)', async () => {
      jest.spyOn(ordemProducaoMateriaisRepository, 'salvar').mockResolvedValue({ insertId: 5 });

      const res = await request(app)
        .post('/api/ordem_producao_materiais')
        .set(headerOperador())
        .send({
          fk_ordem_producao: 1,
          fk_produto: 2,
          quantidade_utilizada: 15
        });

      expect(res.status).toBe(201);
      expect(res.body).toHaveProperty('id', 5);
      expect(res.body.quantidade_utilizada).toBe(15);
    });

    it('deve remover vínculo de material da ordem (DELETE /api/ordem_producao_materiais/:id)', async () => {
      jest.spyOn(ordemProducaoMateriaisRepository, 'buscarPorId').mockResolvedValue({ id: 5 });
      jest.spyOn(ordemProducaoMateriaisRepository, 'excluir').mockResolvedValue({ affectedRows: 1 });

      const res = await request(app).delete('/api/ordem_producao_materiais/5').set(headerOperador());

      expect(res.status).toBe(200);
      expect(res.body.mensagem).toMatch(/removido/i);
    });
  });
});

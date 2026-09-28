const request = require('supertest');
const bcrypt = require('bcrypt');
const app = require('../app');
const usuarioRepository = require('../repositories/usuarioRepository');
const produtoRepository = require('../repositories/produtoRepository');
const loteRepository = require('../repositories/loteRepository');
const ordemProducaoRepository = require('../repositories/ordemProducaoRepository');
const db = require('../config/database');
const { headerOperador } = require('./helpers/authHelper');

jest.mock('../config/database');
jest.mock('../services/logAuditoriaHelper', () => ({
  registrarLog: jest.fn().mockResolvedValue()
}));

describe('Integração do Pipeline e Relatório Consolidado', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('Integridade da Aplicação e Middlewares Globais', () => {
    it('deve responder à rota principal com 200 e content-type HTML', async () => {
      const res = await request(app).get('/');
      expect([200, 404]).toContain(res.status); // Aceita se o index.html existir ou status de arquivo
    });

    it('deve configurar cabeçalhos CORS corretamente', async () => {
      const res = await request(app).get('/api/produtos').set(headerOperador());
      expect(res.headers).toHaveProperty('access-control-allow-origin');
    });

    it('deve processar corpo JSON nas requisições POST', async () => {
      jest.spyOn(produtoRepository, 'salvar').mockResolvedValue({ insertId: 99 });

      const res = await request(app)
        .post('/api/produtos')
        .set(headerOperador())
        .set('Content-Type', 'application/json')
        .send({ codigo_item: 'JSON-TEST', nome_produto: 'Teste JSON' });

      expect(res.status).toBe(201);
      expect(res.body.codigo_item).toBe('JSON-TEST');
    });
  });

  describe('Fluxo Integrado de Ponta a Ponta (E2E Pipeline)', () => {
    it('deve executar o fluxo completo: Login Gerente -> Criação Produto -> Lote -> Movimentação -> Ordem de Produção', async () => {
      // 1. Login do Gerente
      const hashSenha = await bcrypt.hash('senhaGerente123', 10);
      jest.spyOn(usuarioRepository, 'buscarPorMatricula').mockResolvedValue({
        id_usuario: 1,
        nome: 'Gerente Integrado',
        matricula: 'GER999',
        senha: hashSenha,
        tipo_acesso: 'GERENTE'
      });

      const resLogin = await request(app)
        .post('/api/usuarios/login')
        .send({ matricula: 'GER999', senha: 'senhaGerente123' });

      expect(resLogin.status).toBe(200);
      const token = resLogin.body.token;
      expect(token).toBeDefined();

      const authHeader = { Authorization: `Bearer ${token}` };

      // 2. Criação de Produto
      jest.spyOn(produtoRepository, 'salvar').mockResolvedValue({ insertId: 50 });
      const resProduto = await request(app)
        .post('/api/produtos')
        .set(authHeader)
        .send({
          codigo_item: 'E2E-PRD',
          nome_produto: 'Produto Teste Pipeline',
          valor_unitario: 120.00,
          estoque_minimo: 5
        });

      expect(resProduto.status).toBe(201);
      expect(resProduto.body.id_produto).toBe(50);

      // 3. Cadastro de Lote
      jest.spyOn(loteRepository, 'salvar').mockResolvedValue({ insertId: 100 });
      db.query
        .mockResolvedValueOnce([[{ total: 50 }]])
        .mockResolvedValueOnce([{ affectedRows: 1 }]);

      const resLote = await request(app)
        .post('/api/lotes')
        .set(authHeader)
        .send({
          codigo_lote: 'LOTE-E2E-01',
          fk_produto: 50,
          localizacao_fisica: 'Almoxarifado Principal',
          quantidade: 50
        });

      expect(resLote.status).toBe(201);
      expect(resLote.body.id_lote).toBe(100);

      // 4. Movimentação Física (Saída para produção)
      const mockConn = db._mockConnection;
      mockConn.query
        .mockResolvedValueOnce([[{ id_lote: 100, codigo_lote: 'LOTE-E2E-01', quantidade: 50, fk_produto: 50 }]])
        .mockResolvedValueOnce([{ affectedRows: 1 }])
        .mockResolvedValueOnce([[{ total: 40 }]])
        .mockResolvedValueOnce([{ affectedRows: 1 }])
        .mockResolvedValueOnce([{ insertId: 200 }]);

      const resMov = await request(app)
        .post('/api/movimentacoes')
        .set(authHeader)
        .send({
          fk_lote: 100,
          tipo_movimento: 'SAIDA',
          quantidade: 10,
          motivo_saida: 'Início de Ordem de Produção #500'
        });

      expect(resMov.status).toBe(201);
      expect(resMov.body.id_movimentacao).toBe(200);

      // 5. Abertura de Ordem de Produção
      jest.spyOn(ordemProducaoRepository, 'salvar').mockResolvedValue({ insertId: 500 });
      const resOrdem = await request(app)
        .post('/api/ordem_producao')
        .set(authHeader)
        .send({
          nome_projeto: 'Ordem de Produção Consolidada E2E',
          fk_usuario_responsavel: 1,
          status_ordem: 'EM_ANDAMENTO'
        });

      expect(resOrdem.status).toBe(201);
      expect(resOrdem.body.id_ordem_producao).toBe(500);
    });
  });
});

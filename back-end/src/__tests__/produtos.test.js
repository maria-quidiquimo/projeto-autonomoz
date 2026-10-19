const request = require('supertest');
const app = require('../app');
const produtoRepository = require('../repositories/produtoRepository');
const categoriaRepository = require('../repositories/categoriaRepository');
const subcategoriaRepository = require('../repositories/subcategoriaRepository');
const localizacaoRepository = require('../repositories/localizacaoRepository');
const { headerOperador } = require('./helpers/authHelper');

jest.mock('../config/database');

describe('Módulo: Produtos, Categorias e Localização', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('Rotas de Produtos (/api/produtos)', () => {
    it('deve listar todos os produtos ativos (GET /api/produtos)', async () => {
      const mockProdutos = [
        { id_produto: 1, codigo_item: 'PRD001', nome_produto: 'Resina Epóxi', estoque_atual: 50, ativo: 1 }
      ];
      jest.spyOn(produtoRepository, 'listarTodos').mockResolvedValue(mockProdutos);

      const res = await request(app).get('/api/produtos').set(headerOperador());

      expect(res.status).toBe(200);
      expect(Array.isArray(res.body)).toBe(true);
      expect(res.body[0].codigo_item).toBe('PRD001');
    });

    it('deve retornar detalhes de um produto existente (GET /api/produtos/:id)', async () => {
      jest.spyOn(produtoRepository, 'buscarPorId').mockResolvedValue({
        id_produto: 1,
        codigo_item: 'PRD001',
        nome_produto: 'Resina Epóxi'
      });

      const res = await request(app).get('/api/produtos/1').set(headerOperador());

      expect(res.status).toBe(200);
      expect(res.body.id_produto).toBe(1);
    });

    it('deve retornar 404 ao buscar produto inexistente (GET /api/produtos/:id)', async () => {
      jest.spyOn(produtoRepository, 'buscarPorId').mockResolvedValue(null);

      const res = await request(app).get('/api/produtos/999').set(headerOperador());

      expect(res.status).toBe(404);
      expect(res.body.mensagem).toMatch(/não encontrado/i);
    });

    it('deve cadastrar um novo produto com sucesso (POST /api/produtos)', async () => {
      jest.spyOn(produtoRepository, 'salvar').mockResolvedValue({ insertId: 10 });

      const novoProduto = {
        codigo_item: 'PRD010',
        nome_produto: 'Endurecedor Rápido',
        descricao: 'Endurecedor para resina',
        fk_subcategoria: 1,
        fk_fornecedor: 1,
        unidade_medida: 'L',
        valor_unitario: 85.50,
        estoque_minimo: 10,
        estoque_atual: 20
      };

      const res = await request(app)
        .post('/api/produtos')
        .set(headerOperador())
        .send(novoProduto);

      expect(res.status).toBe(201);
      expect(res.body).toHaveProperty('id_produto', 10);
      expect(res.body.codigo_item).toBe('PRD010');
    });

    it('deve retornar 400 ao tentar cadastrar produto sem código do item', async () => {
      const res = await request(app)
        .post('/api/produtos')
        .set(headerOperador())
        .send({ nome_produto: 'Produto Sem Código' });

      expect(res.status).toBe(400);
      expect(res.body.mensagem).toMatch(/código do item é obrigatório/i);
    });

    it('deve retornar 400 ao tentar cadastrar produto com estoque mínimo negativo', async () => {
      const res = await request(app)
        .post('/api/produtos')
        .set(headerOperador())
        .send({ codigo_item: 'PRD-NEG', estoque_minimo: -5 });

      expect(res.status).toBe(400);
      expect(res.body.mensagem).toMatch(/estoque mínimo inválido/i);
    });

    it('deve atualizar um produto existente com sucesso (PUT /api/produtos/:id)', async () => {
      jest.spyOn(produtoRepository, 'buscarPorId').mockResolvedValue({ id_produto: 1 });
      jest.spyOn(produtoRepository, 'atualizar').mockResolvedValue({ affectedRows: 1 });

      const res = await request(app)
        .put('/api/produtos/1')
        .set(headerOperador())
        .send({ nome_produto: 'Resina Epóxi Atualizada' });

      expect(res.status).toBe(200);
      expect(res.body.mensagem).toMatch(/atualizado/i);
    });

    it('deve inativar um produto com sucesso (DELETE /api/produtos/:id)', async () => {
      jest.spyOn(produtoRepository, 'buscarPorId').mockResolvedValue({ id_produto: 1 });
      jest.spyOn(produtoRepository, 'excluir').mockResolvedValue({ affectedRows: 1 });

      const res = await request(app).delete('/api/produtos/1').set(headerOperador());

      expect(res.status).toBe(200);
      expect(res.body.mensagem).toMatch(/removido/i);
    });
  });

  describe('Rotas de Categorias e Subcategorias (/api/categorias e /api/subcategoria)', () => {
    it('deve listar categorias com sucesso (GET /api/categorias)', async () => {
      jest.spyOn(categoriaRepository, 'listarTodos').mockResolvedValue([
        { id_categoria: 1, nome_categoria: 'Matérias-Primas' }
      ]);

      const res = await request(app).get('/api/categorias').set(headerOperador());

      expect(res.status).toBe(200);
      expect(res.body.length).toBe(1);
    });

    it('deve cadastrar nova categoria (POST /api/categorias)', async () => {
      jest.spyOn(categoriaRepository, 'salvar').mockResolvedValue({ insertId: 5 });

      const res = await request(app)
        .post('/api/categorias')
        .set(headerOperador())
        .send({ nome_categoria: 'Embalagens', descricao: 'Caixas e fitas' });

      expect(res.status).toBe(201);
      expect(res.body).toHaveProperty('id_categoria', 5);
    });

    it('deve listar subcategorias (GET /api/subcategoria)', async () => {
      jest.spyOn(subcategoriaRepository, 'listarTodos').mockResolvedValue([
        { id_subcategoria: 1, nome_subcategoria: 'Químicos' }
      ]);

      const res = await request(app).get('/api/subcategoria').set(headerOperador());

      expect(res.status).toBe(200);
      expect(res.body.length).toBe(1);
    });
  });

  describe('Rotas de Localização (/api/localizacoes)', () => {
    it('deve listar localizações cadastradas (GET /api/localizacoes)', async () => {
      jest.spyOn(localizacaoRepository, 'listarTodos').mockResolvedValue([
        { id_localizacao: 1, nome_localizacao: 'Setor A - Prateleira 3' }
      ]);

      const res = await request(app).get('/api/localizacoes').set(headerOperador());

      expect(res.status).toBe(200);
      expect(res.body.length).toBe(1);
    });

    it('deve buscar lotes por localização (GET /api/localizacoes/lotes?nome=Setor A)', async () => {
      jest.spyOn(localizacaoRepository, 'listarLotesPorLocalizacao').mockResolvedValue([
        { id_lote: 10, codigo_lote: 'LOTE-2026-01', localizacao_fisica: 'Setor A' }
      ]);

      const res = await request(app).get('/api/localizacoes/lotes?nome=Setor A').set(headerOperador());

      expect(res.status).toBe(200);
      expect(res.body.length).toBe(1);
      expect(res.body[0].codigo_lote).toBe('LOTE-2026-01');
    });
  });
});

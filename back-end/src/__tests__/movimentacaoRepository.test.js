jest.mock('../config/database');

const db = require('../config/database');
const movimentacaoRepository = require('../repositories/movimentacaoRepository');

describe('MovimentacaoRepository', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('returns movement rows with lot, product, and operator names', async () => {
    const row = {
      id_movimentacao: 12,
      codigo_lote: 'LOT-12',
      nome_produto: 'Produto de teste',
      nome_usuario: 'Operador de teste'
    };
    db.query
      .mockResolvedValueOnce([[{ total: 1 }]])
      .mockResolvedValueOnce([[row]]);

    const result = await movimentacaoRepository.listarTodos(1, 10);

    expect(result.dados).toEqual([row]);
    expect(db.query.mock.calls[1][0]).toContain('p.nome_produto');
    expect(db.query.mock.calls[1][0]).toContain('u.nome_completo AS nome_usuario');
    expect(db.query.mock.calls[1][1]).toEqual([10, 0]);
  });
});

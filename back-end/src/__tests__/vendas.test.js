jest.mock('../config/database');

const db = require('../config/database');
const vendasRepository = require('../repositories/vendasRepository');

describe('Repositório de vendas', () => {
    beforeEach(() => {
        jest.clearAllMocks();
    });

    it('converte data de entrega vazia em NULL ao atualizar uma venda', async () => {
        db.query.mockResolvedValueOnce([{ affectedRows: 1 }]);

        await vendasRepository.atualizar(1, {
            valor_venda: 44999.99,
            data_entrega_final: '',
            status_venda: 'PENDENTE',
            observacoes: ''
        });

        expect(db.query.mock.calls[0][1]).toEqual([
            44999.99,
            null,
            'PENDENTE',
            null,
            1
        ]);
    });
});

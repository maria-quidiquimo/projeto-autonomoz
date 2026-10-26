jest.mock('../config/database');

const db = require('../config/database');
const loteRepository = require('../repositories/loteRepository');
const ordemProducaoRepository = require('../repositories/ordemProducaoRepository');
const ordemProducaoFuncionarioRepository = require('../repositories/ordemProducaoFuncionarioRepository');

describe('Normalização de datas antes de gravar no banco', () => {
    beforeEach(() => {
        jest.clearAllMocks();
        db.query.mockResolvedValue([{ affectedRows: 1 }]);
    });

    it('converte data de validade vazia em NULL ao atualizar lote', async () => {
        await loteRepository.atualizar(3, { data_validade: '' });

        expect(db.query.mock.calls[0][1]).toEqual([null, 3]);
    });

    it('converte previsão de entrega vazia em NULL ao atualizar ordem', async () => {
        await ordemProducaoRepository.atualizar(4, {
            nome_projeto: 'Projeto',
            descricao: '',
            fk_usuario_responsavel: null,
            data_previsao_entrega: '',
            status_ordem: 'EM_ANDAMENTO'
        });

        expect(db.query.mock.calls[0][1]).toEqual([
            'Projeto',
            '',
            null,
            null,
            'EM_ANDAMENTO',
            4
        ]);
    });

    it('usa a data atual quando a data de alocação vier vazia', async () => {
        await ordemProducaoFuncionarioRepository.atualizar(4, {
            fk_usuario: 2,
            data_alocacao: ''
        });

        expect(db.query.mock.calls[0][1][0]).toBe(2);
        expect(db.query.mock.calls[0][1][1]).toBeInstanceOf(Date);
        expect(db.query.mock.calls[0][1][2]).toBe(4);
    });
});

jest.mock('../config/database');

const database = require('../config/database');
const alertasEstoqueRepository = require('../repositories/alertasEstoqueRepository');
const alertasEstoqueService = require('../services/alertasEstoqueService');

describe('Geração de alertas de validade', () => {
    let connection;

    beforeEach(() => {
        jest.clearAllMocks();
        connection = {
            beginTransaction: jest.fn().mockResolvedValue(undefined),
            query: jest.fn().mockResolvedValue([[]]),
            commit: jest.fn().mockResolvedValue(undefined),
            rollback: jest.fn().mockResolvedValue(undefined),
            release: jest.fn()
        };
        database.getConnection.mockResolvedValue(connection);
    });

    it('gera alertas de lotes ativos sem duplicar alertas ainda abertos', async () => {
        await alertasEstoqueRepository.gerarAlertasValidade();

        expect(connection.beginTransaction).toHaveBeenCalledTimes(1);
        expect(connection.query).toHaveBeenCalledTimes(4);
        expect(connection.query.mock.calls[0][0]).toContain('FOR UPDATE');
        expect(connection.query.mock.calls[0][0]).toContain('data_validade <= DATE_ADD(CURRENT_DATE, INTERVAL 7 DAY)');
        expect(connection.query.mock.calls[1][0]).toContain("alerta.tipo_alerta = 'VALIDADE_PROXIMA'");
        expect(connection.query.mock.calls[2][0]).toContain("'VALIDADE_VENCIDA'");
        expect(connection.query.mock.calls[2][0]).toContain('alerta.resolvido = FALSE');
        expect(connection.query.mock.calls[3][0]).toContain("'VALIDADE_PROXIMA'");
        expect(connection.query.mock.calls[3][0]).toContain('lote.ativo = TRUE');
        expect(connection.commit).toHaveBeenCalledTimes(1);
        expect(connection.rollback).not.toHaveBeenCalled();
        expect(connection.release).toHaveBeenCalledTimes(1);
    });

    it('reverte a transação e propaga erros de banco', async () => {
        const databaseError = new Error('database unavailable');
        connection.query.mockResolvedValueOnce([[]]).mockRejectedValueOnce(databaseError);

        await expect(alertasEstoqueRepository.gerarAlertasValidade()).rejects.toBe(databaseError);

        expect(connection.rollback).toHaveBeenCalledTimes(1);
        expect(connection.commit).not.toHaveBeenCalled();
        expect(connection.release).toHaveBeenCalledTimes(1);
    });

    it('atualiza alertas de validade antes de listar os alertas', async () => {
        const gerarAlertas = jest.spyOn(alertasEstoqueRepository, 'gerarAlertasValidade').mockResolvedValue();
        const listarAlertas = jest.spyOn(alertasEstoqueRepository, 'listarTodos').mockResolvedValue([]);

        await expect(alertasEstoqueService.listarTodos()).resolves.toEqual([]);

        expect(gerarAlertas).toHaveBeenCalledTimes(1);
        expect(listarAlertas).toHaveBeenCalledTimes(1);
        expect(gerarAlertas.mock.invocationCallOrder[0]).toBeLessThan(listarAlertas.mock.invocationCallOrder[0]);
    });
});

const mockConnection = {
  query: jest.fn().mockResolvedValue([[]]),
  beginTransaction: jest.fn().mockResolvedValue(),
  commit: jest.fn().mockResolvedValue(),
  rollback: jest.fn().mockResolvedValue(),
  release: jest.fn()
};

const mockPool = {
  query: jest.fn().mockResolvedValue([[]]),
  execute: jest.fn().mockImplementation(async (_sql, [id_usuario]) => [[{
    id_usuario,
    matricula: id_usuario === 1 ? 'GER001' : 'OP001',
    tipo_acesso: id_usuario === 1 ? 'GERENTE' : 'FUNCIONARIO'
  }], []]),
  getConnection: jest.fn().mockResolvedValue(mockConnection),
  _mockConnection: mockConnection
};

module.exports = mockPool;

const mockConnection = {
  query: jest.fn().mockResolvedValue([[]]),
  beginTransaction: jest.fn().mockResolvedValue(),
  commit: jest.fn().mockResolvedValue(),
  rollback: jest.fn().mockResolvedValue(),
  release: jest.fn()
};

const mockPool = {
  query: jest.fn().mockResolvedValue([[]]),
  execute: jest.fn().mockResolvedValue([[]]),
  getConnection: jest.fn().mockResolvedValue(mockConnection),
  _mockConnection: mockConnection
};

module.exports = mockPool;

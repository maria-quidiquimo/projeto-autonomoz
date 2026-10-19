const jwt = require('jsonwebtoken');
const { JWT_SECRET } = require('../../middlewares/auth');

function gerarToken(payload) {
  return jwt.sign(payload, JWT_SECRET, { expiresIn: '1h' });
}

function tokenGerente(custom = {}) {
  return gerarToken({
    id_usuario: 1,
    matricula: 'GER001',
    tipo_acesso: 'GERENTE',
    ...custom
  });
}

function tokenOperador(custom = {}) {
  return gerarToken({
    id_usuario: 2,
    matricula: 'OP001',
    tipo_acesso: 'OPERADOR',
    ...custom
  });
}

function headerGerente(custom = {}) {
  return { Authorization: `Bearer ${tokenGerente(custom)}` };
}

function headerOperador(custom = {}) {
  return { Authorization: `Bearer ${tokenOperador(custom)}` };
}

module.exports = {
  gerarToken,
  tokenGerente,
  tokenOperador,
  headerGerente,
  headerOperador,
  tokenInvalido: 'token.invalido.123'
};

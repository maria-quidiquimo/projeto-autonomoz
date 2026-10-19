const jwt = require('jsonwebtoken');

const JWT_SECRET = process.env.JWT_SECRET || 'autonomoz_secret_key_2026';

// Middleware que verifica se o token JWT é válido e injeta req.usuario
function autenticar(req, res, next) {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1]; // Bearer <token>

    if (!token) {
        return res.status(401).json({ mensagem: 'Token de autenticação não fornecido.' });
    }

    try {
        const decoded = jwt.verify(token, JWT_SECRET);
        req.usuario = decoded; // { id_usuario, matricula, tipo_acesso }
        next();
    } catch (err) {
        return res.status(403).json({ mensagem: 'Token inválido ou expirado.' });
    }
}

// Middleware que verifica se o usuário autenticado é GERENTE (RN-01)
function apenasGerente(req, res, next) {
    if (!req.usuario || req.usuario.tipo_acesso !== 'GERENTE') {
        return res.status(403).json({ mensagem: 'Acesso negado: apenas gerentes podem realizar esta operação.' });
    }
    next();
}

module.exports = { autenticar, apenasGerente, JWT_SECRET };

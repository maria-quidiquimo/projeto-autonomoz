const jwt = require('jsonwebtoken');
const usuarioRepository = require('../repositories/usuarioRepository');
// comentario meramente ilustrativo para fazer commit denovo pq errei dnovo
const JWT_SECRET = process.env.JWT_SECRET || 'autonomoz_secret_key_2026';

// Middleware que verifica se o token JWT é válido e injeta req.usuario
async function autenticar(req, res, next) {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1]; // Bearer <token>

    if (!token) {
        return res.status(401).json({ mensagem: 'Token de autenticação não fornecido.' });
    }

    let decoded;
    try {
        decoded = jwt.verify(token, JWT_SECRET);
    } catch (err) {
        return res.status(403).json({ mensagem: 'Token inválido ou expirado.' });
    }

    if (!decoded.id_usuario) {
        return res.status(403).json({ mensagem: 'Token inválido ou expirado.' });
    }

    try {
        const usuario = await usuarioRepository.buscarEstadoAutenticacao(decoded.id_usuario);

        if (!usuario) {
            return res.status(401).json({ mensagem: 'Conta desativada ou usuário não encontrado.' });
        }

        req.usuario = usuario;
        return next();
    } catch (err) {
        console.error('[Auth.autenticar] Erro ao validar usuário:', err);
        return res.status(500).json({ mensagem: 'Erro interno ao validar autenticação.' });
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

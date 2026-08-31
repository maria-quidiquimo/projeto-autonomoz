const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const usuarioRepository = require('../repositories/usuarioRepository');
const { registrarLog } = require('./logAuditoriaHelper');
const { JWT_SECRET } = require('../middlewares/auth');

class AuthService {
    async login(matricula, senha) {
        if (!matricula || !senha) {
            throw new Error('Matrícula e senha são obrigatórias.');
        }

        const usuario = await usuarioRepository.buscarPorMatricula(matricula);
        if (!usuario) {
            throw new Error('Matrícula ou senha incorretas.');
        }

        // Comparação segura com bcrypt (RNF-003)
        const senhaValida = await bcrypt.compare(senha, usuario.senha_hash);
        if (!senhaValida) {
            throw new Error('Matrícula ou senha incorretas.');
        }

        // Gerar token JWT com dados essenciais
        const token = jwt.sign(
            {
                id_usuario: usuario.id_usuario,
                matricula: usuario.matricula,
                tipo_acesso: usuario.tipo_acesso
            },
            JWT_SECRET,
            { expiresIn: '8h' }
        );

        // Log de auditoria (RF-009)
        await registrarLog('LOGIN', `Usuário ${usuario.matricula} realizou login.`, usuario.id_usuario);

        const { senha_hash, ...dadosPublicos } = usuario;
        return {
            mensagem: 'Login realizado com sucesso.',
            token,
            usuario: dadosPublicos
        };
    }
}

module.exports = new AuthService();

const bcrypt = require('bcrypt');
const usuarioRepository = require('../repositories/usuarioRepository');

class UsuarioService {
    // ... outros métodos da classe

    async autenticar(matricula, senha) {
        if (!matricula || !senha) {
            throw new Error('Matrícula e senha são obrigatórias.');
        }

        // 1. Busca o usuário pela matrícula
        const usuario = await usuarioRepository.buscarPorMatricula(matricula);

        // 2. Lança erro genérico por segurança se o usuário não existir
        if (!usuario) {
            throw new Error('Matrícula ou senha inválidas.');
        }

        // 3. Compara a senha informada com o hash armazenado
        const senhaValida = await bcrypt.compare(senha, usuario.senha);
        if (!senhaValida) {
            throw new Error('Matrícula ou senha inválidas.');
        }

        // 4. Retorna os dados do usuário (omitindo a senha por segurança)
        const { senha: _, ...usuarioSemSenha } = usuario;
        return usuarioSemSenha;
    }
}

module.exports = new UsuarioService();
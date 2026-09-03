const bcrypt = require('bcrypt');
const usuarioRepository = require('../repositories/usuarioRepository');
const cargoRepository = require('../repositories/cargoRepository');

class UsuarioService {
    async listarTodos() {
        return await usuarioRepository.listarTodos();
    }

    async buscarPorId(id) {
        const usuario = await usuarioRepository.buscarPorId(id);
        if (!usuario) {
            throw new Error('Usuário não encontrado.');
        }
        return usuario;
    }

    async autenticar(matricula, senha) {
        if (!matricula || !senha) {
            throw new Error('Matrícula e senha são obrigatórias.');
        }

        const usuario = await usuarioRepository.buscarPorMatricula(matricula);
        if (!usuario) {
            throw new Error('Matrícula ou senha inválidas.');
        }

        const senhaValida = await bcrypt.compare(senha, usuario.senha);
        if (!senhaValida) {
            throw new Error('Matrícula ou senha inválidas.');
        }

        const { senha: _, ...usuarioSemSenha } = usuario;
        return usuarioSemSenha;
    }

    async cadastrar(dados) {
        if (!dados.nome || !dados.matricula || !dados.senha) {
            throw new Error('Nome, matrícula e senha são obrigatórios.');
        }

        if (dados.fk_cargo) {
            const cargoExiste = await cargoRepository.buscarPorId(dados.fk_cargo);
            if (!cargoExiste) {
                throw new Error('O cargo informado não existe.');
            }
        }

        const saltRounds = 10;
        const senhaHash = await bcrypt.hash(dados.senha, saltRounds);

        return await usuarioRepository.salvar({
            ...dados,
            senha: senhaHash
        });
    }

    async buscarCargos() {
        return await usuarioRepository.buscarCargos();
    }

    async atualizar(id, dados) {
        await this.buscarPorId(id);

        if (dados.fk_cargo) {
            const cargoExiste = await cargoRepository.buscarPorId(dados.fk_cargo);
            if (!cargoExiste) {
                throw new Error('O cargo informado não existe.');
            }
        }

        if (dados.senha) {
            const saltRounds = 10;
            dados.senha = await bcrypt.hash(dados.senha, saltRounds);
        }

        return await usuarioRepository.atualizar(id, dados);
    }

    async excluir(id) {
        await this.buscarPorId(id);
        return await usuarioRepository.excluir(id);
    }
}

module.exports = new UsuarioService();
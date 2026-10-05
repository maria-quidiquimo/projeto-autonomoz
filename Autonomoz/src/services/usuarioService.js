const bcrypt = require('bcrypt');
const usuarioRepository = require('../repositories/usuarioRepository');
const cargoRepository = require('../repositories/cargoRepository');
const {registrarLog} = require('./logService')

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

    async cadastrar(arg1, arg2, arg3) {
        const dados = (arg2 && typeof arg2 === 'object') ? arg2 : arg1;

        const adminId = arg3 || ((arg2 && typeof arg2 === 'object') ? arg1 : (dados.fk_usuario_criador || null));

        if (!dados.nome && !dados.nome_completo) {
            throw new Error('Nome do usuário é obrigatório.');
        }
        if(!dados.matricula || !dados.senha){
            throw new Error('Matrícula e senha são obrigatórios.')
        }

        if (dados.fk_cargo) {
            const cargoExiste = await cargoRepository.buscarPorId(dados.fk_cargo);
            if (!cargoExiste) {
                throw new Error('O cargo informado não existe.');
            }
        }

        const saltRounds = 10;
        const senhaHash = await bcrypt.hash(dados.senha, saltRounds);

        const novoUsuario = await usuarioRepository.salvar({
            ...dados,
            fk_usuario_criador: adminId || dados.fk_usuario_criador || null,
            senha: senhaHash
        });

        const nomeUsuario = dados.nome_completo || dados.nome;
        await registrarLog(
            'CADASTRAR_USUARIO',
            `Usuário "${nomeUsuario}" (Matrícula: ${dados.matricula}) foi cadastrado no sistema.`,
            adminId
        )
        return novoUsuario;
    }

    async buscarCargos() {
        return await usuarioRepository.buscarCargos();
    }

    async atualizar(id, dados) {
        const usuarioExistente = await this.buscarPorId(id);

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

        const resultado = await usuarioRepository.atualizar(id, dados)

        const tipoEvento = (dados.tipo_acesso || dados.fk_cargo) ? 'ALTERACAO_ACESSO' : 'EDICAO_USUARIO';

        const nomeUsuario = usuarioExistente.nome_completo|| usuarioExistente.nome || `ID ${id}`;

        await registrarLog(
            tipoEvento,
            `Dados/Acesso do usuário "${nomeUsuario}" (ID: ${id}) foram atualizados.`,
            idUsuarioLogado
        )
        return resultado
    }

    async excluir(id) {
        const usuarioExistente = await this.buscarPorId(id);
        
        const resultado = await usuarioRepository.excluir(id);

        const nomeUsuario = usuarioExistente.nome_completo || usuarioExistente.nome || `ID ${id}`;

        await registrarLog(
            'INATIVACAO_USUARIO',
            `Usuário "${nomeUsuario}" (ID: ${id}) foi removido/inativado.`
        )
        return resultado;
    }
}

module.exports = new UsuarioService();
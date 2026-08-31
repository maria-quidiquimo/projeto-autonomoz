const bcrypt = require('bcrypt');
const usuarioRepository = require('../repositories/usuarioRepository');
const { registrarLog } = require('./logAuditoriaHelper');

const SALT_ROUNDS = 10;

class UsuarioService {
    async listarTodos() {
        return await usuarioRepository.listarTodos();
    }

    async buscarPorId(id) {
        const usuario = await usuarioRepository.buscarPorId(id);
        if (!usuario) {
            throw new Error('Usuário não encontrado.');
        }
        const { senha_hash, ...dadosPublicos } = usuario;
        return dadosPublicos;
    }

    async autenticar(matricula, senha) {
        const usuario = await usuarioRepository.buscarPorMatricula(matricula);

        if (!usuario) {
            throw new Error('Matrícula não encontrada.');
        }

        const senhaValida = await bcrypt.compare(senha, usuario.senha_hash);
        if (!senhaValida) {
            throw new Error('Senha incorreta.');
        }

        const { senha_hash, ...dadosPublicos } = usuario;
        return dadosPublicos;
    }

    async cadastrar(adminId, dados) {
        if (!adminId) {
            throw new Error('ID do administrador não fornecido no header (user-id).');
        }

        const admin = await usuarioRepository.buscarPorId(adminId);

        if (!admin || admin.tipo_acesso !== 'GERENTE') {
            throw new Error('Acesso negado: Apenas gerentes podem cadastrar funcionários.');
        }

        if (!dados.matricula || !dados.nome_completo || (!dados.senha_hash && !dados.senha)) {
            throw new Error('Dados obrigatórios (matrícula, nome, senha) ausentes.');
        }

        // Criptografia da senha com bcrypt (RNF-003)
        const senhaPlain = dados.senha || dados.senha_hash;
        dados.senha_hash = await bcrypt.hash(senhaPlain, SALT_ROUNDS);
        delete dados.senha; // Remove campo texto puro

        dados.fk_usuario_criador = adminId;
        const resultado = await usuarioRepository.salvar(dados);

        // Log de auditoria (RF-009)
        await registrarLog(
            'CADASTRO_USUARIO',
            `Gerente ${admin.matricula} cadastrou o usuário ${dados.matricula}.`,
            adminId
        );

        const { senha_hash: _, ...dadosRetorno } = dados;
        return { id_usuario: resultado.insertId, ...dadosRetorno };
    }

    async atualizar(id, dados) {
        await this.buscarPorId(id);

        // Se estão atualizando a senha, criptografa
        if (dados.senha) {
            dados.senha_hash = await bcrypt.hash(dados.senha, SALT_ROUNDS);
            delete dados.senha;
        }

        return await usuarioRepository.atualizar(id, dados);
    }

    async excluir(id) {
        await this.buscarPorId(id);
        return await usuarioRepository.excluir(id);
    }

    async buscarCargos() {
        return await usuarioRepository.buscarCargos();
    }
}

module.exports = new UsuarioService();
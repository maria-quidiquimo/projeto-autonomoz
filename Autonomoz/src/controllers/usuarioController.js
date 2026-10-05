const usuarioService = require('../services/usuarioService');
const authService = require('../services/authService');
const { tratarErroController } = require('../helpers/tratarErroController');

class UsuarioController {
    async listar(req, res) {
        try {
            const usuarios = await usuarioService.listarTodos();
            return res.status(200).json(usuarios);
        } catch (erro) {
            return tratarErroController(res, erro, 'Usuario.listar');
        }
    }

    async buscarPorId(req, res) {
        try {
            const { id } = req.params;
            const usuario = await usuarioService.buscarPorId(id);
            return res.status(200).json(usuario);
        } catch (erro) {
            return tratarErroController(res, erro, 'Usuario.buscarPorId');
        }
    }

    async cadastrar(req, res) {
        try {
            // Usa o id do token JWT OU header user-id para compatibilidade
            const adminId = req.usuario?.id_usuario || req.headers['user-id'] || req.headers['userid'];
            const novoUsuario = await usuarioService.cadastrar(adminId, req.body);

            return res.status(201).json(novoUsuario);
        } catch (erro) {
            return tratarErroController(res, erro, 'Usuario.cadastrar');
        }
    }

    async login(req, res) {
        try {
            const { matricula, senha } = req.body;
            const resultado = await authService.login(matricula, senha);
            return res.status(200).json(resultado);
        } catch (erro) {
            return tratarErroController(res, erro, 'Usuario.login');
        }
    }

    async atualizar(req, res) {
        try {
            const { id } = req.params;
            await usuarioService.atualizar(id, req.body);
            return res.status(200).json({ mensagem: 'Dados atualizados com sucesso.' });
        } catch (erro) {
            return tratarErroController(res, erro, 'Usuario.atualizar');
        }
    }

    async excluir(req, res) {
        try {
            const { id } = req.params;
            await usuarioService.excluir(id);
            return res.status(200).json({ mensagem: 'Usuário removido do sistema.' });
        } catch (erro) {
            return tratarErroController(res, erro, 'Usuario.excluir');
        }
    }

    async buscarCargos(req, res) {
        try {
            const cargos = await usuarioService.buscarCargos();
            return res.status(200).json(cargos);
        } catch (erro) {
            return tratarErroController(res, erro, 'Usuario.buscarCargos');
        }
    }
}

module.exports = new UsuarioController();
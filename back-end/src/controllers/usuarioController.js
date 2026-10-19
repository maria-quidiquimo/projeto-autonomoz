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

    async listarGerenciamento(req, res) {
        try {
            const usuarios = await usuarioService.listarTodosGerenciamento();
            return res.status(200).json(usuarios);
        } catch (error) {
            console.error("❌ ERRO NO LISTAR USUÁRIOS PARA GERENCIAMENTO:", error);
            return res.status(500).json({ error: "Erro interno ao buscar usuários." });
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
            const adminId = req.usuario?.id_usuario || req.headers['user-id'] || req.headers['userid']

            await usuarioService.atualizar(id, req.body, adminId);
            return res.status(200).json({ message: "Dados atualizados com sucesso." });
        } catch (error) {
            if (error.message === 'Usuário não encontrado.') {
                return res.status(404).json({ message: error.message });
            }
            return tratarErroController(res, error, 'Usuario.atualizar');
        }
    }

    async excluir(req, res) {
        try {
            const { id } = req.params;
            const adminId = req.usuario?.id_usuario || req.headers['user-id'] || req.headers['userid'];

            await usuarioService.excluir(id, adminId);
            return res.status(200).json({ message: "Usuário removido do sistema." });
        } catch (error) {
            if (error.message === 'Usuário não encontrado.') {
                return res.status(404).json({ message: error.message });
            }
            return tratarErroController(res, error, 'Usuario.excluir');
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
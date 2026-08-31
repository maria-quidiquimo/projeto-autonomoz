const usuarioService = require('../services/usuarioService');
const authService = require('../services/authService');

class UsuarioController {
    async listar(req, res) {
        try {
            const usuarios = await usuarioService.listarTodos();
            return res.status(200).json(usuarios);
        } catch (error) {
            console.error("❌ ERRO NO LISTAR:", error);
            return res.status(500).json({ error: "Erro interno ao buscar usuários." });
        }
    }

    async buscarPorId(req, res) {
        try {
            const { id } = req.params;
            const usuario = await usuarioService.buscarPorId(id);
            return res.status(200).json(usuario);
        } catch (error) {
            console.error("❌ ERRO NO BUSCAR POR ID:", error);
            if (error.message === 'Usuário não encontrado.') {
                return res.status(404).json({ message: error.message });
            }
            return res.status(500).json({ error: "Erro ao buscar usuário." });
        }
    }

    async cadastrar(req, res) {
        try {
            // Usa o id do token JWT OU header user-id para compatibilidade
            const adminId = req.usuario?.id_usuario || req.headers['user-id'] || req.headers['userid'];
            const novoUsuario = await usuarioService.cadastrar(adminId, req.body);

            return res.status(201).json(novoUsuario);
        } catch (error) {
            console.error("❌ ERRO NO CADASTRAR:", error);
            return res.status(400).json({ error: error.message });
        }
    }

    async login(req, res) {
        try {
            const { matricula, senha } = req.body;
            const resultado = await authService.login(matricula, senha);
            return res.status(200).json(resultado);
        } catch (error) {
            console.error("❌ ERRO NO LOGIN:", error);
            return res.status(401).json({ error: error.message });
        }
    }

    async atualizar(req, res) {
        try {
            const { id } = req.params;
            await usuarioService.atualizar(id, req.body);
            return res.status(200).json({ message: "Dados atualizados com sucesso." });
        } catch (error) {
            console.error("❌ ERRO NO ATUALIZAR:", error);
            if (error.message === 'Usuário não encontrado.') {
                return res.status(404).json({ message: error.message });
            }
            return res.status(500).json({ error: "Erro ao atualizar dados." });
        }
    }

    async excluir(req, res) {
        try {
            const { id } = req.params;
            await usuarioService.excluir(id);
            return res.status(200).json({ message: "Usuário removido do sistema." });
        } catch (error) {
            console.error("❌ ERRO NO EXCLUIR:", error);
            if (error.message === 'Usuário não encontrado.') {
                return res.status(404).json({ message: error.message });
            }
            return res.status(500).json({ error: "Erro ao remover usuário." });
        }
    }

    async buscarCargos(req, res) {
        try {
            const cargos = await usuarioService.buscarCargos();
            return res.status(200).json(cargos);
        } catch (error) {
            console.error("❌ ERRO AO BUSCAR CARGOS:", error);
            return res.status(500).json({ error: "Erro ao listar cargos." });
        }
    }
}

module.exports = new UsuarioController();
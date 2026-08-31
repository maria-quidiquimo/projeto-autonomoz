const logsSistemaService = require('../services/logsSistemaService');

class LogsSistemaController {
    async listar(req, res) {
        try {
            const logs = await logsSistemaService.listarTodos();
            res.status(200).json(logs);
        } catch (erro) {
            res.status(500).json({ mensagem: 'Erro ao buscar logs do sistema.', erro: erro.message });
        }
    }

    async buscarPorId(req, res) {
        try {
            const log = await logsSistemaService.buscarPorId(req.params.id);
            res.status(200).json(log);
        } catch (erro) {
            res.status(404).json({ mensagem: erro.message });
        }
    }

    async cadastrar(req, res) {
        try {
            const resultado = await logsSistemaService.cadastrar(req.body);
            res.status(201).json({ 
                id_log: resultado.insertId, 
                ...req.body 
            });
        } catch (erro) {
            res.status(400).json({ mensagem: erro.message });
        }
    }

    async atualizar(req, res) {
        try {
            await logsSistemaService.atualizar(req.params.id, req.body);
            res.status(200).json({ mensagem: 'Log atualizado.' });
        } catch (erro) {
            res.status(400).json({ mensagem: erro.message });
        }
    }

    async excluir(req, res) {
        try {
            await logsSistemaService.excluir(req.params.id);
            res.status(200).json({ mensagem: 'Log removido.' });
        } catch (erro) {
            res.status(400).json({ mensagem: erro.message });
        }
    }
}

module.exports = new LogsSistemaController();

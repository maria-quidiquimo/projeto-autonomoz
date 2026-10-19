const loteService = require('../services/loteService');

class LoteController {
    async listar(req, res) {
        try {
            const lotes = await loteService.listarTodos();
            res.status(200).json(lotes);
        } catch (erro) {
            res.status(500).json({ mensagem: 'Erro ao buscar lotes.', erro: erro.message });
        }
    }

    async buscarPorId(req, res) {
        try {
            const lote = await loteService.buscarPorId(req.params.id);
            res.status(200).json(lote);
        } catch (erro) {
            res.status(404).json({ mensagem: erro.message });
        }
    }

    async cadastrar(req, res) {
        try {
            const resultado = await loteService.cadastrar(req.body);
            res.status(201).json({ 
                id_lote: resultado.insertId, 
                ...req.body 
            });
        } catch (erro) {
            res.status(400).json({ mensagem: erro.message });
        }
    }

    async atualizar(req, res) {
        try {
            await loteService.atualizar(req.params.id, req.body);
            res.status(200).json({ mensagem: 'Lote atualizado.' });
        } catch (erro) {
            res.status(400).json({ mensagem: erro.message });
        }
    }

    async excluir(req, res) {
        try {
            await loteService.excluir(req.params.id);
            res.status(200).json({ mensagem: 'Lote removido.' });
        } catch (erro) {
            res.status(400).json({ mensagem: erro.message });
        }
    }
}

module.exports = new LoteController();

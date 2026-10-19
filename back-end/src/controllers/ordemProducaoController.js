const ordemProducaoService = require('../services/ordemProducaoService');

class OrdemProducaoController {
    async listar(req, res) {
        try {
            const ordens = await ordemProducaoService.listarTodos();
            res.status(200).json(ordens);
        } catch (erro) {
            res.status(500).json({ mensagem: 'Erro ao buscar ordens de produção.', erro: erro.message });
        }
    }

    async buscarPorId(req, res) {
        try {
            const ordem = await ordemProducaoService.buscarPorId(req.params.id);
            res.status(200).json(ordem);
        } catch (erro) {
            res.status(404).json({ mensagem: erro.message });
        }
    }

    async cadastrar(req, res) {
        try {
            const resultado = await ordemProducaoService.cadastrar(req.body);
            res.status(201).json({ 
                id_ordem_producao: resultado.insertId, 
                ...req.body 
            });
        } catch (erro) {
            res.status(400).json({ mensagem: erro.message });
        }
    }

    async atualizar(req, res) {
        try {
            await ordemProducaoService.atualizar(req.params.id, req.body);
            res.status(200).json({ mensagem: 'Ordem de produção atualizada.' });
        } catch (erro) {
            res.status(400).json({ mensagem: erro.message });
        }
    }

    async excluir(req, res) {
        try {
            await ordemProducaoService.excluir(req.params.id);
            res.status(200).json({ mensagem: 'Ordem de produção removida.' });
        } catch (erro) {
            res.status(400).json({ mensagem: erro.message });
        }
    }
}

module.exports = new OrdemProducaoController();

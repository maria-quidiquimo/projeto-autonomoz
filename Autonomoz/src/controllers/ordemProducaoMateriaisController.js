const ordemProducaoMateriaisService = require('../services/ordemProducaoMateriaisService');

class OrdemProducaoMateriaisController {
    async listar(req, res) {
        try {
            const lista = await ordemProducaoMateriaisService.listarTodos();
            res.status(200).json(lista);
        } catch (erro) {
            res.status(500).json({ mensagem: 'Erro ao buscar materiais da ordem de produção.', erro: erro.message });
        }
    }

    async buscarPorId(req, res) {
        try {
            const registro = await ordemProducaoMateriaisService.buscarPorId(req.params.id);
            res.status(200).json(registro);
        } catch (erro) {
            res.status(404).json({ mensagem: erro.message });
        }
    }

    async cadastrar(req, res) {
        try {
            const resultado = await ordemProducaoMateriaisService.cadastrar(req.body);
            res.status(201).json({ 
                id: resultado.insertId, 
                ...req.body 
            });
        } catch (erro) {
            res.status(400).json({ mensagem: erro.message });
        }
    }

    async atualizar(req, res) {
        try {
            await ordemProducaoMateriaisService.atualizar(req.params.id, req.body);
            res.status(200).json({ mensagem: 'Registro de material atualizado.' });
        } catch (erro) {
            res.status(400).json({ mensagem: erro.message });
        }
    }

    async excluir(req, res) {
        try {
            await ordemProducaoMateriaisService.excluir(req.params.id);
            res.status(200).json({ mensagem: 'Registro de material removido.' });
        } catch (erro) {
            res.status(400).json({ mensagem: erro.message });
        }
    }
}

module.exports = new OrdemProducaoMateriaisController();

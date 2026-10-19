const ordemProducaoFuncionarioService = require('../services/ordemProducaoFuncionarioService');

class OrdemProducaoFuncionarioController {
    async listar(req, res) {
        try {
            const lista = await ordemProducaoFuncionarioService.listarTodos();
            res.status(200).json(lista);
        } catch (erro) {
            res.status(500).json({ mensagem: 'Erro ao buscar registros de ordem de produção e funcionário.', erro: erro.message });
        }
    }

    async buscarPorId(req, res) {
        try {
            const registro = await ordemProducaoFuncionarioService.buscarPorId(req.params.id);
            res.status(200).json(registro);
        } catch (erro) {
            res.status(404).json({ mensagem: erro.message });
        }
    }

    async cadastrar(req, res) {
        try {
            const resultado = await ordemProducaoFuncionarioService.cadastrar(req.body);
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
            await ordemProducaoFuncionarioService.atualizar(req.params.id, req.body);
            res.status(200).json({ mensagem: 'Registro atualizado.' });
        } catch (erro) {
            res.status(400).json({ mensagem: erro.message });
        }
    }

    async excluir(req, res) {
        try {
            await ordemProducaoFuncionarioService.excluir(req.params.id);
            res.status(200).json({ mensagem: 'Registro removido.' });
        } catch (erro) {
            res.status(400).json({ mensagem: erro.message });
        }
    }
}

module.exports = new OrdemProducaoFuncionarioController();

const ordemProducaoFuncionarioService = require('../services/ordemProducaoFuncionarioService');
const { tratarErroController } = require('../helpers/tratarErroController');

class OrdemProducaoFuncionarioController {
    async listar(req, res) {
        try {
            const lista = await ordemProducaoFuncionarioService.listarTodos();
            return res.status(200).json(lista);
        } catch (erro) {
            return tratarErroController(res, erro, 'OrdemProducaoFuncionario.listar');
        }
    }

    async buscarPorId(req, res) {
        try {
            const registro = await ordemProducaoFuncionarioService.buscarPorId(req.params.id);
            return res.status(200).json(registro);
        } catch (erro) {
            return tratarErroController(res, erro, 'OrdemProducaoFuncionario.buscarPorId');
        }
    }

    async cadastrar(req, res) {
        try {
            const resultado = await ordemProducaoFuncionarioService.cadastrar(req.body);
            return res.status(201).json({ 
                id: resultado.insertId, 
                ...req.body 
            });
        } catch (erro) {
            return tratarErroController(res, erro, 'OrdemProducaoFuncionario.cadastrar');
        }
    }

    async atualizar(req, res) {
        try {
            await ordemProducaoFuncionarioService.atualizar(req.params.id, req.body);
            return res.status(200).json({ mensagem: 'Registro atualizado.' });
        } catch (erro) {
            return tratarErroController(res, erro, 'OrdemProducaoFuncionario.atualizar');
        }
    }

    async excluir(req, res) {
        try {
            await ordemProducaoFuncionarioService.excluir(req.params.id);
            return res.status(200).json({ mensagem: 'Registro removido.' });
        } catch (erro) {
            return tratarErroController(res, erro, 'OrdemProducaoFuncionario.excluir');
        }
    }
}

module.exports = new OrdemProducaoFuncionarioController();
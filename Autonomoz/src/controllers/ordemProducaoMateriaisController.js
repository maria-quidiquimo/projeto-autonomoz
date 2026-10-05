const ordemProducaoMateriaisService = require('../services/ordemProducaoMateriaisService');
const { tratarErroController } = require('../helpers/tratarErroController');

class OrdemProducaoMateriaisController {
    async listar(req, res) {
        try {
            const lista = await ordemProducaoMateriaisService.listarTodos();
            return res.status(200).json(lista);
        } catch (erro) {
            return tratarErroController(res, erro, 'OrdemProducaoMateriais.listar');
        }
    }

    async buscarPorId(req, res) {
        try {
            const registro = await ordemProducaoMateriaisService.buscarPorId(req.params.id);
            return res.status(200).json(registro);
        } catch (erro) {
            return tratarErroController(res, erro, 'OrdemProducaoMateriais.buscarPorId');
        }
    }

    async cadastrar(req, res) {
        try {
            const resultado = await ordemProducaoMateriaisService.cadastrar(req.body);
            return res.status(201).json({ 
                id: resultado.insertId, 
                ...req.body 
            });
        } catch (erro) {
            return tratarErroController(res, erro, 'OrdemProducaoMateriais.cadastrar');
        }
    }

    async atualizar(req, res) {
        try {
            await ordemProducaoMateriaisService.atualizar(req.params.id, req.body);
            return res.status(200).json({ mensagem: 'Registro de material atualizado.' });
        } catch (erro) {
            return tratarErroController(res, erro, 'OrdemProducaoMateriais.atualizar');
        }
    }

    async excluir(req, res) {
        try {
            await ordemProducaoMateriaisService.excluir(req.params.id);
            return res.status(200).json({ mensagem: 'Registro de material removido.' });
        } catch (erro) {
            return tratarErroController(res, erro, 'OrdemProducaoMateriais.excluir');
        }
    }
}

module.exports = new OrdemProducaoMateriaisController();
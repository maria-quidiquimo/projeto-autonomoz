const subcategoriaService = require('../services/subcategoriaService');
const { tratarErroController } = require('../helpers/tratarErroController');

class SubcategoriaController {
    async listar(req, res) {
        try {
            const subcategorias = await subcategoriaService.listarTodos();
            return res.status(200).json(subcategorias);
        } catch (erro) {
            return tratarErroController(res, erro, 'Subcategoria.listar');
        }
    }

    async buscarPorId(req, res) {
        try {
            const subcategoria = await subcategoriaService.buscarPorId(req.params.id);
            return res.status(200).json(subcategoria);
        } catch (erro) {
            return tratarErroController(res, erro, 'Subcategoria.buscarPorId');
        }
    }

    async cadastrar(req, res) {
        try {
            const resultado = await subcategoriaService.cadastrar(req.body);
            return res.status(201).json({ 
                id_subcategoria: resultado.insertId, 
                ...req.body 
            });
        } catch (erro) {
            return tratarErroController(res, erro, 'Subcategoria.cadastrar');
        }
    }

    async atualizar(req, res) {
        try {
            await subcategoriaService.atualizar(req.params.id, req.body);
            return res.status(200).json({ mensagem: 'Subcategoria atualizada.' });
        } catch (erro) {
            return tratarErroController(res, erro, 'Subcategoria.atualizar');
        }
    }

    async excluir(req, res) {
        try {
            await subcategoriaService.excluir(req.params.id);
            return res.status(200).json({ mensagem: 'Subcategoria removida.' });
        } catch (erro) {
            return tratarErroController(res, erro, 'Subcategoria.excluir');
        }
    }
}

module.exports = new SubcategoriaController();
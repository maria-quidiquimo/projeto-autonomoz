const categoriaService = require('../services/categoriaService');
const { tratarErroController } = require('../helpers/tratarErroController');

class CategoriaController {
    async listar(req, res) {
        try {
            const categorias = await categoriaService.listarTodos();
            return res.status(200).json(categorias);
        } catch (erro) {
            return tratarErroController(res, erro, 'Categoria.listar');
        }
    }

    async buscarPorId(req, res) {
        try {
            const categoria = await categoriaService.buscarPorId(req.params.id);
            return res.status(200).json(categoria);
        } catch (erro) {
            return tratarErroController(res, erro, 'Categoria.buscarPorId');
        }
    }

    async cadastrar(req, res) {
        try {
            const resultado = await categoriaService.cadastrar(req.body);
            return res.status(201).json({
                id_categoria: resultado.insertId,
                ...req.body
            });
        } catch (erro) {
            return tratarErroController(res, erro, 'Categoria.cadastrar');
        }
    }

    async atualizar(req, res) {
        try {
            await categoriaService.atualizar(req.params.id, req.body);
            return res.status(200).json({ mensagem: "Categoria atualizada." });
        } catch (erro) {
            return tratarErroController(res, erro, 'Categoria.atualizar');
        }
    }

    async excluir(req, res) {
        try {
            await categoriaService.excluir(req.params.id);
            return res.status(200).json({ mensagem: "Categoria removida." });
        } catch (erro) {
            return tratarErroController(res, erro, 'Categoria.excluir');
        }
    }
}

module.exports = new CategoriaController();
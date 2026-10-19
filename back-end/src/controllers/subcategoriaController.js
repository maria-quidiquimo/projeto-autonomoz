const subcategoriaService = require('../services/subcategoriaService');

class SubcategoriaController {
    async listar(req, res) {
        try {
            const subcategorias = await subcategoriaService.listarTodos();
            res.status(200).json(subcategorias);
        } catch (erro) {
            res.status(500).json({ mensagem: 'Erro ao buscar subcategorias.', erro: erro.message });
        }
    }

    async buscarPorId(req, res) {
        try {
            const subcategoria = await subcategoriaService.buscarPorId(req.params.id);
            res.status(200).json(subcategoria);
        } catch (erro) {
            res.status(404).json({ mensagem: erro.message });
        }
    }

    async cadastrar(req, res) {
        try {
            const resultado = await subcategoriaService.cadastrar(req.body);
            res.status(201).json({ 
                id_subcategoria: resultado.insertId, 
                ...req.body 
            });
        } catch (erro) {
            res.status(400).json({ mensagem: erro.message });
        }
    }

    async atualizar(req, res) {
        try {
            await subcategoriaService.atualizar(req.params.id, req.body);
            res.status(200).json({ mensagem: 'Subcategoria atualizada.' });
        } catch (erro) {
            res.status(400).json({ mensagem: erro.message });
        }
    }

    async excluir(req, res) {
        try {
            await subcategoriaService.excluir(req.params.id);
            res.status(200).json({ mensagem: 'Subcategoria removida.' });
        } catch (erro) {
            res.status(400).json({ mensagem: erro.message });
        }
    }
}

module.exports = new SubcategoriaController();

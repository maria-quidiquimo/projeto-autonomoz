const produtoService = require('../services/produtoService');
const { tratarErroController } = require('../helpers/tratarErroController');

class ProdutoController {
    async listar(req, res) {
        try {
            let pagina = Number.parseInt(req.query.pagina, 10);
            let limite = Number.parseInt(req.query.limite, 10);

            if (!Number.isInteger(pagina) || pagina < 1) {
                pagina = 1;
            }
            if (!Number.isInteger(limite) || limite < 1) {
                limite = 20;
            }
            if (limite > 100) {
                limite = 100;
            }

            const resultado = await produtoService.listarTodos(pagina, limite);

            return res.status(200).json(resultado);
        } catch (erro) {
            return tratarErroController(res, erro, 'Produto.listar');
        }
    }

    async buscarPorId(req, res) {
        try {
            const produto = await produtoService.buscarPorId(req.params.id);

            return res.status(200).json(produto);
        } catch (erro) {
            return tratarErroController(res, erro, 'Produto.buscarPorId');
        }
    }

    async cadastrar(req, res) {
        try {
            const idUsuarioLogado = req.usuario?.id_usuario;

            const resultado = await produtoService.cadastrar(req.body, idUsuarioLogado);

            return res.status(201).json({
                id_produto: resultado.insertId,
                ...req.body
            });
        } catch (erro) {
            return tratarErroController(res, erro, 'Produto.cadastrar');
        }
    }

    async atualizar(req, res) {
        try {
            const idUsuarioLogado = req.usuario?.id_usuario;

            await produtoService.atualizar(req.params.id, req.body, idUsuarioLogado);

            return res.status(200).json({
                mensagem: 'Produto atualizado.'
            });
        } catch (erro) {
            return tratarErroController(res, erro, 'Produto.atualizar');
        }
    }

    async excluir(req, res) {
        try {
            const idUsuarioLogado = req.usuario?.id_usuario;

            await produtoService.excluir(req.params.id, idUsuarioLogado);

            return res.status(200).json({
                mensagem: 'Produto removido.'
            });
        } catch (erro) {
            return tratarErroController(res, erro, 'Produto.excluir');
        }
    }
}

module.exports = new ProdutoController();
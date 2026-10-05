const produtoService = require('../services/produtoService');

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
            // Impede consultas muito grandes
            if (limite > 100) {
                limite = 100;
            }

            const resultado = await produtoService.listarTodos(pagina, limite);

            res.status(200).json(resultado);
        } catch (erro) {
            res.status(500).json({
                mensagem: 'Erro ao buscar produtos.',
                erro: erro.message
            });
        }
    }

    async buscarPorId(req, res) {
        try {
            const produto = await produtoService.buscarPorId(req.params.id);

            res.status(200).json(produto);
        } catch (erro) {
            res.status(404).json({
                mensagem: erro.message
            });
        }
    }

    async cadastrar(req, res) {
        try {
            const idUsuarioLogado = req.usuario?.id_usuario

            const resultado = await produtoService.cadastrar(req.body, idUsuarioLogado);

            res.status(201).json({
                id_produto: resultado.insertId,
                ...req.body
            });
        } catch (erro) {
            // Captura o erro de duplicidade do MySQL
            res.status(400).json({
                mensagem: erro.message
            });
        }
    }

    async atualizar(req, res) {
        try {
            const idUsuarioLogado = req.usuario?.id_usuario;

            await produtoService.atualizar(req.params.id, req.body, idUsuarioLogado);

            res.status(200).json({
                mensagem: 'Produto atualizado.'
            });
        } catch (erro) {
            res.status(400).json({
                mensagem: erro.message
            });
        }
    }

    async excluir(req, res) {
        try {
            const idUsuarioLogado = req.usuario?.id_usuario;

            await produtoService.excluir(req.params.id, idUsuarioLogado);

            res.status(200).json({
                mensagem: 'Produto removido.'
            });
        } catch (erro) {
            res.status(400).json({
                mensagem: erro.message
            });
        }
    }
}

module.exports = new ProdutoController();
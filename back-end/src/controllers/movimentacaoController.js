const movimentacaoService = require('../services/movimentacaoService');
const { tratarErroController } = require('../helpers/tratarErroController');

class MovimentacaoController {
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

            const resultado = await movimentacaoService.listarTodos(
                pagina,
                limite
            );

            return res.status(200).json(resultado);
        } catch (erro) {
            return tratarErroController(res, erro, 'Movimentacao.listar');
        }
    }

    async buscarPorId(req, res) {
        try {
            const movimentacao =
                await movimentacaoService.buscarPorId(req.params.id);

            return res.status(200).json(movimentacao);
        } catch (erro) {
            return tratarErroController(res, erro, 'Movimentacao.buscarPorId');
        }
    }

    async cadastrar(req, res) {
        try {
            const usuarioId =
                req.usuario?.id_usuario || req.body.fk_usuario;

            const dados = {
                ...req.body,
                fk_usuario: usuarioId
            };

            const resultado =
                await movimentacaoService.cadastrar(dados);

            return res.status(201).json(resultado);
        } catch (erro) {
            return tratarErroController(res, erro, 'Movimentacao.cadastrar');
        }
    }

    async ajustar(req, res) {
        try {
            const usuarioId =
                req.usuario?.id_usuario || req.body.fk_usuario;

            const dados = {
                ...req.body,
                fk_usuario: usuarioId
            };

            const resultado =
                await movimentacaoService.ajustarEstoque(dados);

            return res.status(200).json({
                mensagem: 'Ajuste de inventário realizado com sucesso.',
                movimentacao: resultado
            });
        } catch (erro) {
            return tratarErroController(res, erro, 'Movimentacao.ajustar');
        }
    }

    async atualizar(req, res) {
        try {
            await movimentacaoService.atualizar(
                req.params.id,
                req.body
            );

            return res.status(200).json({
                mensagem: 'Movimentação atualizada.'
            });
        } catch (erro) {
            return tratarErroController(res, erro, 'Movimentacao.atualizar');
        }
    }

    async excluir(req, res) {
        try {
            await movimentacaoService.excluir(req.params.id);

            return res.status(200).json({
                mensagem: 'Movimentação removida.'
            });
        } catch (erro) {
            return tratarErroController(res, erro, 'Movimentacao.excluir');
        }
    }
}

module.exports = new MovimentacaoController();
const movimentacaoService = require('../services/movimentacaoService');

class MovimentacaoController {
    async listar(req, res) {
        try {
            const movimentacoes = await movimentacaoService.listarTodos();
            res.status(200).json(movimentacoes);
        } catch (erro) {
            res.status(500).json({ mensagem: 'Erro ao buscar movimentações.', erro: erro.message });
        }
    }

    async buscarPorId(req, res) {
        try {
            const movimentacao = await movimentacaoService.buscarPorId(req.params.id);
            res.status(200).json(movimentacao);
        } catch (erro) {
            res.status(404).json({ mensagem: erro.message });
        }
    }

    async cadastrar(req, res) {
        try {
            const usuarioId = req.usuario?.id_usuario || req.body.fk_usuario;
            const dados = { ...req.body, fk_usuario: usuarioId };
            const resultado = await movimentacaoService.cadastrar(dados);
            res.status(201).json(resultado);
        } catch (erro) {
            res.status(400).json({ mensagem: erro.message });
        }
    }

    async ajustar(req, res) {
        try {
            const usuarioId = req.usuario?.id_usuario || req.body.fk_usuario;
            const dados = { ...req.body, fk_usuario: usuarioId };
            const resultado = await movimentacaoService.ajustarEstoque(dados);
            res.status(201).json({
                mensagem: 'Ajuste de inventário registrado com sucesso.',
                movimentacao: resultado
            });
        } catch (erro) {
            res.status(400).json({ mensagem: erro.message });
        }
    }

    async atualizar(req, res) {
        try {
            await movimentacaoService.atualizar(req.params.id, req.body);
            res.status(200).json({ mensagem: 'Movimentação atualizada.' });
        } catch (erro) {
            res.status(400).json({ mensagem: erro.message });
        }
    }

    async excluir(req, res) {
        try {
            await movimentacaoService.excluir(req.params.id);
            res.status(200).json({ mensagem: 'Movimentação removida.' });
        } catch (erro) {
            res.status(400).json({ mensagem: erro.message });
        }
    }
}

module.exports = new MovimentacaoController();

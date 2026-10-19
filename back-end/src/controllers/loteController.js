const loteService = require('../services/loteService');
const { tratarErroController } = require('../helpers/tratarErroController');

class LoteController {
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

            const resultado = await loteService.listarTodos(pagina, limite);

            return res.status(200).json(resultado);
        } catch (erro) {
            return tratarErroController(res, erro, 'Lote.listar');
        }
    }

    async buscarPorId(req, res) {
        try {
            const lote = await loteService.buscarPorId(req.params.id);

            return res.status(200).json(lote);
        } catch (erro) {
            return tratarErroController(res, erro, 'Lote.buscarPorId');
        }
    }

    async cadastrar(req, res) {
        try {
            const resultado = await loteService.cadastrar(req.body);

            return res.status(201).json({
                id_lote: resultado.insertId,
                ...req.body
            });
        } catch (erro) {
            return tratarErroController(res, erro, 'Lote.cadastrar');
        }
    }

    async atualizar(req, res) {
        try {
            await loteService.atualizar(req.params.id, req.body);

            return res.status(200).json({
                mensagem: 'Lote atualizado.'
            });
        } catch (erro) {
            return tratarErroController(res, erro, 'Lote.atualizar');
        }
    }

    async excluir(req, res) {
        try {
            await loteService.excluir(req.params.id);

            return res.status(200).json({
                mensagem: 'Lote removido.'
            });
        } catch (erro) {
            return tratarErroController(res, erro, 'Lote.excluir');
        }
    }
}

module.exports = new LoteController();
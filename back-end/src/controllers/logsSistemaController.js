const logsSistemaService = require('../services/logsSistemaService');
const { tratarErroController } = require('../helpers/tratarErroController');

class LogsSistemaController {
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

            const resultado = await logsSistemaService.listarTodos(pagina, limite);

            return res.status(200).json(resultado);
        } catch (erro) {
            return tratarErroController(res, erro, 'LogsSistema.listar');
        }
    }

    async buscarPorId(req, res) {
        try {
            const log = await logsSistemaService.buscarPorId(req.params.id);

            return res.status(200).json(log);
        } catch (erro) {
            return tratarErroController(res, erro, 'LogsSistema.buscarPorId');
        }
    }
}

module.exports = new LogsSistemaController();
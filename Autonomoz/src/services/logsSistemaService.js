const logsSistemaRepository = require('../repositories/logsSistemaRepository');

class LogsSistemaService {
    async listarTodos(pagina = 1, limite = 20) {
        return await logsSistemaRepository.listarTodos(
            pagina,
            limite
        );
    }

    async buscarPorId(id) {
        const log =
            await logsSistemaRepository.buscarPorId(id);

        if (!log) {
            throw new Error(
                'Log do sistema não encontrado.'
            );
        }

        return log;
    }

    async cadastrar(dados) {
        if (!dados.tipo_evento) {
            throw new Error(
                'O tipo de evento é obrigatório.'
            );
        }

        if (!dados.mensagem) {
            throw new Error(
                'A mensagem de log é obrigatória.'
            );
        }

        return await logsSistemaRepository.salvar(
            dados
        );
    }

    async atualizar(id, dados) {
        await this.buscarPorId(id);

        return await logsSistemaRepository.atualizar(
            id,
            dados
        );
    }

    async excluir(id) {
        await this.buscarPorId(id);

        return await logsSistemaRepository.excluir(
            id
        );
    }
}

module.exports = new LogsSistemaService();
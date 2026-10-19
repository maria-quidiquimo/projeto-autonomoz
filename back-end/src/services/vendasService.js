const vendasRepository = require('../repositories/vendasRepository');
const usuarioRepository = require('../repositories/usuarioRepository');
const { registrarLog } = require('./logAuditoriaHelper');

class VendasService {
    async listarTodos() {
        return await vendasRepository.listarTodos();
    }

    async buscarPorId(id) {
        const venda = await vendasRepository.buscarPorId(id);
        if (!venda) {
            throw new Error('Venda não encontrada.');
        }
        return venda;
    }

    async cadastrar(dados) {
        if (!dados.fk_ordem_producao) {
            throw new Error('A Ordem de Produção é obrigatória.');
        }
        if (!dados.fk_usuario_gerente) {
            throw new Error('O gerente responsável é obrigatório.');
        }
        if (!dados.valor_venda || dados.valor_venda <= 0) {
            throw new Error('O valor da venda deve ser maior que zero.');
        }

        // RN-02: Validar se o usuário informado é realmente GERENTE
        const gerente = await usuarioRepository.buscarPorId(dados.fk_usuario_gerente);
        if (!gerente || gerente.tipo_acesso !== 'GERENTE') {
            throw new Error('Acesso negado: Somente gerentes podem registrar vendas (RN-02).');
        }

        const resultado = await vendasRepository.salvar(dados);

        // Log de auditoria (RF-009)
        await registrarLog(
            'REGISTRO_VENDA',
            `Gerente ${gerente.matricula} registrou venda da OP #${dados.fk_ordem_producao} no valor de R$ ${dados.valor_venda}.`,
            dados.fk_usuario_gerente
        );

        return resultado;
    }

    async atualizar(id, dados) {
        await this.buscarPorId(id);
        return await vendasRepository.atualizar(id, dados);
    }

    async excluir(id) {
        await this.buscarPorId(id);
        return await vendasRepository.excluir(id);
    }
}

module.exports = new VendasService();

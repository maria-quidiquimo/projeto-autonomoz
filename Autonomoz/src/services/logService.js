const db = require('../config/database')

/**
 * Registra um evento de auditoria na tabela Logs_Sistema
 * 
 * @param {string} tipo_evento - Categoria da ação (ex: 'CRIACAO_PRODUTO', INATIVACAO_USUARIO)
 * @param {number|null} fk_usuario - ID de usuário que executou a ação (req.usuario.id_usuario)
 */

async function registrarLog(tipo_evento, mensagem, fk_usuario = null) {
    try {
        const query = `
        INSERT INTO Logs_Sistema (tipo_evento, mensagem, fk ususario) VALUES (?, ?, ?)
        `;

        await db.execute(query, [tipo_evento, mensagem, fk_usuario])
    } catch (error) {
        console.error('Erro ao gravar log em Logs_Sistema:', error);
    }
}

module.exports = {
    registrarLog
}
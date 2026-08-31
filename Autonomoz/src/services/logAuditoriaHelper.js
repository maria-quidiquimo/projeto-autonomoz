const logsSistemaRepository = require('../repositories/logsSistemaRepository');

// Helper silencioso de auditoria (RF-009)
// Nunca lança exceção — falha de log não deve derrubar a operação principal
async function registrarLog(tipo_evento, mensagem, fk_usuario = null) {
    try {
        await logsSistemaRepository.salvar({ tipo_evento, mensagem, fk_usuario });
    } catch (err) {
        console.error(`[AUDIT LOG ERROR] ${tipo_evento}:`, err.message);
    }
}

module.exports = { registrarLog };

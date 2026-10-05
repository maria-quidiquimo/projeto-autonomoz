/**
 * Trata erros nos Controllers: loga o erro real no servidor
 * e oculta detalhes do banco de dados para o cliente no erro 500.
 */
function tratarErroController(res, error, contexto = '') {
    // 1. Grava o erro real no log do servidor
    console.error(`[${contexto}] Erro:`, error);

    // 2. Erros de negócio com status HTTP definido (< 500)
    if (error.statusCode && error.statusCode < 500) {
        return res.status(error.statusCode).json({ mensagem: error.message });
    }

    // 3. Erros de validação manuais (sem mensagens cruas do SQL)
    if (error.message && !error.sqlMessage) {
        return res.status(400).json({ mensagem: error.message });
    }

    // 4. Erros internos do banco ou inesperados (500) -> Mensagem segura
    return res.status(500).json({ 
        mensagem: 'Erro interno no servidor. Tente novamente mais tarde.' 
    });
}

module.exports = { tratarErroController };
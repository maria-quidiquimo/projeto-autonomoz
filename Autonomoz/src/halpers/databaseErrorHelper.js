/**
 * Trata erros de banco de dados e converte erros de FK para mensagens amigáveis.
 * @param {Error} error - Erro capturado do MySQL/db
 * @param {string} entidadeNome - Nome legível da entidade (ex: "Produto", "Usuário")
 */
function tratarErroBanco(error, entidadeNome = 'Registro') {
    // Código 1451 no MySQL indica ER_ROW_IS_REFERENCED_2 (restrição de Chave Estrangeira)
    if (error.code === 'ER_ROW_IS_REFERENCED_2' || error.errno === 1451) {
        throw new Error(
            `Não é possível excluir este(a) ${entidadeNome}, pois existem outros registros vinculados a ele(a).`
        );
    }
    throw error;
}

module.exports = { tratarErroBanco };
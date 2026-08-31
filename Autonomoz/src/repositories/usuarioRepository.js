const db = require('../config/database');
const { tratarErroBanco } = require('../helpers/databaseErrorHelper');

class UsuarioRepository {
    async listarTodos() {
        const sql = `
            SELECT u.id_usuario, u.nome, u.matricula, u.fk_cargo, c.nome_cargo, u.ativo 
            FROM Usuario u
            LEFT JOIN Cargo c ON u.fk_cargo = c.id_cargo
            WHERE u.ativo = TRUE
        `;
        const [linhas] = await db.query(sql);
        return linhas;
    }

    async buscarPorId(id) {
        const sql = `
            SELECT u.id_usuario, u.nome, u.matricula, u.fk_cargo, c.nome_cargo, u.ativo 
            FROM Usuario u
            LEFT JOIN Cargo c ON u.fk_cargo = c.id_cargo
            WHERE u.id_usuario = ? AND u.ativo = TRUE
        `;
        const [linhas] = await db.query(sql, [id]);
        return linhas[0];
    }

    async buscarPorMatricula(matricula) {
        const sql = `
            SELECT u.id_usuario, u.nome, u.matricula, u.senha, u.fk_cargo, c.nome_cargo, u.ativo 
            FROM Usuario u
            LEFT JOIN Cargo c ON u.fk_cargo = c.id_cargo
            WHERE u.matricula = ? AND u.ativo = TRUE
        `;
        const [linhas] = await db.query(sql, [matricula]);
        return linhas[0];
    }

    async salvar(usuario) {
        const { nome, matricula, senha, fk_cargo } = usuario;
        const sql = `INSERT INTO Usuario (nome, matricula, senha, fk_cargo) VALUES (?, ?, ?, ?)`;
        const [resultado] = await db.query(sql, [nome, matricula, senha, fk_cargo || null]);
        return resultado;
    }

    async atualizar(id, usuario) {
        const colunasPermitidas = ['nome', 'matricula', 'senha', 'fk_cargo', 'ativo'];
        const camposParaAtualizar = [];
        const valores = [];

        Object.keys(usuario).forEach((campo) => {
            if (colunasPermitidas.includes(campo) && usuario[campo] !== undefined) {
                camposParaAtualizar.push(`${campo} = ?`);
                valores.push(usuario[campo]);
            }
        });

        if (camposParaAtualizar.length === 0) {
            return { affectedRows: 0 };
        }

        valores.push(id);

        const sql = `UPDATE Usuario SET ${camposParaAtualizar.join(', ')} WHERE id_usuario = ?`;
        const [resultado] = await db.query(sql, valores);
        return resultado;
    }

    async buscarCargos() {
        const sql = 'SELECT id_cargo, nome_cargo FROM Cargo ORDER BY nome_cargo ASC';
        const [linhas] = await db.query(sql);
        return linhas;
    }

    // SOFT DELETE: inativa o usuário para preservar o histórico de auditoria/logs
    async excluir(id) {
        try {
            const sql = 'UPDATE Usuario SET ativo = FALSE WHERE id_usuario = ?';
            const [resultado] = await db.query(sql, [id]);
            return resultado;
        } catch (error) {
            tratarErroBanco(error, 'Usuário');
        }
    }
}

module.exports = new UsuarioRepository();
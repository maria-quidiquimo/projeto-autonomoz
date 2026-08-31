const db = require('../config/database');

class UsuarioRepository {
    async listarTodos() {
        const sql = 'SELECT id_usuario, matricula, nome_completo, tipo_acesso, cargo_descritivo, fk_cargo FROM Usuarios';
        const [linhas] = await db.query(sql);
        return linhas;
    }

    async buscarPorId(id) {
        const sql = 'SELECT * FROM Usuarios WHERE id_usuario = ?';
        const [linhas] = await db.query(sql, [id]);
        return linhas[0];
    }

    async buscarPorMatricula(matricula) {
        const sql = 'SELECT * FROM Usuarios WHERE matricula = ?';
        const [linhas] = await db.query(sql, [matricula]);
        return linhas[0];
    }

    async salvar(usuario) {
        const { matricula, nome_completo, cpf, data_nascimento, senha_hash, tipo_acesso, cargo_descritivo, fk_cargo, fk_usuario_criador } = usuario;
        const sql = `INSERT INTO Usuarios (matricula, nome_completo, cpf, data_nascimento, senha_hash, tipo_acesso, cargo_descritivo, fk_cargo, fk_usuario_criador) 
                     VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`;
        const [resultado] = await db.query(sql, [
            matricula, nome_completo, cpf, data_nascimento, senha_hash, 
            tipo_acesso, cargo_descritivo || null, fk_cargo || null, fk_usuario_criador || null
        ]);
        return resultado;
    }

    async atualizar(id, dados) {
        const fields = [];
        const values = [];

        Object.keys(dados).forEach(key => {
            fields.push(`${key} = ?`);
            values.push(dados[key]);
        });

        if (fields.length === 0) return false;

        values.push(id);

        const sql = `UPDATE Usuarios SET ${fields.join(', ')} WHERE id_usuario = ?`;
        const [resultado] = await db.query(sql, values);
        return resultado;
    }

    async excluir(id) {
        const sql = 'DELETE FROM Usuarios WHERE id_usuario = ?';
        const [resultado] = await db.query(sql, [id]);
        return resultado;
    }

    async buscarCargos() {
        const sql = 'SELECT DISTINCT cargo_descritivo FROM Usuarios WHERE cargo_descritivo IS NOT NULL AND cargo_descritivo != ""';
        const [linhas] = await db.query(sql);
        return linhas.map(r => r.cargo_descritivo);
    }
}

module.exports = new UsuarioRepository();
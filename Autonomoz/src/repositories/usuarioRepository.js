const db = require('../config/database');
const { tratarErroBanco } = require('../helpers/databaseErrorHelper');

class UsuarioRepository {
    async listarTodos() {
        const sql = `
            SELECT u.id_usuario, u.nome_completo AS nome, u.matricula, u.tipo_acesso, u.fk_cargo, c.nome_cargo, u.ativo 
            FROM Usuarios u
            LEFT JOIN Cargo c ON u.fk_cargo = c.id_cargo
            WHERE u.ativo = TRUE
        `;
        const [linhas] = await db.query(sql);
        return linhas;
    }

    async buscarPorId(id) {
        const sql = `
            SELECT u.id_usuario, u.nome_completo AS nome, u.matricula, u.tipo_acesso, u.fk_cargo, c.nome_cargo, u.ativo 
            FROM Usuarios u
            LEFT JOIN Cargo c ON u.fk_cargo = c.id_cargo
            WHERE u.id_usuario = ? AND u.ativo = TRUE
        `;
        const [linhas] = await db.query(sql, [id]);
        return linhas[0];
    }

    async buscarPorMatricula(matricula) {
        const sql = `
            SELECT u.id_usuario, u.nome_completo AS nome, u.matricula, u.tipo_acesso, u.senha_hash AS senha, u.fk_cargo, c.nome_cargo, u.ativo 
            FROM Usuarios u
            LEFT JOIN Cargo c ON u.fk_cargo = c.id_cargo
            WHERE u.matricula = ? AND u.ativo = TRUE
        `;
        const [linhas] = await db.query(sql, [matricula]);
        return linhas[0];
    }

    async salvar(usuario) {
        const { nome, matricula, senha, fk_cargo, tipo_acesso, cpf, data_nascimento, cargo_descritivo, fk_usuario_criador } = usuario;
        const cpfFinal = cpf || `${Math.floor(Math.random() * 899 + 100)}.${Math.floor(Math.random() * 899 + 100)}.${Math.floor(Math.random() * 899 + 100)}-${Math.floor(Math.random() * 89 + 10)}`;
        const dataNascFinal = data_nascimento || '1998-05-15';

        const sql = `INSERT INTO Usuarios (nome_completo, matricula, senha_hash, fk_cargo, tipo_acesso, cpf, data_nascimento, cargo_descritivo, fk_usuario_criador) 
                     VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`;
        const [resultado] = await db.query(sql, [
            nome || usuario.nome_completo,
            matricula,
            senha,
            fk_cargo || null,
            tipo_acesso || 'FUNCIONARIO',
            cpfFinal,
            dataNascFinal,
            cargo_descritivo || null,
            fk_usuario_criador || null
        ]);
        return resultado;
    }

    async atualizar(id, usuario) {
        const mapaColunas = { nome: 'nome_completo', senha: 'senha_hash' };
        const colunasPermitidas = ['nome', 'nome_completo', 'matricula', 'senha', 'fk_cargo', 'ativo', 'tipo_acesso', 'cpf', 'data_nascimento', 'cargo_descritivo'];
        const camposParaAtualizar = [];
        const valores = [];

        Object.keys(usuario).forEach((campo) => {
            if (colunasPermitidas.includes(campo) && usuario[campo] !== undefined) {
                const colunaBanco = mapaColunas[campo] || campo;
                camposParaAtualizar.push(`${colunaBanco} = ?`);
                valores.push(usuario[campo]);
            }
        });

        if (camposParaAtualizar.length === 0) {
            return { affectedRows: 0 };
        }

        valores.push(id);

        const sql = `UPDATE Usuarios SET ${camposParaAtualizar.join(', ')} WHERE id_usuario = ?`;
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
            const sql = 'UPDATE Usuarios SET ativo = FALSE WHERE id_usuario = ?';
            const [resultado] = await db.query(sql, [id]);
            return resultado;
        } catch (error) {
            tratarErroBanco(error, 'Usuário');
        }
    }
}

module.exports = new UsuarioRepository();
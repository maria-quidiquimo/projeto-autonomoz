require('dotenv').config();
const app = require('./app');
const pool = require('./config/database');
const PORT = Number(process.env.PORT || 3000);

async function start() {
    try {
        // Testa a conexão com o pool de conexões do MySQL (autonomoz_db)
        const connection = await pool.getConnection();
        console.log('Conectado ao MySQL (autonomoz_db) com sucesso! 🎉');

        // Sempre libere a conexão de volta para o pool após o teste
        connection.release();
    } catch (err) {
        console.error(
            'Não foi possível conectar ao MySQL durante a inicialização. A API será iniciada, mas as operações que dependem do banco podem falhar:',
            err
        );
    }

    app.listen(PORT, () => {
        console.log(`Servidor Autonomoz rodando com sucesso na porta ${PORT}`);
        console.log(`Base URL: http://localhost:${PORT}/api`);
    });
}

start();
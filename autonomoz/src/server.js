require('dotenv').config();
const app = require('./app');
const pool = require('./config/database');
const PORT = 3000;

async function start() {
    try {
        // Testa a conexão com o pool de conexões do MySQL (autonomoz_db)
        const connection = await pool.getConnection();
        console.log('Conectado ao MySQL (autonomoz_db) com sucesso! 🎉');
        
        // Sempre libere a conexão de volta para o pool após o teste
        connection.release();
        
    } catch (err) {
        console.error('Erro crítico ao conectar no banco de dados:', err);
        // Encerra a aplicação caso o banco não esteja disponível (RNF-002 exige 24/7) [3]
        process.exit(1);
    }

    app.listen(PORT, () => {
        console.log(`Servidor Autonomoz rodando com sucesso na porta ${PORT}`);
        console.log(`Base URL: http://localhost:${PORT}`);
    });
}

start();
const express = require("express");
const path = require("path");
const cors = require("cors");
const routes = require('./routes');

const app = express();

// Middlewares de configuração
app.use(cors());
app.use(express.json()); // Essencial para processar JSON, como nos cadastros de funcionários (RF-001) [3]
app.use(express.urlencoded({ extended: true })); // Suporte para dados de formulários

app.use(express.static(path.join(__dirname, 'autonomoz-view')));

app.use('/uploads', express.static(path.join(__dirname, '../uploads')));

// 3. Alterado: Rota principal para carregar o index do sistema Autonomoz
app.get('/', (req, res) => {
    // Certifique-se de que o arquivo index.html está diretamente dentro da pasta 'src/view'
    res.sendFile(path.join(__dirname, 'view/index.html'));
});

// 4. Prefixo de API conforme a documentação de rotas da Autonomoz [5]
app.use('/api', routes); 

module.exports = app;

// teste
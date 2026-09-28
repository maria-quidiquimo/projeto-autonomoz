const express = require("express");
const path = require("path");
const cors = require("cors");
const routes = require('./routes');

const app = express();

// Middlewares de configuração
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Uploads
app.use('/uploads', express.static(path.join(__dirname, '../uploads')));

// 1. Rota raiz da API e prefixo /api
app.use('/api', routes);
app.use('/', routes);

// 2. Servir frontend estático compilado (se existir)
const distPath = path.join(__dirname, 'view/autonomoz-frontend/dist');
app.use(express.static(distPath));

// 3. Fallback para SPA (compatível com Express 5)
app.use((req, res, next) => {
    if (req.method !== 'GET') {
        return next();
    }
    if (req.url.startsWith('/api') || req.headers.accept?.includes('application/json')) {
        return res.status(404).json({ mensagem: 'Endpoint não encontrado.' });
    }
    const indexPath = path.join(distPath, 'index.html');
    res.sendFile(indexPath, (err) => {
        if (err) {
            res.status(200).json({ status: 'API Autonomoz ICS Ativa', versao: '2.4.0' });
        }
    });
});

module.exports = app;
const express = require('express');
const router = express.Router();
const dashboardController = require('../controllers/dashboardController');
const { autenticar } = require('../middlewares/auth');

router.get('/kpis', autenticar, dashboardController.obterMetricas.bind(dashboardController));
router.get('/', autenticar, dashboardController.obterMetricas.bind(dashboardController));

module.exports = router;

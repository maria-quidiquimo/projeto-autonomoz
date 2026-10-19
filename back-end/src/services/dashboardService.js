const dashboardRepository = require('../repositories/dashboardRepository');

class DashboardService {
    async obterMetricas() { return dashboardRepository.obterMetricas(); }
}
module.exports = new DashboardService();

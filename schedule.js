var schedule = require('node-schedule');
const lxrStockIndexTask = require('./service/lxrIndexService')

schedule.scheduleJob('*/5 * * * *', lxrStockIndexTask.lauchLxrIndexTask())
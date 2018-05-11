var schedule = require('node-schedule');
const lxrStockIndexTask = require('./task/lxrStockIndexTask')

schedule.scheduleJob('*/5 * * * *', lxrStockIndexTask.fetchLXRIndexDataTask());
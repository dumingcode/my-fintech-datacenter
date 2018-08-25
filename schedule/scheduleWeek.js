var schedule = require('node-schedule');
const lxrStockIndexTask = require('../service/lxrIndexService')
const qmStockIndexTask = require('../service/qiemanIndexService')
const stockDailyTask = require('../service/stockDailyDataService')
const stockWeeklyTask = require('../service/stockHisDataWeeklyService')
const yearMinPriceService = require('../service/process/yearMinPriceService')
const log = require('../util/logUtil')
const logUtil = log.logUtil


//改成每天跑一次
schedule.scheduleJob('13 23 * * *', stockWeeklyTask.launchStockHisDataWeekTask().then((val) => {
    logUtil.info({ val }, 'launchStockHisDataWeekTask success')
}).catch((err) => {
    logUtil.error(err)
}))
var schedule = require('node-schedule');
const lxrStockIndexTask = require('../service/lxrIndexService')
const qmStockIndexTask = require('../service/qiemanIndexService')
const stockDailyTask = require('../service/stockDailyDataService')
const stockWeeklyTask = require('../service/stockHisDataWeeklyService')
const yearMinPriceService = require('../service/process/yearMinPriceService')
const log = require('../util/logUtil')
const logUtil = log.logUtil


//每周六凌晨1点跑一次按周的任务
schedule.scheduleJob({ hour: 1, minute: 1, dayOfWeek: 6 }, stockWeeklyTask.launchStockHisDataWeekTask().then((val) => {
    logUtil.info({ val }, 'launchStockHisDataWeekTask success')
}).catch((err) => {
    logUtil.error(err)
}))
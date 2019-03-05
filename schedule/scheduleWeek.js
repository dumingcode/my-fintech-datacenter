var schedule = require('node-schedule');
const stockWeeklyTask = require('../service/stockHisDataWeeklyService')
const stockMa20DataService = require('../service/quant/stockMa20Service')
const log = require('../util/logUtil')
const logUtil = log.logUtil


//改成每天跑一次同步260天内的股票交易价格
schedule.scheduleJob('13 23 * * *', stockWeeklyTask.launchStockHisDataWeekTask().then((val) => {
    logUtil.info({ val }, 'launchStockHisDataWeekTask success')
}).catch((err) => {
    logUtil.error(err)
}))

// 每天计算一次 转债的ma20
schedule.scheduleJob('13 08 * * *', stockMa20DataService.launchStockMa20DailyDataTask().then((val) => {
    logUtil.info({ val }, 'launchStockMa20DailyDataTask success')
}).catch((err) => {
    logUtil.error(err)
}))
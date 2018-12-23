var schedule = require('node-schedule');
const stockWeeklyTask = require('../service/stockHisDataWeeklyService')
const log = require('../util/logUtil')
const logUtil = log.logUtil


//改成每天跑一次同步15天内的股票交易价格
schedule.scheduleJob('13 23 * * *', stockWeeklyTask.launchStockHisDataWeekTask().then((val) => {
    logUtil.info({ val }, 'launchStockHisDataWeekTask success')
}).catch((err) => {
    logUtil.error(err)
}))
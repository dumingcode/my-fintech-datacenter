var schedule = require('node-schedule');
const stockWeeklyTask = require('../service/stockHisDataWeeklyService')
const log = require('../util/logUtil')
const logUtil = log.logUtil


//改成每天跑一次同步260天内的股票交易价格
schedule.scheduleJob('13 21 * * *', stockWeeklyTask.launchStockHisDataWeekTask().then((val) => {
    logUtil.info({ val }, 'launchStockHisDataWeekTask success')
}).catch((err) => {
    logUtil.error(err)
}))


var schedule = require('node-schedule');
const yearMinPriceService = require('../service/process/yearMinPriceService')
const log = require('../util/logUtil')
const logUtil = log.logUtil

//每日允许抓取股票历史价格数据
schedule.scheduleJob('11 2,23,07 * * *', yearMinPriceService.launchStockDailyDataTask().then((val) => {
    logUtil.info({ val }, 'yearMinPriceService success')
}).catch((err) => {
    logUtil.error(err)
}))
/**
 * 此批处理文件负责处理量化计算相关任务
 */
var schedule = require('node-schedule');
const stockAlphaBetaService = require('../service/quant/stockAlphaBetaService')
const stockMa20DataService = require('../service/quant/stockMa20Service')
const yearMinPriceService = require('../service/process/yearMinPriceService')
const log = require('../util/logUtil')
const logUtil = log.logUtil

//计算个股相对沪深300的alpha 和 beta值
schedule.scheduleJob('13 1 * * *', stockAlphaBetaService.launchStockAlphaBetaTask().then((val) => {
    logUtil.info({ val }, 'launchStockAlphaBetaTask success')
}).catch((err) => {
    logUtil.error(err)
}))


// 每天计算一次 转债的ma20
schedule.scheduleJob('33 06,08,16,18 * * *', stockMa20DataService.launchStockMa20DailyDataTask().then((val) => {
    logUtil.info({ val }, 'launchStockMa20DailyDataTask success')
}).catch((err) => {
    logUtil.error(err)
}))

// 52周最低价
schedule.scheduleJob('11 2,23,07 * * *', yearMinPriceService.launchStockDailyDataTask().then((val) => {
    logUtil.info({ val }, 'yearMinPriceService success')
}).catch((err) => {
    logUtil.error(err)
}))

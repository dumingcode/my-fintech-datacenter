/**
 * 此批处理文件负责处理量化计算相关任务
 */
var schedule = require('node-schedule');
const stockAlphaBetaService = require('../service/quant/stockAlphaBetaService')
const log = require('../util/logUtil')
const logUtil = log.logUtil

//计算个股相对沪深300的alpha 和 beta值
schedule.scheduleJob('13 1 * * *', stockAlphaBetaService.launchStockAlphaBetaTask().then((val) => {
    logUtil.info({ val }, 'launchStockAlphaBetaTask success')
}).catch((err) => {
    logUtil.error(err)
}))
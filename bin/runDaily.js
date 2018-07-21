const stockDailyDataService = require('../service/stockDailyDataService')


const log = require('../util/logUtil')
const logUtil = log.logUtil

/**理性人指数数据自动处理任务 */
stockDailyDataService.launchStockDailyDataTask().then((val) => {
    logUtil.info({ val }, 'launchStockDailyDataTask success')
}).catch((err) => {
    logUtil.error(err)
})
const yearMinPriceService = require('../service/process/yearMinPriceService')


const log = require('../util/logUtil')
const logUtil = log.logUtil

/**理性人指数数据自动处理任务 */
yearMinPriceService.launchStockDailyDataTask().then((val) => {
    logUtil.info({ val }, 'yearMinPriceService success')
}).catch((err) => {
    logUtil.error(err)
})
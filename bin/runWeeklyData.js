const stockHisDataWeeklyService = require('../service/stockHisDataWeeklyService')


const log = require('../util/logUtil')
const logUtil = log.logUtil

/**理性人指数数据自动处理任务 */
stockHisDataWeeklyService.launchStockHisDataWeekTask().then((val) => {
    logUtil.info({ val }, 'stockHisDataWeeklyService success')
}).catch((err) => {
    logUtil.error(err)
})
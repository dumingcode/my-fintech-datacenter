const stockHisDataService = require('../service/stockHisDataService')


const log = require('../util/logUtil')
const logUtil = log.logUtil

/**理性人指数数据自动处理任务 */
stockHisDataService.launchStockHisDataTask().then((val) => {
    logUtil.info({ val }, 'launchStockHisDataTask success')
}).catch((err) => {
    logUtil.error(err)
})
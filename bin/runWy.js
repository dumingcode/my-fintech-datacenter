const wyStockService = require('../service/wyStockService')
const log = require('../util/logUtil')
const logUtil = log.logUtil

/**雪球网抓取数据 */
wyStockService.lauchXueQiuStockTask(0).then((val) => {
    logUtil.info({ val }, 'lauchXueQiuStockTask success')
}).catch((err) => {
    logUtil.error(err)
})
const stockHisDataService = require('../service/stockOneStockHisDataService')


const log = require('../util/logUtil')
const logUtil = log.logUtil
/**一次性抓取单只特定个股640个交易日内的交易价格数据 */
stockHisDataService.launchStockHisDataTask('600036').then((val) => {
    logUtil.info({ val }, 'launchStockHisDataTask success')
}).catch((err) => {
    logUtil.error(err)
})
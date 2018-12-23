const stockHisDataService = require('../service/stockHisDataWholeService')


const log = require('../util/logUtil')
const logUtil = log.logUtil
/**一次性抓取全部个股640个交易日内的交易价格数据 */
stockHisDataService.launchStockHisDataTask().then((val) => {
    logUtil.info({ val }, 'launchStockHisDataTask success')
}).catch((err) => {
    logUtil.error(err)
})
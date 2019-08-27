const stockHisDataService = require('../service/stockCbHisDataWholeService')

const log = require('../util/logUtil')
const logUtil = log.logUtil
/** 一次性抓取全部转债260个交易日内的交易价格数据 */
stockHisDataService.launchStockHisDataTask().then((val) => {
  logUtil.info({ val }, 'launchCbStockHisDataTask success')
}).catch((err) => {
  logUtil.error(err)
})

const yearMinPriceService = require('../service/process/yearMinPriceService')

const log = require('../util/logUtil')
const logUtil = log.logUtil

/** 同步所有个股52周最低价 */
yearMinPriceService.launchStockDailyDataTask().then((val) => {
  logUtil.info({ val }, 'yearMinPriceService success')
}).catch((err) => {
  logUtil.error(err)
})

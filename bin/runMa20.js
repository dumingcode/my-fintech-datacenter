const stockMa20DataService = require('../service/quant/stockMa20Service')

const log = require('../util/logUtil')
const logUtil = log.logUtil
/** 计算ma20 */
stockMa20DataService.launchStockMa20DailyDataTask().then((val) => {
  logUtil.info({ val }, 'stockMa20DataService success')
}).catch((err) => {
  logUtil.error(err)
})

const stockHisDataWeeklyService = require('../service/stockHisDataWeeklyService')

const log = require('../util/logUtil')
const logUtil = log.logUtil

/** 同步所有个股15天内各个股票的价格数据 */
stockHisDataWeeklyService.launchStockHisDataWeekTask().then((val) => {
  logUtil.info({ val }, 'stockHisDataWeeklyService success')
}).catch((err) => {
  logUtil.error(err)
})

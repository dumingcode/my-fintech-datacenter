const houseDealService = require('../service/houseDealService')

const log = require('../util/logUtil')
const logUtil = log.logUtil
houseDealService.lauchHouseDailyDealTask().then((val) => {
  logUtil.info({ val }, 'lauchHouseDailyDealTask success')
}).catch((err) => {
  logUtil.error(err)
})

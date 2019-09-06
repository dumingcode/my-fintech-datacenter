const stockIndexSampleService = require('../service/quant/stockIndexSampleService')

const log = require('../util/logUtil')
const logUtil = log.logUtil
stockIndexSampleService.launchStockIndexSampleTask().then((val) => {
  logUtil.info({ val }, 'stockIndexSampleService success')
}).catch((err) => {
  logUtil.error(err)
})

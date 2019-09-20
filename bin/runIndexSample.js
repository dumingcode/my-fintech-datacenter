const stockIndexSampleService = require('../service/quant/stockIndexSampleService')
const lxrIndustryService = require('../service/quant/lxrIndustryService')
const log = require('../util/logUtil')
const logUtil = log.logUtil
stockIndexSampleService.launchStockIndexSampleTask().then((val) => {
  logUtil.info({ val }, 'stockIndexSampleService success')
}).catch((err) => {
  logUtil.error(err)
})

lxrIndustryService.launchIndustryTask().then((val) => {
  logUtil.info({ val }, 'launchIndustryTask success')
}).catch((err) => {
  logUtil.error(err)
})

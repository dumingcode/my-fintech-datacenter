const stockAlphaBetaService = require('../service/quant/stockAlphaBetaService')

const log = require('../util/logUtil')
const logUtil = log.logUtil

/** 计算所有个股特定周期内相对沪深300的alpha beta */
stockAlphaBetaService.launchStockAlphaBetaTask().then((val) => {
  logUtil.info({ val }, 'stockAlphaBetaService success')
}).catch((err) => {
  logUtil.error(err)
})

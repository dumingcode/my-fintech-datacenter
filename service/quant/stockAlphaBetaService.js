const config = require('../../config/config')
const moment = require('moment')
const bunyan = require('bunyan')
const SimpleLinearRegression = require('ml-regression-simple-linear')
const log = bunyan.createLogger({ name: 'alphabeta' })
const stockData = require('../../data/stockList')
const mongdbUtils = require('../../util/mongdbUtils')
const redisUtil = require('../../util/redisUtil')

/**
 * 计算个股相对沪深300的alpha与beta值
 *
 */
module.exports = {
  async launchStockAlphaBetaTask() {
    console.log('start stock alpha&beta job')
    const stockList = stockData.stockList
    // 计算沪深300涨幅
    const benchmark = await this.calcStockBenchmarkPriceYield('000300')
    for (let i = 0; i < stockList.length - 1; i++) {
      try {
        log.info(`alpha&beta----${stockList[i]})} start`)
        const stockAlphaBeta = await this.calcStockPriceYield(stockList[i], benchmark)
        await this.saveStockAlphaBeta(stockList[i], stockAlphaBeta)
        log.info(`${stockList[i]}---` + JSON.stringify(stockAlphaBeta))
      } catch (err) {
        console.log(err)
      }
    }
    return { status: 200, message: 'OK' }
  },
  // 计算基准指数沪深300股价特定阶段里每天的涨跌幅
  async calcStockBenchmarkPriceYield(stockCode = '000300') {
    const twoYearBefore = Number(moment().subtract(728, 'days').format('YYYYMMDD'))
    const queryCondition = { code: stockCode, date: { $gt: twoYearBefore } }
    const quertOption = { sort: [['_id', 1]] }
    const stockPriceArr = await mongdbUtils.queryStockPrice('stock', 'hisprice', queryCondition, quertOption)
    if (!stockPriceArr || stockPriceArr.length <= 0) {
      log.info(`alpha&beta----${stockCode})}--queryStockPrice return empty`)
      return {}
    }
    // 循环遍历计算股价每天涨跌幅
    const benchmark = {}
    let preElement = ''
    stockPriceArr.forEach((element) => {
      if (preElement && preElement.close > 0) {
        benchmark[`${element.date}`] = ((element.close - preElement.close) / preElement.close).toFixed(4)
      }
      preElement = element
    })
    return benchmark
  },
  // 计算股价特定阶段里每天的涨跌幅
  async calcStockPriceYield(stockCode, benchmark) {
    const twoYearBefore = Number(moment().subtract(728, 'days').format('YYYYMMDD'))
    const oneYearBefore = Number(moment().subtract(364, 'days').format('YYYYMMDD'))
    const halfYearBefore = Number(moment().subtract(180, 'days').format('YYYYMMDD'))
    const ninetyDaysBefore = Number(moment().subtract(90, 'days').format('YYYYMMDD'))
    const thirtyDaysBefore = Number(moment().subtract(30, 'days').format('YYYYMMDD'))

    const queryCondition = { code: stockCode, date: { $gt: twoYearBefore } }
    const quertOption = { sort: [['_id', 1]] }
    const stockPriceArr = await mongdbUtils.queryStockPrice('stock', 'hisprice', queryCondition, quertOption)
    if (!stockPriceArr || stockPriceArr.length <= 0) {
      log.info(`alpha&beta----${stockCode})}--queryStockPrice return empty`)
      return { twoYearsAgo: {}, oneYearAgo: {}, '180daysAgo': {}, '90daysAgo': {}, '30daysAgo': {} }
    }
    // 循环遍历计算股价每天涨跌幅
    const twoYearYield = []
    const yearYield = []
    const halfYearYield = []
    const ninetyDaysYield = []
    const thirtyDaysYield = []

    let preElement = ''
    stockPriceArr.forEach((element) => {
      if (preElement) {
        const val = { date: element.date, yield: ((element.close - preElement.close) / preElement.close).toFixed(4) }
        if (benchmark[`${element.date}`]) {
          twoYearYield.push(val)
        }
        if (benchmark[`${element.date}`] && element.date >= halfYearBefore) {
          yearYield.push(val)
        }
        if (benchmark[`${element.date}`] && element.date >= oneYearBefore) {
          halfYearYield.push(val)
        }
        if (benchmark[`${element.date}`] && element.date >= ninetyDaysBefore) {
          ninetyDaysYield.push(val)
        }
        if (benchmark[`${element.date}`] && element.date >= thirtyDaysBefore) {
          thirtyDaysYield.push(val)
        }
      }
      preElement = element
    })

    return { twoYearsAgo: this.calcStockAlphaBeta(benchmark, twoYearYield), oneYearAgo: this.calcStockAlphaBeta(benchmark, yearYield), '180daysAgo': this.calcStockAlphaBeta(benchmark, halfYearYield), '90daysAgo': this.calcStockAlphaBeta(benchmark, ninetyDaysYield), '30daysAgo': this.calcStockAlphaBeta(benchmark, thirtyDaysYield) }
  },
  // 具体调用回归函数计算alpha beta
  calcStockAlphaBeta(benchmark, targetStockArr) {
    const benchmarkRegressionX = []
    const stockRegressionY = []
    targetStockArr.forEach((element) => {
      const curDate = element.date
      benchmarkRegressionX.push(Number(benchmark[String(curDate)]))
      stockRegressionY.push(Number(element.yield))
    })
    if (benchmarkRegressionX.length === 0 || stockRegressionY.length === 0 || benchmarkRegressionX.length !== stockRegressionY.length) {
      return { alpha: 0, beta: 0, r2: 0 }
    }
    const regression = new SimpleLinearRegression(benchmarkRegressionX, stockRegressionY)

    const beta = regression.slope
    const alpha = regression.intercept
    const score = regression.score(benchmarkRegressionX, stockRegressionY)
    const rmsd = score.r2
    return { alpha: alpha, beta: beta, r2: rmsd }
  },
  // 将计算结果存储到redis中
  async saveStockAlphaBeta(stockCode, alphaBetaData) {
    let stockJson = await redisUtil.redisHGet(config.redisStoreKey.xueQiuStockSet, stockCode)
    if (stockJson) {
      stockJson = JSON.parse(stockJson)
    } else {
      stockJson = {
        code: stockCode
      }
    }
    stockJson.alphaBetaGenDate = moment().format('YYYYMMDD HH:mm:ss')
    stockJson.alphaBeta2Year = JSON.stringify(alphaBetaData.twoYearsAgo)
    stockJson.alphaBeta1Year = JSON.stringify(alphaBetaData.oneYearAgo)
    stockJson.alphaBeta180day = JSON.stringify(alphaBetaData['180daysAgo'])
    stockJson.alphaBeta90day = JSON.stringify(alphaBetaData['90daysAgo'])
    stockJson.alphaBeta30day = JSON.stringify(alphaBetaData['30daysAgo'])
    return await redisUtil.redisHSet(config.redisStoreKey.xueQiuStockSet, stockCode, JSON.stringify(stockJson))
  }
}

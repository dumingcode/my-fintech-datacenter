const config = require('../../config/config')
const moment = require('moment')
const bunyan = require('bunyan')
const SimpleLinearRegression = require('ml-regression-simple-linear')
const log = bunyan.createLogger({ name: 'alph&abeta' });
const stockData = require('../../data/stockList');
const mongdbUtils = require('../../util/mongdbUtils');
const redisUtil = require('../../util/redisUtil')


/**
 * 计算个股相对沪深300的alpha与beta值
 * 
 */
module.exports = {
    async launchStockAlphaBetaTask() {
        console.log('start stock alpha&beta job')

        let stockList = stockData.stockList
        let now = moment()

        // 计算沪深300涨幅
        let benchmark = await this.calcStockBenchmarkPriceYield('000300')
        // for (let i = 0; i < stockList.length - 1; i++) {
        try {
            //log.info(`alpha&beta----${stockList[i]})}`)
            let stockAlphaBeta = await this.calcStockPriceYield('600030', benchmark)
            //{ '365daysAgo': yearYieldArr, '180daysAgo': halfYearBefore, '90daysAgo': ninetyDaysBefore, '30daysAgo': thirtyDaysBefore }


            // let stockJson = await redisUtil.redisHGet(config.redisStoreKey.xueQiuStockSet, stockList[i])
            // if (stockJson) {
            //     stockJson = JSON.parse(stockJson)
            // } else {
            //     stockJson = {
            //         'code': stockList[i],
            //         'low': stockData.min_value
            //     }
            // }
            // stockJson['low'] = stockData.min_value
            // stockJson['lowGenDate'] = Number(moment().format('YYYYMMDD'))
            // if (stockData.min_value == 0) {
            //     continue
            // }
            // await this.saveStockLowPrice(stockList[i], stockJson)

        } catch (err) {
            console.log(err)
        }
        // }
        return { status: 200, message: 'OK' }
    },
    async saveStockLowPrice(code, xueQiuStock) {
        xueQiuStock['code'] = code
        return await redisUtil.redisHSet(config.redisStoreKey.xueQiuStockSet, code, JSON.stringify(xueQiuStock))
    },
    // 计算股价特定阶段里每天的涨跌幅
    async calcStockBenchmarkPriceYield(stockCode = '000300') {
        let oneYearBefore = Number(moment().subtract(364, 'days').format('YYYYMMDD'))
        let queryCondition = { 'code': stockCode, 'date': { '$gt': oneYearBefore } }
        let quertOption = { sort: [['_id', 1]] }
        let stockPriceArr = await mongdbUtils.queryStockPrice('stock', 'hisprice', stockCode, queryCondition, quertOption)
        if (!stockPriceArr || stockPriceArr.length <= 0) {
            log.info(`alpha&beta----${stockList[i]})}--queryStockPrice return empty`)
            return {}
        }
        // 循环遍历计算股价每天涨跌幅
        let benchmark = {}
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
        let oneYearBefore = Number(moment().subtract(364, 'days').format('YYYYMMDD'))
        let halfYearBefore = Number(moment().subtract(180, 'days').format('YYYYMMDD'))
        let ninetyDaysBefore = Number(moment().subtract(90, 'days').format('YYYYMMDD'))
        let thirtyDaysBefore = Number(moment().subtract(30, 'days').format('YYYYMMDD'))

        let queryCondition = { 'code': stockCode, 'date': { '$gt': oneYearBefore } }
        let quertOption = { sort: [['_id', 1]] }
        let stockPriceArr = await mongdbUtils.queryStockPrice('stock', 'hisprice', stockCode, queryCondition, quertOption)
        if (!stockPriceArr || stockPriceArr.length <= 0) {
            log.info(`alpha&beta----${stockList[i]})}--queryStockPrice return empty`)
            return {}
        }
        // 循环遍历计算股价每天涨跌幅
        let yearYield = []
        let halfYearYield = []
        let ninetyDaysYield = []
        let thirtyDaysYield = []


        let preElement = ''
        stockPriceArr.forEach((element) => {
            if (preElement) {
                let val = { 'date': element.date, 'yield': ((element.close - preElement.close) / preElement.close).toFixed(4) }

                if (benchmark[`${element.date}`]) {
                    yearYield.push(val)
                }
                if (benchmark[`${element.date}`] && element.date > halfYearBefore) {
                    halfYearYield.push(val)
                }
                if (benchmark[`${element.date}`] && element.date > ninetyDaysBefore) {
                    ninetyDaysYield.push(val)
                }
                if (benchmark[`${element.date}`] && element.date > thirtyDaysBefore) {
                    thirtyDaysYield.push(val)
                }
            }
            preElement = element
        })


        return { '365daysAgo': this.calcStockAlphaBeta(benchmark, yearYield), '180daysAgo': this.calcStockAlphaBeta(benchmark, halfYearYield), '90daysAgo': this.calcStockAlphaBeta(benchmark, ninetyDaysYield), '30daysAgo': this.calcStockAlphaBeta(benchmark, thirtyDaysYield) }
    },
    // 具体调用回归函数计算alpha beta
    calcStockAlphaBeta(benchmark, targetStockArr) {
        let benchmarkRegressionX = []
        let stockRegressionY = []
        targetStockArr.forEach((element) => {
            let curDate = element['date']
            benchmarkRegressionX.push(benchmark[str(curDate)])
            stockRegressionY.push(element.yield)
        })
        if (benchmarkRegressionX.length == 0 || stockRegressionY.length == 0) {
            log.info(`alpha&beta----${stockList[i]})}--calcStockAlphaBeta target Arr length 0`)
            return { 'alpha': 0, 'beta': 0, 'rmsd': 0 }
        }
        const regression = new SimpleLinearRegression(benchmarkRegressionX, stockRegressionY);

        let alpha = regression.slope
        let beta = regression.intercept
        let score = regression.score(benchmark, targetStockArr)
        let rmsd = score['rmsd']
        return { 'alpha': alpha, 'beta': beta, 'rmsd': rmsd }
    }
}
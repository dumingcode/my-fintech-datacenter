const sleepUtil = require('../../util/sleep')
const config = require('../../config/config')
const moment = require('moment');
const bunyan = require('bunyan');
const log = bunyan.createLogger({ name: 'alphaBeta' });
const stockData = require('../../data/stockList');
const mongdbUtils = require('../../util/mongdbUtils');
const redisUtil = require('../../util/redisUtil')

/**
 * 计算个股相对于沪深300的alpha和beta
 * 
 */
module.exports = {
    async launchStockAlphaBetaTask() {
        console.log('launchStockAlphaBetaTask start')

        let stockList = stockData.stockList
        let now = moment()
        let start = now.subtract(364, 'days')
        //获得沪深300近一年内的价格历史数据
        let hs300YearPriceArr = await mongdbUtils.queryStockYearPrice('stock', 'hisprice', '000300', Number(start.format('YYYYMMDD')))
        for (let i = 0; i < stockList.length; i++) {
            try {
                // 沪深300指数跳过计算
                if(stockList[i] =='000300'){
                    continue
                }

                let stockYearPriceArr = await mongdbUtils.queryStockYearPrice('stock', 'hisprice', stockList[i], Number(start.format('YYYYMMDD')))

                if (stockYearPriceArr && stockYearPriceArr.length > 0) {
                    let data = stockYearPriceArr[0]
                    log.info(`${stockList[i]}--${Number(start.format('YYYYMMDD'))}---alphabeta start`)
                    let stockJson = await redisUtil.redisHGet(config.redisStoreKey.xueQiuStockSet, stockList[i])
                    if (stockJson) {
                        stockJson = JSON.parse(stockJson)
                    } else {
                        stockJson = {
                            'code': stockList[i],
                            'low': data.min_value
                        }
                    }
                    stockJson['low'] = data.min_value
                    stockJson['lowGenDate'] =  Number(moment().format('YYYYMMDD'))
                    if (data.min_value == 0) {
                        continue
                    }
                    //await this.saveStockAlphaBeta(stockList[i], stockJson)
                }
            } catch (err) {
                console.log(err)
            }
        }
        return { status: 200, message: 'OK' }
    },
    async saveStockAlphaBeta(code, xueQiuStock) {
        xueQiuStock['code'] = code
        return await redisUtil.redisHSet(config.redisStoreKey.xueQiuStockSet, code, JSON.stringify(xueQiuStock))
    },
    //计算出股票一年价格涨幅，收盘价后一天相对前一天的涨幅
    calcYearPriceChangeRatio(stockArr){
        

    }


}
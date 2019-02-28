const config = require('../../config/config')
const moment = require('moment')
const bunyan = require('bunyan')
const log = bunyan.createLogger({ name: '52low' })
const stockData = require('../../data/stockList')
const mongdbUtils = require('../../util/mongdbUtils')
const redisUtil = require('../../util/redisUtil')

/**
 * 从新浪抓取股票每天的实时数据-收盘后
 * 
 */
module.exports = {
    async launchStockDailyDataTask() {
        console.log('start year 52 low job')

        let stockList = stockData.stockList
        let now = moment()
        let start = now.subtract(364, 'days')

        for (let i = 0; i < stockList.length; i++) {
            try {

                let yearLow = await mongdbUtils.queryMinLowPrice('stock', 'hisprice', stockList[i], Number(start.format('YYYYMMDD')))
                if (yearLow && yearLow.length > 0) {
                    let data = yearLow[0]
                    log.info(`${stockList[i]}--${Number(start.format('YYYYMMDD'))}---${data.min_value}`)
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
                    stockJson['lowGenDate'] =  moment().format('YYYYMMDD HH:mm:ss')
                    if (data.min_value == 0) {
                        continue
                    }
                    await this.saveStockLowPrice(stockList[i], stockJson)
                }
            } catch (err) {
                console.log(err)
            }
        }
        return { status: 200, message: 'OK' }
    },
    async saveStockLowPrice(code, xueQiuStock) {
        xueQiuStock['code'] = code
        return await redisUtil.redisHSet(config.redisStoreKey.xueQiuStockSet, code, JSON.stringify(xueQiuStock))
    }


}
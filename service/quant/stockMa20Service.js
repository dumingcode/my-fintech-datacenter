const config = require('../../config/config')
const moment = require('moment')
const bunyan = require('bunyan')
const log = bunyan.createLogger({ name: 'ma20' })
const stockData = require('../../data/convertBond')
const mongdbUtils = require('../../util/mongdbUtils')
const redisUtil = require('../../util/redisUtil')

/**
 * 计算个股最近20日收盘平均价格
 * 
 */
module.exports = {
    async launchStockMa20DailyDataTask() {
        console.log('start ma20 job')
        let stockList = stockData.cbList
        for (let i = 0; i < stockList.length; i++) {
            let stockCode = stockList[i]
            try {
                let queryCondition = { 'code': stockCode }
                let quertOption = {limit:20, sort: [['_id', -1]] }

                let stockPriceArr = await mongdbUtils.queryStockPrice('stock', 'hisprice', queryCondition, quertOption)
                if (!stockPriceArr || stockPriceArr.length <= 0) {
                    log.info(`ma20----${stockCode})}--queryStockPrice return empty`)
                    return {}
                }

                let ma20 = 0
                stockPriceArr.forEach((element) => {
                    ma20 += element.close
                })
                ma20 = ma20 / 20
                log.info(`${stockCode}-----${ma20}`)
                await this.saveStockMa20Price(stockCode, ma20)
            } catch (err) {
                console.log(err)
            }
        }
        return { status: 200, message: 'OK' }
    },
    // 保存ma20到redis
    async saveStockMa20Price(code, ma20) {
        let stockJson = await redisUtil.redisHGet(config.redisStoreKey.xueQiuStockSet, code)
        if (stockJson) {
            stockJson = JSON.parse(stockJson)
        } else {
            stockJson = {
                'code': code,
                'ma20': ma20
            }
        }
        stockJson['ma20'] = ma20
        stockJson['ma20GenDate'] = moment().format('YYYYMMDD HH:mm:ss')
        return await redisUtil.redisHSet(config.redisStoreKey.xueQiuStockSet, code, JSON.stringify(stockJson))
    }


}
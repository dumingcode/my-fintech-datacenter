const config = require('../../config/config')
const moment = require('moment')
const bunyan = require('bunyan')
const log = bunyan.createLogger({ name: 'ma20' })
const stockData = require('../../data/convertBond')
const mongdbUtils = require('../../util/mongdbUtils')
const redisUtil = require('../../util/redisUtil')

/**
 * 计算个股最近20日 5日收盘平均价格
 *
 */
module.exports = {
  async launchStockMa20DailyDataTask () {
    console.log('start ma20 job')
    const stockList = stockData.cbList
    for (let i = 0; i < stockList.length; i++) {
      const stockCode = stockList[i]
      try {
        const queryCondition = { code: stockCode }
        const quertOption = { limit: 20, sort: [['_id', -1]] }

        const stockPriceArr = await mongdbUtils.queryStockPrice('stock', 'hisprice', queryCondition, quertOption)
        if (!stockPriceArr || stockPriceArr.length <= 0) {
          log.info(`ma20----${stockCode})}--queryStockPrice return empty`)
          continue
        }

        let ma20 = 0
        let ma5 = 0
        let ma10 = 0
        let calMa5Len = 0 // 计算ma5
        let calMa10Len = 0 // 计算ma10
        stockPriceArr.forEach((element) => {
          if (calMa5Len < 5) {
            calMa5Len += 1
            ma5 += element.close
          }
          if (calMa10Len < 10) {
            calMa10Len += 1
            ma10 += element.close
          }
          ma20 += element.close
        })
        ma20 = (ma20 / stockPriceArr.length).toFixed(2)
        ma5 = (ma5 / calMa5Len).toFixed(2)
        ma10 = (ma10 / calMa10Len).toFixed(2)
        log.info(`ma20----${stockCode}--${stockPriceArr.length}---${ma20}`)
        log.info(`ma5----${stockCode}--${calMa5Len}---${ma5}`)
        log.info(`ma10----${stockCode}--${calMa10Len}---${ma10}`)
        await this.saveStockMa20Price(stockCode, ma20, ma5, ma10)
      } catch (err) {
        console.log(err)
      }
    }
    return { status: 200, message: 'OK' }
  },
  // 保存ma20到redis
  async saveStockMa20Price (code, ma20, ma5, ma10) {
    let stockJson = await redisUtil.redisHGet(config.redisStoreKey.xueQiuStockSet, code)
    if (stockJson) {
      stockJson = JSON.parse(stockJson)
    } else {
      stockJson = {
        code: code,
        ma20: ma20,
        ma5: ma5,
        ma10: ma10
      }
    }
    stockJson.ma20 = ma20
    stockJson.ma5 = ma5
    stockJson.ma10 = ma10
    stockJson.ma20GenDate = moment().format('YYYYMMDD HH:mm:ss')
    const x = await redisUtil.redisHSet(config.redisStoreKey.xueQiuStockSet, code, JSON.stringify(stockJson))
    return x
  }

}

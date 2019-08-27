const sleepUtil = require('../util/sleep')
const moment = require('moment')
const bunyan = require('bunyan')
const log = bunyan.createLogger({ name: 'daily bond' })
const stockData = require('../data/convertBond')
const getData = require('./getData')
const mongdbUtils = require('../util/mongdbUtils')
// const config = require('../config/config')

/**
 * 每天更新一次转债的数据
 */
module.exports = {
  async launchCbondHisDataDailyTask () {
    console.log('start HisCbond daily job')

    const stockList = stockData.cbList
    for (let i = 0; i < stockList.length; i++) {
      const code = stockList[i]
      const start = moment()

      const hisData = await this.queryHisStockInfo(code)
      if (!hisData) {
        log.error(`${code} launchCbondHisDataDailyTask error`)
        continue
      }
      const stockArr = await this.parseHisDataToJsonArr(hisData, code)
      await this.saveStockHisPrice(stockArr)

      const end = moment()
      log.info({
        stockCode: code,
        duration: end.diff(start) / 1000
      })

      // 延时随机数字
      const delay = Math.floor(Math.random() * 10) * 1000
      sleepUtil.sleep(delay < 5000 ? 5000 : delay)
    }
    return { status: 200, message: 'OK' }
  },
  async queryHisStockInfo (code) {
    let data = null
    try {
      let queryCode = ''
      if (code.indexOf('6') === 0 || code === '000300' || code.indexOf('11') === 0) {
        queryCode = `sh${code}`
      } else {
        queryCode = `sz${code}`
      }
      data = await getData.queryTTStockHisApi(queryCode, 20)
      if (data.status === '200') {
        let retData = data.data
        if (retData.code !== 0) {
          console.log(retData.msg)
          return null
        }
        retData = retData.data
        const _temp = retData[queryCode]
        if (code === '000300' || code.indexOf('11') === 0 || code.indexOf('12') === 0) {
          return _temp.day
        }
        return _temp.qfqday
      }
    } catch (err) {
      log.error(err)
      return null
    }
    return null
  },
  parseHisDataToJsonArr (data, code) {
    const stockArr = []

    try {
      data.forEach(element => {
        const stockInfo = {}
        let date = element[0]
        date = date.replace(/-/g, '')
        stockInfo._id = `${code}-${date}`
        stockInfo.code = code
        stockInfo.date = Number(date)
        stockInfo.open = Number(element[1])
        stockInfo.close = Number(element[2])
        stockInfo.high = Number(element[3])
        stockInfo.low = Number(element[4])
        stockInfo.amount = Number(element[5])
        if (stockInfo.low > 0) { stockArr.push(stockInfo) }
      })
    } catch (err) {
      console.log(err)
      return []
    }
    return stockArr
  },
  async saveStockHisPrice (stockArr) {
    const saveRes = ''
    try {
      for (let i = 0; i < stockArr.length; i++) {
        const doc = stockArr[i]
        await mongdbUtils.updateOne('stock', 'hisprice', { _id: doc._id }, doc)
        // log.info(`${doc['_id']} dailt  ${res}`)
      }
    } catch (err) {
      console.log(err)
    }
    return saveRes
  }

}

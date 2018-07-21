const redisUtil = require('../util/redisUtil')
const sleepUtil = require('../util/sleep')
const config = require('../config/config')
const puppeteer = require('puppeteer');
const HTMLParser = require('fast-html-parser');
const moment = require('moment');
const bunyan = require('bunyan');
const log = bunyan.createLogger({ name: 'xueQiu' });
const stockData = require('../data/stockList');
const getData = require('./getData')

/**
 * 雪球网个股简况抓取
 * pe pb 52周新低
 */
module.exports = {
    async launchStockHisDataTask() {
        console.log('start HisStock job')

        let stockList = stockData.stockList
        for (let i = 0; i < stockList.length; i++) {

            let code = stockList[i]
            let start = moment()

            let hisData = await this.queryHisStockInfo(code)
            if (!hisData) {
                log.error(`${code} launchStockHisDataTask error`)
                continue
            }
            let stockArr = await this.parseHisDataToJsonArr(hisData, code)

            let end = moment()
            log.info({
                'stockCode': code,
                'duration': end.diff(start) / 1000
            })

            //延时随机数字
            let delay = Math.floor(Math.random() * 30) * 1000
            sleepUtil.sleep(delay < 10000 ? 10000 : delay)

        }
        return { status: 200, message: 'OK' }
    },
    async queryHisStockInfo(code) {
        let data = null
        try {
            data = await getData.queryifengStockHisApi(code)
            if (data.status == '200') {
                return data.data.record
            }
        } catch (err) {
            log.error(err)
            return null
        }
        return null
    },
    parseHisDataToJsonArr(data, code) {
        let stockArr = []
        let stockInfo = {}
            //'date', 'open', 'high', 'close', 'low', 'volume', 
            // 'chg', '%chg', 'ma5', 'ma10', 'ma20', 
            // 'vma5', 'vma10', 'vma20'
        data.forEach(element => {
            stockInfo['code'] = code
            stockInfo['date'] = element[0]
            stockInfo['open'] = element[1]
            stockInfo['high'] = element[2]
            stockInfo['close'] = element[3]
            stockInfo['low'] = element[4]
            stockInfo['volume'] = element[5]
            stockInfo['chg'] = element[6]
            stockInfo['chgPer'] = element[7]
            stockInfo['ma5'] = element[8]
            stockInfo['ma10'] = element[9]
            stockInfo['ma20'] = element[10]
            stockInfo['vma5'] = element[11]
            stockInfo['vma10'] = element[12]
            stockInfo['vma20'] = element[13]
            stockArr.push(stockInfo)
        })
        return stockArr
    }

}
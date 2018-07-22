const redisUtil = require('../util/redisUtil')
const sleepUtil = require('../util/sleep')
const config = require('../config/config')
const puppeteer = require('puppeteer');
const HTMLParser = require('fast-html-parser');
const moment = require('moment');
const bunyan = require('bunyan');
const log = bunyan.createLogger({ name: 'weekly stock' });
const stockData = require('../data/stockList');
const getData = require('./getData')
const mongdbUtils = require('../util/mongdbUtils');

/**
 * 每周抓取一次历史数据10天内的
 */
module.exports = {
    async launchStockHisDataWeekTask() {
        console.log('start HisStock weekly job')

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
            await this.saveStockHisPrice(stockArr)

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
            let queryCode = ''
            if (code.indexOf('6') == 0) {
                queryCode = `sh${code}`
            } else {
                queryCode = `sz${code}`
            }
            data = await getData.queryTTStockHisApi(queryCode, 10)
            if (data.status == '200') {
                let retData = data.data
                if (retData.code !== 0) {
                    console.log(retData.msg)
                    return null
                }
                retData = retData['data']
                let _temp = retData[queryCode]
                return _temp['qfqday']
            }
        } catch (err) {
            log.error(err)
            return null
        }
        return null
    },
    parseHisDataToJsonArr(data, code) {
        let stockArr = []

        try {
            data.forEach(element => {
                let stockInfo = {}
                let date = element[0]
                date = date.replace(/-/g, '')
                stockInfo['_id'] = `${code}-${date}`
                stockInfo['code'] = code
                stockInfo['date'] = Number(date)
                stockInfo['open'] = Number(element[1])
                stockInfo['high'] = Number(element[2])
                stockInfo['close'] = Number(element[3])
                stockInfo['low'] = Number(element[4])
                stockInfo['amount'] = Number(element[5])
                stockArr.push(stockInfo)
            })
        } catch (err) {
            console.log(err)
            return []
        }
        return stockArr
    },
    async saveStockHisPrice(stockArr) {
        let saveRes = ''
        try {
            for (let i = 0; i < stockArr.length; i++) {
                let doc = stockArr[i]
                let isExist = await mongdbUtils.queryCollectionCount('stock', 'hisprice', { '_id': doc['_id'] })
                if (isExist == 0) {
                    saveRes = await mongdbUtils.insertOne('stock', 'hisprice', doc)
                    log.info(`${doc['_id']} weekly inserted ${saveRes.insertedId}`)
                }
            }
        } catch (err) {
            console.log(err)
        }
        return saveRes
    }


}
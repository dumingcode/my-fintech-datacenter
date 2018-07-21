const sleepUtil = require('../util/sleep')
const config = require('../config/config')
const moment = require('moment');
const bunyan = require('bunyan');
const log = bunyan.createLogger({ name: 'dailyStock' });
const stockData = require('../data/stockList');
const getData = require('./getData')
const mongdbUtils = require('../util/mongdbUtils');

/**
 * 从新浪抓取股票每天的实时数据-收盘后
 * 
 */
module.exports = {
    async launchStockDailyDataTask() {
        console.log('start daily stock job')

        let stockList = stockData.stockList
        let batchQuery = ''
        for (let i = 0; i < stockList.length; i++) {
            batchQuery += `${stockList[i]},`
            if ((i % config.dailyStockBatchNum != 0) && (i != stockList.length - 1)) {
                continue
            }

            batchQuery = batchQuery.substring(0, batchQuery.length - 1)
            let start = moment()
            let dailyData = await this.queryDailyStockInfo(batchQuery)

            if (!dailyData) {
                log.error(`${batchQuery} launchStockDailyDataTask error`)
                continue
            }
            dailyData = await this.parseDailyDataToJsonArr(dailyData)
            let saveRes = await this.saveStockDailyPrice(dailyData)

            let end = moment()
            log.info({
                'stockCode': batchQuery,
                'duration': end.diff(start) / 1000
            })

            //延时随机数字
            let delay = Math.floor(Math.random() * 20) * 1000
            sleepUtil.sleep(delay < 10000 ? 10000 : delay)
            batchQuery = ''
        }
        return { status: 200, message: 'OK' }
    },
    async queryDailyStockInfo(batchQuery) {
        let data = null
        try {
            data = await getData.queryGunXueQiuStockDayApi(batchQuery)
            data = data.data
            if (data.code === 1) {
                let retData = data.data
                return retData
            }
        } catch (err) {
            log.error(err)
            return null
        }
        return null
    },
    parseDailyDataToJsonArr(data) {
        let stockArr = []
        try {
            data.forEach(element => {
                let stockInfo = {}
                let date = element['time']
                date = date.substring(0, 10)
                date = date.replace(/-/g, '')
                stockInfo['code'] = element['code']
                stockInfo['_id'] = `${stockInfo['code']}-${date}`
                stockInfo['date'] = Number(date)
                stockInfo['open'] = Number(element['open'])
                stockInfo['high'] = Number(element['high'])
                stockInfo['close'] = Number(element['close'])
                stockInfo['low'] = Number(element['low'])
                stockArr.push(stockInfo)
            })
        } catch (err) {
            console.log(err)
        }
        return stockArr
    },
    async saveStockDailyPrice(stockArr) {
        let saveRes = ''
        try {
            saveRes = await mongdbUtils.insertMany('stock', 'hisprice', stockArr)
        } catch (err) {
            console.log(err)
        }
        return saveRes
    }


}
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
    async lauchXueQiuStockTask(seq) {
        console.log('start Wy job')
        let stockList = stockData.stockList
        for (let i = 0; i < stockList.length; i++) {
            if (i % 3 != seq) {
                continue
            }
            let code = stockList[i]
            let start = moment()
            let isFetched = await this.isFetchedToday(code)
            if (isFetched) {
                console.log(`${code} is fetched ${start.format('YYYY-MM-DD')}`)
                continue
            }


            let xueqiuData = await this.queryWyStockInfo(code)
            if (!xueqiuData) {
                log.error(`${code} queryWyStockInfo error`)
                continue
            }

            let yearData = await this.calcYearLowHighPrice(xueqiuData)
            console.log(code + '---' + yearData)



            // let xueQiuStock = await this.parseXueqiuHtmlDom(xueqiuData)
            // if (!xueQiuStock) {
            //     log.error(`${code} parseXueqiuHtmlDom error`)
            //     continue
            // } else {
            //     let saveFlag = await this.saveXueQiuStock(code, xueQiuStock)
            // }
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
    async saveXueQiuStock(code, xueQiuStock) {
        xueQiuStock['code'] = code
        return await redisUtil.redisHSet(config.redisStoreKey.xueQiuStockSet, code, JSON.stringify(xueQiuStock))
    },
    async queryWyStockInfo(code) {
        let content1 = null
        let content2 = null
        try {
            let now = moment()
            let thisYear = now.year()
            let lastYear = now.year() - 1
            let url1 = null
            let url2 = null
            if (code.indexOf('6') == 0) {
                url1 = `http://img1.money.126.net/data/hs/klinederc/day/history/${thisYear}/0${code}.json`
                url2 = `http://img1.money.126.net/data/hs/klinederc/day/history/${lastYear}/0${code}.json`
            } else {
                url1 = `http://img1.money.126.net/data/hs/klinederc/day/history/${thisYear}/1${code}.json`
                url2 = `http://img1.money.126.net/data/hs/klinederc/day/history/${lastYear}/1${code}.json`
            }
            content1 = await getData.queryWyStockApi(url1)
            content2 = await getData.queryWyStockApi(url2)
        } catch (err) {
            log.error(err)
            return null
        }
        return [content1.data.data, content2.data.data]
    },

    async calcYearLowHighPrice(data) {
        let thisYearArr = data[0]
        let lastYearArr = data[1]
        let now = moment()
        let endDate = now.year() * 10000 + now.month() * 100 + now.day()
        let startDate = (now.year() - 1) * 10000 + now.month() * 100 + now.day()
        let min = 10000000
        let max = 0


        await thisYearArr.forEach(element => {
            let date = parseInt(element[0])
            if (date >= startDate && date <= endDate) {
                if (element[4] <= min) {
                    min = element[4]
                }
                if (element[4] > max) {
                    max = element[4]
                }
            }
        })

        await lastYearArr.forEach(element => {
            let date = parseInt(element[0])
            if (date >= startDate && date <= endDate) {
                if (element[4] <= min) {
                    min = element[4]
                }
                if (element[4] > max) {
                    max = element[4]
                }
            }
        })
        return { 'max': max, 'min': min }
    },



    //逐行处理每个财务数据 
    parseTd(trDom, trIndex, xueQiuData) {
        trDom.forEach((td, index) => {
            let val = td.text
            let value = val.split('：')[1]
                //市盈率TTM 2行3列  PE动22
            if (trIndex == 2) {
                if (index == 3) {
                    xueQiuData['PETTM'] = value
                } else if (index == 2) {
                    xueQiuData['PED'] = value
                }

            } else if (trIndex == 3) {
                //pb 3R 3C PE静态32
                if (index == 3) {
                    xueQiuData['PB'] = value
                } else if (index == 2) {
                    xueQiuData['PES'] = value
                }

            } else if (trIndex == 4) {
                //总市值43
                if (index == 3) {
                    xueQiuData['MARKET'] = value
                }

            } else if (trIndex == 5) {
                //股息率 5R 1C  净资产5R 0C 流通值53
                if (index == 1) {
                    xueQiuData['DIVRATE'] = value
                } else if (index == 0) {
                    xueQiuData['NETASSET'] = value
                } else if (index == 3) {
                    xueQiuData['FAMC'] = value
                }

            } else if (trIndex == 6) {
                //6R0C 52周最高   6R1C 52周最低
                if (index == 0) {
                    xueQiuData['YEARHIGH'] = value
                } else if (index == 1) {
                    xueQiuData['YEARLOW'] = value
                }
            }
        })
    },
    async getProxy() {
        let index = Math.floor(Math.random() * config.xiciDaiLi.proxyArrLength)
        let proxy = await redisUtil.redisLindex(config.redisStoreKey.xiCiProxyList, index)
        return JSON.parse(proxy)
    },
    async isFetchedToday(code) {
        let xueqiuStockJson = await redisUtil.redisHGet(config.redisStoreKey.xueQiuStockSet, code)
        if (!xueqiuStockJson) {
            return false
        }
        let stock = JSON.parse(xueqiuStockJson)
        if (stock['date'] == moment().format('YYYY-MM-DD')) {
            return true
        }
        return false
    }


}
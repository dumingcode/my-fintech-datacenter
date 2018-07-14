const redisUtil = require('../util/redisUtil')
const sleepUtil = require('../util/sleep')
const config = require('../config/config')
const puppeteer = require('puppeteer');
const HTMLParser = require('fast-html-parser');
const moment = require('moment');
const bunyan = require('bunyan');
const log = bunyan.createLogger({ name: 'xueQiu' });
const stockData = require('../data/stockList');
/**
 * 雪球网个股简况抓取
 * pe pb 52周新低
 */
module.exports = {
    async lauchXueQiuStockTask(seq) {
        console.log('start XueQiu job')
        let stockList = stockData.stockList
        for (let i = 0; i < stockList.length; i++) {
            if (i % 3 != seq) {
                continue
            }
            let code = stockList[i]
            let start = moment()
            let xueqiuData = await this.queryXueqiuStockInfo(code)
            let xueQiuStock = await this.parseXueqiuHtmlDom(xueqiuData)
            if (xueQiuStock) {
                let saveFlag = await this.saveXueQiuStock(code, xueQiuStock)
            }
            let end = moment()
            log.info({
                'stockCode': code,
                'duration': end.diff(start) / 1000
            })

            //延时随机数字
            let delay = Math.floor(Math.random() * 60) * 1000
            sleepUtil.sleep(delay < 30000 ? 30000 : delay)

        }
        return { status: 200, message: 'OK' }
    },
    async saveXueQiuStock(code, xueQiuStock) {
        xueQiuStock['code'] = code
        return redisUtil.redisHSet(config.redisStoreKey.xueQiuStockSet, code, JSON.stringify(xueQiuStock))
    },
    async queryXueqiuStockInfo(code) {
        let proxy = this.getProxy()
        let proxyStr = `https=${proxy.ip}:${proxy.port}`
        const browser = await puppeteer.launch({ args: ['--no-sandbox', `--proxy-server="${proxyStr}"`] });　　
        const page = await browser.newPage();　　
        let queryCode = code
        if (code.indexOf('6') == 0) {
            queryCode = `SH${code}`
        } else {
            queryCode = `SZ${code}`
        }
        await page.goto(`https://xueqiu.com/S/${queryCode}`);　　
        let content = await page.content()　
        await browser.close();
        return content
    },



    async parseXueqiuHtmlDom(content) {
        let xueQiuData = {}
        try {
            const root = HTMLParser.parse(content);
            const indexRows = root.querySelector('.quote-info')
            let doms = indexRows.childNodes[0]
            let trDoms = doms.childNodes

            xueQiuData['date'] = moment().format('YYYY-MM-DD')
            trDoms.forEach((element, index) => {
                this.parseTd(element.childNodes, index, xueQiuData)
            });
        } catch (err) {
            console.log(content)
            return null
        }
        return xueQiuData
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
        let index = Math.floor(Math.random() * 10)
        let proxy = await redisUtil.redisLindex(config.redisStoreKey.xiCiProxyList, index)
        return JSON.parse(proxy)
    }


}
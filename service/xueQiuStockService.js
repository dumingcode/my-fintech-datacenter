const redisUtil = require('../util/redisUtil')
const config = require('../config/config')
const puppeteer = require('puppeteer');
const HTMLParser = require('fast-html-parser');
const moment = require('moment');
/**
 * 雪球网个股简况抓取
 * pe pb 52周新低
 */
module.exports = {
    async lauchXueQiuStockTask() {
        console.log('start qieman job')
        let xueqiuData = await this.queryXueqiuStockInfo()
        await this.parseXueqiuHtmlDom(xueqiuData)

        // console.log(xueqiuData)
        return { status: 200, message: 'OK' }
    },

    async queryXueqiuStockInfo() {
        const browser = await puppeteer.launch({ args: ['--no-sandbox'] });　　
        const page = await browser.newPage();　　
        await page.goto('https://xueqiu.com/S/SZ000625');　　
        let content = await page.content()　
        await browser.close();
        return content
    },



    async parseXueqiuHtmlDom(content) {
        const root = HTMLParser.parse(content);
        const indexRows = root.querySelector('.quote-info')
        let doms = indexRows.childNodes[0]
        let trDoms = doms.childNodes
        let xueQiuData = {}
        trDoms.forEach((element, index) => {
            this.parseTd(element.childNodes, index, xueQiuData)
        });

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
    }


}
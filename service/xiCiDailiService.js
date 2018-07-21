const redisUtil = require('../util/redisUtil')
const sleepUtil = require('../util/sleep')
const config = require('../config/config')
const puppeteer = require('puppeteer');
const HTMLParser = require('fast-html-parser');
const moment = require('moment');
const bunyan = require('bunyan');
const log = bunyan.createLogger({ name: 'xiCiDaili' });
const fs = require('fs')


/**
 * 雪球网个股简况抓取
 * pe pb 52周新低
 */
module.exports = {
    async lauchXiciTask() {
        console.log('start Xici job')

        let start = moment()
        let xiCiData = await this.queryXiCiInfo(1)
        let xueQiuStock = await this.parseXiCiHtmlDom(xiCiData)
            // console.log(xueQiuStock)
        await this.saveXueQiuStock(xueQiuStock)
        let end = moment()
        log.info({
            'duration': end.diff(start) / 1000
        })

        console.log('end Xici job')
        return { status: 200, message: 'OK' }
    },

    //抓取最新的第一页
    async queryXiCiInfo(pageNum) {
        // let proxy = await this.getProxy()
        // let proxyStr = `https=${proxy.ip}:${proxy.port}`118.31.220.3
        // log.info(`${code}-----${proxyStr}`) , `--proxy-server="${proxyStr}"`
        const browser = await puppeteer.launch({ args: ['--no-sandbox'] });
        const page = await browser.newPage();
        await page.goto(`http://www.xicidaili.com/nn/1`);
        let content = await page.content()
            // console.log(content)
        await browser.close();
        return content
    },
    async parseXiCiHtmlDom(content) {
        let proxyArr = []
        try {
            const root = HTMLParser.parse(content);
            const indexRows = root.querySelector('#ip_list')
                // console.log(indexRows)
            let tbody = indexRows.lastChild
            let table = tbody.childNodes
            for (let i = 2; i < table.length; i++) {
                let element = table[i]
                if (element['tagName']) {
                    let structuredText = element.structuredText
                    let data = structuredText.split('\n')
                        //只抓取https类型的
                    if (data[4] != 'HTTPS') {
                        continue
                    }
                    let proxy = {}
                    proxy['ip'] = data[0]
                    proxy['port'] = data[1]
                    proxy['name'] = data[2]
                    proxy['type'] = data[3]
                    proxy['https'] = data[4]
                    proxy['duration'] = data[5]
                    proxy['time'] = data[6]
                    if (proxyArr.length > config.xiciDaiLi.proxyArrLength) {
                        break
                    }
                    proxyArr.push(proxy)
                }
            }
        } catch (err) {
            log.error(err)
        }
        return proxyArr
    },
    async saveXueQiuStock(proxyArr) {
        for (let i = 0; i < proxyArr.length; i++) {
            let element = proxyArr[i]
            let result = await redisUtil.redisLpush(config.redisStoreKey.xiCiProxyList, JSON.stringify(element))
            log.info({ ip: element['ip'], res: result })
        }
        await redisUtil.redisLTrim(config.redisStoreKey.xiCiProxyList, 0, config.xiciDaiLi.proxyArrLength - 1)
    },
    async getProxy() {
        let index = Math.floor(Math.random() * config.xiciDaiLi.proxyArrLength)
        let proxy = await redisUtil.redisLindex(config.redisStoreKey.xiCiProxyList, index)
        return JSON.parse(proxy)
    },


}
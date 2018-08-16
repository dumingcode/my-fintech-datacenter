const redisUtil = require('../util/redisUtil')
const config = require('../config/config')
const puppeteer = require('puppeteer');
const HTMLParser = require('fast-html-parser');
const moment = require('moment');
const mongdbUtils = require('../util/mongdbUtils');

module.exports = {
    async lauchDAXIndexTask() {
        console.log('start dax30 job')
        let daxData = await this.queryDAXIndexData()
        if (daxData) {
            await this.parseDAXHtmlDom(daxData)
        }
        return { status: 200, message: 'OK' }
    },

    async queryDAXIndexData() {
        let content = null
        try {
            const browser = await puppeteer.launch({ args: ['--no-sandbox'], timeout: 300000 });
            const page = await browser.newPage();
            await page.setUserAgent('Mozilla/5.0 (Macintosh; Intel Mac OS X 10_7_0) AppleWebKit/535.11 (KHTML, like Gecko) Chrome/17.0.963.56 Safari/535.11');
            await page.goto(config.dax30.indexUrl);
            content = await page.content()
            await browser.close();
        } catch (err) {
            console.log(err)
            return content
        }
        return content
    },



    async parseDAXHtmlDom(content) {
        try {
            const root = HTMLParser.parse(content);
            const indexRows = root.querySelector('#fundPortfolioData')
            let valueStr = indexRows.structuredText
            let values = valueStr.split('\n')
            let now = moment().format('YYYY-MM-DD')
            let mydata = {
                date: now,
                cname: '德国DAX30',
                code: 'DAX30',
                pe: Number(values[2].replace(/[^0-9]/ig, "")) / 100,
                pb: Number(values[3].replace(/[^0-9]/ig, "")) / 100,
                pe_min_val: 10,
                pe_chance_val: 12.5,
                dividend: Number(values[4].replace(/[^0-9]/ig, "")) / 100,
                source: `${now}www.etf.com/DAX`
            }

            let qmIndexAllJsonStr = await redisUtil.redisGet(config.redisStoreKey.qmIndexDataAll)
            let qmIndexAll = JSON.parse(qmIndexAllJsonStr)
            qmIndexAll['DAX30'] = mydata
            await redisUtil.redisSet(config.redisStoreKey.qmIndexDataAll, JSON.stringify(qmIndexAll))
            await redisUtil.redisSet(config.redisStoreKey.daxIndexDealDateKey, now)
            //设置日期为主键
            mydata['_id']=mydata.date
            saveRes = await mongdbUtils.insertOne('stock', 'dax', mydata)
        } catch (err) {
            console.log(err)
        }
        
    }

}
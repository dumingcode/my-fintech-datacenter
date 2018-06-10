const redisUtil = require('../util/redisUtil')
const config = require('../config/config')
const puppeteer = require('puppeteer');
const HTMLParser = require('fast-html-parser');

module.exports = {
    async lauchQiemanIndexTask() {
        console.log('start qieman job')
        let qmIndexData = await this.queryQiemanIndexData()
        await this.parseQiemanHtmlDom(qmIndexData)
        return { status: 200, message: 'OK' }
    },

    async queryQiemanIndexData() {
        const browser = await puppeteer.launch();　　
        const page = await browser.newPage();　　
        await page.goto(config.qieman.indexUrl);　　
        let content = await page.content()　
        await browser.close();
        return content
    },



    async parseQiemanHtmlDom(content) {
        const root = HTMLParser.parse(content);
        const indexRows = root.querySelectorAll('.flex-table-row')
        const dateDom = root.querySelector('.qm-header-note')
        let dateStr = dateDom.rawText

        let latestQmDate = await redisUtil.redisGet(config.redisStoreKey.qmIndexDealDateKey)

        if (dateStr.substring(0, 10) <= latestQmDate) {
            console.log(`${dateStr} done!!!`)
            return
        }

        await redisUtil.redisSet(config.redisStoreKey.qmIndexDealDateKey, dateStr.substring(0, 10))
        console.log(dateStr.substring(0, 10))
        await indexRows.filter(indexRow => {
            const indexSpans = indexRow.querySelectorAll('span')
            return config.qieman.stockIndex.indexOf(indexSpans[1].rawText) >= 0
        }).forEach(indexRow => {
            const indexSpans = indexRow.querySelectorAll('span')
            let mydata = {
                    date: String(dateStr.substring(0, 10)),
                    cname: indexSpans[0].rawText,
                    code: indexSpans[1].rawText,
                    pe: indexSpans[2].rawText,
                    pe_pos: indexSpans[3].rawText,
                    pe_min_val: indexSpans[5].rawText,
                    pb: indexSpans[2].rawText,
                    pb_pos: indexSpans[3].rawText,
                    pb_min_val: indexSpans[5].rawText,
                    source: '且慢'
                }
                //50AH
            if ('950090.SH' == indexSpans[1].rawText) {
                mydata['pe'] = ''
                mydata['pe_pos'] = ''
                mydata['pe_min_val'] = ''
            } else {
                mydata['pb'] = ''
                mydata['pb_pos'] = ''
                mydata['pb_min_val'] = ''
            }
            console.log(mydata)
            redisUtil.redisHSet(config.redisStoreKey.lxrIndexKey, mydata.code, JSON.stringify(mydata))
        })
    }

}
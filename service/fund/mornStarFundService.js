const redisUtil = require('../../util/redisUtil')
const config = require('../../config/config')
const puppeteer = require('puppeteer')
const HTMLParser = require('fast-html-parser')
/**
 * 抓取晨星基金全量基金代码列表
 * 
 */
module.exports = {
  async lauchMornStartFundTask () {
    console.log('start morning star fund job')
    const qmIndexData = await this.queryMornStartFundData()
    // if (qmIndexData) {
    //   await this.parseQiemanHtmlDom(qmIndexData)
    // }
    return { status: 200, message: 'OK' }
  },

  async queryMornStartFundData () {
    let content = null
    try {
      const browser = await puppeteer.launch({ args: ['--no-sandbox'], timeout: 300000 })
      const page = await browser.newPage()
      await page.setUserAgent('Mozilla/5.0 (Macintosh; Intel Mac OS X 10_7_0) AppleWebKit/535.11 (KHTML, like Gecko) Chrome/17.0.963.56 Safari/535.11')
      await page.goto(config.morningStar.url)
      await page.setViewport({width: 1920, height: 1080})
      await page.click('#ctl00_cphMain_AspNetPager1 > a:nth-child(14)')
      await page.waitFor(5000)
      content = await page.content()
      console.log(content)
      await browser.close()
    } catch (err) {
      console.log(err)
      return content
    }
    return content
  },

  async parseQiemanHtmlDom (content) {
    const root = HTMLParser.parse(content)
    const indexRows = root.querySelectorAll('.flex-table-row')
    const dateDom = root.querySelector('.qm-header-note')
    const dateStr = dateDom.rawText

    const latestQmDate = await redisUtil.redisGet(config.redisStoreKey.qmIndexDealDateKey)

    if (dateStr.substring(0, 10) <= latestQmDate) {
      console.log(`${dateStr} done!!!`)
      return
    }

    await redisUtil.redisSet(config.redisStoreKey.qmIndexDealDateKey, dateStr.substring(0, 10))
    const indexDataAll = {}
    const qmArr = await indexRows.filter(indexRow => {
      const indexSpans = indexRow.querySelectorAll('span')
      return config.qieman.stockIndex.indexOf(indexSpans[1].rawText) >= 0
    })
    for (let i = 0; i < qmArr.length; i++) {
      const indexRow = qmArr[i]
      const indexSpans = indexRow.querySelectorAll('span')
      const mydata = {
        date: String(dateStr.substring(0, 10)),
        cname: indexSpans[0].rawText,
        code: indexSpans[1].rawText,
        pe: Number(indexSpans[2].rawText),
        pe_pos: indexSpans[3].rawText,
        pe_min_val: Number(indexSpans[5].rawText),
        source: '且慢'
      }
      if (mydata.code === 'CSPSADRP.CI') {
        mydata.pe_chance_val = 15.00
      } else if (mydata.code === '950090.SH') {
        mydata.pe_chance_val = 10.00
      } else if (mydata.code === '930782.CSI') {
        mydata.pe_chance_val = 27.00
      } else if (mydata.code === 'HSCEI.HI') {
        mydata.pe_chance_val = 9.1
      }

      console.log(mydata)
      indexDataAll[mydata.code] = mydata
      await redisUtil.redisHSet(config.redisStoreKey.lxrIndexKey, mydata.code, JSON.stringify(mydata))
    }
    await redisUtil.redisSet(config.redisStoreKey.qmIndexDataAll, JSON.stringify(indexDataAll))
  }

}

const config = require('../../config/config')
const puppeteer = require('puppeteer')
const sleepUtil = require('../../util/sleep')
const logUtil = require('../../util/logUtil').logUtil
const fs = require('fs')

/**
 * 抓取晨星基金全量基金代码列表
 * 
 */
module.exports = {
  async lauchMornStartFundTask () {
    console.log('start morning star fund job')
    const qmIndexData = await this.queryMornStartFundData()
    return { status: 200, message: 'OK' }
  },
  async queryMornStartFundData (page) {
    let content = null
    let pageNum = 1
    let preContent = null
    try {
      const browser = await puppeteer.launch({ args: ['--no-sandbox'], timeout: 300000 })
      const page = await browser.newPage()
      await page.setUserAgent('Mozilla/5.0 (Macintosh; Intel Mac OS X 10_7_0) AppleWebKit/535.11 (KHTML, like Gecko) Chrome/17.0.963.56 Safari/535.11')
      await page.setViewport({width: 1920, height: 1080})
      await page.goto(config.morningStar.url)
      content = await page.content()
      preContent = content
      // await mongdbUtils.updateOne('stock', 'fund_raw_html', { _id: 1 }, {'_id': 1,'content': content})
      fs.writeFileSync(__dirname+'../../data/fund/基金筛选_晨星网1.html', content,{ encoding: 'utf8',  flag: 'w+' })
      while (pageNum < 600) {
        logUtil.info(`lauchMornStartFundTask is finished page num: ${pageNum}`)
        sleepUtil.sleep(10000 + pageNum * 10)
        if (pageNum <= 10) {
          await page.click('#ctl00_cphMain_AspNetPager1 > a:nth-child(14)')
        } else {
          await page.click('#ctl00_cphMain_AspNetPager1 > a:nth-child(15)')
        }
        await page.waitFor(5000)
        content = await page.content()
        if (preContent == content) {
          break
        }
        preContent = content
        pageNum = pageNum + 1
        fs.writeFileSync(__dirname+`../../data/fund/基金筛选_晨星网${pageNum}.html`, content,{ encoding: 'utf8',  flag: 'w+' })
      }
      await browser.close()
    } catch (err) {
      console.log(err)
      return content
    }
    return content
  }

}

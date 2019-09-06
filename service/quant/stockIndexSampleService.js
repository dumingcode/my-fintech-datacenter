const config = require('../../config/config')
const moment = require('moment')
const http = require('../../util/http')
const mongdbUtils = require('../../util/mongdbUtils')
/**
 * 获取最近的指数成分股
 *
 */
module.exports = {
  async launchStockIndexSampleTask () {
    console.log('start stock index sample job')
    const now = moment()
    const lxrIndexData = await http.post(config.lixingren.indexSampleUrl,
      {
        token: config.lixingren.token,
        date: now.format('YYYY-MM-DD'),
        stockCodes: config.lixingren.stockIndexSample
      }, false)
    if (lxrIndexData.status !== 200) return { status: lxrIndexData.status, message: lxrIndexData.statusText }
    try {
      await this.saveLxrIndexSampleData(lxrIndexData.data.data)
    } catch (err) {
      console.log(err)
    }
    console.log('end stock index sample job')
    return { status: 200, message: 'OK' }
  },
  async saveLxrIndexSampleData (sampleData) {
    try {
      sampleData.forEach(async (sample) => {
        await mongdbUtils.updateOne('stock', 'indexSample', { _id: sample.stockCode }, sample)
      })
    } catch (err) {
      console.log(err)
    }
  }

}
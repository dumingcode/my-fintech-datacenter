const config = require('../../config/config')
const moment = require('moment')
const http = require('../../util/http')
const mongdbUtils = require('../../util/mongdbUtils')
const redisUtil = require('../../util/redisUtil')
/**
 * 获取最近的指数成分股
 *
 */
module.exports = {
  async launchStockIndexSampleTask () {
    console.log('start stock index sample job')
    const lxrIndexData = await http.post(config.lixingren.indexSampleUrl,
      {
        token: config.lixingren.token,
        date: 'latest',
        stockCodes: config.lixingren.stockIndexSample
      }, false)
    if (lxrIndexData.status !== 200) return { status: lxrIndexData.status, message: lxrIndexData.statusText }
    try {
      await this.saveLxrIndexSampleData(lxrIndexData.data.data)
    } catch (err) {
      console.log(err)
    }
    const date = moment().format('YYYY-MM-DD')
    await redisUtil.redisSet('indexRefressDate', date)
    console.log('launchStockIndexSampleTask-' + date)
    console.log('end stock index sample job')
    return { status: 200, message: 'OK' }
  },
  async saveLxrIndexSampleData (sampleData) {
    try {
      const now = moment()
      const date = now.format('YYYYMMDD')
      sampleData.forEach(async (sample) => {
        sample.date = date
        const samples = this.handleOneSample(sample)
        sample.samples = samples
        delete sample.constituents
        await mongdbUtils.updateOne('stock', 'indexSample', { _id: sample.stockCode }, sample)
      })
    } catch (err) {
      console.log(err)
    }
  },
  handleOneSample (element) {
    const samples = element.constituents
    if (!(samples instanceof Array)) {
      return []
    }
    const arr = []
    samples.forEach((sam) => {
      arr.push(sam.stockCode)
    })
    return arr
  }

}

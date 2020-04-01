const config = require('../../config/config')
const moment = require('moment')
const http = require('../../util/http')
const redisUtil = require('../../util/redisUtil')
const mongdbUtils = require('../../util/mongdbUtils')
/**
 * 获取国证行业二三级分类详情
 *
 */
module.exports = {
  async launchIndustryTask () {
    console.log('start lxr industry job')
    try {
      const levelTwoData = await this.queryLxrIndustryData('two')
      console.log(levelTwoData)
      // await this.saveLxrIndustryData(levelTwoData, config.redisStoreKey.gz1V)
      const levelTwoSampleData = await this.queryLxrIndustrySampleData(levelTwoData)
      this.saveLxrIndustrySampleData(levelTwoSampleData.constituentStockCodes)
      console.log(levelTwoSampleData)
      const levelThreeData = await this.queryLxrIndustryData('three')
      console.log(levelThreeData)
      // await this.saveLxrIndustryData(levelThreeData, config.redisStoreKey.gz2V)
      const levelThreeSampleData = await this.queryLxrIndustrySampleData(levelThreeData)
      this.saveLxrIndustrySampleData(levelThreeSampleData.constituentStockCodes)
      console.log(levelThreeSampleData)
      const date = moment().format('YYYY-MM-DD')
      await redisUtil.redisSet('industryRefressDate', date)
      console.log('launchIndustryTask-' + date)
    } catch (err) {
      console.log(err)
    }
    console.log('end lxr industry job')
    return { status: 200, message: 'OK' }
  },
  async queryLxrIndustryData (level_) {
    const lxrIndexData = await http.post(config.lixingren.industryUrl,
      {
        token: config.lixingren.token,
        source: 'cni',
        level: level_
      }, false)
    if (lxrIndexData.status !== 200) return { status: lxrIndexData.data.code, message: lxrIndexData.data.msg }
    return { status: lxrIndexData.data.code, message: lxrIndexData.data.msg, data: lxrIndexData.data.data }
  },
  // 查询理性人行业样本接口
  async queryLxrIndustrySampleData (indSampleData) {
    if (indSampleData.status !== 0) {
      return
    }
    const arr = indSampleData.data
    const lxrIndexData = await http.post(config.lixingren.industrySampleUrl,
      {
        token: config.lixingren.token,
        date: 'latest',
        stockCodes: arr.map((val) => { return val.stockCode })
      }, false)
    if (lxrIndexData.status !== 200) return { status: lxrIndexData.data.code, message: lxrIndexData.data.msg }
    return { status: lxrIndexData.data.code, message: lxrIndexData.data.msg, data: lxrIndexData.data.data }
  },
  async saveLxrIndustryData (indData, redisKey) {
    try {
      if (indData.status !== 0) {
        return
      }
      const arr = indData.data
      arr.forEach(async element => {
        const val = `${element.stockCode}|${element.name}`
        await redisUtil.redisSadd(redisKey, val)
      })
    } catch (err) {
      console.log(err)
    }
  },
  async saveLxrIndustrySampleData (indData) {
    try {
      if (indData.status !== 0) {
        return
      }
      const arr = indData.data
      arr.forEach(async element => {
        element.date = moment().format('YYYY-MM-DD')
        await mongdbUtils.updateOne('stock', 'industrySample', { _id: element.stockCode }, element)
      })
    } catch (err) {
      console.log(err)
    }
  }

}

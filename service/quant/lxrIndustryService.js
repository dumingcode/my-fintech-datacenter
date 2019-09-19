const config = require('../../config/config')
// const moment = require('moment')
const http = require('../../util/http')
const redisUtil = require('../../util/redisUtil')
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
      await this.saveLxrIndustryData(levelTwoData, config.redisStoreKey.gz1V)
      const levelThreeData = await this.queryLxrIndustryData('three')
      console.log(levelThreeData)
      await this.saveLxrIndustryData(levelThreeData, config.redisStoreKey.gz2V)
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
        source: 'gz',
        level: level_
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
        const val = `${element.stockCode}|${element.cnName}`
        await redisUtil.redisSadd(redisKey, val)
      })
    } catch (err) {
      console.log(err)
    }
  }

}

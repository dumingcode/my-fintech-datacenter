const redisUtil = require('../util/redisUtil')
const config = require('../config/config')
const http = require('../util/http')

module.exports = {
  // 判断当前是否需要获取理性人指数数据，需要的话执行请求
  async lauchLxrIndexTask () {
    const lxrIndexData = await this.queryLxrApi(config.lixingren.indexUrl,
      {
        token: config.lixingren.token,
        date: 'latest',
        stockCodes: config.lixingren.stockIndex,
        metricsList: config.lixingren.indexRetPara
      })
    if (lxrIndexData.status !== 200) return { status: lxrIndexData.status, message: lxrIndexData.statusText }

    const lxrHkIndexData = await this.queryLxrApi(config.lixingrenHk.indexUrl,
      {
        token: config.lixingren.token,
        date: 'latest',
        stockCodes: config.lixingrenHk.stockIndex,
        metricsList: config.lixingrenHk.indexRetPara
      })
    if (lxrHkIndexData.status !== 200) return { status: lxrHkIndexData.status, message: lxrHkIndexData.statusText }

    const lxrUSAIndexData = await this.queryLxrApi(config.lixingrenUSA.indexUrl,
      {
        token: config.lixingren.token,
        date: 'latest',
        stockCodes: config.lixingrenUSA.stockIndex,
        metricsList: config.lixingrenUSA.indexRetPara
      })
    if (lxrUSAIndexData.status !== 200) return { status: lxrUSAIndexData.status, message: lxrUSAIndexData.statusText }

    try {
      let indexArr = lxrIndexData.data.data
      indexArr = indexArr.concat(lxrHkIndexData.data.data)
      indexArr = indexArr.concat(lxrUSAIndexData.data.data)

      await this.saveLxrIndexData(indexArr)
    } catch (err) {
      console.log(err)
    }
    return { status: 200, message: 'OK' }
  },
  // 理性人指数数据redis持久化-
  async saveLxrIndexData (arr) {
    const indexDatas = arr
    let tempLeastDealDate = null
    const indexDataAll = {}
    for (let i = 0; i < indexDatas.length; i++) {
      const indexData = indexDatas[i]
      tempLeastDealDate = String(indexData.date).substr(0, 10)
      const mydata = {
        date: String(indexData.date),
        cname: this.queryIndexName(indexData.stockCode),
        pe: indexData.pe_ttm.y_10.weightedAvg.latestVal,
        pe_pos: indexData.pe_ttm.y_10.weightedAvg.latestValPos,
        pb: indexData.pb.y_10.weightedAvg.latestVal,
        pb_pos: indexData.pb.y_10.weightedAvg.latestValPos,
        pe_min_val: indexData.pe_ttm.y_10.weightedAvg.minVal,
        pe_chance_val: indexData.pe_ttm.y_10.weightedAvg.chanceVal,
        pb_min_val: indexData.pb.y_10.weightedAvg.minVal,
        pb_chance_val: indexData.pb.y_10.weightedAvg.chanceVal,
        source: '理性人'
      }

      indexDataAll[indexData.stockCode] = mydata
      await redisUtil.redisHSet(config.redisStoreKey.lxrIndexKey, indexData.stockCode, JSON.stringify(mydata))
    };
    console.log(JSON.stringify(indexDataAll))
    await redisUtil.redisSet(config.redisStoreKey.lxrIndexDealDateKey, tempLeastDealDate)
    await redisUtil.redisSet(config.redisStoreKey.lxrIndexDataAll, JSON.stringify(indexDataAll))
  },
  queryLxrApi (url, data) {
    return http.post(url, data, false)
  },
  queryIndexName (code) {
    const index = {
      399550: '央视50',
      399395: '国证有色',
      399998: '中证煤炭',
      399393: '国证地产',
      10002: '国企指数',
      '000015': '红利指数',
      399005: '中小板指',
      399006: '创业板',
      399673: '创业板50',
      399812: '养老产业',
      399971: '中证传媒',
      399975: '证券公司',
      399986: '中证银行',
      '000827': '中证环保',
      '000905': '中证500',
      '000922': '中证红利',
      '000925': '基本面50',
      '000978': '医药100',
      '000991': '全指医药',
      10001: '恒生指数',
      '000300': '沪深300',
      '000932': '中证消费',
      399701: '深证F60',
      930782: '500SNLV',
      930846: '300SNLV',
      931009: '建筑材料',
      931087: '科技龙头',
      931144: '通信技术',
      931380: '科技50',
      H30094: '消费红利',
      H30533: '中国互联网50',
      '000018': '180金融',
      '000807': '食品饮料',
      '000941': '新能源',
      '000979': '大宗商品',
      399295: '创业蓝筹',
      399809: '保险主题',
      399995: '基建工程',
      399997: '中证白酒',
      '000992': '全指金融',
      '.INX': '标普500',
      HSCAIT: '恒生A股行业龙头指数',
      HSCEI: '恒生中国企业指数',
      HSI: '恒生指数',
      HSMSI: '恒生综合中小型股指数',
      399324: '深证红利'
    }
    let name = index[code]
    if (!name) {
      name = '无'
    }
    return name
  }
}

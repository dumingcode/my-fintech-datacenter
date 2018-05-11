const redisUtil = require('../util/redisUtil')
const config = require('../config/config')

module.exports = {
    //判断当前是否需要获取理性人指数数据，需要的话执行请求
    async lauchLxrIndexTask() {
        let latestDealDate = redisUtil.redisGet(config.redisStoreKey.lxrIndexDealDateKey)
        let lxrIndexData = this.queryLxrIndexAPI()
        await latestDealDate, lxrIndexData
        if (lxrIndexData.status !== 200) return { status: lxrIndexData.status, message: lxrIndexData.statusText }
        if (latestDealDate && lxrIndexData.data[0].date.subString(0, 10) < latestDealDate) {
            return { status: -1, message: "理性人数据返回数据小于已抓取数据" }
        }
        await saveLxrIndexData(lxrIndexData)
        return { status: 200, message: "OK" }
    },

    //查询理性人指数数据API
    queryLxrIndexAPI() {
        return axios.post(config.lixingren.indexUrl, {
            token: config.lixingren.token,
            stockCodes: config.lixingren.stockIndex,
            metrics: config.lixingren.indexRetPara
        })
    },

    //理性人指数数据redis持久化-
    async saveLxrIndexData(response) {

        let indexDatas = response.data
        await indexDatas.forEach(indexData => {
            // indexData.pe_ttm = JSON.stringify(indexData.pe_ttm)
            // indexData.pb = JSON.stringify(indexData.pb)
            // indexData.dividend_r = JSON.stringify(indexData.dividend_r)
            redisUtil.redisHSet(config.redisStoreKey.lxrIndexKey, '', JSON.stringify(indexData))
        });
        redisUtil.redisSet(config.redisStoreKey.lxrIndexDealDateKey, indexDatas[0].date.subString(0, 10))



    }
}
const redisUtil = require('../util/redisUtil')
const config = require('../config/config')
const axios = require('axios')

module.exports = {
    //判断当前是否需要获取理性人指数数据，需要的话执行请求
    async lauchLxrIndexTask() {
        let latestDealDatePromise =  redisUtil.redisGet(config.redisStoreKey.lxrIndexDealDateKey)
        let lxrIndexDataPromise =  this.queryLxrIndexAPI()
        const lxrIndexData = await lxrIndexDataPromise
        const latestDealDate = await latestDealDatePromise
        //console.log(lxrIndexData)
        //console.log(latestDealDate)
        if (lxrIndexData.status != 200) return { status: lxrIndexData.status, message: lxrIndexData.statusText }
        if (latestDealDate && lxrIndexData.data[0].date < latestDealDate) {
            return { status: -1, message: "error! lxr data is not latest" }
        }
        await this.saveLxrIndexData(lxrIndexData)
        return { status: 200, message: 'OK' }
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
        let tempLatestDealDate
        await indexDatas.forEach(indexData => {
            tempLatestDealDate = String(indexData.date)
            redisUtil.redisHSet(config.redisStoreKey.lxrIndexKey, indexData.stockCode, JSON.stringify(indexData))
        });
        redisUtil.redisSet(config.redisStoreKey.lxrIndexDealDateKey, tempLatestDealDate)



    }
}
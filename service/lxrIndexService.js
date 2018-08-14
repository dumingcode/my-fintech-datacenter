const redisUtil = require('../util/redisUtil')
const config = require('../config/config')
const axios = require('axios')

module.exports = {
    //判断当前是否需要获取理性人指数数据，需要的话执行请求
    async lauchLxrIndexTask() {
        // let latestDealDatePromise = redisUtil.redisGet(config.redisStoreKey.lxrIndexDealDateKey)
        let lxrIndexDataPromise = this.queryLxrIndexAPI()
        const lxrIndexData = await lxrIndexDataPromise
        // const latestDealDate = await latestDealDatePromise
        //console.log(lxrIndexData)
        //console.log(latestDealDate)
        if (lxrIndexData.status != 200) return { status: lxrIndexData.status, message: lxrIndexData.statusText }
        // if (latestDealDate && lxrIndexData.data[0].date < latestDealDate) {
        //     return { status: -1, message: "error! lxr data is not latest" }
        // }
        await this.saveLxrIndexData(lxrIndexData)
        return { status: 200, message: 'OK' }
    },

    //查询理性人指数数据API
    queryLxrIndexAPI() {
        return axios.post(
            config.lixingren.indexUrl,
            {
                token: config.lixingren.token,
                date: 'latest',
                stockCodes: config.lixingren.stockIndex,
                metrics: config.lixingren.indexRetPara
            }, {

                headers: { 'Content-Type': 'application/json' }
            })
    },

    //理性人指数数据redis持久化-
    async saveLxrIndexData(response) {

        let indexDatas = response.data.data
        let tempLeastDealDate = null
        let indexDataAll = {}
        for (let i = 0; i < indexDatas.length; i++) {
            let indexData = indexDatas[i]
            tempLeastDealDate = String(indexData.date)
            let mydata = {
                date: String(indexData.date),
                cname: indexData.stockCnName,
                pe: indexData.pe_ttm.weightedAvg,
                pe_pos: indexData.pe_ttm.y_10.weightedAvg.latestValPos,
                pb: indexData.pb.weightedAvg,
                pb_pos: indexData.pb.y_10.weightedAvg.latestValPos,
                dividend: indexData.dividend_r.weightedAvg,
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


    }
}
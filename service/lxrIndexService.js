const redisUtil = require('../util/redisUtil')
const config = require('../config/config')
const http = require('../util/http')


module.exports = {
    //判断当前是否需要获取理性人指数数据，需要的话执行请求
    async lauchLxrIndexTask() {
        const lxrIndexData = await this.queryLxrApi(config.lixingren.indexUrl,
            {
                token: config.lixingren.token,
                date: 'latest',
                stockCodes: config.lixingren.stockIndex,
                metrics: config.lixingren.indexRetPara
            });
        if (lxrIndexData.status != 200) return { status: lxrIndexData.status, message: lxrIndexData.statusText }
        try{
          await this.saveLxrIndexData(lxrIndexData)
        }catch(err){
            console.log(err)
        }
        return { status: 200, message: 'OK' }
    },
    queryLxrApi(url,data) {
        return http.post(url, data, false)
    },
    //理性人指数数据redis持久化-
    async saveLxrIndexData(response) {

        let indexDatas = response.data.data
        let tempLeastDealDate = null
        let indexDataAll = {}
        for (let i = 0; i < indexDatas.length; i++) {
            let indexData = indexDatas[i]
            tempLeastDealDate = String(indexData.date).substr(0,10)
            let mydata = {
                date: String(indexData.date),
                cname: indexData.stockCnName,
                pe: indexData.pe_ttm.y_10.weightedAvg.latestVal,
                pe_pos: indexData.pe_ttm.y_10.weightedAvg.latestValPos,
                pb: indexData.pb.y_10.weightedAvg.latestVal,
                pb_pos: indexData.pb.y_10.weightedAvg.latestValPos,
                dividend: indexData.dividend_r.y_10.weightedAvg,
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
const config = require('../../config/config')
const redisUtil = require('../../util/redisUtil')
const readline = require('readline')
const fs = require('fs');
/**
 * 存储个股的中信一级分类和二级分类
 * 
 */
module.exports = {
    async launchIndustryTask() {
        console.log('start industry once time')
        const rl = readline.createInterface({
            input: fs.createReadStream('../../data/citilv1v2.txt'),
            crlfDelay: 100
        });
        //处理一级二级行业
        rl.on('line', (line) => {
            console.log(`Line from file: ${line}`)
            line = line.replace(/\"/g, "")
            let strs = line.split(',')
            let code = strs[0].substring(0, 6)
            let citiV1 = strs[1]
            let citiV2 = strs[2]
            if (code == '00000') {
                code = '000001'
            }
            let stockInfo = { 'code': code, 'citiV1': citiV1, 'citiV2': citiV2 }
            let stockJson = await redisUtil.redisHGet(config.redisStoreKey.xueQiuStockSet, code)

            if (stockJson) {
                let temp = JSON.parse(stockJson)
                stockInfo['low'] = temp['low']
            }
            await this.saveStockLowPrice(code, stockJson)


        });

        return { status: 200, message: 'OK' }
    },
    async saveStockLowPrice(code, xueQiuStock) {
        xueQiuStock['code'] = code
        return await redisUtil.redisHSet(config.redisStoreKey.xueQiuStockSet, code, JSON.stringify(xueQiuStock))
    }


}
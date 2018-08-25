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
            // await this.handleStep1()
            // await this.handleStep2()
            // await this.handleStep3()
        await this.handleStep4()
        return { status: 200, message: 'OK' }
    },
    handleStep1() {

        const rl = readline.createInterface({
            input: fs.createReadStream('/tmp/citilv1v2.txt'),
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
            if (code == "00000") {
                code = '000001'
            }
            let stockInfo = { 'code': code, 'citiV1': citiV1, 'citiV2': citiV2 }
            redisUtil.redisHGet(config.redisStoreKey.xueQiuStockSet, code).then((stockJson) => {
                if (stockJson) {
                    let temp = JSON.parse(stockJson)
                    stockInfo['low'] = temp['low']
                }
                return stockInfo
            }).then((stockInfo) => {
                return redisUtil.redisHSet(config.redisStoreKey.xueQiuStockSet, code, JSON.stringify(stockInfo))
            }).then((val) => { console.log(val) }).catch((val) => {
                console.log(val)
            })
        })

    },
    handleStep2() {
        const rl1 = readline.createInterface({
            input: fs.createReadStream('/tmp/1J.txt'),
            crlfDelay: 100
        });
        //处理一级二级行业
        rl1.on('line', (line) => {
            line = line.replace(/\"/g, "")
            redisUtil.redisSadd(config.redisStoreKey.citic1V, line).then((val) => {
                console.log(val)
            })
        })
    },
    handleStep3() {
        const rl2 = readline.createInterface({
            input: fs.createReadStream('/tmp/2J.txt'),
            crlfDelay: 100
        });
        //处理一级二级行业
        rl2.on('line', (line) => {
            line = line.replace(/\"/g, "")
            redisUtil.redisSadd(config.redisStoreKey.citic2V, line).then((val) => {
                console.log(val)
            })
        })
    },

    /**
     * 处理代码跟股票名称
     */
    handleStep4() {
        const rl = readline.createInterface({
            input: fs.createReadStream('/tmp/name.txt'),
            crlfDelay: 100
        });
        //处理一级二级行业
        rl.on('line', (line) => {
            console.log(`Line from file: ${line}`)
            line = line.replace(/\"/g, "")
            let strs = line.split(',')
            let code = strs[0].substring(0, 6)
            let name = strs[1]
            if (code == "00000") {
                code = '000001'
            }
            //let stockInfo = { 'code': code, 'citiV1': citiV1, 'citiV2': citiV2 }
            redisUtil.redisHGet(config.redisStoreKey.xueQiuStockSet, code).then((stockJson) => {
                let stockInfo = { 'code': code, 'name': name }
                if (stockJson) {
                    stockInfo = JSON.parse(stockJson)
                    stockInfo['name'] = name
                }
                return stockInfo
            }).then((stockInfo) => {
                return redisUtil.redisHSet(config.redisStoreKey.xueQiuStockSet, code, JSON.stringify(stockInfo))
            }).then((val) => { console.log(val) }).catch((val) => {
                console.log(val)
            })
        })

    }



}
const secureConfig = require('./secureConfig')
const config = {

    lixingren: {
        indexUrl: 'https://www.lixinger.com/api/open/a/indice/fundamental-info',
        token: secureConfig.lxrToken,
        indexRetPara: ['pe_ttm', 'pb', 'dividend_r'], //需要的返回值
        stockIndex: ['399550', '399395', '399998', '399393', '10002', '000015', '399005', '399006', '399673', '399812', '399971', '399975', '399986', '000827', '000905', '000922', '000925', '000978', '000991', '10001', '10002', '000300'] //需要请求的指数
    },
    qieman: {
        indexUrl: 'https://qieman.com/idx-eval',
        stockIndex: ['CSPSADRP.CI', 'HSI.HI', 'HSCEI.HI', '950090.SH', 'SPX.GI', '930782.CSI', 'NDX.GI']
    },
    redis: {
        port: 6379,
        host: 'localhost',
        keyPrefix: 'myfintech-',
        password: secureConfig.redisPasswd
    },
    redisStoreKey: {
        lxrIndexKey: 'lxrIndex',
        lxrIndexDealDateKey: 'lxrIndexDealDate',
        lxrIndexDataAll: 'lxrIndexDataAll',
        qmIndexDealDateKey: 'qmIndexDealDate',
        qmIndexDataAll: 'qmIndexDataAll',
    },
    logConfig: {
        name: 'myfintech-datacenter'
    }
}

module.exports = config
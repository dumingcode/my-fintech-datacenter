const secureConfig = require('./secureConfig')
const config = {

    lixingren: {
        indexUrl: 'https://open.lixinger.com/api/a/indice/fundamental',
        token: secureConfig.lxrToken,
        indexRetPara: ['pe_ttm.y_10.weightedAvg', 'pb.y_10.weightedAvg'], //需要的返回值
        stockIndex: ['399550', '399395', '399998', '399393', '10002', '000015', '399005', '399006', '399673', '399812', '399971', '399975', '399986', '000827', '000905', '000922', '000925', '000978', '000991', '10001', '10002', '000300', '399701','000978','000991','000932'] //需要请求的指数
    },
    qieman: {
        indexUrl: 'https://qieman.com/idx-eval',
        stockIndex: ['CSPSADRP.CI', 'HSI.HI', 'HSCEI.HI', '950090.SH', 'SPX.GI', '930782.CSI', 'NDX.GI']
    },
    xiciDaiLi: {
        proxyArrLength: 5
    },
    dax30:{
        indexUrl: 'https://www.etf.com/DAX#overview',
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
        xueQiuStockSet: 'xueQiuStockSet',
        xiCiProxyList: 'xiCiProxyList',
        citic1V: 'citic1V',
        citic2V: 'citic2V',
        daxIndexDealDateKey: 'daxIndexDealDateKey',
    },
    logConfig: {
        name: 'myfintech-datacenter'
    },
    mongoDb: {
        url: 'mongodb://localhost:27017'
    },
    dailyStockBatchNum: 30,
    dailyBackDays: 260 //历史回溯天数(交易日)
}

module.exports = config
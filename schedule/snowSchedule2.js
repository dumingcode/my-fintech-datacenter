var schedule = require('node-schedule');
const xueQiuStockService = require('../service/xueQiuStockService')
const log = require('../util/logUtil')
const logUtil = log.logUtil


//雪球网抓取
schedule.scheduleJob('53 23 * * *', xueQiuStockService.lauchXueQiuStockTask(2).then((val) => {
    logUtil.info({ val }, 'lauchXueQiuStockTask success')
}).catch((err) => {
    logUtil.error(err)
}))
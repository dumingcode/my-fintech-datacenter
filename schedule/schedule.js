var schedule = require('node-schedule');
const lxrStockIndexTask = require('../service/lxrIndexService')
const qmStockIndexTask = require('../service/qiemanIndexService')
const stockDailyTask = require('../service/stockDailyDataService')
const DAXIndexService = require('../service/DAXIndexService')

const log = require('../util/logUtil')
const logUtil = log.logUtil

/**理性人指数数据自动处理任务 */
schedule.scheduleJob('43 21-23 * * *', lxrStockIndexTask.lauchLxrIndexTask().then((val) => {
    logUtil.info({ val }, 'lauchLxrIndexTask success')
}).catch((err) => {
    logUtil.error(err)
}))

//抓取且慢的数据
schedule.scheduleJob('31 20-23 * * *', qmStockIndexTask.lauchQiemanIndexTask().then((val) => {
    logUtil.info({ val }, 'lauchQiemanIndexTask success')
}).catch((err) => {
    logUtil.error(err)
}))

//抓DAX数据
schedule.scheduleJob('31 07-11 * * *', DAXIndexService.lauchDAXIndexTask().then((val) => {
    logUtil.info({ val }, 'DAXIndexService success')
}).catch((err) => {
    logUtil.error(err)
}))


//每日允许抓取股票历史价格数据
schedule.scheduleJob('13 16 * * *', stockDailyTask.launchStockDailyDataTask().then((val) => {
    logUtil.info({ val }, 'launchStockDailyDataTask success')
}).catch((err) => {
    logUtil.error(err)
}))
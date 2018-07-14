var schedule = require('node-schedule');
const lxrStockIndexTask = require('../service/lxrIndexService')
const qmStockIndexTask = require('../service/qiemanIndexService')
const xiCiDailiService = require('../service/xiCiDailiService')
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


//抓取proxy的数据
schedule.scheduleJob('*/10 * * * *', xiCiDailiService.lauchXiciTask().then((val) => {
    logUtil.info({ val }, 'lauchXiciTask success')
}).catch((err) => {
    logUtil.error(err)
}))
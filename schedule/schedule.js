var schedule = require('node-schedule')
const lxrStockIndexTask = require('../service/lxrIndexService')
const qmStockIndexTask = require('../service/qiemanIndexService')
const houseDealTask = require('../service/houseDealService')

const log = require('../util/logUtil')
const logUtil = log.logUtil

/** 理性人指数数据自动处理任务 */
schedule.scheduleJob('13 17-21 * * *', lxrStockIndexTask.lauchLxrIndexTask().then((val) => {
  logUtil.info({ val }, 'lauchLxrIndexTask success')
}).catch((err) => {
  logUtil.error(err)
}))

// 抓取且慢的数据
schedule.scheduleJob('31 01-07 * * *', qmStockIndexTask.lauchQiemanIndexTask().then((val) => {
  logUtil.info({ val }, 'lauchQiemanIndexTask success')
}).catch((err) => {
  logUtil.error(err)
}))

// 抓住建委的数据
schedule.scheduleJob('43 02-05 * * *', houseDealTask.lauchHouseDailyDealTask().then((val) => {
  logUtil.info({ val }, 'lauchHouseDailyDealTask success')
}).catch((err) => {
  logUtil.error(err)
}))

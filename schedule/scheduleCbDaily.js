var schedule = require('node-schedule')
const cbDailyTask = require('../service/cbondHisDataDailyRefreshService')
const log = require('../util/logUtil')
const logUtil = log.logUtil

// 改成每天跑一次同步20天内的转债交易价格
schedule.scheduleJob('13 16,18,22,06 * * *', cbDailyTask.launchCbondHisDataDailyTask().then((val) => {
  logUtil.info({ val }, 'launchCbondHisDataDailyTask success')
}).catch((err) => {
  logUtil.error(err)
}))

var schedule = require('node-schedule');
const lxrStockIndexTask = require('../service/lxrIndexService')
const log = require('../util/logUtil')
const logUtil = log.logUtil

/**理性人指数数据自动处理任务 */
schedule.scheduleJob('40 5-10 * * *', lxrStockIndexTask.lauchLxrIndexTask().then((val) => {
    logUtil.info({ val }, 'lauchLxrIndexTask success')
}).catch((err) => {
    logUtil.error(err)
}))
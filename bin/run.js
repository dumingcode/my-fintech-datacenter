const lxrStockIndexTask = require('../service/lxrIndexService')
const qiemanIndexService = require('../service/qiemanIndexService')

const log = require('../util/logUtil')
const logUtil = log.logUtil

/**理性人指数数据自动处理任务 */
lxrStockIndexTask.lauchLxrIndexTask().then((val) => {
    logUtil.info({ val }, 'lauchLxrIndexTask success')
}).catch((err) => {
    logUtil.error(err)
})

/**且慢抓取数据 */
qiemanIndexService.lauchQiemanIndexTask().then((val) => {
    logUtil.info({ val }, 'lauchQiemanIndexTask success')
}).catch((err) => {
    logUtil.error(err)
})
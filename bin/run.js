const lxrStockIndexTask = require('../service/lxrIndexService')
const qiemanIndexService = require('../service/qiemanIndexService')
const mornStarFundTask = require('../service/fund/mornStarFundService')

const log = require('../util/logUtil')
const logUtil = log.logUtil


mornStarFundTask.lauchMornStartFundTask().then((val) => {
  logUtil.info({ val }, 'mornStarFundTask success')
}).catch((err) => {
  logUtil.error(err)
})

// /** 理性人指数数据自动处理任务 */
// lxrStockIndexTask.lauchLxrIndexTask().then((val) => {
//   logUtil.info({ val }, 'lauchLxrIndexTask success')
// }).catch((err) => {
//   logUtil.error(err)
// })

// /** 且慢抓取数据 */
// qiemanIndexService.lauchQiemanIndexTask().then((val) => {
//   logUtil.info({ val }, 'lauchQiemanIndexTask success')
// }).catch((err) => {
//   logUtil.error(err)
// })

const xiCiDailiService = require('../service/xiCiDailiService')


const log = require('../util/logUtil')
const logUtil = log.logUtil

/**理性人指数数据自动处理任务 */
xiCiDailiService.lauchXiciTask().then((val) => {
    logUtil.info({ val }, 'lauchXiciTask success')
}).catch((err) => {
    logUtil.error(err)
})


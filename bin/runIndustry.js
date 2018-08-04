const industryService = require('../service/process/industryService')


const log = require('../util/logUtil')
const logUtil = log.logUtil

/**理性人指数数据自动处理任务 */
industryService.launchIndustryTask().then((val) => {
    logUtil.info({ val }, 'industryService  success')
}).catch((err) => {
    logUtil.error(err)
})
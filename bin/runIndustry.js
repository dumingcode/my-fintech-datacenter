const industryService = require('../service/process/industryService')


const log = require('../util/logUtil')
const logUtil = log.logUtil

/**执行行业数据获取任务 */
industryService.launchIndustryTask().then((val) => {
    logUtil.info({ val }, 'industryService  success')
}).catch((err) => {
    logUtil.error(err)
})
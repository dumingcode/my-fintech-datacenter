const DAXIndexService = require('../service/DAXIndexService')

const log = require('../util/logUtil')
const logUtil = log.logUtil

DAXIndexService.lauchDAXIndexTask().then((val) => {
    logUtil.info({ val }, 'lauchDAXIndexTask success')
}).catch((err) => {
    logUtil.error(err)
})

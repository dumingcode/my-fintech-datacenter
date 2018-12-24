const ElectricalCarService = require('../service/ElectricalCarService')

const log = require('../util/logUtil')
const logUtil = log.logUtil

ElectricalCarService.launchElecCarTask().then((val) => {
    logUtil.info({ val }, 'launchElecCarTask success')
}).catch((err) => {
    logUtil.error(err)
})

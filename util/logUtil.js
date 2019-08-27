var bunyan = require('bunyan')
const config = require('../config/config')

var logUtil = bunyan.createLogger({ name: config.logConfig.name })

module.exports = { logUtil }

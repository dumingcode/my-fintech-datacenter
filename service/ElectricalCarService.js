const redisUtil = require('../util/redisUtil')
const config = require('../config/config')
const puppeteer = require('puppeteer');
const http = require('../util/http')

module.exports = {
    async launchElecCarTask() {
        console.log('lauchElecCarTask')
        let daxData = await this.queryElecCarData()
        console.log(daxData);
        return { status: 200, message: 'OK' }
    },

    async queryElecCarData() {
        let content = null
        try {
            content = await http.post('http://www.echargenet.com/portal/station/chargers?callback=jQuery191038364984830691706_1544747065175', { id: 'fvCv8+Cx93DjuonCJ/9RnZYBZ0DZZkMFbVl67Xfb9jg=' }, false)
        } catch (err) {
            console.log(err)
            return content
        }
        return content
    }
}
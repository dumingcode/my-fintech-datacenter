const http = require('../util/http')

module.exports = {
    //查询网易股票API
    queryWyStockApi(url, data) { return http.get(url, data, false) },
    //查询凤凰财经前复权股票历史数据
    queryifengStockHisApi(code) {
        let queryCode = ''
        if (code.indexOf('6') == 0) {
            queryCode = `sh${code}`
        } else {
            queryCode = `sz${code}`
        }
        url = `http://api.finance.ifeng.com/akdaily/?code=${queryCode}&type=last`
        return http.get(url, null, false)
    }
}
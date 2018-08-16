const http = require('../util/http')

module.exports = {
    //查询网易股票API
    queryWyStockApi(url, data) { return http.get(url, data) },
    //查询凤凰财经前复权股票历史数据
    queryifengStockHisApi(code) {
        let queryCode = ''
        if (code.indexOf('6') == 0) {
            queryCode = `sh${code}`
        } else {
            queryCode = `sz${code}`
        }
        url = `http://api.finance.ifeng.com/akdaily/?code=${queryCode}&type=fq`
        return http.get(url, null)
    },
    //查询腾讯财经前复权股票历史数据
    queryTTStockHisApi(code, day) {
        let random = Math.random()
        url = `http://web.ifzq.gtimg.cn/appstock/app/fqkline/get?param=${code},day,,,${day},qfq&r=${random}`
        return http.get(url, null)
    },
    //查询滚需求每日收盘后的数据-批量查询
    queryGunXueQiuStockDayApi(codes) {
        url = `https://gunxueqiu.site/api/bigdata/querySinaStockGet.json?codes=${codes}`
        return http.get(url, null)
    }
}
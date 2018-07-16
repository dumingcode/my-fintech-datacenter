const http = require('../util/http')

module.exports = {
    //查询网易股票API
    queryWyStockApi(url, data) { return http.get(url, data, false) }


}
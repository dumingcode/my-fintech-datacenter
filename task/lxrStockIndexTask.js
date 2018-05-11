const axios = require('axios')
const config = require('../config/config')


//抓取理性人指数数据
let fetchLXRIndexDataTask = () => {
    return axios.post(config.lixingren.indexUrl, {
            token: config.lixingren.token,
            stockCodes: config.lixingren.stockIndex,
            metrics: config.lixingren.indexRetPara
        })
        .then(function(response) {
            return response
        })
        .catch(function(error) {
            console.log(error)
            return error
        });


}


module.exports = { fetchLXRIndexDataTask }
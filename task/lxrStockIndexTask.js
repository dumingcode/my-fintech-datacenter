const axios = require('axios')
const config = require('../config/config')


//抓取理性人指数数据
let fetchLXRIndexDataTask = () => {
    axios.post(config.lixingren.indexUrl, {
            token: config.lixingren.token,
            stockCodes: config.lixingren.stockIndex,
            metrics: config.lixingren.indexRetPara
        })
        .then(function(response) {
            console.log(response)
                //return response
        })
        .catch(function(error) {
            console.log(error)
        });


}


module.exports = { fetchLXRIndexDataTask }
const axios = require('axios')
const qs = require('qs')

const baseUrl = ''
axios.defaults.timeout = 60000
axios.defaults.withCredentials = true
const whiteList = ['/login', '/create', '/forget', '/changePass', '/locking']



function checkStatus(response) {
    // loading
    if (response && (response.status === 200 || response.status === 304 || response.status === 400)) {
        return response
    }
    return {
        status: 404,
        msg: '网络异常'
    }
}

function checkCode(res) {
    if (res.status === 404) {
        return false
    }
    // if (res.data && (!res.data.success)) {
    //   alert(res.data.error_msg)
    // }
    return res
}

module.exports = {
    post(url, data, contentType = true) {
        let ct = ''
        if (contentType) {
            ct = 'application/x-www-form-urlencoded'
            data = qs.stringify(data)
        } else {
            ct = 'application/json'
        }
        return axios({
            headers: {
                'Content-Type': ct
            },
            method: 'post',
            baseURL: baseUrl,
            url,
            data
        }).then((response) => {
            return checkStatus(response)
        }).then((res) => {
            return checkCode(res)
        }).catch(error => console.log(error))
    },
    put(url, data, contentType = true) {
        let ct = ''
        if (contentType) {
            ct = 'application/x-www-form-urlencoded'
            data = qs.stringify(data)
        } else {
            ct = 'application/json'
        }
        return axios({
            headers: {
                'Content-Type': ct
            },
            method: 'put',
            baseURL: baseUrl,
            url,
            data
        }).then((response) => {
            return checkStatus(response)
        }).then((res) => {
            return checkCode(res)
        }).catch(error => console.log(error))
    },
    get(url = '', _responseType = 'json') {
        // if (process.env.NODE_ENV === 'demo') url = baseUrl + url + '.json'
        return axios({
            method: 'get',
            baseURL: baseUrl,
            url,
            responseType: _responseType
        }).then((response) => {
            return checkStatus(response)
        }).then((res) => {
            return checkCode(res)
        }).catch(error => console.log(error))
    }
}
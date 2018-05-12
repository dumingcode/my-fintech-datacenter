const chai = require('chai')
const expect = chai.expect

const lxrIndexService = require('../service/lxrIndexService')
const config = require('../config/config')

describe('#lxrStockIndexTask()-验证理性人指数数据是否抓取成功，数据是否存储到redis中', function() {
    it('lxrStockIndexTask ret right data',  function() {
        return lxrIndexService.lauchLxrIndexTask().then((indexData)=>{
            expect(indexData.status).to.be.equal(200)
            expect(indexData.message).to.be.equal('OK')
        })
    }); 
});
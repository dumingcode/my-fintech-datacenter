const chai = require('chai')
const expect = chai.expect

const lxrStockIndexTask = require('../task/lxrStockIndexTask')
const config = require('../config/config')

describe('#lxrStockIndexTask()-验证理性人指数数据是否抓取成功', function() {
    it('lxrStockIndexTask ret right data', async function() {
        const indexData = await lxrStockIndexTask.fetchLXRIndexDataTask()
        expect(indexData.status).to.be.equal(200)
        expect(indexData.statusText).to.be.equal('OK')
        expect(indexData.data).to.have.lengthOf(config.lixingren.stockIndex.length)

    });
});
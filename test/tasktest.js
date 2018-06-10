const chai = require('chai')
const expect = chai.expect

const lxrIndexService = require('../service/lxrIndexService')
const qmIndexService = require('../service/qiemanIndexService')
const config = require('../config/config')


describe('#lxr', () => {
    it('#lxrStockIndexTask ret right data', function(done) {
            (async function() {
                try {
                    let indexData = await lxrIndexService.lauchLxrIndexTask()
                    expect(indexData.status).to.be.equal(200)
                    expect(indexData.message).to.be.equal('OK')
                    done()
                } catch (err) {
                    done(err)
                }
            })()


        }),
        it('#qmIndexTask ret right data', function(done) {
            (async function() {
                try {
                    let indexData = await qmIndexService.lauchQiemanIndexTask()
                    expect(indexData.status).to.be.equal(200)
                    expect(indexData.message).to.be.equal('OK')
                    done()
                } catch (err) {
                    done(err)
                }
            })()


        })
})
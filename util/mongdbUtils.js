const MongoClient = require('mongodb').MongoClient
const config = require('../config/config')
const mongoDbConfig = config.mongoDb



module.exports = {
    async insertMany(dbName, collectionName, documents) {
        let client = await MongoClient.connect(mongoDbConfig.url, { useNewUrlParser: true })
        let db = await client.db(dbName)
        let col = await db.collection(collectionName)
        let result = await col.insertMany(documents, { ordered: false })
        await client.close()
        return result
    }
}
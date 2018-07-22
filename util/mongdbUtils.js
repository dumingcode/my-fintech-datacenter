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
    },
    async queryCollectionCount(dbName, collectionName, query) {
        let client = await MongoClient.connect(mongoDbConfig.url, { useNewUrlParser: true })
        let db = await client.db(dbName)
        let col = await db.collection(collectionName)
        let result = await col.find(query).count()
        await client.close()
        return result
    },
    async insertOne(dbName, collectionName, document) {
        let client = await MongoClient.connect(mongoDbConfig.url, { useNewUrlParser: true })
        let db = await client.db(dbName)
        let col = await db.collection(collectionName)
        let result = await col.insertOne(document)
        await client.close()
        return result
    }

}
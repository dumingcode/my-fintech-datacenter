const MongoClient = require('mongodb').MongoClient
const ReadPreference = require('mongodb').ReadPreference
const config = require('../config/config')
const mongoDbConfig = config.mongoDb



module.exports = {
    async insertMany(dbName, collectionName, documents) {
        let client = await MongoClient.connect(mongoDbConfig.url, { useNewUrlParser: true ,readPreference: ReadPreference.PRIMARY})
        let db = await client.db(dbName)
        let col = await db.collection(collectionName)
        let result = await col.insertMany(documents, { ordered: false })
        await client.close(true)
        return result
    },
    async queryCollectionCount(dbName, collectionName, query) {
        let client = await MongoClient.connect(mongoDbConfig.url, { useNewUrlParser: true ,readPreference: ReadPreference.PRIMARY})
        let db = await client.db(dbName)
        let col = await db.collection(collectionName)
        let result = await col.find(query).count()
        await client.close(true)
        return result
    },
    async insertOne(dbName, collectionName, document) {
        let client = await MongoClient.connect(mongoDbConfig.url, { useNewUrlParser: true ,readPreference: ReadPreference.PRIMARY})
        let db = await client.db(dbName)
        let col = await db.collection(collectionName)
        let result = await col.insertOne(document)
        await client.close(true)
        return result
    },
    async updateOne(dbName, collectionName, filter, document, upsertVal = true) {
        let client = await MongoClient.connect(mongoDbConfig.url, { useNewUrlParser: true ,readPreference: ReadPreference.PRIMARY})
        let db = await client.db(dbName)
        let col = await db.collection(collectionName)
        let result = await col.updateOne(filter, { $set: document }, { upsert: upsertVal })
        await client.close(true)
        return result
    },
    //查询52周最低价
    async queryMinLowPrice(dbName, collectionName, code, date) {
        let client = await MongoClient.connect(mongoDbConfig.url, { useNewUrlParser: true ,readPreference: ReadPreference.PRIMARY})
        let db = await client.db(dbName)
        let col = await db.collection(collectionName)
        let query = [{
            '$match': { 'code': code, 'date': { '$gt': date } }
        },
        {
            '$group': { '_id': 'min', min_value: { '$min': '$low' } }
        }
        ]
        let result = await col.aggregate(query)
        let arr = await result.toArray()
        await client.close(true)
        return arr
    },
    //根据检索条件检索满足条件的股票价格
    async queryStockPrice(dbName, collectionName, query, option) {
        let client = await MongoClient.connect(mongoDbConfig.url, { useNewUrlParser: true ,readPreference: ReadPreference.PRIMARY})
        let db = await client.db(dbName)
        let col = await db.collection(collectionName)
        let result = await col.find(query, option)
        let arr = await result.toArray()
        await client.close(true)
        return arr
    },
    //查询一年内的价格数据
    async queryStockYearPrice(dbName, collectionName, code, date) {
        let client = await MongoClient.connect(mongoDbConfig.url, { useNewUrlParser: true ,readPreference: ReadPreference.PRIMARY})
        let db = await client.db(dbName)
        let col = await db.collection(collectionName)
        let query = [{
                '$match': { 'code': code, 'date': { '$gt': date } }
            }
        ]
        let result = await col.find(query).sort( { date: 1 } )
        await client.close(true)
        return result.toArray()
    }

}
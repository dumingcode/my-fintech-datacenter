const MongoClient = require('mongodb').MongoClient
const ReadPreference = require('mongodb').ReadPreference
const config = require('../config/config')
const mongoDbConfig = config.mongoDb

module.exports = {
  async insertMany (dbName, collectionName, documents) {
    const client = await MongoClient.connect(mongoDbConfig.url, { useNewUrlParser: true, readPreference: ReadPreference.PRIMARY })
    const db = await client.db(dbName)
    const col = await db.collection(collectionName)
    const result = await col.insertMany(documents, { ordered: false })
    await client.close(true)
    return result
  },
  async queryCollectionCount (dbName, collectionName, query) {
    const client = await MongoClient.connect(mongoDbConfig.url, { useNewUrlParser: true, readPreference: ReadPreference.PRIMARY })
    const db = await client.db(dbName)
    const col = await db.collection(collectionName)
    const result = await col.find(query).count()
    await client.close(true)
    return result
  },
  async insertOne (dbName, collectionName, document) {
    const client = await MongoClient.connect(mongoDbConfig.url, { useNewUrlParser: true })
    const db = await client.db(dbName)
    const col = await db.collection(collectionName)
    const result = await col.insertOne(document)
    await client.close(true)
    return result
  },
  async updateOne (dbName, collectionName, filter, document, upsertVal = true) {
    const client = await MongoClient.connect(mongoDbConfig.url, { useNewUrlParser: true })
    const db = await client.db(dbName)
    const col = await db.collection(collectionName)
    const result = await col.updateOne(filter, { $set: document }, { upsert: upsertVal })
    await client.close(true)
    return result
  },
  // 查询52周最低价
  async queryMinLowPrice (dbName, collectionName, code, date) {
    const client = await MongoClient.connect(mongoDbConfig.url, { useNewUrlParser: true })
    const db = await client.db(dbName)
    const col = await db.collection(collectionName)
    const query = [{
      $match: { code: code, date: { $gt: date } }
    },
    {
      $group: { _id: 'min', min_value: { $min: '$low' } }
    }
    ]
    const result = await col.aggregate(query)
    const arr = await result.toArray()
    await client.close(true)
    return arr
  },
  // 根据检索条件检索满足条件的股票价格
  async queryStockPrice (dbName, collectionName, query, option) {
    const client = await MongoClient.connect(mongoDbConfig.url, { useNewUrlParser: true })
    const db = await client.db(dbName)
    const col = await db.collection(collectionName)
    const result = await col.find(query, option)
    const arr = await result.toArray()
    await client.close(true)
    return arr
  },
  // 查询一年内的价格数据
  async queryStockYearPrice (dbName, collectionName, code, date) {
    const client = await MongoClient.connect(mongoDbConfig.url, { useNewUrlParser: true, readPreference: ReadPreference.PRIMARY })
    const db = await client.db(dbName)
    const col = await db.collection(collectionName)
    const query = [{
      $match: { code: code, date: { $gt: date } }
    }
    ]
    const result = await col.find(query).sort({ date: 1 })
    await client.close(true)
    return result.toArray()
  }

}

var Redis = require('ioredis')
const config = require('../config/config')
const redisConfig = config.redis

module.exports = {
    async redisHSet(key, field, value) {
        let redis = new Redis(redisConfig)
        let authPromise = await redis.auth(redisConfig.password)
        let result = await redis.hset(key, field, value)
        return result
    },
    async redisHGet(key, field) {
        let redis = new Redis(redisConfig)
        let authPromise = await redis.auth(redisConfig.password)
        let result = await redis.hget(key,field)
        return result
    },
    async redisSet(key, value) {
        let redis = new Redis(redisConfig)
        let authPromise = await redis.auth(redisConfig.password)
        let result = await redis.set(key, field)
        return result
    },
    async redisGet(key) {
        let redis = new Redis(redisConfig)
        let authPromise = await redis.auth(redisConfig.password)
        let result = await redis.get(key)
        return result
    },
    async redisLpush(key, value) {
        let redis = new Redis(redisConfig)
        let authPromise = await redis.auth(redisConfig.password)
        let result = await redis.lpush(key, value)
        return result
    },
    async redisLindex(key, index) {
        let redis = new Redis(redisConfig)
        let authPromise = await redis.auth(redisConfig.password)
        let result = await redis.lindex(key, index)
        return result
    },
    async redisLTrim(key, start, end) {
        let redis = new Redis(redisConfig)
        let authPromise = await redis.auth(redisConfig.password)
        let result = await redis.ltrim(key, start, end)
        return result
    }
}
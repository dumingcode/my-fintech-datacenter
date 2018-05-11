var Redis = require('ioredis')
const config = require('../config/config')
const redisConfig = config.redis

module.exports = {
    redisHSet(key, field, value) {
        let redis = new Redis(redisConfig)
        return redis.hset(key, field, value)
    },

    redisSet(key, value) {
        let redis = new Redis(redisConfig)
        return redis.set(key, value)
    },
    redisGet(key, value) {
        let redis = new Redis(redisConfig)
        return redis.get(key)
    }
}
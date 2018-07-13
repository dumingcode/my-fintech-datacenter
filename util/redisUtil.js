var Redis = require('ioredis')
const config = require('../config/config')
const redisConfig = config.redis

module.exports = {
    redisHSet(key, field, value) {
        let redis = new Redis(redisConfig)
        redis.auth(redisConfig.password).then(() => {
            return redis.hset(key, field, value)
        }).catch((err) => {
            console.log(err)
        })
    },
    redisHGet(key, field) {
        let redis = new Redis(redisConfig)
        redis.auth(redisConfig.password).then(() => {
            return redis.hget(key, field)
        }).catch((err) => {
            console.log(err)
        })
    },
    redisSet(key, value) {
        let redis = new Redis(redisConfig)
        redis.auth(redisConfig.password).then(() => {
            return redis.set(key, value)
        }).catch((err) => {
            console.log(err)
        })

    },
    async redisGet(key) {
        let redis = new Redis(redisConfig)
        let authPromise = await redis.auth(redisConfig.password)
        let result = await redis.get(key)
        return result
    }
}
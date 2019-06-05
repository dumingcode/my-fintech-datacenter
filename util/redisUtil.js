var Redis = require('ioredis')
const config = require('../config/config')
const redisConfig = config.redis

module.exports = {
    async redisHSet(key, field, value) {
        let redis = new Redis(redisConfig)
        let result = await redis.hset(key, field, value)
        await redis.disconnect()
        return result
    },
    async redisHGet(key, field) {
        let redis = new Redis(redisConfig)
        let result = await redis.hget(key, field)
        await redis.disconnect()
        return result
    },
    async redisSet(key, value) {
        let redis = new Redis(redisConfig)
        let result = await redis.set(key, value)
        await redis.disconnect()
        return result
    },
    async redisGet(key) {
        let redis = new Redis(redisConfig)
        let result = await redis.get(key)
        await redis.disconnect()
        return result
    },
    async redisLpush(key, value) {
        let redis = new Redis(redisConfig)
        let result = await redis.lpush(key, value)
        await redis.disconnect()
        return result
    },
    async redisLindex(key, index) {
        let redis = new Redis(redisConfig)
        let result = await redis.lindex(key, index)
        await redis.disconnect()
        return result
    },
    async redisLTrim(key, start, end) {
        let redis = new Redis(redisConfig)
        let result = await redis.ltrim(key, start, end)
        await redis.disconnect()
        return result
    },
    async redisSadd(key, value) {
        let redis = new Redis(redisConfig)
        let result = await redis.sadd(key, value)
        await redis.disconnect()
        return result
    },
    redisSmembers(key) {
        let redis = new Redis(redisConfig)
        return redis.smembers(key).then((val) => {
            return val
        }).then((val)=>{
            redis.disconnect()
            return val
        }).catch((err) => {
            console.log(err)
            return null
        })
    }
}
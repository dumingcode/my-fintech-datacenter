var Redis = require('ioredis')
const config = require('../config/config')
const redisConfig = config.redis

module.exports = {
  async redisHSet (key, field, value) {
    const redis = new Redis(redisConfig)
    const result = await redis.hset(key, field, value)
    await redis.disconnect()
    return result
  },
  async redisHGet (key, field) {
    const redis = new Redis(redisConfig)
    const result = await redis.hget(key, field)
    await redis.disconnect()
    return result
  },
  async redisSet (key, value) {
    const redis = new Redis(redisConfig)
    const result = await redis.set(key, value)
    await redis.disconnect()
    return result
  },
  async redisGet (key) {
    const redis = new Redis(redisConfig)
    const result = await redis.get(key)
    await redis.disconnect()
    return result
  },
  async redisLpush (key, value) {
    const redis = new Redis(redisConfig)
    const result = await redis.lpush(key, value)
    await redis.disconnect()
    return result
  },
  async redisLindex (key, index) {
    const redis = new Redis(redisConfig)
    const result = await redis.lindex(key, index)
    await redis.disconnect()
    return result
  },
  async redisLTrim (key, start, end) {
    const redis = new Redis(redisConfig)
    const result = await redis.ltrim(key, start, end)
    await redis.disconnect()
    return result
  },
  async redisSadd (key, value) {
    const redis = new Redis(redisConfig)
    const result = await redis.sadd(key, value)
    await redis.disconnect()
    return result
  },
  redisSmembers (key) {
    const redis = new Redis(redisConfig)
    return redis
      .smembers(key)
      .then(val => {
        return val
      })
      .then(val => {
        redis.disconnect()
        return val
      })
      .catch(err => {
        console.log(err)
        return null
      })
  }
}

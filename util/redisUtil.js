var Redis = require('ioredis')
const config = require('../config/config')
const redisConfig = config.redis

module.exports = {
    redisHSet(key, field, value) {
        let redis = new Redis(redisConfig)
        redis.auth(redisConfig.password).then(()=>{
            return redis.hset(key, field, value)
         }).catch((err)=>{
            console.log(err)
         })
    },
    redisHGet(key, field, value) {
        let redis = new Redis(redisConfig)
        redis.auth(redisConfig.password).then(()=>{
            return redis.hget(key, field)
         }).catch((err)=>{
            console.log(err)
         })
    },
    redisSet(key, value) {
        let redis = new Redis(redisConfig)
        redis.auth(redisConfig.password).then(()=>{
            return redis.set(key, value)
         }).catch((err)=>{
            console.log(err)
         })
        
    },
    redisGet(key, value) {
        let redis = new Redis(redisConfig)
         redis.auth(redisConfig.password).then(()=>{
            return redis.get(key)
         }).catch((err)=>{
            console.log(err)
         })
        
    }
}
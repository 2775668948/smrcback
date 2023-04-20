

// redis相关操作类
// Path: redis.js
// Compare this snippet from tool.js:
//
//
// 连接redis
const redis = require('ioredis');
const Config = require("./config/config")
const client = redis.createClient(Config.redisConfig.port, Config.redisConfig.host);

// 存放验证码
const setCode = (email, code) => {
    client.set(email, code, 'EX', 60 * 1);
}

// 获取验证码
const getCode = (email) => {

    return new Promise((resolve, reject) => {
        client.get(email, (err, res) => {
            if (err) {
                reject(err);
            } else {
                resolve(res);
            }
        })
    })
}

// 删除验证码
const delCode = (email) => {
    client.del(email);
}

// 存放token 12个小时过期
const setToken = (token, email) => {
    client.set(token, email, 'EX', 60 * 60 * 12);
}


// 将函数暴露出去
module.exports = {
    setCode,
    getCode,
    delCode,
    setToken
}
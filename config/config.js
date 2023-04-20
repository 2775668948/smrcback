// 数据库db设置
const sqlConfig = {
    host: '47.106.159.110',
    user: 'root',
    password: '123456',
    database: 'smrclast',
    port: 54001,
    dialect: "mysql"
}

// redis设置
const redisConfig = {
    host: "47.106.159.110",
    port: 54002
}

// 邮箱的发送设置
const emailConfig = {
    user: "2775668948@qq.com",
    pass: "cksylucmadtvddea"
}

// AES 加密key的设置
const AesDecryptConfig = {
    key: "cxm953368"
}

module.exports = {
    sqlConfig,
    redisConfig,
    emailConfig,
    AesDecryptConfig
}
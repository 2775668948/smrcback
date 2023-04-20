// db 操作相关
const Sequelize = require('sequelize')

const Config = require("../config/config")

const sequelize = new Sequelize(Config.sqlConfig.database, Config.sqlConfig.user, Config.sqlConfig.password, {
    logging: (sql) => {
        // 打印sql方便调试
        console.log(sql)
    },
    port: Config.sqlConfig.port,
    host: Config.sqlConfig.host,
    dialect: Config.sqlConfig.dialect,
    dialectOptions: {
        dateStrings: true,
        typeCast: true
    },
    pool: {
        max: 20,
        min: 1,
        acquire: 60000,
        idle: 10000
    },
    timezone: '+08:00' // 解决时间显示问题
})

sequelize.sync({ force: false })
    .then(() => {
        console.log('init db ok')
    })
    .catch(err => {
        console.log('init db error', err)
    })

exports.sequelize = sequelize;
// 用户模型
const Sequelize = require('sequelize');
const { DataTypes } = require('sequelize');
const { sequelize } = require("../db")


const user = sequelize.define('user', {
    id: {
        type: Sequelize.BIGINT(20),
        primaryKey: true,
        allowNull: false,
        unique: true,
        autoIncrement: true
    },
    name: Sequelize.STRING(255), // 昵称
    password: Sequelize.STRING(255), // 密码
    phone: Sequelize.STRING(255), // 手机号
    email: Sequelize.STRING(255), // 邮箱
    avatar: Sequelize.STRING(255), // 头像
    resizeobserver: Sequelize.STRING(255), // 个性签名,
    // 性别
    // 0: 男
    // 1: 女
    // 2: 保密
    gender: Sequelize.INTEGER(1),
    //用户标识
    // 0: 患者
    // 1: 医生
    // 2: 管理员
    roleId: Sequelize.INTEGER(1),
    // 收藏的知识库文章数量
    collectNum: Sequelize.INTEGER(11),
    // 关注的医生数量
    followNum: Sequelize.INTEGER(11),
    // 粉丝数量，这是只有医生才有的
    fansNum: Sequelize.INTEGER(11),
    // 观看数量 这也是只有医生才有的
    watchNum: Sequelize.INTEGER(11),
    // 年龄
    age: Sequelize.INTEGER(11),
    // 诊断卡id 这是患者才有的
    diagnosticCardId: Sequelize.STRING(20),
    createdAt: DataTypes.DATE,
    updatedAt: DataTypes.DATE
}, {
    timestamps: false, // 不要默认时间戳 数据库没有时间戳字段时，设置为false，否则报错  SequelizeDatabaseError: Unknown column 'createdAt' in 'field list'
    freezeTableName: true
});

module.exports = user;
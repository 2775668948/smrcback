
// 康复视频表
const Sequelize = require('sequelize');
const { DataTypes } = require('sequelize');
const { sequelize } = require("../db")

const recoveryvideo = sequelize.define('recoveryvideo', {
    id: {
        type: Sequelize.BIGINT(20),
        primaryKey: true,
        allowNull: false,
        unique: true,
        autoIncrement: true
    },
    title: Sequelize.STRING(255), // 标题
    videoUrl: Sequelize.STRING(255), // 视频地址
    videoImg: Sequelize.STRING(255), // 视频封面
    videoDesc: Sequelize.STRING(255), // 视频描述
    videoType: Sequelize.INTEGER(1), // 视频类型
    // 0: 外科相关视频
    // 1: 内科相关视频
    // 2: 宣传视频
    // 3: 专家视频
    // 4: 专题视频
    // 5: 其他视频
    videoTime: Sequelize.STRING(255), // 视频时长
    videoSize: Sequelize.STRING(255), // 视频大小
    videoNum: Sequelize.INTEGER(11), // 视频播放量
    createdAt: DataTypes.DATE,
    updatedAt: DataTypes.DATE
}, {
    timestamps: false, // 不要默认时间戳 数据库没有时间戳字段时，设置为false，否则报错  SequelizeDatabaseError: Unknown column 'createdAt' in 'field list'
    freezeTableName: true
});

module.exports = recoveryvideo;



// 聊天记录表 这里默认只有患者和医生的聊天，不同患者之间只能通过回复医生来进行对话 不允许不同用户对话
const Sequelize = require('sequelize');
const { DataTypes } = require('sequelize');
const { sequelize } = require("../db")

const chatrecord = sequelize.define('chatrecord', {
    id: {
        type: Sequelize.BIGINT(20),
        primaryKey: true,
        allowNull: false,
        unique: true,
        autoIncrement: true
    },
    senderId: Sequelize.BIGINT(20), // 发送者id
    receiverId: Sequelize.BIGINT(20), // 接收者id
    content: Sequelize.TEXT(), // 聊天内容
    // 发送人姓名
    senderName: Sequelize.STRING(255), // 发送人姓名
    // 发送人的tag
    senderTag: Sequelize.STRING(255), // 发送人的tag
    // 发送人的头像
    senderAvatar: Sequelize.STRING(255), // 发送人的头像
    // 发送的图片地址
    senderImg: Sequelize.STRING(255), // 发送的图片地址
    type: Sequelize.INTEGER(1), // 聊天类型 0-文字，1-图片，2-语音，3-视频，4-文件
    status: Sequelize.INTEGER(1), // 聊天状态 0-未读，1-已读 2-已删除
    createdAt: DataTypes.DATE,
    updatedAt: DataTypes.DATE
}, {
    timestamps: false, // 不要默认时间戳 数据库没有时间戳字段时，设置为false，否则报错  SequelizeDatabaseError: Unknown column 'createdAt' in 'field list'
    freezeTableName: true
});

module.exports = chatrecord;

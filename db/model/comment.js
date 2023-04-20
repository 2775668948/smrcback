
// 评论表模型
const Sequelize = require('sequelize');
const { DataTypes } = require('sequelize');
const { sequelize } = require("../db")

const comment = sequelize.define('comment', {
    id: {
        type: Sequelize.BIGINT(20),
        primaryKey: true,
        allowNull: false,
        unique: true,
        autoIncrement: true
    },
    content: Sequelize.TEXT(), // 评论内容
    commentUserId: Sequelize.BIGINT(20), // 评论人id
    doctorId: Sequelize.BIGINT(20), // 医生id
    parentId: Sequelize.BIGINT(20), // 父评论id 所属评论id，主评论为null
    like: Sequelize.TEXT(), // 点赞数 点赞(存储点赞人id数组)
    status: Sequelize.INTEGER(1), // 评论状态 0-未审核，1-展现，2-审核驳回，3-已删除
    createdAt: DataTypes.DATE,
    updatedAt: DataTypes.DATE
}, {
    timestamps: false, // 不要默认时间戳 数据库没有时间戳字段时，设置为false，否则报错  SequelizeDatabaseError: Unknown column 'createdAt' in 'field list'
    freezeTableName: true
});

module.exports = comment;

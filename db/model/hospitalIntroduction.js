// 医院简介表
const Sequelize = require('sequelize');
const { DataTypes } = require('sequelize');
const { sequelize } = require("../db")

const HospitalIntroduction = sequelize.define('hospitalIntroduction', {
    id: {
        type: Sequelize.BIGINT(20),
        primaryKey: true,
        allowNull: false,
        unique: true,
        autoIncrement: true
    },
    content: Sequelize.TEXT(), // 评论内容
    status: Sequelize.INTEGER(1), // 评论状态 0-未审核，1-展现，2-审核驳回，3-已删除
    createdAt: DataTypes.DATE,
    updatedAt: DataTypes.DATE
}, {
    timestamps: false, // 不要默认时间戳 数据库没有时间戳字段时，设置为false，否则报错  SequelizeDatabaseError: Unknown column 'createdAt' in 'field list'
    freezeTableName: true
});

module.exports = HospitalIntroduction;


// 用户拓展表
const Sequelize = require('sequelize');
const { DataTypes } = require('sequelize');
const { sequelize } = require("../db")

// 这便是患者拓展表
const patientexpand = sequelize.define('patientexpand', {
    id: {
        type: Sequelize.BIGINT(20),
        primaryKey: true,
        allowNull: false,
        unique: true,
        autoIncrement: true
    },
    userId: Sequelize.BIGINT(20), // 用户id
    // 是否看了医生, 0-未看, 1-看了
    isSeeDoctor: Sequelize.INTEGER(1), // 是否看了医生, 0-未看, 1-看了
    // 如果看了医生, 则记录医生id
    doctorId: Sequelize.BIGINT(20), // 如果看了医生, 则记录医生id
    // 如果看了医生, 则记录医生姓名
    doctorName: Sequelize.STRING(255), // 如果看了医生, 则记录医生姓名
    // 如果看了医生, 则记录医生头像
    doctorAvatar: Sequelize.STRING(255), // 如果看了医生, 则记录医生头像
    // 如果看了医生, 则记录医生职称
    doctorTitle: Sequelize.STRING(255), // 如果看了医生, 则记录医生职称
    // 如果看了医生, 则记录医生所在医院
    doctorHospital: Sequelize.STRING(255), // 如果看了医生, 则记录医生所在医院
    // 如果看了医生, 则记录医生所在科室
    doctorDepartment: Sequelize.STRING(255), // 如果看了医生, 则记录医生所在科室
    // 如果看了医生, 则记录医生所在科室id
    doctorDepartmentId: Sequelize.BIGINT(20), // 如果看了医生, 则记录医生所在科室id

    // 看了医生，那么就是预约了体检 0-未预约，1-预约了
    isAppointment: Sequelize.INTEGER(1), // 看了医生，那么就是预约了体检 0-未预约，1-预约了
    // 如果预约了体检, 则记录体检id
    appointmentId: Sequelize.BIGINT(20), // 如果预约了体检, 则记录体检id
    // 如果预约了体检, 则记录体检时间
    appointmentTime: Sequelize.STRING(255), // 如果预约了体检, 则记录体检时间
    // 如果预约了体检, 则记录体检地点
    appointmentAddress: Sequelize.STRING(255), // 如果预约了体检, 则记录体检地点
    // 体检完了体检结果表里的id
    appointmentResultId: Sequelize.BIGINT(20), // 体检完了体检结果表里的id
    // 体检完了就会有一个就诊记录id
    appointmentRecordId: Sequelize.BIGINT(20), // 体检完了就会有一个就诊记录id
    // 体检完了还会有一个治疗反馈的id
    appointmentFeedbackId: Sequelize.BIGINT(20), // 体检完了还会有一个治疗反馈的id
}, {
    timestamps: false, // 不要默认时间戳 数据库没有时间戳字段时，设置为false，否则报错  SequelizeDatabaseError: Unknown column 'createdAt' in 'field list'
    freezeTableName: true
});

module.exports = patientexpand;



// 医生预约表
const Sequelize = require('sequelize');
const { DataTypes } = require('sequelize');
const { sequelize } = require("../db")

const doctorsappointment = sequelize.define('doctorsappointment', {

    id: {
        type: Sequelize.BIGINT(20),
        primaryKey: true,
        allowNull: false,
        unique: true,
        autoIncrement: true
    },
    doctorId: Sequelize.BIGINT(20), // 医生id
    // 医生姓名
    doctorName: Sequelize.STRING(255), // 医生姓名
    // 医生科室
    doctorDepartment: Sequelize.STRING(255), // 医生科室
    // 医生照片地址
    doctorAvatar: Sequelize.STRING(255), // 医生照片地址
    patientId: Sequelize.BIGINT(20), // 患者id
    appointmentTime: Sequelize.STRING(255), // 预约时间
    // 预约状态 0-未预约，1-预约成功，2-预约失败
    appointmentStatus: Sequelize.INTEGER(1), // 预约状态 0-未预约，1-预约成功，2-预约失败
    // 预约失败原因
    appointmentFailReason: Sequelize.STRING(255), // 预约失败原因
    // 预约成功后的体检id
    appointmentId: Sequelize.BIGINT(20), // 预约成功后的体检id
    // 预约成功后的体检时间
    appointmentTime: Sequelize.STRING(255), // 预约成功后的体检时间
    // 预约成功后的体检地点
    appointmentAddress: Sequelize.STRING(255), // 预约成功后的体检地点
    // 体检完了体检结果表里的id
    appointmentResultId: Sequelize.BIGINT(20), // 体检完了体检结果表里的id
    // 体检完了就会有一个就诊记录id
    appointmentRecordId: Sequelize.BIGINT(20), // 体检完了就会有一个就诊记录id
    // 体检完了还会有一个治疗反馈的id
    appointmentFeedbackId: Sequelize.BIGINT(20), // 体检完了还会有一个治疗反馈的id
    // 空闲状态 0-空闲，1-忙碌
    freeStatus: Sequelize.INTEGER(1), // 空闲状态 0-空闲，1-忙碌
    // 是上午场的预约还是下午场的预约 0-上午，1-下午 上午的话统一可以预约的时间是 8:30 下午的话统一可以预约的时间是 14:30
    appointmentTimeType: Sequelize.INTEGER(1), // 是上午场的预约还是下午场的预约 0-上午，1-下午 上午的话统一可以预约的时间是 8:30 下午的话统一可以预约的时间是 14:30
    createdAt: DataTypes.DATE,
    updatedAt: DataTypes.DATE
}, {
    timestamps: false, // 不要默认时间戳 数据库没有时间戳字段时，设置为false，否则报错  SequelizeDatabaseError: Unknown column 'createdAt' in 'field list'
    freezeTableName: true
});

module.exports = doctorsappointment;

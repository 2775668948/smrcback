const Sequelize = require('sequelize');
const { DataTypes } = require('sequelize');
const { sequelize } = require("../db")

// 用户诊断结果模型

const diagnosticresult = sequelize.define('diagnosticresult', {
    id: {
        type: Sequelize.BIGINT(20),
        primaryKey: true,
        allowNull: false,
        unique: true,
        autoIncrement: true
    },
    userId: Sequelize.BIGINT(20), // 用户id
    // 诊断结果
    result: Sequelize.TEXT(), // 诊断结果
    // 诊断结果图片
    resultImg: Sequelize.STRING(255), // 诊断结果图片
    // 诊断结果视频
    resultVideo: Sequelize.STRING(255), // 诊断结果视频
    // 诊断结果文件
    resultFile: Sequelize.STRING(255), // 诊断结果文件
    // 诊断结果状态 0-未审核，1-展现，2-审核驳回，3-已删除
    status: Sequelize.INTEGER(1), // 诊断结果状态 0-未审核，1-展现，2-审核驳回，3-已删除
    // 用户诊断卡号
    cardNumber: Sequelize.STRING(255), // 用户诊断卡号
    // 用户主诉
    mainComplaint: Sequelize.TEXT(), // 用户主诉
    // 用户现病史
    presentIllness: Sequelize.TEXT(), // 用户现病史
    // 用户既往史
    pastHistory: Sequelize.TEXT(), // 用户既往史
    // 用户体格检查
    physicalExamination: Sequelize.TEXT(), // 用户体格检查
    // 用户初步检查
    preliminaryExamination: Sequelize.TEXT(), // 用户初步检查
    // 用户的诊疗意见
    diagnosisAndTreatment: Sequelize.TEXT(), // 用户的诊疗意见
    // 关联的用户体检报告id
    physicalExaminationReportId: Sequelize.BIGINT(20), // 关联的用户体检报告id
    // 关联的用户康复方案id
    rehabilitationPlanId: Sequelize.BIGINT(20), // 关联的用户康复方案id
    // 关联的用户安排id
    arrangementId: Sequelize.BIGINT(20), // 关联的用户安排id
    // 医生给的建议
    doctorAdvice: Sequelize.TEXT(), // 医生给的建议
    // 用户的诊断时间
    diagnosisTime: Sequelize.DATE, // 用户的诊断时间

    createdAt: DataTypes.DATE,
    updatedAt: DataTypes.DATE
}, {
    timestamps: false, // 不要默认时间戳 数据库没有时间戳字段时，设置为false，否则报错  SequelizeDatabaseError: Unknown column 'createdAt' in 'field list'
    freezeTableName: true
});


module.exports = diagnosticresult;

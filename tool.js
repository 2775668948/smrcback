

// 导入redis的操作
const redis = require('./redis');

// aes加密
const CryptoJS = require("crypto-js");

// 快捷的邮箱发送
const nodemailer = require('nodemailer');

// 雪花算法相关
const SNOWFLAKE = require("@zsea/snowflake");

// 导入邮箱配置
const Config = require("./config/config")


// 生成验证码
const createCode = () => {
    // 4位数纯数字的验证码
    let code = '';
    for (let i = 0; i < 4; i++) {
        code += Math.floor(Math.random() * 10);
    }
    return code;
}

// 校验是否是邮箱账号
const isEmail = (email) => {
    let reg = /^(\w-*\.*)+@(\w-?)+(\.\w{2,})+$/;
    if (reg.test(email)) {
        return true;
    } else {
        return false;
    }
}

// 向指定邮箱发送验证码
const sendCode = (email, code) => {
    // 邮箱配置
    let transporter = nodemailer.createTransport({
        host: 'smtp.qq.com',
        port: 465,
        secure: true,
        auth: {
            user: Config.emailConfig.user,
            pass: Config.emailConfig.pass
        }
    });
    // 邮件内容
    let mailOptions = {
        from: "2775668948@qq.com", // sender address
        to: email, // list of receivers
        subject: '智慧康复系统验证码', // Subject line
        text: '智慧康复系统验证码', // plain text body
        html: `<h1>您的验证码是${code}</h1>,请在60s内输入~` // html body
    };
    // 发送邮件
    transporter.sendMail(mailOptions, (error, info) => {
        if (error) {
            return console.log(error);
        }
        console.log('Message sent: %s', info.messageId);
        console.log('Preview URL: %s', nodemailer.getTestMessageUrl(info));
    }
    );
}


// 将用户的邮箱和验证码存入redis
const setCode = (email, code) => {
    redis.setCode(email, code);
}

// 从redis中获取用户的验证码
const getCode = (email) => {
    return redis.getCode(email);
}


// 构造aes加密
const aesEncrypt = (data) => {
    const key = Config.AesDecryptConfig.key;
    return CryptoJS.AES.encrypt(data, key).toString();
}

// aes解密
const aesDecrypt = (encrypted) => {
    const key = Config.AesDecryptConfig.key;
    const bytes = CryptoJS.AES.decrypt(encrypted, key);
    return bytes.toString(CryptoJS.enc.Utf8)
}


// 生成token
const createToken = () => {
    // 用雪花算法生成token
    const snowflake = new SNOWFLAKE({});
    return snowflake.nextId().toString();
}

// 将token存入redis
const setToken = (token, email) => {
    redis.setToken(token, email);
}


// 生成4个随机字母
const createRandomLetter = () => {
    let str = '';
    for (let i = 0; i < 4; i++) {
        str += String.fromCharCode(Math.floor(Math.random() * 26) + 97);
    }
    return str;
}


// 生成随机的8位数数字
const createRandomNumber = () => {
    let str = '';
    for (let i = 0; i < 8; i++) {
        str += Math.floor(Math.random() * 10);
    }
    return str;
}


// 将函数暴露出去
module.exports = {
    createCode,
    isEmail,
    setCode,
    sendCode,
    getCode,
    aesEncrypt,
    aesDecrypt,
    createToken,
    setToken,
    createRandomLetter,
    createRandomNumber
}
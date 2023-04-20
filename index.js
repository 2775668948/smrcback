const express = require('express');
const app = express();
const moment = require('moment')
const tools = require('./tool')
const request = require('request')


const cors = require('cors');
const bodyParser = require('body-parser');
const { Op, INTEGER } = require("sequelize");
const { sequelize } = require("./db/db")
const userDb = require('./db/model/user')



// 导入数据库模型
const recoveryvideoDb = require('./db/model/recoveryvideo')
// 评论模型
const commentDb = require('./db/model/comment')

// 聊天记录模型
const chatrecordDb = require('./db/model/chatrecord')


// 患者拓展表模型
const patientexpandDb = require('./db/model/patientexpand')

// 预约医生表
const doctorsappointmentDb = require('./db/model/doctorsappointment')


// 诊断结果表
const diagnosticresultDb = require('./db/model/diagnosticresult')

// 医院简介表
const HospitalIntroductionDb = require('./db/model/hospitalIntroduction')

app.use(cors());
app.use(bodyParser());

app.get('/', function (req, res) {
    res.send('hello world');
});

// 又是经典的面条代码

// 接受用户的注册验证码申请 post请求
app.post('/api/getregistercode', function (req, res) {

    // 获取post请求的用户信息
    let userp = req.body;

    console.log(userp);

    // 获取邮箱号
    let email = userp.email;

    if (!email || email == "" || email == null || email == undefined) {
        const restoclient = {
            "code": 40000,
            "message": "邮箱不能为空",
            "data": {}
        }
        res.send(restoclient);
        return;
    }

    // 如果不是邮箱账号
    if (!tools.isEmail(email)) {
        const restoclient = {
            "code": 40001,
            "message": "邮箱格式不正确",
            "data": {}
        }
        res.send(restoclient);
        return;
    }

    // 先在数据库查一下有没有这个邮箱号
    userDb.findOne({
        where: {
            email: email
        }
    }).then((result) => {
        if (result) {
            // 有这个邮箱号
            const restoclient = {
                "code": 40002,
                "message": "邮箱已被注册",
                "data": {}
            }
            res.send(restoclient);
        } else {
            // 没有这个邮箱号
            // 生成验证码
            let code = tools.createCode();
            console.log(code);
            // 将邮箱和验证码存入redis
            tools.setCode(email, code);
            // 发送验证码
            tools.sendCode(email, code);
            const restoclient = {
                "code": 20001,
                "message": "success",
                "data": {
                }
            }
            res.send(restoclient);
        }

    }).catch((err) => {
        console.log(err);
    })
});

// 判定邮箱验证码是否正确
app.post('/api/checkregistercode', function (req, res) {
    // 获取post请求的参数信息
    let reqjson = req.body;
    console.log(reqjson);
    // 获取邮箱号
    let email = reqjson.email;
    // 获取验证码
    let code = reqjson.code;

    // 从redis中获取验证码
    tools.getCode(email).then((result) => {
        console.log(result);
        if (result == code) {
            // 验证码正确
            const restoclient = {
                "code": 20001,
                "message": "success",
                "data": {
                }
            }
            res.send(restoclient);
        } else {
            // 验证码错误
            const restoclient = {
                "code": 40003,
                "message": "验证码错误",
                "data": {
                }
            }
            res.send(restoclient);
        }
    }).catch((err) => {
        console.log(err);
    })
});

// 完成了邮箱验证码之后把真正的待注册的用户数据存入到db中
app.post('/api/register', async function (req, res) {
    // 获取post请求的参数信息
    let reqjson = req.body;
    console.log(reqjson);
    // 获取邮箱号
    let email = reqjson.email;

    // 这里还是要校验一下邮箱是否存在的
    if (!email || email == "" || email == null || email == undefined) {
        const restoclient = {
            "code": 40000,
            "message": "邮箱不能为空",
            "data": {}
        }
        res.send(restoclient);
        return;
    }

    // 从数据库中查询一下邮箱是否存在
    await userDb.findOne({
        where: {
            email: email
        }
    }).then((result) => {
        if (result) {
            // 有这个邮箱号
            const restoclient = {
                "code": 40002,
                "message": "邮箱已被注册",
                "data": {}
            }
            res.send(restoclient);
            return;
        }
    }).catch((err) => {
        console.log(err);
    })


    // 获取密码
    let password = reqjson.password;

    // 获取一下权限id
    let roleid = reqjson.roleId;

    // 将用户的密码加密一下
    const passwordAes = tools.aesEncrypt(password);
    console.log("用户的密码是:" + passwordAes);
    // 这个时候邮箱号一定是不存在的,所以直接存入数据库 这里都是设置的默认昵称,头像地址和个人参数
    await userDb.create({
        email: email,
        password: passwordAes,
        name: "用户" + tools.createRandomLetter(),
        gender: 2,
        roleId: roleid,
        resizeobserver: "简单的介绍一下自己吧~",
        avatar: "https://api.multiavatar.com/6a2b5ae2d2035e2e08.png",
        collectNum: 0,
        followNum: 0,
        fansNum: 0,
        watchNum: 0,
        age: 22,
        diagnosticCardId: roleid == 0 ? tools.createRandomNumber() : 0,
        createdAt: moment().format('YYYY-MM-DD HH:mm:ss'),
        updatedAt: moment().format('YYYY-MM-DD HH:mm:ss')
    }).then(async (result) => {

        // 这个时候如果是患者的话还要存入一条患者拓展表
        if (roleid == 0) {
            // 构造患者信息拓展表
            let patient = {
                userId: result.id,
                isSeeDoctor: 0,
                isAppointment: 0,
                appointmentFeedbackId: 0
            }
            await patientexpandDb.create(patient).then((result) => {

            }).catch((err) => {
                console.log(err);
            })
        } else {
            // 如果是医生的话就存入多一条医生预约表，因为是刚刚创建的医生,一定是可以被预约的
            let doctor = {
                doctorId: result.id,
                doctorName: result.name,
                doctorDepartment: "康复科",
                doctorAvatar: result.avatar,
                freeStatus: 0
            }
            await doctorsappointmentDb.create(doctor).then((result) => {
            }).catch((err) => {
                console.log(err);
            })
        }


        // 存入成功
        const restoclient = {
            "code": 200010,
            "message": "success",
            "data": {
            }
        }
        res.send(restoclient);
    }
    ).catch((err) => {
        console.log(err);
    }
    )
})

// 用户通过邮箱和密码登录
app.post('/api/login', async function (req, res) {
    // 获取post请求的参数信息
    let reqjson = req.body;
    console.log(reqjson);
    // 获取邮箱号
    let email = reqjson.email;
    // 获取密码
    let password = reqjson.password;


    // 直接到db中去查
    const userfromdb = await userDb.findOne({
        where: {
            email: email
        }
    }).then((result) => {

        if (result) {
            // 有这个邮箱号
            // 将用户的密码和解密后的密码比对一下
            if (password == tools.aesDecrypt(result.password)) {
                // 密码正确
                // 生成token
                console.log("密码正确")
                return result;
            } else {
                // 密码错误
                const restoclient = {
                    "code": 40004,
                    "message": "密码错误",
                    "data": {}
                }
                res.send(restoclient);
                return;
            }
        } else {
            // 没有这个邮箱号
            const restoclient = {
                "code": 40001,
                "message": "账号不存在",
                "data": {}
            }
            res.send(restoclient);
            return;
        }
    }).catch((err) => {
        console.log(err);
    })

    let token = tools.createToken();
    console.log(token)
    // // 将token存入redis
    tools.setToken(token, userfromdb.email);
    // 将用户信息存入redis
    const { id, name, phone, avatar, resizeobserver, gender, roleId, collectNum, followNum, fansNum, age, updatedAt } = userfromdb;
    // 传回前端的userinfo
    const userinfo = {
        id,
        name,
        phone,
        email: userfromdb.email,
        avatar,
        resizeobserver,
        gender,
        roleId,
        collectNum,
        followNum,
        age,
        fansNum,
        updatedAt
    }
    // 这个时候还要组装更多的字段
    const patientexpandfromDb = await patientexpandDb.findOne({
        where: {
            userId: userinfo.id
        }
    }).then((result) => {
        return result;
    }).catch((err) => {
        console.log(err);
    })

    // 这里省事就直接全部返回了，正常来说是不可以这样子的
    const restoclient = {
        "code": 20001,
        "message": "success",
        "data": {
            "token": token,
            "userInfo": userinfo,
            "patientExpand": patientexpandfromDb
        }
    }
    // 这个时候更新一下用户的变更时间
    userDb.update({
        updatedAt: moment().format('YYYY-MM-DD HH:mm:ss')
    }, {
        where: {
            email: email
        }
    }).then((result) => {
        console.log(result);
    }).catch((err) => {
        console.log(err);
    })
    res.send(restoclient);
});

// 对知识库视频的crud

// 获取视频列表 这些公共资源无需token
app.get('/api/video/list', function (req, res) {
    // 获取get请求的参数信息
    let reqjson = req.query;
    console.log(reqjson);
    // 获取页码
    let page = reqjson.page;
    // 获取每页的数量，这里要把limit转换成数字
    let limit = parseInt(reqjson.limit);
    // 获取搜索的关键字
    let keyword = reqjson.keyword;

    // 去数据库查找
    recoveryvideoDb.findAndCountAll({
        where: {
            title: {
                [Op.like]: '%' + keyword + '%'
            }
        },
        offset: (page - 1) * limit,
        limit: limit,
        order: [
            ['updatedAt', 'DESC']
        ]
    }).then((result) => {
        // 查询成功
        const restoclient = {
            "code": 20001,
            "message": "success",
            "data": {
                "total": result.count,
                "list": result.rows
            }
        }
        res.send(restoclient);
    }).catch((err) => {
        console.log(err);
    })
})

// 获取视频详情
app.get('/api/video/detail', function (req, res) {
    // 获取get请求的参数信息
    let reqjson = req.query;
    console.log(reqjson);
    // 获取视频id
    let id = reqjson.id;

    // 去数据库查找
    videoDb.findOne({
        where: {
            id: id
        }
    }).then((result) => {
        // 查询成功
        const restoclient = {
            "code": 20001,
            "message": "success",
            "data": {
                "detail": result
            }
        }
        res.send(restoclient);
    }).catch((err) => {
        console.log(err);
    })
})


// 获取评论列表
app.get('/api/comment/list', async function (req, res) {
    // 获取get请求的参数信息
    let reqjson = req.query;
    console.log(reqjson);
    // 获取页码
    let page = parseInt(reqjson.page);
    // 获取每页的数量，这里要把limit转换成数字
    let limit = parseInt(reqjson.limit);
    // 获取医生id
    let doctorId = parseInt(reqjson.doctorId);

    // 用户id
    let userId = reqjson.userId;




    // 定义查询sql
    let sql = `select c.id,c.commentUserId,u.avatar,u.name,c.content,c.like,c.parentId,c.createdAt from comment c left join user u on c.commentUserId = u.id where c.doctorId=${doctorId} and status = 1 order by c.createdAt desc limit ${(page - 1) * limit},${limit}`;

    // 评论列表
    let commentList = [];

    // 执行sql 这种东西一定得是同步的
    await sequelize.query(sql, { type: sequelize.QueryTypes.SELECT }).then((result) => {
        // 查询成功
        // console.log(result);
        commentList = result;
        // console.log("--------------")
        // console.log(commentList);
    }).catch((err) => {
        console.log(err);
    })
    // 查看次数
    let cwatchNum = 0;


    // 获取查看了多少次医生
    await userDb.findOne({
        where: {
            id: doctorId
        }
    }).then((result) => {
        cwatchNum = result.watchNum;

    }).catch((err) => {
        console.log(err);
    })
    // 更新查看次数
    await userDb.update({
        watchNum: cwatchNum + 1
    }, {
        where: {
            id: doctorId
        }
    }).then((result) => {
        console.log(result);
    }
    ).catch((err) => {
        console.log(err);
    }
    )

    // 查出当前的用户，用来判断是否是管理员
    const cuser = await userDb.findOne({
        where: {
            id: userId
        }
    }).then((result) => {
        return result;
    }).catch((err) => {
        console.log(err);
    })



    let commentResult = [];



    // 遍历评论列表
    commentList.forEach((item) => {
        let likes = [];
        if (item.like == undefined || item.like.length == 0) {
            // console.log("没有点赞列表");
            likes = [];
        } else {
            // 有点赞列表
            likes = item.like.split(',');
            // console.log(likes);
            // console.log(likes.length);
        }
        let commentEach = {
            id: item.id,
            "owner": false,
            "hasLike": false,
            "likeNum": likes.length,
            "avatarUrl": item.avatar,
            "nickName": item.name == null ? "用户" : item.name,
            "content": item.content,
            "parentId": item.parentId,
            "createTime": item.createdAt
        }
        if (commentEach.nickName.length > 8) {
            commentEach.nickName = commentEach.nickName.substring(0, 4) + '...';
        }
        // 如果这条评论就是本用户发表的或者当前用户是超级管理员的话，则owner为true
        if (item.commentUserId == userId || cuser.roleId == 2) {
            commentEach.owner = true;
        }
        // 如果这条评论的点赞列表里面有当前用户的id，则hasLike为true
        if (likes.indexOf(userId.toString()) != -1) {
            commentEach.hasLike = true;
        }
        commentResult.push(commentEach);
    })

    // 最后组装评论组件需要的数据
    const restoclient = {
        "code": 20001,
        "message": "success",
        "data": {
            "readNumer": cwatchNum,
            "commentList": commentResult
        }
    }
    res.send(restoclient);
})


// 点赞评论
app.post('/api/comment/like', function (req, res) {
    // 获取post请求的参数信息
    let reqjson = req.body;
    console.log(reqjson);
    // 获取评论id
    let commentId = reqjson.commentId;
    // 获取用户id
    let userId = reqjson.userId;

    // 找出这条评论
    commentDb.findOne({
        where: {
            id: commentId
        }
    }).then((result) => {
        // 查询成功
        console.log(result);
        // 当前的点赞列表
        let currentLike = [];
        if (result.like == null || result.like == undefined || result.like.length == 0) {
            // 点赞列表里面什么都没有
            console.log("点赞列表里面什么都没有");
            currentLike.push(userId);
            console.log(currentLike);
        } else {
            // 点赞列表为空或者是点赞列表里面没有当前用户的id
            // 点赞列表里面有数据的话还要看自己有没有点赞
            currentLike = result.like.split(',');
            console.log(currentLike);
            if (currentLike.indexOf(userId.toString()) == -1) {
                // 点赞列表里面没有当前用户的id
                console.log("点赞列表里面没有当前用户的id");
                currentLike.push(userId);
            } else {
                // 点赞列表已经有当前用户的id了，那么就要取消点赞
                console.log("点赞列表已经有当前用户的id了,那么就要取消点赞");
                currentLike.splice(currentLike.indexOf(userId.toString()), 1);
            }
        }
        // 更新点赞列表
        // 这个时候的点赞列表就是最新的点赞列表了
        console.log(currentLike);
        commentDb.update({
            like: currentLike.toString()
        }, {
            where: {
                id: commentId
            }
        }).then((result) => {
            console.log(result);

            // 返回数据
            const restoclient = {
                "code": 20001,
                "message": "success",
                "data": {
                    "likeNum": currentLike.length
                }
            }
            res.send(restoclient);
        }).catch((err) => {
            console.log(err);
        })
    }).catch((err) => {
        console.log(err);
    })
})


// 提交评论
app.post('/api/comment/submit', function (req, res) {
    // 获取post请求的参数信息
    let reqjson = req.body;
    console.log(reqjson);
    // 获取评论,作为父评论的id
    let commentId = reqjson.commentId;
    // 获取用户id
    let userId = reqjson.userId;
    // 获取评论内容
    let content = reqjson.content;
    // 获取医生id
    let doctorId = reqjson.doctorId;

    // 然后就可以创造评论了
    commentDb.create({
        commentUserId: userId,
        doctorId: doctorId,
        content: content,
        parentId: commentId == undefined || commentId == null ? null : commentId,
        like: 0,
        status: 1,
        createdAt: new Date(),
        updatedAt: new Date()
    }).then((result) => {
        // 创建成功了
        console.log(result);
        // 返回数据
        const restoclient = {
            "code": 20001,
            "message": "comment add success",
            "data": {
            }
        }
        res.send(restoclient);
    })
})

// 删除评论
app.post('/api/comment/delete', async function (req, res) {
    // 获取post请求的参数信息
    let reqjson = req.body;
    console.log(reqjson);
    // 获取评论id
    let commentId = reqjson.commentId;
    // 获取用户id
    let userId = reqjson.userId;



    // 先找出来这个人是不是超级管理员
    const dbUserInfo = await userDb.findOne({
        where: {
            id: userId
        }
    }).then((result) => {
        // 查询成功
        console.log(result);
        return result;
    }).catch((err) => {
        console.log(err);
    })

    // 先找出来这条评论
    const dbComment = await commentDb.findOne({
        where: {
            id: commentId,
            commentUserId: userId
        }
    }).then((result) => {
        return result
    }).catch((err) => {
        const restoclient = {
            "code": 40001,
            "message": "没有这条评论",
            "data": {
            }
        }
        res.send(restoclient);
        return
    })



    // 如果这条评论存在，那么肯定就可以删除，因为都是用户本身自己发的，可以删除，如果是别的用户发的，则不可以删除，但是如果是超级管理员则可以全部删除
    // 这里先不这样子，只要评论存在就可以删除

    // 更新评论的状态
    if (dbComment != null) {
        await commentDb.update({

            status: 3
        }, {
            where: {
                id: commentId
            }
        }).then((result) => {
            // console.log(result);
            // 返回数据

        }).catch((err) => {
            console.log(err);
        }
        )
        // 再找出来这条评论的所有子评论
        const dbCommentList = await commentDb.findAll({
            where: {
                parentId: commentId
            }
        }).then((result) => {
            return result;
        }).catch((err) => {
            console.log(err);
        }
        )
        // 再把这条评论的所有子评论都删除
        if (dbCommentList != null) {
            dbCommentList.forEach(async (item) => {
                // 更新评论的状态
                await commentDb.update({
                    status: 3
                }, {
                    where: {
                        id: item.id
                    }
                }).then((result) => {
                }).catch((err) => {
                })
            })

        }
        const restoclient = {
            "code": 20001,
            "message": "comment delete success",
            "data": {
            }
        }
        res.send(restoclient);
    } else {
        const restoclient = {
            "code": 40001,
            "message": "没有这条评论",
            "data": {
            }
        }
        res.send(restoclient);
    }
})


// 获取聊天记录列表
app.post('/api/chat/list', function (req, res) {
    // 获取post请求的参数信息
    let reqjson = req.body;
    console.log(reqjson);
    // 获取用户id
    let userId = reqjson.userId;
    // 获取医生id
    let doctorId = reqjson.doctorId;
    // 获取页码
    let page = reqjson.page;
    // 获取每页的数量
    let limit = reqjson.limit;

    if (userId == null || userId == undefined || doctorId == null || doctorId == undefined || page == null || page == undefined || limit == null || limit == undefined) {
        const restoclient = {
            "code": 40001,
            "message": "Error:参数错误",
            "data": {
            }
        }
        res.send(restoclient);
        return;
    }

    // 先找出来这个用户的所有聊天记录
    chatrecordDb.findAll({
        where: {
            [Op.or]: [
                {
                    // 发送者是用户，接收者是医生
                    senderId: userId,
                    receiverId: doctorId
                },
                {
                    // 发送者是医生，接收者是用户
                    senderId: doctorId,
                    receiverId: userId
                }]
        },
        order: [
            ['createdAt', 'DESC']
        ],
        limit: limit,
        offset: (page - 1) * limit
    }).then((result) => {
        console.log(result);
        // 返回数据
        // 这里要组装一下数据格式给聊天组件才可以
        let list = [];
        result.forEach((item) => {
            let obj = {
                userId: item.senderId, // 发送者id
                msgId: item.id,    // 消息id，这里用的是聊天记录的id 
                name: item.senderName, // 发送者名称
                message: item.content, // 消息内容
                img: item.senderImg == null ? '' : item.senderImg, // 发送者发送的图片地址
                time: item.createdAt, // 发送时间,这里要转换成时间戳,后续修改
                avator: item.senderAvatar == null ? '' : item.senderAvatar, // 发送者头像
                tagLabel: item.senderTag == null ? '' : item.senderTag, // 发送者标签
            }
            list.push(obj);
        })
        const restoclient = {
            "code": 20001,
            "message": "success",
            "data": {
                "list": list.reverse() // 这里要反转一下，因为前端要倒序显示
            }
        }
        res.send(restoclient);
    }).catch((err) => {
        console.log(err);
    })
})

// 医生获取他和患者的聊天记录列表
app.post('/api/chat/list/doctor', function (req, res) {
    // 获取post请求的参数信息
    let reqjson = req.body;
    console.log(reqjson);
    // 获取用户id
    let userId = reqjson.userId;
    // 获取医生id
    let doctorId = reqjson.doctorId;
    // 获取页码
    let page = reqjson.page;
    // 获取每页的数量
    let limit = reqjson.limit;

    if (userId == null || userId == undefined || doctorId == null || doctorId == undefined || page == null || page == undefined || limit == null || limit == undefined) {
        const restoclient = {
            "code": 40001,
            "message": "Error:参数错误",
            "data": {
            }
        }
        res.send(restoclient);
        return;
    }

    // 先找出来这个用户的所有聊天记录
    chatrecordDb.findAll({
        where: {
            [Op.or]: [
                {
                    // 发送者是用户，接收者是医生
                    senderId: userId,
                    receiverId: doctorId
                },
                {
                    // 发送者是医生，接收者是用户
                    senderId: doctorId,
                    receiverId: userId
                }]
        },
        order: [
            ['createdAt', 'DESC']
        ],
        limit: limit,
        offset: (page - 1) * limit
    }).then((result) => {
        console.log(result);
        // 返回数据
        // 这里要组装一下数据格式给聊天组件才可以
        let list = [];
        result.forEach((item) => {
            let obj = {
                userId: item.senderId, // 发送者id
                msgId: item.id,    // 消息id，这里用的是聊天记录的id
                name: item.senderName, // 发送者名称
                message: item.content, // 消息内容
                img: item.senderImg == null ? '' : item.senderImg, // 发送者发送的图片地址
                time: item.createdAt, // 发送时间,这里要转换成时间戳,后续修改
                avator: item.senderAvatar == null ? '' : item.senderAvatar, // 发送者头像
                tagLabel: item.senderTag == null ? '' : item.senderTag, // 发送者标签
            }
            list.push(obj);
        })
        const restoclient = {
            "code": 20001,
            "message": "success",
            "data": {
                "list": list.reverse() // 这里要反转一下，因为前端要倒序显示
            }
        }
        res.send(restoclient);
    }).catch((err) => {
        console.log(err);
    })
})


// 发送聊天消息
app.post('/api/chat/send', async function (req, res) {
    // 获取post请求的参数信息
    let reqjson = req.body;
    console.log(reqjson);
    // 获取发送者id
    let senderId = reqjson.senderId;
    // 获取接收者id
    let receiverId = reqjson.receiverId;

    // 有可能发送的是图片，也有可能发送的是文字
    let type = reqjson.type;

    // 获取发送的图片地址
    let img = reqjson.img;
    // 获取发送的内容
    let content = reqjson.content;

    if (senderId == null || senderId == undefined || receiverId == null || receiverId == undefined) {
        const restoclient = {
            "code": 40001,
            "message": "Error:参数错误",
            "data": {
            }
        }
        res.send(restoclient);
        return;
    }

    // 从db中查出来整个用户信息
    const dbUserInfo = await userDb.findOne({
        where: {
            id: senderId
        }
    }).then((result) => {
        return result;
    }).catch((err) => {
        console.log(err);
    })

    if (dbUserInfo == null) {
        const restoclient = {
            "code": 40001,
            "message": "Error:用户不存在",
            "data": {
            }
        }
        res.send(restoclient);
        return;
    }

    // 整个时候就可以构造一个新的聊天记录了
    const lastRecord = await chatrecordDb.create({
        senderId: senderId,
        receiverId: receiverId,
        content: reqjson.content,
        senderName: dbUserInfo.name,
        senderTag: dbUserInfo.roleId,
        senderAvatar: dbUserInfo.avatar,
        senderImg: type == 1 ? img : null,
        type: type,
        status: 3,
        createdAt: new Date(),
        updatedAt: new Date()
    }).then((result) => {
        return result;
    }).catch((err) => {
        console.log(err);
    })

    // 还是再组装一下格式返回给前端
    let obj = {
        userId: lastRecord.senderId, // 发送者id
        msgId: lastRecord.id,    // 消息id，这里用的是聊天记录的id 
        name: lastRecord.senderName, // 发送者名称
        message: lastRecord.content, // 消息内容
        img: lastRecord.type == 1 && lastRecord.img != undefined ? lastRecord.senderImg : "", // 发送者发送的图片地址
        time: lastRecord.createdAt, // 发送时间,这里要转换成时间戳,后续修改
        avator: lastRecord.senderAvatar == null ? '' : lastRecord.senderAvatar, // 发送者头像
        tagLabel: lastRecord.senderTag == null ? '' : lastRecord.senderTag, // 发送者标签
    }


    // 把这个最后一条的消息返回给前端
    const restoclient = {
        "code": 20001,
        "message": "success",
        "data": {
            "lastRecord": obj
        }
    }
    res.send(restoclient);
})


// 获取所有的可以被预约的医生
app.get("/api/doctor/getAll", async function (req, res) {
    // 获取get请求的参数信息
    let reqjson = req.query;
    console.log(reqjson);
    let page = parseInt(reqjson.page);
    // 获取每页的数量，这里要把limit转换成数字
    let limit = parseInt(reqjson.limit);

    if (page == null || page == undefined || limit == null || limit == undefined) {
        const restoclient = {
            "code": 40001,
            "message": "Error:参数错误",
            "data": {
            }
        }
        res.send(restoclient);
        return;
    }

    // 从db中查出来所有的空闲的医生
    const doctorsappointments = await doctorsappointmentDb.findAll({
        where: {
            freeStatus: 0
        },
        order: [
            ['createdAt', 'DESC']
        ],
        limit: limit,
        offset: (page - 1) * limit
    }).then((result) => {
        return result;
    }).catch((err) => {
        console.log(err);
    })

    // 还是再组装一下格式返回给前端
    let list = [];
    doctorsappointments.forEach(async item => {
        let obj = {
            doctorId: item.doctorId, // 医生id
            doctorName: item.doctorName, // 医生名称
            doctorDepartment: item.doctorDepartment,
            doctorAvatar: item.doctorAvatar, //
            freeStatus: item.freeStatus,
            appointmentTimeType: item.appointmentTimeType
        }
        list.push(obj);
    })
    // 构造返回信息
    const restoclient = {
        "code": 20001,
        "message": "success",
        "data": {
            "list": list
        }
    }
    res.send(restoclient);
})


// 更新预约信息
app.post("/api/doctor/addAppointment", async function (req, res) {
    // 获取get请求的参数信息
    let reqjson = req.body;
    console.log(reqjson);
    let page = parseInt(reqjson.page);
    // 获取每页的数量，这里要把limit转换成数字
    let limit = parseInt(reqjson.limit);
    let userId = reqjson.userId;

    // 医生id
    let doctorId = reqjson.doctorId;

    if (page == null || page == undefined || limit == null || limit == undefined || userId == null || userId == undefined) {
        const restoclient = {
            "code": 40001,
            "message": "Error:参数错误",
            "data": {
            }
        }
        res.send(restoclient);
        return;
    }

    // 更新db中的预约信息
    await doctorsappointmentDb.update({
        freeStatus: 1,
        patientId: userId,
        appointmentTime: moment().subtract(-1, "days").format("YYYY-MM-DD").toString(),
        appointmentStatus: 1
    }, {
        where: {
            doctorId: doctorId
        }
    }).then((result) => {

    });
    // 构造返回信息
    const restoclient = {
        "code": 20001,
        "message": "success",
        "data": {
        }
    }
    res.send(restoclient);
})


// 获取用户的预约信息
app.get("/api/doctor/getAppointment", async function (req, res) {
    // 获取get请求的参数信息
    let reqjson = req.query;
    console.log(reqjson);
    let page = parseInt(reqjson.page);
    // 获取每页的数量，这里要把limit转换成数字
    let limit = parseInt(reqjson.limit);
    let userId = reqjson.userId;

    // 然后就去db中查找这个用户的预约信息
    const doctorsappointments = await doctorsappointmentDb.findAll({
        where: {
            patientId: userId
        },
        order: [
            ['createdAt', 'DESC']
        ],
        limit: limit,
        offset: (page - 1) * limit
    }).then((result) => {
        return result;
    }).catch((err) => {
        console.log(err);
    })

    // 还是再组装一下格式返回给前端
    let list = [];
    doctorsappointments.forEach(async item => {
        let obj = {
            doctorId: item.doctorId, // 医生id
            doctorName: item.doctorName, // 医生名称
            doctorDepartment: item.doctorDepartment, // 医生科室
            appointmentTime: item.appointmentTime, // 预约时间
        }
        list.push(obj);
    })
    // 构造返回信息
    const restoclient = {
        "code": 20001,
        "message": "success",
        "data": {
            "list": list
        }
    }
    res.send(restoclient);

})


// 医生获取所有它的当日患者 其实也就一个 因为提供的是高端的一对一服务
app.get("/api/doctor/getAllPatient", async function (req, res) {
    // 获取get请求的参数信息
    let reqjson = req.query;
    console.log(reqjson);
    let page = parseInt(reqjson.page);
    // 获取每页的数量，这里要把limit转换成数字
    let limit = parseInt(reqjson.limit);
    // 拿到医生的id 这里也不鉴权这么严格了
    let doctorId = reqjson.doctorId;

    // 要先获取当前时间 因为要在时间范围内才行
    let nowTime = moment().format("YYYY-MM-DD").toString();

    // 然后直接去db那里查就ok 选择时间刚好就是今天的
    const patients = await doctorsappointmentDb.findAll({

        where: {
            doctorId: doctorId,
            appointmentStatus: 1,
            appointmentTime: nowTime
        },
        order: [
            ['createdAt', 'DESC']
        ],
        limit: limit,
        offset: (page - 1) * limit
    }).then((result) => {
        return result;
    }).catch((err) => {
        console.log(err);
    })

    // 如果医生不存在
    if (patients.length == 0) {
        const restoclient = {
            "code": 40001,
            "message": "Error:医生不存在",
            "data": {
            }
        }
        res.send(restoclient);
        return;
    }

    // 由于是一对一服务的关系 所以同时服务的只有一个患者 不可能说高端定制化服务还一个服务多个嘛
    let list = [];

    // 拿到userid

    let userId = patients[0].patientId;

    // 然后去user表中查找这个用户的信息
    const userfromdb = await userDb.findOne({
        where: {
            id: userId
        }
    }).then((result) => {
        return result;
    }).catch((err) => {
        console.log(err);
    })

    // 把预约信息也查出来给前端
    const appointmentfromdb = await doctorsappointmentDb.findOne({
        where: {
            patientId: userId
        }
    }).then((result) => {
        return result;
    }).catch((err) => {
        console.log(err);
    })


    // 如果没有患者
    if (userfromdb == null) {
        const restoclient = {
            "code": 40008,
            "message": "恭喜,你是自由的医生",
        }
        res.send(restoclient);
        return;
    }

    // 然后组装一下返回给前端

    // 这里先直接返回试试 后期再改
    const restoclient = {
        "code": 20001,
        "message": "success",
        "data": {
            "list": [
                userfromdb
            ],
            "more": appointmentfromdb
        }
    }
    res.send(restoclient);
})


// 医生给患者提交信息，然后用户就可以查看自己的病历信息了
app.post("/api/doctor/submitPatientInfo", async function (req, res) {
    // 获取post请求的参数信息
    let reqjson = req.body;
    console.log(reqjson);
    let doctorId = reqjson.doctorId;
    let userId = reqjson.userId;

    // 先去db中查找这个用户的预约信息
    const appointmentfromdb = await doctorsappointmentDb.findOne({
        where: {
            patientId: userId
        }
    }).then((result) => {
        return result;
    }).catch((err) => {
        console.log(err);
    })

    // 如果没有患者
    if (appointmentfromdb == null) {
        const restoclient = {
            "code": 40008,
            "message": "Error:患者不存在",
        }
        res.send(restoclient);
        return;
    }

    // 用户主诉
    let patientComplaint = reqjson.patientComplaint;

    // 用户现病史
    let patientHistory = reqjson.patientHistory;

    // 用户既往史
    let patientPastHistory = reqjson.patientPastHistory;

    // 用户体格检查
    let patientPhysicalExamination = reqjson.patientPhysicalExamination;

    // 用户初步检查
    let patientInitialDiagnosis = reqjson.patientInitialDiagnosis;

    // 用户诊疗意见
    let patientTreatmentAdvice = reqjson.patientTreatmentAdvice;

    // 用户诊断备注
    let patientDiagnosisRemark = reqjson.patientDiagnosisRemark;

    // 用户诊断卡id
    let patientDiagnosisCardId = reqjson.patientDiagnosisCardId;


    diagnosticresultDb.create({
        userId: userId,
        cardNumber: patientDiagnosisCardId,
        mainComplaint: patientComplaint,
        presentIllness: patientHistory,
        pastHistory: patientPastHistory,
        physicalExamination: patientPhysicalExamination,
        preliminaryExamination: patientInitialDiagnosis,
        diagnosisAndTreatment: patientTreatmentAdvice,
        doctorAdvice: patientDiagnosisRemark,
        status: 1,
        createdAt: new Date(),
        updatedAt: new Date()
    }).then((result) => {
        const restoclient = {
            "code": 20001,
            "message": "success",
        }
        res.send(restoclient);
    }
    ).catch((err) => {
        console.log(err);
    }
    )



})

// 患者获取自己的电子病历
app.get("/api/patient/getPatientInfo", async function (req, res) {
    // 获取get请求的参数信息
    let reqjson = req.query;
    console.log(reqjson);
    let userId = reqjson.userId;

    // 先去db中查找这个用户的预约信息
    const appointmentfromdb = await doctorsappointmentDb.findOne({
        where: {
            patientId: userId
        }
    }).then((result) => {
        return result;
    }).catch((err) => {
        console.log(err);
    })

    // 如果没有患者
    if (appointmentfromdb == null) {
        const restoclient = {
            "code": 40008,
            "message": "患者还没有预约",
        }
        res.send(restoclient);
        return;
    }
    // 然后去db查找医生的诊疗结果
    const diagnosticresultfromdb = await diagnosticresultDb.findOne({
        where: {
            userId: userId,
            status: 1
        }
    }).then((result) => {
        return result;
    }).catch((err) => {
        console.log(err);
    })

    // 如果没有医生开的诊断信息
    if (diagnosticresultfromdb == null) {
        const restoclient = {
            "code": 40008,
            "message": "患者还没有诊断信息",
        }
        res.send(restoclient);
        return;
    }
    // 如果有信息的话
    const restoclient = {
        "code": 20001,
        "message": "success",
        "data": {
            "list": [
                diagnosticresultfromdb
            ]
        }
    }
    res.send(restoclient);


})

// 患者要删除自己的电子病历
app.get("/api/patient/deletePatientInfo", async function (req, res) {
    // 获取get请求的参数信息
    let reqjson = req.query;
    console.log(reqjson);
    let rid = reqjson.rid;

    // 把状态改一下就好了
    const diaDb = await diagnosticresultDb.findOne({
        where: {
            id: rid
        }
    }).then((result) => {
        return result;
    }).catch((err) => {
        console.log(err);
    })

    // 如果没有的话
    if (diaDb == null) {
        const restoclient = {
            "code": 40008,
            "message": "Error:没有这条记录",
        }
        res.send(restoclient);
        return;
    }

    // 有的话，更新一下状态就好了
    diaDb.status = 3

    await diagnosticresultDb.update({
        status: 3
    }, {
        where: {
            id: rid
        }
    }).then((result) => {

    }).catch((err) => {
        console.log(err);
    })

    const restoclient = {
        "code": 20001,
        "message": "success",
    }
    res.send(restoclient);
})


// 用户点进我的医生界面 查看我的医生信息
app.get("/api/patient/getMyDoctorInfo", async function (req, res) {
    // 获取get请求的参数信息
    let reqjson = req.query;
    console.log(reqjson);
    let userId = reqjson.userId;


    // 然后去预约表中查一下
    const appointmentfromdb = await doctorsappointmentDb.findOne({
        where: {
            patientId: userId
        }
    }).then((result) => {
        return result;
    }).catch((err) => {
        console.log(err);
    })

    // 如果没有这个预约的话,都没有这个预约怎么会有医生信息
    if (appointmentfromdb == null) {
        const restoclient = {
            "code": 40008,
            "message": "Error:没有这个预约",
        }
        res.send(restoclient);
        return;
    }

    // 有这个预约的话,那就把医生的信息查出来
    const doctorfromdb = await userDb.findOne({
        where: {
            id: appointmentfromdb.doctorId
        }
    }).then((result) => {
        return result;
    }).catch((err) => {
        console.log(err);
    })

    // 直接返回这个医生信息就好了
    const restoclient = {
        "code": 20001,
        "message": "success",
        "data": {
            "list": [
                doctorfromdb
            ]
        }
    }
    res.send(restoclient);
})

// 获取医院简介
app.get("/api/patient/getHospitalInfo", async function (req, res) {
    // 获取get请求的参数信息

    await HospitalIntroductionDb.findAll().then((result) => {
        const restoclient = {
            "code": 20001,
            "message": "success",
            "data": {
                "list": result
            }
        }
        res.send(restoclient);
    }
    ).catch((err) => {
        console.log(err);
    }
    )
})




const port = 7788;
app.listen(port, () => {
    console.log(`Server listening on http://localhost:${port}, Ctrl+C to stop`)
});
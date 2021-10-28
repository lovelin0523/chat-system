//引入socket
const ws = require("nodejs-websocket")
const socket = require("./socket")
//引入结果集
const JsonResult = require('./jsonResult')
//引入异常
const ServiceError = require('./error/ServiceError')
//创建连接
const createServer = () => {
	let server = ws.createServer(connection => {
		//接收消息
		connection.on('text', result => {
			socket.receiveMessage(result,connection,server)
		})
		//连接出错
		connection.on('error', code => {
			socket.error(code)
		})
		//连接关闭
		connection.on('close', code => {
			socket.close(code,connection,server)
		})
	}).listen(3031)

	return server
}

const server = createServer()

//引入express模块
const express = require("express")
//引入中间件
const bodyParser = require("body-parser")
//创建web服务器
let app = express()
app.all("*", (req, res, next) => {
	//设置允许跨域的域名，*代表允许任意域名跨域
	res.setHeader("Access-Control-Allow-Origin", "*")
	//允许的header类型
	res.setHeader("Access-Control-Allow-Headers", "*")
	//跨域允许的请求方式 
	res.setHeader("Access-Control-Allow-Methods", "DELETE,PUT,POST,GET,OPTIONS")
	if (req.method.toLowerCase() == 'options')
		res.sendStatus(200) //让options尝试请求快速结束
	else
		next()
});

app.get('/checkUserName',(req,res,next)=>{
	const userName = req.query.userName
	const room = req.query.room
	if(!userName){
		next(new ServiceError('校验用户名失败'))
		return
	}
	if(!room){
		next(new ServiceError('未获取到房间号'))
		return
	}
	if(userName.length > 10){
		next(new ServiceError('用户名不能超过10个字符，请重新设置'))
		return
	}
	const keywords = ['凯','凌','kai']
	const has = keywords.some(item=>{
		return userName.includes(item)
	})
	if(has){
		next(new ServiceError('用户名不符合规范，请重新设置'))
		return
	}
	//获取该房间的所有连接
	const roomConnections = server.connections.filter(item=>{
		return item.room == room
	})
	//判断用户名是否已存在
	const flag = roomConnections.some(item=>{
		return item.userName === userName
	})
	
	if(flag){
		next(new ServiceError('用户名已存在，请重新设置'))
		return
	}
	return res.json(JsonResult.success())
})

//监听端口
app.listen(3032, '0.0.0.0');

//异常捕获
app.use((error, req, res, next) => {
	if (error) {
		console.log(error)
		if (error.name == "ServiceError") {
			res.json(new JsonResult(JsonResult.STATUS_SERVICE_ERROR, error.message))
		} else {
			res.json(new JsonResult(JsonResult.STATUS_SYSTEM_ERROR, error.message))
		}
	}
});


const Message = require('../entity/Message')
module.exports = {
	//接收消息
	receiveMessage(result, connection, server) {
		try{
			let res = JSON.parse(result)
			if(typeof res != 'object' || !res){
				throw new Error('系统异常')
			}
			//心跳检测消息
			if (res.type == -1) {
				const msg = new Message(res.type,res.room,'心跳检测消息回执',res.userName,{
					time: new Date().toLocaleString('zh-CN', {
						hour12: false
					})
				})
				connection.send(JSON.stringify(msg))
			}
			//有人进入聊天室
			else if (res.type == 0) {
				connection.room = res.room
				connection.userName = res.userName
				//获取该房间的所有连接
				const roomConnections = server.connections.filter(item=>{
					return item.room == res.room
				})
				roomConnections.forEach(conn => {
					if (conn === connection) {
						const msg = new Message(res.type,res.room,'你已加入聊天室',res.userName,{
							connections:roomConnections.length,
							list:Message.get(res.room) || [],
							time: new Date().toLocaleString('zh-CN', {
								hour12: false
							}),
							users:roomConnections.map(item=>{
								return item.userName
							})
						})
						conn.send(JSON.stringify(msg))
					} else {
						//查找是否同时多个在线
						if(conn.userName === connection.userName){
							const msg = new Message(-2,conn.room,'你在另一个地方登录，当前主机被迫下线',conn.userName,{
								time: new Date().toLocaleString('zh-CN', {
									hour12: false
								})
							})
							conn.send(JSON.stringify(msg))
						}else {
							const msg = new Message(res.type,res.room,`${res.userName}加入了聊天室`,res.userName,{
								connections:roomConnections.length,
								time: new Date().toLocaleString('zh-CN', {
									hour12: false
								}),
								users:roomConnections.map(item=>{
									return item.userName
								})
							})
							conn.send(JSON.stringify(msg))
						}
					}
				})
			}
			//普通消息接收
			else if (res.type == 2) {
				const msg = new Message(res.type,res.room,res.content,res.userName,{
					time: new Date().toLocaleString('zh-CN', {
						hour12: false
					})
				})
				//将消息缓存
				Message.add(msg,res.room)
				//获取该房间的所有连接
				const roomConnections = server.connections.filter(item=>{
					return item.room == res.room
				})
				//推送
				roomConnections.forEach(conn => {
					conn.send(JSON.stringify(msg))
				})
			}
		}catch(e){
			const msg = new Message(-2,'',e.message,'',{
				time: new Date().toLocaleString('zh-CN', {
					hour12: false
				})
			})
			connection.send(JSON.stringify(msg))
		}
	},
	//出现异常
	error(code) {
		try {
			connection.close()
		} catch (error) {
			console.log('socket异常',error)
		}
	},
	//连接关闭
	close(code, connection, server) {
		try{
			//获取该房间的所有连接
			const roomConnections = server.connections.filter(item=>{
				return item.room == connection.room
			})
			roomConnections.forEach(conn => {
				if (conn != connection) {
					const msg = new Message(1,conn.room,`${connection.userName}离开了聊天室`,connection.userName,{
						connections: roomConnections.length,
						time: new Date().toLocaleString('zh-CN', {
							hour12: false
						}),
						users:roomConnections.map(item=>{
							return item.userName
						})
					})
					conn.send(JSON.stringify(msg))
				}
			})
		}catch(e){
			const msg = new Message(-2,'',e.message,'',{
				time: new Date().toLocaleString('zh-CN', {
					hour12: false
				})
			})
			connection.send(JSON.stringify(msg))
		}
	}
}

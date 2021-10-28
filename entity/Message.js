class Message {
	constructor(type, room, content, userName, data) {
		//-2表示异常，-1表示心跳检测回执消息，0表示加入聊天室通知，1表示离开聊天室通知，2表示普通消息
		this.type = type
		//房间号
		this.room = room
		//内容文本
		this.content = content || ''
		//所属用户
		this.userName = userName || ''
		//额外数据
		this.data = data || {}
	}

}

module.exports = Message

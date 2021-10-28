class Cache {
	constructor() {
		this.list = {}
	}
	
	add(data,room){
		if(!this.list[room] || !Array.isArray(this.list[room])){
			this.list[room] = []
		}
		if(this.list[room].length > 20){
			this.list[room].shift()
		}
		this.list[room].push(data)
	}
	
	get(room){
		return this.list[room]
	}
}

module.exports = new Cache()
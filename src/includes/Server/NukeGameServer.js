// modules
required("socket.io","socket_io");

// includes
depends('Server/HTTP.js');

// needs
needs('function','cc');


//
//	NukeGameServer.js
//

var NukeGameServer = {
	io : socket_io.listen(3000)
}

NukeGameServer.io.sockets.on('connection',function(socket){
	cc("new player");


	socket.JoinRoom=function(room){
		this.join(room);
		this.room = room;
	}

	socket.ToRoom = function(name,value){
		NukeGameServer.io.to(this.room).emit(name,value);
	}


	socket.JoinRoom("lobby");


	socket.emit('hello');

	socket.username = "Player "+Math.floor(Math.random()*100);


	cc(socket.room);

	socket.on('wait',function(params){

	});

	socket.on('sending message',function(msg){
		if(typeof msg != 'string') return;
		socket.ToRoom('message',{
			username : socket.username,
			message : msg
		});
	});

});
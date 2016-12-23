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
	io : socket_io.listen(3000),
	online : 0,
	getLobbySockets : function(){
		var roomObject = NukeGameServer.io.sockets.adapter.rooms["lobby"];
		var sockets = [];
		if(roomObject){
			for (var clientId in roomObject.sockets ) {
				sockets.push(NukeGameServer.io.sockets.connected[clientId]);
			}
		}
		return sockets;
	},
	SendLobbyUsers : function(){
		var usernames = [];
		this.getLobbySockets().forEach(function(client) {
		    usernames.push({
		    	username : client.username,
		    	language : client.lang,
		    	id : client.id,
		    	wait : client.wait
		    });
		});
		NukeGameServer.io.to("lobby").emit('users in lobby',usernames);
	}
}

NukeGameServer.io.sockets.on('connection',function(socket){

	NukeGameServer.online++;

	socket.JoinRoom=function(room){
		if(this.room)
			this.leave(this.room);

		this.join(room);
		this.room = room;
		this.roomObject = NukeGameServer.io.sockets.adapter.rooms[room];
	}

	socket.GetRoomSockets=function () {
		var sockets = [];
		for (var clientId in this.roomObject.sockets ) {
			sockets.push(NukeGameServer.io.sockets.connected[clientId]);
		}
		return sockets;
	}

	socket.ToRoom = function(name,value){
		NukeGameServer.io.to(this.room).emit(name,value);
	}

	socket.JoinRoom("main");

	socket.emit('state','main');

	socket.username = "Player "+Math.floor(Math.random()*100);

	socket.lang = "en";

	socket.wait = true;

	socket.on('nick',function(nick){
		// [ERR] Güvenlik
		socket.username = nick;

		socket.JoinRoom("lobby");

		socket.emit('state',"lobby");

		NukeGameServer.SendLobbyUsers();

	});

	socket.on('change wait status',function(new_value){
		// [ERR] Güvenlik
		socket.wait = new_value;
		socket.stoppedWaiting = Date.now();
		NukeGameServer.SendLobbyUsers();
	});

	socket.on('sending message',function(msg){
		// [ERR] Güvenlik
		if(typeof msg != 'string') return;
		socket.ToRoom('message',{
			username : socket.username,
			message : msg
		});
	});

	socket.on('set language',function(lang){
		// [ERR] Güvenlik
		socket.lang = lang;
		NukeGameServer.SendLobbyUsers();

	});

	socket.on('exit',function(lang){
		socket.JoinRoom("main");
		socket.emit('state',"main");

		NukeGameServer.SendLobbyUsers();
		
	});

	socket.on('disconnect',function(){
		NukeGameServer.SendLobbyUsers();
		NukeGameServer.online--;
	});

});


// 1sc loop
setInterval(function(){
	var lobby_sockets = NukeGameServer.getLobbySockets();
	lobby_sockets.forEach(function(socket){
		if(!socket.wait){
			console.log(Date.now()-socket.stoppedWaiting);

			// eğer 10snden uzun bekleyen socket bulunursa, diğer bekleyenlerle beraber bir oyun oluşturulur.
		}
	});
},1000);


//
// Doc
//
/*

---	Oyun oluşturma

	--- tetikleme

	iki şey ile oyun oluşturulma tetiklenir.
	* lobinin bir ülkesinde 10 oyuncuya ulaşılır
	* lobinin bir aceleci üyesi 10snden fazla beklerse, diğer acelecilerle beraber botlu oyun oluşturulur
	
	--- algoritma

	* soketler için ayrı oda oluşturulur
	* bir oyuncu ya bot olur ya insan
	* oyunculara rastgele ülkeler verir
	* oyuncuların nükleeri ve komuta merkezi o ülkenin rastgele şehirlerine verilir 3 şehir boşta kalır.


*/
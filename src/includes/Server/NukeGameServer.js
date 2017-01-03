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

	socket.Notice = function(msg){
		this.emit('message',{
			username : "*#SERVER#*",
			message : msg
		});
	}

	socket.lose=function(){
		// şuanlık lose değilde maine gönderelim
		socket.Notice("lose");
		socket.Game = null;
		socket.JoinRoom("main");
		socket.emit('state','main');
	};
	socket.win=function(){
		// şuanlık lose değilde maine gönderelim
		socket.Notice("win");
		socket.Game = null;
		socket.JoinRoom("main");
		socket.emit('state','main');
	};
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

		socket.Notice('<b lang="en">Welcome</b> '+socket.username);
		socket.Notice('<i lang="en">Game will start automatically with 10 players</i>');


		// [ERR] test edilmeli
		// Bir ülkeden 10 kişi olunca o soketler ile oda kur

		var lobby_sockets = NukeGameServer.getLobbySockets();
		var langs = {};

		lobby_sockets.forEach(function(soc){
			if(langs[soc.lang])
				langs[soc.lang].push(soc);
			else
				langs[soc.lang] = [soc];
		});

		for(var i in langs){
			if(langs[i].length==10){
				NukeGameManager.CreateGame(langs[i]);
				break;
			}
		}


	});

	socket.on('change wait status',function(new_value){
		// [ERR] Güvenlik
		socket.wait = new_value;
		if(!socket.wait){
			socket.stoppedWaiting = Date.now();
			socket.Notice('<b lang="en">Game will start in 10 second</b>');
		}
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
		socket.stoppedWaiting = Date.now();
		socket.JoinRoom("main");
		socket.emit('state',"main");

		NukeGameServer.SendLobbyUsers();
		
	});

	socket.on('disconnect',function(){
		NukeGameServer.SendLobbyUsers();
		NukeGameServer.online--;
		// oyundaydsa oyundan at kaybetsin
	});

	socket.on('launch nuclear missile',function(config){

		if(!config || (typeof(config.target) != 'string') || (typeof(config.from) != 'string') ) return socket.Notice("ERR");

		if( (typeof(Cities[config.target]) == "undefined") || (typeof(Cities[config.from]) == "undefined") ) return socket.Notice("ERR");

		if(typeof(socket.Game) == 'undefined' || typeof(socket.Game) == 'null' ) return socket.Notice("ERR");

		var target = socket.getCity(config.target);
		var from = socket.getCity(config.from);
		var Country = socket.Game.Countries[socket.country];

		// kendi şehri değilse
		if(socket.isYours(config.target)) return socket.Notice("<err lang='en'>City is yours</err>");

		// o şehir bombalanmadıysa
		if(target.bombed) return socket.Notice("<err lang='en'>City is already bombed</err>");

		// ülke meşgul değilse
		if( Country.busy > Date.now() ) return socket.Notice("<err lang='en'>Country is busy, please wait</err>");

		// from geçerliyse ve orada nuke varsa
		if(!from.build || from.build.type != "nuclear" ) return socket.Notice("<err lang='en'>City has not nuclear launcher</err>");

		// nuke varsa bir sonraki zamanı uygunsa
		if(from.build.usable > Date.now() ) return socket.Notice("<err lang='en'>Nuclear launcher is not ready, please wait</err>");

		// busy yap
		var cost = RocketController.calcTime(from,target);
		Country.busy = Date.now() + cost;

		from.build.usable = Date.now() + NukewarStandarts.ReloadCost;;

		var move = {
			type : "rocket",
			target : config.target,
			from : config.from,
			ends : (Date.now() + cost )
		};

		socket.Game.Moves.push(move);
		socket.ToRoom('move',move);
		socket.SendPrivateData();

	} );

	socket.on('clear area',function(target){

		socket.Notice(JSON.stringify(target));

		// kendi şehriyse
		// şehir bombalandıysa
		// ülke meşgül değilse

		// busy yap
		// timer ile şehri bombed=false yap ve update
	} );

	socket.on('transport',function(config){

		socket.Notice(JSON.stringify(config));

		// iki şehirde kendi şehriyse
		// iki şehirde bombalanmadıysa
		// ülke meşgul değilse

		// busy yap
		// timer ile şehirlerin buildlerini replace et ve update

	} );
	socket.on('build missile launcher',function(target){

		socket.Notice(JSON.stringify(target));

		// kendi şehriyse
		// bombalanmadıysa
		// boşsa
		// ülke meşgul değilse

		// busy yap
		// timer ile şehre bir nuke build et ve update
	} );

});


// 1sc loop
setInterval(function(){
	var lobby_sockets = NukeGameServer.getLobbySockets();

	var GameCreateLimit = false;
	lobby_sockets.forEach(function(socket){

		if(GameCreateLimit) return;

		if(!socket.wait){
			if( (Date.now()-socket.stoppedWaiting) > 10000 ){
				GameCreateLimit = true;
				var sockets_for_game = [];
				lobby_sockets.forEach(function(soc){
					if(!soc.wait){
						if(socket.lang == soc.lang){
							sockets_for_game.push(soc);
						}
					}
				});

				NukeGameManager.CreateGame(sockets_for_game);
			}
		}
	});

	var i = NukeGameManager.games.length;
	while(i--){
		if(NukeGameManager.games[i].over)
			NukeGameManager.games.splice(i,1);
		else
			NukeGameManager.games[i].update();
	}

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

	CreateGame( [ ...sockets... ])
	
	--- algoritma

	* soketler için ayrı oda oluşturulur
	* bir oyuncu ya bot olur ya insan
	* oyunculara rastgele ülkeler verir
	* oyuncuların nükleeri ve komuta merkezi o ülkenin rastgele şehirlerine verilir 3 şehir boşta kalır.

	Games : [ .. game .. ]

	Game {
		room : "room7893",
		Countries : {
			x {
				... 
				name //global
				isBot :
				busy : -time- // private
				socket : {} 
				lose : false // global
			}
			...
		},
		Moves : [
			{
				type : 'nuke'
				end : ''

			}

		]
	}

	MakeMove(type,target,from)

	city {
		bombed : false // global
		build : { // private
			type : 'center'

			or

			type : "nuke"
			usable : -time-
		}
	}


*/
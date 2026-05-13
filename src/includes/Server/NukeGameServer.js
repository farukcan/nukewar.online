// modules
required("socket.io","socket_io");
required('log4js');

// includes
depends('Server/HTTP.js');

// needs
needs('function','cc');

log4js.configure({
  appenders: { nuke: { type: 'console' } },
  categories: { default: { appenders: ['nuke'], level: 'trace' } }
});
var logger = log4js.getLogger('nuke');
logger.info('NukeWar Starting');

//
//	NukeGameServer.js
//

var NukeGameServer = {
	io : new socket_io.Server(http_server),
	online : 0,
	getLobbySockets : function(){
		var roomSet = NukeGameServer.io.sockets.adapter.rooms.get("lobby");
		var sockets = [];
		if(roomSet){
			for (var clientId of roomSet) {
				var s = NukeGameServer.io.sockets.sockets.get(clientId);
				if(s) sockets.push(s);
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

NukeGameServer.io.on('connection',function(socket){

	NukeGameServer.online++;

	socket.JoinRoom=function(room){
		if(this.room)
			this.leave(this.room);

		this.join(room);
		this.room = room;
	}

	socket.GetRoomSockets=function () {
		var roomSet = NukeGameServer.io.sockets.adapter.rooms.get(this.room);
		var sockets = [];
		if(roomSet){
			for (var clientId of roomSet) {
				var s = NukeGameServer.io.sockets.sockets.get(clientId);
				if(s) sockets.push(s);
			}
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
		socket.Notice('<b lang="en">You are defeated</b>');
		socket.Game = null;
		socket.JoinRoom("gameover");
		socket.emit('state','gameover');
	};
	socket.win=function(){
		// şuanlık lose değilde maine gönderelim
		socket.Notice('<b lang="en">You are winner</b>');
		socket.Game = null;
		socket.JoinRoom("gameover");
		socket.emit('state','win');
	};
	socket.JoinRoom("main");

	socket.emit('state','main');

	socket.username = "Player "+Math.floor(Math.random()*100);

	socket.lang = "en";

	socket.wait = true;

	socket.icon = "images/clock.png"

	socket.TimeLimitOfMessage = 0;

	socket.on('nick',function(nick){
		// [ERR] Güvenlik
		socket.username = EscapeMessage(nick.substring(0, 10));

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
		if(typeof(new_value)!="boolean") return;

		socket.wait = new_value;
		if(!socket.wait){
			socket.stoppedWaiting = Date.now();
			socket.ToRoom('message',{
				username : "*#SERVER#*",
				message : socket.username+' <b lang="en">\'s game will start, check \'do not wait\' for join him</b>'
			});
			socket.Notice('<b lang="en">Game will start in 10 second</b>');
		}
		NukeGameServer.SendLobbyUsers();
	});

	socket.on('sending message',function(msg){
		if(typeof msg != 'string') return;
		if(msg.length > 100 ) return;

		if(socket.TimeLimitOfMessage < Date.now()){
			socket.ToRoom('message',{
				username : socket.username,
				message : EscapeMessage(msg),
				icon : socket.icon
			});
			socket.TimeLimitOfMessage = Date.now()+500;
			logger.info(socket.username + ' : ' + msg + " [" + socket.room + "]");
		}else{
			socket.TimeLimitOfMessage += 2000;
			socket.Notice('<b lang="en">Please wait for send message</b>');
		}

	});


	socket.on('bug report',function(msg){
		if(typeof msg != 'string') return;


		if(socket.TimeLimitOfMessage < Date.now()){
			var report = EscapeMessage(msg.substring(0, 255));
			socket.Notice('<b lang="en">Bug report sended</b> : ' + report);
			logger.info(socket.username + " [BUG] "+ report);
			socket.TimeLimitOfMessage = Date.now()+500;
		}else{
			socket.TimeLimitOfMessage += 2000;
			socket.Notice('<b lang="en">Please wait for send message</b>');
		}

	});


	socket.on('set language',function(lang){
		if(typeof lang != 'string') return;
		if(lang.length != 2 ) return;
		// [ERR] Güvenlik
		socket.lang = lang;
		NukeGameServer.SendLobbyUsers();

	});

	socket.on('exit',function(){
		socket.stoppedWaiting = Date.now();
		socket.JoinRoom("main");
		socket.emit('state',"main");

		NukeGameServer.SendLobbyUsers();
		
	});

	socket.on('disconnect',function(){
		if(socket.Game && socket.country && !socket.Game.Countries[socket.country].lose){
			socket.Game.Countries[socket.country].lose = true;
			socket.Game.checkGame();
			socket.Game.SendGlobalData();
		}
		socket.ToRoom('message',{
			username : "*#SERVER#*",
			message : socket.username+' <b lang="en">disconnected</b>'
		});
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
		if(!socket.isYours(config.from)) return socket.Notice("<err lang='en'>It is not your city</err>");

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
			country : socket.country,
			type : "rocket",
			target : config.target,
			from : config.from,
			now : Date.now(),
			ends : (Date.now() + cost )
		};
		socket.ToRoom('move',move);


		
		
		if( socket.hasAirDefense(config.target) ){ // eğer düşmnanda AD varsa - düşman defansı yok et

			// - düşman target şehrinde roket kaldır
			socket.ToRoom('move',{
				country : socket.getCountryOfCity(socket.ADct),
				type : "rocket",
				target : config.from,
				from : socket.ADct,
				AD : true,
				now : Date.now(),
				ends : (Date.now() + cost/2 )
			});

			var move2 = {
				country : socket.getCountryOfCity(socket.ADct),
				type : "defense",
				def : socket.ADct,
				target : config.target ,
				from : config.from,
				now : Date.now(),
				ends : (Date.now() + cost/2 ) // - hamle : yarı sürede iki füzeyi yoket ve patlama yarat.
			};

			socket.Game.Moves.push(move2);
			socket.ToRoom('move',move2);  // - defence hamlesi gönder düşmandan

		}else {
			socket.Game.Moves.push(move); //  yokoluşu iptal etme
		}

		socket.SendPrivateData();

	});

	socket.on('clear area',function(target){

		if((typeof(target) != 'string')) return socket.Notice("ERR");

		if( (typeof(Cities[target]) == "undefined") ) return socket.Notice("ERR");

		if(typeof(socket.Game) == 'undefined' || typeof(socket.Game) == 'null' ) return socket.Notice("ERR");

		var Target = socket.getCity(target);
		var Country = socket.Game.Countries[socket.country];


		// kendi şehriyse
		if(!socket.isYours(target)) return socket.Notice("<err lang='en'>It is not your city</err>");

		// bombalandıyysa
		if(!Target.bombed) return socket.Notice("<err lang='en'>City is not damaged</err>");

		// ülke meşgül değilse
		if( Country.busy > Date.now() ) return socket.Notice("<err lang='en'>Country is busy, please wait</err>");

		// busy yap
		Country.busy = Date.now() + NukewarStandarts.ClearCost;

		// timer ile şehri bombed=false yap ve update
		var move = {
			country : socket.country,
			type : "clear",
			target : target,
			ends : Country.busy
		};

		socket.Game.Moves.push(move);
		socket.emit('move',move);
		socket.SendPrivateData();

		socket.Notice(target+" <b lang='en'>is clearing</b>");

	} );

	socket.on('transport',function(config){

		if(!config || (typeof(config.target) != 'string') || (typeof(config.from) != 'string') ) return socket.Notice("ERR");

		if( (typeof(Cities[config.target]) == "undefined") || (typeof(Cities[config.from]) == "undefined") ) return socket.Notice("ERR");

		if(typeof(socket.Game) == 'undefined' || typeof(socket.Game) == 'null' ) return socket.Notice("ERR");

		var target = socket.getCity(config.target);
		var from = socket.getCity(config.from);
		var Country = socket.Game.Countries[socket.country];

		// iki şehirde kendi şehriyse
		if(!socket.isYours(config.target)) return socket.Notice("<err lang='en'>It is not your city</err>");
		if(!socket.isYours(config.from)) return socket.Notice("<err lang='en'>It is not your city</err>");

		// iki şehirde bombalanmadıysa
		if(target.bombed || from.bombed ) return socket.Notice("<err lang='en'>City is bombed</err>");

		// ülke meşgul değilse
		if( Country.busy > Date.now() ) return socket.Notice("<err lang='en'>Country is busy, please wait</err>");

		// busy yap
		Country.busy = Date.now() + NukewarStandarts.SwapCost;

		// timer ile şehirlerin buildlerini replace et ve update
		var move = {
			country : socket.country,
			type : "swap",
			target : config.target,
			from : config.from,
			ends : Country.busy
		};

		socket.Game.Moves.push(move);
		socket.emit('move',move);
		socket.SendPrivateData();

		socket.Notice(config.from+" <b lang='en'>is transporting to</b> "+config.target);


	} );
	socket.on('build missile launcher',function(target){

		if((typeof(target) != 'string')) return socket.Notice("ERR");

		if( (typeof(Cities[target]) == "undefined") ) return socket.Notice("ERR");

		if(typeof(socket.Game) == 'undefined' || typeof(socket.Game) == 'null' ) return socket.Notice("ERR");

		var Target = socket.getCity(target);
		var Country = socket.Game.Countries[socket.country];

		// kendi şehriyse
		if(!socket.isYours(target)) return socket.Notice("<err lang='en'>It is not your city</err>");

		// bombalanmadıysa
		if(Target.bombed) return socket.Notice("<err lang='en'>City is bombed</err>");

		// boşsa
		if(Target.build) return socket.Notice("<err lang='en'>City is not empty</err>");

		// ülke meşgul değilse
		if( Country.busy > Date.now() ) return socket.Notice("<err lang='en'>Country is busy, please wait</err>");

		// busy yap
		Country.busy = Date.now() + NukewarStandarts.BuildCost;

		// timer ile şehre bir nuke build et ve update
		var move = {
			country : socket.country,
			type : "build",
			target : target,
			ends : Country.busy
		};

		socket.Game.Moves.push(move);
		socket.emit('move',move);
		socket.SendPrivateData();

		socket.Notice("<b lang='en'>Building nuclear launcher to</b> "+target);


	} );

	socket.on('build air defense',function(target){

		if((typeof(target) != 'string')) return socket.Notice("ERR");

		if( (typeof(Cities[target]) == "undefined") ) return socket.Notice("ERR");

		if(typeof(socket.Game) == 'undefined' || typeof(socket.Game) == 'null' ) return socket.Notice("ERR");

		if(!socket.isYours(target)) return socket.Notice("<err lang='en'>It is not your city</err>");


		var Target = socket.getCity(target);
		var Country = socket.Game.Countries[socket.country];

		if(Target.bombed) return socket.Notice("<err lang='en'>City is bombed</err>");

		if(Target.build) return socket.Notice("<err lang='en'>City is not empty</err>");

		// ülke meşgül değilse
		if( Country.busy > Date.now() ) return socket.Notice("<err lang='en'>Country is busy, please wait</err>");

		// busy yap
		Country.busy = Date.now() + NukewarStandarts.AirDefenseCost;

		// timer ile şehri bombed=false yap ve update
		var move = {
			country : socket.country,
			type : "airdefense",
			target : target,
			ends : Country.busy
		};

		socket.Game.Moves.push(move);
		socket.emit('move',move);
		socket.SendPrivateData();

		socket.Notice("<b lang='en'>Air Defense building ...</b>");

	} );

	socket.on('cancel move',function(){

		if(typeof(socket.Game) == 'undefined' || typeof(socket.Game) == 'null' ) return socket.Notice("ERR");

		socket.cancelMove();
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

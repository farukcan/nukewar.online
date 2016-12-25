var NukeGameManager = {
	gamesCount : 0,
	games : [],
	CreateGame : function(sockets){

		this.gamesCount++;
		var roomname = "Game"+this.gamesCount;

		var Game = {
			room : roomname,
			Countries : JSON.parse(JSON.stringify(Countries)),
			Moves : [],
			SendGlobalData : function(){
				var data = {Countries:{}};
				for(var c in this.Countries){
					data.Countries[c] = {};
					data.Countries[c].name = this.Countries[c].name ;
					data.Countries[c].lose = this.Countries[c].lose ;
					data.Countries[c].cities = {};
					for(var ct in this.Countries[c].cities){
						data.Countries[c].cities[ct] = {};
						data.Countries[c].cities[ct].bombed = this.Countries[c].cities[ct].bombed;
					}
				}
				NukeGameServer.io.to(this.room).emit("global data",data);
			}
		}

		this.games.push(Game);

		var players = [].concat(sockets); // add sockets

		while(players.length<10){ // add bots
			players.push("BOT");
		}

		shuffle(players); // shuffle players

		var p_index=0;
		for(var c in Game.Countries){
			Game.Countries[c].socket = players[p_index];
			if(players[p_index] == "BOT"){
				Game.Countries[c].isBot = true;
				Game.Countries[c].name = c;
			}else{
				Game.Countries[c].name = Game.Countries[c].socket.username;
			}


			Game.Countries[c].busy = 0;
			Game.Countries[c].lose = false;
			Game.Countries[c].kills = 0;

			var cities = ["nuke","center","","",""];
			shuffle(cities); // shuffle cities

			var c_index = 0;
			for( var ct in Game.Countries[c].cities ){

				Game.Countries[c].cities[ct].bombed = false;
				Game.Countries[c].cities[ct].build = false;
				if(cities[c_index] == "nuke" ){
					Game.Countries[c].cities[ct].build = {
						type : "nuke",
						usable : 0
					};
				}else if(cities[c_index] == "center" ){
					Game.Countries[c].cities[ct].build = {
						type : "center"
					};
				}

				c_index++;
			}

			p_index++;
		}

		sockets.forEach(function(socket){
			socket.JoinRoom(roomname);
			socket.Game = Game;
			socket.emit('state','game');
		});

		Game.SendGlobalData();

	}
}

var shuffle = function(a) {
    var j, x, i;
    for (i = a.length; i; i--) {
        j = Math.floor(Math.random() * i);
        x = a[i - 1];
        a[i - 1] = a[j];
        a[j] = x;
    }
}
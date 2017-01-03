var NukeGameManager = {
	gamesCount : 0,
	games : [],
	CreateGame : function(sockets){

		this.gamesCount++;
		var roomname = "Game"+this.gamesCount;

		var Game = {
			over : false,
			room : roomname,
			Countries : JSON.parse(JSON.stringify(Countries)),
			getCity : function(cityname){
				for(var c in this.Countries){
					for(var ct in this.Countries[c].cities){
						if(ct == cityname){
							return this.Countries[c].cities[ct];
						}
					}
				}
				return false;
			},
			getCountryOfCity : function(cityname){
				for(var c in this.Countries){
					for(var ct in this.Countries[c].cities){
						if(ct == cityname){
							return c;
						}
					}
				}
				return false;
			},
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
			},
			Notice : function(msg){
				NukeGameServer.io.to(this.room).emit('message',{
					username : "*#SERVER#*",
					message : msg
				});
			},
			update : function(){

			var i = this.Moves.length;
			while(i--){

				if(this.Moves[i].ends < Date.now()){
					var Move = this.Moves[i];

					if(Move.type == "rocket"){

						var target = this.getCity(Move.target);
						this.Notice(Move.target+" <b lang='en'>is destroyed</b>");
						target.bombed = true; // bombalandı
						

						this.Moves.forEach(function(m){ // bombalandığı an, şehirdeki transpart ,build,ve clear hamleleri iptal edilir.
							if(m.target == Move.target){
								if(m.type != "rocket"){
									m.canceled = true;
								}
							}
						});

						// eğer öldürücü hamle yapıldıysa
						if(target.build && target.build.type=="center"){ 
							// hamle yapılan kişi kaybeder
							var c = this.getCountryOfCity(Move.target);
							this.Countries[c].lose = true;
							this.Notice(this.Countries[c].name+" <b lang='en'>is defeated</b>");
							if(!this.Countries[c].isBot){
								this.Countries[c].socket.lose();
							}

							// bütün şehirleri bombalanmış gibidir.
							for(var cty in this.Countries[c].cities){
								this.Countries[c].cities[cty].bombed = true;
								this.Countries[c].cities[cty].build = false;
							}

							// kalan oyunculara göre son durum belirlenir
							var remain = 0;
							var remainPlayer = 0;
							var winner;
							for(var i in this.Countries){
								var co = this.Countries[i];
								if(!co.lose){
									if(!co.isBot){
										remainPlayer++; // kalan oyuncu sayısını arttır.
										winner=co;	
									}
									remain++;
								}
							}


							// remainPlayer = 0 ise oyun biter
							// remainPlayer=remain=1 ise winner kazanır

							if(remainPlayer==0){
								this.over = true;
							}
							if(remainPlayer==1 && remain==1){
								winner.socket.win();
								this.over = true;
							}
						}

						if(target.build && target.build.type=="nuclear"){
							this.Notice('<b lang="en">Nuclear weapon destroyed in</b> '+Move.target);
						}

						target.build = false; // yıkıldı

						this.SendGlobalData();

						var c = this.getCountryOfCity(Move.from);
						if(!this.Countries[c].lose && this.Countries[c].socket && this.Countries[c].socket.SendPrivateData){
							this.Countries[c].socket.SendPrivateData();
						}
						c = this.getCountryOfCity(Move.target);
						if(!this.Countries[c].lose && this.Countries[c].socket && this.Countries[c].socket.SendPrivateData){
							this.Countries[c].socket.SendPrivateData();
						}
					}

					this.Moves.splice(i,1);
				}else if(this.Moves[i].canceled){
					this.Moves.splice(i,1);
				}

			}



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
				Game.Countries[c].socket.country = c;
			}


			Game.Countries[c].busy = 0;
			Game.Countries[c].lose = false;
			Game.Countries[c].kills = 0;

			var cities = ["nuclear","center","","",""];
			shuffle(cities); // shuffle cities

			var c_index = 0;
			for( var ct in Game.Countries[c].cities ){

				Game.Countries[c].cities[ct].bombed = false;
				Game.Countries[c].cities[ct].build = false;
				if(cities[c_index] == "nuclear" ){
					Game.Countries[c].cities[ct].build = {
						type : "nuclear",
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

		sockets.forEach(function(socket,i){
			socket.JoinRoom(roomname);
			socket.Game = Game;
			socket.emit('state','game');
			socket.emit('you are',socket.country);
			socket.isYours = function(cityname){
				return typeof(this.Game.Countries[this.country].cities[cityname]) != 'undefined';
			};
			socket.getCity = function(cityname){
				for(var c in this.Game.Countries){
					for(var ct in this.Game.Countries[c].cities){
						if(ct == cityname){
							return this.Game.Countries[c].cities[ct];
						}
					}
				}
				return false;
			};
			socket.SendPrivateData = function(){
				if(this.Game){
					var Country = this.Game.Countries[this.country];
					var Cities = {};
					for(var ct in Country.cities){
						Cities[ct] = {
							build : Country.cities[ct].build
						};
					}
					this.emit('private data',{
						busy : Country.busy,
						date : Date.now(),
						cities : Cities
					});
				}
			}
			socket.SendPrivateData();
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
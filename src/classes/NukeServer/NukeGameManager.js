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

			this.updateBots();	

			var i = this.Moves.length;
			while(i--){

				if(this.Moves[i].canceled){
					this.Moves.splice(i,1);
				}
				else if(this.Moves[i].ends < Date.now()){
					var Move = this.Moves[i];

					if(Move.type == "rocket"){

						var target = this.getCity(Move.target);
						if(!target.bombed)
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

							this.checkGame();
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
					
					}else if(Move.type == "build"){

						var target = this.getCity(Move.target);
						var c = this.getCountryOfCity(Move.target);

						if(!target.bombed){
							target.build = {
								type : "nuclear",
								usable : 0
							};
							if(!this.Countries[c].lose && this.Countries[c].socket && this.Countries[c].socket.SendPrivateData){
								this.Countries[c].socket.Notice('<b lang="en">Nuclear launcher successfully built to</b> '+Move.target);
								this.Countries[c].socket.SendPrivateData();
							}
						}

					}else if(Move.type == "airdefense"){

						var target = this.getCity(Move.target);
						var c = this.getCountryOfCity(Move.target);

						if(!target.bombed){

							// bize doğru gelen son füzeye göre usable ol
							var usable = 0;
							var _this=this;
							this.Moves.forEach(function(m){ // bombalandığı an, şehirdeki transpart ,build,ve clear hamleleri iptal edilir.
									if(m.type == "rocket" && _this.getCountryOfCity(m.target) == c && m.ends>usable){
										usable = m.ends;
									}
							});



							target.build = {
								type : "airdefense",
								usable : usable
							};
							if(!this.Countries[c].lose && this.Countries[c].socket && this.Countries[c].socket.SendPrivateData){
								this.Countries[c].socket.Notice('<b lang="en">Air defense successfully built to</b> '+Move.target);
								this.Countries[c].socket.SendPrivateData();
							}
						}

					}else if(Move.type == "clear"){
						var target = this.getCity(Move.target);
						var c = this.getCountryOfCity(Move.target);

						target.bombed = false;

						if(!this.Countries[c].lose && this.Countries[c].socket && this.Countries[c].socket.SendPrivateData){
							this.Countries[c].socket.Notice('<b lang="en">City successfully cleared :</b> '+Move.target);
							this.Countries[c].socket.SendPrivateData();
						}

						this.SendGlobalData();

					}else if(Move.type == "defense"){

						var c = this.getCountryOfCity(Move.target);

						if(!this.Countries[c].lose && this.Countries[c].socket && this.Countries[c].socket.SendPrivateData){
							this.Countries[c].socket.Notice('<b lang="en">Air defense successfully destroyed enemy missile</b> '+Move.target);
							this.Countries[c].socket.SendPrivateData();
						}

						var c = this.getCountryOfCity(Move.from);
						
						if(!this.Countries[c].lose && this.Countries[c].socket && this.Countries[c].socket.SendPrivateData){
							this.Countries[c].socket.Notice('<b lang="en">Our missile has been shot down by enemy</b> '+Move.target);
							this.Countries[c].socket.SendPrivateData();
						}

						this.SendGlobalData();


					}else if(Move.type == "swap"){
						var target = this.getCity(Move.target);
						var from = this.getCity(Move.from);
						var c = this.getCountryOfCity(Move.target);

						if(!from.bombed && !target.bombed){
							var swap = target.build;
							target.build = from.build;
							from.build = swap;

							if(!this.Countries[c].lose && this.Countries[c].socket && this.Countries[c].socket.SendPrivateData){
								this.Countries[c].socket.Notice('<b lang="en">Cities successfully swapped :</b> '+Move.target+" & "+Move.from);
								this.Countries[c].socket.SendPrivateData();
							}
						}

					}


					this.Moves.splice(i,1);
				}

			}



			},
			checkGame : function(){
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

							if(this.over){
								logger.info("*** Game Ended : "+this.room+" ***");

							}

			},
			getEnemy : function(countryname){
				if(this.Countries[countryname].enemy){
					if(!this.Countries[this.Countries[countryname].enemy].lose)
						return this.Countries[countryname].enemy;
				}
				var enemies001 = [];
				var min = 5;
				// yaşayanlardan
				for(var c in this.Countries){
					if(!this.Countries[c].lose && c!=countryname){
						var citynum = 0;
						for(var ii in this.Countries[c].cities){
							if(!this.Countries[c].cities[ii].bombed){
								citynum++;
							}
						}
						enemies001.push({
							name : c,
							num : citynum
						});

						if(citynum<min)
							min = citynum;
					}
				}

				if(enemies001.length==0) return "none";

				var enemies002 = [];

				enemies001.forEach(function(enemy){
					if(enemy.num == min)
						enemies002.push(enemy);
				});

				if(Math.random() > 0.7 ) enemies002 = enemies001; // illada en zayıfa saldırmak zorunda değil

				shuffle(enemies002);

				var enemy = enemies002[0].name;
				this.Countries[countryname].enemy = enemy;
				return enemy;
			},
			getEnemyCity : function(enemy){
				var cities = [];
				for(var i in this.Countries[enemy].cities){
					if( !this.Countries[enemy].cities[i].bombed )
						cities.push(i);
				}
				shuffle(cities);
				return cities[0];
			},
			updateBots : function(){
				// # Bilgisayarın insanlarla ve birbiriyle çatışmasını sağlayan fonksiyon
				// taktik maktik yok bam bam bam
				for(var countryname in this.Countries){ // her ülke için
					var Country = this.Countries[countryname];
					if(Country.isBot && !Country.lose && Country.busy<Date.now()){ // botsa ve kaybetmediyse ve meşgul değilse

						if(Country.zombie) continue; // yarı ölüyse boşver

						if(Math.random() > 0.75 ) continue; // botun hamle zamanı ön görülemez olsun

						var nuke = "none";

						// nuke bul ()
						for(var n in Country.cities){
							if(!Country.cities[n].bombed && Country.cities[n].build && Country.cities[n].build.type=="nuclear"){
								nuke = n;
								break;
							}
						}

						if(nuke!="none"){

							if(Country.cities[nuke].build.usable < Date.now()){ // füze hazırsa

								// saldır
								var enemy = this.getEnemy(countryname); // rastgele bir düşman seç

								if(enemy != "none"){

									var to = this.getEnemyCity(enemy); // rastgele bir şehir seç

									var from = Country.cities[nuke];
									var target = this.Countries[enemy].cities[to];

									// busy yap
									var cost = RocketController.calcTime(from,target);
									Country.busy = Date.now() + cost;

									from.build.usable = Date.now() + NukewarStandarts.ReloadCost;;

									var move = {
										type : "rocket",
										target : to,
										from : nuke,
										now : Date.now(),
										ends : (Date.now() + cost )
									};

									
									NukeGameServer.io.to(this.room).emit('move',move);

									var hasAirDefense= false;
									var ADct ;
									for(ct in this.Countries[enemy].cities){
										if(this.Countries[enemy].cities[ct].build && this.Countries[enemy].cities[ct].build.type=="airdefense"){
											this.Countries[enemy].cities[ct].build = false;
											this.SendGlobalData();
											ADct=ct;
											hasAirDefense=true;
											break;
										}
									}		
									if( hasAirDefense ){ // eğer düşmnanda AD varsa - düşman defansı yok et

										// - düşman target şehrinde roket kaldır
										NukeGameServer.io.to(this.room).emit('move',{
											type : "rocket",
											target : nuke,
											from : ADct,
											AD : true,
											now : Date.now(),
											ends : (Date.now() + cost/2 )
										});

										var move2 = {
											type : "defense",
											def : ADct,
											target : to,
											from : nuke,
											now : Date.now(),
											ends : (Date.now() + cost/2 ) // - hamle : yarı sürede iki füzeyi yoket ve patlama yarat.
										};

										this.Moves.push(move2);
										NukeGameServer.io.to(this.room).emit('move',move2);  // - defence hamlesi gönder düşmandan
									}else {
										this.Moves.push(move);//  yokoluşu iptal etme
									}


									// FIN

								}else{
									Country.zombie = true; // düşman bulamazsa zombi olur
									// FIN
								}

							}else{
								// FIN
							}

						}else{

							var emptycity = "none";

							// boş şehir bul ()
							for(var n in Country.cities){
								if(!Country.cities[n].bombed && Country.cities[n].build==false){
									emptycity = n;
									break;
								}
							}

							if(emptycity != "none"){
								// inşa et
								Country.busy = Date.now() + NukewarStandarts.BuildCost;

								// timer ile şehre bir nuke build et ve update
								var move = {
									type : "build",
									target : emptycity,
									ends : Country.busy
								};

								this.Moves.push(move);
								// FIN
							}else{
								Country.zombie = true; //nuke yok ve boş şehir kalmadıysa bot zombi olur
								// FIN
								
							}

						}
						


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


			Game.Countries[c].busy = Date.now()+15000;
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
				}else if(cities[c_index] == "airdefense" ){
					Game.Countries[c].cities[ct].build = {
						type : "airdefense",
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

		logger.info("***New Game "+roomname+" ***","players:");

		sockets.forEach(function(socket,i){

			logger.info("->",socket.username);

			socket.JoinRoom(roomname);
			socket.Game = Game;
			socket.emit('state','game');
			socket.emit('you are',socket.country);
			socket.icon = "flags/16/"+socket.country+".png"
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
			socket.hasAirDefense = function(cityname){
				for(var c in this.Game.Countries){
					var enemy=false;
					var defense=false,df;
					for(var ct in this.Game.Countries[c].cities){
						if(ct == cityname){
							enemy=true;
						}
						if(this.Game.Countries[c].cities[ct].build && this.Game.Countries[c].cities[ct].build.type=="airdefense"){
							defense=true;
							df=ct;
						}
					}

					if(enemy && defense){
						socket.ADct=df;
						this.Game.Countries[c].cities[df].build = false;
						Game.SendGlobalData();
						return true;
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
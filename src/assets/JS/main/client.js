


	//////////////////////////////////////////////////////////////////////////////////
	//		client
	//////////////////////////////////////////////////////////////////////////////////

	var socket = io(window.location.hostname+':3000');

	socket.on('state',function(state){
		switch(state){
			case 'main':
				InterfaceSetState(state);
				socket.emit("set language",lang.currentLang);
				RocketController.deleteAll();
				var exampleRocketA = new Rocket({
						start : new GPos(90,0),
						target : new GPos(90-Math.random()*180,180-Math.random()*360)
				});
				var exampleRocketB = new Rocket({
						start : new GPos(45,0),
						target : new GPos(90-Math.random()*180,180-Math.random()*360)
				});
				setFlagsOff();
				setPopulationsOff();
				setCrossesOff();
				camera_r = camera_r_default;
				camera.follow = true;
				camera.target = exampleRocketB;
				break;

			case 'lobby':
				InterfaceSetState(state);
				resetCountries();
				camera_r = camera_r_default;
				camera.GoTo(new GPos(-20,120));
				setFlagsOff();
				setPopulationsOff();
				setCrossesOff();
				break;

			case 'game':
				InterfaceSetState(state);

				RocketController.deleteAll();

				break;

			default:
				alert("undefined state");
		}
	});

	socket.on('disconnect', function(){
		alert("disconnected");
	});

	socket.on('message',function(data){
		if(data.username == "*#SERVER#*"){
			$("#messages").append("<message><notice>"+data.message+"</notice></message>");
		}else
			$("#messages").append("<message><username>"+data.username+"</username><post>"+data.message+"</post></message>");
		$('#messages').scrollTop($('#messages')[0].scrollHeight);
	});

	socket.on('users in lobby',function(users){
		var lobbies = {};
		users.forEach(function(user){
			if(lobbies[user.language]){
				lobbies[user.language].push(user);
			}else{
				lobbies[user.language] = [user];
			}
		});
		var html = "";
		for(lobby in lobbies){
			var src = $("lang[value='"+lobby+"'] img").attr("src");
			html += "<lobby><img src='"+src+"'/>";
			var usercount = 0;
			lobbies[lobby].forEach(function(user){
				usercount++;
				var a;
				if(user.id == socket.id){
					a="<b>"+user.username+"</b> , ";
				}else{
					a=user.username+" , ";
				}

				if(!user.wait){
					a = "<u>"+a+"</u>";
				}

				html+=a;
			});
			html += "["+usercount+"/10]</lobby>";
		}
		$("#lobby_list").html(html);
	});


	socket.on('global data', function(data){
		Countries = $.extend(true,Countries,data.Countries);
		InterfaceUpdateCities();
		updateBillboards();
	});
	
	socket.on('private data', function(data){
		Countries[your_county] = $.extend(true,Countries[your_county],data);
		var diff = ( Countries[your_county].date - Date.now() );
		Countries[your_county].busy = Countries[your_county].busy - diff; // zaman farkını yok et;
		for( var ct in Countries[your_county].cities ){
			var city = Countries[your_county].cities[ct];
			if(city.build && city.build.type=="nuclear"){
				city.build.usable = city.build.usable - diff;
			}
		} 
		InterfaceUpdateCities(); 

	});
		
	socket.on('you are', function(c){
		your_county = c;
		Countries[your_county].isYou = true;
		for(var i in Countries[your_county].cities){
			camera.GoTo(new GPos(Countries[your_county].cities[i].position.lat,Countries[your_county].cities[i].position.lon));
			break;
		}
	});

	socket.on('move',function(Move){
		if(Move.type == "rocket"){
				var rocket = new Rocket({
						start : Move.from,
						target : Move.target
				});

				Notice("<b lang='en'>Missile launched from</b> "+Move.from+" <b lang='en'>Target</b>: "+Move.target);


				if(getCountryOfCity(Move.from) == your_county){
					// bu hamleyi sen yaptıysa
					camera.follow = true;
					camera.target = rocket;
				}
		}

		InterfaceUpdateCities();
	});


	$("#chatinput").keydown(function(e){
		if(e.keyCode==13){
			socket.emit('sending message',$("#chatinput").val());
			$("#chatinput").val('');
		}
	});


	function resetCountries(){
		for(country in Countries){
			Countries[country].lose = false;
			Countries[country].isYou = false;
		}

		resetCities();
	}

	function resetCities(){
		
		for(city_name in city_list){
			city_list[city_name].bombed = false;
			city_list[city_name].build = false;
		}
	}

	function Notice(data){
		$("#messages").append("<message><notice>"+data+"</notice></message>");
		$('#messages').scrollTop($('#messages')[0].scrollHeight);
	}
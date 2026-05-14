


	//////////////////////////////////////////////////////////////////////////////////
	//		client
	//////////////////////////////////////////////////////////////////////////////////

	var socket = io();

	socket.on('state',function(state){
		switch(state){
			case 'main':
				InterfaceSetState(state);
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
				glitchPass.active = true;
				glitchPass.goWild = false;
				break;

			case 'matchmaking':
				InterfaceSetState(state);
				resetCountries();
				camera_r = camera_r_default;
				camera.GoTo(new GPos(-20,120));
				setFlagsOff();
				setPopulationsOff();
				setCrossesOff();
				glitchPass.active = false;
				$('#matchmaking_searching').hide();
				$('#matchmaking_play_btn').show();
				$('#matchmaking_cancel_btn').hide();
				$('#matchmaking_exit_btn').show();
				$('#matchmaking_timer').text('0:00');
				break;

		case 'game':
			InterfaceSetState(state);

			RocketController.deleteAll();
			glitchPass.active = false;
			$('.strategy_btn').removeClass('strategy_selected');
			$('#strategy_select').fadeIn(300);
			break;

			case 'gameover':
				InterfaceSetState(state);
				glitchPass.active = true;
				glitchPass.goWild = true;
				setTimeout(function(){
					glitchPass.goWild = false;
				},2000);
				camera_r = camera_r_default;
				setFlagsOff();
				setPopulationsOff();
				setCrossesOff();

				break;	
			case 'win':
				InterfaceSetState(state);
				camera_r = camera_r_default;
				setFlagsOff();
				setPopulationsOff();
				setCrossesOff();

				break;	
			default:
				alert("undefined state");
		}
	});

	socket.on('disconnect', function(){
		swal({
		  title: "Disconnect",
		  text: "sorry :(",
		  timer: 10000
		});
	});

	socket.on('message',function(data){


		Object.keys(Cities).forEach(function(ct){
			data.message = data.message.replace(ct,"<img src='flags/16/"+getCountryOfCity(ct)+".png'/>"+ct);
		});


		if(data.username == "*#SERVER#*"){
			$("#messages").append("<message><notice>"+data.message+"</notice></message>");
		}else{
			if(data.username==nickname)
				$("#messages").append("<message><img src='"+data.icon+"'/><username class='yourname'>"+data.username+"</username><post>"+data.message+"</post></message>");
			else
				$("#messages").append("<message><img src='"+data.icon+"'/><username>"+data.username+"</username><post>"+data.message+"</post></message>");
		}
		$('#messages').scrollTop($('#messages')[0].scrollHeight);
	});

	socket.on('queue status',function(data){
		if(data.searching){
			$('#matchmaking_searching').show();
			$('#matchmaking_play_btn').hide();
			$('#matchmaking_cancel_btn').show();
			$('#matchmaking_exit_btn').hide();
			var mins = Math.floor(data.elapsed / 60);
			var secs = data.elapsed % 60;
			if(secs < 10) secs = '0' + secs;
			$('#matchmaking_timer').text(mins + ':' + secs);
		} else {
			$('#matchmaking_searching').hide();
			$('#matchmaking_play_btn').show();
			$('#matchmaking_cancel_btn').hide();
			$('#matchmaking_exit_btn').show();
			$('#matchmaking_timer').text('0:00');
		}
	});


	var game_status="start";
	socket.on('global data', function(data){
		Countries = $.extend(true,Countries,data.Countries);
		game_status = data.Status;
		if(game_status === "playing"){
			$("#strategy_select").fadeOut(500);
		}
		InterfaceUpdateCities();
		InterfaceUpdateCards();
		updateBillboards();
	});
	
	var _diff = 0;
	socket.on('private data', function(data){
		Countries[your_county] = $.extend(true,Countries[your_county],data);
		_diff = ( Countries[your_county].date - Date.now() );
		Countries[your_county].busy = Countries[your_county].busy - _diff; // zaman farkını yok et;
		var nukeI=0,defI=0;
		resetUIicons();
		for( var ct in Countries[your_county].cities ){
			var city = Countries[your_county].cities[ct];
			if(city.build){
				var pos = new GPos(city.position.lat,city.position.lon);
				if(city.build.type=="nuclear"){
					city.build.usable = city.build.usable - _diff;
					nukeicon[nukeI].position.copy(pos.toVector3(0.5152));
					nukeI++;
				}
				else if(city.build.type=="airdefense"){
					deficon[defI].position.copy(pos.toVector3(0.5152));
					defI++;
				}
				else if(city.build.type=="center"){
					centericon.position.copy(pos.toVector3(0.5152));
				}
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
		builds = [];
		rocket_configrations = [];
	});

	$('#strategy_aggressive').click(function(){
		socket.emit('select strategy', 'aggressive');
		$('.strategy_btn').removeClass('strategy_selected');
		$(this).addClass('strategy_selected');
	});
	$('#strategy_defensive').click(function(){
		socket.emit('select strategy', 'defensive');
		$('.strategy_btn').removeClass('strategy_selected');
		$(this).addClass('strategy_selected');
	});

	$('#info_close_btn').click(function(){
		block_window_click = true;
		$('#info').fadeOut();
	});

	socket.on('move canceled', function(target){
		builds.forEach(function (build) {
			if(build.target == target)
				build.ends=0;
		});
	});

	var builds = [];
	var rocket_configrations = [];
	
	socket.on('move',function(Move){
		if(Move.type == "rocket"){
				var configration = {
						start : Move.from,
						target : Move.target,
						date : (Move.now-_diff),
						ends : (Move.ends-_diff)
				};
				var rocket = new Rocket(configration);
				rocket.AD = Move.AD;
				configration.id = rocket.id;
				configration.date = rocket.arriveTime;
				rocket_configrations.push(configration);

				Notice("<b lang='en'>Missile launched from</b> "+Move.from+" <b lang='en'>Target</b>: "+Move.target);


				if(getCountryOfCity(Move.from) == your_county){
					// bu hamleyi sen yaptıysa
					camera.follow = true;
					camera.target = rocket;
				}

				InterfaceUpdateCards();

		}else if(Move.type == "build" || Move.type == "clear" || Move.type == "airdefense"){
			Move.ends -= _diff;
			builds.push(Move);
		}else if(Move.type == "swap"){
			Move.ends -= _diff;
			builds.push({
				target : Move.target,
				ends : Move.ends
			});
			builds.push({
				target : Move.from,
				ends : Move.ends
			});
		}

		InterfaceUpdateCities();
	});

	socket.on('intercept', function(data){
		var attacker = RocketController.rockets.find(function(rocket){
			return (rocket.start == data.from) && (rocket.target == data.target);
		});

		if(attacker){
			attacker.interceptTime = Date.now() + data.duration;
			attacker.onAir = true;
			var dInt = (attacker.interceptTime - attacker.launchTime) / (attacker.arriveTime - attacker.launchTime);
			var interceptPoint = attacker.startPoint.lerp(attacker.targetPoint, dInt);
			attacker.interceptPoint = interceptPoint;

			var adStart = new GPos(
				city_list[data.def].position.lat,
				city_list[data.def].position.lon
			);

			var defRocket = new Rocket({
				start: adStart,
				target: interceptPoint,
				date: Date.now(),
				ends: attacker.interceptTime
			});
			defRocket.AD = true;
			defRocket.onAir = true;
			defRocket.endAltitude = Math.abs(dInt * dInt - dInt) * RocketController.standarts.maxAltitude;
		}

		Notice("<b lang='en'>Air defense missile launched from</b> " + data.def);
	});


	$("#chatinput").keydown(function(e){
		if(e.keyCode==13){
			if($("#chatinput").val().length==0) return;
			socket.emit('sending message',$("#chatinput").val());
			$("#chatinput").val('');
		}
	});

	$(".bugreport").click(function(e){
			swal({
			  title: "Bug report",
			  text: "Please write the issue",
			  type: "input",
			  showCancelButton: true,
			  closeOnConfirm: false,
			  animation: "slide-from-top",
			  inputPlaceholder: "issue"
			},
			function(inputValue){
			  if (inputValue === false) return false;
			  
			  if (inputValue === "") {
			    swal.showInputError("You need to write something!");
			    return false
			  }

			  socket.emit('bug report',inputValue);
			  
			  swal("Thank you!", "We will try to fix", "success");
			});

			
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
		Object.keys(Cities).forEach(function(ct){
			data = data.replace(ct,"<img src='flags/16/"+getCountryOfCity(ct)+".png'/>"+ct);
		});
		$("#messages").append("<message><notice>"+data+"</notice></message>");
		$('#messages').scrollTop($('#messages')[0].scrollHeight);
	}
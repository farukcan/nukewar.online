		$.fn.setProgressBar = function(val,label){
			if(val>100) val=100;
			$(this).find(".progress").css("width",val+"%");
			if(label)
				$(this).find(".progresslabel").html(label);
			else
				$(this).find(".progresslabel").html(val+"%");
		}


	//////////////////////////////////////////////////////////////////////////////////
	//		interface
	//////////////////////////////////////////////////////////////////////////////////

	var w_html="";
	var selected_city="Ankara";
	var your_county = "Turkey";
	var nickname="";

	for(country in Countries){
		w_html+="<table><tr><td><img src='flags/16/"+country+".png'/></td><td id='countryname_"+country+"'>"+country+"</td></tr></table>";
		w_html+="<select class='city_select' id='cityselect_"+country+"'>";
		w_html+="<option value='none'>information</option>";
		for(cityname in Countries[country].cities){
			var city = Countries[country].cities[cityname];
			w_html+="<option value='"+cityname+"'>"+cityname+"</option>";
		}
		w_html+="</select>";

	}

	$("#world").html(w_html);

	$(".city_select option[value='none']").html("Select a City");


	$(".city_select").change(function(e){
		var city_name = $(e.target).val();
		selected_city = city_name;
		InterfaceOnSelectCity();

	});



	function getCity(city_name){
		return city_list[city_name];
	}

	function InterfaceGOTOCity(city_name){
		var city = getCity(city_name);
		var pos = new GPos(city.position.lat,city.position.lon);
		camera.GoTo(pos);
		targeticon.position.copy(pos.toVector3(0.5152));
	}

	function InterfaceResetWorld(){
		$(".city_select").each(function(i,a){
			if($(a).val()!=selected_city)
				$(a).val("none");
		});
	}

	function InterfaceOnSelectCity(dontgo){
		if(dontgo){}
		else {
			InterfaceGOTOCity(selected_city);
		}
		if(currentState != 'game') return;

		InterfaceResetWorld();
		$("target").html(selected_city);
		$("#control").fadeIn();

		InterfaceUpdateSelectors();
		InterfaceUpdateCards();
		InterfaceUpdateCities();



	}

	function InterfaceUpdateCards(){
		InterfaceMakeCardDisabled();

			var city = getCity(selected_city);

			if(isYourCity(selected_city)){
				if(city.bombed){
					InterfaceMakeCardActive("clear");
					InterfaceSetInfo('clear',RemainTime(NukewarStandarts.ClearCost));
				}
				else{
					InterfaceMakeCardPassive("clear");
					InterfaceSetInfo('clear',translate('City is not damaged'));


					InterfaceMakeCardActive("swap");
					InterfaceSetInfo('swap',RemainTime(NukewarStandarts.SwapCost));

					if(city.build){
						InterfaceMakeCardPassive("build");
						InterfaceSetInfo('build',translate('City is not empty'));
						InterfaceMakeCardPassive("defense");
						InterfaceSetInfo('defense',translate('City is not empty'));
					}else{
						InterfaceMakeCardActive("build");
						InterfaceSetInfo('build',RemainTime(NukewarStandarts.BuildCost));
						InterfaceMakeCardActive("defense");
						InterfaceSetInfo('defense',RemainTime(NukewarStandarts.AirDefenseCost));
					}

					InterfaceSetInfo('nuke',translate('City is yours'));
					
				}

			}else if(game_status == "start"){
				// oyun başlamamışsa roket fırlatılamaz
				InterfaceMakeCardPassive("nuke");
				InterfaceSetInfo('nuke',translate('Game has not started yet'));

				InterfaceSetInfo('clear',translate('It is not your city'));
				InterfaceSetInfo('swap',translate('It is not your city'));
				InterfaceSetInfo('build',translate('It is not your city'));
				InterfaceSetInfo('defense',translate('It is not your city'));

			}else{

				// targete göre mesefa
				// froma göre uygunluk
				if(!city.bombed){
					var from = getCity($("#missilefrom select").val());
					if(from && from.build && from.build.usable < Date.now()){
						InterfaceMakeCardActive("nuke");
						InterfaceSetInfo('nuke',RemainTime(RocketController.calcTime(from,city)));
					}else{
						InterfaceMakeCardPassive("nuke");
						InterfaceSetInfo('nuke',translate('Missile launcher is not ready'));
					}
				}else{
					InterfaceMakeCardPassive("nuke");
					InterfaceSetInfo('nuke',translate('City is bombed'));
				}



				InterfaceSetInfo('clear',translate('It is not your city'));
				InterfaceSetInfo('swap',translate('It is not your city'));
				InterfaceSetInfo('build',translate('It is not your city'));
				InterfaceSetInfo('defense',translate('It is not your city'));
			}


			var outcoming_old = "";
			var outcoming_now = "";
			var incoming_old = "";
			var incoming_now = "";

			var hasOut=false;
			var hasIn=false;


			rocket_configrations.forEach(function(conf){
				if(conf.target == selected_city ){
					// incoming
					hasIn=true;
					if(conf.date > Date.now() ){
						incoming_now += '<div class="iprogressbar" text="'+conf.start+'" id="irocket'+conf.id+'"><div class="progress" style="background-color: rgba(255,55,77,0.5)"><div class="progresslabel">-</div></div></div>';
					}else {
						// old
						incoming_old += conf.start + " ,";
					}

				}else if(conf.start == selected_city){
					// outcoming
					hasOut=true;
					if(conf.date > Date.now() ){
						// now
						outcoming_now += '<div class="iprogressbar" text="'+conf.target+'" id="irocket'+conf.id+'"><div class="progress" style="background-color: rgba(0,44,142,0.5)"><div class="progresslabel">-</div></div></div>';
					}else {
						outcoming_old += conf.target + " ,";
					}

				}
			});

			var cc = getCountryOfCity(selected_city);

			if(cc==your_county){
				$("#selected_country").html("<img src='flags/16/"+cc+".png'/><span class='yourname'>"+Countries[cc].name+"</span> <span lang='en'>(you)</span>");
				var t = "city";
				if(Cities[selected_city].build) t = Cities[selected_city].build.type;
				if(Cities[selected_city].bombed) 
					$("#cityinf").html("Your city is bombed. Please clear this city");
				else
					$("#cityinf").html($("#inf"+t).html());
			}
			else{
				$("#selected_country").html("<img src='flags/16/"+cc+".png'/>"+Countries[cc].name+"</span> <span lang='en'>(enemy)</span>");
				if(Cities[selected_city].bombed) 
					$("#cityinf").html("City is bombed");
				else
					$("#cityinf").html("You should destroy this city if the command center is here");
			}	


			$("#selected_country_population").html((Cities[selected_city].population+Math.floor(Math.random()*10)).toString().replace(/\B(?=(\d{3})+(?!\d))/g, ","));
			$("#outcoming_old").html(outcoming_old);
			$("#outcoming_now").html(outcoming_now);
			$("#incoming_old").html(incoming_old);
			$("#incoming_now").html(incoming_now);

			if(hasOut)
				$("#outmissiles_p").show();
			else
				$("#outmissiles_p").hide();

			if(hasIn)
				$("#inmissiles_p").show();
			else
				$("#inmissiles_p").hide();


			$(".iprogressbar").click(function(){

				var e = $(this);

				var rocket = getRocketById(Number(e.attr("id").replace('irocket','')));

				if(rocket==false) return;

				block_window_click = true;
				camera.follow = true;
				camera.target = rocket;

			});
	}

	function isYourCity(name){
		return getYourCountry().cities[name] ? true : false;
	}

	function getYourCountry(){
		return Countries[your_county];
	}

	function InterfaceMakeCardDisabled(name){
		if(name){
			$("#"+name+"Td").css("opacity",0.4);
			return;
		}
		$(".card").css("opacity",0.4);
	}

	function InterfaceMakeCardPassive(name){
		$("#"+name+"Td").css("opacity",0.6);
	}

	function InterfaceMakeCardActive(name){
		$("#"+name+"Td").css("opacity",1);
	}

	function InterfaceSetInfo(card,info){
		$("#"+card+"Td inf").html(info);
	}

	function InterfaceHideCards(){
		$(".card").hide();
	}

	function InterfaceHideBuildCards(){
		$("#buildTd").hide();
		$("#defenseTd").hide();
		$("#swapTd").hide();
		$("#clearTd").hide();
	}

	function InterfaceShowCards(){
		$(".card").fadeIn();
	}

	var currentState = 'main';
	function InterfaceSetState(state){
		var delay=3000;
		currentState = state;
		if( state == 'main' ) {

			InterfaceOpenPanels(["start"],delay);

			InterfaceClosePanels(["mycities","matchmaking","chat","world","control","status","gameover","info"],100);

			$("#nick").focus();

		}else if( state == 'matchmaking' ){

			$("#start").hide();
			InterfaceOpenPanels(["chat","matchmaking"],100);

			InterfaceClosePanels(["mycities","world","control","status","gameover","info"],100);

		}else if( state == 'game' ){

			InterfaceOpenPanels(["mycities","chat","world","status","info"],100);

			InterfaceClosePanels(["matchmaking","start","control","gameover"],100);


		}else if( state == 'gameover' || state == "win"){

			InterfaceOpenPanels(["chat","gameover"],100);

			InterfaceClosePanels(["world","status","mycities","matchmaking","start","control","info"],100);

			if(state == "win"){
				$("#youwon").show();
			}else{
				$("#youwon").hide();
			}

		}

	}

	function InterfaceOpenPanels(panels,delay){
		panels.forEach(function(panel){
			$("#"+panel).fadeIn(delay);
		});
	}

	function InterfaceClosePanels(panels,delay){
		panels.forEach(function(panel){
			$("#"+panel).fadeOut(delay);
		});
	}

	function InterfaceUpdateCities(){
		$("#mycities").html("");

		// global dataya göre güncelleme yap
		for(country in Countries){
			var Country = Countries[country];
			if(country==your_county)
				$("#countryname_"+country).html("<b class='yourname'>"+Country.name+"</b>");
			else
				$("#countryname_"+country).html(Country.name);

			if(Country.lose){
				$("#countryname_"+country).css('text-decoration','line-through');
				if($("#cityselect_"+country).is(":visible"))
					$("#cityselect_"+country).fadeOut(10000);
			}
			else{
				$("#cityselect_"+country).show();
				$("#countryname_"+country).css('text-decoration','none');
			}

			var citynum = 0;
			for(var cityname in Country.cities){
				var city = Country.cities[cityname];
			
				if(Country.isYou){

					if(city.bombed)
						var html="<citycard class='citybombed' for='"+cityname+"'>";	
					else{
						var html="<citycard for='"+cityname+"'>";
					}

					html+= "<h1>"+cityname+"</h1>";

					var buiding = false;
					var ends;
					builds.forEach(function(b){
						if(b.target == cityname){
							if(b.ends > Date.now()){
								buiding = true;
								ends = b.ends;
							}
						}
					});

					if(buiding && Countries[your_county].busy>Date.now() ){
						html += "<countdown class='bcount' to='"+ends+"' trigger='InterfaceOnSelectCity(true)'></countdown>";
					}else if(city.build){
						if( city.build.type=="nuclear" && city.build.usable > Date.now() ){
							html += "<countdown class='ncount' to='"+city.build.usable+"' trigger='InterfaceOnSelectCity(true)'></countdown>";
						}else{
							html+= '<img src="images/'+city.build.type+'.svg" width="18px" />';
						}
					}else{
							html+= '<img src="images/city.svg" width="18px" />';
					}
					html+="</citycard>";
					$("#mycities").append(html);
				}

				if(!city.bombed)
					citynum++;

			}

			if(citynum!=0)
				$("#cityselect_"+country).find("option[value='none']").html(citynum+" "+translate("City Left"));
			else
				$("#cityselect_"+country).find("option[value='none']").html(translate("Defeated"));				

		}


		$("citycard").click(function(){
			block_window_click = true;
			selected_city = $(this).attr('for');
			InterfaceOnSelectCity();
		});


		if(Countries[your_county].busy > Date.now() )
			InterfaceHideBuildCards();
		else
			InterfaceShowCards();

		InterfaceUpdateStatus();

	}

	function InterfaceUpdateStatus(){
		if(Countries[your_county].busy < Date.now() )
			$("#status").html('<center><span lang="en">Select a city and make your move</span></center>');
		else{
			$("#status").html('');
			var cancelbtn = ""
			if(game_status!="start")
				cancelbtn="<button class='btn cancelMove' lang='en'>Cancel</button>";

			$("#status").append("<center><hr/><countdown class='tcount' to='"+Countries[your_county].busy+"' trigger='InterfaceOnSelectCity(true)'></countdown><br/>"+cancelbtn+"<hr/></center>") ;

			$(".cancelMove").click(function(){
				socket.emit('cancel move');
			});
		}


		var outcoming = getOutComingRockets();
		var incoming = getInComingRockets();

		outcoming.forEach(function(rocket){
			if(rocket.blocked)
				$("#status").append('<div class="progressbar" id="rocket'+rocket.id+'"><div class="progress" style="background-color:grey"><div class="progresslabel">-</div></div></div>');
			else if(rocket.defense)
				$("#status").append('<div class="progressbar" id="rocket'+rocket.id+'"><div class="progress" style="background-color:cyan"><div class="progresslabel">-</div></div></div>');
			else
				$("#status").append('<div class="progressbar" id="rocket'+rocket.id+'"><div class="progress"><div class="progresslabel">-</div></div></div>');
			
			$("#rocket"+rocket.id).click(function(){
				block_window_click = true;
				camera.follow = true;
				camera.target = rocket;
			});

		});
		incoming.forEach(function(rocket){
			if(rocket.blocked)
				$("#status").append('<div class="progressbar" id="rocket'+rocket.id+'"><div class="progress" style="background-color:orange"><div class="progresslabel">-</div></div></div>');
			else if(rocket.defense)
				$("#status").append('<div class="progressbar" id="rocket'+rocket.id+'"><div class="progress" style="background-color:cyan"><div class="progresslabel">-</div></div></div>');
			else	
				$("#status").append('<div class="progressbar" id="rocket'+rocket.id+'"><div class="progress" style="background-color:red"><div class="progresslabel">-</div></div></div>');
		
			$("#rocket"+rocket.id).click(function(){
				block_window_click = true;
				camera.follow = true;
				camera.target = rocket;
			});
		});		


		InterfaceLoop();
	}

	function InterfaceUpdateSelectors(){

		var missiles_with_distance = [];
		var cities = [];

		var selectedCity = getCity(selected_city);

		for(country in Countries){
			var Country = Countries[country];

			if(Country.isYou){

				for(var cityname in Country.cities){
					if(cityname == selected_city) continue;

					var city = Country.cities[cityname];

					if(!city.bombed){
						if(city.build && city.build.type == "nuclear" && city.build.usable < Date.now()){
							missiles_with_distance.push({
								name : cityname,
								distance : ((new GPos(city.position.lat,city.position.lon)).distanceBetween((new GPos(selectedCity.position.lat,selectedCity.position.lon))))
							});
						}
						cities.push(cityname);
					}


				}
					
			}

		}

		missiles_with_distance.sort(function(a,b){ return a.distance - b.distance });

		var missiles = [];
		missiles_with_distance.forEach(function(m){ missiles.push(m.name) });

		$("missileselector").each(function(){
			InterfaceRefreshSelector($(this), missiles);
		});

		$("cityselector").each(function(){
			InterfaceRefreshSelector($(this), cities);
		});
	}

	// Rebuild a selector's <select> only when options actually change,
	// and preserve the previously selected value when possible.
	function InterfaceRefreshSelector($container, options){
		var $select = $container.find("select");
		var prevValue = $select.val();

		var currentOptions = [];
		$select.find("option").each(function(){ currentOptions.push(this.value); });

		var same = currentOptions.length === options.length;
		if(same){
			for(var i=0; i<options.length; i++){
				if(currentOptions[i] !== options[i]){ same = false; break; }
			}
		}

		if(same) return;

		var html = "<select>";
		options.forEach(function(o){
			html += "<option value='"+o+"'>"+o+"</option>";
		});
		html += "</select>";
		$container.html(html);

		if(prevValue && options.indexOf(prevValue) !== -1){
			$container.find("select").val(prevValue);
		}
	}

	function Exit(){
		socket.emit('exit');
	}


	$(function(){
		


		$("#playform").submit(function(){
			socket.emit('nick',$("#nick").val());
			nickname = $("#nick").val();
			return false;
		});

		$('#matchmaking_play_btn').click(function(){
			socket.emit('queue');
		});

		$('#matchmaking_cancel_btn').click(function(){
			socket.emit('cancel queue');
		});

		$('#matchmaking_exit_btn').click(function(){
			Exit();
		});


		$("#nukeButton").click(function(){
			block_window_click = true;
			socket.emit('launch nuclear missile',{
				target : selected_city,
				from : $("#missilefrom select").val()
			});
		});

		$("#clearButton").click(function(){
			block_window_click = true;
			socket.emit('clear area',selected_city);
		});

		$("#swapButton").click(function(){
			block_window_click = true;
			socket.emit('transport',{
				target : selected_city,
				from : $("#cityfrom select").val()
			});
		});

		$("#buildButton").click(function(){
			block_window_click = true;
			socket.emit('build missile launcher',selected_city);
		});
		$("#defenseButton").click(function(){
			block_window_click = true;
			socket.emit('build air defense',selected_city);
		});

		$("missileselector").click(function(){
			block_window_click = true;
		});

		$("cityselector").click(function(){
			block_window_click = true;
		});
		$("#chat").click(function(){
			block_window_click = true;
		});

		$("#world").click(function(){
			block_window_click = true;
		});
		var old_link="non";
		$(".help").click(function () {
				var link = "docs/"+window.lang.currentLang+"/help.html";
				$("#help").fadeIn(500);
				if(old_link!=link){
					old_link=link;
					$("#helpiframe").attr("src",link);
					$('#helpiframe').load(function(){ 
					    $(this).contents().find('body').css("margin-left", "20%");
					    $(this).contents().find('body').css("margin-right", "20%");
					    $(this).contents().find('body').css("background-color", "white");
					});
				}

		});


		$(window).keyup(function(e){ 
		    var code = e.which; // recommended to use e.which, it's normalized across browsers
		    if(code==13){
		    	e.preventDefault();
		        $("#chatinput").focus();
		    } 
		});
		setInterval(InterfaceLoop,1000);
	});

	function RemainTime(mili){
		if(mili<0) mili = 0;
		var sec = Math.round(mili/1000);
		var s=(sec%60);
		if(s<10)
			s="0"+s;
		return Math.floor(sec/60)+":"+s;
	}


	function InterfaceLoop(){
		$("notice").fadeOut(20000);
		$(".progressbar").each(function(){
			var e = $(this);

			var rocket = getRocketById(Number(e.attr("id").replace('rocket','')));

			if(rocket==false) return;

			var p = Math.round(( 1 - (rocket.arriveTime-Date.now() ) / (rocket.arriveTime-rocket.launchTime) )*100);

			e.setProgressBar(p,rocket.target+" "+RemainTime(rocket.arriveTime-Date.now()));

		});

		$(".iprogressbar").each(function(){
			var e = $(this);

			var rocket = getRocketById(Number(e.attr("id").replace('irocket','')));

			if(rocket==false) return;

			var p = Math.round(( 1 - (rocket.arriveTime-Date.now() ) / (rocket.arriveTime-rocket.launchTime) )*100);

			e.setProgressBar(p,e.attr("text")+" "+RemainTime(rocket.arriveTime-Date.now()));

		});

		$("countdown").each(function(){
			var e = $(this);

			var to = Number(e.attr('to'));

			var remain = to-Date.now();

			if(remain<1000 && !sound_ready.playing() && e.attr('played')!="true"){
				e.attr('played',"true")
				sound_ready.play();
			}

			e.html(RemainTime(remain));

			if(remain<0)
				eval(e.attr('trigger'));
		});

		// Refresh button states every second (for time-based updates like missile launcher ready).
		// Selectors must be refreshed BEFORE cards, because InterfaceUpdateCards reads the
		// currently selected launcher from #missilefrom select to decide if the nuke card is active.
		if(currentState === 'game' && selected_city) {
			InterfaceUpdateSelectors();
			InterfaceUpdateCards();
		}
	}


$(show_one_update);



function show_one_update(){
	$(".show_one_child").each(function(i,e){
		var elem = $(e);

		var childs = elem.children();
		var i = Math.floor(Math.random()*childs.length);
		childs.hide();
		console.log(i,childs[i])
		$(childs[i]).show();
		setTimeout(show_one_update,10000);
	});
}
	// Bir WebGL renderi oluştur

	var renderer	= new THREE.WebGLRenderer({
		antialias	: true
	});
	// Tam ekran yap
	renderer.setPixelRatio(window.devicePixelRatio);
	renderer.setSize( window.innerWidth, window.innerHeight );
	var loop = {
		functions : []
	};
	// Dom elementini oluştur
	document.body.appendChild( renderer.domElement );

	




	var scene	= new THREE.Scene();

	var camera	= new THREE.PerspectiveCamera(45, window.innerWidth / window.innerHeight, 0.01, 100 );
	camera.position.z = 1;

	var textureLoader = new THREE.TextureLoader();

	scene.add( new THREE.AmbientLight( 0x222222 ) );

	var light	= new THREE.DirectionalLight( 0xffffff, 0.5 );
	light.position.set(5,5,5)
	scene.add( light )
	

	// Countries

	var city_list = {};

	var city_cube_list = [];
	for(country in Countries){
		for(cityname in Countries[country].cities){
			var city = Countries[country].cities[cityname];
			city_list[cityname] = city;
			console.log(country,cityname,city.population);

			var cube = new THREE.Mesh( new THREE.CubeGeometry(  0.004, 0.004, 0.00000002*city.population ), new THREE.MeshNormalMaterial() );
			cube.gPos = new GPos(city.position.lat,city.position.lon);
			cube.position.copy(cube.gPos.toVector3(0.50));
			cube.lookAt(new THREE.Vector3(0,0,0));
			scene.add( cube );
			city_cube_list.push( cube );
		}
	}


	//city_cube_list.forEach(function(cube){cube.visible=false;});






	//
	// Flares
	//

		var textureFlare0 = textureLoader.load( "textures/lensflare/lensflare0.png" );
		var textureFlare2 = textureLoader.load( "textures/lensflare/lensflare2.png" );
		var textureFlare3 = textureLoader.load( "textures/lensflare/lensflare3.png" );


		var zeropoint = new THREE.Vector3(1,0,0);

		//flare = addFlare( 0.55, 0.9, 0.5, zeropoint );
		//addLight( 0.08, 0.8, 0.5,    zeropoint );
		//addLight( 0.995, 0.5, 0.9, zeropoint );

		function addFlare( h, s, l, pos , size) {
			size = size || 0.2;
			/*var light = new THREE.PointLight( 0xffffff, 1.5, 2000 );
			light.color.setHSL( h, s, l );
			light.position.copy( pos );
			scene.add( light );*/
			var flareColor = new THREE.Color( 0xffffff );
			flareColor.setHSL( h, s, l + 0.5 );
			var lensFlare = new THREE.LensFlare( textureFlare0, 700*size, 0.0, THREE.AdditiveBlending, flareColor );
			lensFlare.add( textureFlare2, 512*size, 0.0, THREE.AdditiveBlending );
			lensFlare.add( textureFlare2, 512*size, 0.0, THREE.AdditiveBlending );
			lensFlare.add( textureFlare2, 512*size, 0.0, THREE.AdditiveBlending );
			lensFlare.add( textureFlare3, 60*size, 0.6, THREE.AdditiveBlending );
			lensFlare.add( textureFlare3, 70*size, 0.7, THREE.AdditiveBlending );
			lensFlare.add( textureFlare3, 120*size, 0.9, THREE.AdditiveBlending );
			lensFlare.add( textureFlare3, 70*size, 1.0, THREE.AdditiveBlending );
			//lensFlare.customUpdateCallback = lensFlareUpdateCallback;
			lensFlare.position.copy( pos );
			//lensFlare.add(light)
			scene.add( lensFlare );
			return lensFlare;
		}

			 function lensFlareUpdateCallback( object ) {
				var f, fl = object.lensFlares.length;
				var flare;
				var vecX = -object.positionScreen.x * 2;
				var vecY = -object.positionScreen.y * 2;
				for( f = 0; f < fl; f++ ) {
					flare = object.lensFlares[ f ];
					flare.x = object.positionScreen.x + vecX * flare.distance;
					flare.y = object.positionScreen.y + vecY * flare.distance;
					flare.rotation = 0;
				}
				object.lensFlares[ 2 ].y += 0.025;
				object.lensFlares[ 3 ].rotation = object.positionScreen.x * 0.5 + THREE.Math.degToRad( 45 );
			}


	//
	// Sun
	//

	addFlare( 0.55, 0.9, 0.5, new THREE.Vector3(50,50,50), 1 );

	//
	// Cube
	//

	world_pos = new THREE.Vector3(0,0,0);
	world_r = 0.5;
	gpos_sample = new GPos(0,0);

	//
	// Smoke
	//

	function Smoke(position,scale,fadeSpeed){

		if(scale)
			this.scale = scale;

		if(fadeSpeed)
			this.fadeSpeed = fadeSpeed;

		this.mesh= new THREE.Mesh(new THREE.IcosahedronGeometry(this.scale,1), this.mat);

		if(position)
			this.mesh.position.copy(position);

		this.noise();

		scene.add(this.mesh);

		if(SmokeController.array.length<SmokeController.arrayMeta.limit){

			SmokeController.array.push(this);

		} else {

			scene.remove(SmokeController.array[SmokeController.arrayMeta.index].mesh);
			delete SmokeController.array[SmokeController.arrayMeta.index];
			SmokeController.array[SmokeController.arrayMeta.index] = this;

		}

		SmokeController.arrayMeta.index = (SmokeController.arrayMeta.index+1) % SmokeController.arrayMeta.limit;

	}

	Smoke.prototype = {

		mat : new THREE.MeshLambertMaterial({
			color: 'white', shading: THREE.FlatShading, transparent: false
		}),

		scale : 0.0012,

		array : [],

		fadeSpeed : 0.5,

		noise : function(){
			this.mesh.position.x += this.random();
			this.mesh.position.y += this.random();
			this.mesh.position.z += this.random();			
			this.mesh.scale.x = Math.random()/2+0.75;
			this.mesh.scale.y = Math.random()/2+0.75;
			this.mesh.scale.z = Math.random()/2+0.75;
		},

		random : function(){
			return Math.random()*this.scale-this.scale/2;
		}
	}

	var SmokeController = {

		arrayMeta : {
			index : 0,
			limit : 500,
		},

		minScale : new THREE.Vector3(0.001,0.001,0.001),

		array : [],

		loop : function(Time){

			SmokeController.array.forEach(function(smoke){
					smoke.mesh.scale.lerp(SmokeController.minScale,Time.deltaTime*smoke.fadeSpeed)
			});

		},

	}


	loop.functions.push(SmokeController.loop);



	//
	//	Rocket
	//


	function Rocket( config ){
		this.startPoint = config.start; // gpos
		this.targetPoint = config.target ; // gpos
		this.distance = this.startPoint.distanceBetween(this.targetPoint,RocketController.standarts.realWorld);
		this.currentDistance = this.distance; // gpos.distance(gpos)
		this.launchTime = Date.now(); // date
		this.arriveTime = Date.now()+this.distance/RocketController.standarts.speed;
		this.mesh = new THREE.Mesh( new THREE.BoxGeometry( 0.0005, 0.0005, 0.005 ), new THREE.MeshBasicMaterial( { vertexColors: THREE.FaceColors, overdraw: 0.5 } ) );
		this.flare = addFlare( 0.55, 0.9, 0.5, zeropoint );

		scene.add(this.mesh);
		this.id = RocketController.rocketCount++;
		RocketController.rockets.push(this);
	}

	Rocket.prototype = {
		remove : function(){
			// meshi
			// flaresi
			// ve diziden silinmeli
			console.log("BOOOOMMMM");
		}
	};

	RocketController = {
		rocketCount : 0,

		standarts : {
			realWorld : 6371,
			maxAltitude : 0.75,
			speed : 0.1
		},

		rockets : [],

		update : function(Time){

			RocketController.rockets.forEach(function(rocket){

				if( rocket.arriveTime<Date.now() ) return rocket.remove();

				var d = ( 1 - (rocket.arriveTime-Date.now() ) / (rocket.arriveTime-rocket.launchTime) ); // yolun oransal gidilme miktarı

				var position = rocket.startPoint.lerp(rocket.targetPoint , d ); // global olarak şuanki konum


				rocket.currentDistance = position.distanceBetween(rocket.targetPoint,RocketController.standarts.realWorld); // şuanki hedefe mesafe


				if(rocket.currentDistance<0)
					rocket.currentDistance = 0;

				position = position.toVector3(world_r + Math.abs(d*d-d) * RocketController.standarts.maxAltitude); // meshin konum ve yüksekliği

				rocket.mesh.lookAt(position); // hareket noktasına bak

				rocket.mesh.position.copy(position); // meshi konumunu set


				rocket.flare.position.copy( rocket.mesh.position ); // flare set

				new Smoke(rocket.mesh.position); // duman çıkart

			});

		}
	};
	loop.functions.push(RocketController.update);



	/*setInterval(function(){
		new Rocket({
			start : new GPos(0,0),
			target : new GPos(Math.random()*90-45,Math.random()*90-45)
		});
	},10000);*/


	var a = new Rocket({
			start : new GPos(90,0),
			target : new GPos(-90,0)
	});
	var b = new Rocket({
			start : new GPos(0,-180),
			target : new GPos(0,0)
	});
	/*new Rocket({
		start : new GPos(0,0),
		target : new GPos(41.008238,28.978359)
	});

	new Rocket({
		start : new GPos(0,0),
		target : new GPos(-41.008238,28.978359)
	});

	new Rocket({
		start : new GPos(0,0),
		target : new GPos(-41.008238,-28.978359)
	});

	new Rocket({
		start : new GPos(0,0),
		target : new GPos(41.008238,-28.978359)
	});

	new Rocket({
		start : new GPos(0,0),
		target : new GPos(-90,-28.978359)
	});

	new Rocket({
		start : new GPos(0,0),
		target : new GPos(90,-28.978359)
	});*/

	//
	// Efects
	//

    var composer = new THREE.EffectComposer(renderer);
    composer.addPass(new THREE.RenderPass(scene, camera));
    var glitchPass = new THREE.GlitchPass;
    glitchPass.renderToScreen = true;
    glitchPass.goWild = true;

    setTimeout(function(){
    	glitchPass.goWild = false;
    },1000);
    composer.addPass(glitchPass);
	
	//////////////////////////////////////////////////////////////////////////////////
	//		added starfield							//
	//////////////////////////////////////////////////////////////////////////////////
	
	var starSphere	= THREEx.Planets.createStarfield()
	scene.add(starSphere)

	//////////////////////////////////////////////////////////////////////////////////
	//		add an object and make it move					//
	//////////////////////////////////////////////////////////////////////////////////


	var containerEarth	= new THREE.Object3D()
	containerEarth.position.z	= 0
	scene.add(containerEarth)

	var earthMesh	= THREEx.Planets.createEarth()

	containerEarth.add(earthMesh)

	var geometry	= new THREE.SphereGeometry(0.5, 32, 32)
	var material	= THREEx.createAtmosphereMaterial()
	material.uniforms.glowColor.value.set(0x00b3ff)
	material.uniforms.coeficient.value	= 0.8
	material.uniforms.power.value		= 2.0
	var mesh	= new THREE.Mesh(geometry, material );
	mesh.scale.multiplyScalar(1.01);
	containerEarth.add( mesh );

	var geometry	= new THREE.SphereGeometry(0.5, 32, 32)
	var material	= THREEx.createAtmosphereMaterial()
	material.side	= THREE.BackSide
	material.uniforms.glowColor.value.set(0x00b3ff)
	material.uniforms.coeficient.value	= 0.5
	material.uniforms.power.value		= 4.0
	var mesh	= new THREE.Mesh(geometry, material );
	mesh.scale.multiplyScalar(1.15);
	containerEarth.add( mesh );
	// new THREEx.addAtmosphereMaterial2DatGui(material, datGUI)

	var earthCloud	= THREEx.Planets.createEarthCloud()
	earthCloud.receiveShadow	= true
	earthCloud.castShadow	= true
	containerEarth.add(earthCloud)
	loop.functions.push(function(Time){
		earthCloud.rotation.y += 1/32 * Time.deltaTime;		
	});


	//////////////////////////////////////////////////////////////////////////////////
	//		client
	//////////////////////////////////////////////////////////////////////////////////

	var socket = io('localhost:3000');

	socket.on('hello',function(){
		resetCountries();
	});

	socket.on('disconnect', function(){
		alert("disconnected");
	});

	socket.on('message',function(data){
		console.log(data);
		$("#messages").append("<message><username>"+data.username+"</username><post>"+data.message+"</post></message>");
		$('#messages').scrollTop($('#messages')[0].scrollHeight);
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
			Countries[country].kills = 0;
		}

		resetCities();
	}

	function resetCities(){
		
		for(city_name in city_list){
			city_list[city_name].bombed = false;
			city_list[city_name].build = false;
		}
	}


	//////////////////////////////////////////////////////////////////////////////////
	//		interface
	//////////////////////////////////////////////////////////////////////////////////

	var w_html="";
	var selected_city;
	var your_county = "Turkey";

	for(country in Countries){
		w_html+="<table><tr><td><img src='flags/16/"+country+".png'/></td><td>"+country+"</td></tr></table>";
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
		camera_gpos = new GPos(city.position.lat,city.position.lon);
	}

	function InterfaceResetWorld(){
		$(".city_select").each(function(i,a){
			if($(a).val()!=selected_city)
				$(a).val("none");
		});
	}

	function InterfaceOnSelectCity(){
		InterfaceGOTOCity(selected_city);
		InterfaceResetWorld();
		$("target").html(selected_city);
		$("#control").fadeIn();

		
		InterfaceMakeCardDisabled();

		var city = getCity(selected_city);

		if(isYourCity(selected_city)){
			if(city.bombed){
				InterfaceMakeCardActive("clear");
				InterfaceSetInfo('clear',translate('60 sec'));
			}
			else{
				InterfaceMakeCardPassive("clear");
				InterfaceSetInfo('clear',translate('City is not damaged'));
			}

			InterfaceMakeCardActive("swap");

			if(city.build){
				InterfaceMakeCardPassive("build");
				InterfaceSetInfo('build',translate('City is not empty'));
			}else{
				InterfaceMakeCardActive("build");
			}

			InterfaceSetInfo('nuke',translate('City is yours'));
		}else{

			// bombalanmadıysa?
			InterfaceMakeCardPassive("nuke");
			InterfaceSetInfo('nuke',translate('x sec'));


			InterfaceSetInfo('clear',translate('It is not your city'));
			InterfaceSetInfo('swap',translate('It is not your city'));
			InterfaceSetInfo('build',translate('It is not your city'));
		}
	}

	function isYourCity(name){
		return getYourCountry().cities[name] ? true : false;
	}

	function getYourCountry(){
		return Countries[your_county];
	}

	function InterfaceMakeCardDisabled(name){
		if(name){
			$("#"+name+"Td").css("opacity",0.2);
			return;
		}
		$(".card").css("opacity",0.2);
	}

	function InterfaceMakeCardPassive(name){
		$("#"+name+"Td").css("opacity",0.4);
	}

	function InterfaceMakeCardActive(name){
		$("#"+name+"Td").css("opacity",1);
	}

	function InterfaceSetInfo(card,info){
		$("#"+card+"Td inf").html(info);
	}

	$(function(){
		$("#start").fadeIn(3000);
	});


	//
	// Multi Lang
	//

	function translate(string){
		return string;
	}


	// Statics
	loop.functions.push(function(Time){
		$("killed").each(function(i,e){
			var element = $(e);
			if(element.attr('enabled')==1){
				var cur = element.attr('current');
				var tar = element.attr('target');
				var val = Math.round(lerp(cur,tar,Math.min(Time.deltaTime,1)));
				val++;				


				if(val >= tar){
					element.attr('enabled',0);
					val = tar;
				}

				element.attr('current',val);
				element.html(val.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ","));
			}
		});
	});



	function lerp(a,b,d){
		return (1-d) * a + d * b;
	}

	


	//////////////////////////////////////////////////////////////////////////////////
	//		Camera Controls							//
	//////////////////////////////////////////////////////////////////////////////////

	var mouse	= {
		down : false,
		downPosition : new THREE.Vector2(),
		position : new THREE.Vector2()
	}

	document.body.onmousedown = function() { 
	  mouse.down = true;
	  mouse.downPosition.copy(mouse.position);
	}
	document.body.onmouseup = function() {
	  mouse.down = false;
	}


	document.addEventListener('mousemove', function(event){
		mouse.position.x	= (event.clientX / window.innerWidth ) - 0.5
		mouse.position.y	= (event.clientY / window.innerHeight) - 0.5
	}, false)


	var myimage = document.getElementById("interface");

	if (myimage.addEventListener) {
		// IE9, Chrome, Safari, Opera
		myimage.addEventListener("mousewheel", MouseWheelHandler, false);
		// Firefox
		myimage.addEventListener("DOMMouseScroll", MouseWheelHandler, false);
	}
	// IE 6/7/8
	else myimage.attachEvent("onmousewheel", MouseWheelHandler);

	function MouseWheelHandler(){
		var e = window.event || e; // old IE support
		var delta = Math.max(-1, Math.min(1, (e.wheelDelta || -e.detail)));

		if(delta<0){
			camera_r*=1.05;
		}else{
			camera_r/=1.05;
		}


		camera_r = Math.min(camera_r,2.6);
		camera_r = Math.max(camera_r,world_r);

	}

	var old_mouse_pos = new THREE.Vector2();
	var camera_gpos = new GPos(41.008238,28.978359);
	var camera_sens = 5000;
	var camera_r=2.2;
	loop.functions.push(function(Time){
		/*camera.position.x += (mouse.position.x*5 - camera.position.x) * (Time.deltaTime*3)
		camera.position.y += (mouse.position.y*5 - camera.position.y) * (Time.deltaTime*3)*/

		if(mouse.down){

			var diff = new THREE.Vector2().subVectors(old_mouse_pos,mouse.position);
			camera_gpos.lon+=diff.x*Time.deltaTime*camera_sens;
			camera_gpos.lat-=diff.y*Time.deltaTime*camera_sens;
			camera_gpos.limit();

		}else{
			camera_gpos.lon+=Time.deltaTime/10;
			camera_gpos.limit();
		}

		camera.position.lerp( camera_gpos.toVector3(camera_r) , Time.deltaTime);

		old_mouse_pos.copy(mouse.position);

		camera.lookAt( scene.position )
	})


	//////////////////////////////////////////////////////////////////////////////////
	//		render the scene						//
	//////////////////////////////////////////////////////////////////////////////////
	loop.functions.push(function(){
		composer.render();
	});
	
	//////////////////////////////////////////////////////////////////////////////////
	//		loop runner							//
	//////////////////////////////////////////////////////////////////////////////////
	var lastTimeMsec= null
	requestAnimationFrame(function animate(nowMsec){
		// keep looping
		requestAnimationFrame( animate );
		// measure time
		lastTimeMsec	= lastTimeMsec || nowMsec-1000/60
		var deltaMsec	= Math.min(200, nowMsec - lastTimeMsec)
		lastTimeMsec	= nowMsec

		var Time = {
			deltaTime : deltaMsec/1000,
			time : nowMsec/1000
		}
		// call each update function
		loop.functions.forEach(function(func){
			func(Time)
		})
	})
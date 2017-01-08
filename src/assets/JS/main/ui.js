

	
	// globel ui

	// Countries

	var city_list = {};

	var city_cube_list = [];
	var city_flag_list = [];
	var city_cross_list = [];

	var mapB = textureLoader.load( "images/cross.png" );	
	var materialB = new THREE.SpriteMaterial( { map: mapB,  fog: true } );
	for(country in Countries){
		var mapA = textureLoader.load( "flags/16/"+country+".png" );
		var materialA = new THREE.SpriteMaterial( { map: mapA,  fog: true } );

		for(cityname in Countries[country].cities){
			var city = Countries[country].cities[cityname];
			city_list[cityname] = city;
			console.log(country,cityname,city.population);

			var cube = new THREE.Mesh( new THREE.CubeGeometry(  0.004, 0.004, 0.00000002*city.population ), new THREE.MeshNormalMaterial() );
			cube.gPos = new GPos(city.position.lat,city.position.lon);
			cube.position.copy(cube.gPos.toVector3(0.50));
			cube.city = cityname;
			cube.lookAt(new THREE.Vector3(0,0,0));
			scene.add( cube );
			city_cube_list.push( cube );

			// bilboard flag
			var sprite = new THREE.Sprite( materialA );
			sprite.position.copy(cube.gPos.toVector3(0.515));
			sprite.scale.set(.016,.016,.016);
			sprite.country = country;
			sprite.city = cityname;
			scene.add(sprite);
			city_flag_list.push(sprite);			

			// bilboard cross
			var sprite = new THREE.Sprite( materialB );
			sprite.position.copy(cube.gPos.toVector3(0.5152));
			sprite.scale.set(.015,.015,.015);
			sprite.country = country;
			sprite.lock = false;
			sprite.city = cityname;
			scene.add(sprite);
			city_cross_list.push(sprite);
		}
	}

	function setPopulationsOn(){
		city_cube_list.forEach(function(cube){cube.visible=true;});
	}	

	function setPopulationsOff(){
		city_cube_list.forEach(function(cube){cube.visible=false;});
	}

	// ülkesi yenilmişlerin bayrak ve çarpı gözükmez
	// yıkılmış şehirlerde bayrak gözükmez çarpı gözükür
	function setFlagsOn(){
		city_flag_list.forEach(function(flag){ flag.visible= (!Countries[flag.country].lose && !city_list[flag.city].bombed); });
	}	

	function setFlagsOff(){
		city_flag_list.forEach(function(flag){flag.visible=false;});
	}

	function setCrossesOn(){
		city_cross_list.forEach(function(flag){
			flag.visible=(!Countries[flag.country].lose && city_list[flag.city].bombed && !flag.lock);
		});
	}	

	function setCrossesOff(){
		city_cross_list.forEach(function(flag){
			flag.visible=false;
		});
	}

	function blackoffCross(city){
		city_cross_list.forEach(function(flag){
			if(flag.city == city){
				flag.lock = true;
				flag.visible = false;
				setTimeout(function(){
					flag.visible = true;
					flag.lock = false;
				},10000);
			}
		});
	}

	function updateBillboards(){
		setFlagsOn();
		setCrossesOn();
	}

	// ---------------------------------------------------------------------------------

	function getCountryOfCity(cityname){
		for(var country in Countries){
			for(var ct in Countries[country].cities){ 
				if(cityname == ct){
					return country;
				}
			}
		}
	}


	// ---------------------------------------------------------------------------------

	setFlagsOff();
	setPopulationsOff();
	setCrossesOff();

	var block_window_click=false;
	$(window).click(function(){
			if(block_window_click){
				block_window_click=false;
				return;
			}
			var maus = new THREE.Vector2(mouse.position.x*2,-mouse.position.y*2);
			raycaster.setFromCamera( maus, camera );
			var intersects = raycaster.intersectObjects( scene.children ,true);
			intersects.forEach(function(i){
				if(i.object.name == "earth"){
					if(mouse.downPosition.equals(mouse.position)){
						var min = "Istanbul";
						var minD = 9999999;
						for(var n in city_cube_list){
							var d = city_cube_list[n].position.distanceTo(i.point);
							if(d<minD){
								min = city_cube_list[n].city;
								minD = d;
							}
						}

						if(currentState == 'main'){
							new Explosion({
								lat : city_list[min].position.lat,
								lon : city_list[min].position.lon
							});
						}
						else{
							selected_city = min;
							InterfaceOnSelectCity();
						}

					}
				}
			});

	});




	//
	//	Rocket
	//


	function Rocket( config ){
		if( typeof(config.start) == 'string' ){
			this.startPoint = new GPos(city_list[config.start].position.lat,city_list[config.start].position.lon);
			this.targetPoint = new GPos(city_list[config.target].position.lat,city_list[config.target].position.lon);
			this.start = config.start;
			this.target = config.target;
		}else{
			this.startPoint = config.start; // gpos
			this.targetPoint = config.target ; // gpos
		}
		this.distance = this.startPoint.distanceBetween(this.targetPoint,RocketController.standarts.realWorld);
		this.currentDistance = this.distance; // gpos.distance(gpos)
		this.launchTime = Date.now(); // date
		this.arriveTime = Date.now()+this.distance/RocketController.standarts.speed;
		this.mesh = new THREE.Mesh( new THREE.BoxGeometry( 0.0005, 0.0005, 0.005 ), new THREE.MeshBasicMaterial( { vertexColors: THREE.FaceColors, overdraw: 0.5 } ) );
		this.flare = addFlare( 0.55, 0.9, 0.5, zeropoint );

		// interactive
		this.position = config.start;

		scene.add(this.mesh);
		this.id = RocketController.rocketCount++;
		RocketController.rockets.push(this);

	}

	Rocket.prototype = {
		remove : function(){

			// istatiklere ekle
			if(this.target){
				$("#totalkill").attr("enabled",1);
				var dead = city_list[this.target].population + Math.floor(Math.random()*10);
				var t = Number($("#totalkill").attr("target")) + dead;
				$("#totalkill").attr("target",t);

				if(getCountryOfCity(this.target) == your_county){
					$("#yourlose").attr("enabled",1);
					t = Number($("#yourlose").attr("target")) + dead;
					$("#yourlose").attr("target",t);
				}
			}

			// buum
			new Explosion({
				lat : this.targetPoint.lat,
				lon : this.targetPoint.lon
			});	

			// meshi
			scene.remove(this.mesh);
			// flaresi
			scene.remove(this.flare);
			// ve diziden silinmeli
			for (var index in RocketController.rockets){
				if(RocketController.rockets[index].id == this.id){
					RocketController.rockets.splice(index,1);
					break;
				}
			}

		}
	};

	loop.functions.push(RocketController.update);

	function getOutComingRockets(){
		var missiles = [];
		
		RocketController.rockets.forEach(function(rocket){
			if(rocket.start){
				if(isYourCity(rocket.start))
					missiles.push(rocket);
			}
		});

		return missiles;
	}

	function getInComingRockets(){
		var missiles = [];
		
		RocketController.rockets.forEach(function(rocket){
			if(rocket.target){
				if(isYourCity(rocket.target))
					missiles.push(rocket);
			}
		});

		return missiles;
	}


	function getRocketById(id){
		for(var r in RocketController.rockets){
			if(RocketController.rockets[r].id == id)
				return RocketController.rockets[r];
		}
		return false;
	}
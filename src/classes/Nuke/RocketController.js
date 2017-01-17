	var RocketController = {
		rocketCount : 0,

		standarts : {
			realWorld : 6371,
			maxAltitude : 0.75,
			speed : 0.1*3/1
		},

		calcTime : function(startCity,targetCity){
			return (new GPos(startCity.position.lat,startCity.position.lon)).distanceBetween((new GPos(targetCity.position.lat,targetCity.position.lon)),RocketController.standarts.realWorld)/RocketController.standarts.speed;
		},

		rockets : [],

		deleteAll : function(){
			while(RocketController.rockets.length != 0){
				RocketController.rockets[0].remove();
			}
		},

		update : function(Time){

			RocketController.rockets.forEach(function(rocket){

				if( rocket.arriveTime<Date.now() ) return rocket.remove();

				var d = ( 1 - (rocket.arriveTime-Date.now() ) / (rocket.arriveTime-rocket.launchTime) ); // yolun oransal gidilme miktarı

				var position = rocket.startPoint.lerp(rocket.targetPoint , d ); // global olarak şuanki konum



				rocket.currentDistance = position.distanceBetween(rocket.targetPoint,RocketController.standarts.realWorld); // şuanki hedefe mesafe


				if(rocket.currentDistance<0)
					rocket.currentDistance = 0;

				rocket.position = position;

				position = position.toVector3(world_r + Math.abs(d*d-d) * RocketController.standarts.maxAltitude); // meshin konum ve yüksekliği

				rocket.mesh.lookAt(position); // hareket noktasına bak

				rocket.mesh.position.copy(position); // meshi konumunu set


				rocket.flare.position.copy( rocket.mesh.position ); // flare set

				new Smoke(rocket.mesh.position); // duman çıkart

			});

		}
	};


	//
	// Explosion
	//

	function Explosion( config ){
		this.gpos = new GPos(config.lat,config.lon);
		this.onAir = config.onAir;
		this.h =  world_r+.03;
		if(this.onAir)
			this.h+=.18;
		this.flare = addFlare( 0.55, 0.9, 0.5, this.gpos.toVector3(this.h) , 4	 );
		this.flare.lensFlares.forEach(function(f){
			f.sizeMax = f.size;
		});
		this.startTime = Date.now();
		this.endTime = this.startTime+2000;
		this.id = ExplosionController.explosionCount++;
		ExplosionController.explosions.push(this);
		sound_explosion.volume( Math.max((1-Math.min(1,camera_gpos.distanceBetween(this.gpos)))*2,Math.random()*0.4) );
		sound_explosion.play();
	}

	Explosion.prototype = {
		remove : function(){

			scene.remove(this.flare);
			// ve diziden silinmeli
			for (var index in ExplosionController.explosions){
				if(ExplosionController.explosions[index].id == this.id){
					ExplosionController.explosions.splice(index,1);
					break;
				}
			}	

		}
	};

	var ExplosionController = {
		explosionCount : 0,
		explosions : [],
		update : function(Time) {
			ExplosionController.explosions.forEach(function(explosion){
				if( explosion.endTime<Date.now() ) return explosion.remove();

				var d = ( 1 - (explosion.endTime-Date.now() ) / (explosion.endTime-explosion.startTime) );

				explosion.flare.lensFlares.forEach(function(f){
					f.size=lerp(0,f.sizeMax,Math.abs(d*d-d)*2);
				});


				if(!explosion.onAir){
					var d = Math.random()*0.02;
					var smokepos = explosion.gpos.toVector3(world_r+d);
					new Smoke(smokepos,0.005+d*0.15,0.3);
				}


				
			});
		}

	};

	loop.functions.push(ExplosionController.update);


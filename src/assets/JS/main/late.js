	//////////////////////////////////////////////////////////////////////////////////
	//		render the scene						//
	//////////////////////////////////////////////////////////////////////////////////

	loop.functions.push(function(){
		composer.render();
	});


	THREE.DefaultLoadingManager.onProgress = function ( item, loaded, total ) {
	    if(loaded == total){


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
	

	    }
	};

	

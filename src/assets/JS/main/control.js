
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

		fixcamera_r();

	}

	function fixcamera_r(){
		camera_r = Math.min(camera_r,2.6);
		camera_r = Math.max(camera_r,world_r+0.3);
	}

	var zoomrate = 1.25;
	function zoomin(){
		camera_r/=zoomrate;
		fixcamera_r();
	}

	function zoomout(){
		camera_r*=zoomrate;
		fixcamera_r();
	}

	var old_mouse_pos = new THREE.Vector2();
	var camera_gpos = new GPos(41.008238,28.978359);
	var camera_sens = 5000;
	var camera_r_default = 2.2;
	var camera_r=camera_r_default;

	camera.GoTo = function(loc){
		camera.follow = false;
		camera_gpos = loc;
	};
	loop.functions.push(function(Time){

		if(mouse.down){

			var diff = new THREE.Vector2().subVectors(old_mouse_pos,mouse.position);
			camera_gpos.lon+=diff.x*Time.deltaTime*camera_sens;
			camera_gpos.lat-=diff.y*Time.deltaTime*camera_sens;
			camera_gpos.limit();
			if(camera.follow){
				camera.follow = false;
				camera_gpos.lat = camera.target.position.lat;
				camera_gpos.lon = camera.target.position.lon;
			}

		}else{
			camera_gpos.lon+=Time.deltaTime/10;
			camera_gpos.limit();
		}

		if(camera.follow && camera.target && camera.target.position){
			camera.position.lerp(camera.target.position.toVector3(camera_r),Time.deltaTime);

		}else{
			camera.position.lerp( camera_gpos.toVector3(camera_r) , Time.deltaTime);
		}

		old_mouse_pos.copy(mouse.position);

		camera.lookAt( scene.position )
	})




	//
	// Smoke
	//

	function Smoke(position,scale,fadeSpeed){

		if(scale)
			this.scale = scale;

		if(fadeSpeed)
			this.fadeSpeed = fadeSpeed;

		this.rad = 1;


		if(SmokeController.array.length<SmokeController.arrayMeta.limit){
			this.mesh= new THREE.Mesh(new THREE.IcosahedronGeometry(this.scale,1), this.mat);
			scene.add(this.mesh);
			SmokeController.array.push(this);

		} else {

			this.mesh = SmokeController.array[SmokeController.arrayMeta.index].mesh;
			this.rad = this.scale / this.mesh.geometry.parameters.radius;
			delete SmokeController.array[SmokeController.arrayMeta.index];
			SmokeController.array[SmokeController.arrayMeta.index] = this;

		}

		SmokeController.arrayMeta.index = (SmokeController.arrayMeta.index+1) % SmokeController.arrayMeta.limit;

		if(position)
			this.mesh.position.copy(position);

		this.noise();
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
			this.mesh.scale.x = (Math.random()/2+0.75)*this.rad;
			this.mesh.scale.y = (Math.random()/2+0.75)*this.rad;
			this.mesh.scale.z = (Math.random()/2+0.75)*this.rad;
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





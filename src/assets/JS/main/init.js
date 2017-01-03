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
	var raycaster = new THREE.Raycaster();

	window.addEventListener( 'resize', onWindowResize, false );

	function onWindowResize(){

	    camera.aspect = window.innerWidth / window.innerHeight;
	    camera.updateProjectionMatrix();

	    renderer.setSize( window.innerWidth, window.innerHeight );

	}

	function lerp(a,b,d){
		return (1-d) * a + d * b;
	}

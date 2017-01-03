


	//
	// World 
	//

	world_pos = new THREE.Vector3(0,0,0);
	world_r = 0.5;
	gpos_sample = new GPos(0,0);





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

	earthMesh.name = "earth";

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


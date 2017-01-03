

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




	//
	// Efects
	//

    var composer = new THREE.EffectComposer(renderer);
    composer.addPass(new THREE.RenderPass(scene, camera));
    var glitchPass = new THREE.GlitchPass;
    glitchPass.renderToScreen = true;
    glitchPass.goWild = true;

    setTimeout(function(){
    	glitchPass.goWild = false;
    },1000);
    composer.addPass(glitchPass);
	


Settings.JSBuilder = {

	builds : [
		{
			from : [
				"src/assets/JS/three.min.js",
				"src/assets/JS/EffectComposer.js",
				"src/assets/JS/RenderPass.js",
				"src/assets/JS/GlitchPass.js",
				"src/assets/JS/CopyShader.js",
				"src/assets/JS/DigitalGlitch.js",
				"src/assets/JS/ShaderPass.js",
				"src/assets/WebServer/www/threex.planets-master/threex.planets.js",
				"src/assets/WebServer/www/threex.planets-master/threex.atmospherematerial.js",
				"src/classes/GPS/GPos.js",
				"src/classes/Nuke/",
				"src/assets/JS/main.js",
			],
			to : "src/assets/WebServer/www/game.js",
			UglifyJS : false
		}
	],


	UglifyJS : {fromString : true, mangle: {toplevel: true} }

};
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
				"src/assets/JS/languages/",
				"src/assets/JS/main/init.js",
				"src/assets/JS/main/lights.js",
				"src/assets/JS/main/sounds.js",
				"src/assets/JS/main/ui.js",
				"src/assets/JS/main/flares.js",
				"src/assets/JS/main/sun.js",
				"src/assets/JS/main/world.js",
				"src/assets/JS/main/smoke.js",
				"src/assets/JS/main/rocket.js",
				"src/assets/JS/main/explosion.js",
				"src/assets/JS/main/effects.js",
				"src/assets/JS/main/client.js",
				"src/assets/JS/main/interface.js",
				"src/assets/JS/main/language.js",
				"src/assets/JS/main/statics.js",
				"src/assets/JS/main/control.js",
				"src/assets/JS/main/late.js",
			],
			to : "src/assets/WebServer/www/game.js",
			UglifyJS : true
		}
	],


	UglifyJS : {fromString : true, mangle: {toplevel: true} }

};
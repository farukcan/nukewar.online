required('fs');

needs('config','Builder/JSBuilder');
needs('function','cc');

// JSBuilder runs only in --build (one-shot) or --dev (build + watch) modes.
// Default `node app.js` start does not trigger any build.
var _jsbMode =
	process.argv.indexOf('--build') !== -1 ? 'build' :
	process.argv.indexOf('--dev')   !== -1 ? 'dev'   : 'none';

if(_jsbMode !== 'none'){

	required('uglify-js','UglifyJS');
	if(_jsbMode === 'dev') required('chokidar');

	Settings.JSBuilder.builds.forEach(function(build){

		var _list = [];

		build.from.forEach(function (from){
			if(fs.lstatSync(from).isDirectory()){
				_list = _list.concat(readDir(from).map(function(e){return from+e}));
			}
			else{
				_list.push(from);
			}
		});

		// Watcher only attaches in dev mode; build mode is one-shot.
		if(_jsbMode === 'dev'){
			chokidar.watch(build.from, {
				ignoreInitial: true,
				awaitWriteFinish: {
					stabilityThreshold: 100,
					pollInterval: 50
				}
			}).on('all', Make);
		}

		Make();

		function Make(){
			var start = Date.now();
			var code = "";
			_list.forEach(function(file){
				code += "\n" + readCode(file);
			});

			if(build.UglifyJS){
				try{
					var result = UglifyJS.minify(code, Settings.JSBuilder.UglifyJS);
					if(result.error) throw result.error;
					code = result.code;
				}catch(err){
					cc('> JSBuilder : [FAILED] ' + build.to);
					console.log(err);
					if(_jsbMode === 'build') process.exit(1);
					return;
				}
			}
			code = "/* Builded by JSBuilder of katip-framework @" + Date() + "*/\n" + code;
			// Sync write so `--build` mode can exit deterministically right after.
			fs.writeFileSync(build.to, code);
			cc('> JSBuilder : [BUILDED] ' + build.to + ' [' + (Date.now() - start) + 'ms]');
		}

	});

	if(_jsbMode === 'build'){
		cc('> JSBuilder : [DONE] build finished, exiting');
		process.exit(0);
	}

}

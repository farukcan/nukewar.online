required('fs');
required('uglify-js','UglifyJS');
required('chokidar');

needs('config','Builder/JSBuilder');
needs('function','cc');



Settings.JSBuilder.builds.forEach(function(build){

	_list = [];

	build.from.forEach(function (from){
		if(fs.lstatSync(from).isDirectory()){
			_list = _list.concat(readDir(from).map(function(e){return from+e}));
		}
		else{
			_list.push(from);
		}
	});

	// chokidar handles macOS atime-only events correctly (compares mtime via stat)
	chokidar.watch(build.from, {
		ignoreInitial: true,
		awaitWriteFinish: {
			stabilityThreshold: 100,
			pollInterval: 50
		}
	}).on('all', Make);

	setTimeout(Make, 0);

	function Make(){
		var start = Date.now();
		var code = "";
		_list.forEach(function(file){
			code += "\n" + readCode(file);
		});

		if(build.UglifyJS){
			// eğer sıkıştırıcı online ise
			try{
				var result = UglifyJS.minify(code, Settings.JSBuilder.UglifyJS);
				if(result.error) throw result.error;
				code = result.code;
			}catch(err){
				cc('> JSBuilder : [FAILED] ' + build.to);
				console.log(err);
			}
		}
		code = "/* Builded by JSBuilder of katip-framework @" + Date() + "*/\n" + code;
		fs.writeFile(build.to, code, function(err){
			if(err){
				return console.log(err);
			}
			cc('> JSBuilder : [BUILDED] ' + build.to + ' [' + (Date.now() - start) + 'ms]');
		});
	}

});

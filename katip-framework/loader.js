/* Require */

required("fs");

/* --- */


var readCode = readFile;

var readDir = function(dir,_path){
	var _files = fs.readdirSync(dir);
	var files = [];

	if(typeof _path == 'undefined' ) _path="";

	_files.forEach(function(file){

		if(fs.lstatSync(dir+'/'+file).isDirectory()){
			files = files.concat(readDir( dir+'/'+file , _path+file+"/" ));
		}else{
			files.push(_path+file);
		}

	});

	return files;
}

Framework.loader = {
	functions : [],
	classes : [],
	includes : []
};

// const loader
eval(readCode("src/const.js"));

// configs yükleyici
eval(readCode("katip-framework/config_loader.js"));

var _fire = "";

// Fonksiyon yükleyicisi
eval(readCode("katip-framework/function_loader.js"));

// Class yükleyici
eval(readCode("katip-framework/class_loader.js"));

// Include yükleyicisi
eval(readCode("katip-framework/include_loader.js"));

// Bağlılık kontrolcüsü
eval(readCode("katip-framework/depend_controller.js"));
eval(readCode("katip-framework/need_controller.js"));


// fire loader, all of code
console.log("# katip-framework STATUS : RUN");
eval(_fire);

Framework.loaded = true;

console.log("# katip-framework STATUS : END / LOADED");
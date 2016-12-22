/* 
	app.js katip-framework başlatıcısı ve 2 temel fonksiyon
*/

// Framework hakkında bilgilere erişmek için : var
var Framework = {
	version : "1.3.0",
	Settings : {
		Restart : true,
		Watch : true
	},
	loaded : false,
	watching : false
};

// Mod gerekliyse yükle,yüklüyse yükleme
var required = function(mod_name,as){
	if(as){
		if(eval("typeof "+as+" == 'undefined'")){
			eval(as+" = require('"+mod_name+"');");
		}
	}
	else{
		if(eval("typeof "+mod_name+" == 'undefined'")){
			eval(mod_name+" = require('"+mod_name+"');");
		}
	}
}

// readFile : dosya okuma fonksiyonu
var readFile = function(file){
	return fs.readFileSync(file).toString();
}

var exit = function(){
		process.exit(1);
}

var restart = function(){
	if(Framework.Settings.Restart)
		exit();
}

console.log("# katip-framework "+Framework.version+" ...");

/* FM , fs moduna ihtıyaç duyar */
required("fs");

/*  katip-framework loader */
eval(readFile("katip-framework/loader.js"));

/*  katip-framework watcher */
eval(readFile("katip-framework/watcher.js"));
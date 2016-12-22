// Depend Controller

var GetDepends = function(code){
	return code.match(/depends\((.*)\);/g);
}

// Depends for includes

Framework.loader.depends = {};
var depends = function(to){
	var depId = Framework.loader.includes.indexOf(to);
	var incId = Framework.loader.includes.indexOf(key)
	if(depId == -1)
		throw "Depend not found : "+to+" for: "+key;

	if(depId > incId){
		var temp = Framework.loader.includes[depId];
		Framework.loader.includes[depId] = Framework.loader.includes[incId];
		Framework.loader.includes[incId] = temp;
	}

	if(!Framework.loader.depends[key])
		Framework.loader.depends[key] = [to];
	else
		Framework.loader.depends[key].push(to);

}
for(key in Framework.loader.includeCodes){
	var deps = GetDepends(Framework.loader.includeCodes[key]);
	if(deps!=null){
		deps.forEach(function(dep){
			eval(dep);
			Framework.loader.includeCodes[key] = Framework.loader.includeCodes[key].split(dep).join('');
		});
	}
}

var depends = function(to){
	console.log('[ERR] DEPENDS NOT INITIALIZED : '+to);
}

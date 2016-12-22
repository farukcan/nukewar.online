required('path');

var GetNeeds = function(code){
	return code.match(/needs\((.*)\);/g);
}

var err = function(e){
	throw ("\n==============================\n\n"+e+"\n\n==============================\n");
}

var _find = function(array,needle){
	return array.map(function(e){return path.basename(e)}).indexOf(needle+".js") == -1;
}

Framework.loader.needs = {}

var needs = function(what,to){
	switch(what){
		case 'function':
			if(_find(Framework.loader.functions,to))
				err("[ERR] "+to+" function not found for "+key);

			if(!Framework.loader.needs[key])
				Framework.loader.needs[key] = {};

			if(Framework.loader.needs[key].functions)
				Framework.loader.needs[key].functions.push(to);
			else
				Framework.loader.needs[key].functions = [to];

		break;

		case 'class':
			if(_find(Framework.loader.classes,to))
				err ("[ERR] "+to+" class not found for "+key);

			if(!Framework.loader.needs[key])
				Framework.loader.needs[key] = {};

			if(Framework.loader.needs[key].classes)
				Framework.loader.needs[key].classes.push(to);
			else
				Framework.loader.needs[key].classes = [to];
			
		break;

		case 'config':
			if(Framework.loader.configs.indexOf(to+".js") == -1)
				err ("[ERR] "+to+" config file not found for "+key);

			if(!Framework.loader.needs[key])
				Framework.loader.needs[key] = {};

			if(Framework.loader.needs[key].configs)
				Framework.loader.needs[key].configs.push(to);
			else
				Framework.loader.needs[key].configs = [to];

		break;

		default:
			throw('i cant understand need cmd' + what);
		break;
	}
}


for(key in Framework.loader.functionCodes){
	var n = GetNeeds(Framework.loader.functionCodes[key]);
	if(n!=null){
		n.forEach(function(ne){
			eval(ne);
			Framework.loader.functionCodes[key] = Framework.loader.functionCodes[key].split(ne).join('');
		});
	}
}

for(key in Framework.loader.classCodes){
	var n = GetNeeds(Framework.loader.classCodes[key]);
	if(n!=null){
		n.forEach(function(ne){
			eval(ne);
			Framework.loader.classCodes[key] = Framework.loader.classCodes[key].split(ne).join('');
		});
	}
}

for(key in Framework.loader.includeCodes){
	var n = GetNeeds(Framework.loader.includeCodes[key]);
	if(n!=null){
		n.forEach(function(ne){
			eval(ne);
			Framework.loader.includeCodes[key] = Framework.loader.includeCodes[key].split(ne).join('');
		});
	}
}
required('path');

Framework.loader.functions = readDir("src/functions");
Framework.loader.functionCodes = {};

var _file;
for(key in Framework.loader.functions){
	Framework.loader.functionCodes[Framework.loader.functions[key]] = readCode("src/functions/"+Framework.loader.functions[key]);
}

_fire += 'var _file;for(key in Framework.loader.functions){_file = path.basename(Framework.loader.functions[key]).split(".").shift();eval(_file+" = "+Framework.loader.functionCodes[Framework.loader.functions[key]]);}delete Framework.loader.functionCodes;';



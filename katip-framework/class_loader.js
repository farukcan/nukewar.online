Framework.loader.classes = readDir("src/classes");
Framework.loader.classCodes = {};


for(key in Framework.loader.classes){
	Framework.loader.classCodes[Framework.loader.classes[key]] = readCode("src/classes/"+Framework.loader.classes[key]);
}

_fire += 'for(key in Framework.loader.classes){eval(Framework.loader.classCodes[Framework.loader.classes[key]]);}delete Framework.loader.classCodes;';



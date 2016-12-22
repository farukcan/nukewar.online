Framework.loader.includes = readDir("src/includes");

// Load Codes
Framework.loader.includeCodes = {};
for(key in Framework.loader.includes){
	Framework.loader.includeCodes[Framework.loader.includes[key]] = readCode("src/includes/"+Framework.loader.includes[key]);
}

_fire += 'for(key in Framework.loader.includes){eval(Framework.loader.includeCodes[Framework.loader.includes[key]]);}delete Framework.loader.includeCodes;';
var _ifiles = readDir("src/configs");

Framework.loader.configs = _ifiles;

for(key in _ifiles){
	eval(readCode("src/configs/"+_ifiles[key]));
}
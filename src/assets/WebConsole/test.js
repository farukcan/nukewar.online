function(socket,data){
	try{
		var code = "try{"+readFile("src/assets/test/"+data+".js")+"}catch(e){c(e);}";
	}catch(e){c(e);}

	var err = check_code(code);
	if(err){
		c(err);
	}else{
		eval(code);
	}
}
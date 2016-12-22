function (socket,data){
	var code = "try{c("+data+")}catch(e){c(e);}";
	var err = check_code(code);
	if(err){
		c(err);
	}else{
		eval(code);
	}
}
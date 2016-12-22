function(socket,data){
	socket.fb("<hr/>");
	for(key in console_cmds){
		socket.fb(key);
	}
	socket.fb("<br><hr/>");


}
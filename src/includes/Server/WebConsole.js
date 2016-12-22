depends("Server/HTTP.js");

required('fs');
required('syntax-error','check_code');
required('socket.io','socket_io');

needs('config','Server/WebConsole');

var io = socket_io(http_server);

var console_cmds = {};

loadConsoleCMDs();
fs.watch(Settings.WebConsole.Dir,loadConsoleCMDs);

// Yeni debug
c = function(d){
	if(typeof d != "string"){
		try{

			io.emit("fb",JSON.stringify(d));
			return;

		}catch(e){
    }
	}

  try{
    io.emit("fb",d);
  }catch(e){
  }


}


io.on('connection', function(socket){
  var logged = false;	

  socket.fb = function(data){
  	socket.emit("fb",data);
  }

  c("<gr>WebConsole Connected</gr>");

  socket.on('cmd', function(data){
  	var x = explode(data," ",2);
  	if(typeof console_cmds[x[0]] == "function"){
  		console_cmds[x[0]](socket,x[1]);
  	}else{
  		socket.fb("<red>Wrong Command !!! </red>");
  	}
  });

  socket.on('disconnect', function(){});
});


function loadConsoleCMDs(){
	var _files = fs.readdirSync(Settings.WebConsole.Dir);

	var _file;
	for(key in _files){
		_file = _files[key].split(".").shift()
		eval("console_cmds['"+_file+"'] = " + readFile(Settings.WebConsole.Dir+_files[key]));
	}
}



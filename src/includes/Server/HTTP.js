required("http");
required("mime-types","mime");

needs('function','c');
needs('config','Server/HTTP');

var http_server = http.createServer(httpHandler);

var http_routes = [];


http_server.listen(Settings.WebServer.Port,(err) => {
	console.log(" > WebServer listening | http port ",Settings.WebServer.Port," | err :",err);
});


fs.watch(Settings.WebServer.Dir+'routes.js',loadRoutes);
fs.watch(Settings.WebServer.Dir+'controllers',loadRoutes);
loadRoutes();

function httpHandler(req,res){
	if(req.url.indexOf("?")>0){
        var a = req.url.split("?");
        req.url = a[0];
        req.getData =  a[1];
    }
	c("HTTP : "+req.url);
	if(routes.every(function(route){
		if(route.url==req.url){
			if(route.controller){
				route.controller(req,res);
			}else{
				req.url = route.link;
				httpStaticFile(req,res);
			}

			return false;
		}
		return true;
	})){
		httpStaticFile(req,res);
	}
}

function httpStaticFile(req,res){
	var file = Settings.WebServer.Dir+"/www"+req.url;

  	fs.stat(file, function(err, stat) {
	    if(err == null) {
			var stream = fs.createReadStream(file);
			res.writeHead(200,{ 
				"Content-Type": mime.lookup(req.url),
				"Content-Length": stat.size
				 });
		  	stream.pipe(res);
	    } else {
	    	console.log('WebServer 404: '+req.url, err.code);
			res.writeHead(404);
			res.write("<h1>404");
	    } 
	});

  	/*fs.readFile(Settings.WebServer.Dir+"/www"+req.url,'utf-8',(err,data) => {
		if(err) {
			res.writeHead(404);
			res.write("<h1>404");
		}else{
			res.writeHead(200,{ "Content-Type": mime.lookup(req.url) })
			res.write(data);
		}
		res.end();
	});*/
}

function loadRoutes(){
	routes = []; // clean
	var add_route = (url,controller) => {
		eval("var cnt = "+readFile(Settings.WebServer.Dir+"controllers/"+controller+".js"));
		routes.push({
			url : url,
			controller : cnt
		});
	}
	var add_static = (url,link) => {
		routes.push({
			url : url,
			link : link
		});
	}
	eval(readFile(Settings.WebServer.Dir+'routes.js'));
	c(routes);
}
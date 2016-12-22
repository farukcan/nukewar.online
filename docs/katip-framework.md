# Katip Framework

## Project Structure

All back-end files are storaging in **src** directory

### classes

Class files are storaging in **src/classes**

* Unique filename required

```javascript
function GPos(lat,lon){
	this.lat = lat; // : float
	this.lon = lon; // : float
}

GPos.prototype = {
	toVector3 : function(){},
}
```

### configs

Config files are storaging in **src/configs**

```javascript
Settings.WebServer = {
		Url : "http://localhost:1337",
		Port : 1337,
		Dir : "src/assets/WebServer/"
};
```

### functions

All of singular functions are storaging in **src/functions** and filename as function's name

* Unique filename required

```javascript
function(a){
	console.log(a);
}
```



### includes

All code blocks are stroraging in **src/includes** with diffirent filenames

```javascript
required("http");
required("mime-types","mime");

needs('function','c');
needs('config','WebServer');

var http_server = http.createServer(httpHandler);

var http_routes = [];

```

### assets

All files and datas that independed from backend-app are storaging in **src/assets**

```
src/assets/WebServer/www -> web files
src/assets/data/161126.json -> data files
src/assets/images/placeholder.png -> images
```

## Source Code Controlling

Katip Framework has advanced js source code controlling system

### required( *node_module*, *as_whatever*)

This function notices required 'node module' and it's variable name

Node Modules are storaging in **/node_modules**

```javascript
required('fs','filesystem'); // it's same with var filesystem = require('fs');

var data = filesystem.readFileSync('file');
```

### depends( *include_name* )

If you have multiple include files depends other like WebConsole & WebServer. You must use this function in WebConsole.js for WebServer.js runs first.

```javascript
depends( 'WebServer.js' )
```

### needs( *type*, *name*)

If your code block, needs another singular function or classes or config you must use this function for need controlling.

```javascript
needs('function','c');
needs('class','GPS_Sector');
needs('config','Server/HTTP');
```
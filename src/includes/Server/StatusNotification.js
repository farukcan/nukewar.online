required("request");


request.post('http://bildirim.hesap.online/v1/send.php', {
	form:{
		key:'server_status',
		title: "nukewar.online Started",
		message : json2html(Project) + json2html(Framework),
		ReplyTo : "noone@nukewar.online"
	}
}, function(err,httpResponse,body){ 
	console.log("Status Notification : ",httpResponse.body);
});


function json2html (obj) {
  return JSON.stringify(obj,json_replacer).split("{").join("{<blockquote>").split("}").join("</blockquote>}").split("[").join("[<blockquote>").split("]").join("</blockquote>]	").split(",").join(",<br>");
}

function json_replacer(key,value){
  if (typeof value === 'string' && value.length>50) {
  	return "<...>";
  }
  return value;
}
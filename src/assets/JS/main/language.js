


	//
	// Multi Lang
	//

	var lang = new Lang();

    lang.init({
        defaultLang: 'en',
	    cookie: {
	        name: 'langCookie',
	        expiry: 365,
	        path: '/'
	    },
	    allowCookieOverride: true
    });


	function translate(string){
		return window.lang.translate(string);
	}

	$(function(){
		$("lang").click(function(){
			window.lang.change($(this).attr("value"));
		});
	});



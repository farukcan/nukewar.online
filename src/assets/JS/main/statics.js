
	//
	// Statics
	//

	loop.functions.push(function(Time){
		$("killed").each(function(i,e){
			var element = $(e);
			if(element.attr('enabled')==1){
				var cur = element.attr('current');
				var tar = element.attr('target');
				var val = Math.round(lerp(cur,tar,Math.min(Time.deltaTime,1)));
				val++;				


				if(val >= tar){
					element.attr('enabled',0);
					val = tar;
				}

				element.attr('current',val);
				element.html(val.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ","));
			}
		});
	});


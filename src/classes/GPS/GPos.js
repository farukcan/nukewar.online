function GPos(lat,lon){

	this.lat = lat; 	// : float
	this.lon = lon; 	// : float

}

GPos.prototype = {

	// for THREE.Vector3
	toVector3 : function(r){
		
		r = r || 1;

		var a1 = (this.lat-90 ) * (Math.PI / 180);
        var a2 = (180-this.lon ) * (Math.PI / 180);

        var sin1 = Math.sin(a1);
        var cos1 = Math.cos(a1);
        var sin2 = Math.sin(a2);
        var cos2 = Math.cos(a2);

        return new THREE.Vector3(sin1 * cos2 * r, cos1 * r, sin1 * sin2 * r) ;

	},


	limit : function(){

		if(this.lat>90) this.lat = 90;
		else if(this.lat<-90) this.lat = -90;

		if(this.lon>180) this.lon = -180;
		else if(this.lon<-180) this.lon = 180;

	},

	distanceBetween : function(g,R){

		R = R || 1;
		
		var dLat = (g.lat - this.lat) * Math.PI / 180;
		var dLon = (g.lon - this.lon) * Math.PI / 180;
		var lat1 = this.lat * Math.PI / 180;
		var lat2 = g.lat * Math.PI / 180;
		var a = Math.sin(dLat/2) * Math.sin(dLat/2) +
		        Math.sin(dLon/2) * Math.sin(dLon/2) * Math.cos(lat1) * Math.cos(lat2); 
		
		var c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a)); 
		return R * c;
		
	},

	lerp : function(g,delta){

	    var φ1 = this.lat * Math.PI / 180;
	    var λ1 = this.lon * Math.PI / 180;
	    var φ2 = g.lat * Math.PI / 180;
	    var λ2 = g.lon * Math.PI / 180;

	    var sinφ1 = Math.sin(φ1), cosφ1 = Math.cos(φ1), sinλ1 = Math.sin(λ1), cosλ1 = Math.cos(λ1);
	    var sinφ2 = Math.sin(φ2), cosφ2 = Math.cos(φ2), sinλ2 = Math.sin(λ2), cosλ2 = Math.cos(λ2);

	    var Δφ = φ2 - φ1;
	    var Δλ = λ2 - λ1;
	    var a = Math.sin(Δφ/2) * Math.sin(Δφ/2)
	        + Math.cos(φ1) * Math.cos(φ2) * Math.sin(Δλ/2) * Math.sin(Δλ/2);
	    var δ = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));

	    var A = Math.sin((1-delta)*δ) / Math.sin(δ);
	    var B = Math.sin(delta*δ) / Math.sin(δ);

	    var x = A * cosφ1 * cosλ1 + B * cosφ2 * cosλ2;
	    var y = A * cosφ1 * sinλ1 + B * cosφ2 * sinλ2;
	    var z = A * sinφ1 + B * sinφ2;

	    var φ3 = Math.atan2(z, Math.sqrt(x*x + y*y));
	    var λ3 = Math.atan2(y, x);


		return (new GPos( φ3/Math.PI*180 , λ3/Math.PI*180 )).fit();
	},

	fit : function(){
		if(this.lat>90)
			this.lat = -Math.abs(90-this.lat);
		else if(this.lat<-90)
			this.lat = 90-Math.abs(90+this.lat);

		if(this.lon>180)
			this.lon = -Math.abs(180-this.lon);
		else if(this.lon<-180)
			this.lon = 180-Math.abs(180+this.lon);

		return this;
	}
}

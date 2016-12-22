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

		var lerped = new GPos(0,0);


		lerped.lat = (1-delta)*this.lat + delta*g.lat;

		if(Math.abs(this.lon-g.lon)>180){
			var v = 180-Math.abs(this.lon) + 180-Math.abs(g.lon);
			var a = (this.lon>0) ? 1 : -1;
			lerped.lon = this.lon+a*v*delta;
		}
		else
			lerped.lon = (1-delta)*this.lon + delta*g.lon;


		return lerped.fit();
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

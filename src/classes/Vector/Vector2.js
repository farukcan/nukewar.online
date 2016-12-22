function Vector2(x,y){ // 2 boyutlu vektör sınıfı
	this.x = x;
	this.y = y;
}

Vector2.prototype = {
	set : function (x,y){
		this.x = x;
		this.y = y;
	},
	mul : function (x,yeni){
		if(yeni) return new Vector2(this.x*x,this.y*x);
		this.x *= x;
		this.y *= x;
	},
	add : function(v){ // bir vektörü üzerine ekler
		this.x += v.x;
		this.y += v.y;
		return this;
	},
	inverse : function(){ // vektörün tersi
		return new Vector2(-this.x,-this.y);
	},
	clone : function(){ // vektörün tersi
		return new Vector2(this.x,this.y);
	},
	d : function(v){ // vektörün diğer vektöre uzaklığı
		return this.inverse().add(v).l();
	},
	l : function(){ // vektörün uzunluğu
		return findLenght(this.x,this.y);
	},
	Angular2Analitic : function(){
		return new Vector2(this.y*Math.cos(this.x),this.y*Math.sin(this.x));
	},
	limit : function(min,max){
		this.x = limit(this.x,min.x,max.y);
		this.y = limit(this.x,min.x,max.y);
	},
	angleBetween : function (v) {
		return Math.atan2(v.y - this.y, v.x - this.x);
	}
}

function limit(x,min,max){
	return Math.min(Math.max(x, min), max);
}

function findLenght(x,y){
	return Math.sqrt(x*x+y*y);
}
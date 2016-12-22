// src kod değişimleri algılayan bir sistemdir.

/* Aşağıdakiler değişirse , projeyi tamamen yeniden başlatır.

* const.js
* /classes
* /functions
* /includes


*/

if(Framework.Settings.Watch){
	fs.watch('src/const.js',restart);
	fs.watch('src/classes',{recursive :true},restart);
	fs.watch('src/configs',{recursive :true},restart);
	fs.watch('src/functions',{recursive :true},restart);
	fs.watch('src/includes',{recursive :true},restart);

	Framework.watching = true;
	console.log("# katip-framework STATUS : WATCHING");
}

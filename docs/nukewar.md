# Nukewar

Küresel dünya üzerinde geçen bir online oyundur.

## Teknolojiler

iOS ve Android => unity (socket.io)

Web => Three.js (socket.io)

## Aşamalar

Three.js için geliştir.

Sonra unitye dök

## Yapılacaklar

- [x] Dünyayı atmosferi ile oluştur.
- [x] Dünyanın üzerinde cisimler oluştur
- [x] Roket ekle ve hareketlendir.
- [ ] arayüz eklenecek. chat , hamle seçimi ve hamlelerin kaybettireceği süre.
- [ ] sunucu tarafı yazılacak
- [ ] Atom bombası hakkında bilgi ve sözler eklenecek
- [ ] Şehirlerin popülasyonu öğren ve skor tablosunda göster. Kaç insan öldüğünü
- [ ] optimizasyon gerekli çok kasıyo
- [ ] resize olayları kontrol edilmelidir

## İlham

https://paperplanes.world/

Efekt

http://codepen.io/altereagle/pen/aObzKz (kullan https://threejs.org/examples/webgl_postprocessing_glitch.html)

http://codepen.io/nicolasdnl/pen/zxedvW

Gradientler :

http://lea.verou.me/css3patterns/

http://bennettfeely.com/gradients/

https://codepen.io/tr13ze/pen/pbjWwg

https://www.transparenttextures.com/

## Kurallar

* Çok oyuncu veya bot ile oynanır. Zaman tabanlı strateji oyunudur
* Ülkeler, dünyanın çeşitli yerlerinde bulunmak üzere 5 şehre sahip olur.
* Ülkeler 1 komuta merkezi ve 1 nükleer silaha sahip başlar. 
* Komuta merkezi vurulursa oyunu kaybeder. 
* Nükleer silah vurulursa , yenisini inşaa etmek zorunda kalır.
* Uzağa atılan nükleer hedefi geç yok edecektir. (1 turda)
* Her el komuta merkezi ve nükleer silahın yerini değiştirebilir. Nükleer olarak vurulmuş yeri seçemez.
* yeni nükleer silah inşaa edebilir.
* 3 el sonra nükleer olarak vurulmuş yer kullanılabilir.


### Hamleler

* **Taşı(swap)** : 3 dk (Şehirlerdeki varlıkları değiştirir.)
* **Nükleer** maximum varış süresi : 200150ms/60000 = 3.335dk = 200.150 sn . RELOAD : 5dk (Düşman şehrini vur) 
* **İnşa** : 4dk
* **Onar**: 1dk (Şehrin nükleer olarak vurulmuş olması gerek)

## Server Side

* socket.io kullanılacak
* odalar olacak


## Ülkeler

Yakın olan şehirler seçilmeme çalışılacak.

### USA

* Newyork
* Los Angeles
* Chicago
* Houston
* Philadelphia

### Turkey

* Istanbul
* Ankara
* İzmir
* Konya
* Antalya

### Russia

* Moscow
* Petersburg
* Omsk
* Kazan
* Perm

### China

* Guangzhou
* Shanghai
* Beijing
* Wuhan
* Xian

### India

* Mumbai
* Delhi
* Bangalore
* Chennai
* Ahmedabad

### Canada

* Toronto
* Montreal
* Vancouver
* Calgary
* Edmonton

### EU

* London
* Paris
* Berlin
* Brussels
* Stockholm

### Australia

* Sydney

* Melbourne

* Darwin

* Perth

* Mullewa

  ​
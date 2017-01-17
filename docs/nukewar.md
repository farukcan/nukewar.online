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
- [x] arayüz eklenecek. chat , hamle seçimi ve hamlelerin kaybettireceği süre.
- [x] sunucu tarafı yazılacak
- [x] hata : darwinden losangelese atınca lerp fonksiyonu sapıtıyor galba
- [x] Meşguliyet durumu interface yansımalı
- [x] patlamadan sonra ayrı şehirin zaten bombalanmış olduğu gözükmüyo
- [x] status barda gönderilen füze için status gösterilecek
- [x] oyun başlayınca başkente go to yap
- [x] Giden rokette odaklan ve roket statuslarına basınca rokede git
- [x] citiesde kaçtane şehri kaldığı ve kaybedip etmediği gözükmeli
- [x] Nuke butonun inf de gerekli süre gözükmeli
- [x] nukenin bir sonraki kullanılabilir zamanını göster
- [x] bir şehirde patlamaların ölü sayılarını göster
- [x] roketin yeniden kullanım süresi gösterilmeli
- [x] çarpı işareti patlamadan sonra gösterilmeli
- [x] nükleer füze inşa etme
- [x] nükleer füze seçme şeysi düzgün çalışmıyo ve en yakın/aktif olan seçilmeli daima rağmen diğerini görmezden geliyo
- [x] Interfacede nüükleer füzemiz yok ise pasif olacak
- [x] bombalanmış bir şehiri temizleme eklenecek
- [x] Swap hamlesi eklenecek
- [x] Hamle yapıldığında Notice gönder 
- [x] Socketler çok geciktiği zaman, ZAMAN algısı sapıtıyor. roketlere now eklendi
- [x] oyun başlangıcında bilgilendirme ekranı [Türkçeleştirilmeli]
- [x] efekt sinir bozucuynuş ona kaldırmanın yolunu bulmak gerek
- [x] kazanma kaybetme ekranları
- [x] Botlar eklenecek
- [x] Şehir üzerine bastığında ülkesini gelen,giden roketleri göster
- [ ] 2 roket vardı biri müsait olmasına rağmen rampa hazır değil dedi?
- [ ] **bazen nükleer rocket şehri uçurmuyor yok etmiyor**
- [ ] 
- [ ] azen nükleer rocket şehri uçurmuyor yok etmiyor
- [ ] max oyun süresi 1 saat
- [ ] Atom bombası hakkında bilgi ve sözler eklenecek
- [ ] Şehirlerin popülasyonu öğren
- [ ] optimizasyon gerekli çok kasıyo. hem server hem client ram israfı yapılmamalı
- [x] resize olayları kontrol edilmelidir
- [ ] socket disconnet olduğunda bazı şeyler check edilmeli kazanma şeyide check et
- [ ] chat şeyine tıklayınca seçim yapmasının önüne geç **işe yaramadı**
- [ ] Güvenlik önlemleri alınacak
- [ ] panellerin geçmişte kalma sorunu çöz
- [ ] mesaj spamı engellenmeli
- [ ] 10sn bekleme şeyi tikini kaldır
- [ ] komuta merkezi belli olmuyomuş

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
* * Komuta merkezi vurulursa oyunu kaybeder. 
  * Bütün ülkeler düşmandır
  * Hayatta kalan ülke oyunu kazanır
* Nükleer silah vurulursa , yenisini inşaa etmek zorunda kalır.
* Uzağa atılan nükleer daha hedefi geç yok edecektir. (1 turda)
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


### Yapay zeka

Sürekli saldıran bir yapay zekadır.

Saldır -> Nüke yoksa ve müsaitse inşa et OK

Saldır -> Düşman seç(en az şehri olanlardan rastgele) -> Düşman ölü değilse 

Saldır -> Herhangi bir şehrine rastgele

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
import type { Lore } from '../../data/lore'

const notes: Record<string, string> = {
  monza: 'Buraya F1 için geldim.',
  zandvoort: 'Buraya F1 için geldim.',
  luzern: 'Rigi Dağı\'na tırmandım, ta zirveye kadar.',
  cologne: 'Arkadaşımla birlikte katedral kulesinin tepesine kadar 533 basamağın hepsini tırmandım.',
  bruges: 'Belfry kulesine tırmandım.',
}

const lore: Record<string, Lore> = {
  galata: {
    kicker: '1348\'de inşa edildi · Ceneviz kolonisi',
    blurb:
      'Cenevizliler bu kuleyi surlarla çevrili Galata kolonilerinin merkezi olarak dikti ve adına Mesih Kulesi dediler. Yüzyıllarca bütün şehir için bir yangın gözetleme kulesi olarak hizmet etti; bugün Haliç\'in en güzel manzara noktalarından biri.',
    facts: [
      'Yaklaşık 67 m yüksekliğinde; konik başlık sonradan yapılan bir restorasyon.',
      'Osmanlı yangın gözcüleri kulede yaşar, şehirdeki yangınları işaretle duyururdu.',
      'Efsaneye göre Hezarfen Ahmed Çelebi 1630\'larda burada kanat takıp Boğaz\'ın üzerinden Üsküdar\'a süzüldü.',
    ],
  },
  bosphorus: {
    kicker: '1973\'te açıldı · 15 Temmuz Şehitler Köprüsü',
    blurb:
      'Boğaz\'a yapılan ilk köprü; Cumhuriyet\'in 50. yıldönümü için tamamlandı. Avrupa yakasındaki Ortaköy\'ü Asya yakasındaki Beylerbeyi\'ne bağlar ve geceleri kabloları renk değiştirerek aydınlanır.',
    facts: [
      'Ana açıklığı 1.074 m; köprünün toplam uzunluğu yaklaşık 1.560 m.',
      '2016\'da 15 Temmuz 2016\'da hayatını kaybedenleri anmak için resmen yeniden adlandırıldı.',
      'Her gün 100.000\'den fazla araç geçer. Yayaların geçmesi normalde yasak, ama burada yürüyebilirsin.',
    ],
  },
  fsm: {
    kicker: '1988\'de açıldı · İkinci Boğaz Köprüsü',
    blurb:
      'Fatih Sultan Mehmed\'in adını taşıyan köprü, Boğaz\'ın en dar yerini, onun 1452\'de boğazı kontrol etmek için yaptırdığı kalenin hemen yanında geçer. İnşaat 1985\'te başladı.',
    facts: [
      'Ana açıklığı 1.090 m; ilk köprüden biraz daha uzun.',
      'Avrupa yakasındaki Rumeli Hisarı ile Asya yakasındaki Anadolu Hisarı arasındadır.',
      'Şehrin kuzeyini çevreleyen otoyolu taşır.',
    ],
  },
  galataBridge: {
    kicker: 'Bu noktadaki beşinci köprü · 1994',
    blurb:
      'Üst katta balıkçılar, alt katta restoranlar sıralanır. Köprü Haliç üzerinde Karaköy\'ü Eminönü\'ne bağlar ve burada duran beşinci köprüdür.',
    facts: [
      'Leonardo da Vinci 1502 civarında II. Bayezid için Haliç\'e bir köprü tasarımı çizdi. Hiç yapılmadı.',
      'Bir önceki Galata Köprüsü, yüzen bir köprü, 1992\'de yandı.',
      'Üst güvertede balık tutmak İstanbul\'un günlük manzarası; alt güverte restoranlarla dolu.',
    ],
  },
  maiden: {
    kicker: 'Kız Kulesi · kayanın üstündeki kule',
    blurb:
      'Bu küçük adacıkta Bizans\'tan beri bir kule gözetler. Efsaneye göre bir sultana kızının yılan sokmasıyla öleceği söylenmiş, o da kızını kuleye kapatmış. Meyve sepetinde saklanan bir yılan yine de onu bulmuş.',
    facts: [
      'Bugünkü kule 1763 tarihli ve en son 2000 civarında restore edildi.',
      'Gümrük kapısı, deniz feneri ve karantina istasyonu olarak kullanıldı.',
      '1999 tarihli James Bond filmi Dünya Yetmez\'de yer alır.',
    ],
  },
  sultanahmet: {
    kicker: 'Ayasofya 537 · Sultanahmet Camii 1616',
    blurb:
      'İki dev, tek bir meydanda karşı karşıya. Ayasofya 537\'de İmparator Justinianus döneminde tamamlandı ve yaklaşık bin yıl dünyanın en büyük katedraliydi. Sultanahmet Camii, belki de onu aşmak için tam karşısında 1609 ile 1616 arasında inşa edildi.',
    facts: [
      'Ayasofya\'yı mimar değil, matematikçi olan iki bilgin, Miletli Isidoros ve Trallesli Anthemios tasarladı. Matematik mühendisine yakışır.',
      'Kilise, 1453\'ten itibaren cami, 1935\'ten itibaren müze ve 2020\'den beri yeniden cami oldu.',
      'Sultanahmet Camii\'nin altı minaresi ve 20.000\'den fazla İznik çinisi var. Çoğu mavidir.',
    ],
  },
  camlica: {
    kicker: '2020\'de tamamlandı · Çamlıca Kulesi',
    blurb:
      'Türkiye\'nin en yüksek kulesi, Anadolu yakasının en yüksek tepesinde durur. Şehrin yayın antenlerini taşır ve iki kıtaya birden bakan gözlem katları vardır.',
    facts: [
      '369 m yüksekliğinde; tepesi deniz seviyesinden yaklaşık 587 m yukarıda.',
      'Tepenin silüetini bozan çok sayıda eski direğin yerini aldı.',
      'Tepenin kendisi Osmanlı zamanından beri piknik ve manzara noktası.',
    ],
  },
  rumeli: {
    kicker: '1452\'de inşa edildi · Rumeli Hisarı',
    blurb:
      'II. Mehmed bu kaleyi İstanbul\'u almadan bir yıl önce yaklaşık dört ayda yaptırdı. Boğaz\'ın en dar yerinde durur; topları geçmeye çalışan her gemiyi durdurabilirdi.',
    facts: [
      '1394\'te yapılan Anadolu Hisarı\'nın karşısındadır ve iki kale arasında boğazı kapatırdı.',
      'Boğaz burada yalnızca yaklaşık 660 m genişliğinde.',
      'Üç büyük kulesi, inşaatı yöneten paşaların adını taşır.',
    ],
  },
  stadium: {
    kicker: 'Beşiktaş JK · 2016\'da açıldı',
    blurb:
      'Beşiktaş\'ın siyah-beyaz yuvası, Dolmabahçe Sarayı ve Boğaz\'ın hemen yukarısında, 1947\'de açılan eski İnönü Stadyumu\'nun yerinde durur. Kulüp 1903\'e dayanır ve Türkiye\'nin en eski spor kulüplerinden biridir.',
    facts: [
      'Yaklaşık 42.000 taraftar alır; Çarşı taraftar grubu gürültüsüyle ünlüdür.',
      'Kulübün armasında bir kartal var ve takıma Kara Kartallar denir.',
      'Beşiktaş 1903\'te bir cimnastik kulübü olarak başladı, futbol sonradan geldi.',
    ],
  },
  dolmabahce: {
    kicker: '1843–1856 arasında inşa edildi · Osmanlı sarayı',
    blurb:
      'Sultan Abdülmecid, 1856\'da sarayı Topkapı\'dan Boğaz kıyısındaki Avrupa tarzı bu saraya taşıdı. Adı doldurulmuş bahçe demek; çünkü yüzyıllar önce toprakla doldurulan bir koyun üzerinde duruyor.',
    facts: [
      '285 odası, 46 salonu ve 6 hamamı var; mimarları Garabet ve Nigoğos Balyan.',
      'Muayede Salonu\'nda Kraliçe Victoria\'nın hediyesi, 750 lambalı Bohem kristali bir avize asılıdır. Yaklaşık 4,5 ton ağırlığında.',
      'Atatürk burada 10 Kasım 1938\'de saat 09.05\'te hayatını kaybetti ve saray saatleri o dakikada durdurulmuştur. Revaktaki saate bak.',
    ],
  },
  istpark: {
    kicker: '2005\'te açıldı · İstanbul Park',
    blurb:
      'Türkiye Grand Prix pisti şehrin uzak Asya yakasındaki Tuzla\'dadır ve burada daha yakına taşınmıştır. 2005\'ten 2011\'e kadar Formula 1\'e ev sahipliği yaptı, 2020 ve 2021\'de geri döndü; pilotlar hâlâ takvimin en iyi pistlerinden biri olarak anıyor.',
    facts: [
      '8. viraj, giderek daralan uzun ve yüksek hızlı bir sol viraj; pilotlara bindirdiği kuvvetlerle ünlü.',
      'Pisti Hermann Tilke tasarladı ve Formula 1\'de nadir görülen şekilde saat yönünün tersine döner.',
      'Lewis Hamilton yedinci dünya şampiyonluğunu burada, 2020\'de, yağmurda kazandı.',
    ],
  },
  valletta: {
    kicker: '1566\'da kuruldu · UNESCO 1980',
    blurb:
      'Şehri, 1565 Büyük Kuşatması\'ndan sağ çıkan Saint John Şövalyeleri hemen ardından kurdu. İtalyan mühendis Francesco Laparelli tarafından ızgara planıyla tasarlandı ve her şeye dayanacak bir başkent olarak yapıldı.',
    facts: [
      'Adını, kuşatma sırasında savunmayı yöneten Büyük Üstat Jean de Valette\'ten alır.',
      'Yaklaşık 0,6 km² ile Avrupa Birliği\'nin en küçük başkentidir.',
      '2018\'de Avrupa Kültür Başkenti oldu.',
    ],
  },
  mdina: {
    kicker: 'Sessiz Şehir',
    blurb:
      'Mdina, Şövalyeler 1530\'da limana taşınana kadar Malta\'nın başkentiydi. Yüksek surları, dar sokakları ve neredeyse hiç trafiği olmaması ona Sessiz Şehir lakabını kazandırdı.',
    facts: [
      'Romalılar buraya Melite derdi; bu tepede yaklaşık 3.000 yıldır yerleşim var.',
      'Geleneğe göre Aziz Pavlus MS 60\'ta Malta\'da gemi kazası geçirdi ve yakınlarda kaldı.',
      'Ana kapısı, Game of Thrones\'un ilk sezonunda Kral\'ın Limanı kapısı oldu.',
    ],
  },
  comino: {
    kicker: 'Mavi Lagün · Comino',
    blurb:
      'Malta ile Gozo arasında küçük bir ada; suyu o kadar berrak ki beyaz kumun üzerinde turkuaz parlar. Yıl boyunca neredeyse kimse yaşamaz.',
    facts: [
      'Comino, burada eskiden yetişen kimyon bitkisinden adını alır.',
      'Şövalyelerin 1618\'de yaptığı St Mary Kulesi, kanalı hâlâ korur.',
      'Lagün, Comino ile ıssız Cominotto adacığı arasındadır.',
    ],
  },
  itu: {
    kicker: '1773\'te kuruldu · İstanbul Teknik Üniversitesi',
    blurb:
      'İTÜ, Mühendishane-i Bahri-i Hümayun olarak başladı ve dünyanın en eski teknik üniversitelerinden biridir. Bu tapınak asıl Akademi\'ye bir selam: Platon MÖ 387 civarında Atina dışındaki bir koruda ders verdi ve akademi sözcüğü o yerden gelir.',
    facts: [
      'Platon\'un Akademisi, İmparator Justinianus\'un MS 529\'da kapatmasına kadar yaklaşık 900 yıl sürdü.',
      'Önde duran beş şekil Platonik katı cisimlerdir. Platon onları ateş, toprak, hava, su ve evrenle ilişkilendirdi.',
      'Ayazağa kampüsü Maslak\'tadır ve kendi metro durağı vardır.',
    ],
  },
  datapare: {
    kicker: 'Levent · İstanbul\'un gökdelen kuşağı',
    blurb:
      'Levent, şehrin kurumsal kalbidir. Büyükdere Caddesi ofis kuleleri, bankalar ve teknoloji şirketleriyle doludur; modern İstanbul silüeti burada büyür.',
    facts: [
      '2011\'de tamamlanan İstanbul Sapphire burada 261 m yükselir.',
      'Büyükdere Caddesi, Boğaz boyunca Karadeniz\'e giden eski yolu izler.',
      'Levent ve 4. Levent, M2 metro hattının iki durağıdır.',
    ],
  },
  pierE: {
    kicker: 'Beşiktaş · vapur',
    blurb:
      'İstanbul\'un küçük vapurları 1851\'den beri insanları denizin öbür yanına taşıyor. Beşiktaş aynı zamanda Atatürk\'ün 1938\'de vefat ettiği Dolmabahçe Sarayı\'na ev sahipliği yapar.',
    facts: [
      'Boğaz yaklaşık 31 km uzunluğunda ve Karadeniz\'i Marmara Denizi\'ne bağlar.',
      'Yılda on binlerce gemiyle dünyanın en yoğun dar su yollarından biridir.',
      'Vapurun arkasındaki martılar ve elinden simit kapan martılar yerel bir gelenektir.',
    ],
  },
  pierA: {
    kicker: 'Kadıköy · antik Khalkedon',
    blurb:
      'Megaralı Yunan yerleşimciler MÖ 685 civarında burada Khalkedon\'u kurdu; karşı kıyıdaki Byzantion\'dan yaklaşık 18 yıl önce. Efsaneye göre karşıda daha iyi yer varken kötüsünü seçtikleri için onlara körler denmiş.',
    facts: [
      'MS 451\'de erken kilisenin büyük konsillerinden biri olan Khalkedon Konsili burada toplandı.',
      'Bugün Kadıköy; çarşısı, kafeleri ve iskele yanındaki boğa heykeliyle bilinir.',
      'Eminönü\'nden Kadıköy\'e vapur yaklaşık 20 dakika sürer.',
    ],
  },
  firmasoft: {
    kicker: 'Suadiye · Bağdat Caddesi',
    blurb:
      'Suadiye, Anadolu yakasının uzun alışveriş caddesi Bağdat Caddesi üzerindedir. Cadde, ordusu buradan geçen IV. Murad\'ın 1638 Bağdat Seferi\'nden adını alır.',
    facts: [
      'Bağdat Caddesi yaklaşık 14 km uzunluğunda; Kadıköy\'den Bostancı\'ya uzanır.',
      'Buradaki Marmara kıyısı akşam yürüyüşleri için favori.',
      'İstanbul nüfusunun yaklaşık üçte biri Asya yakasında yaşar.',
    ],
  },
  huawei: {
    kicker: 'Ümraniye · Petal Maps',
    blurb:
      'Ümraniye, Anadolu yakasının büyük ve hızla gelişen bir ilçesi. 1987\'de Shenzhen\'de kurulan Huawei, Petal Maps\'i 2020\'de kendi mobil servislerinin parçası olarak çıkardı.',
    facts: [
      'İlçenin adı, gelişme anlamındaki Arapça umran sözcüğünden gelir.',
      'Huawei, küçük bir ticaret şirketinden dünyanın en büyük telekom üreticilerinden birine dönüştü.',
      'Üzerinde çalıştığım Petal Maps araçları ayda 20 milyondan fazla kullanıcıya hizmet verdi.',
    ],
  },
  goart: {
    kicker: 'Maltepe · sanal dünyalar',
    blurb:
      'Sanal gerçeklik yüzüne bir ekran koyar; metaverse ise bunu bir mekâna dönüştürmeye çalışır. Tarayıcıda gerçek zamanlı 3D, tıpkı bu harita gibi, three.js\'in de arkasındaki teknoloji olan WebGL üzerine kuruludur.',
    facts: [
      'WebGL, eklenti olmadan tarayıcıda, doğrudan GPU üzerinde çalışır.',
      'Bu haritayı çalıştıran three.js\'i 2010\'da Ricardo Cabello (mrdoob) başlattı.',
      'İlk kafaya takılan ekran, Ivan Sutherland\'ın Demokles\'in Kılıcı\'ydı ve 1968\'de yapıldı.',
    ],
  },
  ist: {
    kicker: '2001\'de açıldı · Sabiha Gökçen',
    blurb:
      'İstanbul\'un ikinci havalimanı, Atatürk\'ün manevi kızı ve dünyanın ilk kadın savaş pilotu olarak kabul edilen Sabiha Gökçen\'in adını taşır.',
    facts: [
      '1913\'ten 2001\'e kadar yaşadı; havalimanının açıldığı yıl.',
      'Asya yakasındadır ve Kadıköy\'ün yaklaşık 35 km doğusundadır.',
      'Pegasus Hava Yolları\'nın ana merkezidir.',
    ],
  },
  mla: {
    kicker: 'Luqa · Malta Uluslararası Havalimanı',
    blurb:
      'Havalimanı, savaş döneminin hava üssü RAF Luqa olarak başladı. 1942\'de kuşatma altındaki cesareti için bütün adaya George Cross verildi ve haç hâlâ Malta bayrağındadır.',
    facts: [
      'Malta yalnızca yaklaşık 27 km uzunluğunda.',
      'Adanın savunmasında bu pistten Spitfire\'lar havalandı.',
      'Maltaca, AB\'nin resmî dili olan tek Sami dilidir.',
    ],
  },
  fasttrack: {
    kicker: 'Gżira · ada',
    blurb:
      'Gżira Maltaca\'da basitçe ada demek; karşıdaki limanda duran Manoel Adası\'ndan adını alır. Üzerindeki Manoel Kalesi 1720\'lerde Saint John Tarikatı tarafından yapıldı.',
    facts: [
      'Gżira, Marsamxett Limanı boyunca Valletta\'ya bakar.',
      'Malta dili Arapça köklerle İtalyanca ve İngilizce sözcükleri karıştırır.',
      'Malta, on yıldan uzun süredir çevrimiçi ve oyun şirketleri için bir merkezdir.',
    ],
  },
  arcade: {
    kicker: 'St Julian\'s · Spinola Koyu',
    blurb:
      'Spinola Koyu, Malta\'nın eğlence bölgesi olmadan önce bir balıkçı köyüydü. Boyalı luzzu tekneleri hâlâ koyda sallanır.',
    facts: [
      'Kasaba adını Aziz Julian Hospitalier\'den alır.',
      'Luzzu\'ların burnunda uğursuzluğu uzak tutan bir Osiris Gözü bulunur.',
      'Spinola Sarayı 1688\'de tarikatın bir şövalyesi tarafından yapıldı.',
    ],
  },
  skills: {
    kicker: 'Mdina · Sessiz Şehir',
    blurb:
      'Mdina yüzyıllarca Malta\'nın başkentiydi ve dar sokaklarında hâlâ neredeyse hiç trafik yok. Yetenek ağacı için uygun bir yer: çok eski bir şey ama her şey hâlâ düzenli.',
    facts: [
      'Surları yalnızca yaklaşık 250 sakinli bir tepe yerleşimini çevreler.',
      'Romalılar buraya Melite derdi.',
      'Game of Thrones\'un ilk sezonunda Kral\'ın Limanı olarak göründü.',
    ],
  },
  contact: {
    kicker: 'St Elmo Kalesi · 1565',
    blurb:
      '1565\'te bir Osmanlı donanması Malta\'yı kuşattı. St Elmo Kalesi yaklaşık bir ay dayandı; saldırıyı geciktirmeye yetti ve ada ayakta kaldı. Korsan komutan Turgut Reis burada çarpışmada hayatını kaybetti.',
    facts: [
      'Büyük Malta Kuşatması Mayıs\'tan Eylül 1565\'e kadar sürdü.',
      'Batıda Dragut olarak bilinen Turgut Reis, bir Türk amiraliydi ve St Elmo\'da ölümcül yaralandı.',
      'Kuşatmadan sonra Şövalyeler Valletta\'yı kalenin yanında kurdu.',
    ],
  },
  padel: {
    kicker: '1969\'da icat edildi · Acapulco',
    blurb:
      'Padel, Meksika\'nın Acapulco kentinde Enrique Corcuera tarafından, misafirlerinin topu kaybetmemesi için evinde duvarlı bir kort yaptırmasıyla icat edildi. Sonra İspanya ve Arjantin\'de, ardından Avrupa\'nın geri kalanında yayıldı.',
    facts: [
      'Kort 20 × 10 m ve topu cam duvarlardan oynayabilirsin.',
      'Her zaman çiftler halinde ve alttan servisle oynanır.',
      'Dünyanın en hızlı büyüyen sporlarından biridir.',
    ],
  },
  gaming: {
    kicker: 'Project Zomboid · Knox County',
    blurb:
      'Project Zomboid, 1993 Temmuz\'unda Kentucky\'deki Knox County\'de geçer ve hiç iyi bitmez. Yan projelerimdeki canlı harita Knox Companion, onu oynayan ekipler için yapıldı.',
    facts: [
      '2013\'ten beri Steam\'de erken erişimde; geliştiricisi The Indie Stone.',
      'Sloganıyla bilinir: "Böyle öldün."',
      'Knox Companion, ekip konumlarını bir Leaflet haritasında gerçek zamanlı senkronize eder.',
    ],
  },
  travel: {
    kicker: 'İstanbul · iki kıta',
    blurb:
      'İstanbul, bir yakası Avrupa, öbür yakası Asya olan, iki kıtaya yayılan çok az büyük şehirden biri. Bir gezgin için güzel bir başlangıç noktası.',
    facts: [
      'Şehrin adı Byzantion, sonra Konstantinopolis idi; posta sisteminde 1930\'dan beri İstanbul.',
      'Sırayla Roma, Bizans ve Osmanlı imparatorluklarının başkentiydi.',
      'En güzel manzaralardan bazıları, kıtalar arasındaki suyun üstünde, vapurdan görülür.',
    ],
  },
  rome: {
    kicker: 'MS 80\'de tamamlandı · Kolezyum',
    blurb:
      'Flavius Amfitiyatrosu, MS 80\'de İmparator Titus döneminde açıldı. Yaklaşık 50.000 seyirci alıyordu ve arenanın altında bir tünel ve asansör labirenti vardı. Romalılar betonlarına volkanik kül kattı; bu yüzden bu kadarı hâlâ ayakta.',
    facts: [
      'On yıldan kısa sürede, Nero\'nun sarayının kurutulmuş gölü üzerine inşa edildi.',
      'Seksen giriş, bütün kalabalığın dakikalar içinde oturabilmesini sağlıyordu.',
      'Yeraltı katı olan hipojenin, dekor ve hayvanlar için tuzak kapakları vardı.',
    ],
  },
  milan: {
    kicker: '1386\'da başladı · Milano Duomo',
    blurb:
      'Katedralin tamamlanması neredeyse altı yüzyıl sürdü. Mermer çatısı kulelerle dolu ve yanlarındaki teraslarda yürüyebilirsin.',
    facts: [
      '135 kulesi ve yaklaşık 3.400 heykeli var.',
      'En üst kuledeki altın Madonnina yaklaşık 4 m yüksekliğinde.',
      'Bronz kapıların sonuncusu ancak 1965\'te takıldı.',
    ],
  },
  monza: {
    kicker: '1922\'de açıldı · Hız Tapınağı',
    blurb:
      'Kraliyet parkının içinde yalnızca 110 günde inşa edilen Monza, yarış dünyasının en hızlı pistlerinden biri. İtalya Grand Prix\'si, Formula 1 dünya şampiyonasının başladığı 1950\'den beri neredeyse her yıl burada yapıldı; kırmızılara bürünmüş Ferrari taraftarları, tifosi, denizi gibi.',
    facts: [
      'Brooklands ve Indianapolis\'ten sonra yapılmış üçüncü amaca yönelik yarış pistidir.',
      'Buradaki F1 araçları turun çoğunu tam gazda, 340 km/s\'in üzerinde hızlarla geçirir.',
      'Parabolica, bugünkü adıyla Curva Alboreto, start-finiş düzlüğünden önceki geniş son virajdır.',
    ],
  },
  amsterdam: {
    kicker: 'Altın Çağ kanalları · UNESCO 2010',
    blurb:
      'Kanal halkası, Amsterdam\'ın dünyanın en zengin ticaret şehirlerinden biri olduğu 17. yüzyılda kazıldı. Dar cepheli evler suyun üzerine eğilir ve her yerde bisikletler var.',
    facts: [
      'Şehirde yaklaşık 165 kanal ve 1.500 köprü var.',
      'Amsterdam\'da yaklaşık insan sayısı kadar bisiklet var.',
      'Evler o kadar dar ki eşyalar pencerelerden kiriş ve kanca ile çekilirdi.',
    ],
  },
  zandvoort: {
    kicker: 'Hollanda Grand Prix · Zandvoort Pisti',
    blurb:
      '1948\'de açılan, Kuzey Denizi kum tepeleri arasında kıvrılan bir pist. Hollanda Grand Prix\'si 36 yıl sonra 2021\'de buraya döndü ve Max Verstappen 2021, 2022 ve 2023\'te turuncu dolu bir stadyum önünde kazandı.',
    facts: [
      'Son viraj, Arie Luyendyk virajı, yaklaşık 18 derece eğimlidir.',
      'Kum pistin üstüne savrulur; bu yüzden pilotlar kum tepelerinde çok dikkatli sürer.',
      'Verstappen 2021\'de ilk Hollandalı Formula 1 dünya şampiyonu oldu ve 2021\'den 2024\'e art arda dört şampiyonluk kazandı.',
    ],
  },
  krakow: {
    kicker: 'Rynek Główny · UNESCO 1978',
    blurb:
      'Krakow\'un Ana Pazar Meydanı, Avrupa\'nın en büyük ortaçağ meydanlarından biri. Aziz Meryem Bazilikası\'nın farklı yükseklikte iki kulesi var ve her saat bir trompetçi, bir Tatar okuyla vurulduğu söylenen bir gözcünün anısına, notanın ortasında kesilen bir melodi çalar.',
    facts: [
      'Krakow\'un eski şehri UNESCO Dünya Mirası listesine giren ilk on iki yerden biriydi.',
      'Meydanın ortasındaki Kumaş Salonu (Sukiennice) Orta Çağ\'dan beri pazar yeridir.',
      'Kalenin altındaki Wawel Ejderhası heykeli birkaç dakikada bir gerçek ateş püskürtür.',
    ],
  },
  cologne: {
    kicker: '1248\'de başladı · Kölner Dom · UNESCO 1996',
    blurb:
      'Köln\'ün Gotik katedralini bitirmek 632 yıl sürdü: çalışma 1248\'de başladı, üç yüzyıldan uzun süre durdu ve 1880\'de bitti. İkiz kuleleri birkaç yıl onu dünyanın en yüksek binası yaptı.',
    facts: [
      'Kuleler yaklaşık 157 m yüksekliğinde; güney kulesinden seyir platformuna tırmanış 533 basamak.',
      'Katedral, İkinci Dünya Savaşı bombardımanından sonra şehrin yıkıntıları arasında neredeyse bütün kaldı.',
      'İçinde, Batı Avrupa\'nın en büyük ortaçağ rölikerisi Üç Kral Mabedi var. Dışarıda ise Hohenzollern Köprüsü binlerce aşk kilidiyle donatılmıştır.',
    ],
  },
  porto: {
    kicker: 'Dom Luís I Köprüsü · 1886',
    blurb:
      'Douro üzerinde, Gustave Eiffel\'in iş ortağı olmuş Théophile Seyrig tarafından tasarlanan iki katlı demir kemer köprü. Porto şarabı karşı yakadaki mahzenlerde olgunlaşır.',
    facts: [
      'Üst güverteyi artık metro ve yayalar, alt güverteyi araçlar kullanır.',
      'Douro şarap bölgesi, 1756\'da yasal olarak sınırlandırılan dünyadaki ilk bölgelerden biriydi.',
      'São Bento istasyonu yaklaşık 20.000 mavi-beyaz azulejo çinisiyle kaplıdır.',
    ],
  },
  oslo: {
    kicker: 'Opera Binası · 2008\'de açıldı',
    blurb:
      'Snøhetta mimarlık ofisi tarafından tasarlanan Oslo Opera Binası, fiyorttan bir buzdağı gibi yükselir. Beyaz mermer çatısı suya kadar iner ve herkes çıkabilir.',
    facts: [
      'Çatı İtalyan Carrara mermeriyle kaplıdır.',
      'Oslo Belediye Binası her Aralık Nobel Barış Ödülü törenine ev sahipliği yapar.',
      'Şehir ormanlar ve fiyortla çevrilidir; metro hattı tepelere kadar çıkar.',
    ],
  },
  bruges: {
    kicker: 'Belfry · UNESCO 2000',
    blurb:
      'Brugge Orta Çağ\'da kumaş ve ticaretle zenginleşti. Limanı tıkanınca para başka yere gitti ve şehir neredeyse dokunulmadan kaldı. 83 m\'lik Belfry hâlâ pazar meydanının üzerinde çalar.',
    facts: [
      'Belfry\'ye tırmanmak 366 basamak sürer.',
      'Çan çalarında 47 çan var.',
      'Kanalları ona Kuzey\'in Venedik\'i lakabını kazandırdı.',
    ],
  },
  ohrid: {
    kicker: 'Kaneo\'daki Aziz Yuhanna · UNESCO 1979',
    blurb:
      'Ohrid Gölü, Avrupa\'nın milyonlarca yıllık en eski göllerinden biri ve kıyısı kiliselerle dolu. 13. yüzyıldan kalma küçük Kaneo Aziz Yuhanna Kilisesi, suyun üzerindeki bir uçurumda durur.',
    facts: [
      'Göl, Kuzey Makedonya ile Arnavutluk arasında paylaşılır.',
      'Aziz Clement MS 886\'da Ohrid Edebiyat Okulu\'nu kurdu ve bu, Kiril alfabesinin yayılmasına yardım etti.',
      'Yerel bir söze göre kentte bir zamanlar her gün için bir tane, 365 kilise vardı.',
    ],
  },
  luzern: {
    kicker: 'Kapellbrücke 1333 · Rigi Dağı',
    blurb:
      'Lüzern\'in ahşap Kapellbrücke\'si Avrupa\'nın en eski kapalı ahşap köprüsüdür ve Su Kulesi bir simgedir. Gölün üzerinde, Alpler\'in panoramik manzarasıyla Dağların Kraliçesi Rigi Dağı yükselir.',
    facts: [
      '1993\'teki bir yangın köprünün çoğunu yok etti; köprü bir yıl içinde yeniden yapıldı.',
      'Rigi 1.798 m yüksekliğinde ve 1871\'deki Vitznau–Rigi demiryolu Avrupa\'nın ilk dağ demiryoluydu.',
      'Zirve Rigi Kulm adını taşır ve açık havada manzara Alpler\'i ve birkaç gölü kapsar.',
    ],
  },
}

export default { lore, notes }

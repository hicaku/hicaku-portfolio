import type { Lore } from '../../data/lore'

const notes: Record<string, string> = {
  monza: 'Ich war wegen der Formel 1 hier.',
  zandvoort: 'Ich war wegen der Formel 1 hier.',
  luzern: 'Ich bin auf den Rigi gestiegen, bis ganz nach oben.',
  cologne: 'Ich bin mit meinem Freund alle 533 Stufen bis auf den Turm der Kathedrale gestiegen.',
  bruges: 'Ich bin auf den Belfried gestiegen.',
}

const lore: Record<string, Lore> = {
  galata: {
    kicker: 'Erbaut 1348 · genuesische Kolonie',
    blurb:
      'Die Genuesen errichteten diesen Turm als Schlussstein ihrer ummauerten Kolonie Galata und nannten ihn Turm Christi. Jahrhundertelang diente er der ganzen Stadt als Feuerwache, und heute ist er einer der besten Aussichtspunkte über das Goldene Horn.',
    facts: [
      'Er ist etwa 67 m hoch; die Kegelspitze ist eine spätere Restaurierung.',
      'Osmanische Feuerwächter lebten darin und meldeten Brände über die ganze Stadt.',
      'Der Legende nach schnallte sich Hezarfen Ahmed Çelebi hier in den 1630er-Jahren Flügel um und glitt über den Bosporus nach Üsküdar.',
    ],
  },
  bosphorus: {
    kicker: 'Eröffnet 1973 · Brücke der Märtyrer des 15. Juli',
    blurb:
      'Die erste Brücke über den Bosporus, fertiggestellt zum 50. Jahrestag der Türkischen Republik. Sie verbindet Ortaköy in Europa mit Beylerbeyi in Asien, und nachts leuchten ihre Seile in wechselnden Farben.',
    facts: [
      'Die Hauptspannweite beträgt 1.074 m; die ganze Brücke ist etwa 1.560 m lang.',
      '2016 wurde sie offiziell umbenannt, zum Gedenken an die Menschen, die am 15. Juli 2016 starben.',
      'Weit über 100.000 Fahrzeuge überqueren sie täglich. Fußgänger dürfen normalerweise nicht darüber, hier aber schon.',
    ],
  },
  fsm: {
    kicker: 'Eröffnet 1988 · Zweite Bosporus-Brücke',
    blurb:
      'Benannt nach Sultan Mehmed dem Eroberer, überquert die Brücke die schmalste Stelle der Meerenge, direkt neben der Festung, die er 1452 zu deren Kontrolle baute. Der Bau begann 1985.',
    facts: [
      'Die Hauptspannweite beträgt 1.090 m, etwas mehr als bei der ersten Brücke.',
      'Sie liegt zwischen Rumeli Hisarı auf der europäischen und Anadolu Hisarı auf der asiatischen Seite.',
      'Sie trägt die Autobahn, die den Norden der Stadt umgeht.',
    ],
  },
  galataBridge: {
    kicker: 'Die fünfte Brücke an dieser Stelle · 1994',
    blurb:
      'Angler säumen das Oberdeck, Restaurants füllen das untere. Die Brücke verbindet Karaköy mit Eminönü über das Goldene Horn und ist die fünfte an dieser Stelle.',
    facts: [
      'Leonardo da Vinci zeichnete um 1502 für Sultan Bayezid II einen Brückenentwurf für das Goldene Horn. Er wurde nie gebaut.',
      'Die vorherige Galatabrücke, eine Schwimmbrücke, brannte 1992 ab.',
      'Angeln vom Oberdeck ist eine alltägliche Istanbuler Szene, und das Unterdeck ist voller Restaurants.',
    ],
  },
  maiden: {
    kicker: 'Kız Kulesi · Turm auf einem Felsen',
    blurb:
      'Seit byzantinischer Zeit wacht ein Turm über diese winzige Insel. Der Legende nach wurde einem Sultan prophezeit, seine Tochter werde an einem Schlangenbiss sterben, und er sperrte sie in den Turm. Eine in einem Obstkorb versteckte Schlange fand sie trotzdem.',
    facts: [
      'Der heutige Turm stammt von 1763 und wurde zuletzt um das Jahr 2000 restauriert.',
      'Er diente als Zollstation, Leuchtturm und Quarantänestation.',
      'Er kommt im James-Bond-Film Die Welt ist nicht genug von 1999 vor.',
    ],
  },
  sultanahmet: {
    kicker: 'Hagia Sophia 537 · Blaue Moschee 1616',
    blurb:
      'Zwei Giganten stehen sich auf einem Platz gegenüber. Die Hagia Sophia wurde 537 unter Kaiser Justinian vollendet und war rund tausend Jahre die größte Kathedrale der Welt. Die Blaue Moschee wurde zwischen 1609 und 1616 gegenüber gebaut, vielleicht um sie zu übertrumpfen.',
    facts: [
      'Die Hagia Sophia entwarfen zwei Gelehrte, Isidor von Milet und Anthemios von Tralleis, die Mathematiker und keine Architekten waren. Passend für einen Mathematik-Ingenieur.',
      'Sie war eine Kirche, ab 1453 eine Moschee, ab 1935 ein Museum und ist seit 2020 wieder eine Moschee.',
      'Die Blaue Moschee hat sechs Minarette und über 20.000 İznik-Fliesen. Die meisten sind blau.',
    ],
  },
  camlica: {
    kicker: 'Fertiggestellt 2020 · Çamlıca-Turm',
    blurb:
      'Der höchste Turm der Türkei steht auf dem höchsten Hügel der asiatischen Seite. Er trägt die Sendeantennen der Stadt und hat Aussichtsplattformen, die beide Kontinente zugleich überblicken.',
    facts: [
      'Er ist 369 m hoch, und seine Spitze liegt etwa 587 m über dem Meeresspiegel.',
      'Er ersetzte ein Sammelsurium älterer Masten, die die Silhouette des Hügels störten.',
      'Der Hügel selbst ist seit osmanischer Zeit ein Ausflugs- und Aussichtsort.',
    ],
  },
  rumeli: {
    kicker: 'Erbaut 1452 · Rumeli Hisarı',
    blurb:
      'Sultan Mehmed II. baute diese Festung in etwa vier Monaten, ein Jahr bevor er Konstantinopel einnahm. Sie steht an der engsten Stelle der Meerenge, sodass ihre Kanonen jedes Schiff stoppen konnten, das durchfahren wollte.',
    facts: [
      'Sie liegt gegenüber von Anadolu Hisarı, erbaut 1394, und beide Festungen sperrten zusammen die Meerenge.',
      'Der Bosporus ist hier nur etwa 660 m breit.',
      'Ihre drei großen Türme sind nach den Paschas benannt, die ihren Bau beaufsichtigten.',
    ],
  },
  stadium: {
    kicker: 'Beşiktaş JK · eröffnet 2016',
    blurb:
      'Die schwarz-weiße Heimat von Beşiktaş liegt oberhalb des Dolmabahçe-Palasts und des Bosporus, an der Stelle des alten İnönü-Stadions, das 1947 eröffnet wurde. Der Verein geht auf 1903 zurück und ist damit einer der ältesten Sportvereine der Türkei.',
    facts: [
      'Es fasst rund 42.000 Fans, und die Fangruppe Çarşı ist berühmt für ihre Lautstärke.',
      'Das Vereinswappen zeigt einen Adler, und die Mannschaft heißt die Schwarzen Adler.',
      'Beşiktaş begann 1903 als Turnverein, und der Fußball kam später.',
    ],
  },
  dolmabahce: {
    kicker: 'Erbaut 1843–1856 · osmanischer Palast',
    blurb:
      'Sultan Abdülmecid I. verlegte den Hof 1856 vom Topkapı hierher, in einen Palast im europäischen Stil am Ufer des Bosporus. Der Name bedeutet aufgeschütteter Garten, weil er auf einer Bucht steht, die Jahrhunderte zuvor mit Erde aufgefüllt wurde.',
    facts: [
      'Er hat 285 Räume, 46 Säle und 6 Hamams, und seine Architekten waren Garabet und Nikoğos Balyan.',
      'Im Zeremoniensaal hängt ein böhmischer Kristalllüster mit 750 Lampen, ein Geschenk von Königin Victoria. Er wiegt rund 4,5 Tonnen.',
      'Atatürk starb hier am 10. November 1938 um 09:05 Uhr, und die Uhren des Palasts sind auf diese Minute angehalten. Sieh dir die Uhr am Portikus an.',
    ],
  },
  istpark: {
    kicker: 'Eröffnet 2005 · Istanbul Park',
    blurb:
      'Die Rennstrecke des Großen Preises der Türkei liegt in Tuzla, am fernen asiatischen Ende der Stadt, und ist hier näher herangerückt. Sie war von 2005 bis 2011 Gastgeber der Formel 1 und kehrte 2020 und 2021 zurück; Fahrer sprechen noch heute von ihr als einer der besten Strecken im Kalender.',
    facts: [
      'Kurve 8 ist eine lange, schnelle Linkskurve, die sich immer enger zuzieht und für die Kräfte berühmt ist, die sie auf die Fahrer ausübt.',
      'Die Strecke entwarf Hermann Tilke, und sie wird gegen den Uhrzeigersinn befahren, was in der Formel 1 ungewöhnlich ist.',
      'Lewis Hamilton sicherte sich hier 2020 bei Regen seinen siebten WM-Titel.',
    ],
  },
  valletta: {
    kicker: 'Gegründet 1566 · UNESCO 1980',
    blurb:
      'Die Stadt gründeten die Johanniter, kurz nachdem sie die Große Belagerung von 1565 überstanden hatten. Der italienische Ingenieur Francesco Laparelli legte sie im Schachbrettmuster an, und sie wurde eine Hauptstadt, die allem standhalten sollte.',
    facts: [
      'Sie ist nach Großmeister Jean de Valette benannt, der die Verteidigung während der Belagerung leitete.',
      'Mit etwa 0,6 km² ist sie die kleinste Hauptstadt der Europäischen Union.',
      '2018 war sie Europäische Kulturhauptstadt.',
    ],
  },
  mdina: {
    kicker: 'Die Stille Stadt',
    blurb:
      'Mdina war die Hauptstadt Maltas, bis die Ritter 1530 an den Hafen zogen. Ihre hohen Mauern, schmalen Gassen und der fast nicht vorhandene Verkehr brachten ihr den Beinamen Stille Stadt ein.',
    facts: [
      'Die Römer nannten sie Melite; dieser Hügel ist seit rund 3.000 Jahren besiedelt.',
      'Der Überlieferung nach erlitt der heilige Paulus im Jahr 60 n. Chr. vor Malta Schiffbruch und blieb in der Nähe.',
      'Ihr Haupttor spielte in der ersten Staffel von Game of Thrones das Tor von King\'s Landing.',
    ],
  },
  comino: {
    kicker: 'Blaue Lagune · Comino',
    blurb:
      'Eine winzige Insel zwischen Malta und Gozo, berühmt für Wasser, das so klar ist, dass es über weißem Sand türkis leuchtet. Fast niemand lebt hier das ganze Jahr.',
    facts: [
      'Comino ist nach der Kreuzkümmelpflanze benannt, die hier einst wuchs.',
      'Der St.-Marien-Turm, 1618 von den Rittern erbaut, bewacht noch immer den Kanal.',
      'Die Lagune liegt zwischen Comino und dem unbewohnten Inselchen Cominotto.',
    ],
  },
  itu: {
    kicker: 'Gegründet 1773 · Technische Universität Istanbul',
    blurb:
      'Die ITU begann als Kaiserliche Marineingenieurschule und gehört zu den ältesten technischen Universitäten der Welt. Dieser Tempel ist eine Verbeugung vor der ursprünglichen Akademie: Platon lehrte um 387 v. Chr. in einem Hain vor Athen, und das Wort Akademie stammt von diesem Ort.',
    facts: [
      'Platons Akademie bestand fast 900 Jahre, bis Kaiser Justinian sie im Jahr 529 n. Chr. schloss.',
      'Die fünf Körper davor sind die Platonischen Körper. Platon verband sie mit Feuer, Erde, Luft, Wasser und dem Kosmos.',
      'Der Campus Ayazağa liegt in Maslak und hat eine eigene Metro-Station.',
    ],
  },
  datapare: {
    kicker: 'Levent · Istanbuls Hochhausgürtel',
    blurb:
      'Levent ist das Geschäftszentrum der Stadt. Die Büyükdere-Allee ist gesäumt von Bürotürmen, Banken und Tech-Firmen, und hier wächst die Skyline des modernen Istanbul.',
    facts: [
      'Der 2011 fertiggestellte Istanbul Sapphire ragt hier 261 m auf.',
      'Die Büyükdere-Allee folgt der alten Straße am Bosporus entlang zum Schwarzen Meer.',
      'Levent und 4. Levent sind beides Haltestellen der Metro-Linie M2.',
    ],
  },
  pierE: {
    kicker: 'Beşiktaş · der Vapur',
    blurb:
      'Die kleinen Dampfer Istanbuls bringen seit 1851 Pendler über das Wasser. In Beşiktaş steht auch der Dolmabahçe-Palast, in dem Atatürk 1938 starb.',
    facts: [
      'Der Bosporus ist etwa 31 km lang und verbindet das Schwarze Meer mit dem Marmarameer.',
      'Er gehört mit zehntausenden Schiffen pro Jahr zu den meistbefahrenen engen Wasserstraßen der Welt.',
      'Möwen, die im Kielwasser der Fähre mitfliegen und dir den Simit aus der Hand schnappen, sind eine lokale Tradition.',
    ],
  },
  pierA: {
    kicker: 'Kadıköy · das antike Chalkedon',
    blurb:
      'Griechische Siedler aus Megara gründeten Chalkedon hier um 685 v. Chr., etwa 18 Jahre vor Byzantion am anderen Ufer. Der Legende nach nannte man sie die Blinden, weil sie die schlechtere Seite wählten, obwohl die bessere direkt gegenüberlag.',
    facts: [
      'Das Konzil von Chalkedon tagte hier im Jahr 451 n. Chr., eines der großen Konzile der frühen Kirche.',
      'Heute ist Kadıköy für seinen Markt, seine Cafés und die Stierstatue am Anleger bekannt.',
      'Die Fähre von Eminönü nach Kadıköy braucht etwa 20 Minuten.',
    ],
  },
  firmasoft: {
    kicker: 'Suadiye · Bağdat-Allee',
    blurb:
      'Suadiye liegt an der Bağdat-Allee, dem langen Einkaufsboulevard der asiatischen Seite. Die Straße ist nach dem Bagdad-Feldzug von Sultan Murad IV. im Jahr 1638 benannt, dessen Heer darauf marschierte.',
    facts: [
      'Die Bağdat-Allee ist etwa 14 km lang und führt von Kadıköy nach Bostancı.',
      'Die Marmara-Küste hier ist ein Lieblingsziel für Abendspaziergänge.',
      'Auf der asiatischen Seite lebt etwa ein Drittel der Istanbuler.',
    ],
  },
  huawei: {
    kicker: 'Ümraniye · Petal Maps',
    blurb:
      'Ümraniye ist ein großer, schnell wachsender Bezirk der asiatischen Seite. Huawei, 1987 in Shenzhen gegründet, brachte 2020 Petal Maps als Teil seiner eigenen Mobildienste heraus.',
    facts: [
      'Der Bezirksname stammt vom arabischen Wort für Aufblühen, umran.',
      'Huawei wuchs von einer kleinen Handelsfirma zu einem der größten Telekommunikationsausrüster der Welt.',
      'Die Petal-Maps-Werkzeuge, an denen ich gearbeitet habe, bedienten über 20 Millionen monatliche Nutzer.',
    ],
  },
  goart: {
    kicker: 'Maltepe · virtuelle Welten',
    blurb:
      'Virtual Reality setzt dir einen Bildschirm vors Gesicht, und das Metaverse versucht, daraus einen Ort zu machen. 3D in Echtzeit im Browser, wie diese Karte, baut auf WebGL auf, derselben Technik hinter three.js.',
    facts: [
      'WebGL läuft ohne Plug-in im Browser, direkt auf der GPU.',
      'three.js, das diese Karte antreibt, wurde 2010 von Ricardo Cabello (mrdoob) begonnen.',
      'Das erste Head-Mounted-Display, Ivan Sutherlands Damoklesschwert, wurde 1968 gebaut.',
    ],
  },
  ist: {
    kicker: 'Eröffnet 2001 · Sabiha Gökçen',
    blurb:
      'Istanbuls zweiter Flughafen ist nach Sabiha Gökçen benannt, Atatürks Adoptivtochter, die als erste Kampfpilotin der Welt gilt.',
    facts: [
      'Sie lebte von 1913 bis 2001, dem Jahr, in dem der Flughafen eröffnet wurde.',
      'Er liegt auf der asiatischen Seite, etwa 35 km östlich von Kadıköy.',
      'Er ist das Drehkreuz von Pegasus Airlines.',
    ],
  },
  mla: {
    kicker: 'Luqa · Internationaler Flughafen Malta',
    blurb:
      'Der Flughafen begann als RAF Luqa, ein Fliegerhorst im Krieg. 1942 erhielt die ganze Insel das George Cross für ihren Mut während der Belagerung, und das Kreuz prangt noch heute auf der maltesischen Flagge.',
    facts: [
      'Malta ist nur etwa 27 km lang.',
      'Von diesem Platz starteten Spitfires zur Verteidigung der Insel.',
      'Maltesisch ist die einzige semitische Sprache, die Amtssprache der EU ist.',
    ],
  },
  fasttrack: {
    kicker: 'Gżira · Insel',
    blurb:
      'Gżira bedeutet auf Maltesisch schlicht Insel, benannt nach Manoel Island, die im Hafen gegenüberliegt. Das Fort Manoel darauf bauten die Johanniter in den 1720er-Jahren.',
    facts: [
      'Gżira blickt über den Marsamxett-Hafen auf Valletta.',
      'Die maltesische Sprache mischt arabische Wurzeln mit italienischen und englischen Wörtern.',
      'Malta ist seit über einem Jahrzehnt ein Standort für Online- und Gaming-Unternehmen.',
    ],
  },
  arcade: {
    kicker: 'St Julian\'s · Spinola-Bucht',
    blurb:
      'Die Spinola-Bucht war ein Fischerdorf, bevor sie zum Vergnügungsviertel Maltas wurde. Die bemalten Luzzu-Boote schaukeln noch immer in der Bucht.',
    facts: [
      'Der Ort ist nach dem heiligen Julian dem Gastfreien benannt.',
      'Luzzus tragen am Bug ein Auge des Osiris, das Unglück abwehren soll.',
      'Der Spinola-Palast wurde 1688 von einem Ritter des Ordens gebaut.',
    ],
  },
  skills: {
    kicker: 'Mdina · die Stille Stadt',
    blurb:
      'Mdina war jahrhundertelang Maltas Hauptstadt, und ihre engen Gassen sind noch immer fast autofrei. Ein passender Ort für einen Fähigkeitenbaum: etwas sehr Altes, bei dem noch alles gut geordnet ist.',
    facts: [
      'Ihre Mauern umschließen eine Siedlung auf dem Hügel mit nur etwa 250 Einwohnern.',
      'Die Römer nannten sie Melite.',
      'Sie war in der ersten Staffel von Game of Thrones King\'s Landing.',
    ],
  },
  contact: {
    kicker: 'Fort St. Elmo · 1565',
    blurb:
      '1565 belagerte eine osmanische Flotte Malta. Fort St. Elmo hielt etwa einen Monat stand, lange genug, um den Angriff zu verzögern, und die Insel überlebte. Der Korsarenführer Turgut Reis starb bei den Kämpfen hier.',
    facts: [
      'Die Große Belagerung Maltas dauerte von Mai bis September 1565.',
      'Turgut Reis, im Westen als Dragut bekannt, war ein türkischer Admiral und wurde bei St. Elmo tödlich verwundet.',
      'Nach der Belagerung gründeten die Ritter Valletta neben dem Fort.',
    ],
  },
  padel: {
    kicker: 'Erfunden 1969 · Acapulco',
    blurb:
      'Padel erfand Enrique Corcuera in Acapulco, Mexiko, der an seinem Haus einen ummauerten Platz baute, damit seine Gäste den Ball nicht verlieren. Später wurde es in Spanien und Argentinien beliebt und dann im Rest Europas.',
    facts: [
      'Ein Platz misst 20 × 10 m und hat Glaswände, über die man spielen darf.',
      'Es wird immer im Doppel gespielt, mit Aufschlag von unten.',
      'Es ist eine der am schnellsten wachsenden Sportarten der Welt.',
    ],
  },
  gaming: {
    kicker: 'Project Zomboid · Knox County',
    blurb:
      'Project Zomboid spielt im Knox County in Kentucky im Juli 1993, und es geht nie gut aus. Knox Companion, die Live-Karte in meinen Nebenprojekten, ist für Gruppen gebaut, die es spielen.',
    facts: [
      'Es ist seit 2013 im Early Access auf Steam, entwickelt von The Indie Stone.',
      'Bekannt ist es für seinen Slogan: „So bist du gestorben.“',
      'Knox Companion synchronisiert Gruppenpositionen in Echtzeit auf einer Leaflet-Karte.',
    ],
  },
  travel: {
    kicker: 'Istanbul · zwei Kontinente',
    blurb:
      'Istanbul ist eine der ganz wenigen Großstädte auf zwei Kontinenten, mit Europa am einen Ufer und Asien am anderen. Ein guter Ausgangspunkt für Reisende.',
    facts: [
      'Die Stadt hieß Byzantion, dann Konstantinopel, und heißt im Postsystem seit 1930 Istanbul.',
      'Sie war nacheinander Hauptstadt des Römischen, des Byzantinischen und des Osmanischen Reiches.',
      'Einige der besten Ausblicke hat man von der Fähre, auf dem Wasser zwischen den Kontinenten.',
    ],
  },
  rome: {
    kicker: 'Vollendet 80 n. Chr. · Kolosseum',
    blurb:
      'Das Flavische Amphitheater wurde im Jahr 80 n. Chr. unter Kaiser Titus eröffnet. Es fasste etwa 50.000 Zuschauer und stand auf einem Labyrinth aus Tunneln und Aufzügen unter der Arena. Die Römer mischten Vulkanasche in ihren Beton, und deshalb steht noch so viel davon.',
    facts: [
      'Es wurde in weniger als einem Jahrzehnt gebaut, auf dem trockengelegten See von Neros Palast.',
      'Achtzig Eingänge ermöglichten es, die ganze Menge in Minuten zu setzen.',
      'Das unterirdische Geschoss, das Hypogäum, hatte Falltüren für Kulissen und Tiere.',
    ],
  },
  milan: {
    kicker: 'Begonnen 1386 · Mailänder Dom',
    blurb:
      'Die Kathedrale brauchte fast sechs Jahrhunderte bis zur Vollendung. Ihr Marmordach strotzt vor Türmchen, und du kannst neben ihnen über die Terrassen gehen.',
    facts: [
      'Sie hat 135 Türmchen und rund 3.400 Statuen.',
      'Die goldene Madonnina auf dem höchsten Türmchen ist etwa 4 m groß.',
      'Die letzte der Bronzetüren wurde erst 1965 eingesetzt.',
    ],
  },
  monza: {
    kicker: 'Eröffnet 1922 · der Tempel der Geschwindigkeit',
    blurb:
      'In nur 110 Tagen in einem königlichen Park gebaut, ist Monza eine der schnellsten Rennstrecken. Der Große Preis von Italien findet hier fast jedes Jahr statt, seit die Formel-1-Weltmeisterschaft 1950 begann, mit einem Meer rot gekleideter Ferrari-Fans, den Tifosi.',
    facts: [
      'Es ist die dritte eigens gebaute Rennstrecke überhaupt, nach Brooklands und Indianapolis.',
      'F1-Autos fahren hier den Großteil der Runde mit Vollgas, bei Geschwindigkeiten über 340 km/h.',
      'Die Parabolica, heute Curva Alboreto, ist die weit ausholende letzte Kurve vor der Start-Ziel-Geraden.',
    ],
  },
  amsterdam: {
    kicker: 'Grachten des Goldenen Zeitalters · UNESCO 2010',
    blurb:
      'Der Grachtengürtel wurde im 17. Jahrhundert ausgehoben, als Amsterdam eine der reichsten Handelsstädte der Welt war. Schmale Giebelhäuser lehnen sich über das Wasser, und überall stehen Fahrräder.',
    facts: [
      'Die Stadt hat etwa 165 Grachten und rund 1.500 Brücken.',
      'In Amsterdam gibt es ungefähr so viele Fahrräder wie Einwohner.',
      'Die Häuser sind so schmal, dass Möbel mit Balken und Haken durch die Fenster hochgezogen wurden.',
    ],
  },
  zandvoort: {
    kicker: 'Großer Preis der Niederlande · Circuit Zandvoort',
    blurb:
      'Eine Strecke, die sich durch die Dünen der Nordsee windet, eröffnet 1948. Der Große Preis der Niederlande kehrte 2021 nach 36 Jahren zurück, und Max Verstappen gewann 2021, 2022 und 2023 vor einer ganz in Orange gehüllten Tribüne.',
    facts: [
      'Die letzte Kurve, die Arie-Luyendyk-Kurve, ist etwa 18 Grad überhöht.',
      'Sand weht auf die Strecke, deshalb fahren die Piloten sehr vorsichtig durch die Dünen.',
      'Verstappen wurde 2021 der erste niederländische Formel-1-Weltmeister und gewann von 2021 bis 2024 vier Titel in Folge.',
    ],
  },
  krakow: {
    kicker: 'Rynek Główny · UNESCO 1978',
    blurb:
      'Krakaus Hauptmarkt ist einer der größten mittelalterlichen Plätze Europas. Die Marienkirche hat zwei Türme unterschiedlicher Höhe, und jede Stunde spielt ein Trompeter eine Melodie, die mitten im Ton abbricht, zum Gedenken an einen Wächter, der von einem tatarischen Pfeil getroffen worden sein soll.',
    facts: [
      'Krakaus Altstadt gehörte zu den ersten zwölf Stätten auf der UNESCO-Welterbeliste.',
      'Die Tuchhallen (Sukiennice) in der Mitte des Platzes sind seit dem Mittelalter ein Markt.',
      'Die Statue des Wawel-Drachens unterhalb der Burg speit alle paar Minuten echtes Feuer.',
    ],
  },
  cologne: {
    kicker: 'Begonnen 1248 · Kölner Dom · UNESCO 1996',
    blurb:
      'Es dauerte 632 Jahre, die gotische Kathedrale von Köln fertigzustellen: Die Arbeiten begannen 1248, ruhten mehr als drei Jahrhunderte und endeten 1880. Einige Jahre lang machten ihre Zwillingstürme sie zum höchsten Gebäude der Welt.',
    facts: [
      'Die Türme sind etwa 157 m hoch, und der Aufstieg auf den Südturm zur Aussichtsplattform sind 533 Stufen.',
      'Die Kathedrale stand nach den Bombenangriffen des Zweiten Weltkriegs fast unversehrt zwischen den Trümmern der Stadt.',
      'Innen steht der Dreikönigsschrein, der größte mittelalterliche Reliquienschrein Westeuropas. Draußen ist die Hohenzollernbrücke mit tausenden Liebesschlössern behängt.',
    ],
  },
  porto: {
    kicker: 'Brücke Dom Luís I · 1886',
    blurb:
      'Eine zweistöckige eiserne Bogenbrücke über den Douro, entworfen von Théophile Seyrig, der Geschäftspartner von Gustave Eiffel gewesen war. Portwein reift in den Kellern am anderen Ufer.',
    facts: [
      'Das obere Deck nutzen heute Metro und Fußgänger, das untere die Autos.',
      'Die Weinregion Douro war eine der ersten der Welt, die 1756 rechtlich abgegrenzt wurde.',
      'Der Bahnhof São Bento ist mit rund 20.000 blau-weißen Azulejo-Fliesen bedeckt.',
    ],
  },
  oslo: {
    kicker: 'Opernhaus · eröffnet 2008',
    blurb:
      'Entworfen vom Architekturbüro Snøhetta, erhebt sich das Opernhaus von Oslo wie ein Eisberg aus dem Fjord. Sein weißes Marmordach neigt sich zum Wasser, und jeder darf hinaufgehen.',
    facts: [
      'Das Dach ist mit italienischem Carrara-Marmor verkleidet.',
      'Das Osloer Rathaus ist jeden Dezember Schauplatz der Verleihung des Friedensnobelpreises.',
      'Die Stadt ist von Wald und Fjord umgeben, mit einer Metrolinie, die in die Hügel hinaufführt.',
    ],
  },
  bruges: {
    kicker: 'Belfried · UNESCO 2000',
    blurb:
      'Brügge wurde im Mittelalter durch Tuch und Handel reich. Als sein Hafen versandete, zog das Geld weiter, und die Stadt blieb fast unberührt. Der 83 m hohe Belfried läutet noch immer über dem Marktplatz.',
    facts: [
      'Der Aufstieg auf den Belfried sind 366 Stufen.',
      'Sein Glockenspiel hat 47 Glocken.',
      'Die Kanäle brachten ihr den Beinamen Venedig des Nordens ein.',
    ],
  },
  ohrid: {
    kicker: 'St. Johannes in Kaneo · UNESCO 1979',
    blurb:
      'Der Ohridsee ist einer der ältesten Seen Europas, Millionen Jahre alt, und sein Ufer ist von Kirchen gesäumt. Die kleine Kirche St. Johannes in Kaneo aus dem 13. Jahrhundert thront auf einer Klippe über dem Wasser.',
    facts: [
      'Der See wird von Nordmazedonien und Albanien geteilt.',
      'Der heilige Klemens gründete 886 n. Chr. die Ohrider Literaturschule, die zur Verbreitung der kyrillischen Schrift beitrug.',
      'Ein lokaler Spruch behauptet, die Stadt habe einst 365 Kirchen gehabt, eine für jeden Tag.',
    ],
  },
  luzern: {
    kicker: 'Kapellbrücke 1333 · Rigi',
    blurb:
      'Luzerns hölzerne Kapellbrücke ist die älteste gedeckte Holzbrücke Europas, und ihr Wasserturm ist ein Wahrzeichen. Über dem See erhebt sich die Rigi, die Königin der Berge, mit Panoramablick auf die Alpen.',
    facts: [
      'Ein Brand 1993 zerstörte den größten Teil der Brücke, die innerhalb eines Jahres wieder aufgebaut wurde.',
      'Die Rigi ist 1.798 m hoch, und die Vitznau-Rigi-Bahn von 1871 war die erste Bergbahn Europas.',
      'Der Gipfel heißt Rigi Kulm, und an klaren Tagen umfasst die Aussicht die Alpen und mehrere Seen.',
    ],
  },
}

export default { lore, notes }

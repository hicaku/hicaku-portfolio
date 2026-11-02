import type { Lore } from '../../data/lore'

const notes: Record<string, string> = {
  monza: 'Vine aquí por la F1.',
  zandvoort: 'Vine aquí por la F1.',
  luzern: 'Subí el monte Rigi, hasta la cima.',
  cologne: 'Subí los 533 escalones hasta lo alto de la torre de la catedral con mi amigo.',
  bruges: 'Subí a la torre del Belfort.',
}

const lore: Record<string, Lore> = {
  galata: {
    kicker: 'Construida en 1348 · colonia genovesa',
    blurb:
      'Los genoveses levantaron esta torre como la pieza clave de su colonia amurallada de Gálata y la llamaron la Torre de Cristo. Durante siglos fue el puesto de vigilancia contra incendios de toda la ciudad, y hoy es uno de los mejores miradores sobre el Cuerno de Oro.',
    facts: [
      'Mide unos 67 m; el remate cónico es una restauración posterior.',
      'Los vigías otomanos de incendios vivían dentro y avisaban de los fuegos por toda la ciudad.',
      'La leyenda dice que Hezarfen Ahmed Çelebi se ató alas aquí en la década de 1630 y planeó sobre el Bósforo hasta Üsküdar.',
    ],
  },
  bosphorus: {
    kicker: 'Inaugurado en 1973 · Puente de los Mártires del 15 de Julio',
    blurb:
      'El primer puente construido sobre el Bósforo, terminado para el 50.º aniversario de la República Turca. Une Ortaköy, en Europa, con Beylerbeyi, en Asia, y de noche sus cables se iluminan con colores cambiantes.',
    facts: [
      'Su vano principal mide 1.074 m; el puente entero tiene unos 1.560 m.',
      'En 2016 se rebautizó oficialmente para honrar a quienes murieron el 15 de julio de 2016.',
      'Lo cruzan bastante más de 100.000 vehículos al día. Los peatones normalmente no pueden, pero aquí sí puedes caminar por él.',
    ],
  },
  fsm: {
    kicker: 'Inaugurado en 1988 · Segundo puente del Bósforo',
    blurb:
      'Lleva el nombre del sultán Mehmed el Conquistador y cruza el tramo más estrecho del estrecho, junto a la fortaleza que él construyó en 1452 para controlarlo. Las obras empezaron en 1985.',
    facts: [
      'Su vano principal mide 1.090 m, algo más que el primer puente.',
      'Está entre Rumeli Hisarı, en el lado europeo, y Anadolu Hisarı, en el asiático.',
      'Lleva la autopista que rodea el norte de la ciudad.',
    ],
  },
  galataBridge: {
    kicker: 'El quinto puente en este lugar · 1994',
    blurb:
      'Los pescadores llenan la cubierta superior y los restaurantes la inferior. El puente une Karaköy con Eminönü sobre el Cuerno de Oro y es el quinto que ha habido aquí.',
    facts: [
      'Leonardo da Vinci dibujó hacia 1502 un diseño de puente para el Cuerno de Oro, para el sultán Bayezid II. Nunca se construyó.',
      'El puente anterior, un puente flotante, ardió en 1992.',
      'Pescar desde la cubierta superior es una escena diaria de Estambul, y la inferior está llena de restaurantes.',
    ],
  },
  maiden: {
    kicker: 'Kız Kulesi · torre sobre una roca',
    blurb:
      'Una torre vigila este diminuto islote desde la época bizantina. La leyenda cuenta que a un sultán le dijeron que su hija moriría por la mordedura de una serpiente, y la encerró en la torre. Una serpiente escondida en una cesta de fruta la encontró igualmente.',
    facts: [
      'La torre actual es de 1763 y se restauró por última vez hacia el año 2000.',
      'Ha sido puesto de aduanas, faro y estación de cuarentena.',
      'Aparece en la película de James Bond de 1999 El mundo nunca es suficiente.',
    ],
  },
  sultanahmet: {
    kicker: 'Santa Sofía 537 · Mezquita Azul 1616',
    blurb:
      'Dos gigantes se miran a través de una misma plaza. Santa Sofía se terminó en 537 bajo el emperador Justiniano y fue la catedral más grande del mundo durante unos mil años. La Mezquita Azul se construyó frente a ella entre 1609 y 1616, quizá para superarla.',
    facts: [
      'Santa Sofía la diseñaron dos sabios, Isidoro de Mileto y Antemio de Trales, que eran matemáticos y no arquitectos. Perfecto para un ingeniero matemático.',
      'Fue iglesia, mezquita desde 1453, museo desde 1935 y de nuevo mezquita desde 2020.',
      'La Mezquita Azul tiene seis alminares y más de 20.000 azulejos de İznik. La mayoría son azules.',
    ],
  },
  camlica: {
    kicker: 'Terminada en 2020 · Torre Çamlıca',
    blurb:
      'La torre más alta de Turquía se alza en la colina más alta del lado asiático. Lleva las antenas de emisión de la ciudad y tiene miradores que dan a los dos continentes a la vez.',
    facts: [
      'Mide 369 m y su cima está a unos 587 m sobre el nivel del mar.',
      'Sustituyó a un mosaico de mástiles antiguos que estropeaban el perfil de la colina.',
      'La propia colina es un lugar de picnic y vistas desde la época otomana.',
    ],
  },
  rumeli: {
    kicker: 'Construida en 1452 · Rumeli Hisarı',
    blurb:
      'El sultán Mehmed II levantó esta fortaleza en unos cuatro meses, un año antes de tomar Constantinopla. Se alza donde el estrecho es más angosto, así que sus cañones podían detener cualquier barco que intentara pasar.',
    facts: [
      'Está frente a Anadolu Hisarı, construida en 1394, y entre las dos fortalezas cerraban el estrecho.',
      'El Bósforo mide aquí solo unos 660 m de ancho.',
      'Sus tres grandes torres llevan el nombre de los bajás que supervisaron su construcción.',
    ],
  },
  stadium: {
    kicker: 'Beşiktaş JK · inaugurado en 2016',
    blurb:
      'El estadio blanquinegro del Beşiktaş está justo encima del Palacio de Dolmabahçe y del Bósforo, donde estuvo el antiguo estadio İnönü, inaugurado en 1947. El club se remonta a 1903, lo que lo convierte en uno de los clubes deportivos más antiguos de Turquía.',
    facts: [
      'Tiene capacidad para unos 42.000 aficionados, y el grupo de seguidores Çarşı es famoso por su ruido.',
      'El escudo del club es un águila, y al equipo lo llaman las Águilas Negras.',
      'El Beşiktaş nació en 1903 como club de gimnasia, y el fútbol llegó después.',
    ],
  },
  dolmabahce: {
    kicker: 'Construido entre 1843 y 1856 · palacio otomano',
    blurb:
      'El sultán Abdülmecid I trasladó la corte aquí desde Topkapı en 1856, a un palacio de estilo europeo a orillas del Bósforo. El nombre significa jardín rellenado, porque está sobre una bahía que se rellenó con tierra siglos antes.',
    facts: [
      'Tiene 285 habitaciones, 46 salones y 6 baños turcos, y sus arquitectos fueron Garabet y Nikoğos Balyan.',
      'En el Salón de Ceremonias cuelga una lámpara de cristal de Bohemia de 750 bombillas, regalo de la reina Victoria. Pesa unas 4,5 toneladas.',
      'Atatürk murió aquí el 10 de noviembre de 1938 a las 09:05, y los relojes del palacio están parados en ese minuto. Mira el reloj del pórtico.',
    ],
  },
  istpark: {
    kicker: 'Inaugurado en 2005 · Istanbul Park',
    blurb:
      'El circuito del Gran Premio de Turquía está en Tuzla, en el lejano lado asiático de la ciudad, y aquí se muestra más cerca. Acogió la Fórmula 1 de 2005 a 2011 y volvió en 2020 y 2021, y los pilotos aún lo recuerdan como uno de los mejores trazados del calendario.',
    facts: [
      'La curva 8 es una larga curva a izquierdas a gran velocidad que se cierra cada vez más, famosa por las fuerzas que soportan los pilotos.',
      'El trazado lo diseñó Hermann Tilke y se recorre en sentido antihorario, algo poco habitual en la Fórmula 1.',
      'Lewis Hamilton ganó aquí su séptimo título mundial en 2020, con lluvia.',
    ],
  },
  valletta: {
    kicker: 'Fundada en 1566 · UNESCO 1980',
    blurb:
      'La ciudad la fundaron los Caballeros de San Juan justo después de sobrevivir al Gran Asedio de 1565. La trazó en cuadrícula el ingeniero italiano Francesco Laparelli, y se convirtió en una capital hecha para resistirlo todo.',
    facts: [
      'Lleva el nombre del Gran Maestre Jean de Valette, que dirigió la defensa durante el asedio.',
      'Es la capital más pequeña de la Unión Europea, con unos 0,6 km².',
      'Fue Capital Europea de la Cultura en 2018.',
    ],
  },
  mdina: {
    kicker: 'La Ciudad Silenciosa',
    blurb:
      'Mdina fue la capital de Malta hasta que los Caballeros se trasladaron al puerto en 1530. Sus altas murallas, sus calles estrechas y su casi nulo tráfico le valieron el apodo de Ciudad Silenciosa.',
    facts: [
      'Los romanos la llamaban Melite; esta colina lleva habitada unos 3.000 años.',
      'La tradición dice que san Pablo naufragó en Malta en el año 60 y se quedó cerca.',
      'Su puerta principal hizo de puerta de Desembarco del Rey en la primera temporada de Juego de Tronos.',
    ],
  },
  comino: {
    kicker: 'Laguna Azul · Comino',
    blurb:
      'Una isla diminuta entre Malta y Gozo, famosa por un agua tan clara que brilla turquesa sobre la arena blanca. Casi nadie vive aquí todo el año.',
    facts: [
      'Comino toma su nombre del comino, la planta que antes crecía aquí.',
      'La torre de Santa María, construida por los Caballeros en 1618, aún vigila el canal.',
      'La laguna está entre Comino y el islote deshabitado de Cominotto.',
    ],
  },
  itu: {
    kicker: 'Fundada en 1773 · Universidad Técnica de Estambul',
    blurb:
      'La ITU nació como la Escuela Imperial de Ingeniería Naval y es una de las universidades técnicas más antiguas del mundo. Este templo es un guiño a la Academia original: Platón enseñó en un bosquecillo a las afueras de Atenas hacia el 387 a. C., y la palabra academia viene de ese lugar.',
    facts: [
      'La Academia de Platón funcionó casi 900 años, hasta que el emperador Justiniano la cerró en el 529 d. C.',
      'Las cinco formas del frente son los sólidos platónicos. Platón los asoció con el fuego, la tierra, el aire, el agua y el cosmos.',
      'El campus de Ayazağa está en Maslak y tiene su propia parada de metro.',
    ],
  },
  datapare: {
    kicker: 'Levent · el cinturón de rascacielos de Estambul',
    blurb:
      'Levent es el corazón empresarial de la ciudad. La avenida Büyükdere está llena de torres de oficinas, bancos y empresas tecnológicas, y aquí crece el perfil de la Estambul moderna.',
    facts: [
      'El Istanbul Sapphire, terminado en 2011, se eleva 261 m aquí.',
      'La avenida Büyükdere sigue el antiguo camino a lo largo del Bósforo hasta el mar Negro.',
      'Levent y 4. Levent son dos paradas de la línea M2 del metro.',
    ],
  },
  pierE: {
    kicker: 'Beşiktaş · el vapur',
    blurb:
      'Los pequeños vapores de Estambul llevan a los viajeros de un lado al otro del agua desde 1851. Beşiktaş también alberga el Palacio de Dolmabahçe, donde murió Atatürk en 1938.',
    facts: [
      'El Bósforo mide unos 31 km de largo y une el mar Negro con el mar de Mármara.',
      'Es una de las vías navegables estrechas más transitadas del mundo, con decenas de miles de barcos al año.',
      'Las gaviotas que siguen la estela del ferri y te quitan el simit de la mano son una tradición local.',
    ],
  },
  pierA: {
    kicker: 'Kadıköy · la antigua Calcedonia',
    blurb:
      'Colonos griegos de Mégara fundaron Calcedonia aquí hacia el 685 a. C., unos 18 años antes que Bizancio en la otra orilla. La leyenda dice que los llamaron los ciegos por elegir el lado peor cuando el mejor estaba justo al otro lado del agua.',
    facts: [
      'El Concilio de Calcedonia se reunió aquí en el 451 d. C., uno de los grandes concilios de la Iglesia primitiva.',
      'Hoy Kadıköy es conocido por su mercado, sus cafés y la estatua del toro junto al muelle.',
      'El ferri de Eminönü a Kadıköy tarda unos 20 minutos.',
    ],
  },
  firmasoft: {
    kicker: 'Suadiye · avenida Bağdat',
    blurb:
      'Suadiye está en la avenida Bağdat, el largo bulevar comercial del lado asiático. La calle debe su nombre a la campaña de Bagdad del sultán Murad IV en 1638, cuyo ejército pasó por ella.',
    facts: [
      'La avenida Bağdat mide unos 14 km, de Kadıköy a Bostancı.',
      'La costa del Mármara aquí es una de las favoritas para pasear por la tarde.',
      'En el lado asiático vive aproximadamente un tercio de los habitantes de Estambul.',
    ],
  },
  huawei: {
    kicker: 'Ümraniye · Petal Maps',
    blurb:
      'Ümraniye es un distrito grande y de rápido crecimiento del lado asiático. Huawei, fundada en Shenzhen en 1987, lanzó Petal Maps en 2020 como parte de sus propios servicios móviles.',
    facts: [
      'El nombre del distrito viene de la palabra árabe para florecimiento, umran.',
      'Huawei pasó de ser una pequeña empresa comercial a uno de los mayores fabricantes de telecomunicaciones del mundo.',
      'Las herramientas de Petal Maps en las que trabajé daban servicio a más de 20 millones de usuarios al mes.',
    ],
  },
  goart: {
    kicker: 'Maltepe · mundos virtuales',
    blurb:
      'La realidad virtual te pone una pantalla en la cara, y el metaverso intenta convertir eso en un lugar. El 3D en tiempo real en el navegador, como este mismo mapa, se basa en WebGL, la tecnología que hay detrás de three.js.',
    facts: [
      'WebGL funciona en el navegador sin plug-ins, directamente sobre la GPU.',
      'three.js, que mueve este mapa, lo empezó Ricardo Cabello (mrdoob) en 2010.',
      'El primer visor de realidad virtual, la Espada de Damocles de Ivan Sutherland, se construyó en 1968.',
    ],
  },
  ist: {
    kicker: 'Inaugurado en 2001 · Sabiha Gökçen',
    blurb:
      'El segundo aeropuerto de Estambul lleva el nombre de Sabiha Gökçen, hija adoptiva de Atatürk y considerada la primera mujer piloto de combate del mundo.',
    facts: [
      'Vivió de 1913 a 2001, el año en que se inauguró el aeropuerto.',
      'Está en el lado asiático, a unos 35 km al este de Kadıköy.',
      'Es la base principal de Pegasus Airlines.',
    ],
  },
  mla: {
    kicker: 'Luqa · Aeropuerto Internacional de Malta',
    blurb:
      'El aeropuerto nació como RAF Luqa, una base aérea de la guerra. En 1942 toda la isla recibió la Cruz de Jorge por su valor durante el asedio, y la cruz sigue en la bandera maltesa.',
    facts: [
      'Malta mide solo unos 27 km de largo.',
      'Desde esta pista despegaron Spitfires en defensa de la isla.',
      'El maltés es la única lengua semítica que es idioma oficial de la UE.',
    ],
  },
  fasttrack: {
    kicker: 'Gżira · isla',
    blurb:
      'Gżira significa simplemente isla en maltés, por la isla Manoel, que está en el puerto de enfrente. El fuerte Manoel que hay en ella lo construyó la Orden de San Juan en la década de 1720.',
    facts: [
      'Gżira mira a La Valeta a través del puerto de Marsamxett.',
      'El idioma maltés mezcla raíces árabes con palabras italianas e inglesas.',
      'Malta lleva más de una década siendo un centro de empresas en línea y de videojuegos.',
    ],
  },
  arcade: {
    kicker: 'St Julian\'s · bahía de Spinola',
    blurb:
      'La bahía de Spinola era un pueblo de pescadores antes de convertirse en la zona de ocio de Malta. Los luzzu pintados aún se mecen en la bahía.',
    facts: [
      'La localidad lleva el nombre de san Julián el Hospitalario.',
      'Los luzzu llevan un Ojo de Osiris en la proa para ahuyentar la mala suerte.',
      'El palacio Spinola lo construyó un caballero de la Orden en 1688.',
    ],
  },
  skills: {
    kicker: 'Mdina · la Ciudad Silenciosa',
    blurb:
      'Mdina fue la capital de Malta durante siglos y sus callejones estrechos siguen casi sin tráfico. Un buen lugar para un árbol de habilidades: algo muy antiguo, con todo aún bien organizado.',
    facts: [
      'Sus murallas rodean un asentamiento en lo alto de una colina con apenas unos 250 habitantes.',
      'Los romanos la llamaban Melite.',
      'Apareció como Desembarco del Rey en la primera temporada de Juego de Tronos.',
    ],
  },
  contact: {
    kicker: 'Fuerte de San Telmo · 1565',
    blurb:
      'En 1565 una flota otomana sitió Malta. El fuerte de San Telmo resistió cerca de un mes, lo suficiente para retrasar el ataque, y la isla sobrevivió. El comandante corsario Turgut Reis murió durante el combate aquí.',
    facts: [
      'El Gran Asedio de Malta duró de mayo a septiembre de 1565.',
      'Turgut Reis, conocido en Occidente como Dragut, fue un almirante turco y resultó herido de muerte en San Telmo.',
      'Tras el asedio, los Caballeros fundaron La Valeta junto al fuerte.',
    ],
  },
  padel: {
    kicker: 'Inventado en 1969 · Acapulco',
    blurb:
      'El pádel lo inventó Enrique Corcuera en Acapulco, México, que construyó una pista con paredes en su casa para que sus invitados no perdieran la pelota. Más tarde se extendió por España y Argentina, y luego por el resto de Europa.',
    facts: [
      'Una pista mide 20 × 10 m y tiene paredes de cristal en las que se puede jugar.',
      'Siempre se juega por parejas, con saque por debajo.',
      'Es uno de los deportes que más rápido crecen en el mundo.',
    ],
  },
  gaming: {
    kicker: 'Project Zomboid · Condado de Knox',
    blurb:
      'Project Zomboid transcurre en el condado de Knox, Kentucky, en julio de 1993, y nunca acaba bien. Knox Companion, el mapa en vivo de mis proyectos personales, está hecho para los grupos que lo juegan.',
    facts: [
      'Está en acceso anticipado en Steam desde 2013, desarrollado por The Indie Stone.',
      'Se le conoce por su lema: «Así fue como moriste».',
      'Knox Companion sincroniza las posiciones del grupo en un mapa de Leaflet en tiempo real.',
    ],
  },
  travel: {
    kicker: 'Estambul · dos continentes',
    blurb:
      'Estambul es una de las poquísimas grandes ciudades en dos continentes, con Europa en una orilla y Asia en la otra. Es un buen punto de partida para un viajero.',
    facts: [
      'La ciudad se llamó Bizancio, luego Constantinopla, y es Estambul en el sistema postal desde 1930.',
      'Fue capital de los imperios romano, bizantino y otomano, uno tras otro.',
      'Algunas de las mejores vistas se ven desde el ferri, sobre el agua entre los continentes.',
    ],
  },
  rome: {
    kicker: 'Terminado en el 80 d. C. · Coliseo',
    blurb:
      'El Anfiteatro Flavio se inauguró en el 80 d. C. bajo el emperador Tito. Tenía capacidad para unos 50.000 espectadores y bajo la arena había un laberinto de túneles y montacargas. Los romanos mezclaban ceniza volcánica en su hormigón, y por eso sigue en pie tanto de él.',
    facts: [
      'Se construyó en menos de una década, sobre el lago desecado del palacio de Nerón.',
      'Ochenta entradas permitían sentar a toda la multitud en pocos minutos.',
      'El piso subterráneo, el hipogeo, tenía trampillas para decorados y animales.',
    ],
  },
  milan: {
    kicker: 'Iniciada en 1386 · Duomo de Milán',
    blurb:
      'La catedral tardó casi seis siglos en terminarse. Su tejado de mármol está lleno de agujas, y puedes caminar por las terrazas junto a ellas.',
    facts: [
      'Tiene 135 agujas y unas 3.400 estatuas.',
      'La Madonnina dorada de la aguja más alta mide unos 4 m.',
      'La última de las puertas de bronce no se colocó hasta 1965.',
    ],
  },
  monza: {
    kicker: 'Inaugurado en 1922 · el Templo de la Velocidad',
    blurb:
      'Construido en solo 110 días dentro de un parque real, Monza es uno de los circuitos más rápidos. El Gran Premio de Italia se celebra aquí casi todos los años desde que empezó el campeonato mundial de Fórmula 1 en 1950, con un mar de aficionados de Ferrari vestidos de rojo, los tifosi.',
    facts: [
      'Es el tercer circuito de carreras construido expresamente, después de Brooklands e Indianápolis.',
      'Los F1 pasan aquí casi toda la vuelta a fondo, con velocidades de más de 340 km/h.',
      'La Parabolica, hoy Curva Alboreto, es la amplia última curva antes de la recta de meta.',
    ],
  },
  amsterdam: {
    kicker: 'Canales de la Edad de Oro · UNESCO 2010',
    blurb:
      'El anillo de canales se excavó en el siglo XVII, cuando Ámsterdam era una de las ciudades comerciales más ricas del planeta. Casas estrechas con frontones se inclinan sobre el agua, y hay bicicletas por todas partes.',
    facts: [
      'La ciudad tiene unos 165 canales y unos 1.500 puentes.',
      'Hay más o menos tantas bicicletas en Ámsterdam como personas.',
      'Las casas son tan estrechas que los muebles se subían por las ventanas con una viga y un gancho.',
    ],
  },
  zandvoort: {
    kicker: 'Gran Premio de los Países Bajos · Circuito de Zandvoort',
    blurb:
      'Un circuito que serpentea entre las dunas del mar del Norte, inaugurado en 1948. El Gran Premio de los Países Bajos volvió en 2021 tras 36 años, y Max Verstappen ganó en 2021, 2022 y 2023 ante un estadio lleno de naranja.',
    facts: [
      'La última curva, la curva Arie Luyendyk, tiene un peralte de unos 18 grados.',
      'La arena vuela sobre la pista, así que los pilotos conducen con mucho cuidado entre las dunas.',
      'Verstappen fue el primer campeón mundial neerlandés de Fórmula 1 en 2021 y ganó cuatro títulos seguidos de 2021 a 2024.',
    ],
  },
  krakow: {
    kicker: 'Rynek Główny · UNESCO 1978',
    blurb:
      'La Plaza del Mercado de Cracovia es una de las mayores plazas medievales de Europa. La basílica de Santa María tiene dos torres de distinta altura, y cada hora un trompetista toca una melodía que se corta a mitad de nota, en memoria de un vigía al que supuestamente alcanzó una flecha tártara.',
    facts: [
      'El casco antiguo de Cracovia fue uno de los primeros doce lugares de la lista del Patrimonio Mundial de la UNESCO.',
      'La Lonja de los Paños (Sukiennice), en medio de la plaza, es un mercado desde la Edad Media.',
      'La estatua del Dragón de Wawel, bajo el castillo, escupe fuego de verdad cada pocos minutos.',
    ],
  },
  cologne: {
    kicker: 'Iniciada en 1248 · Kölner Dom · UNESCO 1996',
    blurb:
      'Costó 632 años terminar la catedral gótica de Colonia: las obras empezaron en 1248, se detuvieron más de tres siglos y acabaron en 1880. Durante unos años sus torres gemelas la hicieron el edificio más alto del mundo.',
    facts: [
      'Las torres miden unos 157 m, y la subida por la sur hasta la plataforma mirador son 533 escalones.',
      'La catedral quedó casi entera entre las ruinas de la ciudad tras los bombardeos de la Segunda Guerra Mundial.',
      'Dentro está el Relicario de los Reyes Magos, el mayor relicario medieval de Europa occidental. Fuera, el puente Hohenzollern está cubierto de miles de candados de amor.',
    ],
  },
  porto: {
    kicker: 'Puente Don Luis I · 1886',
    blurb:
      'Un puente de arco de hierro de dos tableros sobre el Duero, diseñado por Théophile Seyrig, que había sido socio de Gustave Eiffel. El vino de Oporto envejece en las bodegas de la otra orilla.',
    facts: [
      'El tablero superior lo usan ahora el metro y los peatones, y el inferior los coches.',
      'La región vinícola del Duero fue una de las primeras del mundo en delimitarse legalmente, en 1756.',
      'La estación de São Bento está cubierta por unos 20.000 azulejos azules y blancos.',
    ],
  },
  oslo: {
    kicker: 'Ópera · inaugurada en 2008',
    blurb:
      'Diseñada por los arquitectos Snøhetta, la Ópera de Oslo emerge del fiordo como un iceberg. Su tejado de mármol blanco desciende hasta el agua, y cualquiera puede subir por él.',
    facts: [
      'El tejado está revestido de mármol italiano de Carrara.',
      'El Ayuntamiento de Oslo acoge cada diciembre la ceremonia del Premio Nobel de la Paz.',
      'La ciudad está rodeada de bosque y del fiordo, con una línea de metro que sube a las colinas.',
    ],
  },
  bruges: {
    kicker: 'Belfort · UNESCO 2000',
    blurb:
      'Brujas se enriqueció con el paño y el comercio en la Edad Media. Cuando su puerto se cegó, el dinero se fue a otra parte y la ciudad quedó casi intacta. El Belfort de 83 m sigue sonando sobre la plaza del Mercado.',
    facts: [
      'Subir al Belfort supone 366 escalones.',
      'Su carillón tiene 47 campanas.',
      'Sus canales le valieron el apodo de la Venecia del Norte.',
    ],
  },
  ohrid: {
    kicker: 'San Juan de Kaneo · UNESCO 1979',
    blurb:
      'El lago Ohrid es uno de los lagos más antiguos de Europa, con millones de años, y su orilla está llena de iglesias. La pequeña iglesia de San Juan de Kaneo, del siglo XIII, se posa sobre un acantilado junto al agua.',
    facts: [
      'El lago lo comparten Macedonia del Norte y Albania.',
      'San Clemente fundó la Escuela Literaria de Ohrid en el 886 d. C., lo que ayudó a difundir el alfabeto cirílico.',
      'Un dicho local afirma que la ciudad llegó a tener 365 iglesias, una por cada día.',
    ],
  },
  luzern: {
    kicker: 'Puente de la Capilla 1333 · monte Rigi',
    blurb:
      'El Puente de la Capilla de madera de Lucerna es el puente de madera cubierto más antiguo de Europa, y su Torre del Agua es un símbolo. Sobre el lago se alza el monte Rigi, la Reina de las Montañas, con vistas panorámicas a los Alpes.',
    facts: [
      'Un incendio en 1993 destruyó la mayor parte del puente, que se reconstruyó en un año.',
      'El Rigi mide 1.798 m y el ferrocarril Vitznau–Rigi de 1871 fue el primer ferrocarril de montaña de Europa.',
      'La cima se llama Rigi Kulm, y en un día despejado la vista abarca los Alpes y varios lagos.',
    ],
  },
}

export default { lore, notes }

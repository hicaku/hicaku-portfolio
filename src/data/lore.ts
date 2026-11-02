// History and facts for the places on the map, so the world teaches you something as you run through it.
// Keep entries short and checkable. `facts` render as a numbered list; `blurb` is the one-paragraph story.

export interface Lore {
  /** headline shown above the story, e.g. the year or the superlative */
  kicker: string
  blurb: string
  facts: string[]
}

/** Short first-person notes on world-tour stops. Only what is certain: these are places I have actually been to. */
export const TOUR_NOTES: Record<string, string> = {
  monza: 'I came here for the F1.',
  zandvoort: 'I came here for the F1.',
  luzern: 'I climbed Mount Rigi, all the way to the very top.',
  cologne: 'I climbed all 533 steps to the top of the cathedral tower with my friend.',
  bruges: 'I climbed the Belfry tower.',
}

export const LORE: Record<string, Lore> = {
  // ───────────────────────── Istanbul landmarks ─────────────────────────
  galata: {
    kicker: 'Built 1348 · Genoese colony',
    blurb:
      'The Genoese raised this tower as the keystone of their walled colony of Galata, calling it the Tower of Christ. For centuries it served as a fire lookout for the whole city, and today it is one of the best viewpoints over the Golden Horn.',
    facts: [
      'It stands about 67 m tall; the conical cap is a later restoration.',
      'Ottoman fire watchmen lived inside and signalled blazes across the city.',
      'Legend says Hezarfen Ahmed Çelebi strapped on wings here in the 1630s and glided across the Bosphorus to Üsküdar.',
    ],
  },
  bosphorus: {
    kicker: 'Opened 1973 · 15 July Martyrs Bridge',
    blurb:
      'The first bridge ever built across the Bosphorus, finished to mark the 50th anniversary of the Turkish Republic. It links Ortaköy in Europe with Beylerbeyi in Asia, and at night its cables are lit in changing colours.',
    facts: [
      'Its main span is 1,074 m; the whole bridge is about 1,560 m long.',
      'It was officially renamed in 2016 to honour the people who died on 15 July 2016.',
      'Well over 100,000 vehicles cross it every day. Pedestrians are not normally allowed, but you can walk it here.',
    ],
  },
  fsm: {
    kicker: 'Opened 1988 · Second Bosphorus Bridge',
    blurb:
      'Named after Sultan Mehmed the Conqueror, the bridge crosses at the narrowest stretch of the strait, right beside the fortress he built in 1452 to control it. Construction began in 1985.',
    facts: [
      'Its main span is 1,090 m, a little longer than the first bridge.',
      'It sits between Rumeli Hisarı on the European side and Anadolu Hisarı on the Asian side.',
      'It carries the motorway that skirts the north of the city.',
    ],
  },
  galataBridge: {
    kicker: 'Fifth bridge on this spot · 1994',
    blurb:
      'Fishermen line the upper deck and restaurants fill the lower one. The bridge joins Karaköy to Eminönü across the Golden Horn, and it is the fifth to stand here.',
    facts: [
      'Leonardo da Vinci drew a bridge design for the Golden Horn around 1502 for Sultan Bayezid II. It was never built.',
      'The previous Galata Bridge, a floating one, burned in 1992.',
      'Fishing from the upper deck is a daily Istanbul scene, and the lower deck is lined with restaurants.',
    ],
  },
  maiden: {
    kicker: 'Kız Kulesi · tower on a rock',
    blurb:
      'A tower has watched over this tiny islet since Byzantine times. The legend says a sultan was told his daughter would die of a snake bite, so he locked her in the tower. A snake hidden in a basket of fruit found her anyway.',
    facts: [
      'The present tower dates from 1763 and was last restored around 2000.',
      'It has served as a customs post, a lighthouse and a quarantine station.',
      'It appears in the 1999 James Bond film The World Is Not Enough.',
    ],
  },
  sultanahmet: {
    kicker: 'Hagia Sophia 537 · Blue Mosque 1616',
    blurb:
      'Two giants face each other across one square. Hagia Sophia was finished in 537 under Emperor Justinian and was the largest cathedral in the world for about a thousand years. The Blue Mosque was built opposite it between 1609 and 1616, perhaps to outdo it.',
    facts: [
      'Hagia Sophia was designed by two scholars, Isidore of Miletus and Anthemius of Tralles, who were mathematicians and not architects. Fitting for a maths engineer.',
      'It was a church, then a mosque from 1453, a museum from 1935, and a mosque again since 2020.',
      'The Blue Mosque has six minarets and more than 20,000 İznik tiles. Most of them are blue.',
    ],
  },
  camlica: {
    kicker: 'Completed 2020 · Çamlıca Tower',
    blurb:
      'The tallest tower in Turkey stands on the highest hill of the Asian side. It carries the broadcasting antennas for the city and has observation decks that look over both continents at once.',
    facts: [
      'It is 369 m tall, and its top is roughly 587 m above sea level.',
      'It replaced a patchwork of older masts that cluttered the hill skyline.',
      'The hill itself has been a picnic and viewing spot since Ottoman times.',
    ],
  },
  rumeli: {
    kicker: 'Built 1452 · Rumeli Hisarı',
    blurb:
      'Sultan Mehmed II built this fortress in about four months, a year before he took Constantinople. It stands where the strait is narrowest, so its cannons could stop any ship that tried to pass.',
    facts: [
      'It sits opposite Anadolu Hisarı, built in 1394, and the two forts closed the strait between them.',
      'The Bosphorus is only about 660 m wide here.',
      'Its three great towers are named after the pashas who supervised their construction.',
    ],
  },
  stadium: {
    kicker: 'Beşiktaş JK · opened 2016',
    blurb:
      'The black-and-white home of Beşiktaş stands just up the hill from Dolmabahçe Palace and the Bosphorus, on the site of the old İnönü Stadium, which opened in 1947. The club itself dates back to 1903, which makes it one of the oldest sports clubs in Turkey.',
    facts: [
      'It holds roughly 42,000 fans, and the Çarşı supporters group is famous for its noise.',
      'The club badge is an eagle, and the team are nicknamed the Black Eagles.',
      'Beşiktaş began in 1903 as a gymnastics club, and football came later.',
    ],
  },
  dolmabahce: {
    kicker: 'Built 1843–1856 · Ottoman palace',
    blurb:
      'Sultan Abdülmecid I moved the court here from Topkapı in 1856, to a palace in the European style on the edge of the Bosphorus. The name means filled garden, because it stands on a bay that was filled in with earth centuries earlier.',
    facts: [
      'It has 285 rooms, 46 halls and 6 Turkish baths, and its architects were Garabet and Nikoğos Balyan.',
      'The Ceremonial Hall hangs a Bohemian crystal chandelier with 750 lamps, a gift from Queen Victoria. It weighs about 4.5 tonnes.',
      'Atatürk died here on 10 November 1938 at 09:05, and the palace clocks are stopped at that minute. Look at the clock on the portico.',
    ],
  },
  istpark: {
    kicker: 'Opened 2005 · Istanbul Park',
    blurb:
      'The Turkish Grand Prix circuit lies out at Tuzla, on the far Asian side of the city, and is shown here moved closer. It hosted Formula 1 from 2005 to 2011 and returned in 2020 and 2021, and drivers still talk about it as one of the best tracks on the calendar.',
    facts: [
      'Turn 8 is a long left-hander taken at high speed that curves tighter and tighter, and it is famous for the forces it puts on the drivers.',
      'The track was designed by Hermann Tilke and runs anticlockwise, which is unusual in Formula 1.',
      'Lewis Hamilton clinched his seventh world title here in 2020, in the wet.',
    ],
  },  // ───────────────────────── Malta landmarks ─────────────────────────
  valletta: {
    kicker: 'Founded 1566 · UNESCO 1980',
    blurb:
      'The city was founded by the Knights of St John just after they survived the Great Siege of 1565. It was laid out on a grid by the Italian engineer Francesco Laparelli, and it became a capital built to withstand anything.',
    facts: [
      'It is named after Grand Master Jean de Valette, who led the defence during the siege.',
      'It is the smallest capital in the European Union, about 0.6 km² in area.',
      'It was the European Capital of Culture in 2018.',
    ],
  },
  mdina: {
    kicker: 'The Silent City',
    blurb:
      'Mdina was Malta’s capital until the Knights moved to the harbour in 1530. Its high walls, narrow lanes and almost no traffic earned it the nickname Silent City.',
    facts: [
      'The Romans called it Melite; this hilltop has been settled for around 3,000 years.',
      'Tradition says Saint Paul was shipwrecked on Malta in AD 60 and stayed nearby.',
      'Its main gate played the gate of King’s Landing in the first season of Game of Thrones.',
    ],
  },
  comino: {
    kicker: 'Blue Lagoon · Comino',
    blurb:
      'A tiny island between Malta and Gozo, famous for water so clear it glows turquoise over white sand. Almost nobody lives here year round.',
    facts: [
      'Comino is named after the cumin plant that once grew here.',
      'St Mary’s Tower, built by the Knights in 1618, still guards the channel.',
      'The lagoon sits between Comino and the uninhabited islet of Cominotto.',
    ],
  },
  // ───────────────────────── route stops ─────────────────────────
  itu: {
    kicker: 'Founded 1773 · Istanbul Technical University',
    blurb:
      'ITU began as the Imperial Naval Engineering School and is among the oldest technical universities in the world. This temple is a nod to the original Academy: Plato taught in a grove outside Athens around 387 BC, and the word academy comes from that place.',
    facts: [
      'Plato’s Academy ran for nearly 900 years, until the emperor Justinian shut it in AD 529.',
      'The five shapes out front are the Platonic solids. Plato linked them to fire, earth, air, water and the cosmos.',
      'The Ayazağa campus sits in Maslak and has its own metro stop.',
    ],
  },
  datapare: {
    kicker: 'Levent · Istanbul’s skyscraper belt',
    blurb:
      'Levent is the corporate heart of the city. Büyükdere Avenue is lined with office towers, banks and tech companies, and it is where the skyline of modern Istanbul grows.',
    facts: [
      'The Istanbul Sapphire, finished in 2011, rises 261 m here.',
      'Büyükdere Avenue follows the old road along the Bosphorus to the Black Sea.',
      'Levent and 4. Levent are both stops on the M2 metro line.',
    ],
  },
  pierE: {
    kicker: 'Beşiktaş · the vapur',
    blurb:
      'The little steamers of Istanbul have carried commuters across the water since 1851. Beşiktaş is also home to Dolmabahçe Palace, where Atatürk died in 1938.',
    facts: [
      'The Bosphorus is about 31 km long and connects the Black Sea to the Sea of Marmara.',
      'It is one of the busiest narrow waterways in the world, with tens of thousands of ships a year.',
      'Seagulls riding the ferry wake and snatching simit from your hand are a local tradition.',
    ],
  },
  pierA: {
    kicker: 'Kadıköy · ancient Chalcedon',
    blurb:
      'Greek settlers from Megara founded Chalcedon here around 685 BC, about 18 years before Byzantion on the other shore. Legend says they were called the blind ones for picking the poorer side when the better one was right across the water.',
    facts: [
      'The Council of Chalcedon met here in AD 451, one of the great councils of the early church.',
      'Today Kadıköy is known for its market, its cafés and the bull statue by the pier.',
      'The ferry from Eminönü to Kadıköy takes about 20 minutes.',
    ],
  },
  firmasoft: {
    kicker: 'Suadiye · Bağdat Avenue',
    blurb:
      'Suadiye sits on Bağdat Avenue, the long shopping boulevard of the Asian side. The road is named after Sultan Murad IV’s Baghdad campaign of 1638, whose army marched along it.',
    facts: [
      'Bağdat Avenue is about 14 km long, running from Kadıköy to Bostancı.',
      'The Marmara coastline here is a favourite for evening walks.',
      'The Asian side is home to roughly a third of Istanbul’s people.',
    ],
  },
  huawei: {
    kicker: 'Ümraniye · Petal Maps',
    blurb:
      'Ümraniye is a large, fast-growing district of the Asian side. Huawei, founded in Shenzhen in 1987, brought out Petal Maps in 2020 as part of its own mobile services.',
    facts: [
      'The district name comes from the Arabic word for flourishing, umran.',
      'Huawei grew from a small trading company into one of the biggest telecom makers in the world.',
      'The Petal Maps tools I worked on served over 20 million monthly users.',
    ],
  },
  goart: {
    kicker: 'Maltepe · virtual worlds',
    blurb:
      'Virtual reality puts a screen on your face, and the metaverse tries to make that a place. Real-time 3D in the browser, like this very map, is built on WebGL, the same technology behind three.js.',
    facts: [
      'WebGL runs in the browser with no plug-in, on top of the GPU.',
      'three.js, which powers this map, was started by Ricardo Cabello (mrdoob) in 2010.',
      'The first head-mounted display, Ivan Sutherland’s Sword of Damocles, was built in 1968.',
    ],
  },
  ist: {
    kicker: 'Opened 2001 · Sabiha Gökçen',
    blurb:
      'Istanbul’s second airport is named after Sabiha Gökçen, Atatürk’s adopted daughter, who is widely regarded as the first female fighter pilot in the world.',
    facts: [
      'She lived from 1913 to 2001, the year the airport opened.',
      'It is on the Asian side, about 35 km east of Kadıköy.',
      'It is the main hub of Pegasus Airlines.',
    ],
  },
  mla: {
    kicker: 'Luqa · Malta International Airport',
    blurb:
      'The airport started life as RAF Luqa, a wartime airfield. In 1942 the whole island was awarded the George Cross for its courage under siege, and the cross still sits on the Maltese flag.',
    facts: [
      'Malta is only about 27 km long.',
      'Spitfires flew from this field in the defence of the island.',
      'Maltese is the only Semitic language that is an official language of the EU.',
    ],
  },
  fasttrack: {
    kicker: 'Gżira · island',
    blurb:
      'Gżira simply means island in Maltese, named for Manoel Island, which sits in the harbour opposite. Fort Manoel on it was built in the 1720s by the Order of St John.',
    facts: [
      'Gżira faces Valletta across Marsamxett Harbour.',
      'The Maltese language mixes Arabic roots with Italian and English words.',
      'Malta has been a hub for online and gaming companies for more than a decade.',
    ],
  },
  arcade: {
    kicker: 'St Julian’s · Spinola Bay',
    blurb:
      'Spinola Bay was a fishing village before it became the entertainment district of Malta. The painted luzzu boats still bob in the bay.',
    facts: [
      'The town is named after Saint Julian the Hospitaller.',
      'Luzzus carry an Eye of Osiris on the bow to ward off bad luck.',
      'Spinola Palace was built by a knight of the Order in 1688.',
    ],
  },
  skills: {
    kicker: 'Mdina · the Silent City',
    blurb:
      'Mdina was Malta’s capital for centuries and its narrow lanes are still almost free of traffic. A fitting place for a skill tree: a very old thing, with everything still well organised.',
    facts: [
      'Its walls enclose a hilltop settlement of only about 250 residents.',
      'The Romans called it Melite.',
      'It appeared as King’s Landing in the first season of Game of Thrones.',
    ],
  },
  contact: {
    kicker: 'Fort St Elmo · 1565',
    blurb:
      'In 1565 an Ottoman fleet laid siege to Malta. Fort St Elmo held out for about a month, long enough to delay the attack, and the island survived. The corsair commander Turgut Reis died during the fight here.',
    facts: [
      'The Great Siege of Malta lasted from May to September 1565.',
      'Turgut Reis, known in the west as Dragut, was a Turkish admiral and was fatally wounded at St Elmo.',
      'After the siege the Knights founded Valletta next to the fort.',
    ],
  },
  // ───────────────────────── hobbies ─────────────────────────
  padel: {
    kicker: 'Invented 1969 · Acapulco',
    blurb:
      'Padel was invented by Enrique Corcuera in Acapulco, Mexico, who built a walled court at his home so that his guests could not lose the ball. It later took off in Spain and Argentina, and then the rest of Europe.',
    facts: [
      'A court is 20 × 10 m with glass walls you can play off.',
      'It is always played in doubles, with an underarm serve.',
      'It is one of the fastest-growing sports in the world.',
    ],
  },
  gaming: {
    kicker: 'Project Zomboid · Knox County',
    blurb:
      'Project Zomboid is set in Knox County, Kentucky, in July 1993, and it never ends well. Knox Companion, the live map in my side projects, is built for squads who play it.',
    facts: [
      'It has been in early access on Steam since 2013, developed by The Indie Stone.',
      'It is known for its tagline: “This is how you died.”',
      'Knox Companion syncs squad positions on a Leaflet map in real time.',
    ],
  },
  travel: {
    kicker: 'Istanbul · two continents',
    blurb:
      'Istanbul is one of the very few big cities on two continents, with Europe on one shore and Asia on the other. It makes a fair starting point for a traveller.',
    facts: [
      'The city was called Byzantion, then Constantinople, and has been Istanbul since 1930 in the postal system.',
      'It was the capital of the Roman, Byzantine and Ottoman empires in turn.',
      'Some of the best views are from the ferry, on the water between the continents.',
    ],
  },
  // ───────────────────────── the world tour ─────────────────────────
  rome: {
    kicker: 'Completed AD 80 · Colosseum',
    blurb:
      'The Flavian Amphitheatre opened in AD 80 under Emperor Titus. It held an audience of about 50,000 and sat on a maze of tunnels and lifts beneath the arena. Romans mixed volcanic ash into their concrete, and that is why so much of it still stands.',
    facts: [
      'It was built in under a decade, on the drained lake of Nero’s palace.',
      'Eighty entrances meant the whole crowd could be seated in minutes.',
      'The underground floor, the hypogeum, had trapdoors for scenery and animals.',
    ],
  },
  milan: {
    kicker: 'Begun 1386 · Duomo di Milano',
    blurb:
      'The cathedral took almost six centuries to finish. Its marble roof bristles with spires, and you can walk across the terraces next to them.',
    facts: [
      'It has 135 spires and roughly 3,400 statues.',
      'The golden Madonnina on the top spire is about 4 m tall.',
      'The last of the bronze doors was only fitted in 1965.',
    ],
  },
  monza: {
    kicker: 'Opened 1922 · the Temple of Speed',
    blurb:
      'Built in just 110 days inside a royal park, Monza is one of the fastest circuits in racing. The Italian Grand Prix has been held here almost every year since the Formula 1 world championship began in 1950, with a sea of red-clad Ferrari fans, the tifosi.',
    facts: [
      'It is the third purpose-built motor-racing circuit ever built, after Brooklands and Indianapolis.',
      'F1 cars here spend most of the lap at full throttle, with speeds above 340 km/h.',
      'The Parabolica, now the Curva Alboreto, is the sweeping last corner before the start-finish straight.',
    ],
  },
  amsterdam: {
    kicker: 'Golden Age canals · UNESCO 2010',
    blurb:
      'The canal ring was dug in the 17th century, when Amsterdam was one of the richest trading cities on Earth. Narrow gabled houses lean over the water, and bicycles are everywhere.',
    facts: [
      'The city has about 165 canals and some 1,500 bridges.',
      'There are roughly as many bicycles in Amsterdam as people.',
      'The houses are so narrow that goods were hoisted through the windows with a beam and hook.',
    ],
  },
  zandvoort: {
    kicker: 'Dutch Grand Prix · Circuit Zandvoort',
    blurb:
      'A circuit twisting through North Sea dunes, opened in 1948. The Dutch Grand Prix returned there in 2021 after 36 years, and Max Verstappen won in 2021, 2022 and 2023 in front of a stadium full of orange.',
    facts: [
      'The final corner, the Arie Luyendyk bend, is banked at about 18 degrees.',
      'The sand blows onto the track, so drivers carry on very carefully through the dunes.',
      'Verstappen became the first Dutch Formula 1 world champion in 2021 and won four straight titles from 2021 to 2024.',
    ],
  },
  krakow: {
    kicker: 'Rynek Główny · UNESCO 1978',
    blurb:
      'Kraków’s Main Market Square is among the largest medieval squares in Europe. St Mary’s Basilica has two towers of different heights, and each hour a trumpeter plays a tune that stops mid-note, in memory of a watchman said to have been shot by a Tatar arrow.',
    facts: [
      'Kraków’s old town was one of the first twelve places on the UNESCO World Heritage list.',
      'The Cloth Hall (Sukiennice) in the middle of the square has been a market since the Middle Ages.',
      'The Wawel Dragon statue below the castle breathes real fire every few minutes.',
    ],
  },
  cologne: {
    kicker: 'Begun 1248 · Kölner Dom · UNESCO 1996',
    blurb:
      'It took 632 years to finish the Gothic cathedral of Cologne: work began in 1248, stopped for more than three centuries, and ended in 1880. For a few years its twin spires made it the tallest building in the world.',
    facts: [
      'The towers are about 157 m high, and the climb up the south one to the viewing platform is 533 steps.',
      'The cathedral stood almost whole amid the ruins of the city after the bombing of the Second World War.',
      'Inside is the Shrine of the Three Kings, the largest medieval reliquary in Western Europe. Outside, the Hohenzollern Bridge is hung with thousands of love locks.',
    ],
  },
  porto: {
    kicker: 'Dom Luís I Bridge · 1886',
    blurb:
      'A two-deck iron arch bridge over the Douro, designed by Théophile Seyrig, who had been a business partner of Gustave Eiffel. Port wine is aged in the cellars on the far bank.',
    facts: [
      'The upper deck is now used by the metro and pedestrians, the lower deck by cars.',
      'The Douro wine region was one of the first in the world to be legally demarcated, in 1756.',
      'São Bento station is covered in about 20,000 blue-and-white azulejo tiles.',
    ],
  },
  oslo: {
    kicker: 'Opera House · opened 2008',
    blurb:
      'Designed by the architects Snøhetta, the Oslo Opera House rises out of the fjord like an iceberg. Its white marble roof slopes down to the water, and anyone can walk up it.',
    facts: [
      'The roof is clad in Italian Carrara marble.',
      'Oslo City Hall hosts the Nobel Peace Prize ceremony every December.',
      'The city is surrounded by forest and the fjord, with a metro line that goes up into the hills.',
    ],
  },
  bruges: {
    kicker: 'Belfry · UNESCO 2000',
    blurb:
      'Bruges got rich on cloth and trade in the Middle Ages. When its harbour silted up the money moved on, and the city was left almost untouched. The 83 m Belfry still rings over the market square.',
    facts: [
      'Climbing the Belfry takes 366 steps.',
      'Its carillon has 47 bells.',
      'The canals earned it the nickname Venice of the North.',
    ],
  },
  ohrid: {
    kicker: 'St John at Kaneo · UNESCO 1979',
    blurb:
      'Lake Ohrid is one of the oldest lakes in Europe, millions of years old, and its shore is lined with churches. The little church of St John at Kaneo, from the 13th century, perches on a cliff above the water.',
    facts: [
      'The lake is shared between North Macedonia and Albania.',
      'St Clement founded the Ohrid Literary School in AD 886, which helped spread the Cyrillic script.',
      'A local saying claims the town once had 365 churches, one for every day.',
    ],
  },
  luzern: {
    kicker: 'Chapel Bridge 1333 · Mount Rigi',
    blurb:
      'Lucerne’s wooden Chapel Bridge is the oldest covered wooden bridge in Europe, and its Water Tower is a landmark. Above the lake rises Mount Rigi, the Queen of the Mountains, with panoramic views of the Alps.',
    facts: [
      'A fire in 1993 destroyed most of the bridge, which was rebuilt within a year.',
      'Rigi is 1,798 m high, and the Vitznau–Rigi railway of 1871 was the first mountain railway in Europe.',
      'The summit is called Rigi Kulm, and on a clear day the view takes in the Alps and several lakes.',
    ],
  },
}

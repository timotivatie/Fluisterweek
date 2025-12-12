export type ExtraExercise = {
  title: string;
  url?: string;
  embedUrl?: string;
  embedHtml?: string;
  displayType?: 'download' | 'player';
};

export type FluisterDag = {
  title: string;
  subtitle: string;
  intro: string;
  duration: string;
  focus: string;
  highlight: string;
  videoUrl: string;
  intention: string;
  steps: string[];
  reflection: string;
  extraExercises?: ExtraExercise[];
};

export const BASE_FLUISTERWEEK: FluisterDag[] = [
  {
    title: 'Dag 1 · Reset je zenuwstelsel',
    subtitle: 'Je ademhaling als afstandsbediening voor rust.',
    intro:
      'Vandaag nodig ik je uit om je ademhaling als zachte afstandsbediening te gebruiken. Met elke bewuste in- en uitademing geef je je zenuwstelsel een seintje dat het even mag vertragen.',
    duration: '18 min',
    focus: 'Je ademhaling als afstandsbediening',
    highlight: 'Met je ademhaling kan je je zenuwstelsel in enkele minuten het signaal geven dat het veilig is om te vertragen.',
    videoUrl: 'https://www.youtube.com/watch?v=ysz5S6PUM-U',
    intention: 'Vandaag bewust vertragen en je lichaam laten ervaren dat rust van binnenuit kan ontstaan.',
    steps: [
      'Ga zitten met je voeten plat op de grond en maak jezelf lang.',
      'Adem rustig in door je neus.',
      'Adem lang en traag uit door je mond, alsof je door een rietje uitblaast.',
      'Laat bij elke uitademing je schouders zachter worden en zakken.',
      'Herhaal dit vijf keer, op je eigen tempo.',
      'Blijf nadien heel even stil zitten.',
      'Voel wat er veranderd is in je lichaam, zonder iets te willen aanpassen.'
    ],
    reflection: 'Wat verandert er in je lichaam wanneer je je uitademing verlengt?'
  },
  {
    title: 'Dag 2 · Van ‘moeten’ naar ‘voelen’',
    subtitle: 'Zakken uit je hoofd, in je lichaam.',
    intro:
      'Moetens en lijstjes maken het vaak luid in je hoofd. Deze les laat je traag bewegen zodat je spanning loslaat en opnieuw kan voelen wat nu echt nodig is.',
    duration: '21 min',
    focus: 'Zakken uit je hoofd, in je lichaam',
    highlight: 'Door zacht te bewegen en te voelen, kan vastgehouden spanning in je nek en schouders weer beginnen loslaten.',
    videoUrl: 'https://www.youtube.com/watch?v=jfKfPfyJRdk',
    intention: 'Vandaag ruimte maken in je lichaam en leren luisteren zonder iets te willen oplossen.',
    steps: [
      'Ga comfortabel zitten en zet je voeten plat op de grond, maak je rug lang.',
      'Adem in en breng je hoofd zachtjes naar achter, tot waar het veilig voelt.',
      'Adem uit en breng je kin rustig richting je borst, herhaal op je eigen tempo.',
      'Breng daarna je linkeroor richting je linkerschouder en blijf even bij de stretch.',
      'Adem hier rustig in en vooral lang uit, doe daarna hetzelfde aan de andere kant.',
      'Rol een paar keer je schouders naar achter en laat spanning los.',
      'Blijf even stil zitten en voel wat deze oefening met je lichaam gedaan heeft.'
    ],
    reflection: 'Waar in je lichaam voel je vandaag spanning, en wat gebeurt er als je daar even bij blijft?'
  },
  {
    title: 'Dag 3 · De kracht van mini-pauzes',
    subtitle: 'Micropauzes doorheen je dag.',
    intro:
      'Tussen alle rollen door vergeet je soms even te ademen. Vandaag oefenen we met korte micropauzes zodat je zenuwstelsel meerdere keren per dag een mini-reset krijgt.',
    duration: '16 min',
    focus: 'Kleine pauzes doorheen je dag',
    highlight: 'Korte micropauzes kunnen je stressniveau laten zakken, zelfs wanneer je weinig tijd hebt.',
    videoUrl: 'https://www.youtube.com/watch?v=aqz-KE-bpKQ',
    intention: 'Vandaag vaker even stoppen en voelen hoe het écht met je gaat.',
    steps: [
      'Wrijf je handen tegen elkaar tot ze warm worden.',
      'Leg één hand op je tegenovergestelde schouder en kneed zachtjes de spier, wissel nadien van kant.',
      'Rol je schouders een paar keer rustig naar achter.',
      'Ga even stil zitten en adem vier tellen in door je neus.',
      'Adem zes tellen uit, rustig en zacht, herhaal dit een paar keer.',
      'Plan vandaag bewust drie micropauzes en zet eventueel een reminder.'
    ],
    reflection: 'Wat merk je in je lichaam wanneer je jezelf een korte pauze gunt?'
  },
  {
    title: 'Dag 4 · Wat voeding je vertelt',
    subtitle: 'Luisteren naar je lichaam na het eten.',
    intro:
      'Je lichaam fluistert na elke maaltijd helder hoe het zich voelt. We nemen vandaag bewust de tijd om in te checken en te noteren wat jou voedt en wat minder goed valt.',
    duration: '19 min',
    focus: 'Luisteren naar je lichaam na het eten',
    highlight: 'Je lichaam geeft na elke maaltijd signalen die je kunnen vertellen wat jou voedt en wat niet.',
    videoUrl: 'https://www.youtube.com/watch?v=QH2-TGUlwu4',
    intention: 'Vandaag nieuwsgierig observeren zonder oordeel of regels.',
    steps: [
      'Eet je maaltijd rustig en bewust.',
      'Zet ongeveer 30 minuten later een timer.',
      'Check bij jezelf in: hoe voel ik me nu?',
      'Merk op hoe helder of vermoeid je hoofd aanvoelt.',
      'Voel je buik: licht, vol of opgeblazen?',
      'Merk eventuele cravings op en schrijf dit kort neer.',
      'Doe hier niets mee, behalve observeren.'
    ],
    reflection: 'Welke signalen merk je op in je lichaam na het eten?'
  },
  {
    title: 'Dag 5 · Je brein als bondgenoot',
    subtitle: 'Omgaan met stressgedachten.',
    intro:
      'Je hoofd is er om je te beschermen, maar soms wordt het wat streng. Deze les leert je omgaan met stressgedachten en een ankerzin kiezen die je hoofd verzacht.',
    duration: '17 min',
    focus: 'Omgaan met stressgedachten',
    highlight: 'Je gedachten willen je beschermen, maar je kan ze wel zachter maken.',
    videoUrl: 'https://www.youtube.com/watch?v=lY2yjAdbvdQ',
    intention: 'Vandaag je hoofd leren ondersteunen in plaats van bestrijden.',
    steps: [
      'Noteer je meest voorkomende stressgedachte.',
      'Vraag jezelf af: is dit waar? Herhaal die vraag drie keer met een andere klemtoon.',
      'Kijk of je de gedachte iets zachter kan formuleren.',
      'Kies één ankerzin die jou rust geeft en schrijf die ergens zichtbaar.',
      'Lees of herhaal die zin wanneer je hoofd te luid wordt.'
    ],
    reflection: 'Welke gedachte komt bij jou vaak terug wanneer je stress voelt?'
  },
  {
    title: 'Dag 6 · Je avondroutine als gamechanger',
    subtitle: 'Herstellen via slaap.',
    intro:
      'Een warme avondroutine helpt je lichaam om sneller uit de aan-stand te schieten. Vandaag bouw je een klein ritueel dat je slaap en herstel ondersteunt.',
    duration: '20 min',
    focus: 'Herstellen via slaap',
    highlight: 'Een herkenbare avondroutine helpt je lichaam om tot rust te komen en beter te herstellen.',
    videoUrl: 'https://www.youtube.com/watch?v=GlrxcuEDyF8',
    intention: 'Vandaag je avond zachter afronden.',
    steps: [
      'Kies één vast moment om je avond te vertragen en leg je telefoon bewust eerder weg.',
      'Maak een rustig overgangsritueel (wassen, pyjama aandoen).',
      'Ga in bed liggen en leg één hand op je borst en één op je buik.',
      'Adem rustig in en adem langer uit dan in.',
      'Herhaal dit een paar minuten.',
      'Laat je lichaam volledig zakken in het bed.'
    ],
    reflection: 'Wat heeft jouw lichaam ’s avonds nodig om te kunnen loslaten?'
  },
  {
    title: 'Dag 7 · Jouw persoonlijke balans-plan',
    subtitle: 'Integreren en kiezen.',
    intro:
      'De laatste dag gaat over integreren en kiezen. Je kijkt terug, kiest je favoriete oefening en bouwt een mini-plan dat je ook na deze week helpt vertragen.',
    duration: '22 min',
    focus: 'Integreren en kiezen',
    highlight: 'Je kan op elk moment opnieuw kiezen voor rust en balans.',
    videoUrl: 'https://www.youtube.com/watch?v=HgzGwKwLmgM',
    intention: 'Vandaag ontdekken wat jij wil meenemen uit deze week.',
    steps: [
      'Kijk terug op de voorbije dagen en noteer welke oefening je het meeste deugd deed.',
      'Merk op waar je weerstand voelde.',
      'Kies één oefening die je wil blijven doen en koppel die aan een bestaand moment in je dag.',
      'Maak het klein en haalbaar, wees mild voor jezelf.'
    ],
    reflection: 'Welke oefening wil jij blijven doen omdat ze je echt deugd deed?'
  }
];

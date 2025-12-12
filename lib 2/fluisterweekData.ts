export interface VideoDay {
  day: number;
  title: string;
  subtitle: string;
  duration: string;
  focus: string;
  highlight: string;
  videoUrl: string;
  intention: string;
  steps: string[];
  reflection: string;
}

const placeholderUrl = "https://www.youtube.com/embed/ScMzIvxBSi4?rel=0&modestbranding=1";

export const videoDays: VideoDay[] = [
  {
    day: 1,
    title: "Reset je zenuwstelsel",
    subtitle: "Je adem als anker",
    duration: "15:02",
    focus: "Ademen en landen",
    highlight: "Je bent niet kapot, je lichaam vraagt gewoon om zachtheid.",
    videoUrl: placeholderUrl,
    intention:
      "We starten zacht: voeten op de grond, schouders laag, adem die trager uit mag dan in. Je ademhaling is de afstandsbediening van je zenuwstelsel en tegelijk de eenvoudigste manier om uit de AAN-stand te stappen.",
    steps: [
      "Even landen: zet je voeten plat, maak je rug lang en laat je schouders zakken.",
      "Adem in door je neus en adem dubbel zo lang uit door je mond, alsof je door een rietje blaast.",
      "Tel vijf traag verlengde uitademingen en voel wat er verandert in borst, buik en keel.",
      "Blijf daarna minstens een halve minuut zitten en merk gewoon op wat er nu aanwezig is.",
    ],
    reflection: "Wat voel ik in mijn lichaam na die langere uitademing?",
  },
  // … dagen 2 t/m 7 in dezelfde stijl (zie het volledige blok uit mijn vorige antwoord)
];

export const DAY_INTERVAL_MS = 24 * 60 * 60 * 1000;

export interface Milestone {
  id: number;
  roman: string;
  range: [number, number]; // [startProgress, endProgress] 0 to 1
  tagline: string;
  title: string;
  subtitle: string;
  description: string;
  specs: {
    label: string;
    value: string;
  }[];
  coordinates: string;
  elevation: string;
  lightingTone: "dawn" | "daylight" | "afternoon" | "golden-hour" | "twilight" | "night";
}

export const MILESTONES: Milestone[] = [
  {
    id: 1,
    roman: "I",
    range: [0.0, 0.12],
    tagline: "CHAPTER 01 // THE APPROACH",
    title: "WELCOME HOME",
    subtitle: "Architecture beyond imagination",
    description: "Rising through the morning mist, the Sovereign Palace commands the horizon. A sanctuary where sovereign grandeur harmonizes with the timeless poetry of stone.",
    specs: [
      { label: "GROUND AREA", value: "84 ACRES" },
      { label: "STONEWORK", value: "MAKRANA MARBLE" },
      { label: "ACCESS", value: "PRIVATE AIRSTRIP" },
    ],
    coordinates: "27° 10' 30\" N, 78° 02' 32\" E",
    elevation: "ELEVATION +380M",
    lightingTone: "dawn",
  },
  {
    id: 2,
    roman: "II",
    range: [0.12, 0.25],
    tagline: "CHAPTER 02 // SANCTUARY OF STONE",
    title: "A THRESHOLD OF LIGHT",
    subtitle: "Where stone breathes and time slows",
    description: "Hand-chiseled arched colonnades filter soft morning sunlight across mirror-polished marble. Echoes vanish into the 45-foot vaulted heights.",
    specs: [
      { label: "CEILING HEIGHT", value: "45 FEET" },
      { label: "COLONNADES", value: "108 COLUMNS" },
      { label: "ACOUSTICS", value: "ISOLATED WHISPER" },
    ],
    coordinates: "ATRIUM CENTRALIS",
    elevation: "ELEVATION +395M",
    lightingTone: "daylight",
  },
  {
    id: 3,
    roman: "III",
    range: [0.25, 0.38],
    tagline: "CHAPTER 03 // MASTER DOMAIN",
    title: "WHERE ROYALTY SLEEPS",
    subtitle: "Crafted in Italian marble and private terraces",
    description: "A 14,000 square foot private master compound. Silk-draped bedchambers open to private panoramic terraces hovering above the verdant valley below.",
    specs: [
      { label: "SUITE FOOTPRINT", value: "14,000 SQ FT" },
      { label: "TERRACE", value: "360° PROMENADE" },
      { label: "SECURITY", value: "BIOMETRIC VAULT" },
    ],
    coordinates: "ROYAL RESIDENCE WING",
    elevation: "ELEVATION +420M",
    lightingTone: "daylight",
  },
  {
    id: 4,
    roman: "IV",
    range: [0.38, 0.50],
    tagline: "CHAPTER 04 // CELESTIAL WATER",
    title: "ABOVE THE CLOUDS",
    subtitle: "Horizon dissolves into water and sky",
    description: "A 90-meter cantilevered infinity edge that seamlessly merges with the open stratosphere. Swim along the contour of the sky at dawn and dusk.",
    specs: [
      { label: "POOL SPAN", value: "90 METERS" },
      { label: "WATER HEATING", value: "GEOTHERMAL 28°C" },
      { label: "EDGE PROFILE", value: "ZERO-HORIZON" },
    ],
    coordinates: "TERRACE LEVEL 04",
    elevation: "ELEVATION +445M",
    lightingTone: "afternoon",
  },
  {
    id: 5,
    roman: "V",
    range: [0.50, 0.62],
    tagline: "CHAPTER 05 // GASTRONOMIC THEATRE",
    title: "A FEAST OF ART",
    subtitle: "Stone arches and quiet candlelight",
    description: "A three-Michelin starred private culinary court. Intimate dining chambers framed by hand-carved stone arches, illuminated solely by beeswax candlelight and fine vintage cellars.",
    specs: [
      { label: "RESERVE CELLAR", value: "6,000 BOTTLES" },
      { label: "PRIVATE CHEFS", value: "TRI-STAR CURATED" },
      { label: "SEATING", value: "EXCLUSIVE 18" },
    ],
    coordinates: "THE GRAND BANQUET",
    elevation: "ELEVATION +410M",
    lightingTone: "afternoon",
  },
  {
    id: 6,
    roman: "VI",
    range: [0.62, 0.75],
    tagline: "CHAPTER 06 // THERMAL OASIS",
    title: "SILENCE, PERFECTED",
    subtitle: "Waterfalls, steam, and meditation gardens",
    description: "Subterranean steam chambers carved directly into volcanic rock, fed by pristine mineral springs. Zen courtyards where natural falls murmur in meditative silence.",
    specs: [
      { label: "MINERAL SOURCE", value: "SUBTERRANEAN SPRING" },
      { label: "THERMAL BATHS", value: "5 TEMPERATURES" },
      { label: "PAVILION", value: "AYURVEDIC SANCTUM" },
    ],
    coordinates: "GARDEN HYPOGEUM",
    elevation: "ELEVATION +370M",
    lightingTone: "golden-hour",
  },
  {
    id: 7,
    roman: "VII",
    range: [0.75, 0.88],
    tagline: "CHAPTER 07 // GOLDEN TWILIGHT",
    title: "EVERY SUNSET IS PRIVATE",
    subtitle: "Golden hour symmetry and dancing fountains",
    description: "As the sun cascades amber light across royal water mirrors, fountains dance in mathematical symmetry. A breathtaking private spectacle reserved for the few.",
    specs: [
      { label: "FOUNTAIN BASIN", value: "12 REFLECTING POOLS" },
      { label: "AMBER GLARE", value: "RAW GOLD HOUR" },
      { label: "SYMMETRY", value: "MUGHAL QUADRANGLE" },
    ],
    coordinates: "COURTYARD OF REFLECTIONS",
    elevation: "ELEVATION +385M",
    lightingTone: "golden-hour",
  },
  {
    id: 8,
    roman: "VIII",
    range: [0.88, 1.0],
    tagline: "CHAPTER 08 // THE NIGHT BEACON",
    title: "AN UNFORGETTABLE DESTINATION",
    subtitle: "A beacon of royalty beneath the night sky",
    description: "Bathed in celestial starlight and architectural luminescence, Mahal becomes a luminous monument of sovereignty. The pinnacle of luxury living.",
    specs: [
      { label: "ILLUMINATION", value: "FIBER OPTIC NOCTURNE" },
      { label: "RESIDENCES", value: "SINGLE EXCLUSIVE TITLE" },
      { label: "INSPECTION", value: "BY INVITATION ONLY" },
    ],
    coordinates: "THE CELESTIAL PINNACLE",
    elevation: "ELEVATION +460M",
    lightingTone: "night",
  },
];

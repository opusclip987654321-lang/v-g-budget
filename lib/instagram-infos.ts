// Carrousels « infos végé » d'Instagram (demande de louis, 19/10/2026) : chaque jour un sujet différent pour
// comprendre le monde végétarien (différences entre régimes, protéines, souffrance animale, climat, saisons…),
// indépendant des articles du blog. Un fichier par carrousel dans content/instagram/carrousels/,
// ordre de publication dans content/instagram/carrousels/index.ts. Mode d'emploi : content/instagram/CONSIGNES.md.
// Longueurs maximales (pour que le texte tienne dans l'image) : scripts/check-instagram.mjs (pnpm check:instagram).

// Une image du carrousel : un titre, puis au choix un grand chiffre, un court texte et/ou 2 à 4 points.
export type InfoSlide = { title: string; chiffre?: [string, string]; text?: string; points?: string[] };

export type Info = {
  slug: string;
  title: string;          // titre de la couverture (60 caractères au plus)
  pill: string;           // pastille de la couverture : le thème (« Les bases », « Nutrition », « Planète »…)
  image?: string;         // photo de couverture dans public/ (JPEG), facultative
  slides: InfoSlide[];    // 3 à 6 images d'infos
  hook: string;           // première ligne de la légende
  hashtags: string[];     // 5 au plus
  sources: [string, string][]; // [nom court, adresse]
};

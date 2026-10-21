// Carrousels « infos végé » d'Instagram (demande de louis, 19/10/2026) : chaque jour un sujet différent pour
// comprendre le monde végétarien (différences entre régimes, protéines, souffrance animale, climat, saisons…),
// indépendant des articles du blog. Un fichier par carrousel dans content/instagram/carrousels/,
// ordre de publication dans content/instagram/carrousels/index.ts. Mode d'emploi : content/instagram/CONSIGNES.md.
// Longueurs maximales (pour que le texte tienne dans l'image) : scripts/check-instagram.mjs (pnpm check:instagram).

// Une image du carrousel. Par défaut : un titre, puis au choix un grand chiffre, un court texte et/ou 2 à 4 points.
// Autres formats (demande de Walid du 21/10/2026 : tester des posts très différents) ; les prix sont toujours
// calculés depuis lib/catalog.ts au moment du dessin, jamais écrits à la main :
// - recette : la fiche d'une recette du catalogue (photo, prix par part, ingrédients pour 2) ;
// - ticket : un ticket de caisse (un paquet de chaque ingrédient du catalogue, avec le total) ;
// - quiz : une question et 2 à 4 réponses (la bonne réponse arrive sur l'image suivante) ;
// - grand : une phrase en très grand sur fond vert, avec une ligne en dessous si besoin ;
// - semaine : 5 dîners du lundi au vendredi, prix par part et total des courses pour 2 ;
// - classement : des ingrédients du catalogue rangés du moins cher au plus cher au kilo.
export type InfoSlide =
  | { title: string; chiffre?: [string, string]; text?: string; points?: string[] }
  | { recette: string; text?: string }
  | { ticket: string; items: string[] }
  | { quiz: string; choix: string[] }
  | { grand: string; text?: string }
  | { semaine: string; recettes: string[] }
  | { classement: string; items: string[]; note?: string };

// Nom d'une image, pour la légende (une ligne par image).
export function slideLabel(s: InfoSlide, recipeTitle: (id: string) => string) {
  if ('recette' in s) return recipeTitle(s.recette);
  if ('ticket' in s) return s.ticket;
  if ('quiz' in s) return s.quiz;
  if ('grand' in s) return s.grand;
  if ('semaine' in s) return s.semaine;
  if ('classement' in s) return s.classement;
  return s.title;
}

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

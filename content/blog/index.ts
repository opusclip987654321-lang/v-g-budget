import type { Article } from '@/lib/blog-articles';
import mangerBioPasCher from './articles/manger-bio-pas-cher';
import circuitCourt from './articles/circuit-court';
import codeOeufs from './articles/code-oeufs';
import fruitsLegumesDeSaison from './articles/fruits-legumes-de-saison';
import labelBioAb from './articles/label-bio-ab';
import bienEtreAnimalEtiquettes from './articles/bien-etre-animal-etiquettes';
import proteinesVegetales from './articles/proteines-vegetales';
import menuSemainePasCher from './articles/menu-semaine-pas-cher';
import gaspillageAlimentaire from './articles/gaspillage-alimentaire';
import recettesLentillesPasCheres from './articles/recettes-lentilles-pas-cheres';
import repasPasCherPour2 from './articles/repas-pas-cher-pour-2';
import recettesPoisChiches from './articles/recettes-pois-chiches';
import queMangerFinDeMois from './articles/que-manger-fin-de-mois';
import courgeRecetteFacile from './articles/courge-recette-facile';
import remplacerLaViandePasCher from './articles/remplacer-la-viande-pas-cher';
import courses50EurosParSemaine from './articles/courses-50-euros-par-semaine';
import legumesSurgelesPrix from './articles/legumes-surgeles-prix';

// Articles du blog : un fichier par article dans ./articles (les 9 premiers datent du 7 octobre 2026),
// illustration dans public/images/blog/<slug>.svg et .jpg. Ajouter chaque nouvel article à la fin de la liste.
// Mode d'emploi : content/blog/CONSIGNES.md. Contrôle : pnpm check:blog.

export const dailyArticles: Article[] = [
  mangerBioPasCher,
  circuitCourt,
  codeOeufs,
  fruitsLegumesDeSaison,
  labelBioAb,
  bienEtreAnimalEtiquettes,
  proteinesVegetales,
  menuSemainePasCher,
  gaspillageAlimentaire,
  recettesLentillesPasCheres,
  repasPasCherPour2,
  recettesPoisChiches,
  queMangerFinDeMois,
  courgeRecetteFacile,
  remplacerLaViandePasCher,
  courses50EurosParSemaine,
  legumesSurgelesPrix,
];

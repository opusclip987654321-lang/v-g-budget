import type { Info } from '@/lib/instagram-infos';
import vegetarienVegetalienVegan from './vegetarien-vegetalien-vegan';
import proteinesVegetalesOuLesTrouver from './proteines-vegetales-ou-les-trouver';
import climatCeQuePese1Kg from './climat-ce-que-pese-1-kg';
import bienEtreAnimalLireLesEtiquettes from './bien-etre-animal-lire-les-etiquettes';
import legumesDeSaisonAutomne from './legumes-de-saison-automne';
import ideesRecuesVegetarien from './idees-recues-vegetarien';
import vitamineB12 from './vitamine-b12';
import legumineusesLeGuide from './legumineuses-le-guide';
import elevageTerresAgricoles from './elevage-terres-agricoles';
import leFerSansViande from './le-fer-sans-viande';
import devenirVegetarienParOuCommencer from './devenir-vegetarien-par-ou-commencer';
import omega3Vegetaux from './omega-3-vegetaux';
import viandeRougeEtSante from './viande-rouge-et-sante';
import calciumSansLait from './calcium-sans-lait';

// Carrousels « infos végé », dans l'ordre de publication (un par jour). Ajouter les nouveaux à la fin.
// Mode d'emploi : content/instagram/CONSIGNES.md. Contrôle : pnpm check:instagram.
export const infos: Info[] = [
  vegetarienVegetalienVegan,
  proteinesVegetalesOuLesTrouver,
  climatCeQuePese1Kg,
  bienEtreAnimalLireLesEtiquettes,
  legumesDeSaisonAutomne,
  ideesRecuesVegetarien,
  vitamineB12,
  legumineusesLeGuide,
  elevageTerresAgricoles,
  leFerSansViande,
  devenirVegetarienParOuCommencer,
  omega3Vegetaux,
  viandeRougeEtSante,
  calciumSansLait,
];

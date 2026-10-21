import type { Info } from '@/lib/instagram-infos';
import semaine5DinersPour2 from './semaine-5-diners-pour-2';
import quizPrixCurry from './quiz-prix-curry';
import erreursQuiCoutentCher from './erreurs-qui-coutent-cher';
import proteinesMoinsCheresAuKilo from './proteines-moins-cheres-au-kilo';
import finDeMoisIlReste10Euros from './fin-de-mois-il-reste-10-euros';
import placardDeBaseTicket from './placard-de-base-ticket';
import vraiFauxVegePlusCher from './vrai-faux-vege-plus-cher';
import dinersEn15Minutes from './diners-en-15-minutes';
import unPaquetDeLentillesCorail from './un-paquet-de-lentilles-corail';
import surgelesAToujoursAvoir from './surgeles-a-toujours-avoir';
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

// Carrousels « infos végé », dans l'ordre de publication (un par jour) ; ceux déjà publiés sont sautés. Ajouter les nouveaux à la fin.
// Les 10 premiers : test de formats très différents (semaine, quiz, ticket, classement, grande phrase…), demandé par Walid
// le 21/10/2026 ; ceux qui marchent seront ensuite poussés en publicité.
// Mode d'emploi : content/instagram/CONSIGNES.md. Contrôle : pnpm check:instagram.
export const infos: Info[] = [
  semaine5DinersPour2,
  quizPrixCurry,
  erreursQuiCoutentCher,
  proteinesMoinsCheresAuKilo,
  finDeMoisIlReste10Euros,
  placardDeBaseTicket,
  vraiFauxVegePlusCher,
  dinersEn15Minutes,
  unPaquetDeLentillesCorail,
  surgelesAToujoursAvoir,
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

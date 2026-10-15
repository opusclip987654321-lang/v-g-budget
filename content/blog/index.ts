import type { Article } from '@/lib/blog-articles';
import recettesLentillesPasCheres from './articles/recettes-lentilles-pas-cheres';

// Articles du blog publiés par la tâche quotidienne : un fichier par article dans ./articles,
// illustration dans public/images/blog/<slug>.svg et .jpg. Ajouter chaque nouvel article à la fin de la liste.
// Mode d'emploi : content/blog/CONSIGNES.md. Contrôle : pnpm check:blog.

export const dailyArticles: Article[] = [
  recettesLentillesPasCheres,
];

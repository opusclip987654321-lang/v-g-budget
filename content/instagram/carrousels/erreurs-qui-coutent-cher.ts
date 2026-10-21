import type { Info } from '@/lib/instagram-infos';

export default {
  slug: 'erreurs-qui-coutent-cher',
  title: '5 erreurs qui font grimper le ticket de caisse',
  pill: 'Astuces',
  slides: [
    { title: '1. Partir sans liste', text: 'Sans liste, on achète ce qu’on voit. Une liste faite d’après les menus de la semaine limite les achats en trop.' },
    { title: '2. Ignorer le prix au kilo', text: 'Il est obligatoire sur l’étiquette. C’est lui qu’il faut comparer, pas le prix du paquet.' },
    { title: '3. Oublier le placard', text: 'On rachète ce qu’on a déjà. Un coup d’œil avant de partir évite les doubles.' },
    { title: '4. Bouder les surgelés', text: 'Légumes surgelés nature : pas d’épluchage, pas de perte, et ils se gardent des mois.' },
    { title: '5. Jeter les restes', text: 'Un fond de riz ou de légumes, c’est le début du dîner du lendemain : riz sauté, soupe, galettes.' },
  ],
  hook: 'Liste, prix au kilo, placard : 5 erreurs qui font grimper le ticket de caisse sans qu’on s’en rende compte. La n°2 est la plus fréquente 👇',
  hashtags: ['#astucesbudget', '#courses', '#petitbudget', '#antigaspi', '#économies'],
  sources: [['economie.gouv.fr, le prix à l’unité de mesure', 'https://www.economie.gouv.fr/dgccrf/Publications/Vie-pratique/Fiches-pratiques/Prix-unitaire'], ['ADEME, gaspillage alimentaire', 'https://agirpourlatransition.ademe.fr/particuliers/conso/alimentation/gaspillage-alimentaire']],
} satisfies Info;

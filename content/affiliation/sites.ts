// Sites de cuisine à qui proposer le programme d'affiliation (demande de Walid du 22/10/2026). Une tâche
// programmée de Claude en ajoute chaque jour (consignes : content/affiliation/CONSIGNES.md). On ajoute à la fin et
// on ne change jamais `site` (il sert d'identifiant). Le dépôt est public : nom du site seulement, jamais de nom de
// personne ni d'adresse mail. Le site visite chaque adresse et garde le contact publié en base (lib/affiliation.ts).
export const themes = ['vegetarien', 'budget', 'etudiant', 'anti-gaspi', 'famille', 'batch-cooking', 'cuisine'] as const;
export type Theme = typeof themes[number];
export type Site = { site: string; nom: string; theme: Theme; ajoute: string };

// Domaines jamais retenus (réseaux sociaux, grands portails, marques, outils) : le site ne les visite pas, même
// trouvés par un lien. Claude en ajoute quand la liste se remplit de sites sans intérêt.
export const exclus = [
  'facebook.com', 'instagram.com', 'tiktok.com', 'pinterest.com', 'pinterest.fr', 'youtube.com', 'youtu.be', 'twitter.com', 'x.com',
  'linkedin.com', 'threads.net', 'snapchat.com', 'whatsapp.com', 'telegram.org', 'twitch.tv', 'reddit.com', 'bsky.app', 'vimeo.com',
  'spotify.com', 'deezer.com', 'apple.com', 'google.com', 'google.fr', 'goo.gl', 'bit.ly', 'linktr.ee', 'wikipedia.org', 'gravatar.com',
  'wordpress.org', 'wordpress.com', 'wix.com', 'overblog.com', 'over-blog.com', 'canalblog.com', 'blogger.com', 'shopify.com',
  'hellocoton.fr', 'feedburner.com', 'feedly.com', 'mailchimp.com', 'sendinblue.com', 'brevo.com', 'substack.com', 'patreon.com',
  'paypal.com', 'paypal.me', 'tipeee.com', 'ko-fi.com', 'utip.io', 'cloudflare.com', 'jetpack.com', 'woocommerce.com', 'elementor.com',
  'amazon.fr', 'amazon.com', 'amzn.to', 'fnac.com', 'cultura.com', 'carrefour.fr', 'auchan.fr', 'lidl.fr', 'intermarche.com',
  'marmiton.org', '750g.com', 'cuisineaz.com', 'journaldesfemmes.fr', 'elle.fr', 'doctissimo.fr', 'cuisineactuelle.fr', 'femmeactuelle.fr',
  'ptitchef.com', 'meilleurduchef.com', 'chefsimon.com', 'atelierdeschefs.fr', 'cuisine.journaldesfemmes.fr', 'lemonde.fr', 'lefigaro.fr',
  'ouest-france.fr', 'leparisien.fr', 'francetvinfo.fr', 'franceinter.fr', 'radiofrance.fr', 'huffingtonpost.fr', 'demotivateur.fr',
  'thermomix.fr', 'cookidoo.fr', 'vorwerk.com', 'toogoodtogo.com', 'weightwatchers.com', 'croq-kilos.com', 'ademe.fr', 'gouv.fr',
  'mangerbouger.fr', 'vegebudget.fr',
];

export const sites: Site[] = [
  { site: 'https://www.papillesetpupilles.fr/', nom: 'Papilles et Pupilles', theme: 'cuisine', ajoute: '2026-10-22' },
  { site: 'https://lacuisinedegeraldine.fr/', nom: 'La Cuisine de Géraldine', theme: 'cuisine', ajoute: '2026-10-22' },
  { site: 'https://www.recettes-vegan-faciles.com/', nom: 'Recettes Vegan Faciles', theme: 'vegetarien', ajoute: '2026-10-22' },
  { site: 'https://lapetiteokara.fr/', nom: 'La Petite Okara', theme: 'vegetarien', ajoute: '2026-10-22' },
  { site: 'https://www.100-vegetal.com/', nom: '100 % Végétal', theme: 'vegetarien', ajoute: '2026-10-22' },
  { site: 'https://leculdepoule.co/', nom: 'Le Cul de Poule', theme: 'vegetarien', ajoute: '2026-10-22' },
  { site: 'https://www.lefrugalisme.com/', nom: 'Le Frugalisme', theme: 'budget', ajoute: '2026-10-22' },
  { site: 'https://meslistesdecourses.fr/', nom: 'Mes listes de courses', theme: 'batch-cooking', ajoute: '2026-10-22' },
  { site: 'https://www.cuisine-etudiant.fr/', nom: 'Cuisine Étudiant', theme: 'etudiant', ajoute: '2026-10-22' },
  { site: 'https://copinesdebonsplans.fr/', nom: 'Copines de bons plans', theme: 'budget', ajoute: '2026-10-22' },
  { site: 'https://www.lafeestephanie.com/', nom: 'La Fée Stéphanie', theme: 'vegetarien', ajoute: '2026-10-22' },
  { site: 'https://www.trois-fois-par-jour.com/', nom: 'Trois fois par jour', theme: 'famille', ajoute: '2026-10-22' },
  { site: 'https://www.pankobunny.com/', nom: 'Panko Bunny', theme: 'vegetarien', ajoute: '2026-10-22' },
  { site: 'https://thebuddhistchef.com/', nom: 'Le Chef Bouddhiste', theme: 'vegetarien', ajoute: '2026-10-22' },
  { site: 'https://www.cleacuisine.fr/', nom: 'Cléa Cuisine', theme: 'vegetarien', ajoute: '2026-10-22' },
  { site: 'https://www.vegan-pratique.fr/', nom: 'Vegan Pratique', theme: 'vegetarien', ajoute: '2026-10-22' },
  { site: 'https://www.chloedelices.com/', nom: 'Chloé Délices', theme: 'vegetarien', ajoute: '2026-10-22' },
  { site: 'https://www.cuisineaddict.com/', nom: 'Cuisine Addict', theme: 'budget', ajoute: '2026-10-22' },
  { site: 'https://www.amandinecooking.com/', nom: 'Amandine Cooking', theme: 'cuisine', ajoute: '2026-10-22' },
  { site: 'https://www.hervecuisine.com/', nom: 'Hervé Cuisine', theme: 'cuisine', ajoute: '2026-10-22' },
  { site: 'https://www.mercotte.fr/', nom: 'Mercotte', theme: 'cuisine', ajoute: '2026-10-22' },
  { site: 'https://www.chefnini.com/', nom: 'Chef Nini', theme: 'cuisine', ajoute: '2026-10-22' },
  { site: 'https://www.undejeunerdesoleil.com/', nom: 'Un déjeuner de soleil', theme: 'cuisine', ajoute: '2026-10-22' },
  { site: 'https://www.yumelise.fr/', nom: 'Yumelise', theme: 'cuisine', ajoute: '2026-10-22' },
  { site: 'https://www.cuisine-libre.org/', nom: 'Cuisine libre', theme: 'cuisine', ajoute: '2026-10-22' },
  { site: 'https://www.mesinspirationsculinaires.com/', nom: 'Mes inspirations culinaires', theme: 'cuisine', ajoute: '2026-10-22' },
  { site: 'https://www.croquantfondantgourmand.com/', nom: 'Croquant Fondant Gourmand', theme: 'cuisine', ajoute: '2026-10-22' },
  { site: 'https://www.ptitecuisinedepauline.com/', nom: 'La p’tite cuisine de Pauline', theme: 'cuisine', ajoute: '2026-10-22' },
  { site: 'https://www.cuisinemoiunmouton.com/', nom: 'Cuisine-moi un mouton', theme: 'cuisine', ajoute: '2026-10-22' },
  { site: 'https://www.julieandrieu.com/', nom: 'Julie Andrieu', theme: 'cuisine', ajoute: '2026-10-22' },
  { site: 'https://www.laurentmariotte.com/', nom: 'Laurent Mariotte', theme: 'cuisine', ajoute: '2026-10-22' },
  { site: 'https://www.cuisine-et-mets.com/', nom: 'Cuisine et mets', theme: 'cuisine', ajoute: '2026-10-22' },
  { site: 'https://www.aux-fourneaux.fr/', nom: 'Aux fourneaux', theme: 'cuisine', ajoute: '2026-10-22' },
  { site: 'https://www.cuisinonsencouleurs.fr/', nom: 'Cuisinons en couleurs', theme: 'cuisine', ajoute: '2026-10-22' },
  { site: 'https://www.lacuisinedebernard.com/', nom: 'La cuisine de Bernard', theme: 'cuisine', ajoute: '2026-10-22' },
  { site: 'https://www.mamieboude.com/', nom: 'Mamie Boude', theme: 'famille', ajoute: '2026-10-22' },
  { site: 'https://www.chefcuisto.com/', nom: 'Chef Cuisto', theme: 'cuisine', ajoute: '2026-10-22' },
  { site: 'https://www.macuisineenthousiaste.com/', nom: 'Ma cuisine enthousiaste', theme: 'vegetarien', ajoute: '2026-10-22' },
];

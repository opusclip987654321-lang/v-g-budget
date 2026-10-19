import type { Info } from '@/lib/instagram-infos';

export default {
  slug: 'vegetarien-vegetalien-vegan',
  title: 'Végétarien, végétalien, vegan : quelles différences ?',
  pill: 'Les bases',
  slides: [
    { title: 'Végétarien', text: 'Pas de viande, pas de poisson, pas de fruits de mer.', points: ['Mange : œufs, lait, fromage, miel', 'Ne mange pas : viande, charcuterie, poisson, crevettes'] },
    { title: 'Végétalien', text: 'Aucun produit d’origine animale dans l’assiette.', points: ['Pas d’œufs, de lait, de fromage ni de miel', 'Protéines : légumineuses, tofu, céréales, oléagineux', 'Un complément de vitamine B12 est indispensable'] },
    { title: 'Vegan', text: 'Le végétalisme appliqué à tout le mode de vie, pas seulement à l’assiette.', points: ['Pas de cuir, de laine ni de fourrure', 'Pas de cosmétiques testés sur les animaux', 'Pas de spectacles avec des animaux'] },
    { title: 'Flexitarien', text: 'Il mange encore de la viande, mais moins souvent et en choisissant mieux.', points: ['Plusieurs repas sans viande par semaine', 'La façon la plus simple de commencer'] },
    { title: 'Et le pescétarien ?', text: 'Il mange du poisson mais pas de viande. Ce n’est donc pas un régime végétarien : le poisson est un animal.' },
  ],
  hook: 'Végétarien, végétalien, vegan, flexitarien : on vous explique les différences en 1 minute 👇',
  hashtags: ['#végétarien', '#vegan', '#végétalien', '#flexitarien', '#alimentationvégétale'],
  sources: [['Association végétarienne de France', 'https://www.vegetarisme.fr']],
} satisfies Info;

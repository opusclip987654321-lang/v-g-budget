import sharp from 'sharp';
import {readFileSync} from 'node:fs';

// Icônes de l'appli installable (écran d'accueil du téléphone), dessinées à partir de public/favicon.svg.
// Aussi les icônes de l'appli pour les stores (mobile/assets).
// À relancer seulement si le logo change : node scripts/icones-appli.mjs
const logo=readFileSync('public/favicon.svg','utf8');
const feuille=logo.replace(/^.*?<rect[^>]*\/>/,'').replace('</svg>','');
// Carré plein (Android découpe lui-même la forme, iPhone arrondit les coins) avec la feuille réduite au centre.
const plein=(echelle)=>`<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 64 64"><rect width="64" height="64" fill="#174c38"/><g transform="translate(${32-32*echelle} ${32-32*echelle}) scale(${echelle})">${feuille}</g></svg>`;
// Feuille seule sur fond transparent (Android pose lui-même le fond vert ; écran de démarrage).
const seule=(echelle,couleur)=>`<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 64 64"><g transform="translate(${32-32*echelle} ${32-32*echelle}) scale(${echelle})">${couleur?feuille.replaceAll('#d7f369',couleur).replaceAll('#174c38','none'):feuille}</g></svg>`;
const sorties=[
 ['public/icons/icone-192.png',192,logo],
 ['public/icons/icone-512.png',512,logo],
 ['public/icons/icone-masquable-512.png',512,plein(.72)],
 ['public/icons/apple-touch-icon.png',180,plein(.86)],
 ['mobile/assets/icon.png',1024,plein(.8)],
 ['mobile/assets/android-icon-foreground.png',1024,seule(.6)],
 ['mobile/assets/android-icon-monochrome.png',1024,seule(.6,'#ffffff')],
 ['mobile/assets/splash-icon.png',512,seule(1)],
 ['mobile/assets/favicon.png',48,logo],
];
for(const [fichier,taille,svg] of sorties){await sharp(Buffer.from(svg),{density:taille*2}).resize(taille,taille).png().toFile(fichier);console.log(fichier);}

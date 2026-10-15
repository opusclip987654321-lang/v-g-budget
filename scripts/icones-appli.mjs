import sharp from 'sharp';
import {readFileSync} from 'node:fs';

// Icônes de l'appli installable (écran d'accueil du téléphone), dessinées à partir de public/favicon.svg.
// À relancer seulement si le logo change : node scripts/icones-appli.mjs
const logo=readFileSync('public/favicon.svg','utf8');
const feuille=logo.replace(/^.*?<rect[^>]*\/>/,'').replace('</svg>','');
// Carré plein (Android découpe lui-même la forme, iPhone arrondit les coins) avec la feuille réduite au centre.
const plein=(echelle)=>`<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 64 64"><rect width="64" height="64" fill="#174c38"/><g transform="translate(${32-32*echelle} ${32-32*echelle}) scale(${echelle})">${feuille}</g></svg>`;
const sorties=[
 ['public/icons/icone-192.png',192,logo],
 ['public/icons/icone-512.png',512,logo],
 ['public/icons/icone-masquable-512.png',512,plein(.72)],
 ['public/icons/apple-touch-icon.png',180,plein(.86)],
];
for(const [fichier,taille,svg] of sorties){await sharp(Buffer.from(svg),{density:taille*2}).resize(taille,taille).png().toFile(fichier);console.log(fichier);}

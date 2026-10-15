// Contrôle des articles du blog avant fusion (surtout ceux écrits par la tâche quotidienne).
// Sans dépendance : lit les fichiers sources. Le rendu des pages est vérifié par pnpm check:api.
import {readFileSync,readdirSync,existsSync,statSync} from 'node:fs';

const errors=[];const warnings=[];
const fail=(m)=>errors.push(m);const warn=(m)=>warnings.push(m);
const today=new Date().toLocaleDateString('sv-SE',{timeZone:'Europe/Paris'});

const legacy=readFileSync('lib/blog-articles.ts','utf8');
const index=readFileSync('content/blog/index.ts','utf8');
const catalog=readFileSync('lib/catalog.ts','utf8');
const recipeIds=new Set([...catalog.matchAll(/\br\('([a-z0-9-]+)'/g)].map(m=>m[1]));
const files=readdirSync('content/blog/articles').filter(f=>f.endsWith('.ts')).sort();

const slugs=[...legacy.matchAll(/^\s+slug: '([a-z0-9-]+)'/gm)].map(m=>m[1]);
const titles=[...legacy.matchAll(/^\s+title: '(.+)',$/gm)].map(m=>m[1]);

// Lit la valeur d'un champ texte : « champ: '...' », « champ: "..." » ou « champ: `...` ».
const field=(src,name)=>{const m=src.match(new RegExp(`\\b${name}: (['"\`])((?:\\\\.|(?!\\1)[^])*?)\\1`));return m?.[2].replace(/\\(['"])/g,'$1');};
// Images JPEG : lit la taille dans l'en-tête SOF.
function jpegSize(path){const b=readFileSync(path);if(b[0]!==0xff||b[1]!==0xd8)return null;let i=2;while(i<b.length){if(b[i]!==0xff){i++;continue;}const t=b[i+1];const len=b.readUInt16BE(i+2);if(t>=0xc0&&t<=0xcf&&![0xc4,0xc8,0xcc].includes(t))return {h:b.readUInt16BE(i+5),w:b.readUInt16BE(i+7)};i+=2+len;}return null;}

for(const f of files){
  const path=`content/blog/articles/${f}`;const src=readFileSync(path,'utf8');const name=f.replace(/\.ts$/,'');
  const where=`${path} :`;
  const slug=field(src,'slug');
  if(slug!==name)fail(`${where} le slug (${slug}) doit être identique au nom du fichier (${name}).`);
  if(!/^[a-z0-9]+(-[a-z0-9]+)*$/.test(name))fail(`${where} nom de fichier en minuscules, chiffres et tirets seulement.`);
  slugs.push(name);
  const ident=index.match(new RegExp(`import (\\w+) from '\\./articles/${name}';`))?.[1];
  if(!ident)fail(`${where} absent de content/blog/index.ts (ligne import manquante).`);
  else if(!new RegExp(`\\b${ident}\\b`).test(index.split('dailyArticles')[1]??''))fail(`${where} importé mais pas ajouté à la liste dailyArticles.`);
  if(!/export default \{/.test(src)||!/\} satisfies Article;?\s*$/.test(src))fail(`${where} doit suivre le modèle « export default { … } satisfies Article; ».`);
  const date=field(src,'date');
  if(!/^\d{4}-\d{2}-\d{2}$/.test(date??''))fail(`${where} date au format AAAA-MM-JJ obligatoire.`);
  else if(date>today)fail(`${where} date dans le futur (${date}).`);
  const title=field(src,'title');const seo=field(src,'seoTitle')??title;const desc=field(src,'description');
  if(!title)fail(`${where} titre manquant.`);else titles.push(title);
  if(seo&&seo.length>70)warn(`${where} titre SEO de ${seo.length} caractères (Google coupe vers 60).`);
  if(!desc)fail(`${where} description manquante.`);else if(desc.length<110||desc.length>170)warn(`${where} description de ${desc.length} caractères (viser 120 à 160).`);
  for(const k of ['lead','category','coverAlt'])if(!field(src,k))fail(`${where} champ ${k} manquant.`);
  if(!/\bkeywords: \[/.test(src))fail(`${where} champ keywords manquant.`);
  for(const m of src.matchAll(/\bcost\('([^']+)'\)/g))if(!recipeIds.has(m[1]))fail(`${where} recette inconnue dans cost('${m[1]}').`);
  const ingredientIds=new Set([...catalog.matchAll(/\bi\('([a-z0-9-]+)'/g)].map(m=>m[1]));
  for(const m of src.matchAll(/\b(?:packPrice|kiloPrice|amountPrice)\('([^']+)'/g))if(!ingredientIds.has(m[1]))fail(`${where} ingrédient inconnu : ${m[1]}.`);
  for(const m of src.matchAll(/^@recettes (.+)$/gm))for(const id of m[1].split(',').map(s=>s.trim()))if(!recipeIds.has(id))fail(`${where} recette inconnue dans @recettes : ${id}.`);
  for(const m of src.matchAll(/\]\(\/recettes\/([a-z0-9-]+)\)/g))if(!recipeIds.has(m[1]))fail(`${where} lien vers une recette inconnue : /recettes/${m[1]}.`);
  if(!/^@cta /m.test(src))fail(`${where} il manque l'appel à l'action « @cta … » dans le corps.`);
  if(/€/.test(src.replace(/\$\{(?:cost|packPrice|kiloPrice|amountPrice)\([^}]*\)\}/g,''))&&!/\bsources: \[\s*\[/.test(src))warn(`${where} contient des montants en euros sans aucune source : vérifier qu'ils viennent du site.`);
  const words=src.split(/\s+/).length;if(words<700)warn(`${where} article court (${words} mots).`);
  const photo=/\bphoto: true\b/.test(src);
  for(const ext of photo?['jpg']:['svg','jpg']){const img=`public/images/blog/${name}.${ext}`;if(!existsSync(img)||statSync(img).size===0)fail(`${where} illustration manquante : ${img}.`);}
  const jpg=`public/images/blog/${name}.jpg`;if(existsSync(jpg)){const s=jpegSize(jpg);if(!s||s.w!==1200||s.h!==675)fail(`${where} ${jpg} doit être un vrai JPEG de 1200 × 675 (trouvé ${s?`${s.w} × ${s.h}`:'autre format'}).`);}
}
for(const [list,label] of [[slugs,'slug'],[titles,'titre']]){const seen=new Set();for(const v of list){if(seen.has(v))fail(`${label} en double : ${v}.`);seen.add(v);}}
for(const m of index.matchAll(/from '\.\/articles\/([^']+)'/g))if(!files.includes(`${m[1]}.ts`))fail(`content/blog/index.ts importe un article absent : ${m[1]}.`);

for(const w of warnings)console.warn(`Attention : ${w}`);
if(errors.length){for(const e of errors)console.error(`Erreur : ${e}`);process.exit(1);}
console.log(`Blog : ${slugs.length} articles contrôlés (${files.length} dans content/blog).`);

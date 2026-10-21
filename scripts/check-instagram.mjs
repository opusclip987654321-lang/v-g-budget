// Contrôle des carrousels « infos végé » d'Instagram (content/instagram/carrousels), surtout ceux écrits par la tâche de Claude.
// Le rendu des images est vérifié par pnpm check:api.
import {readFileSync,readdirSync,existsSync} from 'node:fs';
import {pathToFileURL} from 'node:url';

const dir='content/instagram/carrousels';
// Limites pour que le texte tienne dans une image 1080 × 1350.
const L={title:60,slideTitle:48,text:200,points:4,point:90,chiffre:8,chiffreLabel:80,slides:[3,6],hashtags:5};
const errors=[];const fail=(m)=>errors.push(m);

const files=readdirSync(dir).filter(f=>f.endsWith('.ts')&&f!=='index.ts').sort();
const index=readFileSync(`${dir}/index.ts`,'utf8');
const listed=[...index.matchAll(/^import \w+ from '\.\/([a-z0-9-]+)';$/gm)].map(m=>m[1]);
for(const f of files)if(!listed.includes(f.slice(0,-3)))fail(`${f} : absent de ${dir}/index.ts`);
const catalog=readFileSync('lib/catalog.ts','utf8');
const recipeIds=new Set([...catalog.matchAll(/^\s*r\('([a-z0-9-]+)'/gm)].map(m=>m[1]));
const ingredientIds=new Set([...catalog.matchAll(/\bi\('([a-z0-9-]+)'/g)].map(m=>m[1]));
const blog=new Set(readdirSync('content/blog/articles').map(f=>f.replace(/\.ts$/,'')));
const seen=new Set();
for(const f of files){
  const at=`${dir}/${f}`;
  const i=(await import(pathToFileURL(at).href)).default;
  if(i.slug!==f.slice(0,-3))fail(`${at} : le slug doit être le nom du fichier`);
  if(seen.has(i.slug)||blog.has(i.slug))fail(`${at} : slug déjà utilisé`);seen.add(i.slug);
  if(!i.title||i.title.length>L.title)fail(`${at} : titre de couverture de ${i.title?.length} caractères (${L.title} au plus)`);
  if(!i.pill||i.pill.length>20)fail(`${at} : pastille absente ou trop longue`);
  if(i.image&&(!i.image.endsWith('.jpg')||!existsSync(`public${i.image}`)))fail(`${at} : image ${i.image} introuvable (JPEG dans public/)`);
  if(i.slides.length<L.slides[0]||i.slides.length>L.slides[1])fail(`${at} : ${i.slides.length} images d'infos (${L.slides[0]} à ${L.slides[1]})`);
  i.slides.forEach((s,k)=>{
    const w=`${at}, image ${k+2}`;
    if(/[\u{1F300}-\u{1FAFF}\u{2600}-\u{27BF}]/u.test(JSON.stringify(s)))fail(`${w} : pas d'émoji dans les images (impossible à dessiner)`);
    // Autres formats (lib/instagram-infos.ts) : les recettes et ingrédients doivent exister dans le catalogue.
    const recipe=(id)=>{if(!recipeIds.has(id))fail(`${w} : recette « ${id} » absente de lib/catalog.ts`);};
    const ingredient=(id)=>{if(!ingredientIds.has(id))fail(`${w} : ingrédient « ${id} » absent de lib/catalog.ts`);};
    const prices=(t)=>{for(const m of t.matchAll(/\{prix:([a-z0-9-]+)\}/g))recipe(m[1]);};
    if('recette' in s){recipe(s.recette);if(s.text&&s.text.length>110)fail(`${w} : texte de recette de ${s.text.length} caractères (110 au plus)`);return;}
    if('ticket' in s){if(!s.ticket||s.ticket.length>L.slideTitle)fail(`${w} : titre du ticket trop long`);if(!s.items?.length||s.items.length>12)fail(`${w} : 1 à 12 produits sur le ticket`);s.items?.forEach(ingredient);return;}
    if('quiz' in s){prices(s.quiz);s.choix?.forEach(prices);if(!s.quiz||s.quiz.length>60)fail(`${w} : question de quiz de ${s.quiz?.length} caractères (60 au plus)`);if(!s.choix||s.choix.length<2||s.choix.length>4||s.choix.some(c=>c.length>28))fail(`${w} : 2 à 4 réponses de 28 caractères au plus`);return;}
    if('grand' in s){prices(s.grand);if(s.text)prices(s.text);if(!s.grand||s.grand.length>80)fail(`${w} : grande phrase de ${s.grand?.length} caractères (80 au plus)`);if(s.text&&s.text.length>120)fail(`${w} : ligne sous la grande phrase trop longue (120 au plus)`);return;}
    if('semaine' in s){if(!s.semaine||s.semaine.length>L.slideTitle)fail(`${w} : titre de la semaine trop long`);if(!s.recettes||s.recettes.length<3||s.recettes.length>5)fail(`${w} : 3 à 5 recettes dans la semaine`);s.recettes?.forEach(recipe);return;}
    if('classement' in s){if(!s.classement||s.classement.length>L.slideTitle)fail(`${w} : titre du classement trop long`);if(!s.items||s.items.length<3||s.items.length>6)fail(`${w} : 3 à 6 ingrédients au classement`);s.items?.forEach(ingredient);if(s.note&&s.note.length>160)fail(`${w} : note du classement trop longue (160 au plus)`);return;}
    if(!s.title||s.title.length>L.slideTitle)fail(`${w} : titre de ${s.title?.length} caractères (${L.slideTitle} au plus)`);
    if(!s.text&&!s.points&&!s.chiffre)fail(`${w} : ni texte, ni points, ni chiffre`);
    if(s.text&&s.text.length>L.text)fail(`${w} : texte de ${s.text.length} caractères (${L.text} au plus)`);
    if(s.points&&(s.points.length<2||s.points.length>L.points))fail(`${w} : ${s.points.length} points (2 à ${L.points})`);
    for(const p of s.points??[])if(p.length>L.point)fail(`${w} : point de ${p.length} caractères (${L.point} au plus)`);
    if(s.chiffre&&(s.chiffre[0].length>L.chiffre||s.chiffre[1].length>L.chiffreLabel))fail(`${w} : chiffre trop long`);
    if(s.chiffre&&s.points)fail(`${w} : un chiffre et des points ne tiennent pas ensemble`);
    if(s.points&&s.text&&s.points.length+Math.ceil(s.text.length/45)>6)fail(`${w} : trop de texte avec les points`);
  });
  if(!i.hook||i.hook.length>150)fail(`${at} : première ligne de légende absente ou trop longue`);
  if(!i.hashtags.length||i.hashtags.length>L.hashtags||i.hashtags.some(h=>!/^#\S+$/.test(h)))fail(`${at} : 1 à ${L.hashtags} hashtags`);
  if(!i.sources.length||i.sources.some(([n,u])=>!n||!/^https:\/\//.test(u)))fail(`${at} : au moins une source avec son adresse https`);
}
if(errors.length){console.error(errors.join('\n'));process.exit(1);}
console.log(`${files.length} carrousels Instagram vérifiés.`);

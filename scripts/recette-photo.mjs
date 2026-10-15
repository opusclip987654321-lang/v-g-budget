// Génère la photo réaliste d'une nouvelle recette avec l'API images d'OpenAI (même réglages que scripts/blog-photo.mjs),
// puis l'enregistre en public/images/recettes/<id>.jpg (800 × 533, comme les autres photos de recettes).
// Usage : node scripts/recette-photo.mjs <id> "description du plat servi"
// Nécessite la variable d'environnement OPENAI_API_KEY (jamais dans le dépôt). Modèle : OPENAI_IMAGE_MODEL, par défaut gpt-image-1.
import {writeFileSync,mkdtempSync,rmSync} from 'node:fs';
import {execFileSync} from 'node:child_process';
import {tmpdir} from 'node:os';
import {join,resolve} from 'node:path';

const [id,dish]=process.argv.slice(2);
if(!id||!/^[a-z0-9-]+$/.test(id)||!dish)throw new Error('Usage : node scripts/recette-photo.mjs <id> "description du plat servi"');
const key=process.env.OPENAI_API_KEY;
if(!key){console.error('OPENAI_API_KEY absente : pas de photo, la recette ne peut pas être ajoutée.');process.exit(2);}

const prompt=`Photographie culinaire réaliste, lumière naturelle douce, cadrage horizontal, vue de trois quarts. ${dish}, servi pour deux dans des assiettes simples. `+
  'Plat végétal fait maison, appétissant et fidèle à la recette, ingrédients de supermarché ordinaires, table du quotidien en France. '+
  'Aucun texte, aucun logo, aucune marque, aucune étiquette lisible, aucun visage. Pas de viande, de poisson, d’œuf ni de fromage.';

const res=await fetch('https://api.openai.com/v1/images/generations',{method:'POST',headers:{'Content-Type':'application/json',Authorization:`Bearer ${key}`},
  body:JSON.stringify({model:process.env.OPENAI_IMAGE_MODEL||'gpt-image-1',prompt,size:'1536x1024',quality:'medium',n:1})});
const data=await res.json().catch(()=>({}));
if(!res.ok||!data.data?.[0]?.b64_json){console.error(`Échec de la génération (${res.status}) : ${data.error?.message??'réponse inattendue'}`);process.exit(1);}

const dir=mkdtempSync(join(tmpdir(),'recette-photo-'));
const raw=join(dir,'photo.png');writeFileSync(raw,Buffer.from(data.data[0].b64_json,'base64'));
const out=resolve(`public/images/recettes/${id}.jpg`);
execFileSync('convert',[raw,'-resize','800x533^','-gravity','center','-extent','800x533','-strip','-quality','84',out]);
rmSync(dir,{recursive:true,force:true});
console.log(`Photo créée : public/images/recettes/${id}.jpg (à regarder avant de la garder)`);

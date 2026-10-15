// Génère la photo réaliste d'un article du blog avec l'API images d'OpenAI (choix de louis, 15/10/2026),
// puis l'enregistre en public/images/blog/<slug>.jpg (1200 × 675). Dans l'article, mettre photo: true.
// Usage : node scripts/blog-photo.mjs <slug> "description de la scène"
// Nécessite la variable d'environnement OPENAI_API_KEY (jamais dans le dépôt). Modèle : OPENAI_IMAGE_MODEL, par défaut gpt-image-1.
import {writeFileSync,mkdtempSync,rmSync} from 'node:fs';
import {execFileSync} from 'node:child_process';
import {tmpdir} from 'node:os';
import {join,resolve} from 'node:path';

const [slug,scene]=process.argv.slice(2);
if(!slug||!scene)throw new Error('Usage : node scripts/blog-photo.mjs <slug> "description de la scène"');
const key=process.env.OPENAI_API_KEY;
if(!key){console.error('OPENAI_API_KEY absente : pas de photo, garder l’illustration SVG.');process.exit(2);}

// Style commun à toutes les photos du blog : réaliste, cuisine de tous les jours, sans texte ni marque.
const prompt=`Photographie culinaire réaliste, lumière naturelle douce, cadrage horizontal large. ${scene}. `+
  'Cuisine familiale simple et appétissante, ingrédients de supermarché ordinaires, table ou plan de travail du quotidien en France. '+
  'Aucun texte, aucun logo, aucune marque, aucune étiquette lisible, aucun visage. Pas de viande ni de poisson.';

const res=await fetch('https://api.openai.com/v1/images/generations',{method:'POST',headers:{'Content-Type':'application/json',Authorization:`Bearer ${key}`},
  body:JSON.stringify({model:process.env.OPENAI_IMAGE_MODEL||'gpt-image-1',prompt,size:'1536x1024',quality:'medium',n:1})});
const data=await res.json().catch(()=>({}));
if(!res.ok||!data.data?.[0]?.b64_json){console.error(`Échec de la génération (${res.status}) : ${data.error?.message??'réponse inattendue'}`);process.exit(1);}

const dir=mkdtempSync(join(tmpdir(),'blog-photo-'));
const raw=join(dir,'photo.png');writeFileSync(raw,Buffer.from(data.data[0].b64_json,'base64'));
const out=resolve(`public/images/blog/${slug}.jpg`);
execFileSync('convert',[raw,'-resize','1200x675^','-gravity','center','-extent','1200x675','-strip','-quality','84',out]);
rmSync(dir,{recursive:true,force:true});
console.log(`Photo créée : public/images/blog/${slug}.jpg (penser à photo: true dans l'article)`);

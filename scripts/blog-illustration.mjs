// Crée public/images/blog/<slug>.jpg (1200 × 675) à partir de l'illustration <slug>.svg.
// Les réseaux sociaux et Google n'affichent pas le SVG en aperçu, d'où cette version JPG.
// Usage : node scripts/blog-illustration.mjs <slug>. Utilise Chromium (Playwright), sinon ImageMagick.
import {existsSync,readFileSync} from 'node:fs';
import {execFileSync} from 'node:child_process';
import {createRequire} from 'node:module';
import {join,resolve} from 'node:path';

const slug=process.argv[2];
if(!slug)throw new Error('Usage : node scripts/blog-illustration.mjs <slug>');
const svg=resolve(`public/images/blog/${slug}.svg`);const jpg=resolve(`public/images/blog/${slug}.jpg`);
if(!existsSync(svg))throw new Error(`Illustration absente : ${svg}`);

async function loadPlaywright(){
  try{return await import('playwright');}catch{}
  try{const root=execFileSync('npm',['root','-g'],{encoding:'utf8'}).trim();return createRequire(join(root,'noop.js'))('playwright');}catch{return null;}
}
const pw=await loadPlaywright();
if(pw){
  const browser=await pw.chromium.launch();
  const page=await browser.newPage({viewport:{width:1200,height:675}});
  await page.setContent(`<html><body style="margin:0">${readFileSync(svg,'utf8')}</body></html>`);
  await page.locator('svg').first().evaluate(e=>{e.setAttribute('width','1200');e.setAttribute('height','675');e.style.display='block';});
  await page.screenshot({path:jpg,type:'jpeg',quality:86,clip:{x:0,y:0,width:1200,height:675}});
  await browser.close();
}else{
  execFileSync('convert',['-background','white','-density','96',svg,'-resize','1200x675!','-quality','86',jpg]);
}
console.log(`Image créée : public/images/blog/${slug}.jpg`);

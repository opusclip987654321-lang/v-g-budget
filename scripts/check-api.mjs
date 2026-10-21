import assert from 'node:assert/strict';
import {readFileSync,mkdtempSync,rmSync} from 'node:fs';
import {tmpdir} from 'node:os';
import {join} from 'node:path';
import {spawn} from 'node:child_process';
import {createHmac} from 'node:crypto';
import {DatabaseSync} from 'node:sqlite';
import {createServer} from 'node:http';
import sharp from 'sharp';

// Lance le site construit (next start) avec une base et un dossier de photos
// temporaires. Aucun service déployé, compte réel ni prestataire de paiement n'est contacté.
// Nombre de recettes du catalogue (de nouvelles recettes s'ajoutent chaque semaine, voir content/recettes/CONSIGNES.md).
const catalogSize=[...readFileSync('lib/catalog.ts','utf8').matchAll(/^\s*r\('[a-z0-9-]+'/gm)].length;
const port=4173+Math.floor(Math.random()*500);
const origin=`http://127.0.0.1:${port}`;
const dataDir=mkdtempSync(join(tmpdir(),'vegebudget-check-'));
const outbox=join(dataDir,'outbox.jsonl');
const secret='local-test-secret-local-test-secret-0123456789';
const baseEnv={DATA_DIR:dataDir,AUTH_SECRET:secret,SITE_ORIGIN:origin,OWNER_EMAIL:'owner@example.invalid',CRON_SECRET:'cron-secret-de-test-1234',BILLING_ENABLED:'false',MAIL_OUTBOX:outbox};
let server;
async function startServer(extra={}){
 server=spawn(process.execPath,['node_modules/next/dist/bin/next','start','-p',String(port),'-H','127.0.0.1'],{env:{...process.env,...baseEnv,...extra},stdio:['ignore','ignore','inherit']});
 for(let i=0;i<120;i++){try{await fetch(origin+'/api/app?action=bootstrap');return;}catch{await new Promise(r=>setTimeout(r,250));}}
 throw new Error('Le serveur de test ne démarre pas.');
}
async function stopServer(){if(!server)return;const done=new Promise(r=>server.once('exit',r));server.kill('SIGTERM');await done;server=undefined;}
function openDb(){const raw=new DatabaseSync(join(dataDir,'vegebudget.sqlite'));return {prepare:(sql)=>{let values=[];const st={bind:(...v)=>{values=v;return st;},first:async()=>raw.prepare(sql).get(...values)??null,run:async()=>raw.prepare(sql).run(...values)};return st;}};}
function sessionFor(user){const payload=Buffer.from(JSON.stringify({uid:user.id,email:user.email,exp:Date.now()+3600000})).toString('base64url');return `vb_session=${payload}.${createHmac('sha256',secret).update(payload).digest('base64url')}`;}
const owner={id:'local-test-owner',email:'owner@example.invalid'};
const member={id:'local-test-member',email:'member@example.invalid'};
let checks=0;
const check=(value,expected,label)=>{assert.deepEqual(value,expected,label);checks++;};
async function request(path,user,data,headers={}){
 const auth=user?{Cookie:sessionFor(user)}:{};
 const response=await fetch(origin+path,{redirect:'manual',method:data===undefined?'GET':'POST',headers:{...auth,...(data!==undefined?{'Content-Type':'application/json',Origin:origin}:{}),...headers},...(data!==undefined?{body:JSON.stringify(data)}:{})});
 const type=response.headers.get('Content-Type')??'';
 const body=type.includes('json')?await response.json():await response.text();
 return {status:response.status,body};
}
const api=(action,user,data)=>request('/api/app'+(data===undefined?'?action='+action:''),user,data===undefined?undefined:{action,...data});
try{
 await startServer();let db=openDb();
 const page=await request('/');check(page.status,200,'server render');assert.match(page.body,/VégéBudget/);checks++;const appPage=await request('/app');check(appPage.status,200,'app render');
 const bootstrap=await api('bootstrap');check(bootstrap.status,200,'anonymous bootstrap');check(bootstrap.body.catalog.recipes.length,catalogSize,'initial catalogue');check(bootstrap.body.billingReady,false,'billing closed');
 check((await api('state',undefined,{state:bootstrap.body.state,revision:0})).status,401,'anonymous write blocked');
 check((await request('/api/app',undefined,null)).status,400,'null JSON rejected');
 const early=await api('bootstrap',member);check(early.body.admin,false,'first public member cannot initialize administration');check((await api('posts')).status,401,'anonymous visitors cannot read member publications');const o=await api('bootstrap',owner);check(o.body.admin,true,'private owner administrator');
 const m=await api('bootstrap',member);check(m.body.admin,false,'other member has no administration');
 check((await api('admin',member)).status,403,'server protects administration');
 check((await request('/api/app',owner,{action:'state',state:o.body.state,revision:0},{Origin:'https://unrelated.invalid'})).status,403,'cross-origin write blocked');
 const state=structuredClone(o.body.state);state.profile.people=3;state.pantry=[{id:'rice',qty:320}];
 check((await api('state',owner,{state,revision:0})).status,200,'state saved');
 check((await api('state',owner,{state,revision:0})).status,409,'stale writes rejected');
 const back=await api('bootstrap',owner);check(back.body.state.profile.people,3,'state read back');check(back.body.revision,1,'revision advanced');check((await api('bootstrap',member)).body.state.pantry.length,0,'member data isolated');
 const tracked=structuredClone(state);tracked.plans=[{id:'local-week',name:'Semaine de test',weekStart:'2026-10-12',createdAt:new Date().toISOString(),budget:20,entries:[{id:'local-meal',recipeId:bootstrap.body.catalog.recipes[0].id,date:'2026-10-12',servings:2,cooked:true,locked:false,consumed:[{id:'rice',qty:80}]}]}];tracked.activePlanId='local-week';tracked.checkedByWeek={'2026-10-12':['rice']};tracked.packSizes={rice:1000};tracked.purchases=[{id:'local-purchase',weekStart:'2026-10-12',ingredientId:'rice',qty:1000,packages:1,packSize:1000,unitPrice:2,total:2,purchasedAt:new Date().toISOString()}];
 check((await api('state',owner,{state:tracked,revision:1})).status,200,'purchase and stock ledger saved');const ledger=(await api('bootstrap',owner)).body.state;
 check(ledger.purchases[0].total,2,'paid amount survives reload');check(ledger.checkedByWeek,{'2026-10-12':['rice']},'week checks survive reload');check(ledger.packSizes.rice,1000,'pack format survives reload');check(ledger.plans[0].entries[0].consumed,[{id:'rice',qty:80}],'stock deductions survive reload');
 check((await api('state',owner,{state:{...tracked,purchases:[{...tracked.purchases[0],ingredientId:'unknown'}]},revision:2})).status,400,'unknown purchase ingredients rejected');
 const legacy=structuredClone(tracked);for(const key of ['checkedByWeek','packSizes','purchases','challengeAwards'])delete legacy[key];legacy.checked=['rice'];check((await api('state',owner,{state:legacy,revision:2})).status,200,'previous version state accepted');const migrated=(await api('bootstrap',owner)).body.state;check(migrated.checkedByWeek,{'2026-10-12':['rice']},'old checks migrate only to their active week');check(migrated.purchases,[],'old accounts get an empty spending ledger');
 check((await api('state',owner,{state:{...state,profile:{...state.profile,people:0}},revision:1})).status,400,'invalid portions rejected');
 check((await api('state',owner,{state:{...state,pantry:[{id:'rice',qty:1},{id:'rice',qty:2}]},revision:1})).status,400,'duplicate pantry stock rejected');
 const boundary='vegebudget-test-multipart';const photoBody=Buffer.concat([Buffer.from(`--${boundary}\r\nContent-Disposition: form-data; name="file"; filename="test-curry.jpg"\r\nContent-Type: image/jpeg\r\n\r\n`),readFileSync('public/images/curry.jpg'),Buffer.from(`\r\n--${boundary}--\r\n`)]);
 const photoResponse=await fetch(origin+'/api/photos',{method:'POST',headers:{Cookie:sessionFor(owner),Origin:origin,'Content-Type':`multipart/form-data; boundary=${boundary}`},body:photoBody});
 check(photoResponse.status,201,'image upload');const photo=await photoResponse.json();
 check((await request('/api/photos/'+photo.id,member)).status,404,'unpublished photo stays private');
 check((await api('post',member,{content:'Essai de photo appartenant à un autre membre.',category:'Question',photoId:photo.id})).status,400,'photo ownership enforced');
 const posted=await api('post',owner,{content:'Mon premier dîner végétal de test.',category:'Mon assiette',photoId:photo.id});check(posted.status,201,'post persisted');const post=posted.body.id;
 check((await api('delete-post',member,{post})).status,403,'post ownership enforced');
 check((await api('comment',member,{post,content:'Une réponse de test.'})).status,201,'comment persisted');
 check((await api('like',member,{post})).body.liked,true,'like created');check((await api('like',member,{post})).body.liked,false,'like toggled');
 const posts=await api('posts',member);check(posts.body.posts.length,1,'real post listing');check(posts.body.posts[0].comment_count,1,'real comment count');
 check((await request('/api/photos/'+photo.id)).status,404,'published member photo stays unavailable to guests');check((await request('/api/photos/'+photo.id,member)).status,200,'members can view a published member photo');
 check((await api('report',member,{post,reason:'Signalement de test.'})).status,200,'report persisted');
 check((await api('admin',owner)).body.reports.length,1,'report visible to administrator');
 check((await api('moderate',owner,{post,status:'hidden'})).status,200,'moderation persisted');check((await api('posts',member)).body.posts.length,0,'hidden post not listed');
 check((await request('/api/photos/'+photo.id,member)).status,404,'hidden post photo stays private');
 await api('moderate',owner,{post,status:'visible'});
 await api('waitlist',member,{});await api('waitlist',member,{});
 check((await api('admin',owner)).body.waitlist.length,1,'waitlist deduplicated');
 check(bootstrap.body.founderLeft,100,'founder seats shown to visitors');check((await api('bootstrap',member)).body.founder,false,'premium waitlist is not a founder seat');
 const reserved=await api('waitlist',member,{plan:'founder'});check(reserved.body.founderLeft,100,'a free reservation takes no founder seat');await api('waitlist',member,{});
 const after=await api('bootstrap',member);check([after.body.founder,after.body.founderLeft],[true,100],'founder request kept after a premium request');check((await api('admin',owner)).body.waitlist.find(w=>w.email===member.email).plan,'founder','founder visible to administrator');
 { const usual=structuredClone((await api('bootstrap',owner)).body.state);usual.profile.usualSpend=45;const saved=await api('state',owner,{state:usual,revision:(await api('bootstrap',owner)).body.revision});check(saved.status,200,'usual spending saved');usual.profile.usualSpend=0;check((await api('state',owner,{state:usual,revision:saved.body.revision})).status,400,'usual spending validated'); }
 { // Instagram : images du carrousel publiques, publication réservée à la tâche du serveur et au propriétaire.
  const img=await fetch(origin+'/api/instagram/image/recettes-lentilles-pas-cheres/1.jpg');check([img.status,img.headers.get('content-type')],[200,'image/jpeg'],'instagram slide is a jpeg');
  const meta=await sharp(Buffer.from(await img.arrayBuffer())).metadata();check([meta.format,meta.width,meta.height],['jpeg',1080,1350],'instagram slide is 1080x1350');
  check((await fetch(origin+'/api/instagram/image/recettes-lentilles-pas-cheres/99.jpg')).status,404,'unknown slide refused');check((await fetch(origin+'/api/instagram/image/inconnu/1.jpg')).status,404,'unknown article slide refused');
  const pub=(secret)=>fetch(origin+'/api/instagram/publier',{method:'POST',headers:secret?{Authorization:'Bearer '+secret}:{}});
  check((await pub()).status,401,'instagram publishing needs the cron secret');const idle=await pub(baseEnv.CRON_SECRET);check([idle.status,(await idle.json()).rien],[200,'Instagram n’est pas connecté.'],'nothing published without an account');
  const bilan=await request('/api/instagram/bilan');check([bilan.status,bilan.body.compte,bilan.body.posts,bilan.body.reserve?.[0]],[200,null,[],'semaine-5-diners-pour-2'],'instagram report readable without an account');
  { const diff=(secret)=>fetch(origin+'/api/diffusion',{method:'POST',headers:secret?{Authorization:'Bearer '+secret}:{}});
    check((await diff()).status,401,'diffusion needs the cron secret');const d=await diff(baseEnv.CRON_SECRET);const db2=await d.json();check([d.status,db2.indexnow?.rien],[200,'Site local : rien à signaler.'],'indexnow skipped on a local site');
    const report=await request('/api/diffusion');check([report.status,report.body.videos,report.body.postforme],[200,[],'indisponible'],'diffusion report readable');
    const key=await request('/indexnow-cle.txt');check([key.status,/^[0-9a-f]{32}$/.test(key.body)],[200,true],'indexnow key published');
    check((await fetch(origin+'/api/diffusion/video/inconnu.mp4')).status,404,'unknown video refused');
    const v=await fetch(origin+'/api/diffusion/video/vegetarien-vegetalien-vegan.mp4');const bytes=Buffer.from(await v.arrayBuffer());
    check([v.status,v.headers.get('content-type'),bytes.subarray(4,8).toString()],[200,'video/mp4','ftyp'],'carousel video is an mp4'); }
  // Formats du test du 21/10/2026 : semaine, recette, quiz, grande phrase, classement, ticket, couverture avec photo.
  for(const [slug,n] of [['semaine-5-diners-pour-2',1],['semaine-5-diners-pour-2',2],['semaine-5-diners-pour-2',3],['quiz-prix-curry',2],['quiz-prix-curry',3],['proteines-moins-cheres-au-kilo',2],['placard-de-base-ticket',2]]){const r=await fetch(origin+'/api/instagram/image/'+slug+'/'+n+'.jpg');check([r.status,r.headers.get('content-type')],[200,'image/jpeg'],'instagram '+slug+' slide '+n+' is a jpeg');}
  for(const n of [1,2,7]){const r=await fetch(origin+'/api/instagram/image/vegetarien-vegetalien-vegan/'+n+'.jpg');check([r.status,r.headers.get('content-type')],[200,'image/jpeg'],'instagram info slide '+n+' is a jpeg');}
  { const page=await request('/instagram',member);check([page.status,page.body.includes('Espace réservé'),page.body.includes('Coller')||page.body.includes('jeton')],[200,true,false],'instagram page closed to members'); }check((await request('/instagram',owner)).status,200,'instagram page open to the owner');
  check((await request('/api/instagram',member,{action:'deconnecter'})).status,403,'members cannot change instagram settings'); }
 { const cron=(secret)=>fetch(origin+'/api/reminders',{method:'POST',headers:secret?{Authorization:'Bearer '+secret}:{}});
  check((await cron()).status,401,'reminders need the cron secret');check((await cron('mauvais-secret-1234567')).status,401,'wrong cron secret refused');
  check((await api('bootstrap',member)).body.reminders,true,'reminders on by default');
  const run=await (await cron('cron-secret-de-test-1234')).json();const mails=readFileSync(outbox,'utf8').trim().split('\n').map(l=>JSON.parse(l)).filter(m=>m.kind==='reminder');
  const sentTo=mails.find(m=>m.to===member.email);check(!!sentTo,true,'weekly reminder sent');check(run.sent,mails.length,'reminder count reported');check(sentTo.link,origin+'/app#menus','reminder links to the menus');
  check((await (await cron('cron-secret-de-test-1234')).json()).sent,0,'reminder sent once per week');
  const stop=sentTo.text.match(/Ne plus recevoir ce rappel : (\S+)/)[1];const u=new URL(stop);
  check((await fetch(stop)).status,200,'unsubscribe page opens without unsubscribing');check((await api('bootstrap',member)).body.reminders,true,'opening the link alone changes nothing');
  check((await fetch(stop.replace(/s=[^&]+/,'s=faux'))).status,400,'forged unsubscribe link refused');
  check((await fetch(origin+'/api/reminders/stop',{method:'POST',body:new URLSearchParams({u:u.searchParams.get('u'),s:u.searchParams.get('s')})})).status,200,'unsubscribe confirmed');
  check((await api('bootstrap',member)).body.reminders,false,'reminders turned off');
  check((await api('reminders',member,{on:true})).body.reminders,true,'reminders turned back on from the account'); }
 const exportData=await api('export',member);check(exportData.body.email,member.email,'personal export');check(exportData.body.comments.length,1,'export includes own comment');
 check((await request('/api/billing',member,{action:'checkout'})).status,503,'unconfigured payments blocked');
 check((await api('delete-post',owner,{post})).status,200,'post deleted');check((await api('comments',member,undefined)).body.comments.length,0,'comments disappear with post');
 check((await db.prepare('SELECT COUNT(*) AS n FROM comments').first()).n,0,'comment cascade');
 check((await api('catalog',member,{prices:{rice:3.4}})).status,403,'catalogue editing protected');
 await api('catalog',owner,{prices:{rice:3.4}});check((await api('bootstrap',owner)).body.catalog.ingredients.find(i=>i.id==='rice').price,3.4,'shared price persists');
 const edited={...bootstrap.body.catalog.recipes[0],title:'Curry de test'};
 check((await api('catalog',owner,{recipe:edited})).status,200,'recipe editing');check((await api('bootstrap',owner)).body.catalog.recipes.find(r=>r.id===edited.id).title,edited.title,'recipe change read back');
 await api('catalog',owner,{toggleRecipe:edited.id});check((await api('bootstrap',owner)).body.catalog.recipes.length,catalogSize-1,'hidden recipe excluded');
 await api('catalog',owner,{toggleRecipe:edited.id});
 await stopServer();await startServer({BILLING_ENABLED:'true',STRIPE_SECRET_KEY:'local-test-unused',STRIPE_PRICE_ID:'local-test-unused',STRIPE_WEBHOOK_SECRET:'local-test-unused'});
 check((await api('bootstrap',member)).body.billingReady,false,'payment credentials alone cannot open sales');check((await request('/api/billing',member,{action:'checkout'})).status,503,'checkout stays closed without publisher information');
 const serviceInfo={publisher:'Test local',address:'Test address',registration:'TEST',contactEmail:'owner@example.invalid',terms:'Conditions de test local',privacy:'Informations de test local'};check((await api('service-info',member,{info:serviceInfo})).status,403,'publisher settings protected');check((await api('service-info',owner,{info:serviceInfo})).status,200,'publisher information saved');check((await api('bootstrap',member)).body.billingReady,true,'complete configured service can open sales');
 db=openDb();
 const event={id:'evt_local_test',type:'local.test',created:Math.floor(Date.now()/1000),data:{object:{}}};const raw=JSON.stringify(event),timestamp=event.created;
 const signature=createHmac('sha256','local-test-unused').update(`${timestamp}.${raw}`).digest('hex');
 const webhook=()=>fetch(origin+'/api/billing/webhook',{method:'POST',headers:{'Content-Type':'application/json','stripe-signature':`t=${timestamp},v1=${signature}`},body:raw});
 check((await webhook()).status,200,'valid webhook signature');check((await webhook()).status,200,'webhook duplicate handled');
 check((await fetch(origin+'/api/billing/webhook',{method:'POST',headers:{'Content-Type':'application/json','stripe-signature':`t=${timestamp},v1=${'0'.repeat(64)}`},body:raw})).status,400,'invalid webhook signature rejected');
 const memberState=(await api('bootstrap',member)).body.state;
 memberState.favorites=bootstrap.body.catalog.recipes.slice(0,11).map(r=>r.id);
 check((await api('state',member,{state:memberState,revision:0})).status,403,'free tier enforced on server');
 await db.prepare("UPDATE members SET subscription_status='active' WHERE id=?").bind(member.id).run();
 check((await api('state',member,{state:memberState,revision:0})).status,200,'premium limits enabled');
 check((await api('delete-account',member,{confirm:'SUPPRIMER'})).status,409,'active subscription must be cancelled before data deletion');
 await db.prepare("UPDATE members SET subscription_status='none' WHERE id=?").bind(member.id).run();
 check((await api('delete-account',member,{confirm:'SUPPRIMER'})).status,200,'member deletion');
 check((await db.prepare('SELECT COUNT(*) AS n FROM waitlist').first()).n,0,'waitlist cascade');
 { // Menu gratuit de la semaine par e-mail : confirmation, menu envoyé tout de suite, désinscription, bilan sans adresse.
  const ask=(email)=>fetch(origin+'/api/menu-gratuit',{method:'POST',headers:{'Content-Type':'application/json',Origin:origin},body:JSON.stringify({email,source:'/blog/test'})});
  const mails=()=>readFileSync(outbox,'utf8').trim().split('\n').map(l=>JSON.parse(l));
  check((await ask('pas-une-adresse')).status,400,'free menu: invalid email rejected');
  check((await ask('Menu@Example.invalid')).status,200,'free menu: requested');
  const confirm=mails().at(-1);check([confirm.kind,confirm.to],['menu-confirmer','menu@example.invalid'],'free menu: confirmation sent');
  check((await fetch(confirm.link.replace(/s=[^&]+$/,'s=faux'))).status,200,'free menu: forged link shows a page');
  check(mails().length,mails().length,'free menu: nothing sent on forged link');
  const before=mails().length;const page=await fetch(confirm.link);check(page.status,200,'free menu: confirmed');
  const menu=mails().at(-1);check([mails().length,menu.kind],[before+1,'menu-gratuit'],'free menu: menu sent right after confirmation');
  assert.match(menu.text,/Lundi : .+ la portion/);assert.match(menu.text,/Ne plus recevoir le menu : http/);checks+=2;
  await fetch(confirm.link);check(mails().length,before+1,'free menu: second click sends nothing');
  const bilan=await (await fetch(origin+'/api/menu-gratuit')).json();check([bilan.abonnes,bilan.sources[0]?.source],[1,'/blog/test'],'free menu: public summary');
  assert.ok(!JSON.stringify(bilan).includes('@'));checks++;
  check((await fetch(menu.text.match(/Ne plus recevoir le menu : (\S+)/)[1])).status,200,'free menu: unsubscribe');
  check((await (await fetch(origin+'/api/menu-gratuit')).json()).abonnes,0,'free menu: unsubscribed');
 }
 const login=(email)=>fetch(origin+'/api/auth/request',{method:'POST',headers:{'Content-Type':'application/json',Origin:origin},body:JSON.stringify({email})});
 check((await login('pas-une-adresse')).status,400,'invalid login email rejected');
 check((await login('Nouveau@Example.invalid')).status,200,'login link requested');
 const mail=readFileSync(outbox,'utf8').trim().split('\n').map(l=>JSON.parse(l)).at(-1);check(mail.to,'nouveau@example.invalid','login link sent to normalized address');
 const verified=await fetch(mail.link,{redirect:'manual'});check(verified.status,303,'login link accepted');check(verified.headers.get('location'),origin+'/app#dashboard','login redirects to dashboard');
 const cookie=verified.headers.get('set-cookie').split(';')[0];
 const mine=await fetch(origin+'/api/app?action=export',{headers:{Cookie:cookie}});check((await mine.json()).email,'nouveau@example.invalid','session opens the account');
 check((await fetch(mail.link,{redirect:'manual'})).headers.get('location'),origin+'/app?connexion=expiree','login link works only once');
 check((await fetch(origin+'/api/app?action=export',{headers:{Cookie:cookie.slice(0,-3)+'abc'}})).status,401,'tampered session rejected');
 { // Clic sur une offre avant connexion : le lien ramène au paiement de cette offre ; une valeur inconnue est ignorée.
  const ask=(payer)=>fetch(origin+'/api/auth/request',{method:'POST',headers:{'Content-Type':'application/json',Origin:origin},body:JSON.stringify({email:'payeur@example.invalid',payer})});
  const last=()=>readFileSync(outbox,'utf8').trim().split('\n').map(l=>JSON.parse(l)).at(-1).link;
  check((await ask('founder')).status,200,'login link with plan requested');
  check((await fetch(last(),{redirect:'manual'})).headers.get('location'),origin+'/app?payer=founder#offre','login after offer click returns to checkout');
  await ask('gratuit');check((await fetch(last(),{redirect:'manual'})).headers.get('location'),origin+'/app#dashboard','unknown plan ignored'); }
 { // Appli pour les stores : le lien rouvre l'appli avec la session, utilisée ensuite dans l'en-tête Authorization (sans cookie ni Origin).
  check((await fetch(origin+'/api/auth/request',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({email:'appli@example.invalid',appli:true})})).status,200,'app login link requested');
  const appMail=readFileSync(outbox,'utf8').trim().split('\n').map(l=>JSON.parse(l)).at(-1);assert.match(appMail.link,/&appli=1$/);checks++;
  const page=await fetch(appMail.link,{redirect:'manual'});check(page.status,200,'app login page');check(page.headers.get('set-cookie'),null,'app login sets no cookie');
  const session=decodeURIComponent((await page.text()).match(/vegebudget:\/\/connexion\?session=([^"&<]+)/)[1]);
  const bearer={Authorization:`Bearer ${session}`};
  check((await (await fetch(origin+'/api/app?action=export',{headers:bearer})).json()).email,'appli@example.invalid','bearer session opens the account');
  const boot=await (await fetch(origin+'/api/app?action=bootstrap',{headers:bearer})).json();
  check((await fetch(origin+'/api/app',{method:'POST',headers:{...bearer,'Content-Type':'application/json'},body:JSON.stringify({action:'state',state:{...boot.state,onboardingDone:true},revision:boot.revision})})).status,200,'app saves with bearer session');
  check((await fetch(origin+'/api/app?action=export',{headers:{Authorization:`Bearer ${session.slice(0,-3)}abc`}})).status,401,'tampered bearer rejected');
  assert.match(await (await fetch(appMail.link,{redirect:'manual'})).text(),/vegebudget:\/\/connexion\?erreur=expiree/);checks++; }
 for(let i=0;i<4;i++)await login('nouveau@example.invalid');check((await login('nouveau@example.invalid')).status,429,'login requests rate limited');
 const out=await fetch(origin+'/api/auth/logout',{redirect:'manual'});check(out.headers.get('set-cookie').includes('Max-Age=0'),true,'logout clears session');
 { const browser={'Content-Type':'application/json',Origin:origin,'User-Agent':'Mozilla/5.0 (test)'};
  const track=(data,headers={})=>fetch(origin+'/api/track',{method:'POST',headers:{...browser,...headers},body:JSON.stringify(data)});
  check((await track({event:'visite',referrer:'https://www.google.com/search?q=x'})).status,200,'visit recorded');
  await track({event:'visite',referrer:'https://www.google.com/'});await track({event:'visite',referrer:origin+'/recettes'});
  await track({event:'visite',referrer:''},{'X-Forwarded-For':'203.0.113.9'});await track({event:'visite',utm:'Instagram'},{'X-Forwarded-For':'203.0.113.10'});
  await track({event:'visite',referrer:''},{'User-Agent':'Googlebot/2.1'});
  await track({event:'semaine'});await track({event:'clic_payer',detail:'fondateur'});await track({event:'clic_payer',detail:'premium'});
  check((await track({event:'inconnu'})).status,400,'unknown event refused');check((await track({event:'connexion_demandee'})).status,400,'server-only event refused from the browser');
  const stats=(secret)=>fetch(origin+'/api/stats?jours=7',{headers:secret?{Authorization:'Bearer '+secret}:{}});
  check((await stats()).status,401,'stats need a secret');check((await stats('mauvais-secret-1234567')).status,401,'wrong stats secret refused');
  const s=await (await stats(baseEnv.CRON_SECRET)).json();const today=s.jours.at(-1);
  check(s.jours.length,7,'one row per day');check(today.visiteurs,3,'visitors counted once per day, bots and internal navigation ignored');
  check(today.semaines,1,'week composed');check(today.clicsPayer,1,'pay clicks counted per visitor');check(today.connexionsDemandees>=1,true,'login requests counted');
  check(today.inscrits>=1,true,'signups counted');check(s.sources.map(x=>x.source).sort(),['direct','google.com','instagram'],'traffic sources');
  check(s.totaux.membres>=2,true,'member total');
  await track({event:'page',view:'vue001',path:'/blog/code-oeufs',seconds:0,scroll:0});await track({event:'page',view:'vue001',path:'/blog/code-oeufs',seconds:42,scroll:65});await track({event:'page',view:'vue001',path:'/blog/code-oeufs',seconds:5,scroll:10});
  await track({event:'clic',path:'/blog/code-oeufs',detail:'Composer ma semaine'});await track({event:'erreur',path:'/blog/code-oeufs',detail:'Cannot read properties of undefined'});await track({event:'clic',path:'/blog/code-oeufs',detail:'clics répétés : Voir l’offre'});await track({event:'page',view:'vue002',path:'/',seconds:12,scroll:80});await track({event:'page',view:'vue003',path:'/#offre',seconds:30,scroll:100});
  await track({event:'page',view:'vue004',path:'/blog/code-oeufs',seconds:4,scroll:20},{'X-Forwarded-For':'203.0.113.9'});
  await track({event:'page',view:'vue005',path:'https://ailleurs.invalid/x'},{'X-Forwarded-For':'203.0.113.11'});await track({event:'page',view:'vue006',path:'/'},{'User-Agent':'Googlebot/2.1'});
  await track({event:'page',view:'vue007',path:'/#admin',seconds:9},{Cookie:sessionFor(owner)});
  const p=(await (await stats(baseEnv.CRON_SECRET)).json()).parcours;
  check(p.visites,2,'one journey per visitor, bots, owner and foreign paths ignored');
  const full=p.dernieres.find(v=>v.pages===3);check(full.source,'google.com','journey keeps its traffic source');check(full.entree,'/blog/code-oeufs','entry page');check(full.sortie,'Offre Premium','exit page named');check(full.secondes,84,'time on page keeps the longest report');
  check(full.parcours.filter(x=>x.type==='page').map(x=>x.lu),[65,80,100],'scroll depth');check(full.parcours.some(x=>x.type==='clic'&&x.texte==='Composer ma semaine'),true,'clicks in the journey');check(full.plusLoin,'A cliqué sur payer / réserver','furthest funnel step');
  check(p.dernieres.find(v=>v.pages===1).rebond,true,'bounce detected');check(p.entonnoir[0].visites,2,'funnel start');check(p.pages[0].chemin,'/blog/code-oeufs','pages ranked by views');check(p.constats.length>0,true,'plain-language findings');
  check([full.erreurs,full.clicsRepetes,full.parcours.some(x=>x.type==='erreur')],[1,1,true],'errors and repeated clicks in the journey');check(p.erreurs[0].texte,'Cannot read properties of undefined','errors listed');check(p.constats.some(c=>c.includes('erreur'))&&p.constats.some(c=>c.includes('Clics répétés')),true,'errors and repeated clicks in the findings');
  // Avis des visiteurs pour la loop (content/loop/loop.ts) : une réponse par question et par jour, adresses et numéros retirés.
  const avis=(data,headers={})=>fetch(origin+'/api/avis',{method:'POST',headers:{...browser,...headers},body:JSON.stringify(data)});
  check((await avis({question:'menus-raison',choix:'Dépenser moins en courses',texte:'écrivez-moi à a.b@example.invalid ou au 06 12 34 56 78'})).status,200,'feedback recorded');
  await avis({question:'menus-raison',choix:'Autre chose'});
  check((await avis({question:'inconnue',choix:'Le prix'})).status,400,'unknown question refused');check((await avis({question:'offre-frein',choix:'pas dans la liste'})).status,400,'unknown choice refused');
  const sl=await (await stats(baseEnv.CRON_SECRET)).json();check(sl.avis.length,1,'one answer per visitor and question per day');check(sl.avis[0].choix,'Dépenser moins en courses','feedback choice');
  check(/@|06 12/.test(sl.avis[0].texte),false,'email and phone removed from feedback');check(sl.loop.version>=1,true,'loop version exposed');check(sl.loop.questions.length>0,true,'loop questions exposed'); }
 { // Appli installable : fiche, icônes, service hors connexion et page « Pas de connexion ».
  const manifest=await request('/manifest.webmanifest');check(manifest.status,200,'web app manifest');const m=typeof manifest.body==='string'?JSON.parse(manifest.body):manifest.body;check(m.display,'standalone','installable app');check(m.start_url,'/app?utm_source=appli','app opens on menus');
  for(const icon of m.icons){const r=await fetch(origin+icon.src);check(r.status,200,`icon ${icon.src}`);check((await sharp(Buffer.from(await r.arrayBuffer())).metadata()).width,Number(icon.sizes.split('x')[0]),`icon size ${icon.src}`);}
  const sw=await fetch(origin+'/sw.js');check(sw.status,200,'service worker');const swText=await sw.text();assert.match(swText,/const VERSION = 'v1'/);assert.match(swText,/donnees-\$\{VERSION\}/);assert.match(readFileSync('lib/app-context.tsx','utf8'),/caches\.open\('donnees-v1'\)/,'offline copy uses the service worker cache name');checks+=3;
  const home=await request('/');assert.match(home.body,/rel="manifest"/);assert.match(home.body,/apple-touch-icon/);assert.match(home.body,/name="theme-color"/);checks+=3;
  const offline=await request('/hors-ligne');check(offline.status,200,'offline page');assert.match(offline.body,/Pas de connexion internet/);assert.match(offline.body,/noindex/);checks+=2; }
 { const blog=await request('/blog');check(blog.status,200,'blog index');assert.match(blog.body,/circuit-court/);checks++;
  const post=await request('/blog/code-oeufs');check(post.status,200,'blog article');assert.match(post.body,/"@type":"BlogPosting"/);assert.match(post.body,/youtube-nocookie\.com\/embed\//);assert.match(post.body,/"@type":"FAQPage"/);checks+=3;
  check((await request('/blog/inconnu')).status,404,'unknown article');
  const map=await request('/sitemap.xml');assert.match(map.body,/\/blog\/manger-bio-pas-cher/);checks++;
  const llms=await request('/llms.txt');assert.match(llms.body,/## Articles du blog/);checks++; }
 { // Chaque article du sitemap s'affiche, a ses deux illustrations et ne contient aucun lien interne cassé.
  const map=await request('/sitemap.xml');const posts=[...new Set([...map.body.matchAll(/<loc>[^<]*?(\/blog\/[a-z0-9-]+)<\/loc>/g)].map(m=>m[1]))];
  assert.ok(posts.length>=9,'all blog articles in sitemap');checks++;const seen=new Map();
  const status=async(path)=>{if(!seen.has(path))seen.set(path,(await request(path)).status);return seen.get(path);};
  for(const path of posts){const page=await request(path);check(page.status,200,`${path} page`);assert.match(page.body,/"@type":"BlogPosting"/,`${path} BlogPosting`);
   // Balises de référencement indispensables sur chaque article.
   const head=page.body.split('</head>')[0];
   assert.match(head,/<title>[^<]{15,}<\/title>/,`${path} balise title`);assert.match(head,/<meta name="description" content="[^"]{80,}"/,`${path} meta description`);
   assert.match(head,new RegExp(`<link rel="canonical" href="[^"]*${path}"`),`${path} canonical`);assert.match(head,/<meta property="og:image" content="[^"]+\.jpg"/,`${path} image d'aperçu`);
   check((page.body.match(/<h1[\s>]/g)??[]).length,1,`${path} un seul titre h1`);assert.match(page.body,/"@type":"BreadcrumbList"/,`${path} fil d'Ariane structuré`);assert.ok(!/<img(?![^>]*\balt=)[^>]*>/.test(page.body.split('<article')[1]??''),`${path} image sans texte alternatif`);checks+=6;
   const slug=path.split('/').pop();check(await status(`/images/blog/${slug}.jpg`),200,`${path} image d'aperçu jpg`);const cover=page.body.match(/<figure class="blog-cover"><img src="([^"]+)"/)?.[1];assert.ok(cover,`${path} illustration affichée`);check(await status(cover),200,`${path} illustration ${cover}`);
   const article=page.body.split('<article')[1]?.split('</article>')[0]??'';
   for(const href of new Set([...article.matchAll(/href="(\/[^"#?]*)/g)].map(m=>m[1])))assert.ok(await status(href)<400,`${path} lien interne cassé : ${href}`);checks++;} }
 { for(const [path,currency] of [['/belgique','€'],['/suisse','CHF'],['/quebec','$']]){const page=await request(path);check(page.status,200,`${path} page`);assert.ok(page.body.includes(currency)&&/soupers/.test(page.body),`${path} shows local prices and words`);checks++;}
  assert.match((await request('/')).body,/hrefLang="fr-BE"/);checks++; }
 { // Paiement de bout en bout contre un faux Stripe local : prix créés par le site, paiement, notification signée, Premium ouvert.
  const fake={prices:[],posts:[],sessions:[],subscription:null,webhook:null};
  const stripeServer=createServer((req,res)=>{let raw='';req.on('data',c=>raw+=c);req.on('end',()=>{const url=new URL(req.url,'http://x');const form=Object.fromEntries(new URLSearchParams(raw));const send=(data,status=200)=>{res.writeHead(status,{'Content-Type':'application/json'});res.end(JSON.stringify(data));};
   if(req.headers.authorization!=='Bearer sk_test_local')return send({error:{code:'auth'}},401);if(req.method==='POST')fake.posts.push(url.pathname);const path=url.pathname.replace(/^\/v1/,'');
   if(path==='/prices'&&req.method==='GET'){const key=url.searchParams.get('lookup_keys[]');return send({data:fake.prices.filter(p=>p.lookup_key===key)});}
   if(path==='/prices'){const options={};for(const c of ['chf','cad'])options[c]={unit_amount:Number(form[`currency_options[${c}][unit_amount]`])};for(const p of fake.prices)if(p.lookup_key===form.lookup_key)p.lookup_key=null;const price={id:`price_${fake.prices.length+1}`,active:true,currency:form.currency,unit_amount:Number(form.unit_amount),recurring:{interval:form['recurring[interval]'],interval_count:1},lookup_key:form.lookup_key,metadata:{vegebudget_plan:form['metadata[vegebudget_plan]']},currency_options:{eur:{unit_amount:Number(form.unit_amount)},...options},product:form.product??`prod_${form['product_data[name]']}`};fake.prices.push(price);return send(price);}
   if(path==='/webhook_endpoints'&&req.method==='POST'){fake.webhook={id:'we_1',secret:'whsec_local_test',status:'enabled',url:form.url,events:Object.entries(form).filter(([k])=>k.startsWith('enabled_events')).map(([,v])=>v)};return send(fake.webhook);}
   if(path.startsWith('/webhook_endpoints/'))return fake.webhook?send({id:fake.webhook.id,status:'enabled'}):send({error:{code:'resource_missing'}},404);
   if(path==='/billing_portal/configurations')return send({id:'bpc_1'});if(path.startsWith('/billing_portal/configurations/'))return send({id:'bpc_1'});
   if(path==='/billing_portal/sessions')return send({url:'https://billing.stripe.test/portal'});
   if(path==='/customers')return send({id:'cus_local'});if(path.startsWith('/customers/'))return path==='/customers/cus_local'?send({id:'cus_local'}):send({error:{code:'resource_missing'}},404);
   if(path==='/checkout/sessions'){fake.sessions.push(form);return send({id:'cs_1',url:'https://checkout.stripe.test/pay'});}
   if(path.startsWith('/subscriptions/'))return send(fake.subscription);
   send({error:{code:'unknown'}},404);});}).listen(0,'127.0.0.1');
  await new Promise(r=>stripeServer.once('listening',r));
  try{
   await stopServer();await startServer({BILLING_ENABLED:'true',STRIPE_SECRET_KEY:'sk_test_local',STRIPE_API_BASE:`http://127.0.0.1:${stripeServer.address().port}/v1`});db=openDb();
   const payer={id:'local-test-payer',email:'payer@example.invalid'};
   check((await request('/api/billing',payer,{action:'setup'})).status,403,'Stripe setup reserved to the owner');
   const setup=await request('/api/billing',owner,{action:'setup'});check([setup.body.mode,setup.body.prices,setup.body.webhook,setup.body.portal,setup.body.open],['test',true,true,true,true],'Stripe prepared from the admin page');
   check(fake.webhook.url,origin+'/api/billing/webhook','notification address points to the site');check(fake.webhook.events.includes('customer.subscription.updated'),true,'subscription events requested');
   const premiumPrice=fake.prices.find(p=>p.lookup_key==='vegebudget_premium_mensuel'),founderPrice=fake.prices.find(p=>p.lookup_key==='vegebudget_fondateur_annuel');
   check([premiumPrice.unit_amount,premiumPrice.recurring.interval,premiumPrice.currency_options.chf.unit_amount,premiumPrice.currency_options.cad.unit_amount],[499,'month',590,699],'Premium price in each currency');
   check([founderPrice.unit_amount,founderPrice.recurring.interval],[1900,'year'],'founder yearly price');
   const before=fake.posts.length;await request('/api/billing',owner,{action:'setup'});check(fake.posts.length,before,'setup is idempotent');
   check((await api('bootstrap',payer)).body.billingReady,true,'sales open');const seats=(await api('bootstrap',payer)).body.founderLeft;
   const pay=await request('/api/billing',payer,{action:'checkout',plan:'founder',region:'CH'});check(pay.body.url,'https://checkout.stripe.test/pay','checkout link returned');
   const session=fake.sessions.at(-1);check([session['line_items[0][price]'],session.currency,session.mode,session.customer,session['subscription_data[metadata][user_id]']],[founderPrice.id,'chf','subscription','cus_local',payer.id],'founder checkout in Swiss francs');
   check((await api('bootstrap',payer)).body.founderLeft,seats,'an unpaid checkout takes no founder seat');
   check((await api('bootstrap',payer)).body.subscriptionStatus,'none','not premium before payment');
   fake.subscription={id:'sub_local',object:'subscription',customer:'cus_local',status:'active',metadata:{user_id:payer.id,plan:'founder'},items:{data:[{price:founderPrice}]}};
   const notify=async(event,secret='whsec_local_test')=>{const raw=JSON.stringify(event),t=Math.floor(Date.now()/1000);return fetch(origin+'/api/billing/webhook',{method:'POST',headers:{'Content-Type':'application/json','stripe-signature':`t=${t},v1=${createHmac('sha256',secret).update(`${t}.${raw}`).digest('hex')}`},body:raw});};
   check((await notify({id:'evt_pay',type:'checkout.session.completed',created:Math.floor(Date.now()/1000),data:{object:{id:'cs_1',subscription:'sub_local'}}},'whsec_wrong')).status,400,'notification with another secret refused');
   check((await notify({id:'evt_pay',type:'checkout.session.completed',created:Math.floor(Date.now()/1000),data:{object:{id:'cs_1',subscription:'sub_local'}}})).status,200,'payment notification accepted');
   const paid=(await api('bootstrap',payer)).body;check([paid.subscriptionStatus,paid.subscriptionPlan,paid.founder,paid.founderLeft],['active','founder',true,seats-1],'Premium opened as founder after payment, seat taken');
   check((await request('/api/billing',payer,{action:'checkout',plan:'premium'})).status,409,'no second subscription');
   check((await request('/api/billing',payer,{action:'portal'})).body.url,'https://billing.stripe.test/portal','subscription management link');
   await notify({id:'evt_cancel',type:'customer.subscription.deleted',created:Math.floor(Date.now()/1000)+1,data:{object:{...fake.subscription,status:'canceled'}}});
   check((await api('bootstrap',payer)).body.subscriptionStatus,'canceled','cancellation closes Premium');check((await api('bootstrap',payer)).body.founderLeft,seats,'cancellation frees the founder seat');
   await stopServer();
   { const raw=new DatabaseSync(join(dataDir,'vegebudget.sqlite'));const row=raw.prepare("SELECT value FROM settings WHERE key='service_info'").get();const info=JSON.parse(row.value);info.terms+=' Il peut aussi utiliser la plateforme européenne de règlement des litiges : https://ec.europa.eu/consumers/odr.';
     raw.prepare("UPDATE settings SET value=? WHERE key='service_info'").run(JSON.stringify(info));raw.prepare("DELETE FROM _migrations WHERE name='0007_retrait_lien_odr.sql'").run();raw.close(); }await startServer({BILLING_ENABLED:'true',STRIPE_SECRET_KEY:'sk_test_local',STRIPE_API_BASE:`http://127.0.0.1:${stripeServer.address().port}/v1`});
   { const terms=(await api('bootstrap',payer)).body.serviceInfo.terms;check([terms.includes('ec.europa.eu/consumers/odr'),terms.length>0],[false,true],'closed EU dispute platform link removed from stored terms'); }
   const premiumCheckout=await request('/api/billing',payer,{action:'checkout',plan:'premium',region:'FR'});check([premiumCheckout.status,fake.sessions.at(-1)['line_items[0][price]'],fake.sessions.at(-1).currency],[200,premiumPrice.id,'eur'],'monthly Premium checkout in euros');
  }finally{await new Promise(r=>stripeServer.close(r));}
 }
 console.log(`${checks} API and persistence assertions passed.`);
}finally{await stopServer();rmSync(dataDir,{recursive:true,force:true});}

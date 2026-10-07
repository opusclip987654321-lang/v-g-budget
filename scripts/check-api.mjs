import assert from 'node:assert/strict';
import {readFileSync,mkdtempSync,rmSync} from 'node:fs';
import {tmpdir} from 'node:os';
import {join} from 'node:path';
import {spawn} from 'node:child_process';
import {createHmac} from 'node:crypto';
import {DatabaseSync} from 'node:sqlite';

// Lance le site construit (next start) avec une base et un dossier de photos
// temporaires. Aucun service déployé, compte réel ni prestataire de paiement n'est contacté.
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
 const page=await request('/');check(page.status,200,'server render');assert.match(page.body,/VégéBudget/);checks++;
 const bootstrap=await api('bootstrap');check(bootstrap.status,200,'anonymous bootstrap');check(bootstrap.body.catalog.recipes.length,24,'initial catalogue');check(bootstrap.body.billingReady,false,'billing closed');
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
 const reserved=await api('waitlist',member,{plan:'founder'});check(reserved.body.founderLeft,99,'founder seat reserved');await api('waitlist',member,{});
 const after=await api('bootstrap',member);check([after.body.founder,after.body.founderLeft],[true,99],'founder seat kept after a premium request');check((await api('admin',owner)).body.waitlist.find(w=>w.email===member.email).plan,'founder','founder visible to administrator');
 { const usual=structuredClone((await api('bootstrap',owner)).body.state);usual.profile.usualSpend=45;const saved=await api('state',owner,{state:usual,revision:(await api('bootstrap',owner)).body.revision});check(saved.status,200,'usual spending saved');usual.profile.usualSpend=0;check((await api('state',owner,{state:usual,revision:saved.body.revision})).status,400,'usual spending validated'); }
 { const cron=(secret)=>fetch(origin+'/api/reminders',{method:'POST',headers:secret?{Authorization:'Bearer '+secret}:{}});
  check((await cron()).status,401,'reminders need the cron secret');check((await cron('mauvais-secret-1234567')).status,401,'wrong cron secret refused');
  check((await api('bootstrap',member)).body.reminders,true,'reminders on by default');
  const run=await (await cron('cron-secret-de-test-1234')).json();const mails=readFileSync(outbox,'utf8').trim().split('\n').map(l=>JSON.parse(l)).filter(m=>m.kind==='reminder');
  const sentTo=mails.find(m=>m.to===member.email);check(!!sentTo,true,'weekly reminder sent');check(run.sent,mails.length,'reminder count reported');check(sentTo.link,origin+'/#menus','reminder links to the menus');
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
 await api('catalog',owner,{toggleRecipe:edited.id});check((await api('bootstrap',owner)).body.catalog.recipes.length,23,'hidden recipe excluded');
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
 const login=(email)=>fetch(origin+'/api/auth/request',{method:'POST',headers:{'Content-Type':'application/json',Origin:origin},body:JSON.stringify({email})});
 check((await login('pas-une-adresse')).status,400,'invalid login email rejected');
 check((await login('Nouveau@Example.invalid')).status,200,'login link requested');
 const mail=readFileSync(outbox,'utf8').trim().split('\n').map(l=>JSON.parse(l)).at(-1);check(mail.to,'nouveau@example.invalid','login link sent to normalized address');
 const verified=await fetch(mail.link,{redirect:'manual'});check(verified.status,303,'login link accepted');check(verified.headers.get('location'),origin+'/#dashboard','login redirects to dashboard');
 const cookie=verified.headers.get('set-cookie').split(';')[0];
 const mine=await fetch(origin+'/api/app?action=export',{headers:{Cookie:cookie}});check((await mine.json()).email,'nouveau@example.invalid','session opens the account');
 check((await fetch(mail.link,{redirect:'manual'})).headers.get('location'),origin+'/?connexion=expiree','login link works only once');
 check((await fetch(origin+'/api/app?action=export',{headers:{Cookie:cookie.slice(0,-3)+'abc'}})).status,401,'tampered session rejected');
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
  check(s.totaux.membres>=2,true,'member total'); }
 console.log(`${checks} API and persistence assertions passed.`);
}finally{await stopServer();rmSync(dataDir,{recursive:true,force:true});}

import { ApiError,runtime,db,readSetting,writeSetting } from './server';
import { REGIONS,isRegion,type RegionCode } from './region';
import { FOUNDER_SEATS } from './pricing';
// Appels à Stripe. STRIPE_API_BASE ne sert qu'aux vérifications locales (faux Stripe de scripts/check-api.mjs).
const base=()=>(process.env.STRIPE_API_BASE||'https://api.stripe.com/v1').replace(/\/$/,'');
async function call(path:string,method='GET',values?:Record<string,string>,idempotency?:string){
 const key=runtime().STRIPE_SECRET_KEY;if(!key)throw new ApiError(503,'Les abonnements ne sont pas encore ouverts.');
 const headers:Record<string,string>={Authorization:`Bearer ${key}`};if(values)headers['Content-Type']='application/x-www-form-urlencoded';if(idempotency)headers['Idempotency-Key']=idempotency;
 const response=await fetch(`${base()}${path}`,{method,headers,body:values?new URLSearchParams(values):undefined});const data=await response.json().catch(()=>({})) as Record<string,any>;return {response,data};
}
export async function stripe(path:string,method='GET',values?:Record<string,string>,idempotency?:string):Promise<Record<string,any>>{
 const {response,data}=await call(path,method,values,idempotency);
 if(!response.ok){console.error('Billing provider request failed',response.status,data.error?.code,data.error?.message);throw new ApiError(502,'Le service de paiement est momentanément indisponible. Réessayez.');}return data;
}
// Même appel, mais un objet introuvable (supprimé, ou créé dans l'autre mode test/réel) renvoie null.
export async function stripeOptional(path:string){const {response,data}=await call(path);if(response.status===404||data.deleted)return null;if(!response.ok){console.error('Billing provider request failed',response.status,data.error?.code);throw new ApiError(502,'Le service de paiement est momentanément indisponible. Réessayez.');}return data;}
export const stripeMode=()=>/^(sk|rk)_live_/.test(runtime().STRIPE_SECRET_KEY??'')?'live':'test';

// Les deux offres. Les prix sont créés dans Stripe par le site lui-même, à partir des montants de lib/region.ts :
// prix de base en euros, plus un montant en francs suisses et en dollars canadiens.
export type Plan='premium'|'founder';
export const PLANS:Record<Plan,{lookup:string;interval:'month'|'year';name:string;amount:(r:RegionCode)=>number}>={
 premium:{lookup:'vegebudget_premium_mensuel',interval:'month',name:'VégéBudget Premium',amount:r=>REGIONS[r].premium.cents},
 founder:{lookup:'vegebudget_fondateur_annuel',interval:'year',name:'VégéBudget Membre fondateur',amount:r=>REGIONS[r].founder.cents},
};
const extraCurrencies:[string,RegionCode][]=[['chf','CH'],['cad','QC']];
// Offre d'un prix Stripe : un ancien prix garde son étiquette même quand le montant a changé depuis (abonnés existants).
export function planForPrice(price:{lookup_key?:string|null;metadata?:Record<string,string>}|undefined):Plan|null{const tag=price?.metadata?.vegebudget_plan;if(tag==='premium'||tag==='founder')return tag;return price?.lookup_key===PLANS.premium.lookup?'premium':price?.lookup_key===PLANS.founder.lookup?'founder':null;}
function priceMatches(price:Record<string,any>,plan:Plan){
 const p=PLANS[plan];if(!price.active||price.currency!=='eur'||price.unit_amount!==p.amount('FR')||price.recurring?.interval!==p.interval||price.recurring?.interval_count!==1)return false;
 return extraCurrencies.every(([currency,r])=>price.currency_options?.[currency]?.unit_amount===p.amount(r));
}
// Renvoie l'identifiant du prix Stripe de l'offre ; le crée (ou le remplace si le montant a changé dans le code).
export async function ensurePrice(plan:Plan){
 const p=PLANS[plan];const found=await stripe(`/prices?active=true&limit=1&lookup_keys[]=${p.lookup}&expand[]=data.currency_options`);
 const current=found.data?.[0];if(current&&priceMatches(current,plan))return current.id as string;
 const values:Record<string,string>={currency:'eur',unit_amount:String(p.amount('FR')),'recurring[interval]':p.interval,lookup_key:p.lookup,transfer_lookup_key:'true',tax_behavior:'inclusive','metadata[vegebudget_plan]':plan};
 if(current?.product)values.product=typeof current.product==='string'?current.product:current.product.id;else values['product_data[name]']=p.name;
 for(const [currency,r] of extraCurrencies){values[`currency_options[${currency}][unit_amount]`]=String(p.amount(r));values[`currency_options[${currency}][tax_behavior]`]='inclusive';}
 const created=await stripe('/prices','POST',values,`vegebudget-price-${p.lookup}-${values.unit_amount}-${extraCurrencies.map(([c,r])=>c+p.amount(r)).join('-')}`);return created.id as string;
}

// Adresse de notification de Stripe : créée par le site, son secret de signature est gardé dans la base.
export const WEBHOOK_EVENTS=['checkout.session.completed','customer.subscription.created','customer.subscription.updated','customer.subscription.deleted','invoice.paid','invoice.payment_failed'];
type Webhook={id:string;secret:string;url:string};
export async function ensureWebhook(origin:string){
 const key=`stripe_webhook_${stripeMode()}`,url=`${origin.replace(/\/$/,'')}/api/billing/webhook`;const saved=await readSetting<Webhook|null>(key,null);
 if(saved&&saved.url===url){const live=await stripeOptional(`/webhook_endpoints/${encodeURIComponent(saved.id)}`);if(live&&live.status!=='disabled')return saved;}
 if(saved)await call(`/webhook_endpoints/${encodeURIComponent(saved.id)}`,'DELETE').catch(()=>{});
 const values:Record<string,string>={url,description:'VégéBudget : activation des abonnements'};WEBHOOK_EVENTS.forEach((e,i)=>values[`enabled_events[${i}]`]=e);
 const created=await stripe('/webhook_endpoints','POST',values,`vegebudget-webhook-${stripeMode()}-${url}-${saved?.id??'first'}`);
 const next={id:created.id,secret:created.secret,url};if(!next.secret)throw new ApiError(502,'Stripe n’a pas renvoyé le secret de notification.');await writeSetting(key,next);return next;
}
// Secrets acceptés pour vérifier une notification : celui du fichier .env s'il existe, puis ceux créés par le site.
export async function webhookSecrets(){const list=[runtime().STRIPE_WEBHOOK_SECRET];for(const mode of ['live','test'])list.push((await readSetting<Webhook|null>(`stripe_webhook_${mode}`,null))?.secret);return list.filter((s):s is string=>!!s);}

// Page Stripe où l'abonné gère sa carte, ses factures et sa résiliation.
export async function ensurePortal(origin:string){
 const key=`stripe_portal_${stripeMode()}`;const saved=await readSetting<string|null>(key,null);if(saved&&await stripeOptional(`/billing_portal/configurations/${encodeURIComponent(saved)}`))return saved;
 const created=await stripe('/billing_portal/configurations','POST',{'business_profile[headline]':'VégéBudget : votre abonnement','default_return_url':`${origin}/app#compte`,'features[invoice_history][enabled]':'true','features[payment_method_update][enabled]':'true','features[customer_update][enabled]':'true','features[customer_update][allowed_updates][0]':'email','features[subscription_cancel][enabled]':'true','features[subscription_cancel][mode]':'at_period_end','features[subscription_cancel][cancellation_reason][enabled]':'true','features[subscription_cancel][cancellation_reason][options][0]':'too_expensive','features[subscription_cancel][cancellation_reason][options][1]':'unused','features[subscription_cancel][cancellation_reason][options][2]':'missing_features','features[subscription_cancel][cancellation_reason][options][3]':'other'},`vegebudget-portal-${stripeMode()}-${origin}`);
 await writeSetting(key,created.id);return created.id as string;
}

// Places de membre fondateur : seul un abonnement fondateur payé (actif, ou en attente d'un renouvellement) en prend une.
// Un paiement abandonné ne bloque donc aucune place.
export async function founderLeft(){const row=await db().prepare("SELECT COUNT(*) AS count FROM members WHERE subscription_plan='founder' AND subscription_status IN ('active','trialing','past_due')").first<{count:number}>();return Math.max(0,FOUNDER_SEATS-Number(row?.count??0));}
export async function holdFounderSeat(userId:string){
 const current=await db().prepare('SELECT plan FROM waitlist WHERE owner=?').bind(userId).first<{plan:string}>();if(current?.plan==='founder')return;
 if(await founderLeft()<=0)throw new ApiError(409,'Toutes les places de membre fondateur sont prises. L’offre Premium reste ouverte.');
 await db().prepare("INSERT INTO waitlist (owner,created_at,plan) VALUES (?,?,'founder') ON CONFLICT(owner) DO UPDATE SET plan='founder'").bind(userId,new Date().toISOString()).run();
}
export const currencyFor=(code:unknown)=>REGIONS[isRegion(code)?code:'FR'].currency.toLowerCase();

export async function verifySignature(payload:string,header:string,secret:string,now=Date.now()){
 const segments=header.split(',').map(x=>x.trim());const timestamp=segments.find(s=>s.startsWith('t='))?.slice(2);const signatures=segments.filter(s=>s.startsWith('v1=')).map(s=>s.slice(3));
 if(!timestamp||!/^\d+$/.test(timestamp)||Math.abs(now/1000-Number(timestamp))>300)return false;
 const encoder=new TextEncoder();const key=await crypto.subtle.importKey('raw',encoder.encode(secret),{name:'HMAC',hash:'SHA-256'},false,['sign']);const bytes=new Uint8Array(await crypto.subtle.sign('HMAC',key,encoder.encode(`${timestamp}.${payload}`)));const expected=Array.from(bytes,b=>b.toString(16).padStart(2,'0')).join('');
 return signatures.some(value=>{if(value.length!==expected.length)return false;let different=0;for(let j=0;j<value.length;j++)different|=value.charCodeAt(j)^expected.charCodeAt(j);return different===0;});
}

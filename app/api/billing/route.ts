import { db,currentUser,memberFor,runtime,billingReady,commerceReady,body,json,failure,ApiError,adminUser,serviceInfo,siteOrigin } from '@/lib/server';
import { stripe,stripeOptional,stripeMode,ensurePrice,ensureWebhook,ensurePortal,holdFounderSeat,currencyFor,type Plan } from '@/lib/billing';
import { serviceComplete } from '@/lib/service-info';
export const dynamic='force-dynamic';
export async function POST(request:Request){try{
 const input=await body(request),origin=siteOrigin(request);
 // Espace de gestion : prépare Stripe (prix, adresse de notification, page d'abonnement) et dit ce qui manque.
 if(input.action==='setup'){
  await adminUser();const c=runtime();const status={enabled:c.BILLING_ENABLED==='true',key:!!c.STRIPE_SECRET_KEY,mode:c.STRIPE_SECRET_KEY?stripeMode():null,legal:serviceComplete(await serviceInfo()),prices:false,webhook:false,portal:false,open:false,error:''};
  if(status.key){try{await ensurePrice('premium');await ensurePrice('founder');status.prices=true;await ensureWebhook(origin);status.webhook=true;await ensurePortal(origin);status.portal=true;}catch(e){status.error=e instanceof ApiError?e.message:'Stripe ne répond pas.';}}
  status.open=await commerceReady();return json(status);
 }
 const user=await currentUser(),member=await memberFor(user);
 if((input.action==='checkout'&&!await commerceReady())||!billingReady())throw new ApiError(503,'Les abonnements ouvrent prochainement. Vous pouvez demander à être prévenu.');
 if(input.action==='portal'){
  if(!member.customer)throw new ApiError(400,'Aucun abonnement à gérer.');const session=await stripe('/billing_portal/sessions','POST',{customer:member.customer,configuration:await ensurePortal(origin),return_url:`${origin}/#compte`,locale:'fr'});return json({url:session.url});
 }
 if(input.action!=='checkout')throw new ApiError(400,'Action inconnue.');if(['active','trialing','past_due'].includes(member.subscription_status))throw new ApiError(409,'Vous possédez déjà un abonnement. Gérez-le depuis Mon compte.');
 const plan:Plan=input.plan==='founder'?'founder':'premium';
 const price=await ensurePrice(plan);await ensureWebhook(origin);if(plan==='founder')await holdFounderSeat(user.userId);
 // Client Stripe : on en recrée un si l'ancien n'existe plus (par exemple créé en mode test avant le passage en réel).
 let customer=member.customer;if(customer&&!await stripeOptional(`/customers/${encodeURIComponent(customer)}`))customer=null;
 if(!customer){const created=await stripe('/customers','POST',{email:member.email,'metadata[user_id]':user.userId},`vegebudget-customer-${stripeMode()}-${user.userId}`);customer=created.id as string;await db().prepare('UPDATE members SET customer=? WHERE id=?').bind(customer,user.userId).run();}
 const session=await stripe('/checkout/sessions','POST',{mode:'subscription',customer,'line_items[0][price]':price,'line_items[0][quantity]':'1',currency:currencyFor(input.region),locale:'fr',client_reference_id:user.userId,'metadata[user_id]':user.userId,'metadata[plan]':plan,'subscription_data[metadata][user_id]':user.userId,'subscription_data[metadata][plan]':plan,'custom_text[submit][message]':plan==='founder'?'Membre fondateur : ce prix annuel ne changera jamais. Premium est ouvert tout de suite ; vous pouvez arrêter le renouvellement à tout moment depuis Mon compte.':'Premium est ouvert tout de suite. Résiliation en deux clics à tout moment depuis Mon compte.',success_url:`${origin}/?paiement=retour#compte`,cancel_url:`${origin}/?paiement=annule#offre`});
 return json({url:session.url});
}catch(e){return failure(e);}}

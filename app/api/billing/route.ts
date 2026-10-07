import { db,currentUser,memberFor,runtime,billingReady,commerceReady,body,json,failure,ApiError } from '@/lib/server';
import { stripe } from '@/lib/billing';
import { PREMIUM_PRICE_CENTS } from '@/lib/pricing';
export const dynamic='force-dynamic';
export async function POST(request:Request){try{
 const input=await body(request),user=await currentUser(),member=await memberFor(user);
 if((input.action==='checkout'&&!await commerceReady())||!billingReady())throw new ApiError(503,'Les abonnements ouvrent prochainement. Vous pouvez demander à être prévenu.');
 const origin=runtime().SITE_ORIGIN??new URL(request.url).origin;
 if(input.action==='portal'){
  if(!member.customer)throw new ApiError(400,'Aucun abonnement à gérer.');const session=await stripe('/billing_portal/sessions','POST',{customer:member.customer,return_url:`${origin}/#compte`});return json({url:session.url});
 }
 if(input.action!=='checkout')throw new ApiError(400,'Action inconnue.');if(['active','trialing'].includes(member.subscription_status))throw new ApiError(409,'Vous possédez déjà un abonnement.');
 const price=await stripe(`/prices/${encodeURIComponent(runtime().STRIPE_PRICE_ID!)}`);if(price.unit_amount!==PREMIUM_PRICE_CENTS||price.currency!=='eur'||price.recurring?.interval!=='month'||price.recurring?.interval_count!==1)throw new ApiError(503,'L’offre est en cours de finalisation. Aucun paiement ne sera lancé.');
 let customer=member.customer;if(!customer){const created=await stripe('/customers','POST',{email:member.email,'metadata[user_id]':user.userId},`vegebudget-customer-${user.userId}`);customer=created.id;await db().prepare('UPDATE members SET customer=? WHERE id=?').bind(customer,user.userId).run();}
 const session=await stripe('/checkout/sessions','POST',{mode:'subscription',customer:customer!,'line_items[0][price]':runtime().STRIPE_PRICE_ID!,'line_items[0][quantity]':'1',client_reference_id:user.userId,'metadata[user_id]':user.userId,'subscription_data[metadata][user_id]':user.userId,success_url:`${origin}/?paiement=retour#compte`,cancel_url:`${origin}/?paiement=annule#offre`});
 return json({url:session.url});
}catch(e){return failure(e);}}

import { db,runtime,json,failure,ApiError } from '@/lib/server';
import { stripe,verifySignature } from '@/lib/billing';
export const dynamic='force-dynamic';
export async function POST(request:Request){try{
 const secret=runtime().STRIPE_WEBHOOK_SECRET;if(!secret)return json({error:'Webhook non configuré.'},503);
 if(Number(request.headers.get('content-length')??0)>1000000)return json({error:'Événement trop volumineux.'},413);const raw=await request.text();if(raw.length>1000000)return json({error:'Événement trop volumineux.'},413);
 if(!await verifySignature(raw,request.headers.get('stripe-signature')??'',secret))return json({error:'Signature invalide.'},400);
 const event=JSON.parse(raw);if(typeof event.id!=='string'||typeof event.type!=='string')throw new ApiError(400,'Événement invalide.');
 if(await db().prepare('SELECT id FROM billing_events WHERE id=?').bind(event.id).first())return json({received:true});
 if(['customer.subscription.created','customer.subscription.updated','customer.subscription.deleted','invoice.paid','invoice.payment_failed'].includes(event.type)){
  const object=event.data.object;const subscriptionId=event.type.startsWith('customer.subscription.')?object.id:(object.subscription??object.parent?.subscription_details?.subscription);
  if(subscriptionId){const sub=event.type==='customer.subscription.deleted'?object:await stripe(`/subscriptions/${encodeURIComponent(subscriptionId)}`);const customer=typeof sub.customer==='string'?sub.customer:sub.customer?.id;const uid=sub.metadata?.user_id;
   const member=await db().prepare('SELECT id,customer,subscription,billing_event_time FROM members WHERE customer=?').bind(customer??'').first<{id:string;customer:string;subscription:string|null;billing_event_time:number}>();
   const configuredPrice=runtime().STRIPE_PRICE_ID;
   const matchingPrice=!!configuredPrice&&sub.items?.data?.some((item:{price?:{id?:string}})=>item.price?.id===configuredPrice);
   const supersededDeletion=event.type==='customer.subscription.deleted'&&member?.subscription&&member.subscription!==subscriptionId;
   if(member&&(!uid||uid===member.id)&&matchingPrice&&!supersededDeletion)await db().prepare('UPDATE members SET subscription=?,subscription_status=?,billing_event_time=? WHERE id=? AND billing_event_time<=?').bind(subscriptionId,sub.status,Number(event.created)||0,member.id,Number(event.created)||0).run();
  }
 }
 await db().prepare('INSERT INTO billing_events (id,created_at) VALUES (?,?) ON CONFLICT(id) DO NOTHING').bind(event.id,new Date().toISOString()).run();return json({received:true});
}catch(e){return failure(e);}}

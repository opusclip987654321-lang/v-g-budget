import { db,json,failure,ApiError } from '@/lib/server';
import { stripe,verifySignature,webhookSecrets,planForPrice } from '@/lib/billing';
export const dynamic='force-dynamic';
export async function POST(request:Request){try{
 const secrets=await webhookSecrets();if(!secrets.length)return json({error:'Webhook non configuré.'},503);
 if(Number(request.headers.get('content-length')??0)>1000000)return json({error:'Événement trop volumineux.'},413);const raw=await request.text();if(raw.length>1000000)return json({error:'Événement trop volumineux.'},413);
 const header=request.headers.get('stripe-signature')??'';let valid=false;for(const secret of secrets)if(await verifySignature(raw,header,secret)){valid=true;break;}
 if(!valid)return json({error:'Signature invalide.'},400);
 const event=JSON.parse(raw);if(typeof event.id!=='string'||typeof event.type!=='string')throw new ApiError(400,'Événement invalide.');
 if(await db().prepare('SELECT id FROM billing_events WHERE id=?').bind(event.id).first())return json({received:true});
 if(['checkout.session.completed','customer.subscription.created','customer.subscription.updated','customer.subscription.deleted','invoice.paid','invoice.payment_failed'].includes(event.type)){
  const object=event.data.object;const subscriptionId=event.type.startsWith('customer.subscription.')?object.id:(object.subscription??object.parent?.subscription_details?.subscription);
  if(typeof subscriptionId==='string'){const sub=event.type==='customer.subscription.deleted'?object:await stripe(`/subscriptions/${encodeURIComponent(subscriptionId)}`);const customer=typeof sub.customer==='string'?sub.customer:sub.customer?.id;const uid=sub.metadata?.user_id;
   const member=await db().prepare('SELECT id,customer,subscription,billing_event_time FROM members WHERE customer=?').bind(customer??'').first<{id:string;customer:string;subscription:string|null;billing_event_time:number}>();
   const plan=(sub.items?.data??[]).map((item:{price?:{lookup_key?:string;metadata?:Record<string,string>}})=>planForPrice(item.price)).find(Boolean);
   const supersededDeletion=event.type==='customer.subscription.deleted'&&member?.subscription&&member.subscription!==subscriptionId;
   // Le statut de l'abonnement (active, trialing) ouvre Premium ; un événement plus ancien que le dernier traité est ignoré.
   const at=Number(event.created)||0;
   if(member&&(!uid||uid===member.id)&&plan&&!supersededDeletion){
    await db().prepare('UPDATE members SET subscription=?,subscription_status=?,subscription_plan=?,billing_event_time=? WHERE id=? AND billing_event_time<=?').bind(subscriptionId,sub.status,plan,at,member.id,at).run();
    if(plan==='founder'&&['active','trialing'].includes(sub.status))await db().prepare("INSERT INTO waitlist (owner,created_at,plan) VALUES (?,?,'founder') ON CONFLICT(owner) DO UPDATE SET plan='founder'").bind(member.id,new Date().toISOString()).run();
   }
  }
 }
 await db().prepare('INSERT INTO billing_events (id,created_at) VALUES (?,?) ON CONFLICT(id) DO NOTHING').bind(event.id,new Date().toISOString()).run();return json({received:true});
}catch(e){return failure(e);}}

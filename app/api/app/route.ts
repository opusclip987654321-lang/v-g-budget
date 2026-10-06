import { getChatGPTUser } from '@/app/chatgpt-auth';
import { db,currentUser,memberFor,isAdmin,adminUser,catalog,readSetting,writeSetting,billingReady,body,json,failure,ApiError,runtime } from '@/lib/server';
import { stateSchema,postSchema,recipeSchema } from '@/lib/validation';
import { ingredients,challenges,type Recipe } from '@/lib/catalog';
import { blankState } from '@/lib/planner';
export const dynamic='force-dynamic';

export async function GET(request:Request){try{
 const url=new URL(request.url);const action=url.searchParams.get('action')??'bootstrap';
 if(action==='bootstrap'){
  const user=await getChatGPTUser();const data=await catalog();
  if(!user)return json({state:blankState(),revision:0,admin:false,user:null,catalog:data,billingReady:billingReady(),subscriptionStatus:'none',interested:false});
  const member=await memberFor(user);const interested=await db().prepare('SELECT owner FROM waitlist WHERE owner=?').bind(user.userId).first();
  return json({state:JSON.parse(member.state),revision:member.revision,admin:await isAdmin(user.userId),user:{id:user.userId,name:member.nickname,email:user.email},catalog:data,billingReady:billingReady(),subscriptionStatus:member.subscription_status,interested:!!interested});
 }
 if(action==='posts'){
  const user=await getChatGPTUser();const rows=await db().prepare("SELECT p.id,p.owner,p.content,p.category,p.photo,p.created_at,m.nickname,(SELECT COUNT(*) FROM likes l WHERE l.post=p.id) AS likes,(SELECT COUNT(*) FROM comments c WHERE c.post=p.id) AS comment_count FROM posts p JOIN members m ON m.id=p.owner WHERE p.status='visible' ORDER BY p.created_at DESC LIMIT 100").all();
  const liked=user?(await db().prepare('SELECT post FROM likes WHERE owner=?').bind(user.userId).all<{post:string}>()).results.map(x=>x.post):[];
  return json({posts:rows.results.map(x=>({...x,liked:liked.includes(x.id as string)}))});
 }
 if(action==='comments'){
  const post=url.searchParams.get('post')??'';const rows=await db().prepare("SELECT c.id,c.owner,c.content,c.created_at,m.nickname FROM comments c JOIN members m ON m.id=c.owner JOIN posts p ON p.id=c.post WHERE c.post=? AND p.status='visible' ORDER BY c.created_at ASC LIMIT 100").bind(post).all();return json({comments:rows.results});
 }
 if(action==='export'){
  const user=await currentUser();const member=await memberFor(user);const posts=await db().prepare('SELECT content,category,created_at FROM posts WHERE owner=?').bind(user.userId).all();const comments=await db().prepare('SELECT post,content,created_at FROM comments WHERE owner=?').bind(user.userId).all();return json({exportedAt:new Date().toISOString(),profile:JSON.parse(member.state),email:member.email,posts:posts.results,comments:comments.results});
 }
 if(action==='admin'){
  await adminUser();const counts=await db().batch<{count:number}>([db().prepare('SELECT COUNT(*) AS count FROM members'),db().prepare('SELECT COUNT(*) AS count FROM posts'),db().prepare('SELECT COUNT(*) AS count FROM waitlist'),db().prepare("SELECT COUNT(*) AS count FROM members WHERE subscription_status IN ('active','trialing')")]);
  const reports=await db().prepare('SELECT r.id,r.post,r.reason,r.created_at,p.content,p.status,m.nickname FROM reports r JOIN posts p ON p.id=r.post JOIN members m ON m.id=p.owner ORDER BY r.created_at DESC LIMIT 100').all();
  const members=await db().prepare('SELECT id,nickname,subscription_status,created_at FROM members ORDER BY created_at DESC LIMIT 100').all();
  const waiting=await db().prepare('SELECT m.nickname,m.email,w.created_at FROM waitlist w JOIN members m ON m.id=w.owner ORDER BY w.created_at DESC').all();
  return json({counts:counts.map(x=>Number(x.results[0]?.count??0)),reports:reports.results,members:members.results,waitlist:waiting.results,catalog:await catalog(),billingReady:billingReady()});
 }
 throw new ApiError(404,'Cette page est introuvable.');
}catch(e){return failure(e);}}

export async function POST(request:Request){try{
 const input=await body(request);const action=input.action;const user=await currentUser();const member=await memberFor(user);
 if(action==='state'){
  const state=stateSchema.parse(input.state);const data=await catalog();const ingredientIds=new Set(ingredients.map(i=>i.id));const recipeIds=new Set([...data.recipes.map(r=>r.id),...Object.keys(data.config.overrides)]);
  const allRecipes=new Set([...recipeIds,...(await import('@/lib/catalog')).recipes.map(r=>r.id)]);
  if(state.pantry.some(x=>!ingredientIds.has(x.id))||new Set(state.pantry.map(x=>x.id)).size!==state.pantry.length||state.profile.excluded.some(x=>!ingredientIds.has(x))||Object.keys(state.prices).some(id=>!ingredientIds.has(id))||state.checked.some(id=>!ingredientIds.has(id))||state.favorites.some(id=>!allRecipes.has(id))||state.plans.some(p=>p.entries.some(e=>!allRecipes.has(e.recipeId)))||state.joinedChallenges.some(id=>!challenges.some(c=>c.id===id))||state.completedChallenges.some(id=>!challenges.some(c=>c.id===id))||state.activePlanId&&!state.plans.some(p=>p.id===state.activePlanId))throw new ApiError(400,'Une recette ou un ingrédient est inconnu.');
  if(billingReady()&&!['active','trialing'].includes(member.subscription_status)&&!await isAdmin(user.userId)&&(state.plans.length>1||state.favorites.length>10||state.pantry.length>10))throw new ApiError(403,'L’offre Découverte conserve une semaine, dix favoris et dix ingrédients.');
  if(!Number.isInteger(input.revision))throw new ApiError(400,'Version de sauvegarde manquante.');
  const now=new Date().toISOString();const result=await db().prepare('UPDATE members SET state=?,nickname=?,revision=revision+1,updated_at=? WHERE id=? AND revision=?').bind(JSON.stringify(state),state.profile.nickname||'Membre Végé',now,user.userId,input.revision).run();
  if(!result.meta.changes)return json({error:'Votre compte a été modifié dans une autre fenêtre. Rechargez avant de poursuivre.',conflict:true},409);
  return json({revision:input.revision+1,savedAt:now});
 }
 if(action==='post'){
  const value=postSchema.parse(input);const recent=await db().prepare("SELECT COUNT(*) AS count FROM posts WHERE owner=? AND created_at>?").bind(user.userId,new Date(Date.now()-3600000).toISOString()).first<{count:number}>();if((recent?.count??0)>=20)throw new ApiError(429,'Vous avez beaucoup publié : réessayez un peu plus tard.');
  if(value.photoId){const photo=await db().prepare('SELECT id FROM photos WHERE id=? AND owner=?').bind(value.photoId,user.userId).first();if(!photo)throw new ApiError(400,'Cette photo est indisponible.');}
  const id=crypto.randomUUID();await db().prepare('INSERT INTO posts (id,owner,content,category,photo,created_at) VALUES (?,?,?,?,?,?)').bind(id,user.userId,value.content,value.category,value.photoId??null,new Date().toISOString()).run();return json({id},201);
 }
 if(action==='comment'){
  if(typeof input.content!=='string'||input.content.trim().length<1||input.content.length>1000||typeof input.post!=='string')throw new ApiError(400,'Saisissez un commentaire de 1 à 1 000 caractères.');
  if(!await db().prepare("SELECT id FROM posts WHERE id=? AND status='visible'").bind(input.post).first())throw new ApiError(404,'Cette publication est indisponible.');
  const recent=await db().prepare('SELECT COUNT(*) AS count FROM comments WHERE owner=? AND created_at>?').bind(user.userId,new Date(Date.now()-3600000).toISOString()).first<{count:number}>();if((recent?.count??0)>=60)throw new ApiError(429,'Réessayez un peu plus tard.');
  const id=crypto.randomUUID();await db().prepare('INSERT INTO comments (id,post,owner,content,created_at) VALUES (?,?,?,?,?)').bind(id,input.post,user.userId,input.content.trim(),new Date().toISOString()).run();return json({id},201);
 }
 if(action==='like'){
  if(typeof input.post!=='string')throw new ApiError(400,'Publication manquante.');if(!await db().prepare("SELECT id FROM posts WHERE id=? AND status='visible'").bind(input.post).first())throw new ApiError(404,'Cette publication est indisponible.');
  const exists=await db().prepare('SELECT post FROM likes WHERE post=? AND owner=?').bind(input.post,user.userId).first();if(exists)await db().prepare('DELETE FROM likes WHERE post=? AND owner=?').bind(input.post,user.userId).run();else await db().prepare('INSERT INTO likes (post,owner) VALUES (?,?) ON CONFLICT DO NOTHING').bind(input.post,user.userId).run();return json({liked:!exists});
 }
 if(action==='report'){
  if(typeof input.post!=='string'||typeof input.reason!=='string'||input.reason.trim().length<3||input.reason.length>300)throw new ApiError(400,'Indiquez brièvement la raison du signalement.');
  if(!await db().prepare('SELECT id FROM posts WHERE id=?').bind(input.post).first())throw new ApiError(404,'Publication introuvable.');
  if(await db().prepare('SELECT id FROM reports WHERE post=? AND owner=?').bind(input.post,user.userId).first())return json({ok:true});
  await db().prepare('INSERT INTO reports (id,post,owner,reason,created_at) VALUES (?,?,?,?,?)').bind(crypto.randomUUID(),input.post,user.userId,input.reason.trim(),new Date().toISOString()).run();return json({ok:true});
 }
 if(action==='delete-post'){
  const post=await db().prepare('SELECT owner FROM posts WHERE id=?').bind(String(input.post??'')).first<{owner:string}>();if(!post)throw new ApiError(404,'Publication introuvable.');if(post.owner!==user.userId&&!await isAdmin(user.userId))throw new ApiError(403,'Vous ne pouvez pas supprimer cette publication.');await db().prepare('DELETE FROM posts WHERE id=?').bind(input.post).run();return json({ok:true});
 }
 if(action==='waitlist'){
  await db().prepare('INSERT INTO waitlist (owner,created_at) VALUES (?,?) ON CONFLICT(owner) DO NOTHING').bind(user.userId,new Date().toISOString()).run();return json({ok:true});
 }
 if(action==='moderate'){
  await adminUser();if(!['visible','hidden'].includes(input.status))throw new ApiError(400,'Statut invalide.');await db().batch([db().prepare('UPDATE posts SET status=? WHERE id=?').bind(input.status,String(input.post)),db().prepare('DELETE FROM reports WHERE post=?').bind(String(input.post))]);return json({ok:true});
 }
 if(action==='catalog'){
  await adminUser();const config=(await catalog()).config;
  if(input.recipe){const recipe=recipeSchema.parse(input.recipe);if(recipe.ingredients.some(x=>!ingredients.some(i=>i.id===x.id)))throw new ApiError(400,'Ingrédient inconnu.');config.overrides[recipe.id]=recipe;config.hidden=config.hidden.filter(id=>id!==recipe.id);}
  if(typeof input.toggleRecipe==='string'){const id=input.toggleRecipe;config.hidden=config.hidden.includes(id)?config.hidden.filter(x=>x!==id):[...config.hidden,id];}
  if(input.prices){for(const [id,value] of Object.entries(input.prices)){if(!ingredients.some(i=>i.id===id)||typeof value!=='number'||!Number.isFinite(value)||value<0.01||value>1000)throw new ApiError(400,'Vérifiez les prix saisis.');config.prices[id]=value;}}
  await writeSetting('catalog',config);return json({catalog:await catalog()});
 }
 if(action==='delete-account'){
  if(input.confirm!=='SUPPRIMER')throw new ApiError(400,'Confirmation manquante.');if(['active','trialing','past_due'].includes(member.subscription_status))throw new ApiError(409,'Résiliez votre abonnement avant de supprimer votre compte.');
  const files=await db().prepare('SELECT storage_key FROM photos WHERE owner=?').bind(user.userId).all<{storage_key:string}>();if(files.results.length&&runtime().BUCKET)await runtime().BUCKET!.delete(files.results.map(f=>f.storage_key));await db().prepare('DELETE FROM members WHERE id=?').bind(user.userId).run();return json({ok:true});
 }
 throw new ApiError(400,'Action inconnue.');
}catch(e){return failure(e);}}

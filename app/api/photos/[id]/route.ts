import { getChatGPTUser } from '@/app/chatgpt-auth';
import { db,runtime,json,failure } from '@/lib/server';
export const dynamic='force-dynamic';
export async function GET(request:Request,{params}:{params:Promise<{id:string}>}){try{
 const {id}=await params;const user=await getChatGPTUser();if(!user)return json({error:'Photo indisponible.'},404);
 const photo=await db().prepare("SELECT f.* FROM photos f WHERE f.id=? AND (f.owner=? OR EXISTS(SELECT 1 FROM posts p WHERE p.photo=f.id AND p.status='visible'))").bind(id,user?.userId??'').first<{storage_key:string;mime:string}>();
 if(!photo)return json({error:'Photo indisponible.'},404);const object=await runtime().BUCKET?.get(photo.storage_key);if(!object)return json({error:'Photo indisponible.'},404);
 return new Response(object.body,{headers:{'Content-Type':photo.mime,'Cache-Control':'private, max-age=300','X-Content-Type-Options':'nosniff','Content-Security-Policy':"default-src 'none'"}});
}catch(e){return failure(e);}}

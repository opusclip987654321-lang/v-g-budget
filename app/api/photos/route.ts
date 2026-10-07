import { db,currentUser,memberFor,runtime,writeRequest,json,failure,ApiError } from '@/lib/server';
export const dynamic='force-dynamic';
export async function POST(request:Request){try{
 writeRequest(request);const user=await currentUser();await memberFor(user);const bucket=runtime().BUCKET;if(!bucket)throw new ApiError(503,'L’ajout de photos est momentanément indisponible.');
 if(Number(request.headers.get('content-length')??0)>4500000)throw new ApiError(413,'Choisissez une photo de moins de 4 Mo.');
 const form=await request.formData();const file=form.get('file');if(!(file instanceof File)||file.size<1||file.size>4000000)throw new ApiError(400,'Choisissez une photo JPEG, PNG ou WebP de moins de 4 Mo.');
 const bytes=await file.arrayBuffer();const head=new Uint8Array(bytes);let mime='';
 if(head[0]===255&&head[1]===216&&head[2]===255)mime='image/jpeg';
 if(head[0]===137&&head[1]===80&&head[2]===78&&head[3]===71&&head[4]===13&&head[5]===10&&head[6]===26&&head[7]===10)mime='image/png';
 if(String.fromCharCode(...head.slice(0,4))==='RIFF'&&String.fromCharCode(...head.slice(8,12))==='WEBP')mime='image/webp';
 if(!mime)throw new ApiError(400,'Le fichier doit être une photo JPEG, PNG ou WebP.');
 const id=crypto.randomUUID(),key=`community/${user.userId}/${id}`;await bucket.put(key,bytes);
 try{await db().prepare('INSERT INTO photos (id,owner,storage_key,mime,size,created_at) VALUES (?,?,?,?,?,?)').bind(id,user.userId,key,mime,file.size,new Date().toISOString()).run();}catch(e){await bucket.delete(key);throw e;}
 return json({id,url:`/api/photos/${id}`},201);
}catch(e){return failure(e);}}

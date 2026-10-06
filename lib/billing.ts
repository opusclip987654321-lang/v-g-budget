import { ApiError,runtime } from './server';
export async function stripe(path:string,method='GET',values?:Record<string,string>,idempotency?:string):Promise<Record<string,any>>{
 const key=runtime().STRIPE_SECRET_KEY;if(!key)throw new ApiError(503,'Les abonnements ne sont pas encore ouverts.');
 const headers:Record<string,string>={Authorization:`Bearer ${key}`};if(values)headers['Content-Type']='application/x-www-form-urlencoded';if(idempotency)headers['Idempotency-Key']=idempotency;
 const response=await fetch(`https://api.stripe.com/v1${path}`,{method,headers,body:values?new URLSearchParams(values):undefined});const data=await response.json() as Record<string,any>;
 if(!response.ok){console.error('Billing provider request failed',response.status,data.error?.code);throw new ApiError(502,'Le service de paiement est momentanément indisponible. Réessayez.');}return data;
}
export async function verifySignature(payload:string,header:string,secret:string,now=Date.now()){
 const segments=header.split(',').map(x=>x.trim());const timestamp=segments.find(s=>s.startsWith('t='))?.slice(2);const signatures=segments.filter(s=>s.startsWith('v1=')).map(s=>s.slice(3));
 if(!timestamp||!/^\d+$/.test(timestamp)||Math.abs(now/1000-Number(timestamp))>300)return false;
 const encoder=new TextEncoder();const key=await crypto.subtle.importKey('raw',encoder.encode(secret),{name:'HMAC',hash:'SHA-256'},false,['sign']);const bytes=new Uint8Array(await crypto.subtle.sign('HMAC',key,encoder.encode(`${timestamp}.${payload}`)));const expected=Array.from(bytes,b=>b.toString(16).padStart(2,'0')).join('');
 return signatures.some(value=>{if(value.length!==expected.length)return false;let different=0;for(let j=0;j<value.length;j++)different|=value.charCodeAt(j)^expected.charCodeAt(j);return different===0;});
}

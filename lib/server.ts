import { getRawDb } from '@/db';
import { getChatGPTUser, type ChatGPTUser } from '@/app/chatgpt-auth';
import { env } from 'cloudflare:workers';
import { ingredients, recipes, type Recipe } from './catalog';
import { blankState } from './planner';

export type RuntimeConfig = { DB?:D1Database; BUCKET?:R2Bucket; STRIPE_SECRET_KEY?:string; STRIPE_PRICE_ID?:string; STRIPE_WEBHOOK_SECRET?:string; BILLING_ENABLED?:string; SITE_ORIGIN?:string; RESEND_API_KEY?:string; EMAIL_FROM?:string };
export const runtime = () => env as unknown as RuntimeConfig;
export const db = getRawDb;
export type Member = { id:string; email:string; nickname:string; state:string; revision:number; customer:string|null; subscription:string|null; subscription_status:string; billing_event_time:number; created_at:string; updated_at:string };
export class ApiError extends Error { constructor(public status:number,message:string){super(message);} }
export const json = (data:unknown,status=200) => Response.json(data,{status,headers:{'Cache-Control':'no-store','X-Content-Type-Options':'nosniff'}});
export async function currentUser(){const u=await getChatGPTUser();if(!u)throw new ApiError(401,'Connectez-vous pour enregistrer votre activité.');return u;}
export async function memberFor(user:ChatGPTUser):Promise<Member>{
 const now=new Date().toISOString();const state=blankState();state.profile.nickname=user.fullName?.split(' ')[0]?.slice(0,40)??'Membre Végé';
 await db().prepare('INSERT INTO members (id,email,nickname,state,created_at,updated_at) VALUES (?,?,?,?,?,?) ON CONFLICT(id) DO NOTHING').bind(user.userId,user.email,state.profile.nickname,JSON.stringify(state),now,now).run();
 // La première connexion d'un Site privé réservé à son propriétaire initialise son rôle d'administration.
 await db().prepare("INSERT INTO settings (key,value) VALUES ('owner_id',?) ON CONFLICT(key) DO NOTHING").bind(user.userId).run();
 const row=await db().prepare('SELECT * FROM members WHERE id=?').bind(user.userId).first<Member>();if(!row)throw new ApiError(503,'Impossible de charger votre compte.');return row;
}
export async function isAdmin(id:string){const row=await db().prepare("SELECT value FROM settings WHERE key='owner_id'").first<{value:string}>();return row?.value===id;}
export async function adminUser(){const user=await currentUser();await memberFor(user);if(!await isAdmin(user.userId))throw new ApiError(403,'Cet espace est réservé à l’administration.');return user;}
export async function readSetting<T>(key:string,fallback:T):Promise<T>{const row=await db().prepare('SELECT value FROM settings WHERE key=?').bind(key).first<{value:string}>();if(!row)return fallback;try{return JSON.parse(row.value) as T;}catch{return fallback;}}
export async function writeSetting(key:string,value:unknown){await db().prepare('INSERT INTO settings (key,value) VALUES (?,?) ON CONFLICT(key) DO UPDATE SET value=excluded.value').bind(key,JSON.stringify(value)).run();}
export async function catalog(){const config=await readSetting<{hidden:string[];overrides:Record<string,Recipe>;prices:Record<string,number>}>('catalog',{hidden:[],overrides:{},prices:{}});const list=[...recipes.map(r=>config.overrides[r.id]??r),...Object.values(config.overrides).filter(r=>!recipes.some(b=>b.id===r.id))].filter(r=>!config.hidden.includes(r.id));return {recipes:list,ingredients:ingredients.map(i=>({...i,price:config.prices[i.id]??i.price})),config};}
export function billingReady(){const c=runtime();return c.BILLING_ENABLED==='true'&&!!c.STRIPE_SECRET_KEY&&!!c.STRIPE_PRICE_ID&&!!c.STRIPE_WEBHOOK_SECRET;}
export function writeRequest(request:Request){const origin=request.headers.get('origin');const own=new URL(request.url).origin;const configured=runtime().SITE_ORIGIN??'https://vegebudget.young-kiwi-5118.chatgpt.site';if(origin&&origin!==own&&origin!==configured)throw new ApiError(403,'Cette demande ne vient pas du site.');}
export async function body(request:Request){writeRequest(request);if(!request.headers.get('content-type')?.includes('application/json'))throw new ApiError(415,'Format de demande non pris en charge.');if(Number(request.headers.get('content-length')??0)>300000)throw new ApiError(413,'Cette demande est trop volumineuse.');const text=await request.text();if(text.length>300000)throw new ApiError(413,'Cette demande est trop volumineuse.');try{const value=JSON.parse(text);if(!value||typeof value!=='object'||Array.isArray(value))throw new Error();return value;}catch{throw new ApiError(400,'Les informations envoyées ne sont pas valides.');}}
export function failure(error:unknown){if(error instanceof ApiError)return json({error:error.message},error.status);if(error&&typeof error==='object'&&'issues' in error)return json({error:'Vérifiez les champs saisis : une valeur est manquante ou invalide.'},400);console.error('VegeBudget request failed',error instanceof Error?error.message:'unknown');return json({error:'Le service est momentanément indisponible. Votre saisie est conservée : réessayez.'},503);}

'use client';
import {createContext,useContext} from 'react';
import type {Ingredient,Recipe} from './catalog';
import type {UserState,Plan,Entry,PantryItem,ShopItem} from './planner';
import type {ServiceInfo} from './service-info';
export type View='bienvenue'|'dashboard'|'menus'|'recettes'|'placard'|'courses'|'club'|'defis'|'compte'|'offre'|'admin';
export type AppContextType={
 state:UserState;user:{id:string;name:string;email:string}|null;loaded:boolean;admin:boolean;catalog:{recipes:Recipe[];ingredients:Ingredient[]};allRecipes:Recipe[];activePlan:Plan;items:ShopItem[];week:string;
 commit:(update:(state:UserState)=>UserState,message?:string)=>boolean;modifyPlan:(update:(plan:Plan)=>Plan,message?:string)=>void;generate:()=>void;setWeek:(week:string)=>void;navigate:(view:View)=>void;toggleCooked:(id:string,servings?:number)=>void;startOnboarding:()=>void;reuseWeek:()=>void;serviceInfo:ServiceInfo;
 openRecipe:(id:string)=>void;openPreferences:()=>void;openPantry:(item?:PantryItem)=>void;replaceEntry:(entry:Entry)=>void;login:()=>void;
 billingReady:boolean;subscriptionStatus:string;interested:boolean;setInterested:(value:boolean)=>void;founder:boolean;founderLeft:number;reserveFounder:()=>Promise<void>;paywall:'week'|'limits'|null;reminders:boolean;setReminders:(on:boolean)=>Promise<void>;reload:()=>Promise<void>;busy:boolean;
};
export const AppContext=createContext<AppContextType|null>(null);
export const useApp=()=>{const c=useContext(AppContext);if(!c)throw new Error('App context unavailable');return c;};
export async function api<T=any>(action:string,values?:Record<string,unknown>,query?:Record<string,string>):Promise<T>{const response=await fetch(values?'/api/app':`/api/app?${new URLSearchParams({action,...query}).toString()}`,values?{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({action,...values})}:{cache:'no-store'});const data:unknown=await response.json().catch(()=>({error:'Impossible de lire la réponse. Réessayez.'}));if(!response.ok){const message=data&&typeof data==='object'&&'error' in data&&typeof data.error==='string'?data.error:'La demande a échoué.';const e=new Error(message) as Error&{status:number};e.status=response.status;throw e;}return data as T;}
export function downloadText(content:string,name:string,type='text/plain;charset=utf-8'){const url=URL.createObjectURL(new Blob([content],{type}));const a=document.createElement('a');a.href=url;a.download=name;a.click();setTimeout(()=>URL.revokeObjectURL(url),1000);}

import { ingredients as baseIngredients, recipes as baseRecipes, type Ingredient, type Recipe } from './catalog';
export type Profile = { nickname: string; people:number; budget:number; mealCount:number; maxMinutes:number; allergens:string[]; excluded:string[]; equipment:string[]; newsletter:boolean };
export type PantryItem = { id:string; qty:number; expiry?:string };
export type Entry = { id:string; recipeId:string; date:string; servings:number; cooked:boolean; locked:boolean };
export type Plan = { id:string; name:string; weekStart:string; entries:Entry[]; createdAt:string };
export type UserState = { profile:Profile; pantry:PantryItem[]; favorites:string[]; plans:Plan[]; activePlanId:string | null; checked:string[]; joinedChallenges:string[]; completedChallenges:string[]; prices:Record<string,number>; onboardingDone:boolean };
export type ShopItem = { id:string; ingredient:Ingredient; required:number; inPantry:number; missing:number; packages:number; purchaseCost:number; usedCost:number; surplus:number };
export const defaultProfile:Profile = { nickname:'', people:2, budget:35, mealCount:5, maxMinutes:35, allergens:[], excluded:[], equipment:['Plaques','Four','Mixeur'], newsletter:false };
export const blankState = ():UserState => ({profile:{...defaultProfile,allergens:[],excluded:[],equipment:[...defaultProfile.equipment]},pantry:[],favorites:[],plans:[],activePlanId:null,checked:[],joinedChallenges:[],completedChallenges:[],prices:{},onboardingDone:false});
export const roundMoney = (n:number) => Math.round((n+Number.EPSILON)*100)/100;
export const money = (n:number) => new Intl.NumberFormat('fr-FR',{style:'currency',currency:'EUR'}).format(n);
export function quantity(n:number,unit:Ingredient['unit']) { if(unit==='g' && n>=1000) return `${+(n/1000).toFixed(2)} kg`; if(unit==='ml' && n>=1000) return `${+(n/1000).toFixed(2)} l`; return `${+n.toFixed(1)} ${unit}${unit==='pièce' && n>1 ? 's':''}`; }
export function localDate(date:Date) { return `${date.getFullYear()}-${String(date.getMonth()+1).padStart(2,'0')}-${String(date.getDate()).padStart(2,'0')}`; }
export function monday(date = new Date()) { const x=new Date(date); x.setDate(x.getDate()-((x.getDay()+6)%7)); return localDate(x); }
export function addDay(date:string,n:number) { const d=new Date(`${date}T12:00:00`); d.setDate(d.getDate()+n); return localDate(d); }
export function isEligible(recipe:Recipe,profile:Profile,ingredients=baseIngredients) { return recipe.minutes<=profile.maxMinutes && (recipe.category==='Au four' ? profile.equipment.includes('Four') : profile.equipment.includes('Plaques')) && !(recipe.steps.some(x=>x.toLowerCase().includes('mixer')) && !profile.equipment.includes('Mixeur')) && !recipe.ingredients.some(x=>profile.excluded.includes(x.id) || ingredients.find(i=>i.id===x.id)?.allergens.some(a=>profile.allergens.includes(a))); }
export function recipeCost(recipe:Recipe,servings=2,prices:Record<string,number>={},ingredients=baseIngredients) { return roundMoney(recipe.ingredients.reduce((sum,x)=>{const i=ingredients.find(v=>v.id===x.id);return sum+(i ? x.qty*(servings/2)*(prices[i.id]??i.price)/i.pack:0);},0)); }
export function shopping(entries:Entry[],pantry:PantryItem[],prices:Record<string,number>={},recipes=baseRecipes,ingredients=baseIngredients):ShopItem[] {
  const required:Record<string,number>={};
  for(const e of entries) { const r=recipes.find(r=>r.id===e.recipeId); if(!r) continue; for(const x of r.ingredients) required[x.id]=(required[x.id]??0)+x.qty*(e.servings/2); }
  return Object.entries(required).flatMap(([id,qty])=>{const ingredient=ingredients.find(i=>i.id===id);if(!ingredient)return [];const price=prices[id]??ingredient.price;const inPantry=Math.min(qty,pantry.find(p=>p.id===id)?.qty??0);const missing=Math.max(0,qty-inPantry);const packages=missing>0.000001?Math.ceil((missing-0.000001)/ingredient.pack):0;return [{id,ingredient,required:qty,inPantry,missing,packages,purchaseCost:roundMoney(packages*price),usedCost:roundMoney(qty*price/ingredient.pack),surplus:Math.max(0,packages*ingredient.pack-missing)}];}).sort((a,b)=>a.ingredient.category.localeCompare(b.ingredient.category)||a.ingredient.name.localeCompare(b.ingredient.name));
}
export function totals(items:ShopItem[]) { return {purchase:roundMoney(items.reduce((s,i)=>s+i.purchaseCost,0)),used:roundMoney(items.reduce((s,i)=>s+i.usedCost,0)),pantry:roundMoney(items.reduce((s,i)=>s+(i.required ? i.usedCost*i.inPantry/i.required:0),0)),packageSurplus:roundMoney(items.reduce((s,i)=>s+(i.required ? i.usedCost/i.required*i.surplus:0),0))}; }
const random = (seed:number) => {let x=seed||1;return ()=>{x=(x*1664525+1013904223)>>>0;return x/4294967296;};};
export function generatePlan(state:UserState,weekStart=monday(),seed=Date.now(),recipes=baseRecipes,ingredients=baseIngredients,locked:Entry[]=[]):{plan:Plan|null;warning:string|null} {
  const eligible=recipes.filter(r=>isEligible(r,state.profile,ingredients));
  if(!eligible.length) return {plan:null,warning:'Aucune recette ne correspond à ces préférences. Augmentez le temps disponible ou ajustez vos exclusions.'};
  const slots=state.profile.mealCount;
  const kept=locked.filter((entry,index)=>{const recipe=recipes.find(r=>r.id===entry.recipeId);return !!recipe && isEligible(recipe,state.profile,ingredients) && Array.from({length:slots},(_,day)=>addDay(weekStart,day)).includes(entry.date) && locked.findIndex(e=>e.date===entry.date)===index;});
  let best:Entry[]=[];let bestScore=Infinity;const rand=random(seed);
  for(let trial=0;trial<45;trial++) {
    const selected:Entry[]=kept.map(x=>({...x,servings:state.profile.people}));
    for(let day=0;day<slots;day++) {
      const date=addDay(weekStart,day);if(selected.some(e=>e.date===date))continue;
      let choices=eligible.filter(r=>!selected.some(e=>e.recipeId===r.id)); if(!choices.length) choices=eligible;
      const previousCost=totals(shopping(selected,state.pantry,state.prices,recipes,ingredients)).purchase;
      const scored=choices.map(r=>{const entry={id:`slot-${day}`,recipeId:r.id,date,servings:state.profile.people,cooked:false,locked:false};const cost=totals(shopping([...selected,entry],state.pantry,state.prices,recipes,ingredients)).purchase;return {r,entry,score:cost-previousCost+rand()*(trial<15?1:5)+(state.favorites.includes(r.id)?-0.5:0)+selected.filter(e=>recipes.find(v=>v.id===e.recipeId)?.category===r.category).length*0.55};}).sort((a,b)=>a.score-b.score);
      selected.push(scored[0].entry);
    }
    const cost=totals(shopping(selected,state.pantry,state.prices,recipes,ingredients)).purchase;
    const variety=new Set(selected.map(e=>recipes.find(r=>r.id===e.recipeId)?.category)).size;
    const score=Math.max(0,cost-state.profile.budget)*1000+cost-variety*0.6;
    if(score<bestScore){bestScore=score;best=selected;}
  }
  const entries=best.sort((a,b)=>a.date.localeCompare(b.date)).map(e=>({...e,id:e.locked?e.id:crypto.randomUUID()}));
  const cost=totals(shopping(entries,state.pantry,state.prices,recipes,ingredients)).purchase;
  let warning=cost>state.profile.budget ? `Le panier estimé dépasse votre budget de ${money(cost-state.profile.budget)}. Ajoutez ce que vous avez au placard, ajustez les prix ou augmentez le budget.` : null;
  if(new Set(entries.map(e=>e.recipeId)).size<slots) warning=`Les préférences actuelles limitent le choix : certaines recettes se répètent.${warning?' '+warning:''}`;
  return {plan:{id:crypto.randomUUID(),name:`Semaine du ${new Date(`${weekStart}T12:00:00`).toLocaleDateString('fr-FR',{day:'numeric',month:'long'})}`,weekStart,entries,createdAt:new Date().toISOString()},warning};
}
export function shoppingText(items:ShopItem[],checked:string[]) {return ['VégéBudget — ma liste de courses','Prix indicatifs à personnaliser selon votre magasin.','',...items.filter(i=>i.missing>0).map(i=>`${checked.includes(i.id)?'✓':'□'} ${i.ingredient.name} — ${i.packages} ${i.packages>1?'paquets':'paquet'} de ${quantity(i.ingredient.pack,i.ingredient.unit)} — ${money(i.purchaseCost)}`),'',`Panier estimé : ${money(totals(items).purchase)}`].join('\n');}

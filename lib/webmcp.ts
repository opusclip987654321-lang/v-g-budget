import type {Plan,ShopItem} from './planner';

type Tool={name:string;title:string;description:string;inputSchema:object;annotations:{readOnlyHint:boolean;untrustedContentHint:boolean};execute:(input:unknown)=>unknown|Promise<unknown>};
type ModelContext={registerTool:(tool:Tool,options?:{signal?:AbortSignal})=>void|Promise<void>};
type Bridge={ready:boolean;plan:Plan;items:ShopItem[];recipeTitle:(id:string)=>string;openPreferences:()=>void};

// The registry is optional: the application works normally in other browsers.
export function registerBudgetTools(current:()=>Bridge){
 const registry=(document as Document&{modelContext?:ModelContext}).modelContext;
 if(!registry?.registerTool)return()=>{};
 const lifecycle=new AbortController();
 const requireEmpty=(input:unknown)=>{if(!input||typeof input!=='object'||Array.isArray(input)||Object.keys(input).length)throw new Error('Cet outil attend un objet vide.');if(!current().ready)throw new Error('Le compte est encore en cours de chargement.');};
 const tools:Tool[]=[
  {name:'read_weekly_menu',title:'Lire le planning',description:'Lire les repas du planning actuellement affiché, leurs dates, portions et préparation. Aucun changement.',inputSchema:{type:'object',properties:{},additionalProperties:false},annotations:{readOnlyHint:true,untrustedContentHint:true},execute(input){requireEmpty(input);const a=current();return {week:a.plan.weekStart,meals:a.plan.entries.map(e=>({date:e.date,recipeId:e.recipeId,title:a.recipeTitle(e.recipeId),servings:e.servings,cooked:e.cooked,locked:e.locked}))};}},
  {name:'read_shopping_list',title:'Lire les courses',description:'Lire la liste calculée à partir du planning affiché et du placard, avec quantités et prix estimés. Aucun changement.',inputSchema:{type:'object',properties:{},additionalProperties:false},annotations:{readOnlyHint:true,untrustedContentHint:true},execute(input){requireEmpty(input);return {currency:'EUR',pricesAreEstimates:true,items:current().items.map(i=>({ingredient:i.ingredient.name,unit:i.ingredient.unit,required:i.required,inPantry:i.inPantry,missing:i.missing,packagesToBuy:i.packages,packageQuantity:i.ingredient.pack,estimatedPurchaseCost:i.purchaseCost}))};}},
  {name:'start_menu_preferences',title:'Ouvrir les préférences',description:'Ouvrir le formulaire visible de personnalisation des menus. Cet outil ne modifie ni les préférences ni le planning.',inputSchema:{type:'object',properties:{},additionalProperties:false},annotations:{readOnlyHint:false,untrustedContentHint:false},async execute(input){requireEmpty(input);current().openPreferences();await new Promise<void>(resolve=>requestAnimationFrame(()=>requestAnimationFrame(()=>resolve())));return {status:'preferences_form_open',changesSaved:false};}},
 ];
 for(const tool of tools){try{void Promise.resolve(registry.registerTool(tool,{signal:lifecycle.signal})).catch(()=>{});}catch{}}
 return ()=>lifecycle.abort();
}

const {test}=require('node:test');
const assert=require('node:assert/strict');
const {blankState,shopping,totals,generatePlan,isEligible}=require('../.sites-runtime/planner-test/planner.js');
const {recipes,ingredients}=require('../.sites-runtime/planner-test/catalog.js');
const entry=(recipeId,servings=2)=>({id:recipeId,recipeId,date:'2026-10-05',servings,cooked:false,locked:false});

test('whole packs are charged while recipe cost uses only quantities consumed',()=>{
 const recipe=recipes.find(r=>r.id==='curry-corail');
 const items=shopping([entry(recipe.id)],[]);
 for(const item of items){assert.equal(item.packages,Math.ceil(item.required/item.ingredient.pack));assert.equal(item.purchaseCost,Math.round(item.packages*item.ingredient.price*100)/100);}
 assert.ok(totals(items).purchase>=totals(items).used);
});
test('pantry is deducted once from the combined needs of several meals',()=>{
 const recipes=[{id:'test',ingredients:[{id:'rice',qty:160}]}];
 const rice=ingredients.find(i=>i.id==='rice');
 const [item]=shopping([entry('test'),entry('test')],[{id:'rice',qty:200}],{},recipes,ingredients);
 assert.equal(item.required,320);assert.equal(item.inPantry,200);assert.equal(item.missing,120);assert.equal(item.packages,1);assert.equal(item.surplus,rice.pack-120);
 const [double]=shopping([entry('test',4)],[{id:'rice',qty:200}],{},recipes,ingredients);
 assert.equal(double.required,320);assert.equal(double.missing,120);
});
test('owned stock and editable prices affect actual checkout estimates',()=>{
 const recipe=recipes[0];const stock=recipe.ingredients.map(i=>({id:i.id,qty:i.qty}));
 const items=shopping([entry(recipe.id)],stock);
 assert.equal(totals(items).purchase,0);
 const [rice]=shopping([entry('test')],[],{rice:3.47},[{id:'test',ingredients:[{id:'rice',qty:160}]}],ingredients);
 assert.equal(rice.purchaseCost,3.47);
});
test('allergens, ingredients and equipment exclude incompatible recipes',()=>{
 const state=blankState();state.profile.maxMinutes=90;state.profile.allergens=['Gluten'];
 for(const recipe of recipes.filter(r=>isEligible(r,state.profile))){assert.ok(!recipe.ingredients.some(x=>ingredients.find(i=>i.id===x.id).allergens.includes('Gluten')));}
 state.profile.allergens=[];state.profile.excluded=['chickpeas'];
 assert.ok(recipes.filter(r=>isEligible(r,state.profile)).every(r=>!r.ingredients.some(i=>i.id==='chickpeas')));
 state.profile.excluded=[];state.profile.equipment=[];assert.ok(recipes.every(r=>!isEligible(r,state.profile)));
 state.profile.equipment=['Four'];assert.ok(recipes.filter(r=>isEligible(r,state.profile)).every(r=>r.category==='Au four'));
 state.profile.equipment=['Plaques'];assert.ok(!isEligible(recipes.find(r=>r.id==='soupe-petits-pois'),state.profile));
});
test('regeneration preserves a locked meal on its original weekday',()=>{
 const state=blankState();const locked={...entry('curry-corail'),id:'locked-wednesday',date:'2026-10-07',locked:true,cooked:true};
 const {plan}=generatePlan(state,'2026-10-05',42,recipes,ingredients,[locked]);
 assert.equal(plan.entries.length,5);assert.equal(new Set(plan.entries.map(e=>e.date)).size,5);
 assert.equal(plan.entries[2].recipeId,locked.recipeId);assert.equal(plan.entries[2].date,locked.date);assert.equal(plan.entries[2].id,locked.id);assert.equal(plan.entries[2].cooked,true);
 assert.doesNotThrow(()=>generatePlan(state,'2026-10-05',42,recipes,ingredients,[{...locked,recipeId:'removed'}]));
});
test('impossible budgets are disclosed and impossible preferences return no plan',()=>{
 const state=blankState();state.profile.budget=1;
 const result=generatePlan(state,'2026-10-05',42);assert.ok(result.plan);assert.match(result.warning,/dépasse votre budget/);
 state.profile.equipment=[];const none=generatePlan(state,'2026-10-05',42);assert.equal(none.plan,null);assert.match(none.warning,/Aucune recette/);
});

const {test}=require('node:test');
const assert=require('node:assert/strict');
const {blankState,shopping,totals,generatePlan,isEligible,checkedForWeek,recordPurchases,weeklyBudget,cookMeal,portionStep,stepMinutes,challengeProgress,awardChallenges}=require('../.sites-runtime/planner-test/planner.js');
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
test('recording purchases moves money into expenses without creating budget savings',()=>{
 const state=blankState();const plan={id:'week-one',weekStart:'2026-10-05',name:'Test',createdAt:new Date().toISOString(),budget:35,entries:[entry('curry-corail')]};
 const items=shopping(plan.entries,[]);const before=weeklyBudget(state,plan,items);state.checkedByWeek[plan.weekStart]=['oil'];
 const next=recordPurchases(state,plan,items);const after=weeklyBudget(next,plan,shopping(plan.entries,next.pantry));
 assert.equal(after.spent,2.8);assert.equal(after.forecast,before.forecast);assert.equal(after.margin,before.margin);assert.equal(next.pantry.find(p=>p.id==='oil').qty,500);
 assert.equal(recordPurchases(next,plan,shopping(plan.entries,next.pantry)).purchases.length,1,'recording twice does not duplicate an unchecked purchase');
});
test('shopping selections are isolated by week',()=>{const state=blankState();state.checkedByWeek['2026-10-05']=['oil'];assert.deepEqual(checkedForWeek(state,'2026-10-05'),['oil']);assert.deepEqual(checkedForWeek(state,'2026-10-12'),[]);});
test('cooking consumes available stock once and undo restores exactly what was consumed',()=>{
 const state=blankState();state.pantry=[{id:'oil',qty:500},{id:'rice',qty:50}];const plan={id:'test',weekStart:'2026-10-05',name:'Test',createdAt:new Date().toISOString(),entries:[entry('curry-corail')]};
 const next=cookMeal(state,plan,'curry-corail');assert.equal(next.pantry.find(p=>p.id==='oil').qty,490);assert.equal(next.pantry.find(p=>p.id==='rice').qty,0);
 assert.equal(shopping(next.plans[0].entries,next.pantry).length,0,'prepared meals leave the shopping list');
 const restored=cookMeal(next,next.plans[0],'curry-corail');assert.deepEqual(restored.pantry,state.pantry);assert.equal(restored.plans[0].entries[0].cooked,false);
});
test('editable pack sizes change both checkout cost and price per consumed amount',()=>{
 const recipe={id:'test',ingredients:[{id:'rice',qty:1200}]};const [item]=shopping([entry('test')],[],{rice:3},[recipe],ingredients,{rice:500});assert.equal(item.packages,3);assert.equal(item.purchaseCost,9);assert.equal(item.usedCost,7.2);
});
test('quantities in steps scale while cooking times remain fixed',()=>{
 const soup=recipes.find(r=>r.id==='soupe-petits-pois');assert.match(portionStep(soup.steps[1],1),/300 ml/);assert.match(portionStep(soup.steps[1],4),/1.?200 ml/);assert.match(portionStep(soup.steps[1],4),/12 minutes/);assert.equal(stepMinutes(soup.steps[1]),12);
});
test('planning uses only the selected weekdays and keeps prepared meals during regeneration',()=>{
 const state=blankState();state.profile.days=[2,4,6];state.profile.mealCount=3;const {plan}=generatePlan(state,'2026-10-05',42);assert.deepEqual(plan.entries.map(e=>e.date),['2026-10-07','2026-10-09','2026-10-11']);
 const prepared={...plan.entries[0],cooked:true,consumed:[{id:'oil',qty:5}]};const next=generatePlan(state,'2026-10-05',41,recipes,ingredients,[prepared]).plan;assert.equal(next.entries[0].id,prepared.id);assert.equal(next.entries[0].cooked,true);assert.deepEqual(next.entries[0].consumed,prepared.consumed);
});
test('legume challenge requires an actual lentil, chickpea or bean dish and awards persist by week',()=>{
 const state=blankState();state.joinedChallenges=['one-discovery'];const plan={id:'x',weekStart:'2026-10-05',name:'Test',createdAt:new Date().toISOString(),entries:[{...entry('soupe-petits-pois'),cooked:true}]};assert.equal(challengeProgress(state,plan,'one-discovery'),0);
 plan.entries=[{...entry('curry-corail'),cooked:true}];const awarded=awardChallenges(state,plan);assert.equal(awarded.challengeAwards.length,1);assert.equal(awardChallenges(awarded,plan).challengeAwards.length,1);const later={...plan,weekStart:'2026-10-12',entries:[]};assert.equal(awardChallenges(awarded,later).challengeAwards.length,1);
});
test('all catalogue recipes have valid image assets and adaptable quantities',()=>{assert.equal(recipes.length,24);for(const r of recipes){assert.ok(r.image);if(r.imageTile){assert.ok(r.imageTile.column<r.imageTile.columns);assert.ok(r.imageTile.row<r.imageTile.rows);}for(const step of r.steps)assert.ok(!/\d+ ml/.test(step.replace(/\{[^}]+\}/g,'')),`${r.id}: unscaled liquid quantity`);}});

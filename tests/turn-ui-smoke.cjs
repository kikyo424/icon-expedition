const {chromium}=require('playwright');const {pathToFileURL}=require('node:url');const path=require('node:path');const assert=require('node:assert/strict');
(async()=>{const browser=await chromium.launch({channel:'chrome',headless:true});try{
 const page=await browser.newPage({viewport:{width:1440,height:1100}});const errors=[];page.on('pageerror',e=>errors.push(e.message));await page.goto(pathToFileURL(path.resolve('index.html')).href);
 await page.evaluate(()=>{start();auto=false;turnState=TurnCombat.create();turnState.currentId=actors[0].id;turnState.phase='waiting';actors[0].energy=2;actors[0].job='warrior';updateAuto();updateTurnUI();});
 assert.equal(await page.locator('#turn-skill').isEnabled(),true);
 const before=await page.evaluate(()=>actors.filter(a=>a.team===1).reduce((sum,a)=>sum+a.hp,0));
 await page.locator('#turn-skill').click();await page.waitForFunction(()=>actors[0].energy===0);
 assert.ok(await page.evaluate(()=>actors.filter(a=>a.team===1).reduce((sum,a)=>sum+a.hp,0))<before);
 assert.ok(await page.evaluate(()=>actors[0].shield)>0,'warrior skill must create an actual shield');
 await page.screenshot({path:'turn-combat-preview.png',fullPage:true});
 await page.evaluate(()=>{
  const styles=['tabs','paper','report','printer','grid','slides','chat','signal','code','sound','orbit','flame','shield','drain','petal','slime','calendar','clock','briefcase','slash','greatsword','dagger','spellbook','staff'];
  for(const style of styles)CombatFX.draw(ctx,{x:200,y:200,targets:[{x:650,y:300}],color:'#a9d587',style,skill:true,life:.4,max:1});
 });
 await page.locator('#compact').click();
 await page.evaluate(()=>{turnState.phase='waiting';turnState.currentId=actors[0].id;actors[0].energy=2;updateTurnUI();});
 assert.equal(await page.locator('#widget-turn-buttons').isVisible(),true);
 await page.locator('#widget-guard').click();await page.waitForFunction(()=>turnState.phase!=='waiting');
 assert.equal(await page.locator('.widget-toolbar').evaluate(el=>getComputedStyle(el).backgroundColor),'rgba(0, 0, 0, 0)');
 assert.deepEqual(errors,[]);console.log('PASS: manual skill consumes energy, creates shield and damage, all 24 effect styles render, transparent widget supports turn commands.');
}finally{await browser.close();}})().catch(e=>{console.error(e);process.exit(1);});

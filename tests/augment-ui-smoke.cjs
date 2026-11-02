const {chromium}=require('playwright');const {pathToFileURL}=require('node:url');const path=require('node:path');const assert=require('node:assert/strict');
(async()=>{const browser=await chromium.launch({channel:'chrome',headless:true});try{
 const page=await browser.newPage({viewport:{width:560,height:355}}),errors=[];page.on('pageerror',e=>errors.push(e.message));await page.goto(pathToFileURL(path.resolve('index.html')).href);
 await page.evaluate(async()=>{auto=false;updateAuto();await document.getElementById('compact').onclick();start({focus:false});});
 assert.equal(await page.locator('#upgrade-panel').isVisible(),true);assert.equal(await page.locator('.upgrade-card').count(),3);
 const hp=await page.evaluate(()=>actors.filter(a=>a.team===1).map(a=>a.hp));await page.waitForTimeout(300);assert.deepEqual(await page.evaluate(()=>actors.filter(a=>a.team===1).map(a=>a.hp)),hp);
 await page.screenshot({path:'augment-choice-preview.png',omitBackground:true});
 const pickedJobs=[];for(let i=0;i<3;i++){const card=page.locator('.upgrade-card').first();pickedJobs.push(await card.getAttribute('data-upgrade'));await card.click();}
 assert.equal(await page.locator('#upgrade-panel').isVisible(),false);
 assert.deepEqual(await page.evaluate(()=>actors.filter(a=>a.team===0).map(a=>DungeonAugments.jobs[a.job].weapon)),await page.evaluate(ids=>ids.map(id=>DungeonAugments.jobs[id].weapon),pickedJobs));
 await page.evaluate(()=>{paused=true;floor=3;actors=actors.filter(a=>a.team===0);wave();});
 assert.equal(await page.locator('.upgrade-card').count(),3);
 const picked=await page.locator('.upgrade-card').first().getAttribute('data-upgrade');await page.locator('.upgrade-card').first().click();
 assert.equal(await page.evaluate(()=>dungeonRun.augments.length),1);assert.equal(await page.evaluate(id=>actors.filter(a=>a.team===0).every(a=>a.appliedAugments.includes(id)),picked),true);
 await page.evaluate(()=>{const a=actor({...defaults[3],id:'newcomer',name:'새 동료'},250,300,0);actors.push(a);TurnCombat.layout(actors,mode);prepareDungeonChoices();});
 await page.locator('.upgrade-card').first().click();assert.equal(await page.evaluate(id=>actors.find(a=>a.id==='newcomer').appliedAugments.includes(id),picked),true);
 await page.evaluate(()=>{setMode('dungeon');start({focus:false});});
 assert.equal(await page.evaluate(()=>actors.filter(a=>a.team===0).every(a=>a.job)),true);assert.equal(await page.locator('#upgrade-panel').isVisible(),false);
 await page.evaluate(()=>{floor=3;actors=actors.filter(a=>a.team===0);wave();});assert.equal(await page.evaluate(()=>dungeonRun.augments.length),1);assert.equal(await page.locator('#upgrade-panel').isVisible(),false);
 await page.evaluate(()=>{const count=dungeonRun.augments.length;wave();window.sameRewardCount=count;});assert.equal(await page.evaluate(()=>dungeonRun.augments.length===sameRewardCount),true);
 assert.deepEqual(errors,[]);console.log('PASS: manual jobs and weapons, combat waits for choice, 3-card reward, inherited augments, automatic job/reward choices, no duplicate floor reward.');
}finally{await browser.close();}})().catch(e=>{console.error(e);process.exit(1);});

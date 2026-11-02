const {chromium}=require('playwright');const {pathToFileURL}=require('node:url');const path=require('node:path');const assert=require('node:assert/strict');
(async()=>{const browser=await chromium.launch({channel:'chrome',headless:true});try{
 const page=await browser.newPage({viewport:{width:560,height:355}}),errors=[];page.on('pageerror',e=>errors.push(e.message));
 await page.addInitScript(()=>{window.make=n=>({id:'app-'+n,name:'동료 '+n,source:'running',hp:100,atk:10,color:'#aabbdd',emoji:'🌐',role:'앱 모험가'});window.fake=[make(1),make(2)];window.desktop={getRunningApps:async()=>fake,getIcons:async()=>[],setCompact:async()=>{},togglePin:async()=>true};});
 await page.goto(pathToFileURL(path.resolve('index.html')).href);await page.waitForFunction(()=>started);await page.evaluate(()=>{const original=combatEvents;window.impact=null;combatEvents=events=>{if(events.some(e=>e.type==='damage'&&e.sourceId==='hero'))window.impact={distance:Math.hypot(TurnCombat.visualPosition(actors[0]).x-actors[1].x,TurnCombat.visualPosition(actors[0]).y-actors[1].y),reach:actors[0].meleeReach};original(events);};});
 await page.evaluate(()=>{window.draws=0;const original=DungeonAugments.randomJob;DungeonAugments.randomJob=options=>{draws++;return original(options);};start({focus:false});paused=true;});assert.equal(await page.evaluate(()=>draws),2);
 await page.evaluate(()=>{start({focus:false});paused=true;});assert.equal(await page.evaluate(()=>draws),4);
 await page.evaluate(()=>{fake.push(make(3));applyRunningSnapshot(fake);});assert.equal(await page.evaluate(()=>draws),5);
 await page.evaluate(()=>{fake=fake.filter(a=>a.id!=='app-3');applyRunningSnapshot(fake);fake.push(make(3));applyRunningSnapshot(fake);});assert.equal(await page.evaluate(()=>draws),6);
 for(const job of ['warrior','rogue']){
  await page.evaluate(job=>{window.impact=null;auto=true;started=true;paused=false;mode='dungeon';dungeonRun=DungeonAugments.create();const hero=actor({id:'hero',name:'숨길 이름',source:'desktop',emoji:'📁',color:'#dfc26a',hp:500,atk:20},180,175,0);DungeonAugments.assign(hero,job,dungeonRun);actors=[hero,actor({id:'target',name:'숨길 악당',skinId:'slime',image:EnemyPresets[0].image,color:'#99bb66',hp:1000,atk:1},610,130,1)];TurnCombat.layout(actors,mode);turnState=TurnCombat.create();turnState.queue=['hero'];turnState.timer=0;},job);
  await page.waitForFunction(()=>actors[0].motion?.elapsed>.06&&turnState.phase==='windup');assert.ok(await page.evaluate(()=>TurnCombat.visualPosition(actors[0]).x)>180);assert.equal(await page.evaluate(()=>actors[1].hp),1000);
  await page.waitForFunction(()=>actors[1].hp<1000);assert.equal(await page.evaluate(()=>impact&&impact.distance<=impact.reach+1),true);
  await page.waitForFunction(()=>!actors[0].motion);assert.deepEqual(await page.evaluate(()=>TurnCombat.visualPosition(actors[0])),{x:180,y:175});
 }
 const names=await page.evaluate(()=>{paused=true;const old=ctx.fillText,out=[];ctx.fillText=function(text,...args){out.push(text);return old.call(this,text,...args);};try{for(const a of actors)drawActor(a);}finally{ctx.fillText=old;}return out;});assert.ok(!names.includes('숨길 이름')&&!names.includes('숨길 악당'));
 for(const id of ['clock-now','clock-until']){assert.equal(await page.locator('#'+id).evaluate(el=>getComputedStyle(el).color),'rgb(255, 255, 255)');assert.match(await page.locator('#'+id).evaluate(el=>getComputedStyle(el).textShadow),/rgb\(0, 0, 0\)/);}
 await page.screenshot({path:'melee-jobs-preview.png',omitBackground:true});assert.deepEqual(errors,[]);console.log('PASS: fresh random jobs on restart/join/reopen, warrior and rogue approach before damage and return home, all icon names removed, outlined white clock.');
}finally{await browser.close();}})().catch(e=>{console.error(e);process.exit(1);});

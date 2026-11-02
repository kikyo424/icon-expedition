const {chromium}=require('playwright');const {pathToFileURL}=require('node:url');const path=require('node:path');const assert=require('node:assert/strict');
(async()=>{const browser=await chromium.launch({channel:'chrome',headless:true});try{
 const page=await browser.newPage({viewport:{width:560,height:355}}),errors=[];page.on('pageerror',e=>errors.push(e.message));
 await page.addInitScript(()=>{window.apps=Array.from({length:6},(_,i)=>({id:'app-'+i,name:'앱 '+i,source:'running',hp:160,atk:20,color:'#c5db9f',emoji:['📁','🌐','🗑️','🌸','🎵','📦'][i],iconSizePx:32,role:'앱 모험가'}));window.desktop={getRunningApps:async()=>apps,getIcons:async()=>[],setCompact:async()=>{},togglePin:async()=>true};});
 await page.goto(pathToFileURL(path.resolve('index.html')).href);await page.waitForFunction(()=>started);await page.locator('#widget-menu-toggle').click();await page.locator('[data-widget-mode="battle"]').click();
 const before=await page.evaluate(()=>actors.reduce((sum,a)=>sum+Math.hypot(a.x-480,a.y-280),0));await page.waitForTimeout(1600);
 assert.ok(await page.evaluate(()=>actors.filter(a=>a.hp>0).reduce((sum,a)=>sum+Math.hypot(a.x-480,a.y-280),0))<before*.7);assert.equal(await page.evaluate(()=>turnState.round),0);
 await page.screenshot({path:'brawl-preview.png',omitBackground:true});
 await page.locator('#widget-manual').click();await page.evaluate(()=>{actors[0].x=250;actors[0].y=280;actors[0].vx=0;actors[0].vy=0;for(const a of actors.slice(1)){a.x=800;a.hp=a.maxHp;}});
 const x=await page.evaluate(()=>actors[0].x);await page.locator('#game').press('ArrowLeft',{delay:300});assert.ok(await page.evaluate(()=>actors[0].x)<x);
 await page.locator('#widget-auto').click();await page.evaluate(()=>{for(let i=0;i<7200&&started;i++)battle(1/60);});
 assert.equal(await page.evaluate(()=>actors.filter(a=>a.hp>0).length),1);assert.equal(await page.evaluate(()=>started),false);assert.match(await page.locator('#overlay-title').textContent(),/우승/);
 assert.equal(await page.locator('#overlay').evaluate(el=>getComputedStyle(el).backgroundColor),'rgba(0, 0, 0, 0)');assert.deepEqual(errors,[]);console.log('PASS: six icons rush into a real-time brawl, manual movement, automatic last survivor, transparent result.');
}finally{await browser.close();}})().catch(e=>{console.error(e);process.exit(1);});

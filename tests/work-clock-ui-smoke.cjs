const {chromium}=require('playwright');const {pathToFileURL}=require('node:url');const path=require('node:path');const assert=require('node:assert/strict');
(async()=>{const browser=await chromium.launch({channel:'chrome',headless:true});try{
 const page=await browser.newPage({viewport:{width:560,height:355}}),errors=[];page.on('pageerror',e=>errors.push(e.message));await page.goto(pathToFileURL(path.resolve('index.html')).href);
 await page.evaluate(async()=>{await document.getElementById('compact').onclick();start({focus:false});paused=true;});
 assert.equal(await page.locator('#clock-until').textContent(),'퇴근 시각 입력');assert.match(await page.locator('#clock-now').textContent(),/^\d{2}:\d{2}:\d{2}$/);
 await page.locator('#clock-until').click();await page.locator('#leave-at').fill('18:30');await page.locator('#clock-editor button[type="submit"]').click();assert.match(await page.locator('#clock-until').textContent(),/퇴근까지|퇴근/);
 const before=await page.locator('#clock-now').textContent();await page.waitForFunction(previous=>document.getElementById('clock-now').textContent!==previous,before,{timeout:6000});assert.notEqual(await page.locator('#clock-now').textContent(),before);
 assert.doesNotMatch(await page.locator('#turn-banner').textContent(),/R1|준비|행동|차례/);
 const labels=await page.evaluate(()=>{const old=ctx.fillText,calls=[];ctx.fillText=(...args)=>calls.push(args[0]);try{for(const job of Object.keys(DungeonAugments.jobs))AugmentView.weapon(ctx,{job},32);}finally{ctx.fillText=old;}return calls;});assert.deepEqual(labels,[]);
 await page.screenshot({path:'work-clock-preview.png',omitBackground:true});
 await page.reload();await page.locator('#clock-until').click();assert.equal(await page.locator('#leave-at').inputValue(),'18:30');await page.locator('#leave-at').fill('');await page.locator('#clock-editor button[type="submit"]').click();assert.equal(await page.locator('#clock-until').textContent(),'퇴근 시각 입력');
 assert.deepEqual(errors,[]);console.log('PASS: direct leave-time entry, persistence and clear, clock updates while paused, no action banner, weapons have no job badge text.');
}finally{await browser.close();}})().catch(e=>{console.error(e);process.exit(1);});

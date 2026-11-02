const {_electron}=require('playwright');
const assert=require('node:assert/strict');
const path=require('node:path');
const fs=require('node:fs');
(async()=>{
 const profile=path.join(__dirname,'.profiles','desktop-'+process.pid+'-'+Date.now());
 const app=await _electron.launch({executablePath:require('electron'),args:['.'],env:{...process.env,ICON_EXPEDITION_TEST_PROFILE:profile}});
 const state=()=>app.evaluate(({BrowserWindow})=>{const w=BrowserWindow.getAllWindows()[0];return {bounds:w.getBounds(),resizable:w.isResizable(),pinned:w.isAlwaysOnTop(),max:w.getMaximumSize()};});
 async function fixedSize(){for(let i=0;i<30;i++){const s=await state();if(s.bounds.width===560&&s.bounds.height===355&&!s.resizable)return;await new Promise(resolve=>setTimeout(resolve,100));}assert.fail('Widget failed to settle: '+JSON.stringify(await state()));}
 try{
  const page=await app.firstWindow();const errors=[];page.on('pageerror',e=>errors.push(e.message));await page.waitForLoadState('domcontentloaded');
  await page.waitForFunction(()=>started&&!runningBusy&&roster.length>0&&document.body.classList.contains('compact'),null,{timeout:60000});
  assert.equal(await page.evaluate(()=>roster.every(a=>a.source==='running'&&a.image&&a.name!=='아이콘 원정대'&&a.name.toLowerCase()!=='electron')),true);
  await fixedSize();await page.waitForTimeout(200);
  assert.equal(await page.evaluate(()=>getComputedStyle(document.body).backgroundColor),'rgba(0, 0, 0, 0)');
  assert.equal(await page.locator('.widget-toolbar').evaluate(el=>getComputedStyle(el).backgroundColor),'rgba(0, 0, 0, 0)');
  await page.evaluate(()=>ctx.getImageData(0,0,canvas.width,canvas.height));await page.screenshot({path:'live-widget-preview.png',omitBackground:true});
  await page.locator('#widget-expand').evaluate(el=>el.onclick());assert.equal(await page.evaluate(()=>document.body.classList.contains('compact')),false);assert.equal((await state()).resizable,true);
  await page.evaluate(()=>setSource('desktop'));
  const count=await page.evaluate(()=>roster.length);assert.ok(count>0);assert.equal(await page.evaluate(()=>roster.every(a=>a.source==='desktop')),true);
  await page.evaluate(()=>{start({focus:false});paused=true;});
  await page.waitForFunction(()=>{const a=actors.find(a=>a.source==='desktop'),img=imageFor(a);return img&&img.complete&&img.naturalWidth>0;});
  const rendering=await page.evaluate(()=>{const a=actors.find(a=>a.source==='desktop');a.attackTime=0;const original=ctx.drawImage;let pixels=0;ctx.drawImage=function(image,x,y,width,height){const t=this.getTransform();pixels=Math.max(width*t.a*canvas.clientWidth/canvas.width,height*t.d*canvas.clientHeight/canvas.height)*devicePixelRatio;return original.apply(this,arguments);};try{drawActor(a);}finally{ctx.drawImage=original;}return {actual:pixels,expected:a.iconSizePx};});
  assert.ok(Math.abs(rendering.actual-rendering.expected)<.01);
  for(const mode of ['jump','battle']){await page.evaluate(mode=>{setMode(mode);start({focus:false});paused=true;},mode);assert.equal(await page.evaluate(()=>actors.every(a=>a.source==='desktop')),true);}
  await page.locator('#compact').evaluate(el=>el.onclick());assert.equal(await page.evaluate(()=>document.body.classList.contains('compact')),true);await fixedSize();
  await app.evaluate(({BrowserWindow})=>BrowserWindow.getAllWindows()[0].setPosition(80,80));await page.waitForTimeout(600);
  assert.deepEqual(JSON.parse(fs.readFileSync(path.join(profile,'widget-position.json'),'utf8')),{x:80,y:80});
  assert.equal((await state()).pinned,true);
  await page.keyboard.press('Escape');await page.waitForFunction(()=>!document.body.classList.contains('compact'));assert.equal((await state()).resizable,true);
  assert.deepEqual(errors,[]);console.log('PASS: native running-app roster, transparent fixed widget, desktop icons ('+count+'), actual icon size, all games, saved position, expand/compact restoration.');
 }finally{await app.close();}
})().catch(e=>{console.error(e);process.exit(1);});

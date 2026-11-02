const {chromium}=require('playwright');
const {pathToFileURL}=require('node:url');const path=require('node:path');const assert=require('node:assert/strict');
(async()=>{
 const browser=await chromium.launch({channel:'chrome',headless:true});
 try{
  const page=await browser.newPage({viewport:{width:1200,height:850}});const errors=[];page.on('pageerror',error=>errors.push(error.message));
  await page.addInitScript(()=>{
   const image='data:image/svg+xml,'+encodeURIComponent('<svg xmlns="http://www.w3.org/2000/svg" width="32" height="32"><rect width="32" height="32" rx="8" fill="#76b5df"/></svg>');
   window.makeApp=(id,active=false)=>({id:'app-'+id,name:id,source:'running',image,active,iconSizePx:32,hp:500,atk:10,color:'#76b5df',role:'탭 마법사'});
   window.fakeApps=['Chrome','Excel','Code'].map(id=>window.makeApp(id,id==='Chrome'));
   window.desktop={getRunningApps:async()=>window.fakeApps,getIcons:()=>new Promise(resolve=>{window.resolveDesktop=resolve;}),setCompact:async()=>{},togglePin:async()=>true,windowAction:async()=>{}};
  });
  await page.goto(pathToFileURL(path.resolve('index.html')).href);
  await page.waitForFunction(()=>started&&sourceMode==='running');
  assert.equal(await page.evaluate(()=>document.activeElement===canvas),false,'automatic play must not focus the canvas');
  assert.equal(await page.evaluate(()=>actors.filter(a=>a.source==='running').length),3);
  await page.evaluate(()=>{paused=true;actors.find(a=>a.id==='app-Chrome').hp=123;window.fakeApps.push(makeApp('KakaoTalk'));applyRunningSnapshot(fakeApps);});
  assert.equal(await page.evaluate(()=>actors.filter(a=>a.source==='running').length),4);
  assert.equal(await page.evaluate(()=>actors.find(a=>a.id==='app-Chrome').hp),123);
  await page.locator('#widget-expand').evaluate(el=>el.onclick());
  await page.locator('#roster .character').filter({hasText:'Excel'}).evaluate(el=>el.click());
  await page.evaluate(()=>applyRunningSnapshot(fakeApps));
  assert.equal(await page.evaluate(()=>selected.includes('app-Excel')),false);
  await page.evaluate(()=>{fakeApps=fakeApps.filter(a=>a.id!=='app-Code');applyRunningSnapshot(fakeApps);});
  assert.equal(await page.evaluate(()=>actors.some(a=>a.id==='app-Code')),false);
  // A slow desktop response must not overwrite a newer running-app source.
  await page.evaluate(()=>{window.pendingDesktop=setSource('desktop');});
  await page.evaluate(()=>setSource('running'));
  await page.evaluate(async()=>{resolveDesktop([{id:'stale-file',name:'old response',hp:100,atk:1}]);await pendingDesktop;});
  assert.equal(await page.evaluate(()=>sourceMode==='running'&&roster.every(a=>a.source==='running')),true);
  assert.equal(await page.locator('.sidebar').isVisible(),true,'source changes must keep the settings open');
  await page.evaluate(()=>{fakeApps=[];applyRunningSnapshot([]);});
  assert.equal(await page.evaluate(()=>started),false);
  await page.evaluate(async()=>{fakeApps=[makeApp('NewApp')];await loadRunning();});
  assert.equal(await page.evaluate(()=>started&&selected[0]==='app-NewApp'),true);
  await page.evaluate(()=>{setMode('jump');start({focus:false});paused=true;applyRunningSnapshot([makeApp('OtherApp')]);});
  assert.equal(await page.evaluate(()=>actors.length===1&&actors[0].grounded&&actors[0].y===410),true);
  await page.reload();await page.waitForFunction(()=>!runningBusy);
  assert.equal(await page.evaluate(()=>excludedApps.has('app-Excel')),true,'excluded apps must persist');
  assert.deepEqual(errors,[]);
  console.log('PASS: live join/leave, retained health, exclusions and persistence, stale source response, no focus stealing, empty party recovery, jump replacement.');
 }finally{await browser.close();}
})().catch(error=>{console.error(error);process.exit(1);});

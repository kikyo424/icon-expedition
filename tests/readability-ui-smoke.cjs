const {chromium}=require('playwright');const {pathToFileURL}=require('node:url');const path=require('node:path');const assert=require('node:assert/strict');
(async()=>{const browser=await chromium.launch({channel:'chrome',headless:true});try{
 for(const dpr of [1,2]){
  const page=await browser.newPage({viewport:{width:560,height:355},deviceScaleFactor:dpr});const errors=[];page.on('pageerror',e=>errors.push(e.message));await page.goto(pathToFileURL(path.resolve('index.html')).href);
  await page.evaluate(async()=>{await document.getElementById('compact').onclick();start({focus:false});paused=true;draw();});
  const metrics=await page.evaluate(()=>({width:canvas.width,expected:Math.round(canvas.clientWidth*devicePixelRatio),font:getComputedStyle(document.body).fontFamily,clock:parseFloat(getComputedStyle(document.getElementById('clock-now')).fontSize),until:parseFloat(getComputedStyle(document.getElementById('clock-until')).fontSize)}));assert.equal(metrics.width,metrics.expected);assert.match(metrics.font,/Malgun Gothic/);assert.ok(metrics.clock>=14&&metrics.until>=13);
  const stroke=await page.evaluate(()=>{const original=ctx.strokeText;let result;ctx.strokeText=function(...args){const t=this.getTransform();result=ctx.lineWidth*Math.hypot(t.a,t.b)*canvas.clientWidth/canvas.width;return original.apply(this,args);};try{ctx.font='22px "Malgun Gothic"';ctx.fillText('가독성 123',100,100);}finally{ctx.strokeText=original;}return result;});assert.ok(stroke>.7&&stroke<.9);
  assert.deepEqual(errors,[]);if(dpr===1)await page.screenshot({path:'readability-preview.png',omitBackground:true});await page.close();
 }
 console.log('PASS: local Korean font, larger clocks, thin text outlines, 1x/2x high-DPI canvas rendering.');
}finally{await browser.close();}})().catch(e=>{console.error(e);process.exit(1);});

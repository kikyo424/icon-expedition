(function(root){
 function weapon(ctx,a,size){
  const job=DungeonAugments.jobs[a.job];if(!job)return;
  const progress=1-(a.attackTime||0)/(a.animDuration||1);const swing=a.job==='warrior'?-Math.sin(progress*Math.PI)*1.2:a.job==='rogue'?Math.sin(progress*Math.PI*4)*.7:a.job==='mage'?Math.sin(progress*Math.PI)*.15:-Math.sin(progress*Math.PI)*.3;
  ctx.save();ctx.translate(size/2+9,2);ctx.rotate(a.attackTime>0&&!a.guardAnim?swing:.18);ctx.lineWidth=1.5;
  if(a.job==='warrior'||a.job==='rogue'){
   const length=a.job==='warrior'?21:12;ctx.fillStyle=a.job==='warrior'?'#d8e4ef':'#cbb6ed';ctx.strokeStyle='#586477';ctx.beginPath();ctx.moveTo(0,-length);ctx.lineTo(4,-length+6);ctx.lineTo(3,6);ctx.lineTo(-3,6);ctx.lineTo(-4,-length+6);ctx.closePath();ctx.fill();ctx.stroke();ctx.fillStyle='#d4b26d';ctx.fillRect(-6,5,12,3);ctx.fillStyle='#755b43';ctx.fillRect(-2,8,4,8);
  }else if(a.job==='mage'){
   ctx.fillStyle='#625393';ctx.strokeStyle='#c6b3ec';ctx.beginPath();ctx.roundRect(-8,-11,17,23,2);ctx.fill();ctx.stroke();ctx.fillStyle='#eedfac';ctx.fillRect(-5,-8,10,16);ctx.strokeStyle='#8c7aad';ctx.beginPath();ctx.moveTo(0,-8);ctx.lineTo(0,8);ctx.stroke();ctx.fillStyle='#7f9fda';ctx.beginPath();ctx.arc(0,0,3,0,Math.PI*2);ctx.fill();
  }else{
   ctx.strokeStyle='#a9895f';ctx.lineWidth=3;ctx.beginPath();ctx.moveTo(0,-6);ctx.lineTo(0,17);ctx.stroke();ctx.strokeStyle='#d5dba6';ctx.lineWidth=2;ctx.beginPath();ctx.arc(0,-11,6,0,Math.PI*2);ctx.stroke();ctx.fillStyle='#a8e0bc';ctx.beginPath();ctx.arc(0,-11,3.5,0,Math.PI*2);ctx.fill();
  }
  ctx.restore();
 }
 root.AugmentView={weapon};
})(typeof globalThis!=='undefined'?globalThis:this);

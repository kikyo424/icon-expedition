(function(root){
 'use strict';
 function draw(ctx,e){
  const t=1-e.life/e.max,boost=e.skill?1.45:1;ctx.save();ctx.globalAlpha=Math.min(1,e.life/.18);ctx.strokeStyle=e.color;ctx.fillStyle=e.color;ctx.lineWidth=2*boost;
  for(const target of e.targets){
   const dx=target.x-e.x,dy=target.y-e.y,angle=Math.atan2(dy,dx),x=e.x+dx*t,y=e.y+dy*t;
   const local=(px,py,fn)=>{ctx.save();ctx.translate(px,py);fn();ctx.restore();};
   switch(e.style){
    case 'greatsword':local(e.x+dx*Math.min(1,t*1.9),e.y+dy*Math.min(1,t*1.9),()=>{ctx.rotate(angle-Math.PI/2-1.1+t*2.6);ctx.fillStyle='#e3eaf0';ctx.strokeStyle='#637483';ctx.beginPath();ctx.moveTo(0,-45*boost);ctx.lineTo(8,-30*boost);ctx.lineTo(6,12);ctx.lineTo(-6,12);ctx.lineTo(-8,-30*boost);ctx.closePath();ctx.fill();ctx.stroke();ctx.fillStyle='#dab978';ctx.fillRect(-14,10,28,5);ctx.fillStyle='#7e6047';ctx.fillRect(-4,15,8,18);});if(t>.35){ctx.strokeStyle='#f5edd1';ctx.lineWidth=4*boost;ctx.beginPath();ctx.arc(target.x,target.y,40*boost,-1.7+t,1.5+t);ctx.stroke();}break;
    case 'dagger':for(let i=0;i<(e.skill?4:2);i++){const q=Math.max(0,Math.min(1,t*1.6-i*.16));local(e.x+dx*q,e.y+dy*q+(i%2?1:-1)*Math.sin(q*Math.PI)*20,()=>{ctx.rotate(angle+Math.PI/2);ctx.fillStyle='#d8c8ee';ctx.strokeStyle='#69547e';ctx.beginPath();ctx.moveTo(0,-25);ctx.lineTo(5,-13);ctx.lineTo(3,5);ctx.lineTo(-3,5);ctx.lineTo(-5,-13);ctx.closePath();ctx.fill();ctx.stroke();ctx.fillStyle='#b991db';ctx.fillRect(-8,4,16,3);ctx.fillRect(-2,7,4,9);ctx.strokeStyle='#e1c8ff';ctx.beginPath();ctx.moveTo(-2,21);ctx.lineTo(0,40);ctx.stroke();});}break;
    case 'spellbook':ctx.strokeStyle='#c5b5f4';ctx.lineWidth=2;ctx.beginPath();ctx.arc(e.x,e.y,18+t*20,0,Math.PI*2);ctx.stroke();for(let i=0;i<(e.skill?3:1);i++){const phase=i*2.1+t*9;local(x+Math.sin(phase)*16*Math.sin(t*Math.PI),y+Math.cos(phase)*16*Math.sin(t*Math.PI),()=>{ctx.fillStyle='#b6c9fa';ctx.beginPath();ctx.arc(0,0,(e.skill?9:7)*boost,0,Math.PI*2);ctx.fill();ctx.strokeStyle='#e5d5ff';ctx.beginPath();ctx.arc(0,0,14*boost,phase,phase+4);ctx.stroke();ctx.font='bold 17px serif';ctx.textAlign='center';ctx.fillText('✧',0,6);});}break;
    case 'staff':ctx.strokeStyle=target.support?'#b8f0c9':'#f3dda2';ctx.fillStyle=ctx.strokeStyle;ctx.lineWidth=(target.support?4:2)*boost;ctx.beginPath();ctx.moveTo(e.x+18,e.y-12);ctx.quadraticCurveTo((e.x+target.x)/2,(e.y+target.y)/2-40*Math.sin(t*Math.PI),target.x,target.y);ctx.stroke();local(target.x,target.y,()=>{ctx.rotate(t*Math.PI*.7);ctx.beginPath();ctx.arc(0,0,15+t*25,0,Math.PI*2);ctx.stroke();ctx.fillRect(-3,-13,6,26);ctx.fillRect(-13,-3,26,6);});break;
    case 'tabs':case 'paper':case 'report':case 'printer':case 'grid':case 'slides':
     for(let i=0;i<(e.skill?3:1);i++){const q=Math.max(0,Math.min(1,t*1.3-i*.15));local(e.x+dx*q,e.y+dy*q-Math.sin(q*Math.PI)*30*(i+1),()=>{
      if(e.style==='paper'||e.style==='printer')ctx.rotate(q*Math.PI*2);
      ctx.fillStyle=e.style==='report'?'#f2c9b9':e.color;ctx.beginPath();ctx.roundRect(-15,-12,30,24,3);ctx.fill();ctx.strokeStyle='#24312d';ctx.lineWidth=2;
      if(e.style==='tabs'){ctx.strokeRect(-12,-9,24,5);ctx.beginPath();ctx.moveTo(-10,2);ctx.lineTo(8,2);ctx.stroke();}
      else if(e.style==='grid'){for(let k=-6;k<=6;k+=6){ctx.beginPath();ctx.moveTo(k,-10);ctx.lineTo(k,10);ctx.moveTo(-13,k);ctx.lineTo(13,k);ctx.stroke();}}
      else if(e.style==='slides'){ctx.beginPath();ctx.moveTo(-8,7);ctx.lineTo(-2,0);ctx.lineTo(3,4);ctx.lineTo(10,-6);ctx.stroke();}
      else{for(let k=-5;k<=5;k+=5){ctx.beginPath();ctx.moveTo(-9,k);ctx.lineTo(9,k);ctx.stroke();}}
     });}
     if(e.style==='report'&&t>.6){ctx.save();ctx.translate(target.x,target.y);ctx.rotate(-.25);ctx.font='bold 18px system-ui';ctx.strokeStyle='#ec9d8d';ctx.strokeRect(-26,-14,52,28);ctx.fillStyle='#ec9d8d';ctx.textAlign='center';ctx.fillText('반려',0,6);ctx.restore();}break;
    case 'chat':local(x,y-Math.sin(t*Math.PI)*45,()=>{ctx.fillStyle=e.color;ctx.beginPath();ctx.roundRect(-19,-14,38,27,9);ctx.fill();ctx.beginPath();ctx.moveTo(-5,10);ctx.lineTo(-12,21);ctx.lineTo(5,10);ctx.fill();ctx.fillStyle='#2c3324';for(let i=-8;i<=8;i+=8){ctx.beginPath();ctx.arc(i,0,2,0,Math.PI*2);ctx.fill();}});break;
    case 'signal':local(x,y,()=>{ctx.rotate(t*Math.PI*2);for(let i=0;i<3;i++){ctx.strokeRect(-12-i*5,-12-i*5,24+i*10,24+i*10);}ctx.beginPath();ctx.moveTo(-8,0);ctx.lineTo(8,0);ctx.moveTo(0,-8);ctx.lineTo(0,8);ctx.stroke();});break;
    case 'code':ctx.beginPath();ctx.moveTo(e.x,e.y);for(let i=1;i<=12;i++){const p=i/12;ctx.lineTo(e.x+dx*p-Math.sin(i*2.7+t*22)*12,e.y+dy*p+Math.cos(i*2.7+t*22)*12);}ctx.stroke();ctx.font='bold 20px monospace';ctx.textAlign='center';ctx.fillText('</>',x,y-12);break;
    case 'sound':for(let i=0;i<3;i++){const q=(t+i*.23)%1;ctx.beginPath();ctx.arc(e.x+dx*q,e.y+dy*q,12+q*25,angle-1.1,angle+1.1);ctx.stroke();}break;
    case 'orbit':local(x,y,()=>{ctx.rotate(t*Math.PI*3);ctx.beginPath();ctx.ellipse(0,0,26,10,0,0,Math.PI*2);ctx.stroke();ctx.beginPath();ctx.ellipse(0,0,26,10,Math.PI/3,0,Math.PI*2);ctx.stroke();ctx.beginPath();ctx.arc(0,0,8,0,Math.PI*2);ctx.fill();});break;
    case 'flame':local(x,y,()=>{ctx.fillStyle='#f0b363';ctx.beginPath();ctx.moveTo(18,2);ctx.quadraticCurveTo(-7,-25,-27,-13);ctx.quadraticCurveTo(-10,0,-27,18);ctx.quadraticCurveTo(5,22,18,2);ctx.fill();ctx.fillStyle='#ffe4a0';ctx.beginPath();ctx.arc(4,2,9,0,Math.PI*2);ctx.fill();});break;
    case 'shield':local(target.x,target.y,()=>{const r=25+Math.sin(t*Math.PI)*16;ctx.beginPath();ctx.moveTo(0,-r);ctx.lineTo(r*.8,-r*.5);ctx.lineTo(r*.65,r*.5);ctx.lineTo(0,r);ctx.lineTo(-r*.65,r*.5);ctx.lineTo(-r*.8,-r*.5);ctx.closePath();ctx.stroke();ctx.globalAlpha*=.25;ctx.fill();});break;
    case 'drain':for(let i=0;i<6;i++){const p=(t+i*.13)%1;ctx.beginPath();ctx.arc(target.x-dx*p+Math.sin(p*9+i)*18,target.y-dy*p+Math.cos(p*9+i)*18,3+4*p,0,Math.PI*2);ctx.fill();}break;
    case 'petal':for(let i=0;i<5;i++){const a=angle+i*1.25;local(x+Math.cos(a+t*5)*23,y+Math.sin(a+t*5)*23,()=>{ctx.rotate(a+t*6);ctx.beginPath();ctx.ellipse(0,0,11,5,0,0,Math.PI*2);ctx.fill();});}break;
    case 'slime':local(x,y-Math.sin(t*Math.PI)*70,()=>{ctx.beginPath();ctx.moveTo(0,-18);ctx.bezierCurveTo(22,2,14,19,0,19);ctx.bezierCurveTo(-14,19,-22,2,0,-18);ctx.fill();});if(t>.65){for(let i=0;i<5;i++){ctx.beginPath();ctx.arc(target.x+Math.cos(i*1.25)*t*25,target.y+Math.sin(i*1.25)*t*25,5,0,Math.PI*2);ctx.fill();}}break;
    case 'calendar':case 'clock':local(target.x,target.y,()=>{const r=20+t*18;ctx.rotate(e.style==='calendar'?-t*.4:0);if(e.style==='calendar'){ctx.strokeRect(-r,-r,r*2,r*2);ctx.fillRect(-r,-r,r*2,8);ctx.font='bold 19px monospace';ctx.textAlign='center';ctx.fillText('D-0',0,9);}else{ctx.beginPath();ctx.arc(0,0,r,0,Math.PI*2);ctx.stroke();for(let i=0;i<12;i++){const a=i*Math.PI/6;ctx.beginPath();ctx.moveTo(Math.cos(a)*(r-4),Math.sin(a)*(r-4));ctx.lineTo(Math.cos(a)*r,Math.sin(a)*r);ctx.stroke();}ctx.rotate(t*Math.PI*6);ctx.beginPath();ctx.moveTo(0,0);ctx.lineTo(0,-r+7);ctx.stroke();}});break;
    case 'briefcase':local(x,y-Math.sin(t*Math.PI)*55,()=>{ctx.rotate(Math.sin(t*Math.PI)*2);ctx.fillRect(-19,-12,38,27);ctx.strokeRect(-8,-20,16,9);ctx.fillStyle='#31402a';ctx.fillRect(-3,-3,6,7);});break;
    default:local(target.x,target.y,()=>{ctx.rotate(angle-.6);ctx.beginPath();ctx.moveTo(-35*(1-t),-25);ctx.quadraticCurveTo(22,0,30,25);ctx.stroke();});
   }
  }
  ctx.restore();
 }
 function pose(ctx,a,style){
  if(!(a.attackTime>0))return;const t=1-a.attackTime/(a.animDuration||.7),wave=Math.sin(t*Math.PI);
  if(style==='guard'){ctx.scale(1+wave*.04,1-wave*.04);}
  else if(style==='greatsword'){ctx.translate((a.attackDx||1)*wave*10,0);ctx.rotate(-wave*.4);}
  else if(style==='dagger'){ctx.translate((a.attackDx||1)*Math.sin(t*Math.PI*3)*wave*10,Math.sin(t*20)*wave*3);ctx.rotate(wave*.25);}
  else if(style==='spellbook'){ctx.translate(0,-wave*8);ctx.rotate(Math.sin(t*Math.PI*2)*.1);}
  else if(style==='staff'){ctx.translate(-wave*3,-wave*5);ctx.rotate(wave*.15);}
  else if(['tabs','orbit','sound','calendar','clock'].includes(style)){ctx.translate(0,-wave*7);ctx.scale(1+wave*.12,1+wave*.12);}
  else if(['paper','grid','slides','report','printer'].includes(style)){ctx.rotate(Math.sin(t*Math.PI*2)*.25);ctx.translate(wave*5,0);}
  else if(['chat','signal','petal'].includes(style)){ctx.rotate(Math.sin(t*Math.PI*3)*.2);ctx.translate(0,-wave*5);}
  else if(style==='slime'){ctx.scale(1+wave*.3,1-wave*.25);}
  else if(style==='code'){ctx.translate(Math.sin(t*40)*wave*4,0);}
  else if(style==='drain'){ctx.rotate(wave*.35);ctx.scale(1+wave*.2,1+wave*.2);}
  else{ctx.translate((a.attackDx||1)*wave*11,(a.attackDy||0)*wave*11);ctx.rotate(wave*.16);}
 }
 root.CombatFX={draw,pose};
})(typeof globalThis!=='undefined'?globalThis:this);

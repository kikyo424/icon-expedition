(function(root){
 'use strict';
 function overlap(a,b){return a.x<b.x+b.w&&a.x+a.w>b.x&&a.y<b.y+b.h&&a.y+a.h>b.y;}
 function target(actor,actors){return actors.filter(a=>a.hp>0&&a.team!==actor.team).sort((a,b)=>Math.hypot(a.x-actor.x,a.y-actor.y)-Math.hypot(b.x-actor.x,b.y-actor.y))[0];}
 function move(actor,dx,dy,speed,dt,bounds){const n=Math.hypot(dx,dy)||1;actor.x=Math.max(bounds.left,Math.min(bounds.right,actor.x+dx/n*speed*dt));actor.y=Math.max(bounds.top,Math.min(bounds.bottom,actor.y+dy/n*speed*dt));}
 function stepJump(p,dt,jump){if(jump&&p.grounded){p.vy=-550;p.grounded=false;}p.vy+=1400*dt;p.y+=p.vy*dt;if(p.y>=410){p.y=410;p.vy=0;p.grounded=true;}}
 function separate(actors,gap=84,bounds={left:80,right:880,top:110,bottom:450}){
  const living=actors.filter(a=>a.hp>0);
  for(let pass=0;pass<16;pass++){
   for(let i=0;i<living.length;i++)for(let j=i+1;j<living.length;j++){
    const a=living[i],b=living[j];let dx=b.x-a.x,dy=b.y-a.y,d=Math.hypot(dx,dy);
    if(d>=gap)continue;
    if(d<.001){const angle=(i*2.399+j)*1.618;dx=Math.cos(angle);dy=Math.sin(angle);d=1;}
    const push=(gap-d)/2+.01;const nx=dx/d,ny=dy/d;
    a.x-=nx*push;a.y-=ny*push;b.x+=nx*push;b.y+=ny*push;
   }
   for(const a of living){a.x=Math.max(bounds.left,Math.min(bounds.right,a.x));a.y=Math.max(bounds.top,Math.min(bounds.bottom,a.y));}
  }
 }
 const api={overlap,target,move,stepJump,separate};if(typeof module!=='undefined')module.exports=api;root.GameMath=api;
})(typeof globalThis!=='undefined'?globalThis:this);

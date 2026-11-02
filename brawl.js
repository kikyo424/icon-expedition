(function(root){
 'use strict';
 function hash(id){let n=0;for(const ch of String(id))n=(Math.imul(n,31)+ch.charCodeAt(0))>>>0;return n;}
 function create(){return {elapsed:0};}
 function spawn(a,i=0,count=6){const angle=count?i/count*Math.PI*2-Math.PI/2:hash(a.id)%628/100;a.x=480+Math.cos(angle)*270;a.y=280+Math.sin(angle)*165;a.vx=0;a.vy=0;a.brawlSeed=hash(a.id)%1000;a.brawlCooldown=.2+i*.07;a.brawlReady=true;a.motion=null;a.brawlTilt=0;}
 function initialize(actors){actors.forEach((a,i)=>spawn(a,i,actors.length));}
 function step(state,actors,dt,input,perform){
  state.elapsed+=dt;const living=actors.filter(a=>a.hp>0),events=[];
  for(const a of living){
   if(a.hp<=0)continue;
   if(!a.brawlReady)spawn(a,0,0);
   a.attackTime=Math.max(0,(a.attackTime||0)-dt);a.hit=Math.max(0,(a.hit||0)-dt);a.brawlCooldown-=dt;a.brawlTilt=(a.brawlTilt||0)*Math.exp(-10*dt);
   const controlled=!input.auto&&a===actors[0],opponents=living.filter(b=>b!==a&&b.hp>0).sort((b,c)=>Math.hypot(b.x-a.x,b.y-a.y)-Math.hypot(c.x-a.x,c.y-a.y)),target=opponents[0];if(!target)continue;
   const dx=target.x-a.x,dy=target.y-a.y,d=Math.hypot(dx,dy)||1,range=(a.brawlRadius||25)+(target.brawlRadius||25)+18;
   let sx=0,sy=0;
   if(controlled){const length=Math.hypot(input.dx,input.dy)||1;sx=input.dx/length*230;sy=input.dy/length*230;}
   else{
    const speed=d>range?195:65;sx=dx/d*speed+(480-a.x)*.45;sy=dy/d*speed+(280-a.y)*.45;
    sx+=Math.sin(state.elapsed*9+a.brawlSeed)*48;sy+=Math.cos(state.elapsed*11+a.brawlSeed)*42;
   }
   const steer=1-Math.exp(-5*dt);a.vx+=(sx-a.vx)*steer;a.vy+=(sy-a.vy)*steer;
   a.x=Math.max(80,Math.min(880,a.x+a.vx*dt));a.y=Math.max(100,Math.min(460,a.y+a.vy*dt));
   const command=controlled?input.command:(a.energy||0)>=2?'skill':'attack';
   if(a.brawlCooldown<=0&&command&&(d<range||command==='guard')){
    if(command==='skill'&&(a.energy||0)<2)continue;
    const scope=command==='guard'?actors:[a,...opponents.filter(t=>Math.hypot(t.x-a.x,t.y-a.y)<range+35)];
    const oldAtk=a.atk;a.atk*=1+Math.min(2,Math.max(0,state.elapsed-15)*.035);
    let hitEvents;try{hitEvents=perform(a,scope,command);}finally{a.atk=oldAtk;}
    events.push(...hitEvents);a.brawlCooldown=.55+(a.brawlSeed%7)*.035;a.brawlTilt=(a.brawlSeed%2?1:-1)*.22;
    if(command!=='guard'){target.vx=(target.vx||0)+dx/d*210;target.vy=(target.vy||0)+dy/d*210;a.vx-=dx/d*65;a.vy-=dy/d*65;}
    if(controlled)input.consumed=true;
   }
  }
  // Bodies separate and bounce, while everyone keeps pressing toward the fight.
  const survivors=actors.filter(a=>a.hp>0);
  for(let pass=0;pass<2;pass++)for(let i=0;i<survivors.length;i++)for(let j=i+1;j<survivors.length;j++){
   const a=survivors[i],b=survivors[j];let dx=b.x-a.x,dy=b.y-a.y,d=Math.hypot(dx,dy);const gap=(a.brawlRadius||25)+(b.brawlRadius||25);
   if(d>=gap)continue;if(d<.01){dx=Math.cos(i+j+1);dy=Math.sin(i+j+1);d=1;}
   const nx=dx/d,ny=dy/d,push=(gap-d)*.5;a.x-=nx*push;a.y-=ny*push;b.x+=nx*push;b.y+=ny*push;
   if(pass===0){a.vx-=nx*35;a.vy-=ny*35;b.vx+=nx*35;b.vy+=ny*35;}
  }
  for(const a of survivors){a.x=Math.max(80,Math.min(880,a.x));a.y=Math.max(100,Math.min(460,a.y));}
  return events;
 }
 const api={create,initialize,step};if(typeof module!=='undefined')module.exports=api;root.Brawl=api;
})(typeof globalThis!=='undefined'?globalThis:this);

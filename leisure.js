(function(root){
 'use strict';
 const definitions={
  bowling:{title:'아이콘 볼링',sub:'A little strike.',description:'앱 아이콘을 굴려 열 개의 핀을 쓰러뜨리세요.',scene:'작은 볼링장',label:'최고 점수',start:'볼링 시작',overlay:'스트라이크에 도전!',text:'좌우로 조준하고 Space로 투구하세요. 10번의 투구 점수를 합산합니다.',hint:'← → 조준 · ↑ ↓ 힘 조절 · Space 투구 · 마우스로 레인 클릭'},
  tower:{title:'아이콘 타워',sub:'Balance your world.',description:'기울고 흔들리는 블록 위에 아이콘 탑을 쌓으세요.',scene:'작은 균형의 탑',label:'최고 블록 수',start:'쌓기 시작',overlay:'어디까지 쌓을 수 있을까요?',text:'좌우로 이동하고 Q로 회전, Space로 떨어뜨리세요. 블록 3개를 놓치면 종료됩니다.',hint:'← → 이동 · Q 회전 · Space 낙하 · 클릭한 위치로 낙하'},
  fishing:{title:'아이콘 낚시',sub:'A quiet little catch.',description:'작은 연못에서 물고기와 보물을 모으세요.',scene:'책상 위 연못',label:'누적 낚은 수',start:'낚시 시작',overlay:'잠깐, 낚시할까요?',text:'Space로 던지고 입질에 다시 누르세요. 당기는 동안 장력을 초록 구간에 유지하세요.',hint:'Space 던지기 / 입질 잡기 · 낚는 동안 Space나 마우스를 누르면 당기고 놓으면 장력 감소'},
  farm:{title:'작은 농장',sub:'Grow a little day.',description:'아이콘 친구들과 씨를 뿌리고 작은 밭을 가꿔보세요.',scene:'책상 위 텃밭',label:'누적 수확',start:'농장 가기',overlay:'나만의 작은 텃밭',text:'밭을 클릭해 심기·물주기·수확하세요. 1·2·3 키로 작물을 선택합니다.',hint:'밭 클릭 또는 ← → 선택 + Space 관리 · 1 당근 / 2 토마토 / 3 호박 · Q 작물 변경'}
 };
 const crops=[{name:'당근',icon:'🥕',cost:2,value:5,time:45},{name:'토마토',icon:'🍅',cost:4,value:10,time:90},{name:'호박',icon:'🎃',cost:7,value:18,time:150}];
 const fish=[{name:'피라미',icon:'🐟',value:3},{name:'붕어',icon:'🐠',value:6},{name:'황금 잉어',icon:'🐡',value:15},{name:'보물 상자',icon:'🎁',value:30}];
 const clamp=(n,a,b)=>Math.max(a,Math.min(b,n));
 function profile(raw){
  const p={version:2,farmTime:Date.now(),coins:12,catches:0,harvests:0,collection:[0,0,0,0],plots:Array.from({length:6},()=>null)};
  if(!raw||typeof raw!=='object')return p;
  if(Number.isFinite(raw.farmTime)&&raw.farmTime>=0)p.farmTime=raw.farmTime;
  for(const key of ['coins','catches','harvests'])if(Number.isFinite(raw[key]))p[key]=clamp(Math.floor(raw[key]),0,1e9);
  p.collection=p.collection.map((_,i)=>Number.isFinite(raw.collection?.[i])?clamp(Math.floor(raw.collection[i]),0,1e9):0);
  p.plots=p.plots.map((_,i)=>{const a=raw.plots?.[i];return a&&Number.isInteger(a.crop)&&crops[a.crop]&&Number.isFinite(a.at)?{crop:a.crop,at:Math.max(0,a.at),watered:!!a.watered}:null;});return p;
 }
 function rack(){const pins=[];for(let row=0;row<4;row++)for(let col=0;col<=row;col++)pins.push({x:480+(col-row/2)*46,y:245-row*40,vx:0,vy:0,down:false});return pins;}
 function newBlock(s){const shape=[[108,40],[72,58],[144,30],[90,46]][Math.floor(s.random()*4)];s.active={x:480,y:95,w:shape[0],h:shape[1],angle:0,vy:0,falling:false,icon:s.placed};}
 function create(mode,p,random=Math.random){const s={mode,profile:p,random,time:0,notice:'',noticeTime:0,done:false,dirty:false};
  if(mode==='bowling')Object.assign(s,{pins:rack(),ball:null,aim:480,power:.75,throws:0,points:0,wait:0});
  if(mode==='tower'){Object.assign(s,{blocks:[],placed:0,misses:0,camera:0,wait:0});newBlock(s);}
  if(mode==='fishing')Object.assign(s,{phase:'idle',wait:0,tension:.45,progress:0,held:false,fish:0});
  if(mode==='farm')Object.assign(s,{crop:0,plot:0,work:0});return s;
 }
 function say(s,text){s.notice=text;s.noticeTime=2.5;}
 function growth(plot,now){return !plot?0:clamp((now-plot.at)/(crops[plot.crop].time*1000*(plot.watered?.65:1)),0,1);}
 function manage(s,index,now){const p=s.profile,plot=p.plots[index];s.plot=index;
  if(!plot){const c=crops[s.crop];if(p.coins<c.cost){say(s,'씨앗 코인이 부족해요 · 낚시로 코인을 모아보세요');return false;}p.coins-=c.cost;p.plots[index]={crop:s.crop,at:now,watered:false};say(s,c.name+' 심기');}
  else if(growth(plot,now)>=1){const c=crops[plot.crop];p.coins+=c.value;p.harvests++;p.plots[index]=null;say(s,c.name+' 수확 · +'+c.value+' 코인');}
  else if(!plot.watered){plot.watered=true;say(s,'물주기 · 성장 시간 단축');}
  else{say(s,'자라는 중이에요');return false;}s.dirty=true;return true;
 }
 function action(s,key,now=Date.now()){
  if(s.done)return;
  if(s.mode==='bowling'&&key===' '&&!s.ball&&!s.wait){s.ball={x:s.aim,y:470,vx:(480-s.aim)*.35,vy:-350-s.power*400};s.throws++;}
  if(s.mode==='tower'&&s.active&&!s.active.falling){if(key==='q'){const w=s.active.w;s.active.w=s.active.h;s.active.h=w;}if(key===' ')s.active.falling=true;}
  if(s.mode==='fishing'){
   if(key===' '&&s.phase==='idle'){s.phase='waiting';s.wait=1.8+s.random()*3;say(s,'찌를 바라보세요');}
   else if(key===' '&&s.phase==='bite'){s.phase='reeling';s.progress=0;s.tension=.45;say(s,'누르면 당기기 · 놓으면 장력 감소');}
   else if(key===' '&&s.phase==='waiting'){s.phase='idle';say(s,'너무 빨랐어요');}
  }
  if(s.mode==='farm'){now=s.profile.farmTime;if(['1','2','3'].includes(key))s.crop=Number(key)-1;if(key==='q')s.crop=(s.crop+1)%3;if(key===' ')manage(s,s.plot,now);if(key==='ArrowRight'||key==='d')s.plot=(s.plot+1)%6;if(key==='ArrowLeft'||key==='a')s.plot=(s.plot+5)%6;}
 }
 function pointer(s,x,y,now){if(s.mode==='bowling'&&!s.ball){s.aim=clamp(x,350,610);action(s,' ',now);}if(s.mode==='tower'&&s.active&&!s.active.falling){s.active.x=clamp(x,260,700);action(s,' ',now);}if(s.mode==='fishing')action(s,' ',now);if(s.mode==='farm'){now=s.profile.farmTime;if(y<145&&x>260&&x<700){s.crop=clamp(Math.floor((x-260)/147),0,2);return;}const col=Math.floor((x-270)/140),row=Math.floor((y-190)/115);if(col>=0&&col<3&&row>=0&&row<2)manage(s,row*3+col,now);}}
 function step(s,dt,input={},now=Date.now()){
  if(s.done)return;s.time+=dt;if(s.mode==='farm'){s.profile.farmTime+=dt*1000;now=s.profile.farmTime;s.checkpoint=(s.checkpoint||0)+dt;if(s.checkpoint>=5){s.dirty=true;s.checkpoint=0;}};s.noticeTime=Math.max(0,s.noticeTime-dt);const k=input.keys||new Set(),axis=(k.has('ArrowRight')||k.has('d')?1:0)-(k.has('ArrowLeft')||k.has('a')?1:0);
  if(s.mode==='bowling'){
   if(!s.ball&&!s.wait){s.aim=clamp(s.aim+axis*180*dt,350,610);s.power=clamp(s.power+((k.has('ArrowUp')?1:0)-(k.has('ArrowDown')?1:0))*dt*.5,.2,1);if(input.auto){s.aim=480+(s.random()-.5)*150;s.power=.75+s.random()*.25;action(s,' ');}}
   if(s.ball){const b=s.ball;b.x+=b.vx*dt;b.y+=b.vy*dt;for(const p of s.pins){if(!p.down&&Math.hypot(p.x-b.x,p.y-b.y)<32){p.down=true;p.vx=(p.x-b.x)*9+b.vx*.7;p.vy=b.vy*.6;s.points++;}}for(const p of s.pins){if(!p.down)continue;p.x+=p.vx*dt;p.y+=p.vy*dt;p.vx*=Math.exp(-2*dt);p.vy*=Math.exp(-2*dt);for(const t of s.pins)if(!t.down&&Math.hypot(p.x-t.x,p.y-t.y)<29){t.down=true;t.vx=p.vx*.8+(t.x-p.x)*5;t.vy=p.vy*.8-70;s.points++;}}if(b.y<40){const count=s.pins.filter(p=>p.down).length;say(s,count===10?'스트라이크!':count+'개 쓰러뜨림');s.ball=null;s.wait=1.1;}}
   else if(s.wait){s.wait=Math.max(0,s.wait-dt);if(!s.wait){if(s.throws>=10)s.done=true;else s.pins=rack();}}
  }
  if(s.mode==='tower'){
   // Each body carries a center of mass. Narrow/off-center contacts cause rotation and sliding.
   const top=s.blocks.reduce((v,b)=>Math.min(v,b.y-b.h/2),480);s.camera+=(Math.max(0,210-top)-s.camera)*Math.min(1,dt*3);
   for(const b of s.blocks){if(b.loose){b.vy+=650*dt;b.y+=b.vy*dt;b.x+=b.vx*dt;b.angle+=b.spin*dt;continue;}const base=b.support===-1?{x:480,w:240,y:495,h:30}:s.blocks[b.support];if(!base||base.loose){b.loose=true;b.vy=0;b.vx=(b.x-480)*.2;b.spin=.8;continue;}const offset=b.x-base.x,margin=Math.min(base.w*.42,(base.w+b.w)/2-12);if(Math.abs(offset)>margin){b.angle+=Math.sign(offset)*dt*(.4+Math.abs(offset)/80);b.x+=Math.sign(offset)*dt*18;if(Math.abs(b.angle)>.4){b.loose=true;b.vy=0;b.vx=Math.sign(offset)*70;b.spin=Math.sign(offset)*1.8;}}}
   const a=s.active;if(a){if(!a.falling){a.y=95-s.camera;a.x=clamp(a.x+axis*240*dt,250,710);if(input.auto&&s.time-s.wait>.85){const base=[...s.blocks].reverse().find(b=>!b.loose);a.x=(base?.x||480)+(s.random()-.5)*Math.min(65,a.w*.55);a.falling=true;}}else{
    const oldBottom=a.y+a.h/2;a.vy+=650*dt;a.y+=a.vy*dt;let support=null,index=-1,surface=480;
    if(Math.abs(a.x-480)<(240+a.w)/2-6&&oldBottom<=480+2&&a.y+a.h/2>=480)support={x:480,w:240};
    s.blocks.forEach((b,i)=>{const y=b.y-b.h/2;if(!b.loose&&oldBottom<=y+3&&a.y+a.h/2>=y&&Math.abs(a.x-b.x)<(a.w+b.w)/2-5&&(!support||y<surface)){support=b;index=i;surface=y;}});
    if(support){a.y=surface-a.h/2;a.angle=0;a.support=index;a.vy=0;s.blocks.push(a);s.placed++;s.active=null;s.wait=s.time;}
    else if(a.y>620){s.misses++;s.active=null;s.wait=s.time;say(s,'블록을 놓쳤어요 · '+s.misses+'/3');}
   }}else if(s.time-s.wait>.6){const fallen=s.blocks.filter(b=>b.loose&&b.y>620&&!b.counted);for(const b of fallen){b.counted=true;s.misses++;}if(s.misses>=3)s.done=true;else newBlock(s);}
   if(s.blocks.filter(b=>b.loose&&b.y>620).length>30)s.blocks.forEach(b=>{if(b.loose&&b.y>620)b.y=1000;});
  }
  if(s.mode==='fishing'){
   if(s.phase==='idle'&&input.auto)action(s,' ');
   else if(s.phase==='waiting'){s.wait-=dt;if(s.wait<=0){s.phase='bite';s.wait=1.4;say(s,'입질! 지금 누르세요');}}
   else if(s.phase==='bite'){s.wait-=dt;if(input.auto)action(s,' ');else if(s.wait<=0){s.phase='idle';say(s,'물고기가 달아났어요');}}
   else if(s.phase==='reeling'){
    const held=input.auto?s.tension<.56:(input.held||k.has(' '));s.tension+=dt*(held?.5:-.34)+Math.sin(s.time*4)*dt*.17;s.progress+=dt*(s.tension>.25&&s.tension<.8?.24:-.08);s.progress=Math.max(0,s.progress);
    if(s.tension>=1||s.tension<=0){s.phase='idle';say(s,s.tension>=1?'줄이 끊어졌어요':'줄이 느슨해졌어요');}
    else if(s.progress>=1){const r=s.random();s.fish=r>.98?3:r>.85?2:r>.5?1:0;const f=fish[s.fish];s.profile.catches++;s.profile.collection[s.fish]++;s.profile.coins+=f.value;s.dirty=true;s.phase='caught';s.wait=2;say(s,f.name+' 획득 · +'+f.value+' 코인');}
   }else if(s.phase==='caught'){s.wait-=dt;if(s.wait<=0)s.phase='idle';}
  }
  if(s.mode==='farm'&&input.auto){s.work-=dt;if(s.work<=0){s.work=1;const p=s.profile;let i=p.plots.findIndex(a=>a&&growth(a,now)>=1);if(i<0)i=p.plots.findIndex(a=>a&&!a.watered);if(i<0)i=p.plots.findIndex(a=>!a);if(i>=0)manage(s,i,now);}}
 }
 function status(s,now=Date.now()){if(s.mode==='bowling')return '투구 '+Math.min(s.throws+(!s.ball&&!s.wait?1:0),10)+'/10 · '+s.points+'점';if(s.mode==='tower')return '쌓은 블록 '+s.placed+' · 놓침 '+Math.min(s.misses,3)+'/3';if(s.mode==='fishing')return '누적 '+s.profile.catches+'마리 · '+s.profile.coins+' 코인';return '수확 '+s.profile.harvests+' · '+s.profile.coins+' 코인';}
 function draw(s,c,icon,now=Date.now()){if(s.mode==='farm')now=s.profile.farmTime;
  const text=(v,x,y,size=19)=>{c.font='600 '+size+'px "Malgun Gothic",sans-serif';c.textAlign='center';c.fillText(v,x,y);};
  const box=(x,y,w,h,color)=>{c.fillStyle=color;c.fillRect(x,y,w,h);};
  text(status(s,now),480,95,19);
  if(s.mode==='bowling'){
   c.fillStyle='#c4a57636';c.beginPath();c.moveTo(340,485);c.lineTo(620,485);c.lineTo(590,85);c.lineTo(370,85);c.closePath();c.fill();c.strokeStyle='#e6c28b88';c.lineWidth=2;for(const x of [340,620]){c.beginPath();c.moveTo(x,485);c.lineTo(x===340?370:590,85);c.stroke();}
   for(const p of s.pins){c.save();c.translate(p.x,p.y);if(p.down)c.rotate(Math.atan2(p.vx,-p.vy));c.fillStyle=p.down?'#e6e6e67a':'#f5eee0';c.beginPath();c.ellipse(0,0,10,17,0,0,Math.PI*2);c.fill();box(-9,-8,18,4,'#d96a69');c.restore();}icon(0,s.ball?.x||s.aim,s.ball?.y||465,0);if(!s.ball){c.setLineDash([5,7]);c.strokeStyle='#bde494aa';c.beginPath();c.moveTo(s.aim,440);c.lineTo(480+(s.aim-480)*.45,280);c.stroke();c.setLineDash([]);}text('힘 '+Math.round(s.power*100)+'%',690,445,18);
  }
  if(s.mode==='tower'){
   c.save();c.beginPath();c.rect(200,115,560,410);c.clip();c.translate(0,s.camera);box(360,480,240,20,'#aab995cc');
   const block=b=>{c.save();c.translate(b.x,b.y);c.rotate(b.angle);box(-b.w/2,-b.h/2,b.w,b.h,['#a1c9d7','#d9bd90','#b9cda0','#c6a5d4'][b.icon%4]+'cc');c.strokeStyle='#ffffff88';c.lineWidth=2;c.strokeRect(-b.w/2,-b.h/2,b.w,b.h);icon(b.icon,0,0,Math.min(b.w,b.h)*.8);c.restore();};s.blocks.filter(b=>b.y<700).forEach(block);if(s.active)block(s.active);c.restore();text('Q 회전 · Space 낙하',480,535,17);
  }
  if(s.mode==='fishing'){
   c.fillStyle='#6ab5d740';c.beginPath();c.ellipse(530,345,215,105,0,0,Math.PI*2);c.fill();c.strokeStyle='#b1dfed77';c.lineWidth=2;for(let i=0;i<3;i++){c.beginPath();c.ellipse(530,345,65+i*50+Math.sin(s.time*2)*6,20+i*20,0,0,Math.PI*2);c.stroke();}icon(0,280,275,0);c.strokeStyle='#d6bc85';c.lineWidth=4;c.beginPath();c.moveTo(300,270);c.lineTo(355,190);c.stroke();if(s.phase!=='idle'){c.strokeStyle='#e9e9e9aa';c.lineWidth=1;c.beginPath();c.moveTo(355,190);c.lineTo(525,330+Math.sin(s.time*5)*(s.phase==='bite'?14:3));c.stroke();box(521,318+Math.sin(s.time*5)*(s.phase==='bite'?14:3),8,15,'#ed8d79');}
   if(s.phase==='bite')text('!',530,285,40);if(s.phase==='reeling'){box(355,455,300,12,'#32403dcc');box(430,455,165,12,'#95c77eaa');box(355+s.tension*300-3,449,6,24,'#ffffff');text('장력',310,470,17);text('낚는 중 '+Math.round(s.progress*100)+'%',510,507,18);}else text({idle:'Space 또는 클릭으로 낚싯대 던지기',waiting:'입질을 기다리는 중',bite:'지금 Space!',caught:fish[s.fish].icon+' '+fish[s.fish].name}[s.phase],500,480,19);
   text(s.profile.collection.map((n,i)=>fish[i].icon+' '+n).join('   '),480,140,21);
  }
  if(s.mode==='farm'){
   crops.forEach((a,i)=>{box(265+i*147,112,137,37,i===s.crop?'#80a35e99':'#6a775a44');text(a.icon+' '+a.cost+'코인',333+i*147,138,18);});
   s.profile.plots.forEach((p,i)=>{const x=270+i%3*140,y=190+Math.floor(i/3)*115;box(x,y,126,100,'#88664499');c.strokeStyle=i===s.plot?'#e9e8b1':'#b7a38255';c.lineWidth=i===s.plot?3:1;c.strokeRect(x,y,126,100);if(p){const g=growth(p,now);text(g>=1?crops[p.crop].icon:g>.4?'🌿':'🌱',x+63,y+57,g>=1?38:28);text(g>=1?'수확!':Math.ceil((1-g)*crops[p.crop].time*(p.watered?.65:1))+'초',x+63,y+84,16);if(p.watered)text('💧',x+108,y+22,15);}else text('＋ 심기',x+63,y+57,18);});
   for(let i=0;i<Math.min(3,s.workerCount||1);i++)icon(i,330+i*140,455+Math.sin(s.time*2+i)*3,0);text(crops[s.crop].name+' · 수확 +'+crops[s.crop].value+'코인',480,510,18);
  }
  if(s.noticeTime>0)text(s.notice,480,178,18);
 }
 const api={definitions,crops,profile,create,step,action,pointer,draw,status,growth,manage};if(typeof module!=='undefined')module.exports=api;root.Leisure=api;
})(typeof globalThis!=='undefined'?globalThis:this);

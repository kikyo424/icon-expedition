(function(root){
 'use strict';
 const Shapes=typeof module!=='undefined'?require('./tower-shapes.js'):root.TowerShapes;
 const definitions={
  bowling:{title:'아이콘 볼링',sub:'A little strike.',description:'앱 아이콘을 굴려 열 개의 핀을 쓰러뜨리세요.',scene:'작은 볼링장',label:'최고 점수',start:'볼링 시작',overlay:'스트라이크에 도전!',text:'레인에서 좌클릭을 누른 채 조준하고, 힘 게이지를 보고 놓으면 투구합니다.',hint:'좌클릭을 누른 채 이동해 조준 · 힘 0~100% 왕복 · 놓으면 투구'},
  tower:{title:'아이콘 타워',sub:'Balance your world.',description:'기울고 흔들리는 블록 위에 아이콘 탑을 쌓으세요.',scene:'작은 균형의 탑',label:'최고 블록 수',start:'쌓기 시작',overlay:'어디까지 쌓을 수 있을까요?',text:'좌우로 움직이는 블록을 Space나 클릭으로 떨어뜨리세요. 모양은 고정이며 블록 3개를 놓치면 종료됩니다.',hint:'블록이 좌우로 왕복 · Space 또는 클릭으로 현재 위치에서 낙하'},
  fishing:{title:'아이콘 낚시',sub:'A quiet little catch.',description:'작은 연못에서 물고기와 보물을 모으세요.',scene:'책상 위 연못',label:'누적 낚은 수',start:'낚시 시작',overlay:'잠깐, 낚시할까요?',text:'Space로 던지고 입질에 다시 누르세요. 당기는 동안 장력을 초록 구간에 유지하세요.',hint:'Space 던지기 / 입질 잡기 · 낚는 동안 Space나 마우스를 누르면 당기고 놓으면 장력 감소'},
  farm:{title:'작은 농장',sub:'Grow a little day.',description:'아이콘 친구들과 씨를 뿌리고 작은 밭을 가꿔보세요.',scene:'책상 위 텃밭',label:'누적 수확',start:'농장 가기',overlay:'나만의 작은 텃밭',text:'밭을 클릭해 심기·물주기·수확하세요. 밭을 확장해 작물을 해금하세요. 1~6 키로 선택합니다.',hint:'밭 클릭 또는 ← → 선택 + Space 관리 · 1 벼 / 2 감자 / 3 당근 / 4 토마토 / 5 배추 / 6 딸기 · Q 작물 변경'}
 };
 const crops=[{name:'벼',icon:'🌾',cost:0,value:1,time:15},{name:'감자',icon:'🥔',cost:1,value:8,time:30},{name:'당근',icon:'🥕',cost:2,value:15,time:45},{name:'토마토',icon:'🍅',cost:4,value:25,time:65},{name:'배추',icon:'🥬',cost:7,value:40,time:85},{name:'딸기',icon:'🍓',cost:12,value:60,time:110}];
 function seedPrice(p,index){return crops[index].cost?crops[index].cost+p.landCount-1:0;}
 function landPrice(p){return [5,15,40,100,250][p.landCount-1]??null;}
 function expandFarm(s){const p=s.profile,cost=landPrice(p);if(cost===null)return false;if(p.coins<cost){say(s,'밭 확장에 '+cost+'코인이 필요해요');return false;}p.coins-=cost;p.landCount++;s.dirty=true;say(s,'밭 '+p.landCount+'칸 · '+crops[p.landCount-1].name+' 해금');return true;}
 const fish=[{name:'피라미',icon:'🐟',value:3},{name:'붕어',icon:'🐠',value:6},{name:'황금 잉어',icon:'🐡',value:15},{name:'보물 상자',icon:'🎁',value:30}];
 const clamp=(n,a,b)=>Math.max(a,Math.min(b,n));
 function profile(raw){
  const p={version:3,landCount:1,farmTime:Date.now(),selectedCrop:0,coins:0,catches:0,harvests:0,collection:[0,0,0,0],plots:Array.from({length:6},()=>null)};
  if(!raw||typeof raw!=='object')return p;
  if(Number.isInteger(raw.selectedCrop)&&crops[raw.selectedCrop])p.selectedCrop=raw.selectedCrop;
  if(Number.isFinite(raw.farmTime)&&raw.farmTime>=0)p.farmTime=raw.farmTime;
  for(const key of ['coins','catches','harvests'])if(Number.isFinite(raw[key]))p[key]=clamp(Math.floor(raw[key]),0,1e9);
  p.collection=p.collection.map((_,i)=>Number.isFinite(raw.collection?.[i])?clamp(Math.floor(raw.collection[i]),0,1e9):0);
  p.plots=p.plots.map((_,i)=>{const a=raw.plots?.[i];return a&&Number.isInteger(a.crop)&&crops[a.crop]&&Number.isFinite(a.at)?{crop:a.crop,at:Math.max(0,a.at),watered:!!a.watered}:null;});if(raw.version>=3){p.landCount=clamp(Math.floor(Number(raw.landCount)||1),1,6);}else{p.plots=p.plots.map(a=>a?{...a,crop:[2,3,4][a.crop]??0}:null);p.landCount=Math.max(1,...p.plots.map((a,i)=>a?Math.max(i+1,a.crop+1):1));}p.selectedCrop=Math.min(p.selectedCrop,p.landCount-1);return p;
 }
 function rack(){const pins=[];for(let row=0;row<4;row++)for(let col=0;col<=row;col++)pins.push({x:360+(col-row/2)*44,y:190-row*36,vx:0,vy:0,down:false});return pins;}
 const blockTypes={normal:{name:'일반',mass:1,color:'#a1c9d7'},vine:{name:'덩굴',mass:1,color:'#a2cd85'},foundation:{name:'독립 받침',mass:1,color:'#8ab5e0'},stone:{name:'돌',mass:2.2,color:'#9fa5ac'},cloud:{name:'구름',mass:.45,color:'#ded9ef'}};
 function newBlock(s){const roll=s.random(),type=roll<.6?'normal':roll<.75?'vine':roll<.83?'foundation':roll<.92?'stone':'cloud',keys=Object.keys(Shapes.shapes),shape=Shapes.createShape(keys[Math.floor(s.random()*keys.length)]);s.active={...shape,x:480,y:125-Math.min(...shape.cells.map(r=>r.y)),angle:0,vy:0,falling:false,type,icon:s.blockSerial++};}
 function anchored(b){return b.type==='vine'||b.type==='foundation';}
 function placeBlock(s,a,hit){a.y=hit.y;a.angle=0;a.vy=0;a.vx=0;a.spin=0;a.supports=anchored(a)?[]:hit.contacts;a.support=anchored(a)?-2:hit.contacts[0]?.index??-1;if(a.type==='vine')a.wall=a.x<480?210:750;s.blocks.push(a);s.placed++;s.active=null;s.wait=s.time;}
 function create(mode,p,random=Math.random){const s={mode,profile:p,random,time:0,notice:'',noticeTime:0,done:false,dirty:false};
  if(mode==='bowling')Object.assign(s,{pins:rack(),ball:null,aim:360,angle:0,power:.75,throws:0,points:0,wait:0,frameScores:Array(10).fill(null),charging:false,chargePhase:0,directionLocked:false,directionPhase:0});
  if(mode==='tower'){Object.assign(s,{blocks:[],placed:0,misses:0,camera:0,wait:0,blockSerial:0,sweep:1});newBlock(s);}
  if(mode==='fishing')Object.assign(s,{phase:'idle',wait:0,tension:.45,progress:0,held:false,fish:0});
  if(mode==='farm')Object.assign(s,{crop:p.selectedCrop,plot:0,work:0,jobs:[],workVisual:null,jobSerial:0});return s;
 }
 function say(s,text){s.notice=text;s.noticeTime=2.5;}
 function growth(plot,now){return !plot?0:clamp((now-plot.at)/(crops[plot.crop].time*1000*(plot.watered?.65:1)),0,1);}
 function manage(s,index,now){const p=s.profile,plot=p.plots[index];s.plot=index;if(index>=p.landCount){if(index===p.landCount)return expandFarm(s);say(s,'앞쪽 밭부터 확장해주세요');return false;}const kind=!plot?'plant':growth(plot,now)>=1?'harvest':'water';
  if(!plot){const c=crops[s.crop],cost=seedPrice(p,s.crop);if(s.crop>=p.landCount){say(s,'밭 '+(s.crop+1)+'칸에서 해금됩니다');return false;}if(p.coins<cost){say(s,'씨앗 코인이 부족해요 · 낚시로 코인을 모아보세요');return false;}p.coins-=cost;p.plots[index]={crop:s.crop,at:now,watered:false};say(s,c.name+' 심기');}
  else if(growth(plot,now)>=1){const c=crops[plot.crop];p.coins+=c.value;p.harvests++;p.plots[index]=null;say(s,c.name+' 수확 · +'+c.value+' 코인');}
  else if(!plot.watered){plot.watered=true;say(s,'물주기 · 성장 시간 단축');}
  else{say(s,'자라는 중이에요');return false;}s.jobs.push({index,kind,elapsed:0,worker:s.jobSerial++%Math.max(1,Math.min(3,s.workerCount||1))});if(s.jobs.length>8)s.jobs.shift();s.dirty=true;return true;
 }
 function setCrop(s,index){if(index>=s.profile.landCount){say(s,'밭 '+(index+1)+'칸에서 '+crops[index].name+' 해금');return false;}s.crop=index;s.profile.selectedCrop=index;s.dirty=true;}
 function action(s,key,now=Date.now()){
  if(s.done)return;
  if(s.mode==='bowling'&&!s.ball&&!s.wait&&!s.charging){if(key==='q')s.angle=clamp(s.angle-2,-12,12);if(key==='e')s.angle=clamp(s.angle+2,-12,12);if(key===' '){const speed=230+s.power*440,angle=(s.angle+(s.random()-.5)*(.5+s.power*.8))*Math.PI/180;s.ball={x:s.aim,y:500,vx:Math.sin(angle)*speed,vy:-Math.cos(angle)*speed,gutter:false,time:0};s.throws++;}}
  if(s.mode==='tower'&&s.active&&!s.active.falling&&key===' ')s.active.falling=true;
  if(s.mode==='fishing'){
   if(key===' '&&s.phase==='idle'){s.phase='waiting';s.wait=1.8+s.random()*3;say(s,'찌를 바라보세요');}
   else if(key===' '&&s.phase==='bite'){s.phase='reeling';s.progress=0;s.tension=.45;s.reelTime=0;s.think=0;s.autoHeld=false;s.burst=0;s.burstWait=.7;s.zoneCenter=.5;s.zoneWidth=[.32,.27,.22,.18][s.fish];say(s,'누르면 당기기 · 놓으면 장력 감소');}
   else if(key===' '&&s.phase==='waiting'){s.phase='idle';say(s,'너무 빨랐어요');}
  }
  if(s.mode==='farm'){now=s.profile.farmTime;if(['1','2','3','4','5','6'].includes(key))setCrop(s,Number(key)-1);if(key==='q')setCrop(s,(s.crop+1)%s.profile.landCount);if(key===' ')manage(s,s.plot,now);if(key==='ArrowRight'||key==='d')s.plot=(s.plot+1)%6;if(key==='ArrowLeft'||key==='a')s.plot=(s.plot+5)%6;}
 }
 function pointer(s,x,y,now){if(s.mode==='bowling'&&!s.done&&!s.ball&&!s.wait&&x>=190&&x<=530&&y>=70&&y<=560){s.aim=clamp(x,230,490);s.chargeOrigin=s.aim;s.power=0;s.chargePhase=0;s.directionPhase=0;s.angle=0;s.directionLocked=false;s.charging=true;}if(s.mode==='tower'&&s.active&&!s.active.falling)action(s,' ',now);if(s.mode==='fishing')action(s,' ',now);if(s.mode==='farm'){now=s.profile.farmTime;if(y>=112&&y<=161&&x>=160&&x<802){const index=Math.floor((x-160)/107);if((x-160)%107<101)setCrop(s,index);return;}const col=Math.floor((x-270)/140),row=Math.floor((y-190)/115);if(col>=0&&col<3&&row>=0&&row<2&&(x-270)%140<126&&(y-190)%115<100)manage(s,row*3+col,now);}}
 function aimPointer(s,x,y){if(s.mode!=='bowling'||!s.charging)return;s.aim=clamp(x,230,490);}
 function toggleDirection(s){if(s.mode==='bowling'&&s.charging){s.directionLocked=!s.directionLocked;return s.directionLocked;}return false;}
 function aimDirection(s,x,y){if(s.mode==='bowling'&&!s.ball&&!s.wait&&!s.done)s.angle=clamp(Math.atan2(x-s.aim,Math.max(70,500-y))*180/Math.PI,-12,12);}
 function releasePointer(s){if(s.mode!=='bowling'||!s.charging)return false;s.charging=false;action(s,' ');return !!s.ball;}
 function cancelPointer(s){if(s?.mode==='bowling')s.charging=false;}
 function step(s,dt,input={},now=Date.now()){
  if(s.done)return;s.time+=dt;if(s.mode==='farm'){s.profile.farmTime+=dt*1000;now=s.profile.farmTime;s.checkpoint=(s.checkpoint||0)+dt;if(s.checkpoint>=5){s.dirty=true;s.checkpoint=0;}};s.noticeTime=Math.max(0,s.noticeTime-dt);const k=input.keys||new Set(),axis=(k.has('ArrowRight')||k.has('d')?1:0)-(k.has('ArrowLeft')||k.has('a')?1:0);
  if(s.mode==='bowling'){
   if(s.charging){s.directionPhase+=dt*3;if(!s.directionLocked)s.angle=Math.sin(s.directionPhase)*12;s.chargePhase=(s.chargePhase+dt*.9)%2;s.power=s.chargePhase<=1?s.chargePhase:2-s.chargePhase;}
   if(!s.ball&&!s.wait&&!s.charging){s.aim=clamp(s.aim+axis*180*dt,230,490);s.power=clamp(s.power+((k.has('ArrowUp')?1:0)-(k.has('ArrowDown')?1:0))*dt*.5,.2,1);if(input.auto){s.aim=360+(s.random()-.5)*160;s.angle=(s.random()-.5)*10;s.power=.4+s.random()*.6;action(s,' ');}}
   if(s.ball||s.wait){
    const substeps=Math.max(1,Math.ceil(dt/(1/180))),h=dt/substeps;
    for(let sub=0;sub<substeps;sub++){
     const b=s.ball;if(b){b.time=(b.time||0)+h;b.x+=b.vx*h;b.y+=b.vy*h;if(b.x<208||b.x>512)b.gutter=true;}
     for(const p of s.pins){p.x+=p.vx*h;p.y+=p.vy*h;p.vx*=Math.exp(-2.2*h);p.vy*=Math.exp(-2.2*h);}
     const collide=(a,b,radius,inverseA,inverseB)=>{const dx=b.x-a.x,dy=b.y-a.y,d=Math.hypot(dx,dy);if(d>=radius||d<.001)return;const nx=dx/d,ny=dy/d,relative=(b.vx-a.vx)*nx+(b.vy-a.vy)*ny;if(relative<0){const impulse=-(1+.54)*relative/(inverseA+inverseB);a.vx-=impulse*nx*inverseA;a.vy-=impulse*ny*inverseA;b.vx+=impulse*nx*inverseB;b.vy+=impulse*ny*inverseB;}const overlap=(radius-d)/(inverseA+inverseB);a.x-=nx*overlap*inverseA;a.y-=ny*overlap*inverseA;b.x+=nx*overlap*inverseB;b.y+=ny*overlap*inverseB;};
     if(b&&!b.gutter)for(const p of s.pins)collide(b,p,28,.2,1);
     for(let i=0;i<s.pins.length;i++)for(let j=i+1;j<s.pins.length;j++)collide(s.pins[i],s.pins[j],24,1,1);
     for(const p of s.pins)if(!p.down&&Math.hypot(p.vx,p.vy)>95){p.down=true;s.points++;}
    }
    if(s.ball&&(s.ball.y<35||s.ball.y>550||s.ball.time>6||Math.hypot(s.ball.vx,s.ball.vy)<65)){s.ball=null;s.wait=1.6;}
    else if(!s.ball&&s.wait){s.wait=Math.max(0,s.wait-dt);if(!s.wait){const count=s.pins.filter(p=>p.down).length;s.frameScores[s.throws-1]=count;say(s,count===10?'스트라이크!':count+'개 쓰러뜨림');if(s.throws>=10)s.done=true;else s.pins=rack();}}
   }
  }
  if(s.mode==='tower'){
   const top=s.blocks.filter(b=>!b.loose).reduce((v,b)=>Math.min(v,Shapes.bounds(b).top),480);s.camera+=(Math.max(0,300-top)-s.camera)*Math.min(1,dt*3);
   const contactLists=s.blocks.map(b=>b.loose||anchored(b)?[]:Shapes.contacts(b,s.blocks)),masses=s.blocks.map(b=>b.loose?0:Shapes.mass(b)*(blockTypes[b.type]?.mass||1)),moments=s.blocks.map((b,i)=>b.x*masses[i]);
   for(let i=s.blocks.length-1;i>=0;i--){if(anchored(s.blocks[i])||s.blocks[i].loose)continue;const supports=contactLists[i],total=supports.reduce((sum,c)=>sum+c.right-c.left,0);for(const contact of supports)if(contact.index>=0&&contact.index<i){const share=(contact.right-contact.left)/total;masses[contact.index]+=masses[i]*share;moments[contact.index]+=moments[i]*share;}}
   for(let i=0;i<s.blocks.length;i++){const b=s.blocks[i];if(anchored(b)){b.loose=false;b.angle=0;b.vx=b.vy=b.spin=0;continue;}if(b.loose){b.vy+=950*dt;b.y+=b.vy*dt;b.x+=b.vx*dt;b.angle+=b.spin*dt;continue;}const supports=Shapes.contacts(b,s.blocks);b.supports=supports;if(!supports.length){const base=s.blocks[b.support];b.loose=true;b.vy=base?.vy||0;b.vx=base?.vx||(b.x-480)*.2;b.spin=base?.spin||Math.sign(b.x-480||1)*1.8;continue;}
    const center=moments[i]/masses[i],left=Math.min(...supports.map(c=>c.left)),right=Math.max(...supports.map(c=>c.right)),overhang=center<left?center-left:center>right?center-right:0;
    if(Math.abs(overhang)>2){const direction=Math.sign(overhang);b.angle+=direction*dt*(.7+Math.abs(overhang)/65);b.x+=direction*dt*16;if(Math.abs(b.angle)>.35){b.loose=true;b.vy=0;b.vx=direction*85;b.spin=direction*1.9;}}else b.angle*=Math.exp(-4*dt);
   }
   const a=s.active;if(a){const bounds=Shapes.bounds(a),localTop=bounds.top-a.y,localBottom=bounds.bottom-a.y;
    if(!a.falling){a.y=125-localTop-s.camera;const minX=210-(bounds.left-a.x),maxX=750-(bounds.right-a.x);a.x+=s.sweep*160*dt;if(a.x>maxX){a.x=maxX-(a.x-maxX);s.sweep=-1;}if(a.x<minX){a.x=minX+(minX-a.x);s.sweep=1;}if(input.auto){const base=[...s.blocks].reverse().find(b=>!b.loose);if(a.autoTarget===undefined)a.autoTarget=clamp((base?.x||480)+(s.random()-.5)*25,minX,maxX);if(s.time-s.wait>.5&&(Math.abs(a.x-a.autoTarget)<10||s.time-s.wait>5))a.falling=true;}}
    else{const oldY=a.y;a.vy+=950*dt;a.y+=a.vy*dt;let hit=Shapes.landing(a,oldY,s.blocks);const anchorY=380-s.camera;if(anchored(a)&&oldY+localBottom<=anchorY&&a.y+localBottom>=anchorY){const y=anchorY-localBottom;if(!hit||y<hit.y)hit={y,contacts:[]};}
     if(a.type==='vine'){const current=Shapes.bounds(a),wallTouch=current.left<=211||current.right>=749,sideTouch=s.blocks.some(other=>!other.loose&&Shapes.rects(a).some(r=>Shapes.rects(other).some(t=>Math.min(r.y+r.h,t.y+t.h)-Math.max(r.y,t.y)>5&&(Math.abs(r.x+r.w-t.x)<5||Math.abs(t.x+t.w-r.x)<5))));if(wallTouch||sideTouch){const y=a.y;if(!hit||y<hit.y)hit={y,contacts:[]};}}
     if(hit)placeBlock(s,a,hit);else if(Shapes.bounds(a).top>620){s.misses++;s.active=null;s.wait=s.time;say(s,'블록을 놓쳤어요 · '+s.misses+'/3');}
    }
   }else if(s.time-s.wait>.6){for(const block of s.blocks.filter(b=>b.loose&&b.y>620&&!b.counted)){block.counted=true;s.misses++;}if(s.misses>=3)s.done=true;else newBlock(s);}
  }
  if(s.mode==='fishing'){
   if(s.phase==='idle'&&input.auto)action(s,' ');
   else if(s.phase==='waiting'){s.wait-=dt;if(s.wait<=0){s.phase='bite';const roll=s.random();s.fish=roll>.98?3:roll>.85?2:roll>.5?1:0;s.wait=1.05-s.fish*.13;say(s,'입질! 지금 누르세요');}}
   else if(s.phase==='bite'){s.wait-=dt;if(input.auto)action(s,' ');else if(s.wait<=0){s.phase='idle';say(s,'물고기가 달아났어요');}}
   else if(s.phase==='reeling'){
    s.reelTime+=dt;s.zoneCenter=.5+Math.sin(s.reelTime*(1.1+s.fish*.35))*(.12+s.fish*.025);s.burstWait-=dt;if(s.burstWait<=0){s.burst=(s.random()<.5?-1:1)*(.22+s.fish*.09);s.burstWait=.8+s.random()*1.2;}s.burst*=Math.exp(-2*dt);s.think-=dt;if(s.think<=0){s.autoHeld=s.tension<s.zoneCenter;s.think=.18+s.random()*.2;}const held=input.auto?s.autoHeld:(input.held||k.has(' '));s.tension+=dt*(held?.65:-.5)+Math.sin(s.reelTime*5)*dt*.16+s.burst*dt;const good=Math.abs(s.tension-s.zoneCenter)<s.zoneWidth/2;s.progress=Math.max(0,s.progress+dt*(good?(.23-s.fish*.025):-.14));
    if(s.reelTime>18||s.tension>=1||s.tension<=0){s.phase='idle';say(s,s.reelTime>18?'물고기가 빠져나갔어요':s.tension>=1?'줄이 끊어졌어요':'줄이 느슨해졌어요');}
    else if(s.progress>=1){const f=fish[s.fish];s.profile.catches++;s.profile.collection[s.fish]++;s.profile.coins+=f.value;s.dirty=true;s.phase='caught';s.wait=2;say(s,f.name+' 획득 · +'+f.value+' 코인');}
   }else if(s.phase==='caught'){s.wait-=dt;if(s.wait<=0)s.phase='idle';}
  }
  if(s.mode==='farm'){if(!s.workVisual&&s.jobs.length)s.workVisual=s.jobs.shift();if(s.workVisual){s.workVisual.elapsed+=dt;if(s.workVisual.elapsed>=1.35)s.workVisual=null;}}
  if(s.mode==='farm'&&input.auto){s.work-=dt;if(s.work<=0){s.work=1;const p=s.profile,owned=p.plots.slice(0,p.landCount);let i=owned.findIndex(a=>a&&growth(a,now)>=1);if(i<0)i=owned.findIndex(a=>a&&!a.watered);if(i<0)i=owned.findIndex(a=>!a);if(i>=0){const chosen=s.crop;if(!p.plots[i]&&p.coins<seedPrice(p,s.crop))s.crop=0;manage(s,i,now);s.crop=chosen;}else if(landPrice(p)!==null&&p.coins>=landPrice(p))expandFarm(s);}}
 }
 function farmPose(s,index){const home={x:330+index*140,y:455},job=s.workVisual,count=Math.max(1,Math.min(3,s.workerCount||1));if(!job||job.worker%count!==index)return {...home,tool:'hoe',swing:0,working:false};const target={x:280+job.index%3*140,y:270+Math.floor(job.index/3)*115},t=job.elapsed,mix=t<.35?t/.35:t<1?1:1-(t-1)/.35,ease=clamp(mix,0,1)**2*(3-2*clamp(mix,0,1)),working=t>=.35&&t<=1;return {x:home.x+(target.x-home.x)*ease,y:home.y+(target.y-home.y)*ease+(working?0:Math.sin(t*24)*3),tool:job.kind==='plant'?'hoe':job.kind==='harvest'?'sickle':'watering',swing:working?Math.sin((t-.35)/.65*Math.PI*6):0,working,plot:job.index};}
 function drawFarmTool(c,pose){c.save();c.translate(pose.x+29,pose.y-4);c.rotate(pose.tool==='watering'?.4+pose.swing*.13:-.35+pose.swing*.75);c.lineWidth=4;c.lineCap='round';c.strokeStyle='#b98d57';
  if(pose.tool==='watering'){c.fillStyle='#83bdd1';c.fillRect(-9,-6,22,20);c.strokeStyle='#b1dae8';c.lineWidth=3;c.beginPath();c.arc(-9,3,8,Math.PI/2,Math.PI*1.5);c.moveTo(12,0);c.lineTo(27,-12);c.lineTo(32,-7);c.stroke();if(pose.working){c.fillStyle='#9ed9f1';for(let i=0;i<4;i++){c.beginPath();c.ellipse(30+i*4,8+i*6+Math.abs(pose.swing)*6,2,4,-.3,0,Math.PI*2);c.fill();}}}
  else{c.beginPath();c.moveTo(-5,21);c.lineTo(13,-15);c.stroke();c.fillStyle='#d4dfe1';c.strokeStyle='#50646a';c.lineWidth=1.5;c.beginPath();if(pose.tool==='hoe'){c.moveTo(7,-21);c.lineTo(31,-17);c.lineTo(27,-7);c.lineTo(10,-13);}else{c.moveTo(11,-15);c.quadraticCurveTo(33,-42,42,-18);c.quadraticCurveTo(30,-30,19,-8);}c.closePath();c.fill();c.stroke();}
  c.restore();if(pose.working&&pose.tool!=='watering'){c.fillStyle=pose.tool==='hoe'?'#d4b98c':'#d8e8a0';for(let i=0;i<4;i++){const t=((pose.swing*.3+i*.23)%1+1)%1;c.fillRect(pose.x+31+i*6,pose.y+12-t*23,3,3);}}
 }
 function status(s,now=Date.now()){if(s.mode==='bowling')return '투구 '+Math.min(s.throws+(!s.ball&&!s.wait?1:0),10)+'/10 · '+s.points+'점';if(s.mode==='tower')return '쌓은 블록 '+s.placed+' · 놓침 '+Math.min(s.misses,3)+'/3';if(s.mode==='fishing')return '누적 '+s.profile.catches+'마리 · '+s.profile.coins+' 코인';return '밭 '+s.profile.landCount+'/6 · 수확 '+s.profile.harvests+' · '+s.profile.coins+' 코인';}
 function draw(s,c,icon,now=Date.now()){if(s.mode==='farm')now=s.profile.farmTime;
  const text=(v,x,y,size=19)=>{c.font='600 '+size+'px "Malgun Gothic",sans-serif';c.textAlign='center';c.fillText(v,x,y);};
  const box=(x,y,w,h,color)=>{c.fillStyle=color;c.fillRect(x,y,w,h);};
  if(s.mode!=='bowling')text(status(s,now),480,95,19);
  if(s.mode==='bowling'){
   c.fillStyle='#c4a57636';c.beginPath();c.moveTo(200,515);c.lineTo(520,515);c.lineTo(490,65);c.lineTo(230,65);c.closePath();c.fill();
   c.strokeStyle='#e6c28b88';c.lineWidth=2;for(const [x,to] of [[200,230],[520,490]]){c.beginPath();c.moveTo(x,515);c.lineTo(to,65);c.stroke();}
   c.strokeStyle='#ffffff15';c.lineWidth=1;for(let x=240;x<=480;x+=40){c.beginPath();c.moveTo(x,510);c.lineTo(360+(x-360)*.8,70);c.stroke();}box(205,450,310,3,'#dfc28c88');
   for(const p of s.pins){c.save();c.translate(p.x,p.y);if(p.down)c.rotate(Math.atan2(p.vx,-p.vy));c.fillStyle=p.down?'#e6e6e67a':'#f5eee0';c.beginPath();c.ellipse(0,0,10,17,0,0,Math.PI*2);c.fill();box(-9,-8,18,4,'#d96a69');c.restore();}
   icon(s.ball||s.wait?Math.max(0,s.throws-1):s.throws,s.ball?.x??s.aim,s.ball?.y??500,0);
   if(!s.ball&&!s.wait&&!s.done){const angle=s.angle*Math.PI/180;c.save();c.setLineDash([9,6]);c.lineCap='round';c.beginPath();c.moveTo(s.aim,470);c.lineTo(s.aim+Math.tan(angle)*200,270);c.strokeStyle='#3d4248';c.lineWidth=6;c.stroke();c.strokeStyle='#c0c4ca';c.lineWidth=3;c.stroke();c.restore();}
   text(s.charging?'우클릭 방향 고정/해제 · 놓으면 투구':'좌클릭 누르기 → 조준 → 놓으면 투구',350,550,17);
  }
  if(s.mode==='tower'){
   c.save();c.beginPath();c.rect(200,115,560,410);c.clip();c.translate(0,s.camera);box(360,480,240,20,'#aab995cc');for(const wall of [210,750]){box(wall-2,115-s.camera,4,410,'#9baa9f44');}
   for(const b of s.blocks.filter(b=>b.type==='vine')){const bounds=Shapes.bounds(b),wall=b.wall??(b.x<480?210:750),start=wall===210?bounds.left:bounds.right,y=b.y;c.beginPath();c.moveTo(start,y);c.bezierCurveTo(start+(wall-start)*.3,y-13,start+(wall-start)*.7,y+13,wall,y);c.strokeStyle='#273d27';c.lineWidth=7;c.stroke();c.strokeStyle='#95c777';c.lineWidth=3;c.stroke();for(let t=.15;t<1;t+=.2){c.fillStyle='#82b45f';c.beginPath();c.ellipse(start+(wall-start)*t,y+Math.sin(t*Math.PI*2)*4,7,3,-.6,0,Math.PI*2);c.fill();}}
   const block=b=>{c.save();c.translate(b.x,b.y);c.rotate(b.angle);const cells=Shapes.rects({...b,x:0,y:0});for(const r of cells){box(r.x,r.y,r.w,r.h,(blockTypes[b.type]?.color||'#a1c9d7')+'ee');c.strokeStyle='#ffffff88';c.lineWidth=1.5;c.strokeRect(r.x+1,r.y+1,r.w-2,r.h-2);if(b.type==='vine'){c.strokeStyle='#436d32';c.lineWidth=3;c.beginPath();c.moveTo(r.x+7,r.y+2);c.bezierCurveTo(r.x+22,r.y+10,r.x+7,r.y+22,r.x+24,r.y+r.h-2);c.stroke();}if(b.type==='foundation')box(r.x,r.y+r.h-5,r.w,5,'#d9ebff');}const stamp=cells.reduce((best,r)=>Math.hypot(r.x+r.w/2,r.y+r.h/2)<Math.hypot(best.x+best.w/2,best.y+best.h/2)?r:best,cells[0]);icon(b.icon,stamp.x+stamp.w/2,stamp.y+stamp.h/2,Math.min(stamp.w,stamp.h)*.85);c.restore();};s.blocks.filter(b=>b.y<700).forEach(block);if(s.active)block(s.active);c.restore();if(s.active)text((blockTypes[s.active.type]?.name||'일반')+' · '+(s.active.shape||''),480,119,16);text('좌우 왕복 · Space / 클릭으로 낙하',480,535,17);
  }
  if(s.mode==='fishing'){
   c.fillStyle='#6ab5d740';c.beginPath();c.ellipse(530,345,215,105,0,0,Math.PI*2);c.fill();c.strokeStyle='#b1dfed77';c.lineWidth=2;for(let i=0;i<3;i++){c.beginPath();c.ellipse(530,345,65+i*50+Math.sin(s.time*2)*6,20+i*20,0,0,Math.PI*2);c.stroke();}icon(0,280,275,0);c.strokeStyle='#d6bc85';c.lineWidth=4;c.beginPath();c.moveTo(300,270);c.lineTo(355,190);c.stroke();if(s.phase!=='idle'){c.strokeStyle='#e9e9e9aa';c.lineWidth=1;c.beginPath();c.moveTo(355,190);c.lineTo(525,330+Math.sin(s.time*5)*(s.phase==='bite'?14:3));c.stroke();box(521,318+Math.sin(s.time*5)*(s.phase==='bite'?14:3),8,15,'#ed8d79');}
   if(s.phase==='bite')text('!',530,285,40);if(s.phase==='reeling'){box(355,455,300,12,'#32403dcc');box(355+(s.zoneCenter-s.zoneWidth/2)*300,455,s.zoneWidth*300,12,'#95c77eaa');box(355+s.tension*300-3,449,6,24,'#ffffff');text('장력',310,470,17);text('낚는 중 '+Math.round(s.progress*100)+'% · '+Math.max(0,Math.ceil(18-s.reelTime))+'초',510,507,18);text(['보통','힘센 물고기','강한 저항','보물 끌어올리기'][s.fish],510,430,17);}else text({idle:'Space 또는 클릭으로 낚싯대 던지기',waiting:'입질을 기다리는 중',bite:'지금 Space!',caught:fish[s.fish].icon+' '+fish[s.fish].name}[s.phase],500,480,19);
   text(s.profile.collection.map((n,i)=>fish[i].icon+' '+n).join('   '),480,140,21);
  }
  if(s.mode==='farm'){
   crops.forEach((a,i)=>{const unlocked=i<s.profile.landCount;box(160+i*107,112,101,49,i===s.crop?'#80a35e99':'#6a775a44');text(a.icon+' '+a.name,210+i*107,133,17);text(unlocked?'씨앗 '+seedPrice(s.profile,i)+'C':'밭 '+(i+1)+'칸',210+i*107,154,15);});
   s.profile.plots.forEach((p,i)=>{const x=270+i%3*140,y=190+Math.floor(i/3)*115;box(x,y,126,100,p?.watered?'#68593fbb':'#88664499');for(let row=0;row<4;row++){box(x+8,y+16+row*21,110,3,'#30271544');box(x+8,y+19+row*21,110,1,'#cda87633');}c.strokeStyle=i===s.plot?'#e9e8b1':'#b7a38255';c.lineWidth=i===s.plot?3:1;c.strokeRect(x,y,126,100);if(i>=s.profile.landCount){text(i===s.profile.landCount?'＋ 확장':'잠김',x+63,y+43,18);text(i===s.profile.landCount?landPrice(s.profile)+'코인':'이전 밭 필요',x+63,y+74,16);}else if(p){const g=growth(p,now);text(g>=1?crops[p.crop].icon:g>.4?'🌿':'🌱',x+63,y+57,g>=1?38:28);text(g>=1?'수확!':Math.ceil((1-g)*crops[p.crop].time*(p.watered?.65:1))+'초',x+63,y+84,16);if(p.watered)text('💧',x+108,y+22,15);}else text('＋ 심기',x+63,y+57,18);});
   for(let i=0;i<Math.min(3,s.workerCount||1);i++){const pose=farmPose(s,i);icon(i,pose.x,pose.y,0);drawFarmTool(c,pose);}text(crops[s.crop].name+' · 수확 +'+crops[s.crop].value+'코인',480,510,18);
  }
  if(s.noticeTime>0)text(s.notice,s.mode==='bowling'?350:480,s.mode==='bowling'?240:178,18);
 }
 const api={definitions,crops,profile,blockTypes,seedPrice,landPrice,expandFarm,create,step,action,pointer,aimPointer,toggleDirection,aimDirection,releasePointer,cancelPointer,farmPose,draw,status,growth,manage};if(typeof module!=='undefined')module.exports=api;root.Leisure=api;
})(typeof globalThis!=='undefined'?globalThis:this);

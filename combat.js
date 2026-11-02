(function(root){
 'use strict';
 const profiles={
  browser:{name:'탭 마법사',skill:'탭 폭풍',style:'tabs',speed:14},
  document:{name:'문서 기사',skill:'결재 방벽',style:'paper',speed:9},
  chat:{name:'메신저 지원가',skill:'응원 메시지',style:'chat',speed:12},
  code:{name:'코드 전사',skill:'연쇄 실행',style:'code',speed:15},
  media:{name:'음파 마법사',skill:'볼륨 폭발',style:'sound',speed:11},
  folder:{name:'폴더 수호자',skill:'보호 폴더',style:'shield',speed:7},
  bin:{name:'흡수 전사',skill:'완전 정리',style:'drain',speed:8},
  photo:{name:'이미지 술사',skill:'꽃잎 환영',style:'petal',speed:13},
  slime:{name:'슬라임',skill:'끈적한 독방울',style:'slime',speed:8},
  report:{name:'보고서',skill:'수정 요청',style:'report',speed:10},
  calendar:{name:'캘린더',skill:'일정 압박',style:'calendar',speed:11},
  briefcase:{name:'업무 가방',skill:'추가 업무',style:'briefcase',speed:7},
  printer:{name:'프린터',skill:'무한 출력',style:'printer',speed:10},
  overtime:{name:'야근 시계',skill:'퇴근 보류',style:'clock',speed:12},
  general:{name:'아이콘 전사',skill:'집중 일격',style:'slash',speed:10}
 };
 function profile(a){
  const label=(a.sourceName||a.name||a.id||'').toLowerCase(),role=a.role||'';let key='general';
  if(a.skinId&&profiles[a.skinId])key=a.skinId;
  else if(/chrome|firefox|msedge|brave|opera|browser/.test(label)||role.includes('탭')||role.includes('푸른'))key='browser';
  else if(/excel|winword|powerpnt|hwp|notepad/.test(label)||role.includes('문서')||role.includes('기록'))key='document';
  else if(/kakao|discord|slack|teams|telegram/.test(label)||role.includes('말풍선'))key='chat';
  else if(/code|codex|chatgpt|devenv|idea|pycharm/.test(label)||role.includes('코드'))key='code';
  else if(/spotify|vlc|music|player/.test(label)||role.includes('음파')||role.includes('리듬'))key='media';
  else if(label==='bin'||role.includes('흡수')||/휴지통|recycle/.test(label))key='bin';
  else if(label==='folder'||role.includes('수호')||role.includes('철갑'))key='folder';
  else if(label==='photo'||role.includes('그림')||role.includes('날쌘'))key='photo';
  if(a.job){const byJob={warrior:{name:'전사',skill:'대검 휩쓸기',style:'greatsword',speed:9},rogue:{name:'도적',skill:'그림자 연격',style:'dagger',speed:15},mage:{name:'마법사',skill:'마력 폭풍',style:'spellbook',speed:11},healer:{name:'힐러',skill:'치유의 빛',style:'staff',speed:8}};if(byJob[a.job])return {...byJob[a.job],key:a.job};}
  const p={...profiles[key],key};
  if(key==='browser'&&/msedge/.test(label)){p.style='orbit';p.skill='궤도 확장';}
  if(key==='browser'&&/firefox/.test(label)){p.style='flame';p.skill='불꽃 탐색';}
  if(key==='document'&&/excel/.test(label)){p.style='grid';p.skill='셀 방벽';}
  if(key==='document'&&/powerpnt/.test(label)){p.style='slides';p.skill='최종 발표';}
  if(key==='chat'&&/discord/.test(label)){p.style='signal';p.skill='서버 공명';}
  return p;
 }
 function create(){return {round:0,queue:[],currentId:null,phase:'ready',timer:.3,command:null,events:[],action:null};}
 function layout(actors,mode){
  if(mode==='jump')return;
  if(mode==='battle'){
   actors.forEach((a,i)=>{const t=i/Math.max(actors.length,1)*Math.PI*2-Math.PI/2;a.x=480+Math.cos(t)*285;a.y=280+Math.sin(t)*165;});return;
  }
  const allies=actors.filter(a=>a.team===0),enemies=actors.filter(a=>a.team!==0);
  allies.forEach((a,i)=>{a.x=180+(i%2)*135;a.y=(allies.length>4?130:175)+Math.floor(i/2)*(allies.length>4?150:175);});
  enemies.forEach((a,i)=>{a.x=610+(i%3)*115;a.y=130+Math.floor(i/3)*150;});
 }
 function roundQueue(actors){
  const teams=new Map();for(const a of actors.filter(a=>a.hp>0).sort((a,b)=>(profile(b).speed+(b.initiative||0))-(profile(a).speed+(a.initiative||0))||a.id.localeCompare(b.id))){if(!teams.has(a.team))teams.set(a.team,[]);teams.get(a.team).push(a.id);}
  const result=[];while([...teams.values()].some(a=>a.length))for(const queue of teams.values())if(queue.length)result.push(queue.shift());return result;
 }
 function enemiesOf(a,actors){return actors.filter(b=>b.hp>0&&b.team!==a.team).sort((a,b)=>a.hp/a.maxHp-b.hp/b.maxHp||a.id.localeCompare(b.id));}
 function isManual(a,actors,mode,automatic){return !automatic&&(mode==='dungeon'?a.team===0:a.id===actors[0]?.id);}
 function request(state,actors,mode,automatic,command){
  const current=actors.find(a=>a.id===state.currentId&&a.hp>0);
  if(state.phase!=='waiting'||!current||!isManual(current,actors,mode,automatic))return false;
  if(!['attack','skill','guard'].includes(command)||(command==='skill'&&(current.energy||0)<2))return false;
  state.command=command;return true;
 }
 function beginMotion(a,actors,command){
  a.motion=null;if(command==='guard'||!['warrior','rogue'].includes(a.job))return .45;
  const target=enemiesOf(a,actors)[0];if(!target)return .45;
  const dx=target.x-a.x,dy=target.y-a.y,distance=Math.hypot(dx,dy)||1,reach=Math.min(distance,a.meleeReach||75),rogue=a.job==='rogue';
  a.motion={targetId:target.id,fromX:a.x,fromY:a.y,toX:target.x-dx/distance*reach,toY:target.y-dy/distance*reach,elapsed:0,approach:rogue?.2:.42,hold:rogue?(command==='skill'?.5:.32):(command==='skill'?.72:.5),returnTime:rogue?.2:.42,arc:rogue?18:8};
  return a.motion.approach+.12;
 }
 function visualPosition(a){
  const m=a.motion;if(!m)return {x:a.x,y:a.y};let t;
  if(m.elapsed<m.approach){t=Math.max(0,m.elapsed/m.approach);const ease=t*t*(3-2*t);return {x:m.fromX+(m.toX-m.fromX)*ease,y:m.fromY+(m.toY-m.fromY)*ease-Math.sin(t*Math.PI)*m.arc};}
  if(m.elapsed<m.approach+m.hold)return {x:m.toX,y:m.toY};
  t=Math.min(1,Math.max(0,(m.elapsed-m.approach-m.hold)/m.returnTime));const ease=t*t*(3-2*t);
  return {x:m.toX+(a.x-m.toX)*ease,y:m.toY+(a.y-m.toY)*ease-Math.sin(t*Math.PI)*m.arc*.5};
 }
 function damage(source,target,amount,events){
  if(!target||target.hp<=0)return;
  if(source.id!==target.id){target.receivedHits=(target.receivedHits||0)+1;if(target.dodgeEvery&&target.receivedHits%target.dodgeEvery===0){events.push({type:'status',targetId:target.id,text:'회피'});return 0;}}
  let value=Math.max(1,Math.round(amount)-(target.armor||0));const absorbed=Math.min(target.shield||0,value);target.shield=Math.max(0,(target.shield||0)-absorbed);value-=absorbed;
  const dealt=Math.min(target.hp,value);target.hp=Math.max(0,target.hp-value);target.hit=.3;events.push({type:'damage',sourceId:source.id,targetId:target.id,amount:value,absorbed});
  if(target.hp===0)events.push({type:'defeat',targetId:target.id});
  return dealt;
 }
 function heal(source,target,value,events){const before=target.hp;target.hp=Math.min(target.maxHp,target.hp+Math.round(value*(source.healPower||1)));events.push({type:'heal',sourceId:source.id,targetId:target.id,amount:target.hp-before});}
 function shield(source,target,value,events){target.shield=Math.min(target.maxHp,Math.max(target.shield||0,Math.round(value)));events.push({type:'shield',sourceId:source.id,targetId:target.id,amount:target.shield});}
 function perform(a,actors,command){
  const events=[],p=profile(a),opponents=enemiesOf(a,actors),allies=actors.filter(b=>b.hp>0&&b.team===a.team),target=opponents[0];if(!target)return events;
  const skill=command==='skill'&&(a.energy||0)>=2;let power=a.atk*(a.weakened>0?.65:1)*(skill?(a.skillPower||1):1);if(a.weakened>0)a.weakened--;
  const affected=[];const hit=(t,mult)=>{affected.push(t.id);const dealt=damage(a,t,power*mult,events);if(a.lifesteal&&dealt>0)heal(a,a,dealt*a.lifesteal,events);};
  if(command==='guard'){a.energy=Math.min(3,(a.energy||0)+(a.energyGain||1));shield(a,a,a.maxHp*.3,events);events.push({type:'action',sourceId:a.id,targetIds:[a.id],style:'shield',name:'방어',skill:false});return events;}
  if(skill){a.energy-=2;
   switch(p.key){
    case 'warrior':hit(target,1.6);if(opponents[1])hit(opponents[1],.9);break;
    case 'rogue':for(let i=0;i<3&&target.hp>0;i++)hit(target,.65);break;
    case 'mage':opponents.forEach(t=>hit(t,.95));break;
    case 'healer':heal(a,[...allies].sort((x,y)=>x.hp/x.maxHp-y.hp/y.maxHp)[0],a.maxHp*.45,events);for(const ally of allies.filter(t=>t.hp/t.maxHp<.7))heal(a,ally,a.maxHp*.15,events);hit(target,.6);break;
    case 'browser':opponents.slice(0,3).forEach(t=>hit(t,.95));break;
    case 'document':allies.forEach(t=>shield(a,t,a.maxHp*.15,events));hit(target,1.45);break;
    case 'chat':heal(a,[...allies].sort((x,y)=>x.hp/x.maxHp-y.hp/y.maxHp)[0],a.maxHp*.4,events);hit(target,.85);break;
    case 'code':for(let i=0;i<3;i++){const t=enemiesOf(a,actors)[0];if(t)hit(t,.8);}break;
    case 'media':opponents.forEach(t=>hit(t,.85));heal(a,a,a.maxHp*.15,events);break;
    case 'folder':allies.forEach(t=>shield(a,t,a.maxHp*.25,events));hit(target,.8);break;
    case 'bin':hit(target,1.6);heal(a,a,power*.85,events);break;
    case 'photo':hit(target,1.3);target.weakened=2;events.push({type:'status',targetId:target.id,text:'공격 감소'});break;
    case 'slime':hit(target,1.1);target.poison={turns:2,damage:Math.max(3,Math.round(power*.3))};events.push({type:'status',targetId:target.id,text:'독 2턴'});break;
    case 'calendar':hit(target,1.1);target.weakened=2;events.push({type:'status',targetId:target.id,text:'일정 압박'});break;
    case 'report':hit(target,1.7);target.shield=0;break;
    case 'printer':for(let i=0;i<3&&target.hp>0;i++)hit(target,.7);break;
    case 'overtime':hit(target,1.1);heal(a,a,a.maxHp*.25,events);break;
    case 'briefcase':shield(a,a,a.maxHp*.2,events);hit(target,1.8);break;
    default:hit(target,2);
   }
   if(a.job==='healer'&&p.key!=='chat'&&p.key!=='healer')heal(a,[...allies].sort((x,y)=>x.hp/x.maxHp-y.hp/y.maxHp)[0],a.maxHp*.3,events);
   if(a.job==='warrior')shield(a,a,a.maxHp*.15,events);
   if(a.job==='rogue'&&target.hp>0)hit(target,.5);
  }else {a.energy=Math.min(3,(a.energy||0)+(a.energyGain||1));a.basicCount=(a.basicCount||0)+1;const critical=a.criticalEvery&&a.basicCount%a.criticalEvery===0;hit(target,(a.basicPower||1)*(critical?(a.criticalMultiplier||1.6):1));if(critical)events.push({type:'status',targetId:target.id,text:'치명타'});for(let i=0;i<(a.extraBasicHits||0);i++)hit(target,.55);}
  const supportIds=p.key==='healer'?events.filter(e=>e.type==='heal').map(e=>e.targetId):[];
  events.push({type:'action',sourceId:a.id,targetIds:[...new Set([...affected,...supportIds])],supportIds,style:p.style,name:skill?p.skill:'기본 공격',skill});return events;
 }
 function tick(state,actors,dt,mode,automatic){
  state.events=[];state.timer-=dt;
  for(const a of actors)if(a.motion){a.motion.elapsed+=dt;if(a.motion.elapsed>=a.motion.approach+a.motion.hold+a.motion.returnTime)a.motion=null;}
  if(state.currentId&&!actors.some(a=>a.id===state.currentId&&a.hp>0)){state.currentId=null;state.phase='ready';state.timer=.2;state.action=null;}
  if(state.phase!=='recover'&&new Set(actors.filter(a=>a.hp>0).map(a=>a.team)).size<2){state.phase='ready';state.currentId=null;state.command=null;for(const a of actors)a.motion=null;return state.events;}
  if(state.phase==='windup'){const a=actors.find(a=>a.id===state.currentId);if(a?.motion&&!actors.some(t=>t.id===a.motion.targetId&&t.hp>0))state.timer=beginMotion(a,actors,state.action);}
  if(state.phase==='waiting'){
   const a=actors.find(a=>a.id===state.currentId);
   if(!a){state.phase='ready';return state.events;}
   if(automatic)state.command=(a.energy||0)>=2?'skill':'attack';
   if(!state.command)return state.events;
   state.action=state.command;state.command=null;state.phase='windup';state.timer=beginMotion(a,actors,state.action);return state.events;
  }
  if(state.timer>0)return state.events;
  if(state.phase==='windup'){
   const a=actors.find(a=>a.id===state.currentId&&a.hp>0);if(a)state.events=perform(a,actors,state.action);
   state.phase='recover';state.timer=a?.motion?Math.max(.25,a.motion.approach+a.motion.hold+a.motion.returnTime-a.motion.elapsed+.1):state.action==='skill'?1.05:.8;return state.events;
  }
  if(state.phase==='recover'){state.phase='ready';state.currentId=null;state.timer=.2;return state.events;}
  if(!actors.some(a=>a.hp>0))return state.events;
  if(!state.queue.some(id=>actors.some(a=>a.id===id&&a.hp>0))){state.queue=roundQueue(actors);state.round++;for(const a of actors.filter(a=>a.hp>0)){if(a.roundShield)shield(a,a,a.maxHp*a.roundShield,state.events);if(a.roundRegen)heal(a,a,a.maxHp*a.roundRegen,state.events);}}
  let a;while(state.queue.length&&!a){const id=state.queue.shift();a=actors.find(a=>a.id===id&&a.hp>0);}
  if(!a||!enemiesOf(a,actors).length)return state.events;
  state.currentId=a.id;
  if(a.poison?.turns>0){damage(a,a,a.poison.damage,state.events);a.poison.turns--;if(a.hp<=0){state.phase='recover';state.timer=.6;return state.events;}}
  if(isManual(a,actors,mode,automatic)){state.phase='waiting';state.timer=0;state.command=null;}
  else{state.phase='windup';state.action=(a.energy||0)>=2?'skill':'attack';state.timer=beginMotion(a,actors,state.action);}
  return state.events;
 }
 const api={profile,create,layout,roundQueue,request,perform,tick,isManual,visualPosition};if(typeof module!=='undefined')module.exports=api;root.TurnCombat=api;
})(typeof globalThis!=='undefined'?globalThis:this);

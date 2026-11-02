(function(root){
 'use strict';
 const jobs={
  warrior:{id:'warrior',name:'전사',weapon:'대검',symbol:'⚔',color:'#e2b17b',description:'최대 체력 +30%, 공격력 +10%, 받는 피해 3 감소',hp:1.3,atk:1.1,armor:3},
  rogue:{id:'rogue',name:'도적',weapon:'단검',symbol:'◆',color:'#c5a5e5',description:'공격력 +15%, 세 번째 평타 치명타, 네 번째 피격 회피',hp:.95,atk:1.15,criticalEvery:3,dodgeEvery:4,initiative:3},
  mage:{id:'mage',name:'마법사',weapon:'마법서',symbol:'✧',color:'#94c9ec',description:'스킬 위력 +30%, 시작 기력 +1',hp:1,atk:1,skillPower:1.3,energy:1},
  healer:{id:'healer',name:'힐러',weapon:'스태프',symbol:'✚',color:'#a9d7aa',description:'회복량 +45%, 스킬에 아군 회복 추가, 매 라운드 자신 회복',hp:1.1,atk:1,healPower:1.45,roundRegen:.03}
 };
 const cards=[
  {id:'sharp',name:'날 선 평타',icon:'⚔',description:'파티 공격력 +15%, 기본 공격 피해 +20%',tags:['warrior','rogue'],apply:a=>{a.atk*=1.15;a.basicPower=(a.basicPower||1)+.2;}},
  {id:'double',name:'두 번 치기',icon:'Ⅱ',description:'평타에 공격력 55%의 추가 타격 1회',tags:['rogue','warrior'],apply:a=>{a.extraBasicHits=(a.extraBasicHits||0)+1;}},
  {id:'giant',name:'거인의 심장',icon:'♥',description:'최대 체력 +25%, 증가한 체력만큼 즉시 회복',tags:['warrior','healer'],apply:a=>{const gain=Math.round(a.maxHp*.25);a.maxHp+=gain;a.hp=Math.min(a.maxHp,a.hp+gain);}},
  {id:'mana',name:'마력 축적',icon:'✧',description:'파티 스킬 피해 +25%',tags:['mage'],apply:a=>{a.skillPower=(a.skillPower||1)+.25;}},
  {id:'charge',name:'기력 충전',icon:'ϟ',description:'평타·방어의 기력 회복 +1, 즉시 기력 +1',tags:['mage','healer'],apply:a=>{a.energyGain=(a.energyGain||1)+1;a.energy=Math.min(3,(a.energy||0)+1);}},
  {id:'vampire',name:'흡혈',icon:'◒',description:'공격으로 실제 준 피해의 15%만큼 자신 회복',tags:['rogue','warrior'],apply:a=>{a.lifesteal=(a.lifesteal||0)+.15;}},
  {id:'ward',name:'라운드 방벽',icon:'◇',description:'매 라운드 시작 시 최대 체력 12%의 방벽',tags:['warrior','mage'],apply:a=>{a.roundShield=(a.roundShield||0)+.12;}},
  {id:'medicine',name:'응급 처치',icon:'✚',description:'회복량 +30%, 매 라운드 최대 체력 5% 회복',tags:['healer'],apply:a=>{a.healPower=(a.healPower||1)+.3;a.roundRegen=(a.roundRegen||0)+.05;}},
  {id:'armor',name:'강철 무장',icon:'▣',description:'받는 피해 4 감소',tags:['warrior','healer'],apply:a=>{a.armor=(a.armor||0)+4;}},
  {id:'critical',name:'약점 간파',icon:'⌖',description:'세 번째 평타는 치명타, 치명타 배율 +40%',tags:['rogue'],apply:a=>{a.criticalEvery=3;a.criticalMultiplier=(a.criticalMultiplier||1.6)+.4;}},
  {id:'haste',name:'선수 필승',icon:'➶',description:'행동 우선도 +4, 공격력 +10%',tags:['rogue','mage'],apply:a=>{a.initiative=(a.initiative||0)+4;a.atk*=1.1;}},
  {id:'rest',name:'든든한 보급',icon:'✦',description:'즉시 최대 체력 45% 회복, 최대 체력 +10%',tags:['healer','warrior'],apply:a=>{a.maxHp=Math.round(a.maxHp*1.1);a.hp=Math.min(a.maxHp,a.hp+Math.round(a.maxHp*.45));}}
 ];
 function randomSeed(){const values=new Uint32Array(1);if(root.crypto?.getRandomValues)root.crypto.getRandomValues(values);else values[0]=Math.floor(Math.random()*4294967296);return values[0];}
 function create(seed){if(seed===undefined)seed=randomSeed();return {seed,classes:{},augments:[],rewardFloors:[],choice:null};}
 function randomJob(options=Object.keys(jobs)){const valid=options.filter(id=>jobs[id]);return valid.length?valid[randomSeed()%valid.length]:undefined;}
 function assign(a,jobId,run){
  if(a.job)return;const job=jobs[jobId];if(!job)throw new Error('Unknown job');
  a.job=jobId;run.classes[a.id]=jobId;const ratio=a.maxHp?a.hp/a.maxHp:1;a.maxHp=Math.round(a.maxHp*job.hp);a.hp=Math.max(a.hp>0?1:0,Math.round(a.maxHp*ratio));a.atk*=job.atk;
  for(const field of ['armor','criticalEvery','dodgeEvery','initiative','skillPower','healPower','roundRegen'])if(job[field]!==undefined)a[field]=job[field];
  if(job.energy)a.energy=Math.min(3,(a.energy||0)+job.energy);
  a.appliedAugments=[];for(const id of run.augments)apply(a,id);
 }
 function apply(a,id){const card=cards.find(c=>c.id===id);if(!card)return;const dead=a.hp<=0;card.apply(a);if(dead)a.hp=0;(a.appliedAugments??=[]).push(id);}
 function recommendJob(a,party,options=Object.keys(jobs)){
  const label=((a.sourceName||a.name||a.id||'')+' '+(a.role||'')).toLowerCase();
  let preferred=/chatgpt|codex/.test(label)?'mage':/chat|kakao|discord|slack|말풍선/.test(label)?'healer':/chrome|browser|firefox|edge|code|마법|음파|탭/.test(label)?'mage':/folder|수호|문서|기사|폴더/.test(label)?'warrior':'rogue';
  const chosen=party.filter(x=>x.job).map(x=>x.job);
  if(chosen.includes(preferred)){const missing=['warrior','mage','rogue','healer'].find(id=>!chosen.includes(id));if(missing)preferred=missing;}
  if(options.includes(preferred))return preferred;
  return options.find(id=>!chosen.includes(id))||options[0];
 }
 function offerJobs(run,actorId){
  let seed=run.seed>>>0;for(const ch of String(actorId))seed=(Math.imul(seed,31)+ch.charCodeAt(0))>>>0;
  const pool=Object.keys(jobs),result=[];for(let i=0;i<3;i++){seed=(Math.imul(seed,1664525)+1013904223)>>>0;result.push(pool.splice(seed%pool.length,1)[0]);}return result;
 }
 function offer(run,floor){
  let seed=(run.seed+floor*7919)>>>0;const pool=cards.slice(),out=[];
  for(let i=0;i<3;i++){seed=(Math.imul(seed,1664525)+1013904223)>>>0;out.push(pool.splice(seed%pool.length,1)[0].id);}return out;
 }
 function recommendAugment(ids,party){
  const scores=ids.map(id=>{const card=cards.find(c=>c.id===id);let score=0;for(const a of party){score+=card.tags.includes(a.job)?3:1;if(id==='rest')score+=(1-a.hp/a.maxHp)*9;if(id==='giant')score+=(1-a.hp/a.maxHp)*3;}return {id,score};});
  return scores.sort((a,b)=>b.score-a.score||a.id.localeCompare(b.id))[0]?.id;
 }
 function choose(run,id,party){if(!cards.some(c=>c.id===id))return;run.augments.push(id);for(const a of party)if(a.job)apply(a,id);}
 const api={jobs,cards,create,assign,apply,recommendJob,randomJob,offerJobs,offer,recommendAugment,choose};if(typeof module!=='undefined')module.exports=api;root.DungeonAugments=api;
})(typeof globalThis!=='undefined'?globalThis:this);

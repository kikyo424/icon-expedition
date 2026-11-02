(function(root){
 'use strict';
 const STEP_MS=5*60*1000,STEP_BONUS=.05,MAX_STEPS=20,sessionStartedAt=Date.now();
 function elapsedSeconds(now=Date.now()){return Math.max(0,Math.floor((now-sessionStartedAt)/1000));}
 function elapsedMinutes(now=Date.now()){return Math.floor(elapsedSeconds(now)/60);}
 function elapsedText(now=Date.now()){const total=elapsedSeconds(now),hours=Math.floor(total/3600),minutes=Math.floor(total%3600/60),seconds=total%60;return [hours,minutes,seconds].map(value=>String(value).padStart(2,'0')).join(':');}
 function factor(item,now=Date.now()){
  if(item.source!=='running')return 1;
  return 1+Math.min(MAX_STEPS,Math.max(0,Math.floor((now-sessionStartedAt)/STEP_MS)))*STEP_BONUS;
 }
 function initialize(a,now=Date.now()){
  const bonus=factor(a,now);a.uptimeHealthFactor=bonus;
  a.maxHp=Math.round(a.maxHp*bonus);a.hp=Math.min(a.maxHp,Math.round(a.hp*bonus));return a;
 }
 function update(a,item,now=Date.now()){
  if(item.source!=='running')return;
  const previous=a.uptimeHealthFactor||1,next=factor(item,now);if(next===previous)return;
  const oldMax=a.maxHp;const newMax=Math.round(oldMax*next/previous);a.maxHp=newMax;
  if(a.hp>0)a.hp=Math.max(1,Math.min(newMax,a.hp+Math.max(0,newMax-oldMax)));
  a.uptimeHealthFactor=next;
 }
 function describe(item,now=Date.now()){
  if(item.source!=='running')return '';
  return '원정대 실행 '+elapsedText(now)+' · 최대 체력 +'+Math.round((factor(item,now)-1)*100)+'%';
 }
 const api={factor,initialize,update,describe,STEP_MS,sessionStartedAt,elapsedSeconds,elapsedMinutes,elapsedText};if(typeof module!=='undefined')module.exports=api;root.RuntimeHealth=api;
})(typeof globalThis!=='undefined'?globalThis:this);

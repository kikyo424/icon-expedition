(function(root){
 'use strict';
 const STEP_MS=5*60*1000,STEP_BONUS=.05,MAX_STEPS=20;
 function factor(item,now=Date.now()){
  if(item.source!=='running'||!Number.isFinite(item.startedAtUnixMs)||item.startedAtUnixMs<=0)return 1;
  return 1+Math.min(MAX_STEPS,Math.max(0,Math.floor((now-item.startedAtUnixMs)/STEP_MS)))*STEP_BONUS;
 }
 function initialize(a,now=Date.now()){
  const bonus=factor(a,now);a.uptimeHealthFactor=bonus;
  a.maxHp=Math.round(a.maxHp*bonus);a.hp=Math.min(a.maxHp,Math.round(a.hp*bonus));return a;
 }
 function update(a,item,now=Date.now()){
  if(item.source!=='running')return;
  a.startedAtUnixMs=item.startedAtUnixMs;
  const previous=a.uptimeHealthFactor||1,next=factor(item,now);if(next===previous)return;
  const oldMax=a.maxHp;const newMax=Math.round(oldMax*next/previous);a.maxHp=newMax;
  if(a.hp>0)a.hp=Math.max(1,Math.min(newMax,a.hp+Math.max(0,newMax-oldMax)));
  a.uptimeHealthFactor=next;
 }
 function describe(item,now=Date.now()){
  if(item.source!=='running')return '';
  const minutes=Math.max(0,Math.floor((now-(item.startedAtUnixMs||now))/60000));
  return '실행 '+minutes+'분 · 최대 체력 +'+Math.round((factor(item,now)-1)*100)+'%';
 }
 const api={factor,initialize,update,describe,STEP_MS};if(typeof module!=='undefined')module.exports=api;root.RuntimeHealth=api;
})(typeof globalThis!=='undefined'?globalThis:this);

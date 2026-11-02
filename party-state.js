(function(root){
 'use strict';
 function reconcile(items,selected,excluded,limit,preferred=[]){
  const available=new Map(items.filter(a=>a&&typeof a.id==='string').map(a=>[a.id,a]));
  const result=[],blocked=new Set(excluded);
  const order=[...selected,...preferred,...items.filter(a=>a.active).map(a=>a.id),...available.keys()];
  for(const id of order)if(result.length<limit&&available.has(id)&&!blocked.has(id)&&!result.includes(id))result.push(id);
  return result;
 }
 const api={reconcile};if(typeof module!=='undefined')module.exports=api;root.PartyState=api;
})(typeof globalThis!=='undefined'?globalThis:this);

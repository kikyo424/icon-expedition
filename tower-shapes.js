(function(root){
 'use strict';
 const shapes={
  I:[[0,0],[1,0],[2,0],[3,0]],
  O:[[0,0],[1,0],[0,1],[1,1]],
  T:[[0,0],[1,0],[2,0],[1,1]],
  L:[[0,0],[0,1],[0,2],[1,2]],
  J:[[1,0],[1,1],[0,2],[1,2]],
  S:[[1,0],[2,0],[0,1],[1,1]],
  Z:[[0,0],[1,0],[1,1],[2,1]]
 };
 function createShape(key,size=32){
  if(!shapes[key])throw new Error('Unknown tower shape: '+key);
  if(!Number.isFinite(size)||size<=0)throw new Error('Invalid tower cell size');
  const points=shapes[key],cx=points.reduce((v,p)=>v+p[0]+.5,0)/points.length,cy=points.reduce((v,p)=>v+p[1]+.5,0)/points.length;
  return {shape:key,cells:points.map(([x,y])=>({x:(x-cx)*size,y:(y-cy)*size,w:size,h:size})),w:(Math.max(...points.map(p=>p[0]))+1)*size,h:(Math.max(...points.map(p=>p[1]))+1)*size};
 }
 function localRects(block){return block.cells?.length?block.cells:[{x:-block.w/2,y:-block.h/2,w:block.w,h:block.h}];}
 function rects(block){return localRects(block).map(r=>({x:block.x+r.x,y:block.y+r.y,w:r.w,h:r.h}));}
 function bounds(block){const cells=rects(block);return {left:Math.min(...cells.map(r=>r.x)),right:Math.max(...cells.map(r=>r.x+r.w)),top:Math.min(...cells.map(r=>r.y)),bottom:Math.max(...cells.map(r=>r.y+r.h))};}
 function mass(block){return localRects(block).reduce((sum,r)=>sum+r.w*r.h,0);}
 function targets(block,blocks){const result=[{index:-1,rect:{x:360,y:480,w:240,h:30}}];blocks.forEach((other,index)=>{if(other&&other!==block&&!other.loose)for(const rect of rects(other))result.push({index,rect});});return result;}
 function mergeContacts(items){
  items.sort((a,b)=>a.index-b.index||a.left-b.left||a.right-b.right);
  const merged=[];for(const item of items){const previous=merged[merged.length-1];if(previous&&previous.index===item.index&&item.left<=previous.right+.001)previous.right=Math.max(previous.right,item.right);else merged.push({...item});}return merged;
 }
 function contacts(block,blocks,ignore=block){
  const result=[],surfaces=targets(ignore,blocks);
  for(const cell of rects(block))for(const {index,rect} of surfaces){const left=Math.max(cell.x,rect.x),right=Math.min(cell.x+cell.w,rect.x+rect.w);if(right-left>3&&Math.abs(cell.y+cell.h-rect.y)<=5)result.push({index,left,right});}
  return mergeContacts(result);
 }
 function landing(block,oldY,blocks){
  if(block.y<oldY)return null;
  let y=Infinity;const surfaces=targets(block,blocks);
  for(const cell of localRects(block))for(const {rect} of surfaces){
   const left=Math.max(block.x+cell.x,rect.x),right=Math.min(block.x+cell.x+cell.w,rect.x+rect.w);
   const oldBottom=oldY+cell.y+cell.h,newBottom=block.y+cell.y+cell.h;
   if(right-left>3&&oldBottom<=rect.y+.001&&newBottom>=rect.y-.001)y=Math.min(y,rect.y-cell.y-cell.h);
  }
  return Number.isFinite(y)?{y,contacts:contacts({...block,y},blocks,block)}:null;
 }
 const api={shapes,createShape,rects,bounds,mass,contacts,landing};
 if(typeof module!=='undefined')module.exports=api;root.TowerShapes=api;
})(typeof globalThis!=='undefined'?globalThis:this);

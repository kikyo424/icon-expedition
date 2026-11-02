const {test}=require('node:test');
const assert=require('node:assert/strict');
const {overlap,target,move,stepJump}=require('../engine.js');
test('충돌은 겹칠 때만 판정한다',()=>{assert.equal(overlap({x:0,y:0,w:10,h:10},{x:9,y:9,w:5,h:5}),true);assert.equal(overlap({x:0,y:0,w:10,h:10},{x:10,y:0,w:5,h:5}),false);});
test('아군과 사망자를 제외한 가장 가까운 적을 선택한다',()=>{const a={x:0,y:0,team:0};const enemy={x:10,y:0,team:1,hp:10};assert.equal(target(a,[{x:1,y:0,team:0,hp:10},{x:2,y:0,team:1,hp:0},enemy]),enemy);assert.equal(target(a,[]),undefined);});
test('대각선 이동도 같은 속도이며 경기장 경계를 지킨다',()=>{const a={x:0,y:0};move(a,1,1,100,1,{left:0,right:200,top:0,bottom:200});assert.ok(Math.abs(Math.hypot(a.x,a.y)-100)<.001);move(a,1,1,1000,1,{left:0,right:200,top:0,bottom:200});assert.equal(a.x,200);assert.equal(a.y,200);});
test('점프 중 재점프하지 않고 지면에 착지한다',()=>{const p={y:410,vy:0,grounded:true};stepJump(p,.016,true);assert.ok(p.y<410);const vy=p.vy;stepJump(p,.016,true);assert.ok(p.vy>vy);for(let i=0;i<150;i++)stepJump(p,.016,false);assert.equal(p.y,410);assert.equal(p.grounded,true);});
test('겹친 파티와 적을 분리하고 경계 안에 유지한다',()=>{const actors=Array.from({length:6},()=>({x:80,y:110,hp:100}));for(let k=0;k<20;k++)require('../engine.js').separate(actors);for(let i=0;i<actors.length;i++){assert.ok(actors[i].x>=80&&actors[i].y>=110);for(let j=i+1;j<actors.length;j++)assert.ok(Math.hypot(actors[i].x-actors[j].x,actors[i].y-actors[j].y)>=83.9);}});

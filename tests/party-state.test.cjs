const {test}=require('node:test');const assert=require('node:assert/strict');const {reconcile}=require('../party-state.js');
const apps=['a','b','c','d','e'].map(id=>({id,active:id==='c'}));
test('현재 파티를 유지하고 빈 자리에 활성 앱을 합류시킨다',()=>{assert.deepEqual(reconcile(apps,['a'],[],3),['a','c','b']);});
test('닫힌 앱과 제외한 앱을 제거하고 대기 앱을 채운다',()=>{assert.deepEqual(reconcile(apps,['closed','a','b'],['b'],3),['a','c','d']);});
test('저장된 우선 선택과 정원을 지키고 중복 창을 합친다',()=>{assert.deepEqual(reconcile([...apps,apps[0]],[],[],2,['e']),['e','c']);assert.deepEqual(reconcile([],['a'],[],4),[]);});

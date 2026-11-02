const {test}=require('node:test');
const assert=require('node:assert/strict');
const {characterTraits}=require('../electron/characters.cjs');
test('폴더는 확장자보다 폴더 속성을 우선하고 종류마다 능력치를 부여한다',()=>{
 assert.equal(characterTraits('사진.zip',true).role,'폴더 수호자');
 assert.equal(characterTraits('사진.PNG',false).role,'그림 마법사');
 assert.equal(characterTraits('앱.lnk',false).role,'앱 돌격대');
 assert.ok(characterTraits('자료.zip',false).hp>characterTraits('사진.png',false).hp);
 assert.ok(characterTraits('문서.hwp',false).atk>0);
});

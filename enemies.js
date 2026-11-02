(function(root){
 const eyes='<path d="M22 29l7 3m13-3l-7 3" fill="none" stroke="#28313d" stroke-width="3" stroke-linecap="round"/><path d="M27 43q5-5 10 0" fill="none" stroke="#28313d" stroke-width="2.5" stroke-linecap="round"/>';
 const svg=(body)=>'data:image/svg+xml;charset=utf-8,'+encodeURIComponent('<svg xmlns="http://www.w3.org/2000/svg" width="64" height="64" viewBox="0 0 64 64">'+body+'</svg>');
 const presets=[
  {id:'slime',name:'슬라임',color:'#8fba6b',image:svg('<path d="M7 44C4 29 19 12 32 12s28 17 25 32q-2 12-25 12T7 44" fill="#99cf69" stroke="#446d39" stroke-width="2"/><ellipse cx="22" cy="21" rx="7" ry="3" fill="#d7f3ad"/>'+eyes)},
  {id:'report',name:'밀린 보고서',color:'#a9c6e8',image:svg('<path d="M14 5h25l12 12v41H14z" fill="#f0f4f8" stroke="#687c9b" stroke-width="2"/><path d="M39 5v13h12" fill="#bfd3eb"/><path d="M21 22h13M21 49h22M21 53h16" stroke="#7e9bb8" stroke-width="2"/>'+eyes)},
  {id:'calendar',name:'마감 캘린더',color:'#e59e9e',image:svg('<rect x="7" y="12" width="50" height="45" rx="6" fill="#fff2e8" stroke="#a86f71" stroke-width="2"/><path d="M8 25h48V17q0-5-6-5H14q-6 0-6 5" fill="#e98b91"/><path d="M20 7v12M44 7v12" stroke="#e9d9bb" stroke-width="5" stroke-linecap="round"/>'+eyes)},
  {id:'briefcase',name:'끝없는 업무',color:'#cca882',image:svg('<path d="M24 18v-7h16v7" fill="none" stroke="#b9a18a" stroke-width="5"/><rect x="5" y="18" width="54" height="37" rx="6" fill="#b78d67" stroke="#6d5449" stroke-width="2"/><path d="M7 34q25 8 50 0" fill="none" stroke="#e4c2a2" stroke-width="2"/>'+eyes)},
  {id:'printer',name:'고장난 프린터',color:'#b5bac8',image:svg('<path d="M19 5h26v19H19z" fill="#f4f4e8" stroke="#8a929c" stroke-width="2"/><rect x="6" y="21" width="52" height="31" rx="7" fill="#b5c1c8" stroke="#5a6872" stroke-width="2"/><path d="M19 45h26v14H19z" fill="#edf1ed" stroke="#7d8d98" stroke-width="2"/>'+eyes)},
  {id:'overtime',name:'야근 시계',color:'#c2ace8',image:svg('<circle cx="32" cy="33" r="25" fill="#e5d7f7" stroke="#9075ae" stroke-width="4"/><path d="M32 15v17l12 7" fill="none" stroke="#a58ebd" stroke-width="3" stroke-linecap="round"/>'+eyes)}
 ];
 if(typeof module!=='undefined')module.exports=presets;root.EnemyPresets=presets;
})(typeof globalThis!=='undefined'?globalThis:this);

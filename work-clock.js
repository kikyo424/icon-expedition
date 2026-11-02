(function(root){
 'use strict';
 const formatter=new Intl.DateTimeFormat('en-GB',{timeZone:'Asia/Seoul',hourCycle:'h23',hour:'2-digit',minute:'2-digit',second:'2-digit'});
 function validTime(value){return typeof value==='string'&&/^([01]\d|2[0-3]):[0-5]\d$/.test(value);}
 function display(now,endTime){
  const parts=Object.fromEntries(formatter.formatToParts(now).map(a=>[a.type,a.value]));
  const time=parts.hour+':'+parts.minute+':'+parts.second;
  if(!validTime(endTime))return {time,label:'퇴근 시각 입력',remaining:null};
  const [h,m]=endTime.split(':').map(Number),seconds=(h*60+m)*60-(Number(parts.hour)*3600+Number(parts.minute)*60+Number(parts.second));
  if(seconds<=0)return {time,label:'퇴근 시간입니다',remaining:0};
  const hours=Math.floor(seconds/3600),minutes=Math.floor(seconds%3600/60),s=seconds%60;
  return {time,label:'퇴근까지 '+(hours?hours+'시간 ':'')+minutes+'분 '+String(s).padStart(2,'0')+'초',remaining:seconds};
 }
 const api={validTime,display};if(typeof module!=='undefined')module.exports=api;root.WorkClock=api;
})(typeof globalThis!=='undefined'?globalThis:this);

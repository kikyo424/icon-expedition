const path=require('node:path');
const {execFile}=require('node:child_process');
const {promisify}=require('node:util');
function appTraits(exe){
 if(/chrome|firefox|msedge|brave|opera/i.test(exe))return {role:'탭 마법사',color:'#86bcdf',hp:115,atk:27};
 if(/excel|winword|powerpnt|hwp|hanword|notepad/i.test(exe))return {role:'문서 기사',color:'#9dd6b0',hp:155,atk:21};
 if(/kakao|slack|discord|teams|telegram/i.test(exe))return {role:'말풍선 지원가',color:'#e7cd7a',hp:135,atk:23};
 if(/code|devenv|idea|pycharm|codex|chatgpt/i.test(exe))return {role:'코드 전사',color:'#b4a2ea',hp:125,atk:26};
 if(/spotify|vlc|music|player/i.test(exe))return {role:'음파 마법사',color:'#dca3c3',hp:110,atk:28};
 return {role:'앱 모험가',color:'#b6cfac',hp:140,atk:22};
}
async function readRunningApps(excludedPath){
 const powershell=path.join(process.env.SystemRoot||'C:\\Windows','System32','WindowsPowerShell','v1.0','powershell.exe');
 const {stdout}=await promisify(execFile)(powershell,['-NoProfile','-NonInteractive','-STA','-ExecutionPolicy','Bypass','-File',path.join(__dirname,'running-apps.ps1'),'-ExcludePath',excludedPath],{windowsHide:true,encoding:'utf8',timeout:20000,maxBuffer:12*1024*1024});
 const entries=JSON.parse(stdout.replace(/^\uFEFF/,''));
 return normalizeApps(entries);
}
function normalizeApps(entries){
 return (Array.isArray(entries)?entries:[]).filter(item=>item&&typeof item.Path==='string'&&item.Name!=='아이콘 원정대'&&path.win32.basename(item.Path).toLowerCase()!=='electron.exe'&&String(item.Name).trim().toLowerCase()!=='electron').map(item=>({id:'app-'+Buffer.from(item.Path.toLowerCase()).toString('base64url'),name:item.Name,sourceName:path.win32.basename(item.Path),source:'running',image:item.Image,active:item.Active,iconSizePx:item.IconSize,startedAtUnixMs:Number(item.StartedAt)||undefined,...appTraits(path.win32.basename(item.Path))}));
}
module.exports={readRunningApps,appTraits,normalizeApps};

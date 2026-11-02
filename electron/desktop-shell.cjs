const path=require('node:path');
const {execFile}=require('node:child_process');
const {promisify}=require('node:util');
const {characterTraits}=require('./characters.cjs');
async function readShellDesktop(){
 const powershell=path.join(process.env.SystemRoot||'C:\\Windows','System32','WindowsPowerShell','v1.0','powershell.exe');
 const {stdout}=await promisify(execFile)(powershell,['-NoProfile','-NonInteractive','-STA','-ExecutionPolicy','Bypass','-File',path.join(__dirname,'desktop-shell.ps1')],{windowsHide:true,encoding:'utf8',timeout:45000,maxBuffer:12*1024*1024});
 const entries=JSON.parse(stdout.replace(/^\uFEFF/,''));
 return entries.map(item=>({id:'desktop-'+Buffer.from(item.path).toString('base64url'),...characterTraits(item.path,item.isDirectory),name:item.name,sourceName:item.name,source:'desktop',image:item.image||undefined,imageSource:item.image?'windows-shell':'unavailable',iconSizePx:item.iconSize,iconSizeSource:item.iconSizeSource}));
}
module.exports={readShellDesktop};

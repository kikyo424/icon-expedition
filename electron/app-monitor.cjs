const {spawn}=require('node:child_process');
const path=require('node:path');
class AppMonitor {
 constructor(excludedPath){this.excludedPath=excludedPath;this.child=null;this.latest=null;this.waiters=[];}
 async snapshot(){
  clearTimeout(this.idle);this.idle=setTimeout(()=>this.stop(),16000);this.idle.unref();
  if(!this.child)this.start();
  if(this.latest)return this.latest;
  return new Promise((resolve,reject)=>{const pending={resolve,reject};this.waiters.push(pending);pending.timer=setTimeout(()=>{this.waiters=this.waiters.filter(a=>a!==pending);reject(new Error('앱 목록 응답 시간 초과'));this.stop();},20000);});
 }
 start(){
  const {normalizeApps}=require('./running-apps.cjs');
  const powershell=path.join(process.env.SystemRoot||'C:\\Windows','System32','WindowsPowerShell','v1.0','powershell.exe');
  const child=spawn(powershell,['-NoProfile','-NonInteractive','-STA','-ExecutionPolicy','Bypass','-File',path.join(__dirname,'running-apps.ps1'),'-ExcludePath',this.excludedPath,'-Watch'],{windowsHide:true,stdio:['ignore','pipe','pipe']});
  this.child=child;let buffer='';
  child.stdout.setEncoding('utf8');child.stdout.on('data',chunk=>{
   if(this.child!==child)return;
   buffer+=chunk;if(buffer.length>16*1024*1024){this.stop();return;}
   let boundary;while((boundary=buffer.indexOf('\n'))>=0){const line=buffer.slice(0,boundary).trim().replace(/^\uFEFF/,'');buffer=buffer.slice(boundary+1);if(!line)continue;
    try{this.latest=normalizeApps(JSON.parse(line));for(const pending of this.waiters){clearTimeout(pending.timer);pending.resolve(this.latest);}this.waiters=[];}catch{}
   }
  });
  child.stderr.on('data',()=>{});
  const ended=()=>{if(this.child!==child)return;this.child=null;this.latest=null;for(const pending of this.waiters){clearTimeout(pending.timer);pending.reject(new Error('앱 연결이 종료되었습니다'));}this.waiters=[];};
  child.on('error',ended);child.on('exit',ended);
 }
 stop(){clearTimeout(this.idle);const child=this.child;this.child=null;this.latest=null;if(child)child.kill();for(const pending of this.waiters){clearTimeout(pending.timer);pending.reject(new Error('앱 연결이 중지되었습니다'));}this.waiters=[];}
}
module.exports={AppMonitor};

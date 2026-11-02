const fs=require('node:fs/promises');
const path=require('node:path');
const {execFile}=require('node:child_process');
const {promisify}=require('node:util');
const {createHash}=require('node:crypto');
const run=promisify(execFile);
const root=path.resolve(__dirname,'..');
const runtimeFiles=['index.html','style.css','app.js','engine.js','enemies.js','party-state.js','combat.js','combat-fx.js','brawl.js','augments.js','augment-view.js','work-clock.js','runtime-health.js','leisure.js','tower-shapes.js'];
async function main(){
 if(process.platform!=='win32')throw new Error('Windows에서 실행해주세요.');
 const pkg=JSON.parse(await fs.readFile(path.join(root,'package.json'),'utf8'));
 const electronExe=require('electron'),electronRoot=path.dirname(electronExe);
 const electronVersion=(await fs.readFile(path.join(electronRoot,'version'),'utf8')).trim();
 const archiveName=`icon-expedition-${pkg.version}-win-${process.arch}`;
 const dist=path.join(root,'dist');await fs.mkdir(dist,{recursive:true});
 // Each run gets a fresh directory; previous distributions are never removed or overwritten.
 const output=await fs.mkdtemp(path.join(dist,archiveName+'-'));
 const appDir=path.join(output,archiveName),resources=path.join(appDir,'resources','app');
 await fs.cp(electronRoot,appDir,{recursive:true,filter:src=>path.basename(src)!=='default_app.asar'});
 await fs.rename(path.join(appDir,'electron.exe'),path.join(appDir,'IconExpedition.exe'));
 const crashDll=path.join(appDir,'electron_wer.dll');try{await fs.rename(crashDll,path.join(appDir,'IconExpedition_wer.dll'));}catch(error){if(error.code!=='ENOENT')throw error;}
 await fs.mkdir(resources,{recursive:true});
 for(const file of runtimeFiles)await fs.copyFile(path.join(root,file),path.join(resources,file));
 await fs.cp(path.join(root,'electron'),path.join(resources,'electron'),{recursive:true});
 await fs.writeFile(path.join(resources,'package.json'),JSON.stringify({name:pkg.name,productName:'아이콘 원정대',version:pkg.version,description:pkg.description,main:pkg.main},null,2)+'\n');
 await fs.copyFile(path.join(root,'README.md'),path.join(appDir,'README.md'));
 await fs.writeFile(path.join(appDir,'시작하기.txt'),'아이콘 원정대 '+pkg.version+'\r\n\r\n1. ZIP 전체를 원하는 폴더에 압축 해제하세요.\r\n2. IconExpedition.exe를 실행하세요.\r\n\r\nNode.js 설치, 관리자 권한, 별도 서버가 필요하지 않습니다.\r\nEXE 옆의 resources, locales, DLL 파일도 함께 있어야 합니다. EXE만 옮기지 마세요.\r\n각 컴퓨터의 앱과 바탕화면 아이콘을 사용하며 저장 데이터는 해당 Windows 사용자 프로필에 보관됩니다.\r\n업데이트할 때에는 앱을 종료하고 새 배포본을 별도 폴더에 압축 해제하세요.\r\n\r\n이 배포본은 코드 서명이 없는 테스트용 ZIP 버전입니다. 자동 업데이트와 설치 마법사는 포함하지 않습니다.\r\n자세한 기능과 조작은 README.md를 참고하세요.\r\n','utf8');
 let revision='unknown';try{revision=(await run('git',['rev-parse','HEAD'],{cwd:root,windowsHide:true})).stdout.trim();}catch{}
 await fs.writeFile(path.join(appDir,'build-info.json'),JSON.stringify({name:'아이콘 원정대',version:pkg.version,electronVersion,platform:process.platform,arch:process.arch,revision,builtAt:new Date().toISOString()},null,2)+'\n');
 console.log('앱 폴더 생성 완료: '+appDir);
 const archive=path.join(output,archiveName+'.zip');
 const psQuote=value=>"'"+value.replace(/'/g,"''")+"'";
 const command=`$ErrorActionPreference='Stop'; Add-Type -AssemblyName System.IO.Compression.FileSystem; [IO.Compression.ZipFile]::CreateFromDirectory(${psQuote(appDir)},${psQuote(archive)},[IO.Compression.CompressionLevel]::Optimal,$true)`;
 await run(path.join(process.env.SystemRoot||'C:\\Windows','System32','WindowsPowerShell','v1.0','powershell.exe'),['-NoProfile','-NonInteractive','-Command',command],{windowsHide:true,maxBuffer:1024*1024});
 const hash=createHash('sha256');const handle=await fs.open(archive);for await(const chunk of handle.createReadStream())hash.update(chunk);const digest=hash.digest('hex');
 await fs.writeFile(archive+'.sha256',digest+'  '+path.basename(archive)+'\n');
 console.log('배포 ZIP: '+archive);console.log('SHA-256: '+digest);
}
main().catch(error=>{console.error(error.message);process.exitCode=1;});

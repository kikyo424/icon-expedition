const {app,BrowserWindow,ipcMain,nativeImage,screen}=require('electron');
const path=require('node:path');
const fs=require('node:fs/promises');
const {characterTraits}=require('./characters.cjs');
const {readShellDesktop}=require('./desktop-shell.cjs');
const {AppMonitor}=require('./app-monitor.cjs');
let win;
if(process.env.ICON_EXPEDITION_TEST_PROFILE&&!app.isPackaged){require('node:fs').mkdirSync(process.env.ICON_EXPEDITION_TEST_PROFILE,{recursive:true});app.setPath('userData',process.env.ICON_EXPEDITION_TEST_PROFILE);}
function valid(event){return win&&!win.isDestroyed()&&event.sender===win.webContents&&event.senderFrame===win.webContents.mainFrame;}
const singleInstance=app.requestSingleInstanceLock();if(!singleInstance)app.quit();app.on('second-instance',()=>{if(win&&!win.isDestroyed()){win.show();win.focus();}});
if(singleInstance)app.whenReady().then(async()=>{
 const monitor=new AppMonitor(app.getPath('exe'));app.on('before-quit',()=>monitor.stop());
 const stateFile=path.join(app.getPath('userData'),'widget-position.json');let widgetPosition=null,compactMode=false,positionTimer;try{const state=JSON.parse(await fs.readFile(stateFile,'utf8'));if(Number.isFinite(state.x)&&Number.isFinite(state.y))widgetPosition=state;}catch{}

 win=new BrowserWindow({width:1380,height:940,minWidth:420,minHeight:300,transparent:true,frame:false,backgroundColor:'#00000000',title:'아이콘 원정대',autoHideMenuBar:true,webPreferences:{preload:path.join(__dirname,'preload.cjs'),contextIsolation:true,nodeIntegration:false,sandbox:true,backgroundThrottling:false}});
 win.on('move',()=>{if(!compactMode)return;clearTimeout(positionTimer);positionTimer=setTimeout(()=>{if(win.isDestroyed())return;const {x,y}=win.getBounds();widgetPosition={x,y};fs.writeFile(stateFile,JSON.stringify(widgetPosition)).catch(()=>{});},400);});
 win.loadFile(path.join(__dirname,'..','index.html'),{query:process.argv.includes('--running-apps')?{source:'running'}:{}});
 win.webContents.setWindowOpenHandler(()=>({action:'deny'}));
 win.webContents.on('will-navigate',event=>event.preventDefault());
 ipcMain.handle('window:pin',event=>{if(!valid(event))throw new Error('Invalid sender');win.setAlwaysOnTop(!win.isAlwaysOnTop());return win.isAlwaysOnTop();});
 let normalBounds;
 ipcMain.handle('window:compact',async(event,compact)=>{
  if(!valid(event)||typeof compact!=='boolean')throw new Error('Invalid request');
  if(compact){
   if(!compactMode)normalBounds=win.getBounds();compactMode=true;
   win.setAspectRatio(0);win.setMinimumSize(560,355);win.setMaximumSize(560,355);
   win.setResizable(false);win.setMaximizable(false);win.setFullScreenable(false);win.setAlwaysOnTop(true);
   let bounds={...win.getBounds(),width:560,height:355};
   if(widgetPosition){const area=screen.getDisplayMatching({...widgetPosition,width:560,height:355}).workArea;bounds.x=Math.round(Math.max(area.x,Math.min(area.x+area.width-560,widgetPosition.x)));bounds.y=Math.round(Math.max(area.y,Math.min(area.y+area.height-355,widgetPosition.y)));}
   win.setBounds(bounds);await new Promise(resolve=>setTimeout(resolve,40));if(compactMode&&!win.isDestroyed())win.setBounds(bounds);
  }else{
   compactMode=false;win.setResizable(true);win.setMaximizable(true);win.setFullScreenable(true);win.setMaximumSize(0,0);win.setAspectRatio(0);win.setMinimumSize(420,300);if(normalBounds)win.setBounds(normalBounds);
  }
  return win.isDestroyed()?null:win.getBounds();
 });
 ipcMain.handle('window:action',(event,action)=>{if(!valid(event))throw new Error('Invalid sender');if(action==='close')win.close();else if(action==='minimize')win.minimize();});
 ipcMain.handle('apps:running',event=>{if(!valid(event))throw new Error('Invalid sender');return monitor.snapshot();});
 ipcMain.handle('desktop:icons',async event=>{
  if(!valid(event))throw new Error('Invalid sender');
  if(process.platform==='win32'){
   try{return await readShellDesktop();}catch(error){console.warn('Windows Shell enumeration failed:',error.message);}
  }
  const dirs=[app.getPath('desktop'),path.join(process.env.PUBLIC||'C:\\Users\\Public','Desktop')];const items=[];
  for(const dir of new Set(dirs)){let entries;try{entries=await fs.readdir(dir,{withFileTypes:true});}catch{continue;}
   for(const entry of entries){if(items.length>=60)break;if(entry.name.startsWith('.')||entry.name.toLowerCase()==='desktop.ini')continue;const full=path.join(dir,entry.name);let icon;try{icon=await app.getFileIcon(full,{size:'large'});}catch{icon=nativeImage.createEmpty();}items.push({id:'desktop-'+Buffer.from(full).toString('base64url'),name:entry.name.replace(/\.(lnk|url)$/i,''),sourceName:entry.name,source:'desktop',image:icon.isEmpty()?undefined:icon.toDataURL(),...characterTraits(entry.name,entry.isDirectory())});}
  }return items;
 });
});
app.on('window-all-closed',()=>app.quit());

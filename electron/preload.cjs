const {contextBridge,ipcRenderer}=require('electron');
contextBridge.exposeInMainWorld('desktop',{getRunningApps:()=>ipcRenderer.invoke('apps:running'),getIcons:()=>ipcRenderer.invoke('desktop:icons'),togglePin:()=>ipcRenderer.invoke('window:pin'),setCompact:compact=>ipcRenderer.invoke('window:compact',compact),windowAction:action=>ipcRenderer.invoke('window:action',action)});

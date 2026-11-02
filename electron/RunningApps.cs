using System;
using System.Collections.Generic;
using System.Diagnostics;
using System.Drawing;
using System.Drawing.Imaging;
using System.IO;
using System.Runtime.InteropServices;
public static class RunningApps {
 public class AppInfo { public string Path,Name,Image; public bool Active; public double StartedAt; }
 delegate bool EnumProc(IntPtr window,IntPtr data);
 [DllImport("user32.dll")] static extern bool EnumWindows(EnumProc proc,IntPtr data);
 [DllImport("user32.dll")] static extern bool IsWindowVisible(IntPtr window);
 [DllImport("user32.dll")] static extern IntPtr GetWindow(IntPtr window,uint command);
 [DllImport("user32.dll")] static extern uint GetWindowThreadProcessId(IntPtr window,out uint pid);
 [DllImport("user32.dll")] static extern IntPtr GetForegroundWindow();
 [DllImport("user32.dll",EntryPoint="GetWindowLongPtrW")] static extern IntPtr GetWindowLongPtr(IntPtr window,int index);
 [DllImport("user32.dll",EntryPoint="GetClassLongPtrW")] static extern IntPtr GetClassLongPtr(IntPtr window,int index);
 [DllImport("user32.dll",CharSet=CharSet.Unicode)] static extern IntPtr SendMessageTimeout(IntPtr window,uint message,IntPtr wParam,IntPtr lParam,uint flags,uint timeout,out IntPtr result);
 [DllImport("dwmapi.dll")] static extern int DwmGetWindowAttribute(IntPtr window,int attribute,out int value,int size);
 [DllImport("kernel32.dll")] static extern IntPtr OpenProcess(uint access,bool inherit,uint pid);
 [DllImport("kernel32.dll",CharSet=CharSet.Unicode)] static extern bool QueryFullProcessImageName(IntPtr process,uint flags,System.Text.StringBuilder path,ref int size);
 [DllImport("kernel32.dll")] static extern bool CloseHandle(IntPtr handle);
 [DllImport("kernel32.dll")] static extern bool GetProcessTimes(IntPtr handle,out long creation,out long exit,out long kernel,out long user);
 static string WindowIcon(IntPtr window) {
  IntPtr icon;SendMessageTimeout(window,0x7f,new IntPtr(1),IntPtr.Zero,2,150,out icon);
  if(icon==IntPtr.Zero)icon=GetClassLongPtr(window,-14);
  if(icon==IntPtr.Zero)SendMessageTimeout(window,0x7f,IntPtr.Zero,IntPtr.Zero,2,150,out icon);
  if(icon==IntPtr.Zero)return null;
  using(var bitmap=Icon.FromHandle(icon).ToBitmap())using(var stream=new MemoryStream()){bitmap.Save(stream,ImageFormat.Png);return "data:image/png;base64,"+Convert.ToBase64String(stream.ToArray());}
 }
 public static AppInfo[] Read(string excludedPath) {
  var results=new Dictionary<string,AppInfo>(StringComparer.OrdinalIgnoreCase);uint activePid;GetWindowThreadProcessId(GetForegroundWindow(),out activePid);
  EnumWindows(delegate(IntPtr window,IntPtr data){
   try {
    if(!IsWindowVisible(window)||GetWindow(window,4)!=IntPtr.Zero||(GetWindowLongPtr(window,-20).ToInt64()&0x80)!=0)return true;
    int cloaked;if(DwmGetWindowAttribute(window,14,out cloaked,4)==0&&cloaked!=0)return true;
    uint pid;GetWindowThreadProcessId(window,out pid);IntPtr process=OpenProcess(0x1000,false,pid);if(process==IntPtr.Zero)return true;
    string path;double startedAt=0;try{var buffer=new System.Text.StringBuilder(32768);int size=buffer.Capacity;if(!QueryFullProcessImageName(process,0,buffer,ref size))return true;path=buffer.ToString();long creation,exit,kernel,user;if(GetProcessTimes(process,out creation,out exit,out kernel,out user))startedAt=(DateTime.FromFileTimeUtc(creation)-new DateTime(1970,1,1,0,0,0,DateTimeKind.Utc)).TotalMilliseconds;}finally{CloseHandle(process);}
    string exe=System.IO.Path.GetFileName(path).ToLowerInvariant();
    if(string.Equals(path,excludedPath,StringComparison.OrdinalIgnoreCase)||exe=="electron.exe"||exe=="shellexperiencehost.exe"||exe=="startmenuexperiencehost.exe"||exe=="searchhost.exe"||exe=="textinputhost.exe"||exe=="applicationframehost.exe")return true;
    // The desktop and taskbar belong to Explorer but have no ordinary app window.
    if(exe=="explorer.exe"&&(GetWindowLongPtr(window,-16).ToInt64()&0x00c00000)==0)return true;
    if(results.ContainsKey(path)){if(pid==activePid)results[path].Active=true;if(startedAt>0&&(results[path].StartedAt==0||startedAt<results[path].StartedAt))results[path].StartedAt=startedAt;return true;}
    string name=FileVersionInfo.GetVersionInfo(path).ProductName;if(string.IsNullOrWhiteSpace(name))name=System.IO.Path.GetFileNameWithoutExtension(path);
    if(name=="아이콘 원정대"||string.Equals(name.Trim(),"Electron",StringComparison.OrdinalIgnoreCase))return true;
    string image=null;try{image=WindowIcon(window);}catch{}
    if(image==null)try{image=DesktopImage.Read(path);}catch{}
    results[path]=new AppInfo{Path=path,Name=name,Image=image,Active=pid==activePid,StartedAt=startedAt};
   } catch {} return true;
  },IntPtr.Zero);
  var array=new List<AppInfo>(results.Values);array.Sort((a,b)=>a.Name.CompareTo(b.Name));return array.ToArray();
 }
}

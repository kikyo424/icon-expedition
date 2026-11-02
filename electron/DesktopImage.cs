using System;
using System.IO;
using System.Drawing;
using System.Drawing.Imaging;
using System.Runtime.InteropServices;
public static class DesktopImage {
 [UnmanagedFunctionPointer(CallingConvention.StdCall)] delegate int QueryService(IntPtr self,ref Guid service,ref Guid iid,out IntPtr result);
 [UnmanagedFunctionPointer(CallingConvention.StdCall)] delegate int ActiveView(IntPtr self,out IntPtr view);
 [UnmanagedFunctionPointer(CallingConvention.StdCall)] delegate int ViewSize(IntPtr self,out uint mode,out int size);
 static T Method<T>(IntPtr obj,int slot){return (T)(object)Marshal.GetDelegateForFunctionPointer(Marshal.ReadIntPtr(Marshal.ReadIntPtr(obj),slot*IntPtr.Size),typeof(T));}
 public static int IconSize(object desktopBrowser) {
  IntPtr unknown=Marshal.GetIUnknownForObject(desktopBrowser),provider=IntPtr.Zero,browser=IntPtr.Zero,view=IntPtr.Zero,folder=IntPtr.Zero;
  try {
   Guid providerId=new Guid("6d5140c1-7436-11ce-8034-00aa006009fa"),service=new Guid("4c96be40-915c-11cf-99d3-00aa004ae837"),browserId=new Guid("000214e2-0000-0000-c000-000000000046"),folderId=new Guid("1af3a467-214f-4298-908e-06b03e0b39f9");
   Marshal.ThrowExceptionForHR(Marshal.QueryInterface(unknown,ref providerId,out provider));
   Marshal.ThrowExceptionForHR(Method<QueryService>(provider,3)(provider,ref service,ref browserId,out browser));
   Marshal.ThrowExceptionForHR(Method<ActiveView>(browser,15)(browser,out view));
   Marshal.ThrowExceptionForHR(Marshal.QueryInterface(view,ref folderId,out folder));
   uint mode;int size;Marshal.ThrowExceptionForHR(Method<ViewSize>(folder,36)(folder,out mode,out size));return size;
  }finally {foreach(var p in new IntPtr[]{folder,view,browser,provider,unknown})if(p!=IntPtr.Zero)Marshal.Release(p);}
 }
 [StructLayout(LayoutKind.Sequential)] struct Size { public int X,Y; }
 [ComImport,Guid("bcc18b79-ba16-442f-80c4-8a59c30c463b"),InterfaceType(ComInterfaceType.InterfaceIsIUnknown)]
 interface ImageFactory { [PreserveSig] int GetImage(Size size,uint flags,out IntPtr bitmap); }
 [DllImport("shell32.dll",CharSet=CharSet.Unicode,PreserveSig=true)] static extern int SHCreateItemFromParsingName(string name,IntPtr context,ref Guid iid,[MarshalAs(UnmanagedType.Interface)] out ImageFactory factory);
 [DllImport("gdi32.dll")] static extern bool DeleteObject(IntPtr handle);
 [DllImport("gdi32.dll")] static extern int GetObject(IntPtr handle,int size,out BitmapInfo info);
 [StructLayout(LayoutKind.Sequential)] struct BitmapInfo { public int Type,Width,Height,WidthBytes;public ushort Planes,BitsPixel;public IntPtr Bits; }
 [StructLayout(LayoutKind.Sequential)] struct Header { public uint Size;public int Width,Height;public ushort Planes,BitCount;public uint Compression,SizeImage;public int XPels,YPels;public uint ColorsUsed,ColorsImportant; }
 [DllImport("gdi32.dll")] static extern IntPtr CreateCompatibleDC(IntPtr dc);
 [DllImport("gdi32.dll")] static extern bool DeleteDC(IntPtr dc);
 [DllImport("gdi32.dll")] static extern int GetDIBits(IntPtr dc,IntPtr bitmap,uint start,uint lines,[Out] byte[] pixels,ref Header header,uint usage);
 [DllImport("gdi32.dll")] static extern IntPtr CreateDIBSection(IntPtr dc,ref Header header,uint usage,out IntPtr bits,IntPtr section,uint offset);
 public static string Encode(IntPtr handle) {
   BitmapInfo info;if(GetObject(handle,Marshal.SizeOf(typeof(BitmapInfo)),out info)==0)throw new InvalidOperationException("Bitmap metadata unavailable");
   int height=Math.Abs(info.Height),stride=checked(info.Width*4);
   var header=new Header{Size=40,Width=info.Width,Height=-height,Planes=1,BitCount=32};
   byte[] pixels=new byte[checked(stride*height)];IntPtr dc=CreateCompatibleDC(IntPtr.Zero);
   try {if(GetDIBits(dc,handle,0,(uint)height,pixels,ref header,0)!=height)throw new InvalidOperationException("Bitmap pixels unavailable");}
   finally {if(dc!=IntPtr.Zero)DeleteDC(dc);}
   // Ask GDI for top-down pixels instead of assuming the Shell bitmap's row order.
   bool hasAlpha=false;for(int i=3;i<pixels.Length;i+=4)if(pixels[i]!=0){hasAlpha=true;break;}
   if(!hasAlpha)for(int i=3;i<pixels.Length;i+=4)pixels[i]=255;
   using(var bitmap=new Bitmap(info.Width,height,PixelFormat.Format32bppArgb)) {
    var data=bitmap.LockBits(new Rectangle(0,0,bitmap.Width,bitmap.Height),ImageLockMode.WriteOnly,PixelFormat.Format32bppArgb);
    try {for(int y=0;y<height;y++)Marshal.Copy(pixels,y*stride,IntPtr.Add(data.Scan0,y*data.Stride),stride);}
    finally {bitmap.UnlockBits(data);}
    using(var stream=new MemoryStream()){bitmap.Save(stream,ImageFormat.Png);return "data:image/png;base64,"+Convert.ToBase64String(stream.ToArray());}
   }
 }
 public static void TestOrientation() {
  foreach(int direction in new int[]{-1,1}) {
   var header=new Header{Size=40,Width=2,Height=direction*2,Planes=1,BitCount=32};IntPtr bits;
   IntPtr handle=CreateDIBSection(IntPtr.Zero,ref header,0,out bits,IntPtr.Zero,0);
   if(handle==IntPtr.Zero)throw new InvalidOperationException("Cannot create test bitmap");
   try {
    byte[] top={0,0,255,255,0,255,0,128},bottom={255,0,0,255,0,0,0,0};
    Marshal.Copy(direction<0?top:bottom,0,bits,8);Marshal.Copy(direction<0?bottom:top,0,IntPtr.Add(bits,8),8);
    string encoded=Encode(handle);using(var stream=new MemoryStream(Convert.FromBase64String(encoded.Substring(encoded.IndexOf(',')+1))))using(var image=new Bitmap(stream)) {
     if(image.GetPixel(0,0).R!=255 || image.GetPixel(0,1).B!=255)throw new Exception("Orientation regression: "+direction);
     if(image.GetPixel(1,0).A!=128 || image.GetPixel(1,1).A!=0)throw new Exception("Alpha regression: "+direction);
    }
   }finally{DeleteObject(handle);}
  }
 }
 public static string Read(string path,int size=64) {
  Guid iid=typeof(ImageFactory).GUID;ImageFactory factory=null;IntPtr handle=IntPtr.Zero;
  try {
   Marshal.ThrowExceptionForHR(SHCreateItemFromParsingName(path,IntPtr.Zero,ref iid,out factory));
   // Cached Explorer thumbnail first; otherwise extract the item's own icon.
   int hr=factory.GetImage(new Size{X=size,Y=size},0x10,out handle);
   if(hr<0 || handle==IntPtr.Zero)Marshal.ThrowExceptionForHR(factory.GetImage(new Size{X=size,Y=size},4,out handle));
   return Encode(handle);
  } finally {if(handle!=IntPtr.Zero)DeleteObject(handle);if(factory!=null)Marshal.ReleaseComObject(factory);}
 }
}

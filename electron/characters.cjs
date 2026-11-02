const path=require('node:path');
function characterTraits(name,isDirectory){
 const ext=path.extname(name).toLowerCase();
 if(isDirectory)return {kind:'폴더',role:'폴더 수호자',hp:185,atk:16,color:'#e4c36f',emoji:'📁'};
 if(['.lnk','.url','.exe'].includes(ext))return {kind:'앱·바로가기',role:'앱 돌격대',hp:125,atk:25,color:'#83bddd',emoji:'🚀'};
 if(['.png','.jpg','.jpeg','.gif','.webp','.bmp','.svg','.ico'].includes(ext))return {kind:'이미지',role:'그림 마법사',hp:95,atk:32,color:'#dda5ba',emoji:'🖼️'};
 if(['.mp3','.wav','.ogg','.flac','.mp4','.mov','.mkv'].includes(ext))return {kind:'미디어',role:'리듬 전사',hp:115,atk:27,color:'#bba2e0',emoji:'🎵'};
 if(['.zip','.7z','.rar','.tar','.gz'].includes(ext))return {kind:'압축 파일',role:'철갑 기사',hp:165,atk:19,color:'#ccac84',emoji:'📦'};
 return {kind:'문서·파일',role:'기록의 기사',hp:140,atk:22,color:'#b6cfac',emoji:'📄'};
}
module.exports={characterTraits};

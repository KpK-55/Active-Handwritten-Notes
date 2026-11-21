(() => {
const $=s=>document.querySelector(s), paper=$('#paper'), overlay=$('#overlay'), wrap=$('#canvasWrap'), stage=$('#stage');
const ctx=paper.getContext('2d'), octx=overlay.getContext('2d');
const DB='recallnote-db', STORE='pages'; let db, pages=[], pageIndex=0, tool='pen', color='#f4f4f4', size=3, mode='fixed', zoom=1, drawing=false, current=null, lasso=[], selected=new Set(), history=[], future=[], deferredInstall=null, saveTimer, recallMode=false, maskStart=null, maskCurrent=null; const imageCache=new Map();
const uid=()=>crypto.randomUUID?crypto.randomUUID():String(Date.now())+Math.random().toString(16).slice(2);
function openDB(){return new Promise((resolve,reject)=>{const r=indexedDB.open(DB,2);r.onupgradeneeded=()=>{const d=r.result;if(!d.objectStoreNames.contains(STORE))d.createObjectStore(STORE,{keyPath:'id'});if(!d.objectStoreNames.contains('imports'))d.createObjectStore('imports',{keyPath:'id'});};r.onsuccess=()=>resolve(r.result);r.onerror=()=>reject(r.error);});}
function tx(mode,fn){return new Promise((resolve,reject)=>{const t=db.transaction(STORE,mode),s=t.objectStore(STORE);let out;try{out=fn(s)}catch(e){reject(e);return}t.oncomplete=()=>resolve(out&&('result' in out)?out.result:out);t.onerror=()=>reject(t.error);});}
const active=()=>pages[pageIndex];
function blankPage(){return {id:uid(),title:`Page ${pages.length+1}`,mode,width:mode==='fixed'?900:1800,height:mode==='fixed'?1273:1800,background:'#111214',strokes:[],clozes:[],images:[],occlusions:[]};}
async function init(){try{db=await openDB();const all=await tx('readonly',s=>s.getAll());pages=all||[];}catch(e){console.error(e);toast('Storage unavailable — use a modern browser');}
if(!pages.length){pages=[blankPage()];await persist();}pages.forEach(p=>{p.clozes=p.clozes||[];p.images=p.images||[];p.occlusions=p.occlusions||[];});pageIndex=0;renderPageList();resize();draw();wire();$('#docName').textContent='My notebook';if('serviceWorker'in navigator&&location.protocol.startsWith('http'))navigator.serviceWorker.register('./sw.js').catch(()=>{});}
function persist(){const p=active();if(!p||!db)return Promise.resolve();$('#saveStatus').textContent='Saving…';return tx('readwrite',s=>s.put(p)).then(()=>{$('#saveStatus').textContent='Saved locally';}).catch(e=>{$('#saveStatus').textContent='Save failed';console.error(e);});}
function scheduleSave(){clearTimeout(saveTimer);$('#saveStatus').textContent='Unsaved changes';saveTimer=setTimeout(persist,350);}
function resize(){const p=active();if(!p)return;const dpr=Math.min(devicePixelRatio||1,2);paper.width=Math.round(p.width*dpr);paper.height=Math.round(p.height*dpr);overlay.width=paper.width;overlay.height=paper.height;paper.style.width=p.width+'px';paper.style.height=p.height+'px';overlay.style.width=p.width+'px';overlay.style.height=p.height+'px';wrap.style.width=p.width+'px';wrap.style.height=p.height+'px';ctx.setTransform(dpr,0,0,dpr,0,0);octx.setTransform(dpr,0,0,dpr,0,0);applyZoom();draw();}
function applyZoom(){wrap.style.transform=`translate(-50%,-50%) scale(${zoom})`;$('#zoomLabel').textContent=Math.round(zoom*100)+'%';}
function draw(){const p=active();if(!p)return;ctx.clearRect(0,0,p.width,p.height);ctx.fillStyle=p.background;ctx.fillRect(0,0,p.width,p.height);if(p.mode==='fixed'){ctx.save();ctx.strokeStyle='#303238';ctx.lineWidth=1;for(let y=55;y<p.height;y+=38){ctx.beginPath();ctx.moveTo(0,y);ctx.lineTo(p.width,y);ctx.stroke();}ctx.restore();}
for(const im of (p.images||[])){let img=imageCache.get(im.id);if(!img){img=new Image();img.onload=()=>draw();img.src=im.src;imageCache.set(im.id,img);}if(img.complete)ctx.drawImage(img,im.x,im.y,im.w,im.h);}
for(const s of p.strokes)drawStroke(ctx,s);
if(recallMode){for(const c of (p.clozes||[])){if(!c.revealed){ctx.save();ctx.fillStyle=c.color||'#36383d';ctx.fillRect(c.x,c.y,c.w,c.h);ctx.restore();}}
for(const m of (p.occlusions||[])){if(!m.revealed){ctx.save();ctx.fillStyle=m.color||'#34363b';ctx.fillRect(m.x,m.y,m.w,m.h);ctx.restore();}}}
drawSelection();if(maskCurrent){octx.save();octx.strokeStyle='#35c6e5';octx.fillStyle='#35c6e522';octx.lineWidth=2;octx.setLineDash([6,4]);octx.fillRect(maskCurrent.x,maskCurrent.y,maskCurrent.w,maskCurrent.h);octx.strokeRect(maskCurrent.x,maskCurrent.y,maskCurrent.w,maskCurrent.h);octx.restore();}}
function drawStroke(c,s){if(!s.points.length)return;c.save();c.lineCap='round';c.lineJoin='round';c.strokeStyle=s.color;c.globalAlpha=s.tool==='highlighter'?.27:1;c.lineWidth=s.width*(s.tool==='highlighter'?3:1);if(s.points.length===1){c.fillStyle=s.color;c.beginPath();c.arc(s.points[0].x,s.points[0].y,Math.max(1,s.width/2),0,Math.PI*2);c.fill();}else{c.beginPath();c.moveTo(s.points[0].x,s.points[0].y);for(let i=1;i<s.points.length;i++){const a=s.points[i-1],b=s.points[i],mx=(a.x+b.x)/2,my=(a.y+b.y)/2;c.quadraticCurveTo(a.x,a.y,mx,my);}const z=s.points[s.points.length-1];c.lineTo(z.x,z.y);c.stroke();}c.restore();}
function point(e){const r=paper.getBoundingClientRect();return{x:(e.clientX-r.left)/zoom,y:(e.clientY-r.top)/zoom,pressure:e.pressure||.5,time:Date.now()};}
function pointerDown(e){if(e.pointerType==='mouse'&&e.button!==0)return;paper.setPointerCapture(e.pointerId);const pt=point(e);
if(recallMode){const p=active();let hit=(p.clozes||[]).find(m=>!m.revealed&&pt.x>=m.x&&pt.x<=m.x+m.w&&pt.y>=m.y&&pt.y<=m.y+m.h);if(hit)hit.revealed=true;else{hit=(p.occlusions||[]).find(m=>!m.revealed&&pt.x>=m.x&&pt.x<=m.x+m.w&&pt.y>=m.y&&pt.y<=m.y+m.h);if(hit)hit.revealed=true;}if(hit){draw();scheduleSave();toast('Answer revealed');}return;}
drawing=true;if(tool==='mask'){maskStart=pt;maskCurrent={x:pt.x,y:pt.y,w:0,h:0};drawSelection();return;}if(tool==='lasso'){lasso=[pt];drawSelection();return;}if(tool==='eraser'){eraseAt(pt);return;}current={id:uid(),tool,color,width:size,points:[pt]};draw();drawStroke(ctx,current);}
function pointerMove(e){if(!drawing)return;const pt=point(e);if(tool==='mask'&&maskStart){maskCurrent={x:Math.min(maskStart.x,pt.x),y:Math.min(maskStart.y,pt.y),w:Math.abs(pt.x-maskStart.x),h:Math.abs(pt.y-maskStart.y)};drawSelection();return;}if(tool==='lasso'){lasso.push(pt);drawSelection();return;}if(tool==='eraser'){eraseAt(pt);return;}if(!current)return;current.points.push(pt);drawStroke(ctx,current);}
function pointerUp(){if(!drawing)return;drawing=false;if(tool==='mask'&&maskCurrent){if(maskCurrent.w>12&&maskCurrent.h>12){active().occlusions.push({id:uid(),...maskCurrent,color:'#34363b',revealed:false});scheduleSave();toast('Occlusion mask created');}maskStart=null;maskCurrent=null;draw();return;}if(tool==='lasso'){selected=new Set(active().strokes.filter(s=>s.points.some(pt=>insidePolygon(pt,lasso))).map(s=>s.id));lasso=[];drawSelection();toast(selected.size?`${selected.size} stroke(s) selected`:'No strokes selected');return;}if(current){active().strokes.push(current);history.push({type:'add',stroke:current});future=[];current=null;scheduleSave();renderPageList();}}
function eraseAt(pt){const p=active(),radius=Math.max(12,size*3);let removed=[];p.strokes=p.strokes.filter(s=>{const hit=s.points.some(q=>Math.hypot(q.x-pt.x,q.y-pt.y)<radius);if(hit)removed.push(s);return !hit;});if(removed.length){history.push({type:'remove',strokes:removed});future=[];draw();scheduleSave();}}
function insidePolygon(p,poly){let c=false;for(let i=0,j=poly.length-1;i<poly.length;j=i++){const a=poly[i],b=poly[j];if(((a.y>p.y)!==(b.y>p.y))&&(p.x<(b.x-a.x)*(p.y-a.y)/(b.y-a.y)+a.x))c=!c;}return c;}
function drawSelection(){octx.clearRect(0,0,active().width,active().height);for(const s of active().strokes){if(selected.has(s.id)){octx.save();octx.strokeStyle='#28c6e8';octx.lineWidth=2;octx.setLineDash([6,4]);octx.beginPath();s.points.forEach((p,i)=>i?octx.lineTo(p.x,p.y):octx.moveTo(p.x,p.y));octx.stroke();octx.restore();}}if(lasso.length){octx.save();octx.strokeStyle='#26c6e5';octx.lineWidth=2;octx.setLineDash([5,4]);octx.beginPath();lasso.forEach((p,i)=>i?octx.lineTo(p.x,p.y):octx.moveTo(p.x,p.y));octx.stroke();octx.restore();}if(maskCurrent){octx.save();octx.strokeStyle='#35c6e5';octx.fillStyle='#35c6e522';octx.lineWidth=2;octx.setLineDash([6,4]);octx.fillRect(maskCurrent.x,maskCurrent.y,maskCurrent.w,maskCurrent.h);octx.strokeRect(maskCurrent.x,maskCurrent.y,maskCurrent.w,maskCurrent.h);octx.restore();}}
function undo(){const h=history.pop();if(!h)return;if(h.type==='add')active().strokes=active().strokes.filter(s=>s.id!==h.stroke.id);else if(h.type==='remove')active().strokes.push(...h.strokes);future.push(h);draw();scheduleSave();}
function redo(){const h=future.pop();if(!h)return;if(h.type==='add')active().strokes.push(h.stroke);else if(h.type==='remove'){const ids=new Set(h.strokes.map(s=>s.id));active().strokes=active().strokes.filter(s=>!ids.has(s.id));}history.push(h);draw();scheduleSave();}
function setTool(t){tool=t;document.querySelectorAll('.tool').forEach(b=>b.classList.toggle('active',b.dataset.tool===t));$('#hint').textContent=t==='lasso'?'Draw around handwriting to select strokes':t==='eraser'?'Erase by touching strokes':t==='mask'?'Draw a rectangle over an image label':'Use your stylus or finger to write';}
function renderPageList(){const list=$('#pageList');list.innerHTML='';pages.forEach((p,i)=>{const b=document.createElement('button');b.className='page-thumb'+(i===pageIndex?' active':'');b.innerHTML=`<span class="thumb-paper"></span><span class="pname">${p.title}</span>`;b.onclick=()=>switchPage(i);list.appendChild(b);});$('#pageIndicator').textContent=`${pageIndex+1} / ${pages.length}`;}
async function switchPage(i){await persist();pageIndex=i;history=[];future=[];selected.clear();resize();renderPageList();}
async function addPage(){await persist();const p=blankPage();pages.push(p);pageIndex=pages.length-1;history=[];future=[];await persist();resize();renderPageList();}
function toast(msg){const t=$('#toast');t.textContent=msg;t.classList.add('show');setTimeout(()=>t.classList.remove('show'),1900);}
function createCloze(){if(!selected.size){toast('First select handwriting with the lasso');return;}const chosen=active().strokes.filter(s=>selected.has(s.id));const pts=chosen.flatMap(s=>s.points);const xs=pts.map(p=>p.x),ys=pts.map(p=>p.y);const pad=Math.max(8,size*3);active().clozes.push({id:uid(),strokeIds:[...selected],x:Math.max(0,Math.min(...xs)-pad),y:Math.max(0,Math.min(...ys)-pad),w:Math.max(...xs)-Math.min(...xs)+pad*2,h:Math.max(...ys)-Math.min(...ys)+pad*2,color:'#34363b',revealed:false});selected.clear();draw();scheduleSave();toast('Cloze created — enter Recall mode to test it');}
function addImageFile(file){if(!file)return;const reader=new FileReader();reader.onload=()=>{const img=new Image();img.onload=()=>{const p=active(),maxW=p.width*.72,maxH=p.height*.55,scale=Math.min(maxW/img.width,maxH/img.height,1);p.images.push({id:uid(),src:reader.result,x:(p.width-img.width*scale)/2,y:(p.height-img.height*scale)/2,w:img.width*scale,h:img.height*scale});draw();scheduleSave();toast('Image added. Choose Mask to hide labels.');};img.src=reader.result;};reader.readAsDataURL(file);}

async function importStarNote(file){
  if(!window.JSZip){toast('ZIP reader not loaded');return;}
  const status=$('#saveStatus');status.textContent='Reading StarNote…';
  try{
    const zip=await JSZip.loadAsync(file);
    const infoEntry=Object.values(zip.files).find(x=>!x.dir&&x.name.endsWith('/note/pb/note_info'));
    if(!infoEntry)throw new Error('StarNote metadata file not found');
    const raw=await infoEntry.async('uint8array');
    const txt=new TextDecoder('latin1').decode(raw);
    const pageMapStart=txt.indexOf('"pageInfoMap"');
    if(pageMapStart<0)throw new Error('Page metadata not found');
    const open=txt.indexOf('{',pageMapStart+13);let depth=0,inStr=false,esc=false,end=-1;
    for(let i=open;i<txt.length;i++){const ch=txt[i];if(inStr){if(esc)esc=false;else if(ch==='\\')esc=true;else if(ch==='"')inStr=false;}else{if(ch==='"')inStr=true;else if(ch==='{')depth++;else if(ch==='}'&&--depth===0){end=i+1;break;}}}
    const pageMap=JSON.parse(txt.slice(open,end));
    const pageEntries=Object.entries(pageMap).map(([id,v])=>({id,...v}));
    if(!pageEntries.length)throw new Error('No pages found');
    const titleMatch=txt.match(/"([^"]{2,100})"@\d/);
    const notebookTitle=file.name.replace(/\.note$/i,'');
    const importedPages=[];
    for(let i=0;i<pageEntries.length;i++){
      const meta=pageEntries[i],w=Number(meta.width)||2970,h=Number(meta.height)||4200;
      importedPages.push({id:uid(),title:`${notebookTitle} · ${i+1}`,mode:'fixed',width:900,height:1273,background:'#111214',strokes:[],clozes:[],images:[],occlusions:[],starNoteSource:{pageId:meta.id,originalWidth:w,originalHeight:h,layers:meta.layerList||[],sourceFormat:'StarNote .note',strokeDataPending:true}});
    }
    // Extract embedded PNG/JPEG resources as editable image objects, grouped into pages.
    const assets=[];
    for(const entry of Object.values(zip.files)){
      if(entry.dir||!entry.name.includes('/resource/data/'))continue;
      if(!/\.(png|jpe?g|webp)$/i.test(entry.name))continue;
      const blob=await entry.async('blob');
      if(blob.size>12*1024*1024)continue;
      const dataUrl=await new Promise((resolve,reject)=>{const r=new FileReader();r.onload=()=>resolve(r.result);r.onerror=reject;r.readAsDataURL(blob);});
      assets.push({id:uid(),src:dataUrl,name:entry.name.split('/').pop()});
    }
    const perPage=Math.max(1,Math.ceil(assets.length/importedPages.length));
    assets.forEach((asset,i)=>{
      const page=importedPages[Math.min(importedPages.length-1,Math.floor(i/perPage))];
      const idx=page.images.length,cols=3,cellW=260,cellH=260,gap=20;
      page.images.push({id:asset.id,src:asset.src,x:35+(idx%cols)*(cellW+gap),y:80+Math.floor(idx/cols)*(cellH+gap),w:cellW,h:cellH,sourceName:asset.name,importedAsset:true});
    });
    // Keep a raw archive copy in a separate object store for safe round-tripping/download.
    const rawBlob=file.slice(0,file.size,file.type||'application/zip');
    await saveImportedArchive(file.name,rawBlob);
    pages=pages.concat(importedPages);pageIndex=pages.length-importedPages.length;
    for(const pg of importedPages){await tx('readwrite',s=>s.put(pg));}
    resize();renderPageList();$('#docName').textContent=notebookTitle;
    status.textContent='Imported structure';toast(`Imported ${importedPages.length} pages and ${assets.length} image assets. Stroke decoding is still experimental.`);
  }catch(err){console.error(err);status.textContent='Import failed';toast('Import failed: '+(err.message||'Unsupported .note structure'));}
}
function saveImportedArchive(name,blob){
  return new Promise((resolve,reject)=>{
    if(!db){reject(new Error('Database not ready'));return;}
    try{const t=db.transaction('imports','readwrite');t.objectStore('imports').put({id:uid(),name,blob,createdAt:Date.now()});t.oncomplete=()=>resolve();t.onerror=()=>reject(t.error);}
    catch(e){reject(e);}
  });
}

function wire(){paper.addEventListener('pointerdown',pointerDown);paper.addEventListener('pointermove',pointerMove);paper.addEventListener('pointerup',pointerUp);paper.addEventListener('pointercancel',pointerUp);document.querySelectorAll('.tool').forEach(b=>b.onclick=()=>setTool(b.dataset.tool));document.querySelectorAll('.swatch').forEach(b=>b.onclick=()=>{color=b.dataset.color;document.querySelectorAll('.swatch').forEach(x=>x.classList.toggle('selected',x===b));});$('#sizeRange').oninput=e=>{size=+e.target.value;$('#sizeValue').value=size;};$('#undoBtn').onclick=undo;$('#redoBtn').onclick=redo;$('#newPageBtn').onclick=addPage;$('#addPageSide').onclick=addPage;$('#zoomIn').onclick=()=>{zoom=Math.min(2.5,zoom+.1);applyZoom();};$('#zoomOut').onclick=()=>{zoom=Math.max(.35,zoom-.1);applyZoom();};$('#fitBtn').onclick=()=>{const p=active();zoom=Math.min((stage.clientWidth-50)/p.width,(stage.clientHeight-50)/p.height,1);applyZoom();};$('#canvasModeBtn').onclick=()=>$('#modeDialog').showModal();document.querySelectorAll('[data-mode]').forEach(b=>b.onclick=async()=>{mode=b.dataset.mode;active().mode=mode;active().width=mode==='fixed'?900:1800;active().height=mode==='fixed'?1273:1800;$('#modeDialog').close();await persist();resize();$('#canvasModeBtn').textContent=(mode==='fixed'?'Fixed page':'Infinite canvas')+' ▾';toast('Canvas changed');});$('#menuBtn').onclick=()=>$('#menuDialog').showModal();document.querySelectorAll('.dialog-close').forEach(b=>b.onclick=()=>b.closest('dialog').close());$('#clearPageBtn').onclick=()=>{if(confirm('Clear all handwriting on this page?')){active().strokes=[];history=[];future=[];draw();scheduleSave();}$('#menuDialog').close();};$('#renameBtn').onclick=()=>{const n=prompt('Notebook name',$('#docName').textContent);if(n)$('#docName').textContent=n;$('#menuDialog').close();};$('#exportBtn').onclick=()=>{const a=document.createElement('a');a.download='recallnote-page.png';a.href=paper.toDataURL('image/png');a.click();$('#menuDialog').close();};$('#backupBtn').onclick=async()=>{const blob=new Blob([JSON.stringify({format:'RecallNoteBackup',version:1,pages},null,2)],{type:'application/json'});download(blob,'recallnote-backup.json');$('#menuDialog').close();};$('#createClozeBtn').onclick=createCloze;
$('#recallBtn').onclick=()=>{recallMode=!recallMode;$('#recallBtn').textContent=recallMode?'✎ Exit Recall':'✦ Recall';$('#recallBtn').classList.toggle('active',recallMode);draw();toast(recallMode?'Recall mode enabled':'Writing mode enabled');};
$('#imageBtn').onclick=()=>$('#imageInput').click();
$('#imageInput').onchange=e=>{addImageFile(e.target.files[0]);e.target.value='';};
$('#occlusionBtn').onclick=()=>{setTool(tool==='mask'?'pen':'mask');toast(tool==='mask'?'Mask tool enabled':'Pen tool enabled');};
$('#revealAllBtn').onclick=()=>{active().clozes.forEach(x=>x.revealed=true);active().occlusions.forEach(x=>x.revealed=true);draw();scheduleSave();};
$('#hideAllBtn').onclick=()=>{active().clozes.forEach(x=>x.revealed=false);active().occlusions.forEach(x=>x.revealed=false);draw();scheduleSave();};$('#importNoteBtn').onclick=()=>$('#noteFileInput').click();
$('#noteFileInput').onchange=e=>{const f=e.target.files[0];if(f)importStarNote(f);e.target.value='';};
$('#backBtn').onclick=()=>toast('Notebook home is planned for the next milestone');window.addEventListener('resize',resize);window.addEventListener('beforeunload',()=>{persist();});}
function download(blob,name){const u=URL.createObjectURL(blob),a=document.createElement('a');a.href=u;a.download=name;a.click();setTimeout(()=>URL.revokeObjectURL(u),1000);}
window.addEventListener('beforeinstallprompt',e=>{e.preventDefault();deferredInstall=e;$('#installBtn').hidden=false;});$('#installBtn').onclick=async()=>{if(!deferredInstall)return;deferredInstall.prompt();await deferredInstall.userChoice;deferredInstall=null;$('#installBtn').hidden=true;};
init();
})();

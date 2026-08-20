/* Student Card Editor v2 — opens the exact generated student card payload and keeps all editor controls working. */
(()=>{
'use strict';
const $=id=>document.getElementById(id);
let canvas=null, side='front', clipboard=null, payload=null;
const W=1600,H=1040,NAVY='#000154',GOLD='#ffd900';
const QR_URL='https://wa.me/message/UOXUC6KOTTXYO1?src=qr';
function status(t){const e=$('status');if(e){e.textContent=t;clearTimeout(window.__editorStatus);window.__editorStatus=setTimeout(()=>e.textContent='',3000)}}
function supa(){return window.supabaseClient||window.sbClient||null}
async function isAdmin(user){const sb=supa();if(!sb||!user)return false;const r=await sb.from('admin_users').select('user_id').eq('user_id',user.id).maybeSingle();return !!r.data}
async function gate(){try{const sb=supa();if(!sb)throw new Error('Supabase configuration is unavailable.');const {data:{user}}=await sb.auth.getUser();if(user&&await isAdmin(user)){openEditor();return}showLogin()}catch(e){showLogin();$('loginMsg').textContent=e.message||'Please log in.'}}
function showLogin(){$('login').classList.remove('hidden');$('editor').classList.add('hidden')}
async function login(){try{$('loginBtn').disabled=true;const sb=supa();const {data,error}=await sb.auth.signInWithPassword({email:$('email').value.trim(),password:$('password').value});if(error)throw error;if(!await isAdmin(data.user)){await sb.auth.signOut();throw new Error('This account is not an authorized admin.')}openEditor()}catch(e){$('loginMsg').textContent=e.message||'Login failed'}finally{$('loginBtn').disabled=false}}
function readPayload(){try{const raw=sessionStorage.getItem('student-card-editor-payload')||localStorage.getItem('student-card-editor-payload');return raw?JSON.parse(raw):null}catch(e){return null}}
function openEditor(){$('login').classList.add('hidden');$('editor').classList.remove('hidden');payload=readPayload();if(!payload){status('No generated card was supplied. Open Edit Student Card from Generate / View Card.');}init()}
function txt(text,left,top,fontSize=30,fill='#1d2b38',weight='normal',extra={}){return new fabric.IText(String(text??''),{left,top,fontSize,fill,fontFamily:'Arial',fontWeight:weight,originX:'left',originY:'top',...extra})}
function add(o){canvas.add(o);canvas.setActiveObject(o);canvas.renderAll();return o}
function loadImg(src){return new Promise((resolve,reject)=>{if(!src)return resolve(null);fabric.Image.fromURL(src,img=>img?resolve(img):reject(new Error('image')),{crossOrigin:'anonymous'})})}
async function qrImage(){if(!window.QRCode||typeof QRCode.toDataURL!=='function')return null;return QRCode.toDataURL(QR_URL,{margin:4,width:420,errorCorrectionLevel:'M'})}
function fitText(text,maxChars=24){let s=String(text??'');return s.length>maxChars?s.slice(0,maxChars-1)+'…':s}
function dateText(v){if(!v)return '—';const d=new Date(v+'T00:00:00');return Number.isNaN(d.getTime())?String(v):d.toLocaleDateString()}
async function buildFront(){canvas.clear();canvas.backgroundColor='#e7edf2';const p=payload?.student||{};
 add(new fabric.Rect({left:0,top:0,width:1600,height:290,fill:NAVY,selectable:true}));
 add(txt('Al Ameer Foundation School - AFS',80,92,56,'#fff','bold'));
 add(txt('Under the supervision of Madarsa Darul Uloom Muhammadia Karachi',185,155,24,GOLD));
 add(new fabric.Polygon([{x:1185,y:0},{x:1245,y:0},{x:1125,y:290},{x:1065,y:290}],{fill:'#fff',selectable:true}));
 add(new fabric.Polygon([{x:0,y:290},{x:1600,y:340},{x:1600,y:470},{x:0,y:370}],{fill:'rgba(214,239,247,.65)',selectable:true}));
 add(new fabric.Polygon([{x:0,y:515},{x:1600,y:360},{x:1600,y:620},{x:0,y:820}],{fill:'rgba(255,255,255,.38)',selectable:true}));
 add(new fabric.Polygon([{x:0,y:770},{x:1600,y:590},{x:1600,y:910},{x:0,y:1040}],{fill:'rgba(207,225,238,.35)',selectable:true}));
 add(new fabric.Rect({left:0,top:950,width:1600,height:40,fill:'#0068b8',selectable:true}));add(new fabric.Rect({left:0,top:990,width:1600,height:50,fill:NAVY,selectable:true}));
 if(payload?.logoUrl){try{const li=await loadImg(payload.logoUrl);li.set({left:1240,top:25});li.scaleToWidth(240);li.scaleToHeight(240);li.set({clipPath:new fabric.Circle({left:1360,top:145,radius:118,absolutePositioned:true})});add(li)}catch(e){}}
 add(new fabric.Rect({left:75,top:277,width:360,height:410,fill:'#fff',selectable:true}));
 if(payload?.photoUrl){try{const pi=await loadImg(payload.photoUrl);const iw=pi.width||1,ih=pi.height||1,box=334/379,ar=iw/ih;let cw=iw,ch=ih;if(ar>box)cw=ih*box;else ch=iw/box;pi.set({left:87,top:291});pi.set({cropX:(iw-cw)/2,cropY:(ih-ch)/2,width:cw,height:ch});pi.scaleToWidth(334);pi.scaleToHeight(379);add(pi)}catch(e){}}
 add(new fabric.Rect({left:75,top:277,width:360,height:410,fill:'rgba(255,255,255,0)',stroke:'#fff',strokeWidth:7,selectable:true}));
 const vals=[['Name',p.student_name||'',400],['Father',p.father_name||'',485],['GR',p.gr_number||'',570],['Class',p.class_name||'',655],['DOB',dateText(p.dob),740]];
 vals.forEach(([lab,val,y])=>{add(txt(lab,510,y,58,'#061a7a','bold'));add(txt(':',675,y,58,'#061a7a','bold'));add(txt(fitText(val,26),705,y,58,'#1d2b38'))});
 try{const sig=await loadImg('student-signature.svg');sig.set({left:175,top:705});sig.scaleToWidth(185);sig.scaleToHeight(78);add(sig)}catch(e){}
 add(txt('Authorized',174,785,20,'#1d2b38'));add(new fabric.Rect({left:125,top:815,width:255,height:38,fill:'#0d47a1',selectable:true}));add(txt('SIGNATORY',155,816,26,'#fff','bold'));
 try{const src=await qrImage();if(src){const qi=await loadImg(src);add(new fabric.Rect({left:1238,top:643,width:259,height:259,fill:'#fff',selectable:true}));qi.set({left:1245,top:650});qi.scaleToWidth(245);qi.scaleToHeight(245);add(qi)}}catch(e){}
 canvas.renderAll();
}
async function buildBack(){canvas.clear();canvas.backgroundColor=NAVY;if(payload?.logoUrl){try{const li=await loadImg(payload.logoUrl);li.set({left:500,top:220});li.scaleToWidth(600);li.scaleToHeight(600);add(li)}catch(e){}}canvas.renderAll()}
async function init(){if(canvas){canvas.dispose()}canvas=new fabric.Canvas('cardCanvas',{width:W,height:H,preserveObjectStacking:true,selection:true});bindCanvas();const key='student-card-editor-'+side+'-'+(payload?.student?.id||payload?.student?.gr_number||'current');const saved=localStorage.getItem(key);if(saved){try{await new Promise((resolve,reject)=>canvas.loadFromJSON(saved,()=>{canvas.renderAll();resolve()},reject));status('Saved edit loaded.')}catch(e){await rebuild()}}else await rebuild()}
async function rebuild(){side==='front'?await buildFront():await buildBack();status(payload?'Exact generated student card loaded. You can edit it now.':'Current card editor loaded.')}
function bindCanvas(){canvas.on('selection:created',sync);canvas.on('selection:updated',sync);canvas.on('selection:cleared',clearControls)}
function sync(){const o=canvas.getActiveObject();if(!o)return;$('textValue').value=['i-text','text','textbox'].includes(o.type)?o.text||'':'';$('fontSize').value=Math.round(o.fontSize||30);$('fontFamily').value=o.fontFamily||'Arial';$('fillColor').value=toHex(o.fill||'#1d2b38');$('strokeColor').value=toHex(o.stroke||'#000154')}
function clearControls(){$('textValue').value=''}function toHex(c){if(typeof c!=='string')return '#000000';if(c.startsWith('#'))return c.slice(0,7);const m=c.match(/rgba?\((\d+),\s*(\d+),\s*(\d+)/);return m?'#'+[m[1],m[2],m[3]].map(n=>(+n).toString(16).padStart(2,'0')).join(''):'#000000'}
function selected(){const o=canvas?.getActiveObject();if(!o)status('Select an object first.');return o}
function cloneObj(o){return new Promise((resolve,reject)=>{try{o.clone(c=>resolve(c))}catch(e){reject(e)}})}
async function copy(){const o=selected();if(!o)return;clipboard=await cloneObj(o);status('Copied. Paste keeps the exact same position.')}
async function paste(){if(!clipboard){status('Nothing copied yet.');return}const c=await cloneObj(clipboard);c.set({left:clipboard.left,top:clipboard.top});canvas.add(c);canvas.setActiveObject(c);canvas.renderAll();status('Pasted at the exact copied position.')}
function wire(){
$('loginBtn').onclick=login;
$('textValue').oninput=()=>{const o=selected();if(o&&['i-text','text','textbox'].includes(o.type)){o.set('text',$('textValue').value);canvas.renderAll()}};
$('fontSize').oninput=()=>{const o=selected();if(o){o.set('fontSize',+$('fontSize').value);canvas.renderAll()}};$('fontFamily').onchange=()=>{const o=selected();if(o){o.set('fontFamily',$('fontFamily').value);canvas.renderAll()}};$('fillColor').oninput=()=>{const o=selected();if(o){o.set('fill',$('fillColor').value);canvas.renderAll()}};$('strokeColor').oninput=()=>{const o=selected();if(o){o.set('stroke',$('strokeColor').value);canvas.renderAll()}};
$('bold').onclick=()=>{const o=selected();if(o){o.set('fontWeight',o.fontWeight==='bold'?'normal':'bold');canvas.renderAll()}};$('italic').onclick=()=>{const o=selected();if(o){o.set('fontStyle',o.fontStyle==='italic'?'normal':'italic');canvas.renderAll()}};$('bring').onclick=()=>{const o=selected();if(o)canvas.bringToFront(o)};$('send').onclick=()=>{const o=selected();if(o)canvas.sendToBack(o)};
$('duplicate').onclick=async()=>{const o=selected();if(!o)return;const c=await cloneObj(o);c.set({left:o.left+15,top:o.top+15});canvas.add(c);canvas.setActiveObject(c);canvas.renderAll()};$('delete').onclick=()=>{const o=selected();if(o){canvas.remove(o);canvas.discardActiveObject();canvas.renderAll()}};
$('addText').onclick=()=>add(txt('New Text',400,280,30));$('addRect').onclick=()=>add(new fabric.Rect({left:400,top:280,width:180,height:90,fill:'#fff',stroke:NAVY,strokeWidth:2,selectable:true}));$('addCircle').onclick=()=>add(new fabric.Circle({left:400,top:280,radius:55,fill:'#0d47a1',selectable:true}));$('addLine').onclick=()=>add(new fabric.Line([400,280,600,280],{stroke:NAVY,strokeWidth:4,selectable:true}));
$('imageFile').onchange=e=>{const f=e.target.files?.[0];if(!f)return;const r=new FileReader();r.onload=ev=>{fabric.Image.fromURL(ev.target.result,img=>{img.set({left:400,top:280});img.scaleToWidth(220);canvas.add(img);canvas.setActiveObject(img);canvas.renderAll();status('Image added. Drag/resize it on the card.')})};r.readAsDataURL(f);e.target.value=''};
$('bgColor').oninput=e=>{canvas.backgroundColor=e.target.value;canvas.renderAll()};$('applyBg').onclick=()=>{canvas.renderAll();status('Background color applied.')};$('copy').onclick=copy;$('paste').onclick=paste;
$('saveBtn').onclick=()=>{const key='student-card-editor-'+side+'-'+(payload?.student?.id||payload?.student?.gr_number||'current');localStorage.setItem(key,JSON.stringify(canvas.toJSON()));status('Edited card saved on this device.')};
$('exportBtn').onclick=()=>{const a=document.createElement('a');a.href=canvas.toDataURL({format:'png',multiplier:2});a.download=`student-card-${payload?.student?.gr_number||'edited'}-${side}.png`;a.click()};
$('downloadJsonBtn').onclick=()=>{const blob=new Blob([JSON.stringify(canvas.toJSON(),null,2)],{type:'application/json'});const a=document.createElement('a');a.href=URL.createObjectURL(blob);a.download=`student-card-${side}-design.json`;a.click()};
$('resetBtn').onclick=()=>{const key='student-card-editor-'+side+'-'+(payload?.student?.id||payload?.student?.gr_number||'current');localStorage.removeItem(key);rebuild()};
$('tabFront').onclick=async()=>{side='front';setTab();await init()};$('tabBack').onclick=async()=>{side='back';setTab();await init()};
window.addEventListener('keydown',e=>{if((e.ctrlKey||e.metaKey)&&e.key.toLowerCase()==='c'){e.preventDefault();copy()}if((e.ctrlKey||e.metaKey)&&e.key.toLowerCase()==='v'){e.preventDefault();paste()}if((e.key==='Delete'||e.key==='Backspace')&&!['INPUT','TEXTAREA','SELECT'].includes(document.activeElement?.tagName)){const o=selected();if(o){canvas.remove(o);canvas.renderAll()}}});
}
function setTab(){document.querySelectorAll('.tab').forEach(x=>x.classList.toggle('active',x.dataset.side===side))}
wire();
window.addEventListener('DOMContentLoaded',gate);
})();

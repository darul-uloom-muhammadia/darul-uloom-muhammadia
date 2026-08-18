// Student card editor runtime. Loaded by config.js only on the private editor page.
(function(){
'use strict';
if(!location.pathname.endsWith('student-card-editor.html'))return;
const sb=window.supabaseClient; let canvas, side='front', clipObject=null; const $=id=>document.getElementById(id);
function status(t){const e=$('status');if(!e)return;e.textContent=t;setTimeout(()=>{if(e.textContent===t)e.textContent=''},2500)}
async function isAdmin(u){if(!u)return false;const r=await sb.from('admin_users').select('user_id').eq('user_id',u.id).maybeSingle();return !!r.data}
async function gate(){try{const {data:{user}}=await sb.auth.getUser();if(user&&await isAdmin(user))openEditor();else $('login').classList.remove('hidden')}catch(e){$('login').classList.remove('hidden')}}
async function login(){try{$('loginBtn').disabled=true;const {data,error}=await sb.auth.signInWithPassword({email:$('email').value.trim(),password:$('password').value});if(error)throw error;if(!await isAdmin(data.user)){await sb.auth.signOut();throw new Error('This account is not an authorized admin.')}openEditor()}catch(e){$('loginMsg').textContent=e.message||'Login failed'}finally{$('loginBtn').disabled=false}}
function makeText(text,x,y,size=30,fill='#1d2b38',weight='normal'){return new fabric.IText(text,{left:x,top:y,fontSize:size,fill,fontFamily:'Arial',fontWeight:weight,originX:'left',originY:'top'})}
function baseFront(){canvas.clear();canvas.backgroundColor='#e7edf2';const navy='#000154';canvas.add(new fabric.Rect({left:0,top:0,width:1000,height:176,fill:navy,selectable:true}));canvas.add(makeText('Al Ameer Foundation School - AFS',50,55,35,'#fff','bold'));canvas.add(makeText('Under the supervision of Madarsa Darul Uloom Muhammadia Karachi',118,105,15,'#ffd900'));canvas.add(new fabric.Rect({left:45,top:170,width:225,height:255,fill:'#fff',stroke:'#fff',strokeWidth:3}));canvas.add(makeText('Name :',335,235,36,'#061a7a','bold'));canvas.add(makeText('Student Name',535,235,36));canvas.add(makeText('Father :',335,285,36,'#061a7a','bold'));canvas.add(makeText('Father Name',535,285,36));canvas.add(makeText('GR :',335,335,36,'#061a7a','bold'));canvas.add(makeText('000',535,335,36));canvas.add(makeText('Class :',335,385,36,'#061a7a','bold'));canvas.add(makeText('Four',535,385,36));canvas.add(makeText('DOB :',335,435,36,'#061a7a','bold'));canvas.add(makeText('10-5-2019',535,435,36));canvas.add(new fabric.Rect({left:770,top:430,width:170,height:170,fill:'#fff'}));canvas.add(makeText('QR CODE',800,490,22,'#111','bold'));canvas.add(new fabric.Rect({left:0,top:594,width:1000,height:25,fill:'#0068b8',selectable:true}));canvas.add(new fabric.Rect({left:0,top:619,width:1000,height:13,fill:navy,selectable:true}));canvas.add(makeText('Authorized',88,510,18));canvas.add(new fabric.Rect({left:60,top:540,width:160,height:24,fill:'#0d47a1'}));canvas.add(makeText('SIGNATORY',77,542,16,'#fff','bold'));canvas.renderAll()}
function baseBack(){canvas.clear();canvas.backgroundColor='#000154';canvas.add(new fabric.Circle({left:385,top:160,radius:115,fill:'#12366a'}));canvas.add(makeText('LOGO',445,255,42,'#fff','bold'));canvas.renderAll()}
function resetSide(){side==='front'?baseFront():baseBack();canvas.discardActiveObject();canvas.renderAll();status('Reset to the current editable template. Existing live cards were not changed.')}
function sync(){const o=canvas.getActiveObject();if(!o)return;$('textValue').value=['i-text','text','textbox'].includes(o.type)?o.text||'':'';$('fontSize').value=Math.round(o.fontSize||30);$('fontFamily').value=o.fontFamily||'Arial';$('fillColor').value=toHex(o.fill||'#1d2b38');$('strokeColor').value=toHex(o.stroke||'#000154')}
function clearControls(){$('textValue').value=''} function toHex(c){return typeof c==='string'&&c[0]==='#'?c.slice(0,7):'#000000'}
function selected(){const o=canvas.getActiveObject();if(!o){status('Select an object first.');return null}return o}
function init(){canvas=new fabric.Canvas('cardCanvas',{preserveObjectStacking:true,selection:true});canvas.on('selection:created',sync);canvas.on('selection:updated',sync);canvas.on('selection:cleared',clearControls);const saved=localStorage.getItem('student-card-editor-'+side);if(saved){try{canvas.loadFromJSON(saved,()=>canvas.renderAll())}catch(e){resetSide()}}else resetSide()}
function copy(){const o=selected();if(!o)return;o.clone(cl=>{clipObject=cl;status('Object copied. Paste keeps the exact copied position.')})}
function paste(){if(!clipObject){status('Nothing copied yet.');return}clipObject.clone(cl=>{canvas.add(cl);canvas.setActiveObject(cl);canvas.renderAll();status('Pasted at the exact copied position.')})}
function add(o){canvas.add(o);canvas.setActiveObject(o);canvas.renderAll()}
function openEditor(){$('login').classList.add('hidden');$('editor').classList.remove('hidden');init()}
$('loginBtn').onclick=login;
$('textValue').oninput=()=>{const o=selected();if(o&&['i-text','text','textbox'].includes(o.type)){o.set('text',$('textValue').value);canvas.renderAll()}};
$('fontSize').oninput=()=>{const o=selected();if(o){o.set('fontSize',+$('fontSize').value);canvas.renderAll()}};
$('fontFamily').onchange=()=>{const o=selected();if(o){o.set('fontFamily',$('fontFamily').value);canvas.renderAll()}};
$('fillColor').oninput=()=>{const o=selected();if(o){o.set('fill',$('fillColor').value);canvas.renderAll()}};
$('strokeColor').oninput=()=>{const o=selected();if(o){o.set('stroke',$('strokeColor').value);canvas.renderAll()}};
$('bold').onclick=()=>{const o=selected();if(o){o.set('fontWeight',o.fontWeight==='bold'?'normal':'bold');canvas.renderAll()}};
$('italic').onclick=()=>{const o=selected();if(o){o.set('fontStyle',o.fontStyle==='italic'?'normal':'italic');canvas.renderAll()}};
$('bring').onclick=()=>{const o=selected();if(o)canvas.bringToFront(o)};$('send').onclick=()=>{const o=selected();if(o)canvas.sendToBack(o)};
$('duplicate').onclick=()=>{const o=selected();if(o)o.clone(cl=>{cl.set({left:o.left+15,top:o.top+15});add(cl)})};
$('delete').onclick=()=>{const o=selected();if(o){canvas.remove(o);canvas.discardActiveObject();canvas.renderAll()}};
$('addText').onclick=()=>add(makeText('New Text',400,280,30));$('addRect').onclick=()=>add(new fabric.Rect({left:400,top:280,width:180,height:90,fill:'#fff',stroke:'#000154',strokeWidth:2}));$('addCircle').onclick=()=>add(new fabric.Circle({left:400,top:280,radius:55,fill:'#0d47a1'}));$('addLine').onclick=()=>add(new fabric.Line([400,280,600,280],{stroke:'#000154',strokeWidth:4}));
$('imageFile').onchange=e=>{const f=e.target.files[0];if(!f)return;const r=new FileReader();r.onload=ev=>fabric.Image.fromURL(ev.target.result,img=>{img.set({left:400,top:250,scaleX:200/img.width,scaleY:200/img.height});add(img)});r.readAsDataURL(f);e.target.value=''};
$('bgColor').oninput=e=>canvas.backgroundColor=e.target.value;$('applyBg').onclick=()=>{canvas.renderAll();status('Background color applied.')};$('copy').onclick=copy;$('paste').onclick=paste;
window.addEventListener('keydown',e=>{if((e.metaKey||e.ctrlKey)&&e.key.toLowerCase()==='c'){e.preventDefault();copy()}if((e.metaKey||e.ctrlKey)&&e.key.toLowerCase()==='v'){e.preventDefault();paste()}if((e.key==='Delete'||e.key==='Backspace')&&!['INPUT','TEXTAREA'].includes(document.activeElement.tagName)){const o=canvas.getActiveObject();if(o){canvas.remove(o);canvas.renderAll()}}});
$('saveBtn').onclick=()=>{localStorage.setItem('student-card-editor-'+side,JSON.stringify(canvas.toJSON()));status('Template saved on this device. Live student cards were not changed.')};
$('exportBtn').onclick=()=>{const a=document.createElement('a');a.href=canvas.toDataURL({format:'png',multiplier:2});a.download='student-card-'+side+'.png';a.click()};
$('downloadJsonBtn').onclick=()=>{const blob=new Blob([JSON.stringify(canvas.toJSON(),null,2)],{type:'application/json'});const a=document.createElement('a');a.href=URL.createObjectURL(blob);a.download='student-card-'+side+'-design.json';a.click()};
$('resetBtn').onclick=resetSide;
document.querySelectorAll('.tab').forEach(b=>b.onclick=()=>{document.querySelectorAll('.tab').forEach(x=>x.classList.remove('active'));b.classList.add('active');side=b.dataset.side;init()});
gate();
})();
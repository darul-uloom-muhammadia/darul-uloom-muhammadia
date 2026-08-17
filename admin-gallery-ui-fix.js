(()=>{
const defaults=['Campus','Students','Events','Activities'];
const esc=s=>String(s??'').replace(/[&<>"']/g,m=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#039;'}[m]));
const keyFor=i=>'gallery-'+i;
async function saveGalleryMedia(i,files){
 const {data:{user}}=await supabaseClient.auth.getUser();
 if(!user) throw new Error('Admin session expired. Please login again.');
 const {data:row,error:readErr}=await supabaseClient.from('site_settings').select('content').eq('id','homepage').maybeSingle();
 if(readErr) throw readErr;
 const next=JSON.parse(JSON.stringify(row?.content||{}));
 next.gallery=next.gallery||{}; next.gallery.items=next.gallery.items||defaults.slice(); next.gallery.media=next.gallery.media||{};
 const key=keyFor(i); const existing=Array.isArray(next.gallery.media[key])?next.gallery.media[key]:[];
 const added=[];
 for(const file of files){
   const safe=file.name.toLowerCase().replace(/[^a-z0-9._-]+/g,'-');
   const path=`gallery/${key}/${Date.now()}-${Math.random().toString(36).slice(2,8)}-${safe}`;
   const {error}=await supabaseClient.storage.from('site-media').upload(path,file,{upsert:false,contentType:file.type||undefined});
   if(error) throw error;
   const {data}=supabaseClient.storage.from('site-media').getPublicUrl(path);
   added.push({type:file.type?.startsWith('video/')?'video':'image',url:data.publicUrl,name:file.name,path});
 }
 next.gallery.media[key]=existing.concat(added);
 const {error:writeErr}=await supabaseClient.from('site_settings').upsert({id:'homepage',content:next,updated_by:user.id,updated_at:new Date().toISOString()},{onConflict:'id'});
 if(writeErr) throw writeErr;
 return next;
}
async function removeMedia(i,media){
 const {data:{user}}=await supabaseClient.auth.getUser(); if(!user) throw new Error('Admin session expired. Please login again.');
 const {data:row,error}=await supabaseClient.from('site_settings').select('content').eq('id','homepage').maybeSingle(); if(error)throw error;
 const next=JSON.parse(JSON.stringify(row?.content||{})); next.gallery=next.gallery||{}; next.gallery.media=next.gallery.media||{};
 const key=keyFor(i); const arr=Array.isArray(next.gallery.media[key])?next.gallery.media[key]:[]; const found=arr.find(x=>x?.url===media.url);
 next.gallery.media[key]=arr.filter(x=>x?.url!==media.url);
 if(found?.path) await supabaseClient.storage.from('site-media').remove([found.path]);
 const {error:writeErr}=await supabaseClient.from('site_settings').upsert({id:'homepage',content:next,updated_by:user.id,updated_at:new Date().toISOString()},{onConflict:'id'}); if(writeErr)throw writeErr;
 return next;
}
function render(card,i){
 if(card.dataset.galleryUiFix==='1')return; card.dataset.galleryUiFix='1';
 let mediaBox=card.querySelector('.ale-gallery-media-fix');
 if(!mediaBox){
  mediaBox=document.createElement('div'); mediaBox.className='ale-gallery-media-fix';
  mediaBox.innerHTML=`<div class="agf-title">Photos and videos</div><input class="agf-input" type="file" accept="image/*,video/*" multiple><div class="agf-status"></div><div class="agf-list"></div><small>Upload one or many images/videos for ${esc(defaults[i])}.</small>`;
  card.appendChild(mediaBox);
 }
 const input=mediaBox.querySelector('.agf-input'),status=mediaBox.querySelector('.agf-status'),list=mediaBox.querySelector('.agf-list');
 const draw=()=>{
  supabaseClient.from('site_settings').select('content').eq('id','homepage').maybeSingle().then(({data})=>{
   const arr=data?.content?.gallery?.media?.[keyFor(i)]||[];
   list.innerHTML=arr.length?arr.map(m=>`<div class="agf-item"><span>${esc(m.name|| (m.type==='video'?'Video':'Photo'))}</span><button type="button" data-url="${esc(m.url)}">Remove</button></div>`).join(''):'<span class="agf-empty">No media uploaded yet.</span>';
   list.querySelectorAll('button').forEach(b=>b.onclick=async()=>{if(!confirm('Remove this photo/video?'))return;try{b.disabled=true;b.textContent='Removing…';await removeMedia(i,{url:b.dataset.url});status.textContent='Removed successfully.';draw()}catch(e){status.textContent=e.message||'Remove failed.'}});
  });
 };
 input.onchange=async()=>{const files=[...input.files||[]];if(!files.length)return;try{input.disabled=true;status.textContent=`Uploading ${files.length} file(s)…`;await saveGalleryMedia(i,files);input.value='';status.textContent=`${files.length} file(s) uploaded successfully.`;draw()}catch(e){console.error(e);status.textContent=e.message||'Upload failed. Check Storage permissions.'}finally{input.disabled=false}};
 draw();
}
function scan(){if(new URLSearchParams(location.search).get('admin')!=='1')return;document.querySelectorAll('.ale-gallery-card').forEach((c,i)=>render(c,i));}
const style=document.createElement('style');style.textContent=`.ale-gallery-media-fix{margin-top:14px;padding:14px;background:#f5f8fc;border:1px solid #dfe8f3;border-radius:12px}.ale-gallery-media-fix .agf-title{font-weight:800;font-size:14px;color:#071b3a;margin-bottom:8px}.ale-gallery-media-fix .agf-input{width:100%;box-sizing:border-box;padding:10px;border:1px solid #d6e0ec;border-radius:8px;background:#fff}.ale-gallery-media-fix small{display:block;color:#65748b;margin-top:7px}.agf-status{margin-top:8px;font-size:12px;font-weight:700;color:#176b3a}.agf-list{display:grid;gap:6px;margin-top:10px}.agf-item{display:flex;align-items:center;justify-content:space-between;gap:8px;padding:7px 9px;background:#fff;border:1px solid #dfe8f3;border-radius:7px;font-size:12px}.agf-item span{overflow:hidden;text-overflow:ellipsis;white-space:nowrap}.agf-item button{border:0;background:#a32121;color:#fff;padding:5px 8px;border-radius:6px;font-weight:800;cursor:pointer}.agf-empty{font-size:12px;color:#65748b}`;document.head.appendChild(style);
if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',scan);else scan();new MutationObserver(scan).observe(document.body,{childList:true,subtree:true});
})();

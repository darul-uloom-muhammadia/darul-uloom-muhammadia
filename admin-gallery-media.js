(()=>{
const esc=s=>String(s??'').replace(/[&<>"']/g,m=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#039;'}[m]));
async function removeMedia(i,url){
 if(!confirm('Remove this photo/video from this gallery?'))return;
 const {data:{user}}=await supabaseClient.auth.getUser(); if(!user) return alert('Admin session expired. Please login again.');
 const {data:row,error:e}=await supabaseClient.from('site_settings').select('content').eq('id','homepage').maybeSingle(); if(e)throw e;
 const next=JSON.parse(JSON.stringify(row?.content||{})); next.gallery=next.gallery||{}; next.gallery.media=next.gallery.media||{};
 const name=(next.gallery.items||[])[i]||['Campus','Students','Events','Activities'][i]; const key='gallery-'+i; const aliases=[key,name.toLowerCase().replace(/[^a-z0-9]+/g,'-'),'gallery-'+(i+1)];
 aliases.forEach(k=>{if(Array.isArray(next.gallery.media[k]))next.gallery.media[k]=next.gallery.media[k].filter(m=>m?.url!==url)});
 const {error}=await supabaseClient.from('site_settings').upsert({id:'homepage',content:next,updated_by:user.id,updated_at:new Date().toISOString()},{onConflict:'id'}); if(error)throw error;
 if(window.__applySiteContent)window.__applySiteContent(next); location.reload();
}
function addButtons(){
 if(new URLSearchParams(location.search).get('admin')!=='1')return;
 document.querySelectorAll('.ale-gallery-card').forEach((card,i)=>{
  const preview=card.querySelector('.ale-preview'); if(!preview||preview.dataset.removeReady==='1')return; preview.dataset.removeReady='1';
  preview.querySelectorAll('figure').forEach(fig=>{
   const media=fig.querySelector('img,video'); if(!media?.src)return;
   const b=document.createElement('button');b.type='button';b.textContent='Remove';b.style.cssText='display:block;width:100%;border:0;padding:7px;background:#a32121;color:#fff;font-weight:800;cursor:pointer';b.onclick=async e=>{e.preventDefault();e.stopPropagation();try{b.disabled=true;b.textContent='Removing…';await removeMedia(i,media.src)}catch(err){console.error(err);b.disabled=false;b.textContent='Remove';alert(err.message||'Could not remove media')}};fig.appendChild(b);
  });
 });
}
const obs=new MutationObserver(addButtons);obs.observe(document.body,{childList:true,subtree:true});if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',addButtons);else addButtons();
})();

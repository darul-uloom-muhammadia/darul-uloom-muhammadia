(()=>{
const clone=o=>JSON.parse(JSON.stringify(o||{}));
const set=(o,p,v)=>{const a=p.split('.');let x=o;for(let i=0;i<a.length-1;i++){if(x[a[i]]==null)x[a[i]]={};x=x[a[i]]}x[a[a.length-1]]=v};
const slug=s=>String(s||'').toLowerCase().replace(/[^a-z0-9]+/g,'-').replace(/^-|-$/g,'');
const msg=(text,ok)=>{const e=document.getElementById('ale-msg');if(e){e.textContent=text;e.className='ale-msg '+(ok?'ok':'bad')}};
const upload=async(file,folder)=>{const safe=file.name.toLowerCase().replace(/[^a-z0-9._-]+/g,'-');const path=folder+'/'+Date.now()+'-'+Math.random().toString(36).slice(2,8)+'-'+safe;const r=await supabaseClient.storage.from('site-media').upload(path,file,{upsert:false,contentType:file.type});if(r.error)throw r.error;return supabaseClient.storage.from('site-media').getPublicUrl(path).data.publicUrl};
function renderPublicExtras(c){
  try{
    const logo=c?.brand?.logoImage;
    if(logo){document.querySelectorAll('.crescent').forEach(e=>{e.innerHTML='<img src="'+String(logo).replace(/["<>]/g,'')+'" alt="Madrasah logo">';e.classList.add('cms-logo-crescent')})}
    const loc=c?.location||{};
    const contact=document.querySelector('#contact .contact');
    if(contact){
      let box=document.getElementById('cms-location-box');
      if(!box){box=document.createElement('div');box.id='cms-location-box';box.style='margin-top:22px;padding:18px;border:1px solid #dfe8f3;border-radius:16px;background:#f7faff';contact.appendChild(box)}
      if(loc.show===false){box.style.display='none'}else{box.style.display='block';const address=loc.address||c?.brand?.address||'';const maps=loc.mapsUrl||'';const lat=loc.lat||'';const lng=loc.lng||'';let html='<strong style="display:block;font-size:18px;color:#071b3a;margin-bottom:8px">📍 Location</strong>'+(address?'<div style="margin-bottom:10px">'+String(address).replace(/[&<>"']/g,m=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#039;'}[m]))+'</div>':'');if(maps)html+='<a class="btn" target="_blank" rel="noopener" href="'+String(maps).replace(/["<>]/g,'')+'">Open in Google Maps</a>';if(lat&&lng)html+='<div style="margin-top:12px"><iframe class="public-map" loading="lazy" src="https://www.google.com/maps?q='+encodeURIComponent(lat+','+lng)+'&output=embed"></iframe></div>';box.innerHTML=html}}
    }
    let st=document.getElementById('cms-admin-extras-style');if(!st){st=document.createElement('style');st.id='cms-admin-extras-style';st.textContent='.cms-logo-crescent{display:flex!important;align-items:center;justify-content:center}.cms-logo-crescent img{width:90px;height:90px;object-fit:contain;border-radius:14px}.public-map{width:100%;height:300px;border:0;border-radius:14px;display:block}';document.head.appendChild(st)}
  }catch(e){console.warn('Public extras render failed',e)}
}
function enhancePanel(){
  const tabs=document.querySelector('.ale-tabs');const forms=document.getElementById('ale-forms');if(!tabs||!forms)return;
  if(!document.querySelector('.ale-tabs button[data-tab="location"]')){
    const leadBtn=document.querySelector('.ale-tabs button[data-tab="leadership"]');
    const b=document.createElement('button');b.type='button';b.dataset.tab='location';b.textContent='Location';
    if(leadBtn)tabs.insertBefore(b,leadBtn);else tabs.appendChild(b);
    const s=document.createElement('section');s.dataset.section='location';s.className='ale-section';s.innerHTML='<div class="ale-media"><h3>📍 Live Location</h3><div class="ale-field"><label>Madrasa Address</label><input data-path="location.address" placeholder="Full madrasa address"></div><div class="ale-field"><label>Google Maps Link</label><input data-path="location.mapsUrl" placeholder="Paste Google Maps share link"></div><div class="ale-field"><label>Latitude</label><input data-path="location.lat" placeholder="Example: 24.9876"></div><div class="ale-field"><label>Longitude</label><input data-path="location.lng" placeholder="Example: 67.1234"></div><div class="ale-field"><label>Show Location Publicly</label><select data-path="location.show"><option value="true">Yes</option><option value="false">No</option></select></div><small>Save & Publish کے بعد یہ معلومات public Contact section میں نظر آئے گی۔</small></div>';
    forms.appendChild(s);
    const loc=(window.__adminEditorContent||{}).location||{};s.querySelector('[data-path="location.address"]').value=loc.address||'';s.querySelector('[data-path="location.mapsUrl"]').value=loc.mapsUrl||'';s.querySelector('[data-path="location.lat"]').value=loc.lat||'';s.querySelector('[data-path="location.lng"]').value=loc.lng||'';s.querySelector('[data-path="location.show"]').value=String(loc.show!==false);
    b.onclick=()=>{tabs.querySelectorAll('button').forEach(x=>x.classList.remove('active'));forms.querySelectorAll('.ale-section').forEach(x=>x.classList.remove('active'));b.classList.add('active');s.classList.add('active')};
  }
  const lead=forms.querySelector('[data-section="leadership"]');if(lead&&!lead.querySelector('#ale-leader-photo-0')){
    const box=document.createElement('div');box.className='ale-media';box.innerHTML='<h3>Leadership Photos</h3><div class="ale-field"><label>Founder Photo</label><input id="ale-leader-photo-0" type="file" accept="image/*"></div><div class="ale-field"><label>Principal Photo</label><input id="ale-leader-photo-1" type="file" accept="image/*"></div><small>Upload photos here. They will replace the initials circle on the public Leadership section.</small>';lead.appendChild(box);
  }
  if(!document.getElementById('ale-location-enhanced-style')){const st=document.createElement('style');st.id='ale-location-enhanced-style';st.textContent='.ale-section[data-section="location"] .ale-media{margin-top:0}.ale-section[data-section="location"] h3{font-size:18px}.ale-section[data-section="location"] small{display:block;color:#65748b;margin-top:8px}';document.head.appendChild(st)}
}
async function install(){
  const button=document.getElementById('ale-save');
  if(!button){setTimeout(install,200);return}
  enhancePanel();
  const panel=document.getElementById('ale-panel');
  if(panel&&!panel.dataset.locationObserver){panel.dataset.locationObserver='1';new MutationObserver(enhancePanel).observe(panel,{childList:true,subtree:true})}
  if(button.dataset.fixed==='1')return;button.dataset.fixed='1';
  button.onclick=async()=>{
    if(button.dataset.saving==='1')return;button.dataset.saving='1';button.disabled=true;const old=button.textContent;button.textContent='Saving…';
    try{
      const {data:{user},error:authError}=await supabaseClient.auth.getUser();if(authError)throw authError;if(!user)throw new Error('Admin session expired. Please login again.');
      const {data:admin,error:adminError}=await supabaseClient.from('admin_users').select('user_id').eq('user_id',user.id).maybeSingle();if(adminError)throw new Error('Admin verification failed: '+adminError.message);if(!admin)throw new Error('This account is not authorized as an admin.');
      const {data:row,error:readError}=await supabaseClient.from('site_settings').select('content').eq('id','homepage').maybeSingle();if(readError)throw new Error('Could not read website settings: '+readError.message);
      const next=clone(row?.content||{});
      document.querySelectorAll('#ale-forms [data-path]').forEach(el=>set(next,el.dataset.path,el.value));
      next.location=next.location||{};if(next.location.show===undefined)next.location.show=true;
      next.gallery=next.gallery||{};next.gallery.items=next.gallery.items||['Campus','Students','Events','Activities'];next.gallery.descriptions=next.gallery.descriptions||[];next.gallery.media=next.gallery.media||{};
      for(let i=0;i<4;i++){const name=next.gallery.items[i]||['Campus','Students','Events','Activities'][i];const key='gallery-'+i;const files=[...(document.querySelector(`[data-gallery-files="${i}"]`)?.files||[])];const oldMedia=Array.isArray(next.gallery.media[key])?next.gallery.media[key]:(Array.isArray(next.gallery.media[slug(name)])?next.gallery.media[slug(name)]:[]);const added=[];for(const file of files){const url=await upload(file,'gallery/'+key);added.push({type:file.type.startsWith('video/')?'video':'image',url,name:file.name})}next.gallery.media[key]=[...oldMedia,...added]}
      const logo=document.getElementById('ale-logo')?.files?.[0];if(logo){next.brand=next.brand||{};next.brand.logoImage=await upload(logo,'branding/logo')}
      const hero=document.getElementById('ale-hero')?.files?.[0];if(hero){next.brand=next.brand||{};next.brand.heroImage=await upload(hero,'branding/hero')}
      next.leadership=next.leadership||{};next.leadership.items=next.leadership.items||[['','',''],['','','']];
      for(let i=0;i<2;i++){const file=document.getElementById('ale-leader-photo-'+i)?.files?.[0];if(file){const url=await upload(file,'leadership');next.leadership.items[i]=next.leadership.items[i]||['','',''];next.leadership.items[i][3]=url}}
      const payload={id:'homepage',content:next,updated_by:user.id,updated_at:new Date().toISOString()};
      let result=await supabaseClient.from('site_settings').update({content:payload.content,updated_by:payload.updated_by,updated_at:payload.updated_at}).eq('id','homepage').select('id').maybeSingle();
      if(result.error)throw new Error('Save failed: '+result.error.message);
      if(!result.data){result=await supabaseClient.from('site_settings').insert(payload).select('id').maybeSingle();if(result.error)throw new Error('Publish failed: '+result.error.message)}
      if(typeof window.__applySiteContent==='function')window.__applySiteContent(next);renderPublicExtras(next);msg('Saved & published successfully.',true);setTimeout(()=>{const p=document.getElementById('ale-panel');if(p)p.classList.remove('open')},1000)
    }catch(e){console.error('Admin Save & Publish error:',e);msg(e?.message||'Save failed. Please try again.',false)}finally{button.dataset.saving='0';button.disabled=false;button.textContent=old}
  }
}
function wrapPublicApply(){if(window.__adminExtrasWrapped)return;const original=window.__applySiteContent;if(typeof original==='function'){window.__applySiteContent=function(c){original(c);renderPublicExtras(c)};window.__adminExtrasWrapped=true}}
if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',()=>{wrapPublicApply();install()});else{wrapPublicApply();install()}
})();
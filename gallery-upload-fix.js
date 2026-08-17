(()=>{
  if(new URLSearchParams(location.search).get('admin')!=='1') return;
  const defaults=['Campus','Students','Events','Activities'];
  const sleep=ms=>new Promise(r=>setTimeout(r,ms));
  async function getAdmin(){
    const {data:{user},error}=await supabaseClient.auth.getUser();
    if(error) throw error;
    if(!user) throw new Error('Admin session expired. Please login again.');
    const {data:admin,error:ae}=await supabaseClient.from('admin_users').select('user_id').eq('user_id',user.id).maybeSingle();
    if(ae) throw ae;
    if(!admin) throw new Error('Your account is not authorized as an admin.');
    return user;
  }
  async function uploadOne(file,key){
    if(!file) return null;
    const safe=file.name.toLowerCase().replace(/[^a-z0-9._-]+/g,'-');
    const path=`gallery/${key}/${Date.now()}-${Math.random().toString(36).slice(2,8)}-${safe}`;
    const {error}=await supabaseClient.storage.from('site-media').upload(path,file,{upsert:false,contentType:file.type||'application/octet-stream',cacheControl:'3600'});
    if(error) throw new Error(`Upload failed for ${file.name}: ${error.message}`);
    return {type:file.type.startsWith('video/')?'video':'image',url:supabaseClient.storage.from('site-media').getPublicUrl(path).data.publicUrl,name:file.name,path};
  }
  async function saveMedia(index,files){
    const user=await getAdmin();
    const {data:row,error}=await supabaseClient.from('site_settings').select('content').eq('id','homepage').maybeSingle();
    if(error) throw error;
    const content=JSON.parse(JSON.stringify(row?.content||{}));
    content.gallery=content.gallery||{};
    content.gallery.items=content.gallery.items||[...defaults];
    content.gallery.media=content.gallery.media||{};
    const key=`gallery-${index}`;
    const existing=Array.isArray(content.gallery.media[key])?content.gallery.media[key]:[];
    const added=[];
    for(const file of files) added.push(await uploadOne(file,key));
    content.gallery.media[key]=[...existing,...added];
    const {error:saveError}=await supabaseClient.from('site_settings').upsert({id:'homepage',content,updated_by:user.id,updated_at:new Date().toISOString()},{onConflict:'id'});
    if(saveError) throw saveError;
    return added;
  }
  function toast(msg,ok=true){
    let el=document.getElementById('gallery-upload-status');
    if(!el){el=document.createElement('div');el.id='gallery-upload-status';document.body.appendChild(el);}
    el.textContent=msg;el.className=ok?'ok':'bad';
  }
  function bind(){
    const inputs=document.querySelectorAll('[data-gallery-files]');
    if(!inputs.length){setTimeout(bind,500);return;}
    inputs.forEach(input=>{
      if(input.dataset.uploadFix==='1')return;
      input.dataset.uploadFix='1';
      input.addEventListener('change',async()=>{
        const files=[...input.files];
        if(!files.length)return;
        const index=Number(input.dataset.galleryFiles);
        try{
          toast(`Uploading ${files.length} file${files.length===1?'':'s'}…`);
          const added=await saveMedia(index,files);
          toast(`${added.length} file${added.length===1?'':'s'} uploaded successfully.`);
          input.value='';
          await sleep(700);
          location.reload();
        }catch(e){
          console.error('Gallery upload error:',e);
          toast(e.message||'Upload failed. Please try again.',false);
          input.value='';
        }
      },false);
    });
  }
  const style=document.createElement('style');
  style.textContent='#gallery-upload-status{position:fixed;right:18px;bottom:82px;z-index:100001;max-width:360px;padding:12px 15px;border-radius:10px;font:700 13px Arial;box-shadow:0 12px 35px rgba(0,0,0,.22)}#gallery-upload-status.ok{background:#176b3a;color:#fff}#gallery-upload-status.bad{background:#a32121;color:#fff}';
  document.head.appendChild(style);
  if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',bind,{once:true});else bind();
})();

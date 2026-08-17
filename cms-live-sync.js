(()=>{
  const KEY='darul-uloom-cms-published';
  let last='';
  async function refreshPublic(){
    try{
      const {data,error}=await supabaseClient.from('site_settings').select('content,updated_at').eq('id','homepage').maybeSingle();
      if(error) throw error;
      const content=data?.content||{};
      const stamp=data?.updated_at||JSON.stringify(content);
      if(stamp===last)return;
      last=stamp;
      if(typeof window.__applySiteContent==='function') window.__applySiteContent(content);
      window.dispatchEvent(new CustomEvent('cms:published',{detail:content}));
    }catch(e){console.warn('CMS live refresh failed:',e)}
  }
  window.addEventListener('storage',e=>{if(e.key===KEY) refreshPublic()});
  window.addEventListener('cms:refresh',refreshPublic);
  const watch=()=>{
    const save=document.getElementById('ale-save');
    if(save && !save.dataset.liveSync){
      save.dataset.liveSync='1';
      save.addEventListener('click',()=>{
        setTimeout(()=>{
          const msg=document.getElementById('ale-msg');
          if(msg && /saved and published successfully/i.test(msg.textContent||'')){
            localStorage.setItem(KEY,String(Date.now()));
            refreshPublic();
          }
        },1400);
      });
    }
  };
  new MutationObserver(watch).observe(document.documentElement,{childList:true,subtree:true});
  watch();
  // Keep an already-open public page synchronized with Admin/Supabase.
  setInterval(refreshPublic,5000);
  refreshPublic();
})();

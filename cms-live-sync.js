(()=>{
  const KEY='darul-uloom-cms-published';
  async function refreshPublic(){
    try{
      const {data,error}=await supabaseClient.from('site_settings').select('content').eq('id','homepage').maybeSingle();
      if(error) throw error;
      const content=data?.content||{};
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
          }
        },1300);
      });
    }
  };
  new MutationObserver(watch).observe(document.documentElement,{childList:true,subtree:true});
  watch();
})();

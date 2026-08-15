const SUPABASE_URL = 'https://puvsirrwregusqhkixdz.supabase.co';
const SUPABASE_PUBLISHABLE_KEY = 'sb_publishable_VnbXzkbyEZizn4GGTAFxiQ_BeiGw27W';
const supabaseClient = window.supabase.createClient(SUPABASE_URL, SUPABASE_PUBLISHABLE_KEY);

// Apply the saved madrasa branding on every page (including Admin Login and Student Portal).
(async function applyGlobalBrand(){
  const apply=async()=>{
    try{
      const {data}=await supabaseClient.from('site_settings').select('content').eq('id','homepage').maybeSingle();
      const b=data?.content?.brand||{};
      if(b.logoImage){
        const safe=String(b.logoImage).replace(/[&<>\"']/g,m=>({'&':'&amp;','<':'&lt;','>':'&gt;','\"':'&quot;',"'":'&#039;'}[m]));
        document.querySelectorAll('.logo-mark,.admin-logo').forEach(el=>{el.innerHTML='<img src="'+safe+'" alt="Darul Uloom Muhammadia logo">';el.classList.add('has-image')});
        let f=document.querySelector('link[rel="icon"]');if(!f){f=document.createElement('link');f.rel='icon';document.head.appendChild(f)}f.href=b.logoImage;
      }
      if(b.name){const t=document.getElementById('topTitle');if(t)t.textContent=b.name+' '+(b.city||'')+' · Administration'}
      if(!document.getElementById('global-brand-style')){const s=document.createElement('style');s.id='global-brand-style';s.textContent='.logo-mark.has-image,.admin-logo.has-image{display:flex;align-items:center;justify-content:center;overflow:hidden}.logo-mark.has-image img,.admin-logo.has-image img{width:100%;height:100%;object-fit:contain;border-radius:10px;display:block}';document.head.appendChild(s)}
    }catch(e){console.warn('Global branding load failed',e)}
  };
  if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',apply,{once:true});else apply();
})();

// Keep Location and Leadership fields populated when the live editor opens.
(function keepEditorFieldsInSync(){
  if(new URLSearchParams(location.search).get('admin')!=='1')return;
  const fill=async()=>{
    try{
      const {data}=await supabaseClient.from('site_settings').select('content').eq('id','homepage').maybeSingle();
      const c=data?.content||{}, loc=c.location||{}, leaders=c.leadership?.items||[];
      const map={
        'location.address':loc.address||c.brand?.address||'',
        'location.mapsUrl':loc.mapsUrl||'',
        'location.lat':loc.lat||'',
        'location.lng':loc.lng||'',
        'location.show':String(loc.show!==false)
      };
      Object.entries(map).forEach(([p,v])=>{const el=document.querySelector('#ale-forms [data-path="'+p+'"]');if(el&&!el.value)el.value=v});
      leaders.slice(0,2).forEach((x,i)=>{const el=document.querySelector('#ale-forms [data-path="leadership.items.'+i+'.3"]');if(el&&!el.value)el.value=x?.[3]||''});
    }catch(e){console.warn('Editor field sync failed',e)}
  };
  let tries=0;const timer=setInterval(()=>{fill();tries++;if(tries>20)clearInterval(timer)},500);
})();

// Load the final website-wide CMS layer after the page is ready.
(function loadFinalCms(){
  const load=()=>{
    if(document.getElementById('final-cms-script')) return;
    const s=document.createElement('script');
    s.id='final-cms-script';
    s.src='final-cms.js?v=20260815-3';
    s.defer=true;
    document.head.appendChild(s);
  };
  if(document.readyState==='loading') document.addEventListener('DOMContentLoaded',load,{once:true});
  else load();
})();

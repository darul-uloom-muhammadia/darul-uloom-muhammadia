const SUPABASE_URL = 'https://puvsirrwregusqhkixdz.supabase.co';
const SUPABASE_PUBLISHABLE_KEY = 'sb_publishable_VnbXzkbyEZizn4GGTAFxiQ_BeiGw27W';
const supabaseClient = window.supabase.createClient(SUPABASE_URL, SUPABASE_PUBLISHABLE_KEY);

(async function sharedCmsUiFix(){
  async function apply(){
    try {
      const { data } = await supabaseClient.from('site_settings').select('content').eq('id','homepage').maybeSingle();
      const content = data?.content || {};
      const logo = content?.brand?.logoImage;
      if (logo && /admin\\.html$|student-portal\\.html$/.test(location.pathname)) {
        const loginIcon = document.querySelector('#adminLogo') || document.querySelector('#login > div:first-child > div:first-child');
        if (loginIcon) { loginIcon.innerHTML = `<img src="${logo}" alt="Darul Uloom Muhammadia logo" style="width:72px;height:72px;object-fit:contain;border-radius:12px;display:block;margin:auto">`; loginIcon.style.fontSize='0'; loginIcon.style.background='transparent'; }
        document.querySelectorAll('.logo-mark').forEach(el=>{el.innerHTML=`<img src="${logo}" alt="Darul Uloom Muhammadia logo">`;el.classList.add('has-image')});
      }
      const heroIcon=document.querySelector('.hero-card .crescent');
      if(logo&&heroIcon){heroIcon.innerHTML=`<img src="${logo}" alt="Darul Uloom Muhammadia logo">`;heroIcon.classList.add('has-image')}
      if(logo){let favicon=document.querySelector('link[rel="icon"]');if(!favicon){favicon=document.createElement('link');favicon.rel='icon';document.head.appendChild(favicon)}favicon.href=logo}
      if(!document.getElementById('global-madrasa-logo-style')){const style=document.createElement('style');style.id='global-madrasa-logo-style';style.textContent='.logo-mark.has-image{display:inline-flex;align-items:center;justify-content:center;overflow:hidden}.logo-mark.has-image img{width:100%;height:100%;object-fit:contain;border-radius:10px;display:block}.hero-card .crescent.has-image{display:flex;align-items:center;justify-content:center;font-size:0}.hero-card .crescent.has-image img{width:72px;height:72px;object-fit:contain;border-radius:12px;display:block}#adminLogo:has(img){display:flex;align-items:center;justify-content:center}';document.head.appendChild(style)}
    } catch(e){console.warn('CMS UI unavailable',e)}
  }
  if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',apply);else apply();
})();

(async function globalMadrasaBrand(){
  async function apply(){try{const {data}=await supabaseClient.from('site_settings').select('content').eq('id','homepage').maybeSingle();const logo=data?.content?.brand?.logoImage;if(!logo)return;document.querySelectorAll('.hero-card .crescent').forEach(el=>{el.innerHTML='<img src="'+String(logo).replace(/[&<>\\"']/g,m=>({'&':'&amp;','<':'&lt;','>':'&gt;','\\"':'&quot;',"'":'&#039;'}[m]))+'" alt="Darul Uloom Muhammadia logo">';el.classList.add('has-image')});document.querySelectorAll('#adminLogo,.logo-mark').forEach(el=>{el.innerHTML='<img src="'+String(logo).replace(/[&<>\\"']/g,m=>({'&':'&amp;','<':'&lt;','>':'&gt;','\\"':'&quot;',"'":'&#039;'}[m]))+'" alt="Darul Uloom Muhammadia logo">';el.classList.add('has-image')});let favicon=document.querySelector('link[rel="icon"]');if(!favicon){favicon=document.createElement('link');favicon.rel='icon';document.head.appendChild(favicon)}favicon.href=logo}catch(e){console.warn('Global madrasa logo load failed',e)}}
  if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',apply);else apply();
})();

(function loadFinalCmsFix(){function load(){if(document.getElementById('cms-final-fix-script'))return;const s=document.createElement('script');s.id='cms-final-fix-script';s.src='cms-final-fix.js?v=20260815-final';document.head.appendChild(s)}if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',load);else load()})();

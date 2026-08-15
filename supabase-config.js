const SUPABASE_URL = 'https://puvsirrwregusqhkixdz.supabase.co';
const SUPABASE_PUBLISHABLE_KEY = 'sb_publishable_VnbXzkbyEZizn4GGTAFxiQ_BeiGw27W';

const { createClient } = window.supabase;
window.supabaseClient = createClient(SUPABASE_URL, SUPABASE_PUBLISHABLE_KEY);

// Student Portal brand: use the saved madrasa logo instead of the crescent icon.
(async function applyStudentBrand(){
  async function apply(){
    try{
      const {data}=await window.supabaseClient.from('site_settings').select('content').eq('id','homepage').maybeSingle();
      const logo=data?.content?.brand?.logoImage;
      if(!logo)return;
      const safe=String(logo).replace(/[&<>\"']/g,m=>({'&':'&amp;','<':'&lt;','>':'&gt;','\"':'&quot;',"'":'&#039;'}[m]));
      document.querySelectorAll('.logo-mark').forEach(el=>{
        el.innerHTML='<img src="'+safe+'" alt="Darul Uloom Muhammadia logo">';
        el.classList.add('has-image');
      });
      if(!document.getElementById('student-brand-style')){
        const style=document.createElement('style');
        style.id='student-brand-style';
        style.textContent='.logo-mark.has-image{display:inline-flex;align-items:center;justify-content:center;overflow:hidden}.logo-mark.has-image img{width:100%;height:100%;object-fit:contain;border-radius:10px;display:block}';
        document.head.appendChild(style);
      }
      let favicon=document.querySelector('link[rel="icon"]');
      if(!favicon){favicon=document.createElement('link');favicon.rel='icon';document.head.appendChild(favicon)}
      favicon.href=logo;
    }catch(e){console.warn('Student brand load failed',e)}
  }
  if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',apply);else apply();
})();

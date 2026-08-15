const SUPABASE_URL = 'https://puvsirrwregusqhkixdz.supabase.co';
const SUPABASE_PUBLISHABLE_KEY = 'sb_publishable_VnbXzkbyEZizn4GGTAFxiQ_BeiGw27W';
const supabaseClient = window.supabase.createClient(SUPABASE_URL, SUPABASE_PUBLISHABLE_KEY);

// Load the final website-wide CMS layer after the page is ready.
// It is intentionally loaded from config so the same public/admin behavior is
// available across the homepage and admin-mode homepage without duplicating code.
(function loadFinalCms(){
  const load=()=>{
    if(document.getElementById('final-cms-script')) return;
    const s=document.createElement('script');
    s.id='final-cms-script';
    s.src='final-cms.js?v=20260815-1';
    s.defer=true;
    document.head.appendChild(s);
  };
  if(document.readyState==='loading') document.addEventListener('DOMContentLoaded',load,{once:true});
  else load();
})();

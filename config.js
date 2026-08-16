const SUPABASE_URL = 'https://puvsirrwregusqhkixdz.supabase.co';
const SUPABASE_PUBLISHABLE_KEY = 'sb_publishable_VnbXzkbyEZizn4GGTAFxiQ_BeiGw27K';
const supabaseClient = window.supabase.createClient(SUPABASE_URL, SUPABASE_PUBLISHABLE_KEY);

(async function () {
  async function loadHomepage() {
    const { data, error } = await supabaseClient.from('site_settings').select('content').eq('id', 'homepage').maybeSingle();
    if (error) throw error;
    return data?.content || {};
  }
  const setText = (selector, value) => { const el = document.querySelector(selector); if (el) el.textContent = value ?? ''; };
  function applyPublic(c) {
    const b = c.brand || {}, h = c.hero || {};
    setText('.logo b', b.name); setText('.logo small', b.city);
    if (Array.isArray(c.nav)) document.querySelectorAll('nav a').forEach((a,i)=>{ if(c.nav[i]) a.textContent=c.nav[i]; });
    if (b.logoImage) document.querySelectorAll('.logo-mark,.hero-card .crescent').forEach(el=>{el.innerHTML='<img src="'+String(b.logoImage).replace(/["<>]/g,'')+'" alt="Darul Uloom Muhammadia logo">';el.classList.add('has-image');});
    setText('.hero .eyebrow',h.eyebrow); const title=document.querySelector('.hero h1'); if(title){title.textContent='';title.append(document.createTextNode((h.heading||'')+' '));const sp=document.createElement('span');sp.textContent=h.highlight||'';title.append(sp);} setText('.hero-copy p',h.description); setText('.hero .actions .btn:not(.outline)',h.button); setText('.hero .actions .btn.outline',h.secondary); setText('.hero-card strong',h.cardTitle); setText('.hero-card span',h.cardSubtitle);
    setText('#about .eyebrow',c.about?.eyebrow); setText('#about h2',c.about?.heading); setText('#about .section-head p',c.about?.description);
    setText('#madrasa .eyebrow',c.madrasa?.eyebrow); setText('#madrasa h2',c.madrasa?.heading);
    setText('#school .eyebrow',c.school?.eyebrow); setText('#school h2',c.school?.heading); setText('#school .split>div:first-child p',c.school?.description);
    setText('#leadership .eyebrow',c.leadership?.eyebrow); setText('#leadership h2',c.leadership?.heading);
    setText('#admissions .eyebrow',c.admissions?.eyebrow); setText('#admissions h2',c.admissions?.heading); setText('#admissions .admission p',c.admissions?.description); setText('#admissions .notice',c.admissions?.notice); setText('#admissions .btn',c.admissions?.button);
    setText('#contact .eyebrow',c.contact?.eyebrow); setText('#contact h2',c.contact?.heading);
    const cp=document.querySelectorAll('#contact .contact>div:first-child p'); if(cp[0])cp[0].textContent=b.address||''; if(cp[1])cp[1].innerHTML='<b>'+String(b.phone||'').replace(/[<>]/g,'')+'</b>'; if(cp[2])cp[2].textContent=b.email||'';
    const hero=document.querySelector('.hero'); if(hero&&b.heroImage){const u=String(b.heroImage).replace(/["\\]/g,'');hero.style.backgroundImage='linear-gradient(90deg,rgba(3,15,35,.90),rgba(3,15,35,.68) 48%,rgba(3,15,35,.34) 100%),url("'+u+'")';hero.style.backgroundSize='cover';hero.style.backgroundPosition='center center';hero.style.backgroundRepeat='no-repeat';}
    window.__siteContent=c;
  }
  async function publicRefresh(){try{const c=await loadHomepage();applyPublic(c);}catch(e){console.warn('Public CMS refresh failed:',e);}}
  function loadInfoCards(){if(!location.pathname.endsWith('/')&&!location.pathname.endsWith('/index.html'))return;if(document.getElementById('info-cards-script'))return;const s=document.createElement('script');s.id='info-cards-script';s.src='info-cards.js?v=20260816-1';s.defer=true;document.body.appendChild(s);}
  async function applyAdminBrand(){try{const c=await loadHomepage(),b=c.brand||{};const t=document.getElementById('topTitle');if(t&&b.name)t.textContent=b.name+' '+(b.city||'')+' · Administration';if(b.logoImage)document.querySelectorAll('.admin-logo,.logo-mark').forEach(el=>{el.innerHTML='<img src="'+String(b.logoImage).replace(/["<>]/g,'')+'" alt="Darul Uloom Muhammadia logo">';el.classList.add('has-image');});}catch(e){}}
  function syncEditorFields(){if(new URLSearchParams(location.search).get('admin')!=='1')return;let tries=0;const timer=setInterval(async()=>{try{const c=await loadHomepage(),loc=c.location||{},leaders=c.leadership?.items||[];const vals={'location.address':loc.address||c.brand?.address||'','location.mapsUrl':loc.mapsUrl||'','location.lat':loc.lat||'','location.lng':loc.lng||'','location.show':String(loc.show!==false)};Object.entries(vals).forEach(([p,v])=>{const el=document.querySelector('#ale-forms [data-path="'+p+'"]');if(el&&!el.value)el.value=v;});leaders.slice(0,2).forEach((x,i)=>{const el=document.querySelector('#ale-forms [data-path="leadership.items.'+i+'.3"]');if(el&&!el.value)el.value=x?.[3]||'';});}catch(e){}if(++tries>20)clearInterval(timer);},500);}
  function loadCharityFix(){const p=location.pathname;if(!p.endsWith('charity.html')&&!p.endsWith('charity-submission-receipt.html'))return;if(document.getElementById('charity-security-fix'))return;const s=document.createElement('script');s.id='charity-security-fix';s.src='charity-security-fix.js?v=20260816-4';s.defer=true;document.head.appendChild(s);}
  const isHomePage = location.pathname.endsWith('/') || location.pathname.endsWith('/index.html');
  const isAdminPage = new URLSearchParams(location.search).get('admin') === '1';
  const start=()=>{if(isHomePage){publicRefresh();loadInfoCards();}if(isAdminPage)applyAdminBrand();syncEditorFields();loadCharityFix();};
  if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',start,{once:true});else start();
})();

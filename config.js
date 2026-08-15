const SUPABASE_URL = 'https://puvsirrwregusqhkixdz.supabase.co';
const SUPABASE_PUBLISHABLE_KEY = 'sb_publishable_VnbXzkbyEZizn4GGTAFxiQ_BeiGw27W';
const supabaseClient = window.supabase.createClient(SUPABASE_URL, SUPABASE_PUBLISHABLE_KEY);

// Shared CMS UI: use the saved madrasa logo on auth pages and render live gallery media.
(async function sharedCmsUiFix(){
  async function apply(){
    try {
      const { data } = await supabaseClient.from('site_settings').select('content').eq('id','homepage').maybeSingle();
      const content = data?.content || {};
      const logo = content?.brand?.logoImage;

      if (logo && /admin\\.html$|student-portal\\.html$/.test(location.pathname)) {
        const loginIcon = document.querySelector('#adminLogo') || document.querySelector('#login > div:first-child > div:first-child');
        if (loginIcon) {
          loginIcon.innerHTML = `<img src="${logo}" alt="Darul Uloom Muhammadia logo" style="width:72px;height:72px;object-fit:contain;border-radius:12px;display:block;margin:auto">`;
          loginIcon.style.fontSize = '0';
          loginIcon.style.background = 'transparent';
        }
        document.querySelectorAll('.logo-mark').forEach(el => {
          el.innerHTML = `<img src="${logo}" alt="Darul Uloom Muhammadia logo">`;
          el.classList.add('has-image');
        });
      }

      // Replace the crescent used in the homepage hero card with the saved madrasa logo.
      const heroIcon = document.querySelector('.hero-card .crescent');
      if (logo && heroIcon) {
        heroIcon.innerHTML = `<img src="${logo}" alt="Darul Uloom Muhammadia logo">`;
        heroIcon.classList.add('has-image');
      }

      // Use the same saved logo as the browser tab icon instead of the crescent favicon.
      if (logo) {
        let favicon = document.querySelector('link[rel="icon"]');
        if (!favicon) {
          favicon = document.createElement('link');
          favicon.rel = 'icon';
          document.head.appendChild(favicon);
        }
        favicon.href = logo;
      }

      if (!document.getElementById('global-madrasa-logo-style')) {
        const style = document.createElement('style');
        style.id = 'global-madrasa-logo-style';
        style.textContent = `
          .logo-mark.has-image{display:inline-flex;align-items:center;justify-content:center;overflow:hidden}
          .logo-mark.has-image img{width:100%;height:100%;object-fit:contain;border-radius:10px;display:block}
          .hero-card .crescent.has-image{display:flex;align-items:center;justify-content:center;font-size:0}
          .hero-card .crescent.has-image img{width:72px;height:72px;object-fit:contain;border-radius:12px;display:block}
          #adminLogo:has(img){display:flex;align-items:center;justify-content:center}
        `;
        document.head.appendChild(style);
      }

      const gallery = document.querySelector('.gallery');
      const g = content?.gallery;
      if (!gallery || !g) return;
      const items = Array.isArray(g.items) && g.items.length ? g.items : ['Campus','Students','Events','Activities'];
      const media = g.media || {};
      const esc = v => String(v ?? '').replace(/[&<>\"']/g,m=>({'&':'&amp;','<':'&lt;','>':'&gt;','\"':'&quot;',"'":'&#039;'}[m]));
      const slug = s => String(s||'').toLowerCase().replace(/[^a-z0-9]+/g,'-').replace(/^-|-$/g,'');
      const getList = (name,i) => Array.isArray(media[`gallery-${i}`]) ? media[`gallery-${i}`] : (Array.isArray(media[slug(name)]) ? media[slug(name)] : []);
      gallery.innerHTML = items.map((name,i)=>{
        const list = getList(name,i);
        const mediaHtml = list.length ? list.map(m => m.type === 'video'
          ? `<figure class="gallery-media-item"><video src="${esc(m.url)}" controls preload="metadata" playsinline></video><figcaption>${esc(m.name||'Video')}</figcaption></figure>`
          : `<figure class="gallery-media-item"><img src="${esc(m.url)}" alt="${esc(name)}" loading="lazy"><figcaption>${esc(m.name||name)}</figcaption></figure>`
        ).join('') : '<div class="gallery-empty">No media uploaded yet.</div>';
        return `<article class="gallery-category open"><button type="button" class="gallery-category-title" aria-expanded="true">${esc(name)} <span>−</span></button><div class="gallery-details"><div class="gallery-media">${mediaHtml}</div></div></article>`;
      }).join('');
      if (!document.getElementById('shared-cms-gallery-style')) {
        const style=document.createElement('style');
        style.id='shared-cms-gallery-style';
        style.textContent=`.logo-mark.has-image{display:inline-flex;align-items:center;justify-content:center}.logo-mark.has-image img{width:100%;height:100%;object-fit:contain;border-radius:10px}.gallery{display:grid;grid-template-columns:repeat(2,minmax(0,1fr));gap:18px!important}.gallery-category{background:#f5f8fc;border:1px solid #dfe8f3;border-radius:16px;padding:12px}.gallery-category-title{width:100%;border:0;background:#071b3a;color:#fff;border-radius:10px;padding:14px;font-weight:800;font-size:16px;cursor:pointer;text-align:left;display:flex;justify-content:space-between}.gallery-details{display:block;padding-top:12px}.gallery-media{display:grid;grid-template-columns:repeat(2,minmax(0,1fr));gap:10px}.gallery-media-item{margin:0;overflow:hidden;border-radius:10px;background:#071b3a}.gallery-media-item img,.gallery-media-item video{display:block;width:100%;height:220px;object-fit:cover;background:#071b3a}.gallery-media-item figcaption{padding:8px;color:#fff;font-size:11px;overflow:hidden;text-overflow:ellipsis;white-space:nowrap}.gallery-empty{padding:40px;text-align:center;color:#65748b;background:#eef4fb;border-radius:10px}@media(max-width:700px){.gallery{grid-template-columns:1fr!important}.gallery-media{grid-template-columns:1fr}}`;
        document.head.appendChild(style);
      }
    } catch(e) { console.warn('CMS UI unavailable',e); }
  }
  if(document.readyState==='loading') document.addEventListener('DOMContentLoaded',apply); else apply();
})();

// Global logo replacement for every page that loads this config.
(async function globalMadrasaBrand(){
  async function apply(){
    try{
      const {data}=await supabaseClient.from('site_settings').select('content').eq('id','homepage').maybeSingle();
      const logo=data?.content?.brand?.logoImage;
      if(!logo)return;
      document.querySelectorAll('.hero-card .crescent').forEach(el=>{
        el.innerHTML='<img src="'+String(logo).replace(/[&<>\"']/g,m=>({'&':'&amp;','<':'&lt;','>':'&gt;','\"':'&quot;',"'":'&#039;'}[m]))+'" alt="Darul Uloom Muhammadia logo">';
        el.classList.add('has-image');
      });
      document.querySelectorAll('#adminLogo,.logo-mark').forEach(el=>{
        el.innerHTML='<img src="'+String(logo).replace(/[&<>\"']/g,m=>({'&':'&amp;','<':'&lt;','>':'&gt;','\"':'&quot;',"'":'&#039;'}[m]))+'" alt="Darul Uloom Muhammadia logo">';
        el.classList.add('has-image');
      });
      let favicon=document.querySelector('link[rel="icon"]');
      if(!favicon){favicon=document.createElement('link');favicon.rel='icon';document.head.appendChild(favicon)}
      favicon.href=logo;
    }catch(e){console.warn('Global madrasa logo load failed',e)}
  }
  if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',apply);else apply();
})();

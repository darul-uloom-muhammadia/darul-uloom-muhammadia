const SUPABASE_URL = 'https://puvsirrwregusqhkixdz.supabase.co';
const SUPABASE_PUBLISHABLE_KEY = 'sb_publishable_VnbXzkbyEZizn4GGTAFxiQ_BeiGw27W';
const supabaseClient = window.supabase.createClient(SUPABASE_URL, SUPABASE_PUBLISHABLE_KEY);

// Shared UI fixes: use the admin-managed madrasa logo on authentication pages
// and render published gallery media directly from the homepage CMS record.
(async function sharedCmsUiFix(){
  const onReady = async () => {
    try {
      const { data } = await supabaseClient.from('site_settings').select('content').eq('id','homepage').maybeSingle();
      const content = data?.content || {};
      const logo = content?.brand?.logoImage;
      if (logo && /admin\.html$|student-portal\.html$/.test(location.pathname)) {
        document.querySelectorAll('*').forEach(el => {
          if (el.children.length === 0 && el.textContent.trim() === '☪') {
            const img = document.createElement('img');
            img.src = logo;
            img.alt = 'Darul Uloom Muhammadiya logo';
            img.style.cssText = 'width:64px;height:64px;object-fit:contain;border-radius:12px;display:block;margin:0 auto';
            el.replaceWith(img);
          }
        });
      }

      const gallery = document.querySelector('.gallery');
      const g = content?.gallery;
      if (!gallery || !g) return;
      const items = Array.isArray(g.items) && g.items.length ? g.items : ['Campus','Students','Events','Activities'];
      const media = g.media || {};
      const esc = value => String(value ?? '').replace(/[&<>\"']/g, m => ({'&':'&amp;','<':'&lt;','>':'&gt;','\"':'&quot;',"'":'&#039;'}[m]));
      const listFor = (name, index) => Array.isArray(media[`gallery-${index}`]) ? media[`gallery-${index}`] : (Array.isArray(media[String(name).toLowerCase().replace(/[^a-z0-9]+/g,'-')]) ? media[String(name).toLowerCase().replace(/[^a-z0-9]+/g,'-')] : []);
      gallery.innerHTML = items.map((name,index) => {
        const list = listFor(name,index);
        const mediaHtml = list.length ? list.map(m => m.type === 'video'
          ? `<figure class="gallery-media-item"><video src="${esc(m.url)}" controls preload="metadata" playsinline></video><figcaption>${esc(m.name || 'Video')}</figcaption></figure>`
          : `<figure class="gallery-media-item"><img src="${esc(m.url)}" alt="${esc(name)}" loading="lazy"><figcaption>${esc(m.name || name)}</figcaption></figure>`
        ).join('') : '<div class="gallery-empty">No media uploaded yet.</div>';
        return `<article class="gallery-category"><button type="button" class="gallery-category-title">${esc(name)} <span>＋</span></button><div class="gallery-details"><div class="gallery-media">${mediaHtml}</div></div></article>`;
      }).join('');
      if (!document.getElementById('shared-cms-gallery-style')) {
        const style = document.createElement('style');
        style.id = 'shared-cms-gallery-style';
        style.textContent = `.gallery{display:grid;grid-template-columns:repeat(2,minmax(0,1fr));gap:18px!important}.gallery-category{background:#f5f8fc;border:1px solid #dfe8f3;border-radius:16px;padding:12px}.gallery-category-title{width:100%;border:0;background:#071b3a;color:#fff;border-radius:10px;padding:14px;font-weight:800;font-size:16px;cursor:pointer;text-align:left;display:flex;justify-content:space-between}.gallery-details{display:none;padding-top:12px}.gallery-category.open .gallery-details{display:block}.gallery-media{display:grid;grid-template-columns:repeat(2,minmax(0,1fr));gap:10px}.gallery-media-item{margin:0;overflow:hidden;border-radius:10px;background:#071b3a}.gallery-media-item img,.gallery-media-item video{display:block;width:100%;height:220px;object-fit:cover;background:#071b3a}.gallery-media-item figcaption{padding:8px;color:#fff;font-size:11px;overflow:hidden;text-overflow:ellipsis;white-space:nowrap}.gallery-empty{padding:40px;text-align:center;color:#65748b;background:#eef4fb;border-radius:10px}@media(max-width:700px){.gallery{grid-template-columns:1fr!important}.gallery-media{grid-template-columns:1fr}}`;
        document.head.appendChild(style);
      }
      gallery.querySelectorAll('.gallery-category-title').forEach(button => button.addEventListener('click', () => button.closest('.gallery-category').classList.toggle('open')));
    } catch (error) {
      console.warn('Shared CMS UI fix unavailable', error);
    }
  };
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', onReady); else onReady();
})();

(()=>{
if(new URLSearchParams(location.search).get('admin')!=='1')return;
function bind(){
  const cards=document.querySelectorAll('.gallery>div');
  const open=document.getElementById('ale-open');
  const galleryCards=document.querySelectorAll('.ale-gallery-card');

  if(open&&cards.length){
    cards.forEach((card,i)=>{
      card.style.cursor='pointer';
      card.title='Open this gallery section in Edit Mode';
      card.onclick=()=>{
        open.click();
        setTimeout(()=>{
          const tab=document.querySelector('[data-tab="gallery"]');
          if(tab)tab.click();
          setTimeout(()=>{
            const target=document.querySelectorAll('.ale-gallery-card')[i];
            if(target){
              target.scrollIntoView({behavior:'smooth',block:'start'});
              target.style.outline='3px solid #c8a45d';
              setTimeout(()=>target.style.outline='',1800);
            }
          },100);
        },150);
      };
    });
  }

  galleryCards.forEach((card)=>{
    if(card.dataset.clickReady==='1')return;
    card.dataset.clickReady='1';
    const media=card.querySelector('.ale-media');
    if(!media)return;
    const title=card.querySelector('h3');
    if(!title)return;

    media.style.display='none';
    title.style.cursor='pointer';
    title.title='Click to open/close photos and videos';
    title.setAttribute('role','button');
    title.setAttribute('tabindex','0');

    const toggle=()=>{
      const closed=media.style.display==='none';
      media.style.display=closed?'block':'none';
      card.classList.toggle('gallery-card-open',closed);
    };
    title.addEventListener('click',toggle);
    title.addEventListener('keydown',e=>{
      if(e.key==='Enter'||e.key===' '){e.preventDefault();toggle();}
    });

    card.querySelectorAll('input,textarea,select,button,a,label').forEach(el=>{
      el.addEventListener('click',e=>e.stopPropagation());
    });
  });

  if(!galleryCards.length||!cards.length){setTimeout(bind,300);}
}
if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',bind);else bind();
})();

/* Leadership photo/logo size controls. Existing photo uploads remain unchanged. */
(()=>{
  const safeNum=v=>Math.max(50,Math.min(180,parseInt(v,10)||90));
  function addControls(){
    if(new URLSearchParams(location.search).get('admin')!=='1')return;
    const lead=document.querySelector('[data-section="leadership"]');
    if(!lead||document.getElementById('leader-size-controls'))return;
    const box=document.createElement('div');
    box.id='leader-size-controls';
    box.className='ale-media';
    box.innerHTML='<h3>Leadership Photo / Logo Size</h3><p style="margin:4px 0 12px;color:#65748b">Choose the displayed size for each leader photo/logo. This does not change the original uploaded file.</p>'+
      '<div class="ale-field"><label>Founder size (px)</label><input data-path="leadership.items.0.4" type="number" min="50" max="180" step="5" value="90"><small>50–180 px</small></div>'+
      '<div class="ale-field"><label>Principal size (px)</label><input data-path="leadership.items.1.4" type="number" min="50" max="180" step="5" value="90"><small>50–180 px</small></div>';
    lead.appendChild(box);
    const c=window.__siteContent||window.__adminEditorContent||{};
    const items=c.leadership?.items||[];
    const a=box.querySelector('[data-path="leadership.items.0.4"]');
    const b=box.querySelector('[data-path="leadership.items.1.4"]');
    if(a)a.value=safeNum(items[0]?.[4]||90);
    if(b)b.value=safeNum(items[1]?.[4]||90);
  }
  function applySizes(c){
    const items=c?.leadership?.items||[];
    document.querySelectorAll('#leadership .leaders article').forEach((article,i)=>{
      const img=article.querySelector('.leader-photo');
      if(img){
        const size=safeNum(items[i]?.[4]||90);
        img.style.width=size+'px';
        img.style.height=size+'px';
      }
    });
    const lead=document.querySelector('[data-section="leadership"]');
    if(lead){
      const inputs=lead.querySelectorAll('#leader-size-controls [data-path]');
      if(inputs[0])inputs[0].value=safeNum(items[0]?.[4]||90);
      if(inputs[1])inputs[1].value=safeNum(items[1]?.[4]||90);
    }
  }
  function wrapApply(){
    if(typeof window.__applySiteContent!=='function'||window.__leadershipSizeWrapped)return false;
    const original=window.__applySiteContent;
    window.__applySiteContent=function(c){original(c);setTimeout(()=>applySizes(c),0);};
    window.__leadershipSizeWrapped=true;
    return true;
  }
  function init(){
    addControls();
    if(!wrapApply())setTimeout(init,250);
    else applySizes(window.__siteContent||{});
  }
  if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',init);else init();
  new MutationObserver(()=>addControls()).observe(document.body,{childList:true,subtree:true});
})();
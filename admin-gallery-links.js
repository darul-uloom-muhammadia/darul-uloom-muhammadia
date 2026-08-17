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

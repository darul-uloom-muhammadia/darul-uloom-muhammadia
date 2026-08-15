// Gallery display is handled by config.js from the live homepage CMS record.
// This file only keeps category buttons interactive without replacing the rendered media.
(function(){
  function bind(){
    document.querySelectorAll('.gallery-category-title').forEach(button=>{
      if(button.dataset.galleryBound==='1') return;
      button.dataset.galleryBound='1';
      button.addEventListener('click',()=>{
        const card=button.closest('.gallery-category');
        if(!card)return;
        const open=card.classList.toggle('open');
        button.setAttribute('aria-expanded',open?'true':'false');
        const icon=button.querySelector('span');
        if(icon)icon.textContent=open?'−':'＋';
      });
    });
  }
  if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',bind);else bind();
  setTimeout(bind,500);
  setTimeout(bind,1500);
})();

(()=>{
if(new URLSearchParams(location.search).get('admin')!=='1')return;
function bind(){const cards=document.querySelectorAll('.gallery>div');const open=document.getElementById('ale-open');if(!cards.length||!open){setTimeout(bind,300);return}cards.forEach((card,i)=>{card.style.cursor='pointer';card.title='Open this gallery section in Edit Mode';card.onclick=()=>{open.click();setTimeout(()=>{const tab=document.querySelector('[data-tab="gallery"]');if(tab)tab.click();setTimeout(()=>{const target=document.querySelectorAll('.ale-gallery-card')[i];if(target){target.scrollIntoView({behavior:'smooth',block:'start'});target.style.outline='3px solid #c8a45d';setTimeout(()=>target.style.outline='',1800)}},100)},150)}})}
if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',bind);else bind();
})();

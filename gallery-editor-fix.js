(()=>{
const names=['Campus','Students','Events','Activities'];
const esc=s=>String(s??'').replace(/[&<>"']/g,m=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#039;'}[m]));
async function init(){
 if(new URLSearchParams(location.search).get('admin')!=='1')return;
 const section=document.querySelector('[data-section="gallery"]');
 if(!section)return setTimeout(init,500);
 const cards=section.querySelectorAll('.ale-gallery-card');
 if(cards.length!==4)return setTimeout(init,500);
 for(let i=0;i<4;i++){
  const card=cards[i];
  if(card.querySelector('[data-gallery-fix]'))continue;
  let media=card.querySelector('.ale-media');
  if(!media){media=document.createElement('div');media.className='ale-media';card.appendChild(media)}
  const title=card.querySelector('input[data-path="gallery.items.'+i+'"]')?.value||names[i];
  media.innerHTML='<label>Photos and videos</label><input data-gallery-fix="'+i+'" type="file" accept="image/*,video/*" multiple><small>Upload one or many images/videos for '+esc(title)+'.</small><div class="gallery-fix-list"></div>';
  media.querySelector('input').addEventListener('change',()=>showSelected(media));
 }
 addStyles();
}
function showSelected(media){const files=media.querySelector('input').files;const list=media.querySelector('.gallery-fix-list');list.innerHTML=[...files].map(f=>'<div>'+esc(f.name)+'</div>').join('')||''}
function addStyles(){if(document.getElementById('gallery-fix-css'))return;const s=document.createElement('style');s.id='gallery-fix-css';s.textContent='.gallery-fix-list{margin-top:8px;font-size:12px;color:#176b3a}.gallery-fix-list div{padding:4px 0}';document.head.appendChild(s)}
new MutationObserver(init).observe(document.body,{childList:true,subtree:true});init();
})();

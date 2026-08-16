(()=>{
'use strict';
const FORM='charity.html';

// Keep the public homepage lightweight: do not rewrite the charity section
// repeatedly or observe every DOM mutation. The homepage's older charity
// buttons are handled through event delegation and open the secure form.
function removeLegacyModal(){
  document.getElementById('charity-modal')?.remove();
}

function addSecureLink(){
  const account=document.querySelector('#charity .charity-account');
  if(!account || account.querySelector('.charity-public-link')) return;
  const a=document.createElement('a');
  a.className='btn charity-open charity-public-link';
  a.href=FORM;
  a.textContent='Open Secure Charity Form';
  account.appendChild(a);
}

function init(){
  removeLegacyModal();
  document.addEventListener('click',(event)=>{
    const oldButton=event.target.closest('#charity .charity-option');
    if(!oldButton) return;
    event.preventDefault();
    event.stopImmediatePropagation();
    window.location.href=FORM;
  },true);
  addSecureLink();
}

if(document.readyState==='loading') document.addEventListener('DOMContentLoaded',init,{once:true});
else init();

// The charity section can be rendered asynchronously by the CMS. A small,
// throttled observer only adds the single secure link; it never replaces nodes.
let scheduled=false;
const observer=new MutationObserver(()=>{
  if(scheduled) return;
  scheduled=true;
  requestAnimationFrame(()=>{
    scheduled=false;
    addSecureLink();
  });
});
if(document.body) observer.observe(document.body,{childList:true,subtree:true});
})();

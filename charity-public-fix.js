(()=>{
'use strict';
const FORM='charity.html';
function fix(){
  document.getElementById('charity-modal')?.remove();
  document.querySelectorAll('#charity .charity-option').forEach(old=>{
    const a=document.createElement('a');
    a.className=old.className;
    a.href=FORM;
    a.innerHTML=old.innerHTML.replace(/Click to submit a charity request/gi,'Open secure charity form →');
    old.replaceWith(a);
  });
  const account=document.querySelector('#charity .charity-account');
  if(account && !account.querySelector('.charity-public-link')){
    const a=document.createElement('a');
    a.className='btn charity-open charity-public-link';
    a.href=FORM;
    a.textContent='Open Secure Charity Form';
    account.appendChild(a);
  }
}
if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',fix);else fix();
new MutationObserver(()=>fix()).observe(document.body,{childList:true,subtree:true});
})();

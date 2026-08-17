(function(){
  const $=id=>document.getElementById(id);
  function toast(t,error=false){if(typeof window.toast==='function')return window.toast(t,error);const e=$('toast');if(e){e.textContent=t;e.className='toast show'+(error?' error':'');setTimeout(()=>e.className='toast',3200)}}
  async function ensureCapture(){if(window.html2canvas)return;await new Promise((r,j)=>{const s=document.createElement('script');s.src='https://cdn.jsdelivr.net/npm/html2canvas@1.4.1/dist/html2canvas.min.js';s.onload=r;s.onerror=j;document.head.appendChild(s)})}
  async function imageCanvas(el){if(!el)throw new Error('Card preview not found.');await ensureCapture();await Promise.all([...el.querySelectorAll('img')].map(i=>i.complete?Promise.resolve():new Promise(r=>{i.onload=i.onerror=r})));return html2canvas(el,{scale:2,useCORS:true,allowTaint:false,backgroundColor:null,logging:false,imageTimeout:15000})}
  async function combinedBlob(){const front=$('studentCardDom'),back=$('studentCardBackDom');if(!front||!back)throw new Error('Both card sides are not ready.');const [fc,bc]=await Promise.all([imageCanvas(front),imageCanvas(back)]);const gap=24,canvas=document.createElement('canvas');canvas.width=Math.max(fc.width,bc.width);canvas.height=fc.height+gap+bc.height;const ctx=canvas.getContext('2d');ctx.fillStyle='#061b52';ctx.fillRect(0,0,canvas.width,canvas.height);ctx.drawImage(fc,(canvas.width-fc.width)/2,0);ctx.drawImage(bc,(canvas.width-bc.width)/2,fc.height+gap);return await new Promise(r=>canvas.toBlob(r,'image/png',1))}
  function saveBlob(blob,name){const url=URL.createObjectURL(blob),a=document.createElement('a');a.href=url;a.download=name;document.body.appendChild(a);a.click();a.remove();setTimeout(()=>URL.revokeObjectURL(url),1000)}
  async function saveBoth(){try{const blob=await combinedBlob();saveBlob(blob,`student-card-${window.selectedStudent?.gr_number||'card'}-front-back.png`);toast('Front and back saved together.')}catch(e){toast(e.message||'Unable to save card.',true)}}
  async function shareBoth(){try{const blob=await combinedBlob();const file=new File([blob],`student-card-${window.selectedStudent?.gr_number||'card'}-front-back.png`,{type:'image/png'});if(navigator.share&&(!navigator.canShare||navigator.canShare({files:[file]}))){await navigator.share({title:'Student ID Card',text:'Student ID Card — Front & Back',files:[file]});toast('Card image shared successfully.')}else{saveBlob(blob,file.name);toast('This browser does not support image sharing, so the card image was saved instead.')}}catch(e){if(e?.name==='AbortError')return;toast(e.message||'Unable to share card image.',true)}}
  function install(){
    const save=$('downloadCardBtn'),oldBack=$('downloadBackBtn'),actions=document.querySelector('.modal-actions');
    if(!save||!actions)return;
    save.textContent='Save Front + Back';save.onclick=saveBoth;
    if(oldBack){oldBack.style.display='none';oldBack.setAttribute('aria-hidden','true')}
    let share=$('shareCardBtn');if(!share){share=document.createElement('button');share.id='shareCardBtn';share.className='secondary';share.textContent='Share Image';actions.appendChild(share)}share.onclick=shareBoth;
    if(!document.getElementById('studentCardExactDesignOverride')){
      const style=document.createElement('style');style.id='studentCardExactDesignOverride';
      style.textContent=`
        .card-front-art .card-body{background:#fff!important}
        .card-front-art .fixed-fields,.card-front-art .fixed-fields b,.card-front-art .fixed-fields span{color:#0b173c!important}
        .card-front-art .photo-frame{background:#061b52!important}
        .card-front-art .photo-frame.female-photo{background:#061b52!important}
        .card-front-art .signature{color:#152044!important;bottom:5%!important}
        .card-front-art .signature-mark{display:block!important;width:90px!important;height:25px!important;margin:0 auto -1px!important;background:url('student-signature.svg') center/contain no-repeat!important;font-size:0!important;font-family:initial!important;transform:none!important}
        .card-front-art .signature strong{background:#0d47a1!important;color:#fff!important}
        .card-front-art .card-top:after{right:9%!important;width:2.5%!important;top:-20%!important;height:150%!important}
        .card-front-art .card-logo-top{z-index:4!important}
      `;
      document.head.appendChild(style);
    }
  }
  document.addEventListener('DOMContentLoaded',install);setTimeout(install,300);setTimeout(install,1200);new MutationObserver(install).observe(document.body,{childList:true,subtree:true});
})();

(function(){
  const isHome=location.pathname.endsWith('/')||location.pathname.endsWith('/index.html');
  if(!isHome)return;
  const start=async()=>{
    const slider=document.getElementById('hero-slider');
    if(!slider||!window.supabaseClient)return;
    try{
      const {data,error}=await window.supabaseClient.from('site_settings').select('content').eq('id','homepage').maybeSingle();
      if(error)throw error;
      const c=data?.content||{};
      let list=c?.brand?.heroImages||c?.hero?.images||[];
      if(!Array.isArray(list))list=[];
      list=list.map(x=>typeof x==='string'?x:(x?.url||x?.src||'')).filter(Boolean);
      if(!list.length&&c?.brand?.heroImage)list=[c.brand.heroImage];
      if(!list.length)return;
      const style=document.createElement('style');
      style.textContent='#hero-slider.hero-slider-active{position:relative;overflow:hidden;min-height:360px;display:flex;flex-direction:column;justify-content:flex-end;text-align:center;background:rgba(255,255,255,.08)!important}#hero-slider.hero-slider-active .hero-slider-image{position:absolute;inset:0;width:100%;height:100%;object-fit:cover;object-position:center;opacity:0;transition:opacity .55s ease;z-index:0}#hero-slider.hero-slider-active:after{content:"";position:absolute;inset:0;background:linear-gradient(180deg,rgba(0,0,0,.05),rgba(0,0,0,.58));z-index:1;pointer-events:none}#hero-slider.hero-slider-active strong,#hero-slider.hero-slider-active span{position:relative;z-index:2;text-shadow:0 2px 10px rgba(0,0,0,.45)}';
      document.head.appendChild(style);
      slider.classList.add('hero-slider-active');
      slider.querySelectorAll('.hero-slider-image').forEach(e=>e.remove());
      const img=document.createElement('img');
      img.className='hero-slider-image';
      img.alt='Darul Uloom Muhammadia';
      img.decoding='async';
      img.loading='eager';
      slider.prepend(img);
      slider.style.backgroundImage='none';
      let i=0;
      const show=()=>{
        img.style.opacity='0';
        const src=list[i];
        const preload=new Image();
        preload.onload=()=>{img.src=src;requestAnimationFrame(()=>{img.style.opacity='1';});};
        preload.onerror=()=>{img.src=src;img.style.opacity='1';};
        preload.src=src;
        i=(i+1)%list.length;
      };
      show();
      if(list.length>1)setInterval(show,3000);
    }catch(e){console.warn('Hero slider failed:',e)}
  };
  if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',start,{once:true});else start();
})();

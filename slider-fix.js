(()=>{
  const sliderId='hero-slider';
  let state=null, queued=false;
  const getImages=c=>{let a=c?.brand?.heroImages||c?.hero?.images||c?.media?.heroImages||[];if(!Array.isArray(a))a=[];a=a.map(x=>typeof x==='string'?x:(x?.url||x?.src||'')).filter(Boolean);if(!a.length&&c?.brand?.heroImage)a=[c.brand.heroImage];return a};
  async function read(){try{const {data}=await supabaseClient.from('site_settings').select('content,updated_at').eq('id','homepage').maybeSingle();return {c:data?.content||{},s:data?.updated_at||''}}catch(e){return {c:{},s:''}}}
  function stop(){if(state?.timer)clearTimeout(state.timer)}
  function build(images){const slider=document.getElementById(sliderId);if(!slider||!images.length)return;stop();slider.innerHTML='';const layer=document.createElement('div');layer.style.cssText='position:absolute;inset:0;overflow:hidden;z-index:0';slider.appendChild(layer);const els=images.map((src,i)=>{const img=document.createElement('img');img.src=src;img.alt='';img.draggable=false;img.style.cssText=`position:absolute;inset:0;width:100%;height:100%;object-fit:cover;opacity:${i?'0':'1'};z-index:${i?'1':'2'};transition:opacity 1.25s cubic-bezier(.22,.61,.36,1);pointer-events:none`;layer.appendChild(img);return img});
    const btn=(cls,label,text)=>{const b=document.createElement('button');b.type='button';b.className=cls;b.setAttribute('aria-label',label);b.textContent=text;b.style.cssText='position:absolute;top:50%;transform:translateY(-50%);z-index:20;width:44px;height:44px;border:0;border-radius:50%;background:rgba(0,0,0,.45);color:#fff;font-size:30px;line-height:1;cursor:pointer;display:flex;align-items:center;justify-content:center;';b.style[cls.includes('prev')?'left':'right']='14px';return b};
    const prev=btn('hero-slider-prev','Previous picture','‹'),next=btn('hero-slider-next','Next picture','›');slider.append(prev,next);let current=0;
    const show=n=>{if(els.length<2)return;const ni=(n+els.length)%els.length;if(ni===current)return;els[current].style.opacity='0';els[current].style.zIndex='1';els[ni].style.opacity='1';els[ni].style.zIndex='2';current=ni};
    const schedule=()=>{if(els.length>1)state.timer=setTimeout(()=>{show(current+1);schedule()},3000)};
    prev.onclick=e=>{e.preventDefault();e.stopPropagation();stop();show(current-1);schedule()};next.onclick=e=>{e.preventDefault();e.stopPropagation();stop();show(current+1);schedule()};state={timer:null,key:JSON.stringify(images)};schedule();
  }
  async function refresh(force){if(queued)return;queued=true;setTimeout(async()=>{queued=false;const slider=document.getElementById(sliderId);if(!slider)return;const {c}=await read();const images=getImages(c),key=JSON.stringify(images);if(!force&&state?.key===key)return;build(images)},100)}
  setTimeout(()=>refresh(true),700);window.addEventListener('cms:published',()=>refresh(false));window.addEventListener('slider:refresh',()=>refresh(true));
})();

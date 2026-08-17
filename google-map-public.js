(()=>{
async function init(){
 const contact=document.querySelector('#contact .contact');
 if(!contact||typeof supabaseClient==='undefined')return;
 try{
  const {data,error}=await supabaseClient.from('site_settings').select('content').eq('id','homepage').maybeSingle();
  if(error)throw error;
  const c=data?.content||{}; const m=c.contact||{};
  if(String(m.mapEnabled)!=='true')return;
  const lat=Number(m.latitude), lng=Number(m.longitude);
  const wrap=document.createElement('div'); wrap.className='map-wrap';
  if(Number.isFinite(lat)&&Number.isFinite(lng)){
   const iframe=document.createElement('iframe');
   iframe.className='public-map'; iframe.loading='lazy'; iframe.referrerPolicy='no-referrer-when-downgrade';
   iframe.src='https://www.google.com/maps?q='+encodeURIComponent(lat+','+lng)+'&output=embed';
   iframe.title='Darul Uloom Muhammadia Karachi location'; wrap.appendChild(iframe);
  }else if(m.mapUrl){
   const a=document.createElement('a'); a.className='map-button'; a.href=m.mapUrl; a.target='_blank'; a.rel='noopener'; a.textContent='Open Location in Google Maps'; wrap.appendChild(a);
  }else{return}
  contact.appendChild(wrap);
  const style=document.createElement('style');style.textContent='.map-wrap{width:100%;margin-top:22px}.public-map{width:100%;height:320px;border:0;border-radius:16px;display:block}.map-button{display:inline-block;padding:12px 18px;border-radius:10px;background:#0d47a1;color:#fff;text-decoration:none;font-weight:800}';document.head.appendChild(style);
 }catch(e){console.warn('Google Maps unavailable',e)}
}
if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',init);else init();
})();

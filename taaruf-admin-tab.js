(function(){
  function addTaarufTab(){
    const panel=document.getElementById('ale-panel');
    if(!panel)return;
    const tabs=panel.querySelector('.ale-tabs');
    const forms=panel.querySelector('#ale-forms');
    if(!tabs||!forms)return;
    if(tabs.querySelector('[data-tab="taaruf"]'))return;
    const btn=document.createElement('button');
    btn.type='button';btn.dataset.tab='taaruf';btn.textContent='تعارف نامہ';
    tabs.appendChild(btn);
    const sec=document.createElement('section');
    sec.dataset.section='taaruf';sec.className='ale-section';
    sec.innerHTML='<div class="ale-field"><label>عنوان / Heading</label><input data-path="taaruf.heading" id="taarufHeadingAdmin" dir="rtl" style="font-family:\'Noto Nastaliq Urdu\',\'Noto Naskh Arabic\',serif;text-align:right" value="تعارف نامہ"></div><div class="ale-field"><label>تعارف کا متن / Introduction Text</label><textarea data-path="taaruf.body" id="taarufBodyAdmin" dir="rtl" style="font-family:\'Noto Nastaliq Urdu\',\'Noto Naskh Arabic\',serif;text-align:right;line-height:2;min-height:220px" placeholder="اپنا تعارف یہاں لکھیں..."></textarea></div><p class="ale-note">تبدیلی کرنے کے بعد نیچے موجود Save &amp; Publish بٹن دبائیں۔</p>';
    forms.appendChild(sec);
    async function loadValues(){try{const {data,error}=await supabaseClient.from('site_settings').select('content').eq('id','homepage').maybeSingle();if(error)throw error;const t=data?.content?.taaruf||{};document.getElementById('taarufHeadingAdmin').value=t.heading||'تعارف نامہ';document.getElementById('taarufBodyAdmin').value=t.body||'جامعہ کے تعارف اور بنیادی معلومات کے لیے یہاں اپنا متن درج کریں۔';}catch(e){console.warn('Taaruf load failed',e)}}
    btn.addEventListener('click',function(){tabs.querySelectorAll('button').forEach(x=>x.classList.remove('active'));forms.querySelectorAll('.ale-section').forEach(x=>x.classList.remove('active'));btn.classList.add('active');sec.classList.add('active');loadValues()});
    loadValues();
  }
  const obs=new MutationObserver(addTaarufTab);obs.observe(document.documentElement,{childList:true,subtree:true});
  document.addEventListener('DOMContentLoaded',addTaarufTab);[250,500,1000,2000,4000,7000].forEach(t=>setTimeout(addTaarufTab,t));
})();
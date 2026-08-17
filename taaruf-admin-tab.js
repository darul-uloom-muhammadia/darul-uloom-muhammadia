(function(){
  const esc=s=>String(s??'').replace(/[&<>"']/g,m=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#039;'}[m]));
  function addTab(){
    const tabs=document.querySelector('#ale-panel .ale-tabs');
    const forms=document.querySelector('#ale-panel #ale-forms');
    if(!tabs||!forms||tabs.querySelector('[data-tab="taaruf"]')) return;
    const btn=document.createElement('button');
    btn.type='button';btn.dataset.tab='taaruf';btn.textContent='تعارف نامہ';
    tabs.appendChild(btn);
    const sec=document.createElement('section');
    sec.dataset.section='taaruf';sec.className='ale-section';
    sec.innerHTML='<div class="ale-field"><label>عنوان / Heading</label><input data-path="taaruf.heading" id="taarufHeadingAdmin" dir="rtl" style="font-family:\'Noto Nastaliq Urdu\',\'Noto Naskh Arabic\',serif;text-align:right" value="تعارف نامہ"></div><div class="ale-field"><label>تعارف کا متن / Introduction Text</label><textarea data-path="taaruf.body" id="taarufBodyAdmin" dir="rtl" style="font-family:\'Noto Nastaliq Urdu\',\'Noto Naskh Arabic\',serif;text-align:right;line-height:2;min-height:220px" placeholder="اپنا تعارف یہاں لکھیں..."></textarea></div><p class="ale-note">یہاں کی تبدیلیاں Save & Publish دبانے کے بعد ویب سائٹ پر ظاہر ہوں گی۔</p>';
    forms.appendChild(sec);
    btn.onclick=function(){
      tabs.querySelectorAll('button').forEach(x=>x.classList.remove('active'));
      forms.querySelectorAll('.ale-section').forEach(x=>x.classList.remove('active'));
      btn.classList.add('active');sec.classList.add('active');
      loadValues();
    };
    async function loadValues(){
      try{const {data}=await supabaseClient.from('site_settings').select('content').eq('id','homepage').maybeSingle();const t=data?.content?.taaruf||{};document.getElementById('taarufHeadingAdmin').value=t.heading||'تعارف نامہ';document.getElementById('taarufBodyAdmin').value=t.body||'جامعہ کے تعارف اور بنیادی معلومات کے لیے یہاں اپنا متن درج کریں۔';}catch(e){console.warn('Taaruf load failed',e)}
    }
    loadValues();
  }
  const obs=new MutationObserver(addTab);obs.observe(document.documentElement,{childList:true,subtree:true});
  document.addEventListener('DOMContentLoaded',addTab);setTimeout(addTab,500);setTimeout(addTab,1500);setTimeout(addTab,3000);
})();
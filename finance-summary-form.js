(function(){
  if(!/finance\.html$/.test(location.pathname)) return;
  const $=id=>document.getElementById(id);
  const esc=v=>String(v??'').replace(/[&<>"']/g,m=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#039;'}[m]));
  const fmt=n=>Number(n||0).toLocaleString('en-PK',{minimumFractionDigits:2,maximumFractionDigits:2});
  let observer=null;
  function addStyle(){
    if($('finance-summary-form-style'))return;
    const s=document.createElement('style');s.id='finance-summary-form-style';s.textContent=`
      .finance-summary-form{grid-column:1/-1;background:#fff;border:2px solid #071b3a;border-radius:4px;box-shadow:0 10px 30px #0a2c5418;padding:0;overflow:hidden;position:relative;min-height:620px}
      .fsf-head{position:relative;text-align:center;padding:28px 100px 20px;border-bottom:2px solid #071b3a}
      .fsf-head img{position:absolute;right:24px;top:22px;width:72px;height:72px;object-fit:contain;border:1px solid #071b3a;border-radius:4px;background:#fff}
      .fsf-title{font-size:25px;font-weight:900;color:#071b3a;margin:0 0 6px;direction:rtl}.fsf-sub{font-size:13px;font-weight:700;color:#52667f;margin:3px 0}.fsf-date{font-size:15px;font-weight:900;color:#14233d;margin-top:10px}
      .fsf-body{padding:24px}.fsf-section{border:1px solid #cbd8e8;border-radius:8px;margin-bottom:18px;overflow:hidden}.fsf-section h3{margin:0;padding:11px 14px;background:#071b3a;color:#fff;font-size:16px}.fsf-section.income h3{background:#176b3a}.fsf-section.expense h3{background:#9f2424}
      .fsf-table{width:100%;border-collapse:collapse}.fsf-table th,.fsf-table td{padding:9px 10px;border-bottom:1px solid #e3eaf2;text-align:left}.fsf-table th{background:#f4f8fc;font-size:12px}.fsf-table td:last-child,.fsf-table th:last-child{text-align:right;font-weight:800}.fsf-empty{padding:14px;color:#6a7c93}
      .fsf-totals{display:grid;grid-template-columns:repeat(3,1fr);gap:12px;margin-top:20px}.fsf-total{border:1px solid #cbd8e8;border-radius:8px;padding:15px;text-align:center}.fsf-total b{display:block;font-size:12px;color:#52667f}.fsf-total strong{display:block;font-size:22px;margin-top:4px;color:#071b3a}.fsf-total.current{background:#071b3a;color:#fff}.fsf-total.current b,.fsf-total.current strong{color:#fff}
      .fsf-foot{text-align:center;border-top:2px solid #071b3a;padding:18px 70px 25px;position:relative;min-height:76px}.fsf-foot strong{font-size:18px;color:#071b3a}.fsf-foot .urdu{display:block;font-size:21px;font-weight:900;direction:rtl;margin-top:3px}.fsf-note{font-size:11px;color:#6a7c93;margin-top:8px}
      @media(max-width:650px){.fsf-head{padding:22px 85px 16px}.fsf-head img{right:14px;top:15px;width:58px;height:58px}.fsf-body{padding:13px}.fsf-totals{grid-template-columns:1fr}.fsf-table{font-size:12px}.finance-summary-form{min-height:0}}
    `;document.head.appendChild(s);
  }
  function dateLabel(d){try{return new Date(d+'T00:00:00').toLocaleDateString('en-PK',{day:'2-digit',month:'long',year:'numeric'})}catch{return d}}
  function rows(data,key){const all=[];(data||[]).forEach(rec=>(rec[key]||[]).forEach(x=>{if(x&&x.name&&Number(x.total||0)!==0)all.push(x)}));return all}
  function render(){
    const s=window.__summary;if(!s)return;
    const result=$('reportResult');if(!result)return;
    const data=s.data||[],inc=rows(data,'income_categories'),exp=rows(data,'expense_categories');
    const logo=window.__siteContent?.brand?.logoImage||$('logo')?.src||'favicon.svg';
    const name=$('setEn')?.value||'Darul Uloom Muhammadia Karachi';
    const urdu=$('setUrdu')?.value||$('brandUrdu')?.textContent||'دارالعلوم محمدیہ کراچی';
    const phone=$('setPhone')?.value||'03002778813';
    const title=s.title||'Finance Summary';
    const dates=data.map(x=>x.entry_date);
    const dateText=dates.length===1?dateLabel(dates[0]):(dates.length?dateLabel(dates[0])+' — '+dateLabel(dates[dates.length-1]):title);
    const makeRows=list=>list.length?list.map(x=>`<tr><td>${esc(x.name)}</td><td>${fmt(x.total)}</td></tr>`).join(''):'<tr><td colspan="2" class="fsf-empty">No recorded entries</td></tr>';
    if(observer)observer.disconnect();
    result.className='summary';
    result.innerHTML=`<div class="finance-summary-form"><div class="fsf-head"><img src="${esc(logo)}" alt="Madrasa logo"><div class="fsf-title">${esc(urdu)}</div><div class="fsf-sub">${esc(name)}</div><div class="fsf-sub">Phone: ${esc(phone)}</div><div class="fsf-date">${esc(dateText)}</div></div><div class="fsf-body"><div class="fsf-section income"><h3>Income — ذریعہ آمدنی</h3><table class="fsf-table"><thead><tr><th>Source</th><th>Total</th></tr></thead><tbody>${makeRows(inc)}</tbody></table></div><div class="fsf-section expense"><h3>Expenses — خرچ</h3><table class="fsf-table"><thead><tr><th>Expense</th><th>Total</th></tr></thead><tbody>${makeRows(exp)}</tbody></table></div><div class="fsf-totals"><div class="fsf-total"><b>Total Income</b><strong>${fmt(s.it)}</strong></div><div class="fsf-total"><b>Total Expense</b><strong>${fmt(s.et)}</strong></div><div class="fsf-total current"><b>Current Total</b><strong>${fmt(s.current)}</strong></div></div></div><div class="fsf-foot"><strong>${esc(name)}</strong><span class="urdu">${esc(urdu)}</span><div class="fsf-note">Finance Summary</div></div></div>`;
    observer=new MutationObserver(()=>{});
    observer.observe(result,{childList:true});
  }
  function delayedRender(){setTimeout(render,80)}
  function start(){
    addStyle();
    document.addEventListener('click',function(e){const tab=e.target.closest('.tab');const run=e.target.closest('#runReport');if(tab||run)delayedRender()},true);
    setTimeout(render,300);
  }
  if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',start,{once:true});else start();
})();

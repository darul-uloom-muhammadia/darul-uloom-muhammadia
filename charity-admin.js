(()=>{
  const esc=s=>String(s??'').replace(/[&<>\"']/g,m=>({'&':'&amp;','<':'&lt;','>':'&gt;','\"':'&quot;',"'":'&#039;'}[m]));
  const qs=s=>document.querySelector(s);
  async function admin(){
    const {data:{user}}=await supabaseClient.auth.getUser();
    if(!user)return;
    const {data:a}=await supabaseClient.from('admin_users').select('user_id').eq('user_id',user.id).maybeSingle();
    if(!a)return;
    const dash=qs('#dashboard'); if(!dash)return;
    const box=document.createElement('section'); box.className='card'; box.style.marginTop='20px';
    box.innerHTML='<div class="head"><div><h1>Charity & Donation Management</h1><p>Review payment proof privately, verify donations and issue official receipts.</p></div></div><div id="charityAlert" style="display:none;margin:16px 0;padding:16px;border-radius:12px;background:#fff4d6;border:1px solid #f0cf70;color:#6b4b00;font-weight:800"></div><div id="charityMsg" class="msg"></div><div style="margin:16px 0;padding:16px;background:#f5f8fc;border:1px solid #dfe8f3;border-radius:12px"><h3>Account Information shown to donors</h3><textarea id="charityAccount" style="width:100%;min-height:100px;box-sizing:border-box;padding:10px;border:1px solid #d6e0ec;border-radius:8px" placeholder="Bank name, account title, account number, IBAN, Easypaisa/JazzCash etc."></textarea><button id="saveCharitySettings" class="btn green" style="margin-top:8px">Save Account Information</button></div><div class="table-wrap"><table><thead><tr><th>Donor</th><th>Type</th><th>Amount</th><th>Method</th><th>Date/Time</th><th>Proof</th><th>Status</th><th>Action</th></tr></thead><tbody id="charityRows"></tbody></table></div>';
    dash.parentNode.appendChild(box);
    const msg=(t,c='success')=>{const e=qs('#charityMsg');e.textContent=t;e.className='msg show '+c};
    async function settings(){const {data,error}=await supabaseClient.from('site_settings').select('content').eq('id','homepage').maybeSingle();if(error)throw error;qs('#charityAccount').value=data?.content?.charity?.accountInfo||'';return data?.content||{}}
    async function saveSettings(){try{const c=await settings();c.charity=c.charity||{};c.charity.accountInfo=qs('#charityAccount').value;const {error}=await supabaseClient.from('site_settings').upsert({id:'homepage',content:c,updated_by:user.id,updated_at:new Date().toISOString()},{onConflict:'id'});if(error)throw error;msg('Charity account information saved.')}catch(e){msg(e.message||'Save failed','error')}}
    async function load(){
      const {data,error}=await supabaseClient.from('charity_donations').select('*').order('created_at',{ascending:false}); if(error){msg(error.message,'error');return}
      const pending=data.filter(d=>String(d.status||'').toLowerCase()==='pending'); const alert=qs('#charityAlert');
      if(pending.length){alert.style.display='block';alert.textContent='🔔 '+pending.length+' new charity submission'+(pending.length===1?'':'s')+' waiting for review. Please check the proof and verify the payment.'}else alert.style.display='none';
      qs('#charityRows').innerHTML=data.map(d=>{
        const proof=d.proof_path?'<button class="btn light" data-proof="'+esc(d.proof_path)+'">View Proof</button>':'—';
        const date=(d.payment_date||'')+' '+(d.payment_time||'');
        const action=String(d.status).toLowerCase()==='verified'?'<a class="btn" target="_blank" href="charity-receipt.html?id='+encodeURIComponent(d.id)+'">Print Receipt</a>':'<button class="btn green" data-verify="'+esc(d.id)+'">Verify & Receipt</button>';
        return '<tr><td>'+esc(d.donor_name)+'<br><small>'+esc(d.phone)+'</small></td><td>'+esc(d.charity_type)+'</td><td>PKR '+esc(Number(d.amount||0).toLocaleString())+'</td><td>'+esc(d.payment_method||d.payment_type)+'</td><td>'+esc(date)+'</td><td>'+proof+'</td><td>'+esc(d.status||'pending')+'</td><td>'+action+'</td></tr>';
      }).join('')||'<tr><td colspan="8" class="empty">No charity submissions yet.</td></tr>';
      document.querySelectorAll('[data-verify]').forEach(b=>b.onclick=()=>verify(b.dataset.verify));
      document.querySelectorAll('[data-proof]').forEach(b=>b.onclick=()=>viewProof(b.dataset.proof));
    }
    async function viewProof(path){try{const {data,error}=await supabaseClient.storage.from('charity-proof').createSignedUrl(path,300);if(error)throw error;window.open(data.signedUrl,'_blank','noopener,noreferrer')}catch(e){msg(e.message||'Unable to open proof.','error')}}
    async function verify(id){try{const now=new Date();const receipt='DUK-'+now.getFullYear()+'-'+String(now.getTime()).slice(-7);const {data,error}=await supabaseClient.from('charity_donations').update({status:'verified',receipt_no:receipt,verified_at:now.toISOString(),verified_by:user.id,updated_at:now.toISOString()}).eq('id',id).select('id').maybeSingle();if(error)throw error;if(!data)throw new Error('Donation was not found.');msg('Payment verified. Official receipt is ready.');await load()}catch(e){msg(e.message||'Verification failed','error')}}
    qs('#saveCharitySettings').onclick=saveSettings; try{await settings()}catch(e){msg(e.message||'Unable to load settings','error')} await load();
  }
  if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',admin);else admin();
})();

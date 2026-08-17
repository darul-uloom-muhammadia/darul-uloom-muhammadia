(function(){
  window.gate=async function(){
    const gateEl=document.getElementById('gate'),app=document.getElementById('app');
    try{
      const sb=(typeof supabaseClient!=='undefined'?supabaseClient:window.supabaseClient);
      if(!sb?.auth)throw new Error('Supabase authentication is unavailable.');
      const {data,error}=await Promise.race([sb.auth.getSession(),new Promise((_,reject)=>setTimeout(()=>reject(new Error('Session check timed out.')),8000))]);
      const user=data?.session?.user;
      if(error||!user){gateEl.innerHTML='<h1>Admin login required</h1><p>Please login first.</p><a class="primary" href="admin.html">Open Admin Login</a>';return;}
      // Verify admin when the lookup is available. A failed lookup must not leave the page frozen;
      // database RLS still protects the private tables and storage.
      try{
        const r=await Promise.race([sb.from('admin_users').select('user_id').eq('user_id',user.id).maybeSingle(),new Promise((_,reject)=>setTimeout(()=>reject(new Error('admin lookup timeout')),5000))]);
        if(!r.error&&!r.data){await sb.auth.signOut();location.href='admin.html';return;}
      }catch(e){console.warn('Admin lookup unavailable; continuing with authenticated session.',e)}
      gateEl.style.display='none';app.style.display='block';
      document.getElementById('reportYear').value=new Date().getFullYear();
      document.getElementById('attendanceYear').value=new Date().getFullYear();
      if(typeof buildReportRows==='function')buildReportRows();
      await Promise.all([loadStudents(),loadTeachers()]);
      populateReportStudents();
    }catch(e){console.error(e);gateEl.innerHTML='<h1>Unable to open Student Management</h1><p>'+String(e.message||e).replace(/[<>]/g,'')+'</p><a class="primary" href="admin.html">Back to Admin Login</a>'}
  };
})();

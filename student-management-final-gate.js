(function(){
  window.gate=async function(){
    const gateEl=document.getElementById('gate'),app=document.getElementById('app');
    try{
      const sb=(typeof supabaseClient!=='undefined'?supabaseClient:window.supabaseClient);
      if(!sb?.auth)throw new Error('Supabase authentication is unavailable.');
      const result=await Promise.race([sb.auth.getUser(),new Promise((_,reject)=>setTimeout(()=>reject(new Error('Authentication check timed out.')),8000))]);
      const user=result?.data?.user;
      if(result?.error||!user){gateEl.innerHTML='<h1>Admin login required</h1><p>Please login first.</p><a class="primary" href="admin.html">Open Admin Login</a>';return;}
      const admin=await Promise.race([sb.rpc('is_admin_user'),new Promise((_,reject)=>setTimeout(()=>reject(new Error('Admin verification timed out.')),5000))]);
      if(admin?.error)throw admin.error;
      if(admin?.data!==true){await sb.auth.signOut();location.href='admin.html';return;}
      gateEl.style.display='none';app.style.display='block';
      const y=new Date().getFullYear();
      const ry=document.getElementById('reportYear'),ay=document.getElementById('attendanceYear');
      if(ry)ry.value=y;if(ay)ay.value=y;
      if(typeof buildReportRows==='function')buildReportRows();
      await Promise.all([loadStudents(),loadTeachers()]);
      if(typeof populateReportStudents==='function')populateReportStudents();
    }catch(e){console.error('Student Management final gate:',e);gateEl.innerHTML='<h1>Unable to open Student Management</h1><p>'+String(e.message||e).replace(/[<>]/g,'')+'</p><a class="primary" href="admin.html">Back to Admin Dashboard</a>'}
  };
  const start=()=>setTimeout(()=>window.gate(),50);
  if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',start,{once:true});else start();
})();

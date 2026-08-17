(function(){
  const sb=(typeof supabaseClient!=='undefined'?supabaseClient:window.supabaseClient);
  if(!sb||!sb.auth){console.error('Student Management: Supabase client unavailable');return;}
  const timeout=ms=>new Promise((_,reject)=>setTimeout(()=>reject(new Error('timeout')),ms));
  let started=false;
  window.__studentManagementFinalGate=async function(){
    if(started)return;
    started=true;
    const gate=document.getElementById('gate'),app=document.getElementById('app');
    try{
      const session=await Promise.race([sb.auth.getSession(),timeout(7000)]);
      const user=session?.data?.session?.user;
      if(!user){
        gate.innerHTML='<h1>Admin login required</h1><p>Please login to the Admin Dashboard first.</p><a class="primary" href="admin.html">Open Admin Login</a>';
        return;
      }
      const admin=await Promise.race([sb.from('admin_users').select('user_id').eq('user_id',user.id).maybeSingle(),timeout(5000)]);
      if(admin.error)throw admin.error;
      if(!admin.data){await sb.auth.signOut();location.href='admin.html';return;}
      gate.style.display='none';app.style.display='block';
      const y=new Date().getFullYear();
      const ry=document.getElementById('reportYear'),ay=document.getElementById('attendanceYear');
      if(ry)ry.value=y;if(ay)ay.value=y;
      if(typeof buildReportRows==='function')buildReportRows();
      if(typeof loadStudents==='function')await loadStudents();
      if(typeof loadTeachers==='function')await loadTeachers();
      if(typeof populateReportStudents==='function')populateReportStudents();
    }catch(e){
      console.error('Student Management gate:',e);
      started=false;
      gate.innerHTML='<h1>Unable to open Student Management</h1><p>'+String(e.message||e).replace(/[<>]/g,'')+'</p><a class="primary" href="admin.html">Back to Admin Login</a>';
    }
  };
  const start=()=>{setTimeout(()=>window.__studentManagementFinalGate(),50);setTimeout(()=>{const g=document.getElementById('gate');if(g&&getComputedStyle(g).display!=='none'&&typeof window.__studentManagementFinalGate==='function')window.__studentManagementFinalGate()},2500)};
  if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',start,{once:true});else start();
})();

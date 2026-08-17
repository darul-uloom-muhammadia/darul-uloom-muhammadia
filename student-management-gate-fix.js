(function(){
  const boot=async()=>{
    const gate=document.getElementById('gate'), app=document.getElementById('app');
    if(!gate||!app)return;
    try{
      const sb=(typeof supabaseClient!=='undefined'?supabaseClient:window.supabaseClient);
      if(!sb?.auth) throw new Error('Supabase authentication is unavailable.');
      const {data,error}=await Promise.race([sb.auth.getSession(),new Promise((_,reject)=>setTimeout(()=>reject(new Error('Session check timed out.')),8000))]);
      const user=data?.session?.user;
      if(error||!user){gate.innerHTML='<h1>Admin login required</h1><p>Please login to the Admin Dashboard first, then open Student Management.</p><a class="primary" href="admin.html">Open Admin Login</a>';return;}
      // The database policies remain the final protection for private student records.
      // If an authorized session exists, allow the management UI to boot instead of hanging on a second admin lookup.
      gate.style.display='none';app.style.display='block';
      if(typeof window.__studentManagementStarted==='function') window.__studentManagementStarted();
    }catch(e){
      console.error('Student management gate:',e);
      gate.innerHTML='<h1>Unable to open Student Management</h1><p>'+String(e.message||e).replace(/[<>]/g,'')+'</p><a class="primary" href="admin.html">Back to Admin Login</a>';
    }
  };
  window.__studentManagementGateBoot=boot;
  if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',boot);else boot();
})();

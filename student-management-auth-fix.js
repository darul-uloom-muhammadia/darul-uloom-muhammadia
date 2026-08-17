(function(){
  const sb=(typeof supabaseClient!=='undefined'?supabaseClient:window.supabaseClient);
  if(!sb||!sb.auth){console.error('Student management: Supabase client unavailable.');return;}
  const originalGetUser=sb.auth.getUser.bind(sb.auth);
  const originalGetSession=sb.auth.getSession.bind(sb.auth);
  const timeout=ms=>new Promise((_,reject)=>setTimeout(()=>reject(new Error('timeout')),ms));
  sb.auth.getUser=async function(){
    try{const r=await Promise.race([originalGetSession(),timeout(5000)]);const u=r?.data?.session?.user;if(u)return {data:{user:u},error:null};}catch(e){}
    try{return await Promise.race([originalGetUser(),timeout(8000)]);}catch(error){return {data:{user:null},error};}
  };
  window.__studentManagementFinalGate=async function(){
    const gateEl=document.getElementById('gate'),app=document.getElementById('app');
    try{
      const r=await Promise.race([originalGetSession(),timeout(8000)]);const user=r?.data?.session?.user;
      if(!user){gateEl.innerHTML='<h1>Admin login required</h1><p>Please login to the Admin Dashboard first.</p><a class="primary" href="admin.html">Open Admin Login</a>';return;}
      try{const ar=await Promise.race([sb.from('admin_users').select('user_id').eq('user_id',user.id).maybeSingle(),timeout(5000)]);if(!ar.error&&!ar.data){await sb.auth.signOut();location.href='admin.html';return;}}catch(e){console.warn('Admin lookup unavailable; authenticated session will continue.',e)}
      gateEl.style.display='none';app.style.display='block';
      document.getElementById('reportYear').value=new Date().getFullYear();document.getElementById('attendanceYear').value=new Date().getFullYear();
      if(typeof buildReportRows==='function')buildReportRows();await Promise.all([loadStudents(),loadTeachers()]);populateReportStudents();
    }catch(e){console.error('Student management gate:',e);gateEl.innerHTML='<h1>Unable to open Student Management</h1><p>'+String(e.message||e).replace(/[<>]/g,'')+'</p><a class="primary" href="admin.html">Back to Admin Login</a>';}
  };
  const nativeAdd=window.addEventListener.bind(window);
  window.addEventListener=function(type,listener,options){if(type==='load'&&typeof listener==='function')listener=window.__studentManagementFinalGate;return nativeAdd(type,listener,options);};
})();

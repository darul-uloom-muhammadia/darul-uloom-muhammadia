(function(){
  const sb=(typeof supabaseClient!=='undefined'?supabaseClient:window.supabaseClient);
  if(!sb||!sb.auth)return;
  const originalGetUser=sb.auth.getUser.bind(sb.auth);
  const originalGetSession=sb.auth.getSession.bind(sb.auth);
  const timeout=ms=>new Promise((_,reject)=>setTimeout(()=>reject(new Error('timeout')),ms));
  sb.auth.getUser=async function(){
    try{
      const r=await Promise.race([originalGetSession(),timeout(5000)]);
      const u=r?.data?.session?.user;
      if(u)return {data:{user:u},error:null};
    }catch(e){}
    try{return await Promise.race([originalGetUser(),timeout(8000)]);}catch(error){return {data:{user:null},error};}
  };
})();

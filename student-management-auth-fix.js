(function(){
  const sb=(typeof supabaseClient!=='undefined'?supabaseClient:window.supabaseClient);
  if(!sb||!sb.auth){console.error('Student management: Supabase client not available.');return;}
  const timeout=ms=>new Promise((_,reject)=>setTimeout(()=>reject(new Error('Admin authentication timed out.')),ms));
  const originalGetUser=sb.auth.getUser.bind(sb.auth);
  sb.auth.getUser=async function(){
    try{
      const result=await Promise.race([originalGetUser(),timeout(8000)]);
      return result;
    }catch(error){
      console.warn('Admin authentication check failed:',error);
      return {data:{user:null},error};
    }
  };
})();

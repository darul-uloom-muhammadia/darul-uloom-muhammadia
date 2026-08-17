(function(){
  const sb=window.supabaseClient;
  if(!sb||!sb.auth)return;
  const originalGetUser=sb.auth.getUser.bind(sb.auth);
  const timeout=ms=>new Promise((_,reject)=>setTimeout(()=>reject(new Error('Admin authentication timed out. Please refresh the page.')),ms));
  sb.auth.getUser=async function(){
    try{
      const result=await Promise.race([sb.auth.getSession(),timeout(7000)]);
      const user=result?.data?.session?.user||null;
      return {data:{user},error:result?.error||null};
    }catch(error){
      console.warn('Admin authentication check failed:',error);
      return {data:{user:null},error};
    }
  };
})();

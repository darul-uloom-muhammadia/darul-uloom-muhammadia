/* Student account signup UX hardening. Does not query auth.users or expose whether an email exists. */
(function(){
  function ready(){
    const sb=window.supabaseClient;
    const form=document.getElementById('registerForm');
    const msgEl=document.getElementById('registerMsg');
    if(!sb||!form||!msgEl)return;
    form.addEventListener('submit',async function(e){
      e.preventDefault();
      const email=document.getElementById('regEmail')?.value.trim();
      const password=document.getElementById('regPassword')?.value||'';
      const name=document.getElementById('regName')?.value.trim()||'';
      const father=document.getElementById('regFather')?.value.trim()||'';
      const phone=document.getElementById('regPhone')?.value.trim()||'';
      const address=document.getElementById('regAddress')?.value.trim()||'';
      const setMsg=(text,cls)=>{msgEl.textContent=text;msgEl.className='form-msg '+(cls||'');};
      if(!email||!password){setMsg('Please enter your email address and password.','error');return;}
      setMsg('Creating your student account…');
      try{
        const {data,error}=await sb.auth.signUp({email,password,options:{data:{full_name:name,father_name:father,phone,address}}});
        if(error){
          const raw=(error.message||'').toLowerCase();
          if(raw.includes('already registered')||raw.includes('already exists')||raw.includes('user already')){
            setMsg('An account with this email address already exists. Please sign in to your existing account instead.','error');
            const loginTab=document.getElementById('loginTab');
            if(loginTab){const old=loginTab.textContent;loginTab.textContent='Sign In';loginTab.click();setTimeout(()=>{loginTab.textContent=old;},2500);}
          }else if(raw.includes('password')){
            setMsg('Your password does not meet the required security rules. Please choose a stronger password.','error');
          }else if(raw.includes('invalid')&&raw.includes('email')){
            setMsg('Please enter a valid email address.','error');
          }else{
            setMsg('We could not create your account right now. Please check your details and try again.','error');
          }
          return;
        }
        if(data?.session){
          setMsg('Your student account has been created successfully.','success');
          return;
        }
        setMsg('Your account has been created. Please check your email to confirm your account, then sign in.','success');
      }catch(err){
        console.error('Student signup error:',err);
        setMsg('We could not create your account right now. Please try again later.','error');
      }
    },true);
  }
  if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',ready,{once:true});else ready();
})();

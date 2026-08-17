// Final student-card UI fix: preserve the approved reference card and QR,
// fix photo fitting, add editable text above Authorized, and reduce display size.
const __originalOpenCard = window.openCard;
const __authTextKey = 'student-card-authorized-text';

function __uiLoadImage(src){return new Promise((resolve,reject)=>{const i=new Image();i.crossOrigin='anonymous';i.onload=()=>resolve(i);i.onerror=reject;i.src=src;});}
function __fitPhoto(ctx,img,x,y,w,h){
  ctx.fillStyle='#000154';ctx.fillRect(x,y,w,h);
  const ar=img.naturalWidth/img.naturalHeight, box=w/h;
  let sw=img.naturalWidth, sh=img.naturalHeight;
  if(ar>box){sw=sh*box;}else{sh=sw/box;}
  const sx=(img.naturalWidth-sw)/2, sy=(img.naturalHeight-sh)/2;
  ctx.drawImage(img,sx,sy,sw,sh,x+(w-sw)/2,y+(h-sh)/2,sw,sh);
}

function __addAuthorizedEditor(){
  if(document.getElementById('cardAuthorizedEditor'))return;
  const wrap=document.createElement('div');
  wrap.id='cardAuthorizedEditor';
  wrap.style.cssText='display:flex;align-items:center;gap:10px;flex-wrap:wrap;margin:4px 0 12px;padding:10px 12px;background:#f7faff;border:1px solid #dbe6f2;border-radius:10px;';
  wrap.innerHTML='<label style="margin:0;flex:1;min-width:240px;font-size:12px;font-weight:800;color:#344966">Text above Authorized<input id="authorizedCardText" type="text" maxlength="45" placeholder="Type name / designation"></label>';
  const preview=document.getElementById('cardPreview');
  preview.parentNode.insertBefore(wrap,preview);
  const input=document.getElementById('authorizedCardText');
  input.value=localStorage.getItem(__authTextKey)||'';
  input.oninput=()=>{localStorage.setItem(__authTextKey,input.value);__refreshStudentCard();};
}

async function __refreshStudentCard(){
  const card=window.__currentStudentCard;
  if(!card||!window.__studentCardOpenOriginal)return;
  await window.__studentCardOpenOriginal(card,'student');
  __addAuthorizedEditor();
  await __applyStudentCardFixes();
}

async function __applyStudentCardFixes(){
  const canvas=document.getElementById('frontCanvas');
  if(!canvas||!window.selectedStudent)return;
  const ctx=canvas.getContext('2d');
  // Keep the original reference QR exactly as rendered; only correct the photo area.
  if(window.studentPhotoUrl){
    try{
      const img=await __uiLoadImage(window.studentPhotoUrl);
      __fitPhoto(ctx,img,87,291,334,379);
      ctx.strokeStyle='#fff';ctx.lineWidth=7;ctx.strokeRect(75,277,360,410);
    }catch(e){}
  }else{
    ctx.fillStyle='#000154';ctx.fillRect(87,291,334,379);
    ctx.strokeStyle='#fff';ctx.lineWidth=7;ctx.strokeRect(75,277,360,410);
  }
  const text=document.getElementById('authorizedCardText')?.value?.trim()||'';
  if(text){
    ctx.fillStyle='#1d2b38';ctx.font='18px Arial';ctx.textAlign='center';ctx.fillText(text,260,798);ctx.textAlign='left';
  }
}

window.__studentCardOpenOriginal=__originalOpenCard;
window.__currentStudentCard=null;
window.openCard=async(card,type)=>{
  if(type!=='student')return __originalOpenCard(card,type);
  window.__currentStudentCard=card;
  await __originalOpenCard(card,type);
  if(document.getElementById('cardModalMeta')){
    document.getElementById('cardModalMeta').textContent=`${selectedStudent.student_name} · GR ${selectedStudent.gr_number} · Expires ${expText(card.expires_at)}`;
  }
  __addAuthorizedEditor();
  await __applyStudentCardFixes();
};

const style=document.createElement('style');
style.textContent='.ref-card{width:min(900px,100%) !important}.card-preview{gap:10px !important}.cardAuthorizedEditor input{margin-top:5px}';
document.head.appendChild(style);

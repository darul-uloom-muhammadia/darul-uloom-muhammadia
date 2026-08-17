(() => {
  const CARD_W_REF = 1600, CARD_H_REF = 1009;
  const DESIGN_W = 1600, DESIGN_H = 1040;
  const NAVY = '#000154', GOLD = '#ffd900';
  const $ = id => document.getElementById(id);
  const loadImage = src => new Promise((resolve,reject)=>{const i=new Image();i.crossOrigin='anonymous';i.onload=()=>resolve(i);i.onerror=reject;i.src=src});
  function fit(ctx,text,max){let s=String(text??'');while(ctx.measureText(s).width>max&&s.length>1)s=s.slice(0,-1)+'…';return s}
  async function makeQr(card){
    if(!window.QRCode || typeof window.QRCode.toDataURL!=='function') return '';
    const value=JSON.stringify({gr:selectedStudent.gr_number,name:selectedStudent.student_name,expires:card?.expires_at});
    return QRCode.toDataURL(value,{margin:4,width:420,errorCorrectionLevel:'M'});
  }
  async function studentCardCanvasReference(card){
    const c=document.createElement('canvas');c.width=CARD_W_REF;c.height=CARD_H_REF;const x=c.getContext('2d');
    x.save();x.scale(1,CARD_H_REF/DESIGN_H);
    x.fillStyle='#e7edf2';x.fillRect(0,0,DESIGN_W,DESIGN_H);
    x.fillStyle=NAVY;x.fillRect(0,0,DESIGN_W,290);
    x.fillStyle='#fff';x.beginPath();x.moveTo(1185,0);x.lineTo(1245,0);x.lineTo(1125,290);x.lineTo(1065,290);x.closePath();x.fill();
    x.fillStyle='rgba(214,239,247,.65)';x.beginPath();x.moveTo(0,290);x.lineTo(1600,340);x.lineTo(1600,470);x.lineTo(0,370);x.closePath();x.fill();
    x.fillStyle='rgba(255,255,255,.38)';x.beginPath();x.moveTo(0,515);x.lineTo(1600,360);x.lineTo(1600,620);x.lineTo(0,820);x.closePath();x.fill();
    x.fillStyle='rgba(207,225,238,.35)';x.beginPath();x.moveTo(0,770);x.lineTo(1600,590);x.lineTo(1600,910);x.lineTo(0,1040);x.closePath();x.fill();
    x.fillStyle='#0068b8';x.fillRect(0,950,1600,40);x.fillStyle=NAVY;x.fillRect(0,990,1600,50);
    const logo=await loadImage(logoUrl);x.save();x.beginPath();x.arc(1360,145,118,0,Math.PI*2);x.clip();x.drawImage(logo,1240,25,240,240);x.restore();
    x.fillStyle='#fff';x.font='800 56px Arial';x.fillText('Al Ameer Foundation School - AFS',80,145);x.font='24px Arial';x.fillStyle=GOLD;x.fillText('Under the supervision of Madarsa Darul Uloom Muhammadia Karachi',185,180);
    x.fillStyle='#fff';x.fillRect(75,277,360,410);x.fillStyle=NAVY;x.fillRect(87,291,334,379);
    if(studentPhotoUrl){try{const p=await loadImage(studentPhotoUrl);const sw=p.naturalWidth,sh=p.naturalHeight;const scale=Math.max(334/sw,379/sh);const dw=sw*scale,dh=sh*scale;x.drawImage(p,87+(334-dw)/2,291+(379-dh)/2,dw,dh)}catch(e){}}
    x.strokeStyle='#fff';x.lineWidth=7;x.strokeRect(75,277,360,410);
    x.font='800 58px Arial';const labelX=510;
    [['Name',selectedStudent.student_name,400],['Father',selectedStudent.father_name,485],['GR',selectedStudent.gr_number,570],['Class',selectedStudent.class_name,655],['DOB',dateText(selectedStudent.dob),740]].forEach(([lab,val,yy])=>{x.fillStyle='#061a7a';x.fillText(lab,labelX,yy);x.fillText(':',675,yy);x.fillStyle='#1d2b38';x.fillText(fit(x,val,600),705,yy)});
    try{const sig=await loadImage('student-signature.svg');x.drawImage(sig,175,705,185,78)}catch(e){}
    x.fillStyle='#1d2b38';x.font='20px Arial';x.fillText('Authorized',174,805);x.fillStyle='#0d47a1';x.fillRect(125,815,255,38);x.fillStyle='#fff';x.font='800 26px Arial';x.fillText('SIGNATORY',155,844);
    const qrSrc=await makeQr(card);if(qrSrc){const qr=await loadImage(qrSrc);x.drawImage(qr,1245,650,245,245)}
    x.restore();return c;
  }
  async function backCanvasReference(){
    const c=document.createElement('canvas');c.width=CARD_W_REF;c.height=CARD_H_REF;const x=c.getContext('2d');
    x.save();x.scale(1,CARD_H_REF/DESIGN_H);x.fillStyle=NAVY;x.fillRect(0,0,DESIGN_W,DESIGN_H);
    const logo=await loadImage(logoUrl);x.save();x.beginPath();x.arc(800,520,250,0,Math.PI*2);x.clip();x.drawImage(logo,550,270,500,500);x.restore();x.restore();return c;
  }
  async function openCardReference(card,type){
    if(type!=='student')return window.__originalOpenCard(card,type);
    $('cardModalTitle').textContent='Student ID Card';$('cardModalMeta').textContent=`${selectedStudent.student_name} · GR ${selectedStudent.gr_number} · Expires ${expText(card.expires_at)}`;
    const front=await studentCardCanvasReference(card),back=await backCanvasReference();
    $('cardPreview').innerHTML='<div class="card-surface ref-card"><canvas id="frontCanvas" width="1600" height="1009"></canvas></div><div class="card-surface ref-card"><canvas id="backCanvas" width="1600" height="1009"></canvas></div>';
    $('frontCanvas').getContext('2d').drawImage(front,0,0);$('backCanvas').getContext('2d').drawImage(back,0,0);$('cardModal').classList.add('open');$('cardModal').dataset.type='student';
  }
  window.__originalOpenCard=window.openCard;window.studentCardCanvas=studentCardCanvasReference;window.backCanvas=backCanvasReference;window.openCard=async(card,type)=>type==='student'?openCardReference(card,type):window.__originalOpenCard(card,type);
  async function combined(){const f=$('frontCanvas'),b=$('backCanvas'),o=document.createElement('canvas');o.width=CARD_W_REF;o.height=CARD_H_REF*2;const z=o.getContext('2d');z.drawImage(f,0,0);z.drawImage(b,0,CARD_H_REF);return new Promise(r=>o.toBlob(r,'image/png'))}
  $('saveCombinedCardBtn').onclick=async()=>{try{const blob=await combined();const a=document.createElement('a');a.href=URL.createObjectURL(blob);a.download=`student-card-${selectedStudent.gr_number||'card'}-front-back.png`;a.click();setTimeout(()=>URL.revokeObjectURL(a.href),1000);toast('Front and back saved together as one image.')}catch(e){toast('Unable to save card image.',true)}};
  $('shareCardBtn').onclick=async()=>{try{const blob=await combined();const file=new File([blob],`student-card-${selectedStudent.gr_number||'card'}.png`,{type:'image/png'});if(navigator.share&&navigator.canShare&&navigator.canShare({files:[file]})){await navigator.share({title:'Student Card',files:[file]})}else{const a=document.createElement('a');a.href=URL.createObjectURL(blob);a.download=file.name;a.click();toast('Image saved. Direct image sharing is not available in this browser.')}}catch(e){if(e.name!=='AbortError')toast('Unable to share image.',true)}};
})();

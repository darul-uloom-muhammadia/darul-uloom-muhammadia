// Exact reference-style student card override.
// Keeps the previously approved 530x318 card proportions (rendered at 1060x636).
logoUrl='https://puvsirrwregusqhkixdz.supabase.co/storage/v1/object/public/site-media/branding/logo/1786949491226-whatsapp-image-2026-08-13-at-17.27.34.jpeg';

async function __cardLogo(){
  return new Promise((resolve,reject)=>{const i=new Image();i.crossOrigin='anonymous';i.onload=()=>resolve(i);i.onerror=reject;i.src=logoUrl;});
}
async function __cardQR(value){
  if(window.QRCode&&typeof window.QRCode.toDataURL==='function') return window.QRCode.toDataURL(value,{margin:0,width:220,errorCorrectionLevel:'M'});
  return '';
}
function __drawCircularLogo(ctx,img,x,y,size){
  ctx.save();ctx.beginPath();ctx.arc(x+size/2,y+size/2,size/2,0,Math.PI*2);ctx.clip();ctx.drawImage(img,x,y,size,size);ctx.restore();
}
function __fit(ctx,text,max){let s=String(text??'');while(ctx.measureText(s).width>max&&s.length>2)s=s.slice(0,-2)+'…';return s;}
function __cardPhoto(ctx,img,x,y,w,h){
  const ar=img.width/img.height, box=w/h;let sw=img.width,sh=img.height,sx=0,sy=0;
  if(ar>box){sw=img.height*box;sx=(img.width-sw)/2}else{sh=img.width/box;sy=(img.height-sh)/2}
  ctx.drawImage(img,sx,sy,sw,sh,x,y,w,h);
}

async function studentCardCanvas(card){
  const canvas=document.createElement('canvas');canvas.width=1060;canvas.height=636;const c=canvas.getContext('2d');
  c.fillStyle='#fff';c.fillRect(0,0,1060,636);
  c.fillStyle='#071e9b';c.fillRect(0,0,1060,204);
  c.fillStyle='#fff';c.beginPath();c.moveTo(805,0);c.lineTo(845,0);c.lineTo(780,204);c.lineTo(740,204);c.closePath();c.fill();
  const logo=await __cardLogo();__drawCircularLogo(c,logo,914,10,116);
  c.fillStyle='#fff';c.font='800 48px Arial';c.fillText('Al Ameer Foundation School - AFS',50,92);
  c.fillStyle='#dbe7ff';c.font='20px Arial';c.fillText('Under the supervision of Madras Darul Uloom Muhammadia Karachi',52,125);

  c.fillStyle='#082aa3';c.fillRect(58,208,244,272);
  c.strokeStyle='#fff';c.lineWidth=7;c.strokeRect(58,208,244,272);
  if(studentPhotoUrl){try{const p=await loadImg(studentPhotoUrl);__cardPhoto(c,p,64,214,232,260)}catch(e){}}

  c.fillStyle='#071b3a';c.font='800 36px Arial';const x=354;
  c.fillText('Name : '+__fit(c,selectedStudent.student_name,570),x,285);
  c.fillText('Father: '+__fit(c,selectedStudent.father_name,570),x,338);
  c.fillText('GR    : '+__fit(c,selectedStudent.gr_number,570),x,391);
  c.fillText('Class : '+__fit(c,selectedStudent.class_name,570),x,444);
  c.fillText('DOB   : '+dateText(selectedStudent.dob),x,497);

  try{const sig=await loadImg('student-signature.svg');c.drawImage(sig,125,515,155,53)}catch(e){}
  c.fillStyle='#111';c.font='18px Arial';c.fillText('Authorized',125,584);
  c.fillStyle='#1451ad';c.fillRect(92,590,180,30);c.fillStyle='#fff';c.font='800 17px Arial';c.fillText('SIGNATORY',116,612);

  const q=await __cardQR(JSON.stringify({gr:selectedStudent.gr_number,name:selectedStudent.student_name,expires:card.expires_at}));
  if(q){try{const qi=await loadImg(q);c.drawImage(qi,885,470,142,142)}catch(e){}}
  return canvas;
}

async function backCanvas(){
  const canvas=document.createElement('canvas');canvas.width=1060;canvas.height=636;const c=canvas.getContext('2d');
  c.fillStyle='#071b3a';c.fillRect(0,0,1060,636);
  const logo=await __cardLogo();__drawCircularLogo(c,logo,405,103,250);
  return canvas;
}

const $=i=>document.getElementById(i);let user;
const esc=s=>String(s??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
auth.onAuthStateChanged(u=>{if(!u||!(u.emailVerified||u.phoneNumber))return location.href='index.html';user=u;$('who').textContent=u.email||u.phoneNumber;restore();load()});
$('out').onclick=()=>auth.signOut();
function go(v){document.querySelectorAll('nav button,.view').forEach(x=>x.classList.remove('on'));document.querySelector('nav [data-v='+v+']').classList.add('on');$(v).classList.add('on');document.body.dataset.v=v}
document.querySelectorAll('nav button').forEach(b=>b.onclick=()=>go(b.dataset.v));
const SYS={role:'system',content:'You are CUTE-S-AI, a friendly, accurate free study assistant for students. Help only with studies: explain concepts step by step, solve problems, make notes, quizzes and summaries. Use simple markdown (bold, lists, code blocks). Reply in the language the student uses (Urdu, Roman Urdu or English). Politely decline non-study requests. Greet back in the same style the student used: Assalam-o-Alaikum gets Walaikum Assalam, Namashty or Namaste gets Namashty, Hello gets Hello. Never say just Salam.'};
const SG=['Explain OOP concepts with simple examples','Make short exam notes on Pointers in C++','Quiz me with 5 MCQs on Software Engineering','Summarize this topic in Roman Urdu: Database normalization'];

const SAY={idle:['Main yahin hoon 💗'],listen:['Main sun raha hoon 👂','Boliye, boliye 🐰'],think:['Hmm... soch raha hoon 🤔','Ek second, dhoond raha hoon 💭'],happy:['Yay, jawab ready! 🎉','Dekha? Maine kar diya 😄'],love:['Aapka shukriya! 💗','Aww, aap bohot achhe ho 🥰'],sad:['Oops, kuch gadbad ho gayi 🥺','Sorry, dobara try karein 💔'],hug:['Main hoon na 🤗','Fikar na karein, sab theek hoga 💗'],cheer:['All the best! 💪✨','Aap zaroor top karoge! ⭐'],wave:['Assalam-o-Alaikum! 👋💗','Namashty! 🙏💗','Hello! 👋🐰'],sleep:['Zzz... 😴','Nind aa rahi hai 💤'],talk:['Batata hoon... 💬']};
const PP={happy:['✨','🎉','⭐'],cheer:['💪','✨','⭐'],love:['💗','💖','💕'],sad:['💧'],hug:['💗','🤗'],think:['💭'],sleep:['💤'],wave:['💗']};
const GIF={idle:'idle',listen:'listen',think:'think',talk:'talk',happy:'happy',love:'love',hug:'love',sad:'sad',sleep:'sleep',wave:'wave',cheer:'cheer'};
let petT,idleT,sayT;
function pet(st,ms,txt){const p=$('pet');if(!p)return;p.className=st;clearTimeout(petT);if(ms)petT=setTimeout(()=>pet('idle'),ms);
 const a=SAY[st]||SAY.idle;if(st!=='idle'||txt){const s=$('say');s.textContent=txt||a[Math.floor(Math.random()*a.length)];s.classList.add('on');clearTimeout(sayT);sayT=setTimeout(()=>s.classList.remove('on'),ms||2500)}
 (PP[st]||[]).forEach((e,i)=>{for(let k=0;k<2;k++){const x=document.createElement('span');x.className='pp';x.textContent=e;x.style.setProperty('--x',(Math.random()*70-35)+'px');x.style.animationDelay=(i*.15+k*.25)+'s';p.append(x);setTimeout(()=>x.remove(),2200)}});
 clearTimeout(idleT);idleT=setTimeout(()=>pet('sleep'),45000)}
function mood(q,r){const t=q.toLowerCase();
 if(/thank|shukriya|thanks|jazak/.test(t))return pet('love',3500);
 if(/assalam|assalaam|aslam|salam|salaam/.test(t))return pet('wave',3500,'Walaikum Assalam! 💗');
 if(/namast|namash|namaskar/.test(t))return pet('wave',3500,'Namashty! 🙏💗');
 if(/^(hi|hello|hey|hii)/.test(t))return pet('wave',3500,'Hello! 👋🐰');
 if(/udas|sad|tension|stress|dar lag|depress|rona/.test(t))return pet('hug',4500);
 if(/exam|test|paper|quiz|mcq|viva/.test(t))return pet('cheer',3500);
 pet('happy',3000)}
let hist=[],busy=false;const M=$('msgs');
function md(t){let h=esc(t);h=h.replace(/```(\w*)\n?([\s\S]*?)```/g,(_,l,c)=>'<pre><code>'+c+'</code></pre>').replace(/`([^`\n]+)`/g,'<code>$1</code>').replace(/\*\*([^*\n]+)\*\*/g,'<b>$1</b>');return h.replace(/\n/g,'<br>').replace(/<pre><code>([\s\S]*?)<\/code><\/pre>/g,(m)=>m.replace(/<br>/g,'\n'))}
function welcome(){M.innerHTML='<div class="wel"><img src="logo.png?v=2" alt=""><h2>Assalam-o-Alaikum! Main CUTE-S-AI hoon</h2><p>Aapka free study buddy. Kuch bhi poochhein 💗</p><div class="sg"></div></div>';
 SG.forEach(x=>{const b=document.createElement('button');b.textContent=x;b.onclick=()=>{$('q').value=x;ask()};M.querySelector('.sg').append(b)})}
function bub(role,text){const w=document.createElement('div');w.className='m '+(role==='user'?'u':'a');
 if(role!=='user'){const i=document.createElement('img');i.src='icon.png';i.className='av';w.append(i)}
 const b=document.createElement('div');b.className='b';if(role==='user')b.textContent=text;else b.innerHTML=text?md(text):'<div class="ldw"><img class="ld" src="loading.gif" alt=""><span>Soch raha hoon...</span></div>';
 w.append(b);M.append(w);M.scrollTop=M.scrollHeight;return b}
function acts(b,text){const a=document.createElement('div');a.className='act';
 const c=document.createElement('button');c.textContent='📋 Copy';c.onclick=()=>{navigator.clipboard?.writeText(text);c.textContent='✅ Copied'};
 const s=document.createElement('button');s.textContent='💾 Save as note';s.onclick=()=>{$('t').value=(hist.filter(h=>h.role==='user').pop()?.content||'Notes').slice(0,100);$('tx').value=text.slice(0,20000);go('up')};
 a.append(c,s);b.append(a)}
function save(){try{localStorage.setItem('cs_'+user.uid,JSON.stringify(hist.slice(-30)))}catch(e){}}
function restore(){try{hist=JSON.parse(localStorage.getItem('cs_'+user.uid)||'[]')}catch(e){hist=[]}
 if(!hist.length)return welcome();M.innerHTML='';hist.forEach(h=>{const b=bub(h.role,h.content);if(h.role!=='user')acts(b,h.content)})}
async function ask(){const q=$('q').value.trim();if(!q||busy)return;busy=true;$('send').disabled=true;
 if(typeof puter==='undefined'){busy=false;$('send').disabled=false;return alert('AI service load nahi hui (js.puter.com). Internet/VPN check karein aur page refresh karein.')}
 try{if(!puter.auth.isSignedIn())await puter.auth.signIn()}catch(e){busy=false;$('send').disabled=false;return alert('Puter login nahi hua. Popup allow karein aur dobara try karein.')}
 $('q').value='';$('q').style.height='auto';
 if(!hist.length)M.innerHTML='';bub('user',q);hist.push({role:'user',content:q});const b=bub('assistant','');let full='',err='';pet('think');
 for(const mdl of ['claude-sonnet-4-5','claude-sonnet-4','gpt-4o-mini']){
  try{const r=await puter.ai.chat([SYS,...hist.slice(-20)],{model:mdl,stream:true});
   for await(const p of r){if(!full&&p?.text)pet('talk');full+=p?.text||'';b.innerHTML=md(full);M.scrollTop=M.scrollHeight}
   if(full)break}catch(e){err=(e&&(e.message||e.error?.message||JSON.stringify(e)))||String(e);if(full)break}}
 if(full){mood(q,full);hist.push({role:'assistant',content:full});acts(b,full);save()}
 else{pet('sad',4000);b.textContent='AI error: '+String(err||'koi jawab nahi aaya').slice(0,200);hist.pop()}
 busy=false;$('send').disabled=false}
$('send').onclick=ask;$('q').addEventListener('input',()=>pet('listen',1800));$('q').oninput=e=>{e.target.style.height='auto';e.target.style.height=Math.min(e.target.scrollHeight,120)+'px'};
$('q').onkeydown=e=>{if(e.key==='Enter'&&!e.shiftKey&&innerWidth>700){e.preventDefault();ask()}};
$('nc').onclick=()=>{if(busy)return;hist=[];save();welcome();go('chat')};
const PAGE=20,MAXSCAN=300,HIDE_AT=3;let lastDoc=null,more=true,busyL=false;const seenU=new Set(),seenS=new Set();
function fillDL(id,set){const d=$(id);d.innerHTML='';[...set].sort().slice(0,60).forEach(v=>{const o=document.createElement('option');o.value=v;d.append(o)})}
function noteEl(d,x){const e=document.createElement('div');e.className='note';
 e.innerHTML=`<b>${esc(x.title)}</b><small>${esc(x.uni)} • ${esc(x.subject)} • by ${esc(x.author)}</small><p style="white-space:pre-wrap;margin:8px 0">${esc((x.text||'').slice(0,400))}</p>`;
 if(x.fileUrl&&/^https:\/\/firebasestorage\.googleapis\.com\//.test(x.fileUrl)){const a=document.createElement('a');a.href=x.fileUrl;a.target='_blank';a.rel='noopener';a.textContent='📎 '+(x.fileName||'File');e.append(a)}
 if(x.uid===user.uid){
  if((x.reportCount||0)>=HIDE_AT){const w=document.createElement('small');w.textContent=' ⚠️ Reports ki wajah se doosron ko nahi dikh raha';e.append(w)}
  const del=document.createElement('button');del.textContent='Delete';del.style.cssText='float:right;padding:6px 10px';
  del.onclick=async()=>{if(confirm('Delete?')){await db.collection('notes').doc(d.id).delete();load()}};e.append(del)
 }else{
  const rp=document.createElement('button');rp.textContent='⚠️ Report';rp.style.cssText='margin-left:8px;padding:4px 8px;font-size:.8rem;background:none;border:1px solid #555;color:inherit;border-radius:8px';
  rp.onclick=async()=>{if(!confirm('Is note ko report karein? (galat ya copyrighted content)'))return;rp.disabled=true;
   try{const b=db.batch();
    b.set(db.collection('reports').doc(d.id+'_'+user.uid),{noteId:d.id,uid:user.uid,createdAt:firebase.firestore.FieldValue.serverTimestamp()});
    b.update(db.collection('notes').doc(d.id),{reportCount:firebase.firestore.FieldValue.increment(1)});
    await b.commit();rp.textContent='✅ Report ho gayi'}
   catch(err){rp.textContent='Pehle hi report kar chuke hain'}};
  e.append(rp)
 }
 return e}
async function load(reset=true){if(busyL)return;busyL=true;const L=$('list'),B=$('more');B.hidden=true;
 try{
  if(reset){L.textContent='Loading...';lastDoc=null;more=true;seenU.clear();seenS.clear()}
  const u=$('fu').value.trim().toLowerCase(),sb=$('fs').value.trim().toLowerCase(),k=$('s').value.trim().toLowerCase(),active=!!(u||sb||k);
  let shown=0,scanned=0;if(reset)L.innerHTML='';
  while(more&&shown<PAGE&&scanned<MAXSCAN){
   let q=db.collection('notes').orderBy('createdAt','desc').limit(PAGE);if(lastDoc)q=q.startAfter(lastDoc);
   const snap=await q.get();if(snap.empty){more=false;break}
   lastDoc=snap.docs[snap.docs.length-1];scanned+=snap.size;if(snap.size<PAGE)more=false;
   snap.forEach(d=>{const x=d.data(),U=String(x.uni||''),S=String(x.subject||'');
    if(U)seenU.add(U);if(S)seenS.add(S);
    if((x.reportCount||0)>=HIDE_AT&&x.uid!==user.uid)return;
    const h=(String(x.title||'')+' '+S+' '+U).toLowerCase();
    if((u&&!U.toLowerCase().includes(u))||(sb&&!S.toLowerCase().includes(sb))||(k&&!h.includes(k)))return;
    L.append(noteEl(d,x));shown++});
   if(!active)break}
  fillDL('ul',seenU);fillDL('sl',seenS);
  if(reset&&!L.children.length)L.textContent=more?'Abhi koi match nahi mila. "Aur dikhayein" dabayein.':'Koi notes nahi mile.';
  B.hidden=!more
 }catch(e){if(reset)L.textContent='Load error. Dobara try karein.'}
 busyL=false}
$('ld').onclick=()=>load(true);$('more').onclick=()=>load(false);
['s','fu','fs'].forEach(i=>$(i).addEventListener('keydown',e=>{if(e.key==='Enter')load(true)}));
$('pub').onclick=async()=>{const E=$('ue'),t=$('t').value.trim(),un=$('u').value.trim(),sb=$('sb').value.trim(),tx=$('tx').value.trim(),f=$('f').files[0];E.textContent='';
 if(!t||!un||!sb||(!tx&&!f))return E.textContent='Title, university, subject aur notes/file zaroori hain';
 if(!$('ok').checked)return E.textContent='Confirmation tick karein';
 if(f&&(f.size>10*1024*1024||!/^(application\/pdf|image\/)/.test(f.type)))return E.textContent='Sirf PDF/image, max 10MB';
 $('pub').disabled=true;try{let fileUrl='',fileName='';
  if(f){const ref=store.ref(`notes/${user.uid}/${Date.now()}_${f.name.replace(/[^\w.-]/g,'_')}`);await ref.put(f);fileUrl=await ref.getDownloadURL();fileName=f.name}
  await db.collection('notes').add({title:t,uni:un,subject:sb,text:tx,fileUrl,fileName,uid:user.uid,author:(user.email||'student').split('@')[0],createdAt:firebase.firestore.FieldValue.serverTimestamp()});
  E.textContent='✅ Publish ho gaya!';['t','u','sb','tx','f'].forEach(i=>$(i).value='');load()}catch(e){E.textContent='Upload fail ho gaya'}$('pub').disabled=false};

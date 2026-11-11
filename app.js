const $=i=>document.getElementById(i);let user;
const esc=s=>String(s??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
auth.onAuthStateChanged(u=>{if(!u||!(u.emailVerified||u.phoneNumber))return location.href='index.html';user=u;$('who').textContent=u.email||u.phoneNumber;restore();load()});
$('out').onclick=()=>auth.signOut();
function go(v){document.querySelectorAll('nav button,.view').forEach(x=>x.classList.remove('on'));document.querySelector('nav [data-v='+v+']').classList.add('on');$(v).classList.add('on')}
document.querySelectorAll('nav button').forEach(b=>b.onclick=()=>go(b.dataset.v));
const SYS={role:'system',content:'You are CUTE-S AI, a friendly, accurate free study assistant for students. Help only with studies: explain concepts step by step, solve problems, make notes, quizzes and summaries. Use simple markdown (bold, lists, code blocks). Reply in the language the student uses (Urdu, Roman Urdu or English). Politely decline non-study requests.'};
const SG=['Explain OOP concepts with simple examples','Make short exam notes on Pointers in C++','Quiz me with 5 MCQs on Software Engineering','Summarize this topic in Roman Urdu: Database normalization'];
let hist=[],busy=false;const M=$('msgs');
function md(t){let h=esc(t);h=h.replace(/```(\w*)\n?([\s\S]*?)```/g,(_,l,c)=>'<pre><code>'+c+'</code></pre>').replace(/`([^`\n]+)`/g,'<code>$1</code>').replace(/\*\*([^*\n]+)\*\*/g,'<b>$1</b>');return h.replace(/\n/g,'<br>').replace(/<pre><code>([\s\S]*?)<\/code><\/pre>/g,(m)=>m.replace(/<br>/g,'\n'))}
function welcome(){M.innerHTML='<div class="wel"><img src="logo.png" alt=""><h2>Salam! Main CUTE-S AI hoon</h2><p>Aapka free study buddy. Kuch bhi poochhein 💗</p><div class="sg"></div></div>';
 SG.forEach(x=>{const b=document.createElement('button');b.textContent=x;b.onclick=()=>{$('q').value=x;ask()};M.querySelector('.sg').append(b)})}
function bub(role,text){const w=document.createElement('div');w.className='m '+(role==='user'?'u':'a');
 if(role!=='user'){const i=document.createElement('img');i.src='icon.png';i.className='av';w.append(i)}
 const b=document.createElement('div');b.className='b';if(role==='user')b.textContent=text;else b.innerHTML=text?md(text):'<span class="dots"><span></span><span></span><span></span></span>';
 w.append(b);M.append(w);M.scrollTop=M.scrollHeight;return b}
function acts(b,text){const a=document.createElement('div');a.className='act';
 const c=document.createElement('button');c.textContent='📋 Copy';c.onclick=()=>{navigator.clipboard?.writeText(text);c.textContent='✅ Copied'};
 const s=document.createElement('button');s.textContent='💾 Save as note';s.onclick=()=>{$('t').value=(hist.filter(h=>h.role==='user').pop()?.content||'Notes').slice(0,100);$('tx').value=text.slice(0,20000);go('up')};
 a.append(c,s);b.append(a)}
function save(){try{localStorage.setItem('cs_'+user.uid,JSON.stringify(hist.slice(-30)))}catch(e){}}
function restore(){try{hist=JSON.parse(localStorage.getItem('cs_'+user.uid)||'[]')}catch(e){hist=[]}
 if(!hist.length)return welcome();M.innerHTML='';hist.forEach(h=>{const b=bub(h.role,h.content);if(h.role!=='user')acts(b,h.content)})}
async function ask(){const q=$('q').value.trim();if(!q||busy)return;busy=true;$('send').disabled=true;$('q').value='';$('q').style.height='auto';
 if(!hist.length)M.innerHTML='';bub('user',q);hist.push({role:'user',content:q});const b=bub('assistant','');let full='';
 try{const r=await puter.ai.chat([SYS,...hist.slice(-20)],{model:'claude-sonnet-4-5',stream:true});
  for await(const p of r){full+=p?.text||'';b.innerHTML=md(full);M.scrollTop=M.scrollHeight}
  if(!full)throw 0;hist.push({role:'assistant',content:full});acts(b,full);save()}
 catch(e){b.textContent='Kuch masla aa gaya. Internet check karein aur Puter login popup allow karke dobara try karein.';hist.pop()}
 busy=false;$('send').disabled=false}
$('send').onclick=ask;$('q').oninput=e=>{e.target.style.height='auto';e.target.style.height=Math.min(e.target.scrollHeight,120)+'px'};
$('q').onkeydown=e=>{if(e.key==='Enter'&&!e.shiftKey&&innerWidth>700){e.preventDefault();ask()}};
$('nc').onclick=()=>{if(busy)return;hist=[];save();welcome();go('chat')};
async function load(){const L=$('list');L.textContent='Loading...';
 try{let r=db.collection('notes').orderBy('createdAt','desc').limit(100);
  const u=$('fu').value.trim().toLowerCase(),sb=$('fs').value.trim().toLowerCase(),k=$('s').value.trim().toLowerCase();
  const snap=await r.get();L.innerHTML='';let n=0;
  snap.forEach(d=>{const x=d.data(),h=(x.title+x.subject+x.uni).toLowerCase();
   if((u&&!x.uni.toLowerCase().includes(u))||(sb&&!x.subject.toLowerCase().includes(sb))||(k&&!h.includes(k)))return;n++;
   const e=document.createElement('div');e.className='note';
   e.innerHTML=`<b>${esc(x.title)}</b><small>${esc(x.uni)} • ${esc(x.subject)} • by ${esc(x.author)}</small><p style="white-space:pre-wrap;margin:8px 0">${esc((x.text||'').slice(0,400))}</p>`;
   if(x.fileUrl&&/^https:\/\/firebasestorage\.googleapis\.com\//.test(x.fileUrl)){const a=document.createElement('a');a.href=x.fileUrl;a.target='_blank';a.rel='noopener';a.textContent='📎 '+(x.fileName||'File');e.append(a)}
   const rp=document.createElement('a');rp.href='mailto:moonstar7023@gmail.com?subject=Report note '+d.id;rp.textContent='  ⚠️ Report';rp.style.fontSize='.8rem';e.append(rp);
   if(x.uid===user.uid){const del=document.createElement('button');del.textContent='Delete';del.style.cssText='float:right;padding:6px 10px';del.onclick=async()=>{if(confirm('Delete?')){await db.collection('notes').doc(d.id).delete();load()}};e.append(del)}
   L.append(e)});if(!n)L.textContent='Koi notes nahi mile.'}catch(e){L.textContent='Load error'}}
$('ld').onclick=load;
$('pub').onclick=async()=>{const E=$('ue'),t=$('t').value.trim(),un=$('u').value.trim(),sb=$('sb').value.trim(),tx=$('tx').value.trim(),f=$('f').files[0];E.textContent='';
 if(!t||!un||!sb||(!tx&&!f))return E.textContent='Title, university, subject aur notes/file zaroori hain';
 if(!$('ok').checked)return E.textContent='Confirmation tick karein';
 if(f&&(f.size>10*1024*1024||!/^(application\/pdf|image\/)/.test(f.type)))return E.textContent='Sirf PDF/image, max 10MB';
 $('pub').disabled=true;try{let fileUrl='',fileName='';
  if(f){const ref=store.ref(`notes/${user.uid}/${Date.now()}_${f.name.replace(/[^\w.-]/g,'_')}`);await ref.put(f);fileUrl=await ref.getDownloadURL();fileName=f.name}
  await db.collection('notes').add({title:t,uni:un,subject:sb,text:tx,fileUrl,fileName,uid:user.uid,author:(user.email||'student').split('@')[0],createdAt:firebase.firestore.FieldValue.serverTimestamp()});
  E.textContent='✅ Publish ho gaya!';['t','u','sb','tx','f'].forEach(i=>$(i).value='');load()}catch(e){E.textContent='Upload fail ho gaya'}$('pub').disabled=false};

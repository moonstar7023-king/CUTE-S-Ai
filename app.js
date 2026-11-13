const $=i=>document.getElementById(i);let user;
const esc=s=>String(s??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
auth.onAuthStateChanged(u=>{if(!u||!(u.emailVerified||u.phoneNumber))return location.href='index.html';user=u;$('who').textContent=u.email||u.phoneNumber;init();load()});
$('out').onclick=()=>auth.signOut();
function go(v){document.querySelectorAll('nav button,.view').forEach(x=>x.classList.remove('on'));document.querySelector('nav [data-v='+v+']').classList.add('on');$(v).classList.add('on');document.body.dataset.v=v}
document.querySelectorAll('nav button').forEach(b=>b.onclick=()=>go(b.dataset.v));
const SYS={role:'system',content:'You are CUTE-S-AI, a free, friendly AI assistant made for students and open to everyone. Studies come first: explain step by step, make notes, quizzes and summaries, solve problems, and help with exams, assignments and coding. You can also help with everything else a good AI assistant does: poems, stories, translation, emails, advice, ideas and everyday questions. Make every task easy: give clear, simple, well-organised answers and offer a helpful next step. Reply in the language the user uses (Urdu, Roman Urdu or English). Be warm and kind. Never help with anything harmful, illegal, dangerous, hateful or sexual, or anything that could hurt someone; decline politely and suggest a safe alternative. Greet back in the same style: Assalam-o-Alaikum gets Walaikum Assalam, Namashty or Namaste gets Namashty, Hello gets Hello. Never say just Salam.'};
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
let hist=[],busy=false,cid=null,cproj='',projects=[],chats=[],profile={},deep=false,attach=null,inited=false,fproj='';
const M=$('msgs'),UD=()=>db.collection('users').doc(user.uid),TS=()=>firebase.firestore.FieldValue.serverTimestamp();
const VL={en:'en-US',ur:'ur-PK',hi:'hi-IN',ar:'ar-SA',pa:'pa-IN',fa:'fa-IR',bn:'bn-BD',tr:'tr-TR',es:'es-ES',fr:'fr-FR',de:'de-DE',ru:'ru-RU',zh:'zh-CN',ja:'ja-JP',ko:'ko-KR',id:'id-ID'};
function toast(t){const d=document.createElement('div');d.className='toast';d.textContent=t;document.body.append(d);setTimeout(()=>d.remove(),2200)}
function openModal(){$('mo').hidden=false}
function closeModal(){$('mo').hidden=true;$('mc').innerHTML=''}
$('mx').onclick=closeModal;$('mo').addEventListener('click',e=>{if(e.target===$('mo'))closeModal()});

/* ---------- markdown (escaped first, then a small safe subset) ---------- */
function md(t){let h=esc(t);const blocks=[];
 h=h.replace(/```(\w*)\n?([\s\S]*?)```/g,(_,l,c)=>{let o=null;if(l==='chart'){try{const v=chartSvg(JSON.parse(unesc(c)));if(v)o='<div class="chart">'+v+'</div>'}catch(e){}}else if(l==='mermaid')o='<div class="mm" data-src="'+c.trim().replace(/\n/g,'&#10;')+'"><pre><code>'+c+'</code></pre></div>';blocks.push(o||'<pre><code>'+c+'</code></pre>');return '\u0000'+(blocks.length-1)+'\u0000'});
 const inl=s=>s.replace(/\[([^\]\n]+)\]\((https?:\/\/[^)\s]+)\)/g,'<a href="$2" target="_blank" rel="noopener">$1</a>').replace(/`([^`\n]+)`/g,'<code>$1</code>').replace(/\*\*([^*\n]+)\*\*/g,'<b>$1</b>').replace(/(^|[^*])\*([^*\n]+)\*/g,'$1<i>$2</i>');
 const out=[];let list=null;const close=()=>{if(list){out.push('</'+list+'>');list=null}};
 h.split('\n').forEach(line=>{let m;
  if((m=line.match(/^\s*[-*•]\s+(.*)/))){if(list!=='ul'){close();out.push('<ul>');list='ul'}out.push('<li>'+inl(m[1])+'</li>')}
  else if((m=line.match(/^\s*\d+[.)]\s+(.*)/))){if(list!=='ol'){close();out.push('<ol>');list='ol'}out.push('<li>'+inl(m[1])+'</li>')}
  else if((m=line.match(/^\s*#{1,4}\s+(.*)/))){close();out.push('<h4>'+inl(m[1])+'</h4>')}
  else if(/^\u0000\d+\u0000$/.test(line.trim())){close();out.push(line.trim())}
  else if(!line.trim()){close()}
  else{close();out.push('<p>'+inl(line)+'</p>')}});
 close();return out.join('').replace(/\u0000(\d+)\u0000/g,(_,i)=>blocks[i])}

/* ---------- chat bubbles ---------- */
function welcome(){M.innerHTML='<div class="wel"><img src="logo.png?v=2" alt=""><h2>Assalam-o-Alaikum! I am CUTE-S-AI</h2><p>Stuck on a topic? Ask me anything and let us learn together 💗</p><div class="sg"></div></div>';
 SG.forEach(x=>{const b=document.createElement('button');b.textContent=x;b.onclick=()=>{$('q').value=x;ask()};M.querySelector('.sg').append(b)})}
function bub(role,text,shown){const w=document.createElement('div');w.className='m '+(role==='user'?'u':'a');
 if(role!=='user'){const i=document.createElement('img');i.src='icon.png';i.className='av';w.append(i)}
 const b=document.createElement('div');b.className='b';if(role==='user')b.textContent=shown||text;else b.innerHTML=text?md(text):'<div class="ldw"><img class="ld" src="loading.gif" alt=""><span>Please wait...</span></div>';
 w.append(b);M.append(w);M.scrollTop=M.scrollHeight;return b}
const lastQ=()=>{const u=hist.filter(h=>h.role==='user').pop();return ((u&&(u.shown||u.content))||'Notes').split('\n')[0].slice(0,100)};
const titleOf=t=>String(t).replace(/[#*`_>-]/g,'').trim().split('\n')[0].slice(0,60)||'Untitled';
function acts(b,text){const a=document.createElement('div');a.className='act';
 const mk=(t,fn)=>{const x=document.createElement('button');x.textContent=t;x.onclick=()=>fn(x);a.append(x)};
 mk('📋 Copy',x=>{navigator.clipboard?.writeText(text);x.textContent='✅ Copied'});
 mk('🔊 Listen',x=>speak(text,x));
 mk('📝 Notes',()=>gen('summary',text));mk('❓ Quiz',()=>gen('quiz',text));mk('🃏 Cards',()=>gen('cards',text));
 mk('📚 Save',x=>saveLib({type:'note',title:titleOf(text),content:text},x));
 if(/```html/i.test(text))mk('▶ Preview',()=>preview(text));
 mk('⬇️ Export',()=>exportMenu(text));
 mk('📤 Share',()=>{$('t').value=lastQ();$('tx').value=text.slice(0,20000);go('up')});
 b.append(a)}

/* ---------- AI helpers (Puter.js) ---------- */
async function puterReady(){
 if(typeof puter==='undefined'){alert('The AI could not load. Check your internet or VPN, then refresh the page.');return false}
 try{if(!puter.auth.isSignedIn())await puter.auth.signIn()}catch(e){alert('Please sign in to Puter to use the AI. Allow popups and try again.');return false}
 return true}
async function aiCall(msgs,onTxt){let full='',err='';
 for(const mdl of ['claude-sonnet-4-5','claude-sonnet-4','gpt-4o-mini']){
  try{const r=await puter.ai.chat(msgs,{model:mdl,stream:true});
   for await(const p of r){full+=p?.text||'';if(onTxt)onTxt(full)}
   if(full)break}catch(e){err=(e&&(e.message||e.error?.message||JSON.stringify(e)))||String(e);if(full)break}}
 return {full,err}}
function sysMsg(){let c=SYS.content;const p=profile;
 const pf=[p.cls&&'level/class: '+p.cls,p.subj&&'subjects: '+p.subj,p.goal&&'goals: '+p.goal].filter(Boolean);
 if(pf.length)c+='\nStudent profile: '+pf.join('; ')+'. Adapt difficulty and examples to it.';
 const pr=projects.find(x=>x.id===cproj);
 if(pr)c+='\nCurrent project: "'+pr.name+'". Student notes about it: '+(pr.ctx||'none')+'. Keep answers relevant to this project.';
 if(deep)c+='\nDeep mode is ON: reason step by step, double-check calculations and facts, then give a clear final answer.';
 if(SET.lang!=='auto')c+='\nAlways reply in '+LN[SET.lang]+', whatever language the student writes in.';else c+='\nYou understand every language in the world. Reply in the language the student writes in.';
 c+='\nWhen a chart helps, add a fenced block named chart with JSON like {"type":"bar","title":"T","labels":["A","B"],"values":[1,2]} (type bar, line or pie). For diagrams use a mermaid block. For a small web page or app give one complete html block. For spreadsheet data, calculate carefully and show your working.';
 return {role:'system',content:c+extra}}

/* ---------- send a message ---------- */
async function ask(){const q=$('q').value.trim();if((!q&&!attach)||busy)return;
 if(!attach&&isImg(q)){$('q').value='';$('q').style.height='auto';return chatImage(q)}
 let content=q,shown=q;
 if(attach){content=(q||'Summarize this file for me.')+'\n\n[Attached file: '+attach.name+']\n'+attach.text;shown=(q||'Summarize this file')+'\n📎 '+attach.name;clearAttach()}
 $('q').value='';$('q').style.height='auto';await run(content,shown)}
async function run(content,shown){busy=true;$('send').disabled=true;
 if(!await puterReady()){busy=false;$('send').disabled=false;return}
 if(!hist.length)M.innerHTML='';
 bub('user',content,shown);hist.push({role:'user',content,shown:shown||''});
 const b=bub('assistant','');pet('think');let started=false;
 const src=await gather(shown||content);extra=src.length?'\nSources (use when helpful, cite as [1], [2]):\n'+src.map((s,i)=>'['+(i+1)+'] '+s.title+': '+s.text.slice(0,900)).join('\n'):'';
 const send=hist.slice(-20).map((h,i,a)=>({role:h.role,content:i<a.length-2?h.content.slice(0,4000):h.content}));
 const {full,err}=await aiCall([sysMsg(),...send],t=>{if(!started){started=true;pet('talk')}b.innerHTML=md(t);M.scrollTop=M.scrollHeight});
 extra='';
 if(full){let fin=full;const ls=src.filter(s=>s.url);if(ls.length){fin+='\n\n**Sources:** '+ls.map(s=>'['+s.title.replace(/[\[\]]/g,'')+']('+s.url+')').join(' · ');b.innerHTML=md(fin)}mood(shown||content,fin);hist.push({role:'assistant',content:fin});acts(b,fin);rich(b);saveChat()}
 else{pet('sad',4000);b.textContent='Something went wrong. Please try again. ('+String(err||'no response').slice(0,150)+')';hist.pop()}
 busy=false;$('send').disabled=false}
$('send').onclick=ask;$('q').addEventListener('input',()=>pet('listen',1800));
$('q').oninput=e=>{e.target.style.height='auto';e.target.style.height=Math.min(e.target.scrollHeight,120)+'px'};
$('q').onkeydown=e=>{if(e.key==='Enter'&&!e.shiftKey&&innerWidth>700){e.preventDefault();ask()}};

/* ---------- chat history (private, per user) ---------- */
async function saveChat(){if(!hist.length)return;
 if(!cid)cid=UD().collection('chats').doc().id;
 const msgs=hist.slice(-40).map((h,i,a)=>({role:h.role,content:h.content.slice(0,i<a.length-4?3000:14000),shown:(h.shown||'').slice(0,500)}));
 const first=hist.find(h=>h.role==='user');const title=((first&&(first.shown||first.content))||'Chat').split('\n')[0].slice(0,60);
 try{const ref=UD().collection('chats').doc(cid),b=db.batch();
  b.set(ref,{title,project:cproj,updatedAt:TS()});b.set(ref.collection('msgs').doc('main'),{messages:msgs});await b.commit()}catch(e){toast('Could not save this chat.')}}
async function loadChats(){try{const s=await UD().collection('chats').orderBy('updatedAt','desc').limit(60).get();chats=s.docs.map(d=>({id:d.id,...d.data()}))}catch(e){chats=[]}}
function newChat(){if(busy)return;hist=[];cid=null;clearAttach();welcome();chip();go('chat')}
$('nc').onclick=newChat;
async function openChat(id){if(busy)return;M.innerHTML='<div class="ldw" style="padding:14px"><span>Please wait...</span></div>';go('chat');
 try{const d=await UD().collection('chats').doc(id).collection('msgs').doc('main').get();const meta=chats.find(c=>c.id===id)||{};
  hist=((d.data()||{}).messages||[]).map(m=>({role:m.role,content:m.content,shown:m.shown||''}));cid=id;cproj=meta.project||'';chip();
  M.innerHTML='';if(!hist.length)return welcome();
  hist.forEach(h=>{const b=bub(h.role,h.content,h.shown);if(h.role!=='user'){acts(b,h.content);rich(b)}})}
 catch(e){M.textContent='Could not open this chat.'}}
async function delChat(id){try{const ref=UD().collection('chats').doc(id),b=db.batch();b.delete(ref.collection('msgs').doc('main'));b.delete(ref);await b.commit()}catch(e){toast('Could not delete.');return}
 chats=chats.filter(c=>c.id!==id);if(id===cid)newChat()}
function closeDrawer(){$('dr').hidden=true}
async function openDrawer(){$('dr').hidden=false;$('dl').textContent='Please wait...';await loadChats();renderDrawer()}
function renderDrawer(){const J=$('dj');J.innerHTML='';
 const chipB=(t,v)=>{const b=document.createElement('button');b.className='chip'+(fproj===v?' on':'');b.textContent=t;b.onclick=()=>{fproj=v;renderDrawer()};J.append(b)};
 chipB('All','');projects.forEach(p=>chipB('📁 '+p.name,p.id));
 const L=$('dl');L.innerHTML='';const list=chats.filter(c=>!fproj||c.project===fproj);
 if(!list.length){L.textContent='No chats here yet. Start one 💗';return}
 list.forEach(c=>{const r=document.createElement('div');r.className='ci'+(c.id===cid?' on':'');
  const pn=(projects.find(p=>p.id===c.project)||{}).name;const dt=c.updatedAt&&c.updatedAt.toDate?c.updatedAt.toDate().toLocaleDateString():'';
  r.innerHTML='<div><b>'+esc(c.title)+'</b><small>'+(pn?'📁 '+esc(pn)+' · ':'')+esc(dt)+'</small></div>';
  r.firstChild.onclick=()=>{closeDrawer();openChat(c.id)};
  const d=document.createElement('button');d.className='d';d.textContent='🗑';d.onclick=async e=>{e.stopPropagation();if(!confirm('Delete this chat?'))return;await delChat(c.id);renderDrawer()};
  r.append(d);L.append(r)})}
$('hb').onclick=openDrawer;$('dx').onclick=closeDrawer;$('dbg').onclick=closeDrawer;

/* ---------- projects ---------- */
async function loadProjects(){try{const s=await UD().collection('projects').orderBy('createdAt').get();projects=s.docs.map(d=>({id:d.id,...d.data()}))}catch(e){projects=[]}}
function chip(){const p=projects.find(x=>x.id===cproj);$('pj').textContent='📁 '+(p?p.name:'No project')}
function setProj(id){cproj=id;chip();if(hist.length)saveChat()}
async function newProj(){const n=(prompt('Project name (for example: Software Engineering)')||'').trim().slice(0,40);if(!n)return;
 const ctx=(prompt('What should I know about it? (exam date, topics, teacher style). Optional.')||'').trim().slice(0,400);
 try{const r=await UD().collection('projects').add({name:n,ctx,createdAt:TS()});projects.push({id:r.id,name:n,ctx});setProj(r.id);closeModal();toast('Project created 📁')}catch(e){toast('Could not create the project.')}}
async function editProj(){const p=projects.find(x=>x.id===cproj);if(!p)return;
 const n=(prompt('Project name',p.name)||'').trim().slice(0,40);if(!n)return;const ctx=(prompt('Notes about this project',p.ctx||'')||'').trim().slice(0,400);
 try{await UD().collection('projects').doc(p.id).update({name:n,ctx});p.name=n;p.ctx=ctx;chip();closeModal();toast('Project updated')}catch(e){toast('Could not update.')}}
async function delProj(){const p=projects.find(x=>x.id===cproj);if(!p||!confirm('Delete project "'+p.name+'"? Its chats are kept.'))return;
 try{await UD().collection('projects').doc(p.id).delete();projects=projects.filter(x=>x.id!==p.id);setProj('');closeModal()}catch(e){toast('Could not delete.')}}
$('pj').onclick=()=>{const c=$('mc');c.innerHTML='<h3>📁 Projects</h3><div id="m_pl"></div>';const L=$('m_pl');
 const add=(t,fn,cls)=>{const b=document.createElement('button');b.className='mi '+(cls||'');b.textContent=t;b.onclick=fn;L.append(b)};
 add('No project',()=>{setProj('');closeModal()},!cproj?'on':'');
 projects.forEach(p=>add('📁 '+p.name,()=>{setProj(p.id);closeModal()},cproj===p.id?'on':''));
 add('＋ New project',newProj,'ac');if(cproj){add('✏️ Edit this project',editProj,'ac');add('🗑 Delete this project',delProj,'ac')}openModal()};

/* ---------- deep mode ---------- */
function chipDeep(){$('dp').textContent='🧠 Deep: '+(deep?'on':'off');$('dp').classList.toggle('on',deep)}
$('dp').onclick=()=>{deep=!deep;try{localStorage.setItem('cs_deep',deep?'1':'0')}catch(e){}chipDeep();toast(deep?'Deep mode on: step-by-step answers':'Deep mode off')};

/* ---------- attach a file (PDF / image / text) ---------- */
function showAttach(name,st){const A=$('ap');A.hidden=false;A.innerHTML='';
 const s=document.createElement('span');s.textContent='📎 '+name.slice(0,26)+' · '+st;A.append(s);
 if(attach)[['📝 Notes','summary'],['❓ Quiz','quiz'],['🃏 Cards','cards']].forEach(([t,k])=>{const b=document.createElement('button');b.className='chip';b.textContent=t;b.onclick=()=>gen(k,attach.text);A.append(b)});
 const x=document.createElement('button');x.className='chip';x.textContent='✕';x.onclick=clearAttach;A.append(x)}
function clearAttach(){attach=null;$('ap').hidden=true;$('ap').innerHTML=''}
function loadScript(src){return new Promise((ok,no)=>{const s=document.createElement('script');s.src=src;s.onload=ok;s.onerror=()=>no(new Error('Could not load the PDF reader. Check your internet.'));document.head.append(s)})}
async function pdfText(f){
 if(!window.pdfjsLib){await loadScript('https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf.min.js');pdfjsLib.GlobalWorkerOptions.workerSrc='https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf.worker.min.js'}
 const doc=await pdfjsLib.getDocument({data:await f.arrayBuffer()}).promise;let t='';
 for(let i=1;i<=Math.min(doc.numPages,40)&&t.length<14000;i++){const pg=await doc.getPage(i);const c=await pg.getTextContent();t+=c.items.map(x=>x.str).join(' ')+'\n'}
 return t}
async function imgText(f){if(!await puterReady())throw new Error('Please sign in to Puter to read images.');
 if(!puter.ai||!puter.ai.img2txt)throw new Error('Reading images is not available right now.');
 const r=await puter.ai.img2txt(f);return typeof r==='string'?r:(r&&r.text)||''}
$('at').onclick=()=>$('af').click();
$('af').onchange=async e=>{const f=e.target.files[0];e.target.value='';if(!f)return;
 if(f.size>10*1024*1024)return alert('This file is too large. Maximum is 10 MB.');
 attach=null;showAttach(f.name,'reading...');
 try{let text='';
  if(f.type==='application/pdf')text=await pdfText(f);
  else if(f.type.startsWith('image/'))text=await imgText(f);
  else if(f.type.startsWith('text/')||/\.(txt|md)$/i.test(f.name))text=await f.text();
  else if(/\.(csv|xlsx|xls)$/i.test(f.name))text=await sheetText(f);
  else throw new Error('Please choose a PDF, image, text, CSV or Excel file.');
  text=text.trim();if(!text)throw new Error('No readable text found in this file.');
  attach={name:f.name,text:text.slice(0,12000)};if(/\.(csv|xlsx|xls)$/i.test(f.name)&&!$('q').value)$('q').value='Analyze this data: key numbers, trends and a chart.';showAttach(f.name,text.length>12000?'first part used':'ready')}
 catch(x){clearAttach();alert(x.message||'Could not read this file.')}};

/* ---------- voice in / out ---------- */
const SR=window.SpeechRecognition||window.webkitSpeechRecognition;let rec=null;
$('mic').onclick=()=>{if(!SR)return alert('Voice input is not supported in this browser. Try Chrome.');
 if(rec){rec.stop();return}
 rec=new SR();rec.lang=VL[profile.vlang]||'en-US';rec.interimResults=true;rec.continuous=false;const base=$('q').value;
 rec.onresult=e=>{let t='';for(const r of e.results)t+=r[0].transcript;$('q').value=(base?base+' ':'')+t;$('q').dispatchEvent(new Event('input'))};
 rec.onend=()=>{rec=null;$('mic').classList.remove('on')};rec.onerror=()=>{};
 $('mic').classList.add('on');try{rec.start()}catch(e){rec=null;$('mic').classList.remove('on')}};
function speak(text,btn){if(!window.speechSynthesis)return alert('Voice output is not supported here.');
 if(speechSynthesis.speaking){speechSynthesis.cancel();if(btn)btn.textContent='🔊 Listen';return}
 const clean=text.replace(/```[\s\S]*?```/g,' code block ').replace(/[*#`_>|-]/g,' ').replace(/\s+/g,' ').slice(0,3500);
 const u=new SpeechSynthesisUtterance(clean);u.lang=VL[profile.vlang]||'en-US';u.onend=()=>{if(btn)btn.textContent='🔊 Listen'};
 if(btn)btn.textContent='⏹ Stop';speechSynthesis.speak(u)}

/* ---------- study tools: notes, quiz, flashcards ---------- */
function parseJ(s,kind){const m=s.match(/\[[\s\S]*\]/);if(!m)return null;let a;try{a=JSON.parse(m[0])}catch(e){return null}
 if(!Array.isArray(a))return null;
 a=kind==='cards'?a.filter(x=>x&&typeof x.q==='string'&&typeof x.a==='string')
  :a.filter(x=>x&&typeof x.q==='string'&&Array.isArray(x.o)&&x.o.length>=2&&Number.isInteger(x.a)&&x.a>=0&&x.a<x.o.length).map(x=>({q:x.q,o:x.o.map(String),a:x.a,why:String(x.why||'')}));
 return a.length?a:null}
const GP={summary:'Turn the material below into short, exam-ready study notes: key points as bullets, important terms in bold, and a 3-line recap at the end.',
 cards:'Create 8 to 12 flashcards from the material below. Reply with ONLY a JSON array and no other text, like [{"q":"question","a":"short answer"}].',
 quiz:'Create a 6-question multiple-choice quiz from the material below. Reply with ONLY a JSON array and no other text, like [{"q":"question","o":["option A","option B","option C","option D"],"a":0,"why":"one-line explanation"}], where a is the index of the correct option.'};
async function gen(kind,text){
 $('mc').innerHTML='<div class="ldw" style="padding:20px 0"><img class="ld" src="loading.gif" alt=""><span>Please wait...</span></div>';openModal();
 if(!await puterReady()){closeModal();return}
 const {full}=await aiCall([{role:'system',content:'You are a precise study assistant. Follow the requested output format exactly. Write in the same language as the material.'},{role:'user',content:GP[kind]+'\n\nMaterial:\n'+text.slice(0,12000)}]);
 if(!full){$('mc').innerHTML='<p class="err">Could not create it. Please try again.</p>';return}
 const title=({summary:'Study notes',quiz:'Quiz',cards:'Flashcards'})[kind]+': '+titleOf(text);
 if(kind==='summary')return showText(title,full,'summary',true);
 const arr=parseJ(full,kind);
 if(!arr){$('mc').innerHTML='<p class="err">The AI answered in the wrong format. Please tap again.</p>';return}
 kind==='quiz'?showQuiz(arr,title,true):showCards(arr,title,true)}
function showText(title,content,type,canSave){const c=$('mc');c.innerHTML='<h3></h3><div class="b" style="max-width:100%"></div><div class="act"></div>';
 c.querySelector('h3').textContent=title;c.querySelector('.b').innerHTML=md(content);rich(c);const a=c.querySelector('.act');
 const cp=document.createElement('button');cp.textContent='📋 Copy';cp.onclick=()=>{navigator.clipboard?.writeText(content);cp.textContent='✅ Copied'};a.append(cp);
 if(canSave){const s=document.createElement('button');s.textContent='📚 Save';s.onclick=()=>saveLib({type,title,content},s);a.append(s)}openModal()}
function showCards(cards,title,canSave){const c=$('mc');let i=0,flip=false;
 c.innerHTML='<h3>🃏 Flashcards</h3><p class="qw">Tap the card to flip it.</p><div class="fc" id="m_fc"></div><div class="fn"><button id="m_p">‹</button><span id="m_i"></span><button id="m_n">›</button></div>'+(canSave?'<button class="pb" id="m_s">📚 Save to library</button>':'');
 const draw=()=>{$('m_fc').textContent=flip?cards[i].a:cards[i].q;$('m_fc').dataset.s=flip?'a':'q';$('m_i').textContent=(i+1)+' / '+cards.length};
 $('m_fc').onclick=()=>{flip=!flip;draw()};$('m_p').onclick=()=>{i=(i+cards.length-1)%cards.length;flip=false;draw()};$('m_n').onclick=()=>{i=(i+1)%cards.length;flip=false;draw()};
 if(canSave)$('m_s').onclick=e=>saveLib({type:'cards',title,content:JSON.stringify(cards)},e.target);draw();openModal()}
function showQuiz(qs,title,canSave){const c=$('mc');let i=0,score=0;
 const draw=()=>{
  if(i>=qs.length){c.innerHTML='<h3>Quiz finished 🎉</h3><p class="sc">'+score+' / '+qs.length+'</p><button class="pb" id="m_a">Try again</button>'+(canSave?'<button class="pb" id="m_s">📚 Save to library</button>':'');
   $('m_a').onclick=()=>{i=0;score=0;draw()};if(canSave)$('m_s').onclick=e=>saveLib({type:'quiz',title,content:JSON.stringify(qs)},e.target);return}
  const q=qs[i];let done=false;
  c.innerHTML='<h3>❓ Question '+(i+1)+' of '+qs.length+'</h3><p class="qq"></p><div class="qo"></div><p class="qw" hidden></p><button class="pb" id="m_x" hidden>Next</button>';
  c.querySelector('.qq').textContent=q.q;const qo=c.querySelector('.qo');
  q.o.forEach((o,k)=>{const b=document.createElement('button');b.textContent=o;b.onclick=()=>{if(done)return;done=true;
   if(k===q.a){score++;b.classList.add('ok')}else{b.classList.add('no');qo.children[q.a].classList.add('ok')}
   const w=c.querySelector('.qw');if(q.why){w.textContent=q.why;w.hidden=false}$('m_x').hidden=false;$('m_x').textContent=i===qs.length-1?'See score':'Next'};qo.append(b)});
  $('m_x').onclick=()=>{i++;draw()}};
 draw();openModal()}

/* ---------- library (saved items) ---------- */
async function saveLib(it,btn){try{await UD().collection('saved').add({type:it.type,title:String(it.title||'Untitled').slice(0,80),content:String(it.content).slice(0,30000),createdAt:TS()});if(btn&&btn.tagName)btn.textContent='✅ Saved';toast('Saved to your library 📚')}catch(e){toast('Could not save. Try again.')}}
function openLib(x){try{if(x.type==='cards')return showCards(JSON.parse(x.content),x.title,false);if(x.type==='quiz')return showQuiz(JSON.parse(x.content),x.title,false)}catch(e){}showText(x.title,x.content,x.type,false)}
async function loadLib(){const L=$('lbl');L.textContent='Please wait...';
 try{const s=await UD().collection('saved').orderBy('createdAt','desc').limit(50).get();L.innerHTML='';
  if(s.empty){L.textContent='Nothing saved yet. Tap 📚 Save under any answer.';return}
  s.forEach(d=>{const x=d.data(),e=document.createElement('div');e.className='note';
   const ic={note:'📝',summary:'📝',cards:'🃏',quiz:'❓'}[x.type]||'📝';e.innerHTML='<b>'+ic+' '+esc(x.title)+'</b>';
   const r=document.createElement('div');r.className='act';
   const o=document.createElement('button');o.textContent='Open';o.onclick=()=>openLib(x);
   const del=document.createElement('button');del.textContent='Delete';del.onclick=async()=>{if(confirm('Delete this item?')){await UD().collection('saved').doc(d.id).delete();loadLib()}};
   r.append(o,del);e.append(r);L.append(e)})}
 catch(e){L.textContent='Could not load your library.'}}
document.querySelector('nav [data-v=me]').addEventListener('click',loadLib);

/* ---------- profile (memory) ---------- */
function fillProfile(){$('pcl').value=profile.cls||'';$('psb').value=profile.subj||'';$('pgl').value=profile.goal||'';$('pvl').value=profile.vlang||'en'}
$('psv').onclick=async()=>{profile={cls:$('pcl').value.trim().slice(0,100),subj:$('psb').value.trim().slice(0,150),goal:$('pgl').value.trim().slice(0,150),vlang:$('pvl').value};
 try{await UD().set(profile,{merge:true});toast('Profile saved 💗')}catch(e){toast('Could not save. Try again.')}};

/* ---------- start ---------- */
async function init(){if(inited)return;inited=true;welcome();
 try{const p=await UD().get();profile=p.exists?p.data():{}}catch(e){profile={}}
 fillProfile();try{deep=localStorage.getItem('cs_deep')==='1'}catch(e){}chipDeep();
 await loadProjects();chip();
 try{const old=JSON.parse(localStorage.getItem('cs_'+user.uid)||'[]');
  if(old.length){hist=old.map(h=>({role:h.role,content:h.content,shown:''}));await saveChat();localStorage.removeItem('cs_'+user.uid);hist=[];cid=null}}catch(e){}}
const PAGE=20,MAXSCAN=300,HIDE_AT=3;let lastDoc=null,more=true,busyL=false;const seenU=new Set(),seenS=new Set();
function fillDL(id,set){const d=$(id);d.innerHTML='';[...set].sort().slice(0,60).forEach(v=>{const o=document.createElement('option');o.value=v;d.append(o)})}
function noteEl(d,x){const e=document.createElement('div');e.className='note';
 e.innerHTML=`<b>${esc(x.title)}</b><small>${esc(x.uni)} • ${esc(x.subject)} • by ${esc(x.author)}</small><p style="white-space:pre-wrap;margin:8px 0">${esc((x.text||'').slice(0,400))}</p>`;
 if(x.fileUrl&&/^https:\/\/firebasestorage\.googleapis\.com\//.test(x.fileUrl)){const a=document.createElement('a');a.href=x.fileUrl;a.target='_blank';a.rel='noopener';a.textContent='📎 '+(x.fileName||'File');e.append(a)}
 if(x.uid===user.uid){
  if((x.reportCount||0)>=HIDE_AT){const w=document.createElement('small');w.textContent=' ⚠️ Hidden from others after reports';e.append(w)}
  const del=document.createElement('button');del.textContent='Delete';del.style.cssText='float:right;padding:6px 10px';
  del.onclick=async()=>{if(confirm('Delete this note?')){await db.collection('notes').doc(d.id).delete();load()}};e.append(del)
 }else{
  const rp=document.createElement('button');rp.textContent='⚠️ Report';rp.style.cssText='margin-left:8px;padding:4px 8px;font-size:.8rem;background:none;border:1px solid #555;color:inherit;border-radius:8px';
  rp.onclick=async()=>{if(!confirm('Report this note for wrong or copyrighted content?'))return;rp.disabled=true;
   try{const b=db.batch();
    b.set(db.collection('reports').doc(d.id+'_'+user.uid),{noteId:d.id,uid:user.uid,createdAt:firebase.firestore.FieldValue.serverTimestamp()});
    b.update(db.collection('notes').doc(d.id),{reportCount:firebase.firestore.FieldValue.increment(1)});
    await b.commit();rp.textContent='✅ Reported, thank you'}
   catch(err){rp.textContent='Already reported'}};
  e.append(rp)
 }
 return e}
async function load(reset=true){if(busyL)return;busyL=true;const L=$('list'),B=$('more');B.hidden=true;
 try{
  if(reset){L.textContent='Loading notes...';lastDoc=null;more=true;seenU.clear();seenS.clear()}
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
  if(reset&&!L.children.length)L.textContent=more?'No match yet. Tap "Show more" to keep searching.':'No notes found yet. Be the first to share one 💗';
  B.hidden=!more
 }catch(e){if(reset)L.textContent='Could not load notes. Please try again.'}
 busyL=false}
$('ld').onclick=()=>load(true);$('more').onclick=()=>load(false);
['s','fu','fs'].forEach(i=>$(i).addEventListener('keydown',e=>{if(e.key==='Enter')load(true)}));
$('pub').onclick=async()=>{const E=$('ue'),t=$('t').value.trim(),un=$('u').value.trim(),sb=$('sb').value.trim(),tx=$('tx').value.trim(),f=$('f').files[0];E.textContent='';
 if(!t||!un||!sb||(!tx&&!f))return E.textContent='Please add a title, university, subject, and your notes or a file.';
 if(!$('ok').checked)return E.textContent='Please tick the box to confirm.';
 if(f&&(f.size>10*1024*1024||!/^(application\/pdf|image\/)/.test(f.type)))return E.textContent='Only PDF or image files up to 10 MB.';
 $('pub').disabled=true;try{let fileUrl='',fileName='';
  if(f){const ref=store.ref(`notes/${user.uid}/${Date.now()}_${f.name.replace(/[^\w.-]/g,'_')}`);await ref.put(f);fileUrl=await ref.getDownloadURL();fileName=f.name}
  await db.collection('notes').add({title:t,uni:un,subject:sb,text:tx,fileUrl,fileName,uid:user.uid,author:(user.email||'student').split('@')[0],createdAt:firebase.firestore.FieldValue.serverTimestamp()});
  E.textContent='✅ Published! Thank you for sharing 💗';['t','u','sb','tx','f'].forEach(i=>$(i).value='');load()}catch(e){E.textContent='Upload failed. Please try again.'}$('pub').disabled=false};


/* ---------- settings, search, research, connectors, charts, preview ---------- */
let extra='',SET={fs:'m',lang:'auto',web:false,clib:false,cnotes:false};
try{Object.assign(SET,JSON.parse(localStorage.getItem('cs_set')||'{}'))}catch(e){}
const saveSet=()=>{try{localStorage.setItem('cs_set',JSON.stringify(SET))}catch(e){}};
const unesc=s=>s.replace(/&quot;/g,'"').replace(/&#39;/g,"'").replace(/&lt;/g,'<').replace(/&gt;/g,'>').replace(/&amp;/g,'&');
function applySet(){M.style.zoom={s:.9,m:1,l:1.15}[SET.fs];$('sr').textContent='🔍 Search: '+(SET.web?'on':'off');$('sr').classList.toggle('on',SET.web)}
function chartSvg(s){const L=(s.labels||[]).map(String).slice(0,12),V=(s.values||[]).map(Number).slice(0,12);if(!L.length||L.length!==V.length||V.some(isNaN))return null;
 const W=320,H=200,P=28,mx=Math.max(...V,1),col=['#ff4d5e','#ff8a95','#c9102a','#ffb3bb','#9b0f22','#ff6f7d'];let g='';
 if(s.type==='pie'){const tot=V.reduce((a,b)=>a+b,0)||1;let a0=-Math.PI/2;
  V.forEach((v,i)=>{const a1=a0+Math.min(v/tot,.9999)*2*Math.PI,p=a=>(100+80*Math.cos(a)).toFixed(1)+' '+(100+80*Math.sin(a)).toFixed(1);
   g+='<path d="M100 100L'+p(a0)+'A80 80 0 '+(a1-a0>Math.PI?1:0)+' 1 '+p(a1)+'Z" fill="'+col[i%6]+'"/><rect x="196" y="'+(15+i*16)+'" width="9" height="9" fill="'+col[i%6]+'"/><text x="210" y="'+(24+i*16)+'" fill="#ddd" font-size="11">'+esc(L[i]).slice(0,16)+' ('+V[i]+')</text>';a0=a1})}
 else{const bw=(W-2*P)/L.length,y=v=>H-P-(Math.max(v,0)/mx)*(H-2*P);
  g+='<line x1="'+P+'" y1="'+(H-P)+'" x2="'+(W-P)+'" y2="'+(H-P)+'" stroke="#555"/>';
  if(s.type==='line')g+='<polyline fill="none" stroke="#ff4d5e" stroke-width="2" points="'+V.map((v,i)=>(P+bw*i+bw/2)+','+y(v)).join(' ')+'"/>';
  V.forEach((v,i)=>{const x=P+bw*i;g+=s.type==='line'?'<circle cx="'+(x+bw/2)+'" cy="'+y(v)+'" r="3" fill="#ff4d5e"/>':'<rect x="'+(x+3)+'" y="'+y(v)+'" width="'+(bw-6)+'" height="'+(H-P-y(v))+'" rx="3" fill="#ff4d5e"/>';
   g+='<text x="'+(x+bw/2)+'" y="'+(y(v)-4)+'" fill="#ddd" font-size="9" text-anchor="middle">'+v+'</text><text x="'+(x+bw/2)+'" y="'+(H-P+12)+'" fill="#aaa" font-size="9" text-anchor="middle">'+esc(L[i]).slice(0,8)+'</text>'})}
 return '<svg viewBox="0 0 '+W+' '+H+'" width="100%" role="img">'+(s.title?'<text x="160" y="14" fill="#fff" font-size="12" text-anchor="middle">'+esc(s.title).slice(0,40)+'</text>':'')+g+'</svg>'}
async function rich(root){const n=root.querySelectorAll('.mm');if(!n.length)return;
 try{if(!window.mermaid){await loadScript('https://cdnjs.cloudflare.com/ajax/libs/mermaid/10.9.1/mermaid.min.js');mermaid.initialize({startOnLoad:false,theme:'dark',securityLevel:'strict'})}
  for(const el of n){try{const r=await mermaid.render('mm'+Math.random().toString(36).slice(2),el.dataset.src);el.innerHTML=r.svg}catch(e){}}}catch(e){}}
function preview(text){const m=text.match(/```html\s*\n([\s\S]*?)```/i);if(!m)return;const c=$('mc');
 c.innerHTML='<h3>▶ Preview</h3><iframe sandbox="allow-scripts" style="width:100%;height:60vh;border:0;border-radius:12px;background:#fff"></iframe><div class="act"><button id="m_c">📋 Copy code</button></div>';
 c.querySelector('iframe').srcdoc=m[1];$('m_c').onclick=e=>{navigator.clipboard?.writeText(m[1]);e.target.textContent='✅ Copied'};openModal()}
async function wiki(q,n){const r=await fetch('https://en.wikipedia.org/w/api.php?action=query&format=json&origin=*&generator=search&gsrlimit='+n+'&gsrsearch='+encodeURIComponent(q)+'&prop=extracts|info&exintro=1&explaintext=1&exlimit=max&exchars=1200&inprop=url');
 const j=await r.json();return Object.values((j.query||{}).pages||{}).sort((a,b)=>a.index-b.index).map(x=>({title:x.title,text:x.extract||'',url:x.fullurl||''}))}
function hit(q,arr){const k=q.toLowerCase().split(/\W+/).filter(w=>w.length>3);return arr.filter(a=>k.some(w=>(a.title+' '+a.text).toLowerCase().includes(w))).slice(0,2)}
async function gather(q){const out=[];
 if(SET.web){try{(await wiki(q,3)).forEach(s=>s.text&&out.push(s))}catch(e){}}
 if(SET.clib){try{const s=await UD().collection('saved').orderBy('createdAt','desc').limit(30).get();
  out.push(...hit(q,s.docs.map(d=>d.data()).filter(x=>x.type==='note'||x.type==='summary').map(x=>({title:'My library: '+x.title,text:x.content,url:''}))))}catch(e){}}
 if(SET.cnotes){try{const s=await db.collection('notes').orderBy('createdAt','desc').limit(50).get();
  out.push(...hit(q,s.docs.map(d=>d.data()).filter(x=>(x.reportCount||0)<HIDE_AT&&x.text).map(x=>({title:'Community note: '+x.title,text:x.text,url:''}))))}catch(e){}}
 return out}
async function research(topic){
 const st=t=>{$('mc').innerHTML='<div class="ldw" style="padding:20px 0"><img class="ld" src="loading.gif" alt=""><span>'+esc(t)+'</span></div>'};
 st('Please wait... planning');openModal();if(!await puterReady()){closeModal();return}
 let qs=[topic];const p=await aiCall([{role:'user',content:'Give 3 short Wikipedia search queries to research this topic. Reply ONLY with a JSON array of strings.\nTopic: '+topic}]);
 try{const a=JSON.parse((p.full.match(/\[[\s\S]*\]/)||['[]'])[0]);if(Array.isArray(a)&&a.length)qs=a.slice(0,3).map(String)}catch(e){}
 const src=[];for(const q of qs){st('Searching: '+q);try{for(const s of await wiki(q,2))if(s.text&&!src.some(x=>x.url===s.url))src.push(s)}catch(e){}}
 if(!src.length){$('mc').innerHTML='<p class="err">No sources found. Try different words.</p>';return}
 st('Writing your report...');
 const {full}=await aiCall([{role:'system',content:'You are a careful research assistant. Write a clear study report using ONLY the sources: headings, bullet points, and citations like [1]. Use the same language as the topic.'},{role:'user',content:'Topic: '+topic+'\n\n'+src.map((s,i)=>'['+(i+1)+'] '+s.title+': '+s.text).join('\n\n')}]);
 if(!full){$('mc').innerHTML='<p class="err">Could not write the report. Please try again.</p>';return}
 showText('Research: '+titleOf(topic),full+'\n\n**Sources:** '+src.map((s,i)=>'['+(i+1)+'] ['+s.title.replace(/[\[\]]/g,'')+']('+s.url+')').join(' · '),'summary',true)}
function mi(L,t,fn,cls){const b=document.createElement('button');b.className='mi '+(cls||'');b.textContent=t;b.onclick=fn;L.append(b)}
function connectors(){const c=$('mc');c.innerHTML='<h3>🔌 Connectors</h3><p class="qw">Choose what the AI may read when it answers.</p><div id="m_k"></div><p class="qw">Gmail, Drive and Slack need a server, so they are not available yet.</p>';const L=$('m_k');
 [['web','📖 Wikipedia (web search)'],['clib','📚 My library (saved notes)'],['cnotes','🌐 Community notes']].forEach(([k,t])=>mi(L,(SET[k]?'✅ ':'⬜ ')+t,()=>{SET[k]=!SET[k];saveSet();applySet();connectors()},SET[k]?'on':''));openModal()}
async function wipe(col){try{const s=await UD().collection(col).limit(200).get();for(const d of s.docs){if(col==='chats')await d.ref.collection('msgs').doc('main').delete();await d.ref.delete()}if(col==='chats')newChat();toast('Deleted')}catch(e){toast('Could not delete.')}}
function settings(){const c=$('mc');c.innerHTML='<h3>⚙️ Settings</h3><div id="m_s"></div>';const L=$('m_s');
 mi(L,'🔤 Text size: '+({s:'Small',m:'Medium',l:'Large'})[SET.fs],()=>{SET.fs={s:'m',m:'l',l:'s'}[SET.fs];saveSet();applySet();settings()});
 mi(L,'🌐 Reply language: '+langName(SET.lang),langMenu);
 mi(L,'🧠 Deep mode: '+(deep?'on':'off'),()=>{$('dp').click();settings()});
 mi(L,'🗑 Delete all my chats',async()=>{if(confirm('Delete ALL chats? This cannot be undone.')){await wipe('chats');closeModal()}},'ac');
 mi(L,'🗑 Delete my saved library',async()=>{if(confirm('Delete everything in your library?')){await wipe('saved');closeModal()}},'ac');openModal()}
$('sr').onclick=()=>{SET.web=!SET.web;saveSet();applySet();toast(SET.web?'Web search on (Wikipedia)':'Web search off')};
$('rs').onclick=()=>{const t=$('q').value.trim()||(prompt('What should I research?')||'').trim();if(t){$('q').value='';research(t.slice(0,200))}};
$('cn').onclick=connectors;$('st').onclick=settings;applySet();


/* ---------- image generation, export (PDF/Word/Excel/PowerPoint), spreadsheets ---------- */
const XLS='https://cdnjs.cloudflare.com/ajax/libs/xlsx/0.18.5/xlsx.full.min.js',PPT='https://cdnjs.cloudflare.com/ajax/libs/pptxgenjs/3.12.0/pptxgen.bundle.js';
function dl(blob,name){const a=document.createElement('a');a.href=URL.createObjectURL(blob);a.download=name;document.body.append(a);a.click();setTimeout(()=>{a.remove();URL.revokeObjectURL(a.href)},1500)}
async function sheetText(f){await loadScript(XLS);const wb=XLSX.read(await f.arrayBuffer(),{type:'array'});
 return wb.SheetNames.slice(0,3).map(n=>'Sheet: '+n+'\n'+XLSX.utils.sheet_to_csv(wb.Sheets[n]).split('\n').slice(0,200).join('\n')).join('\n\n')}
const IMG_A=/^(please |plz |ek |mujhe |mujh ko |can you |could you )*(generate|create|make|draw|design|paint|render|sketch)( me| for me)?( an?| the)? .{0,40}?\b(image|picture|photo|logo|poster|wallpaper|sticker|illustration|portrait|painting|drawing|cartoon|anime)\b/i,
 IMG_B=/\b(image|picture|photo|tasveer|tasvir|logo|poster|wallpaper|sticker|cartoon)\b.{0,60}\b(bana|banao|bnao|banaye|banaiye|banado|dikhao)\b/i,
 IMG_C=/(تصویر|فوٹو|لوگو|پوسٹر).{0,40}(بنا)/;
const isImg=q=>q.length<400&&(IMG_A.test(q)||IMG_B.test(q)||IMG_C.test(q)||/^(draw|sketch)\b/i.test(q));
async function chatImage(q){busy=true;$('send').disabled=true;
 if(!await puterReady()){busy=false;$('send').disabled=false;return}
 if(!hist.length)M.innerHTML='';
 bub('user',q,q);hist.push({role:'user',content:q,shown:q});const b=bub('assistant','');pet('think');
 try{let p=q;const r=await aiCall([{role:'user',content:'Turn this request into one detailed English prompt for an image generator. Reply with ONLY the prompt.\nRequest: '+q}]);
  if(r.full&&r.full.length<900)p=r.full.trim();
  const im=await puter.ai.txt2img(p),src=im.src||'';
  b.innerHTML='';const e=document.createElement('img');e.src=src;e.alt='';e.style.cssText='width:100%;border-radius:12px;display:block';b.append(e);
  const a=document.createElement('div');a.className='act';const d=document.createElement('button');d.textContent='⬇️ Download';
  d.onclick=async()=>{try{dl(await(await fetch(src)).blob(),'cute-s-ai.png')}catch(x){window.open(src,'_blank')}};a.append(d);b.append(a);
  hist.push({role:'assistant',content:'🎨 Image created: '+q});pet('happy',3000);M.scrollTop=M.scrollHeight;saveChat()}
 catch(e){b.textContent='Could not create the image. Please try a different description.';hist.pop();pet('sad',3000)}
 busy=false;$('send').disabled=false}
function toPdf(text){const f=document.createElement('iframe');f.style.cssText='position:fixed;width:0;height:0;border:0';document.body.append(f);const d=f.contentWindow.document;
 d.open();d.write('<html><head><meta charset="utf-8"><title>CUTE-S-AI</title><style>body{font-family:Arial,sans-serif;line-height:1.6;padding:24px;color:#000}pre{background:#eee;padding:8px;white-space:pre-wrap}</style></head><body>'+md(text)+'</body></html>');d.close();
 setTimeout(()=>{f.contentWindow.focus();f.contentWindow.print();setTimeout(()=>f.remove(),60000)},400)}
async function toXlsx(text,name){await loadScript(XLS);const rows=[];let t=[];const flush=()=>{if(t.length){rows.push(...t,[]);t=[]}};
 text.split('\n').forEach(l=>{if(/^\s*\|.*\|\s*$/.test(l)){if(/^\s*\|[\s:|-]+\|\s*$/.test(l))return;t.push(l.trim().replace(/^\||\|$/g,'').split('|').map(c=>{c=c.trim();return c!==''&&!isNaN(c)?Number(c):c}))}else flush()});flush();
 if(!rows.length)text.split('\n').filter(l=>l.trim()).forEach(l=>rows.push([l.replace(/[*#`]/g,'')]));
 const wb=XLSX.utils.book_new();XLSX.utils.book_append_sheet(wb,XLSX.utils.aoa_to_sheet(rows),'Sheet1');XLSX.writeFile(wb,name+'.xlsx')}
async function toPptx(text,name){await loadScript(PPT);const p=new PptxGenJS(),secs=[];let cur=null;
 text.split('\n').forEach(l=>{const m=l.match(/^\s*#{1,4}\s+(.*)/);if(m){cur={t:m[1].replace(/[*`]/g,''),b:[]};secs.push(cur)}else if(l.trim()&&!/^```/.test(l.trim())){if(!cur){cur={t:name,b:[]};secs.push(cur)}cur.b.push(l.replace(/^[\s>*•-]+/,'').replace(/^\d+[.)]\s+/,'').replace(/\*\*|`/g,'').trim())}});
 if(!secs.length)throw new Error('empty');
 secs.forEach(s=>{for(let i=0;i<Math.max(1,s.b.length);i+=7){const sl=p.addSlide();sl.background={color:'070707'};
  sl.addText(s.t.slice(0,80),{x:.5,y:.3,w:9,h:.8,fontSize:28,bold:true,color:'FF4D5E'});
  if(s.b.length)sl.addText(s.b.slice(i,i+7).map(x=>({text:x.slice(0,200),options:{bullet:true,breakLine:true}})),{x:.6,y:1.3,w:8.8,h:4,fontSize:18,color:'FFFFFF',valign:'top'})}});
 await p.writeFile({fileName:name+'.pptx'})}
function exportMenu(text){const c=$('mc');c.innerHTML='<h3>⬇️ Download</h3><div id="m_e"></div>';const L=$('m_e'),n=(titleOf(text).replace(/[^\w\u0600-\u06FF -]/g,'').trim().slice(0,40)||'cute-s-ai');
 const go2=fn=>async()=>{try{await fn();toast('Done 💗')}catch(e){alert('Could not create the file. Check your internet and try again.')}};
 mi(L,'📄 PDF (choose Save as PDF)',go2(()=>{closeModal();toPdf(text)}));
 mi(L,'📝 Word (.doc)',go2(()=>dl(new Blob(['\ufeff<html><head><meta charset="utf-8"></head><body>'+md(text)+'</body></html>'],{type:'application/msword'}),n+'.doc')));
 mi(L,'📊 Excel (.xlsx)',go2(()=>toXlsx(text,n)));
 mi(L,'📽 PowerPoint (.pptx)',go2(()=>toPptx(text,n)));
 mi(L,'📃 Text (.txt)',go2(()=>dl(new Blob([text],{type:'text/plain'}),n+'.txt')));openModal()}


/* ---------- languages ---------- */
const LANGS=[['auto','Auto (same as I write)'],['en','English'],['ur','اردو Urdu'],['rur','Roman Urdu'],['hi','हिन्दी Hindi'],['ar','العربية Arabic'],['pa','ਪੰਜਾਬੀ Punjabi'],['sd','سنڌي Sindhi'],['ps','پښتو Pashto'],['fa','فارسی Persian'],['bn','বাংলা Bengali'],['tr','Türkçe Turkish'],['es','Español Spanish'],['fr','Français French'],['de','Deutsch German'],['ru','Русский Russian'],['zh','中文 Chinese'],['ja','日本語 Japanese'],['ko','한국어 Korean'],['id','Bahasa Indonesia']];
const LN={en:'English',ur:'Urdu',rur:'Roman Urdu (Urdu written in English letters)',hi:'Hindi',ar:'Arabic',pa:'Punjabi',sd:'Sindhi',ps:'Pashto',fa:'Persian',bn:'Bengali',tr:'Turkish',es:'Spanish',fr:'French',de:'German',ru:'Russian',zh:'Chinese',ja:'Japanese',ko:'Korean',id:'Indonesian'};
const langName=c=>(LANGS.find(x=>x[0]===c)||LANGS[0])[1];
function langMenu(){const c=$('mc');c.innerHTML='<h3>🌐 Reply language</h3><div id="m_l" style="max-height:60vh;overflow-y:auto"></div>';const L=$('m_l');
 LANGS.forEach(([k,n])=>mi(L,(SET.lang===k?'✅ ':'')+n,()=>{SET.lang=k;saveSet();toast(n);settings()},SET.lang===k?'on':''));openModal()}

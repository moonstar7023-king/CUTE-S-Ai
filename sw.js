const C='cutes-v9',A=['./','index.html','app.html','privacy.html','style.css','app.css','auth.js','app.js','image.js','firebase-config.js','manifest.json','logo.png','icon.png','ic-me.png','wm-ai.png','wm-notes.png','wm-upload.png','loading.gif'];
const X=['www.gstatic.com','cdn.jsdelivr.net','cdnjs.cloudflare.com','fonts.googleapis.com','fonts.gstatic.com'];
self.addEventListener('install',e=>{e.waitUntil(caches.open(C).then(c=>Promise.all(A.map(u=>c.add(u).catch(()=>0)))));self.skipWaiting()});
self.addEventListener('activate',e=>{e.waitUntil(caches.keys().then(k=>Promise.all(k.filter(x=>x!==C).map(x=>caches.delete(x)))));self.clients.claim()});
self.addEventListener('fetch',e=>{const r=e.request,u=new URL(r.url);if(r.method!=='GET')return;const own=u.origin===location.origin;if(!own&&!X.includes(u.hostname))return;
 e.respondWith(fetch(own?new Request(r,{cache:'no-store'}):r).then(x=>{if(x&&(x.ok||x.type==='opaque')){const y=x.clone();caches.open(C).then(c=>c.put(r,y))}return x})
 .catch(()=>caches.match(r,{ignoreSearch:true}).then(m=>m||(r.mode==='navigate'?caches.match('app.html'):undefined))))});

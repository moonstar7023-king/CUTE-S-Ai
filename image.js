/* =====================================================================
   CUTE-S AI - Image Studio  (image.js)
   Loaded after app.js. Provides: isImg(), chatImage(), imStudio(), imGallery()
   Uses globals from app.js: $, M, hist, busy, user, puterReady, aiCall,
   bub, pet, toast, openModal, closeModal, saveChat, dl, go
   ===================================================================== */

/* ---------- options ---------- */
const IM_STYLES = {
  auto:   ['✨ Auto', ''],
  real:   ['📷 Realistic', 'photorealistic, natural lighting, sharp detail'],
  cart:   ['🎨 Cartoon', 'colorful cartoon style, clean outlines'],
  anime:  ['🌸 Anime', 'anime style, vibrant colors, detailed'],
  d3:     ['🧊 3D render', '3D render, soft lighting, Pixar-like'],
  water:  ['🖌 Watercolor', 'soft watercolor painting, paper texture'],
  oil:    ['🖼 Oil painting', 'classic oil painting, rich brush strokes'],
  sketch: ['✏️ Pencil sketch', 'detailed pencil sketch, fine shading'],
  neon:   ['🌃 Neon / Cyberpunk', 'neon cyberpunk, glowing lights, night city'],
  flat:   ['🟦 Flat illustration', 'flat vector illustration, bold shapes, limited palette'],
  edu:    ['📚 Study diagram', 'clean educational diagram, clearly labeled parts, white background'],
  islamic:['🕌 Islamic art', 'elegant islamic geometric art, ornamental patterns'],
  logo:   ['🔷 Logo', 'minimal flat vector logo, clean, centered, plain background'],
  sticker:['🏷 Sticker', 'die-cut sticker, thick white border, vector style'],
  pix:    ['👾 Pixel art', 'pixel art, retro game style']
};
const IM_RATIOS = {
  sq:    ['⬛ Square 1:1', 1, 1, 'square composition'],
  port:  ['📱 Portrait 4:5', 4, 5, 'vertical portrait composition'],
  story: ['📲 Story 9:16', 9, 16, 'tall vertical composition'],
  land:  ['🖥 Wide 16:9', 16, 9, 'wide cinematic composition'],
  photo: ['🖼 Classic 3:2', 3, 2, 'landscape composition']
};
const IM_MODELS = {
  auto:  ['🤖 Auto (recommended)'],
  'gpt-image-1': ['🌟 Best quality (GPT Image)'],
  'dall-e-3': ['🎯 DALL·E 3'],
  'gemini-2.5-flash-image-preview': ['⚡ Gemini Image (also edits photos)']
};
const IM_TEMPLATES = [
  ['📚 Study diagram', 'A clear labeled diagram explaining: '],
  ['🃏 Flashcard art', 'A cute illustration for a flashcard about: '],
  ['🖼 Poster', 'A bold event poster for: '],
  ['🔷 Logo', 'A modern logo for: '],
  ['📱 WhatsApp DP', 'A stylish profile picture of: '],
  ['▶️ YouTube thumbnail', 'An eye-catching YouTube thumbnail about: '],
  ['🎂 Birthday card', 'A beautiful birthday card design for: '],
  ['🌄 Wallpaper', 'A beautiful phone wallpaper of: '],
  ['🏷 Sticker', 'A cute sticker of: ']
];
const IM_IDEAS = [
  'A rabbit studying under a glowing lamp, cozy night room',
  'The solar system as a colorful school poster',
  'A friendly robot teaching math to kids',
  'Lahore Badshahi Mosque at sunset, golden hour',
  'DNA double helix, labeled educational diagram',
  'A futuristic university library with floating books',
  'Mountains of Hunza in autumn, ultra detailed',
  'A cute cat wearing graduation cap, cartoon'
];

/* ---------- detect "make me an image" in chat ---------- */
const IMG_A = /^(please |plz |ek |mujhe |mujh ko |can you |could you )*(generate|create|make|draw|design|paint|render|sketch)( me| for me)?( an?| the)? .{0,40}?\b(image|picture|photo|logo|poster|wallpaper|sticker|illustration|portrait|painting|drawing|cartoon|anime)\b/i,
  IMG_B = /\b(image|picture|photo|tasveer|tasvir|logo|poster|wallpaper|sticker|cartoon)\b.{0,60}\b(bana|banao|bnao|banaye|banaiye|banado|dikhao)\b/i,
  IMG_C = /(تصویر|فوٹو|لوگو|پوسٹر).{0,40}(بنا)/,
  IMG_D = /(बनाओ|बनाइए|बना दो|बनाएं|तस्वीर|ارسم|أنشئ صورة|اصنع صورة|dibuja|genera una imagen|crea una imagen|dessine|génère une image|crée une image|zeichne|erstelle ein bild|buat gambar|resim çiz|нарисуй|создай изображение|画一|生成图片|그려줘|描いて)/i,
  IMG_E = /^(\/image|\/img|imagine)\b/i;
const isImg = q => q.length < 400 && (IMG_A.test(q) || IMG_B.test(q) || IMG_C.test(q) || IMG_D.test(q) || IMG_E.test(q) || /^(draw|sketch)\b/i.test(q));

/* ---------- saved settings ---------- */
let IMS = { style: 'auto', ratio: 'sq', model: 'auto', n: 1, enh: true, wm: false };
try { Object.assign(IMS, JSON.parse(localStorage.getItem('cs_img') || '{}')); } catch (e) {}
const imSaveSet = () => { try { localStorage.setItem('cs_img', JSON.stringify(IMS)); } catch (e) {} };

/* ---------- tiny DOM helper ---------- */
const el = (t, p, ...k) => {
  const e = document.createElement(t);
  if (p) for (const x in p) {
    if (x === 'css') e.style.cssText = p[x];
    else if (x === 'on') for (const ev in p.on) e.addEventListener(ev, p.on[ev]);
    else e[x] = p[x];
  }
  k.flat().forEach(n => e.append(n));
  return e;
};

/* ---------- private gallery (IndexedDB, this device only, per user) ---------- */
const IDB = {
  db: null,
  open() {
    return new Promise((ok, no) => {
      if (this.db) return ok(this.db);
      const r = indexedDB.open('cute-s-img', 1);
      r.onupgradeneeded = () => r.result.createObjectStore('imgs', { keyPath: 'id' });
      r.onsuccess = () => { this.db = r.result; ok(r.result); };
      r.onerror = () => no(r.error);
    });
  },
  async run(mode, fn) {
    const d = await this.open();
    return new Promise((ok, no) => {
      const t = d.transaction('imgs', mode), s = t.objectStore('imgs'), r = fn(s);
      t.oncomplete = () => ok(r && r.result);
      t.onerror = () => no(t.error);
    });
  }
};
const imAll = async () => ((await IDB.run('readonly', s => s.getAll())) || []).filter(r => r.uid === (user && user.uid)).sort((a, b) => b.ts - a.ts);
const imPut = rec => IDB.run('readwrite', s => s.put(rec));
const imDel = id => IDB.run('readwrite', s => s.delete(id));
async function imSave(rec) {
  try {
    await imPut(rec);
    const all = await imAll();
    for (const r of all.filter(x => !x.fav).slice(40)) await imDel(r.id); // keep newest 40 (+ all favourites)
  } catch (e) {}
}

/* ---------- canvas helpers ---------- */
async function imFinish(blob, ratio, wm) {
  try {
    const bm = await createImageBitmap(blob), tr = ratio[1] / ratio[2], cr = bm.width / bm.height;
    let sx = 0, sy = 0, sw = bm.width, sh = bm.height;
    if (Math.abs(cr - tr) / tr > 0.03) { // center-crop to the chosen ratio
      if (cr > tr) { sw = Math.round(bm.height * tr); sx = Math.round((bm.width - sw) / 2); }
      else { sh = Math.round(bm.width / tr); sy = Math.round((bm.height - sh) / 2); }
    }
    const k = Math.min(1, 2048 / Math.max(sw, sh)), cv = document.createElement('canvas');
    cv.width = Math.round(sw * k); cv.height = Math.round(sh * k);
    const x = cv.getContext('2d');
    x.drawImage(bm, sx, sy, sw, sh, 0, 0, cv.width, cv.height);
    if (wm) {
      const fs = Math.max(12, Math.round(cv.width / 40));
      x.font = '600 ' + fs + 'px Arial,sans-serif'; x.textAlign = 'right';
      x.fillStyle = 'rgba(255,255,255,.75)'; x.strokeStyle = 'rgba(0,0,0,.45)'; x.lineWidth = fs / 8;
      x.strokeText('CUTE-S AI', cv.width - fs / 2, cv.height - fs / 2);
      x.fillText('CUTE-S AI', cv.width - fs / 2, cv.height - fs / 2);
    }
    return await new Promise(ok => cv.toBlob(b => ok(b || blob), 'image/png'));
  } catch (e) { return blob; }
}
async function imConvert(blob, type, q) {
  const bm = await createImageBitmap(blob), cv = document.createElement('canvas');
  cv.width = bm.width; cv.height = bm.height;
  const x = cv.getContext('2d');
  if (type === 'image/jpeg') { x.fillStyle = '#fff'; x.fillRect(0, 0, cv.width, cv.height); }
  x.drawImage(bm, 0, 0);
  return new Promise(ok => cv.toBlob(b => ok(b || blob), type, q || 0.92));
}
async function imCaption(blob, text, pos) {
  const bm = await createImageBitmap(blob), cv = document.createElement('canvas');
  cv.width = bm.width; cv.height = bm.height;
  const x = cv.getContext('2d'); x.drawImage(bm, 0, 0);
  const fs = Math.round(bm.width / 14), pad = fs * 0.5, lh = fs * 1.15;
  x.font = '700 ' + fs + 'px "DM Sans",Arial,sans-serif'; x.textAlign = 'center';
  x.fillStyle = '#fff'; x.strokeStyle = '#000'; x.lineWidth = fs / 6; x.lineJoin = 'round';
  const maxW = bm.width * 0.9, lines = []; let cur = '';
  text.split(/\s+/).forEach(w => { const t = cur ? cur + ' ' + w : w; if (x.measureText(t).width > maxW && cur) { lines.push(cur); cur = w; } else cur = t; });
  if (cur) lines.push(cur);
  const H = lines.length * lh;
  const y0 = pos === 'top' ? pad : pos === 'mid' ? (bm.height - H) / 2 : bm.height - H - pad;
  lines.forEach((l, i) => { const y = y0 + i * lh + fs * 0.85; x.strokeText(l, bm.width / 2, y); x.fillText(l, bm.width / 2, y); });
  return new Promise(ok => cv.toBlob(b => ok(b || blob), 'image/png'));
}
const imB64 = blob => new Promise(ok => { const r = new FileReader(); r.onload = () => ok(String(r.result).split(',')[1]); r.readAsDataURL(blob); });

/* ---------- core generator ---------- */
async function imGen(q, o) {
  o = Object.assign({}, IMS, o || {});
  const st = (IM_STYLES[o.style] || IM_STYLES.auto)[1], rt = IM_RATIOS[o.ratio] || IM_RATIOS.sq;
  let p = q;
  if (o.enh) {
    const r = await aiCall([{ role: 'user', content: 'Turn this request into ONE detailed English prompt for an image generator (subject, setting, lighting, colors, composition). Do not put written text in the image unless asked. Reply with ONLY the prompt.\nRequest: ' + q }]);
    if (r.full && r.full.length < 1200) p = r.full.trim();
  }
  const full = p + (st ? ', ' + st : '') + ', ' + rt[3];
  const opt = {};
  if (o.model && o.model !== 'auto') opt.model = o.model;
  if (o.ref) { opt.model = 'gemini-2.5-flash-image-preview'; opt.input_image = o.ref.b64; opt.input_image_mime_type = o.ref.mime; }
  let im;
  try { im = await puter.ai.txt2img(full, opt); }
  catch (e) {
    if (o.ref) throw new Error('This photo could not be edited. Try a different image or a simpler change.');
    if (opt.model) im = await puter.ai.txt2img(full); else throw e; // fall back to the default model
  }
  const raw = await (await fetch(im.src)).blob();
  const blob = await imFinish(raw, rt, o.wm);
  const rec = { id: (user ? user.uid : 'x') + '_' + Date.now() + '_' + Math.random().toString(36).slice(2, 6), uid: user && user.uid, ts: Date.now(), prompt: q, final: full, style: o.style, ratio: o.ratio, blob, fav: 0 };
  imSave(rec);
  return rec;
}

/* ---------- result card with all actions ---------- */
function imCard(rec, q) {
  const wrap = el('div', { className: 'imc' });
  const draw = () => {
    wrap.innerHTML = '';
    const url = URL.createObjectURL(rec.blob);
    const img = el('img', { src: url, alt: '', css: 'width:100%;border-radius:12px;display:block' });
    img.onload = () => { const m = $('msgs'); if (m) m.scrollTop = m.scrollHeight; };
    const act = el('div', { className: 'act' });
    const mk = (t, fn) => { const b = el('button', { textContent: t, onclick: () => fn(b) }); act.append(b); return b; };
    const nm = 'cute-s-ai-' + rec.id.slice(-6);
    mk('⬇️ PNG', () => dl(rec.blob, nm + '.png'));
    mk('⬇️ JPG', async () => dl(await imConvert(rec.blob, 'image/jpeg'), nm + '.jpg'));
    const fav = mk(rec.fav ? '❤️ Saved' : '🤍 Save', async b => { rec.fav = rec.fav ? 0 : 1; await imPut(rec).catch(() => {}); b.textContent = rec.fav ? '❤️ Saved' : '🤍 Save'; toast(rec.fav ? 'Kept in your gallery' : 'Removed from favourites'); });
    mk('🔄 Another', async b => {
      if (wrap.dataset.b) return; wrap.dataset.b = 1; b.textContent = '⏳...'; pet('think');
      try { const n = await imGen(rec.prompt); Object.assign(rec, n); pet('happy', 2500); draw(); }
      catch (e) { b.textContent = '🔄 Another'; toast('Could not create the image.'); }
      delete wrap.dataset.b;
    });
    mk('🧬 Remix', async () => imStudio({ prompt: rec.prompt, ref: { b64: await imB64(rec.blob), mime: 'image/png', url } }));
    const cap = mk('🔤 Text', () => {
      if (wrap.querySelector('.imcap')) return wrap.querySelector('.imcap').remove();
      const inp = el('input', { placeholder: 'Write text on the image', maxLength: 120, css: 'flex:1;min-width:0' });
      const pos = el('select', {}, ['bottom', 'mid', 'top'].map(v => el('option', { value: v, textContent: v === 'mid' ? 'middle' : v })));
      const ok = el('button', { textContent: 'Add', onclick: async () => { if (!inp.value.trim()) return; rec.blob = await imCaption(rec.blob, inp.value.trim(), pos.value); await imPut(rec).catch(() => {}); draw(); } });
      wrap.append(el('div', { className: 'imcap', css: 'display:flex;gap:6px;margin-top:8px' }, inp, pos, ok));
      inp.focus();
    });
    mk('📋 Copy', async b => { try { await navigator.clipboard.write([new ClipboardItem({ 'image/png': rec.blob })]); b.textContent = '✅ Copied'; } catch (e) { toast('Copy not supported here. Use Download.'); } });
    mk('📤 Share', async () => { try { const f = new File([rec.blob], nm + '.png', { type: 'image/png' }); if (navigator.canShare && navigator.canShare({ files: [f] })) await navigator.share({ files: [f], title: 'CUTE-S AI' }); else toast('Sharing is not supported here. Use Download.'); } catch (e) {} });
    mk('📝 Prompt', () => {
      const old = wrap.querySelector('.impr'); if (old) return old.remove();
      wrap.append(el('div', { className: 'impr', css: 'margin-top:8px;font-size:12px;color:#c9a9b2;line-height:1.5;user-select:text' }, 'Prompt used: ' + rec.final));
    });
    wrap.append(img, act);
  };
  draw();
  return wrap;
}
const imLoader = () => el('div', { className: 'ldw' }, el('img', { className: 'ld', src: 'loading.gif', alt: '' }), el('span', { textContent: 'Creating your image...' }));

/* ---------- chat integration ---------- */
async function chatImage(q) {
  q = q.replace(/^(\/image|\/img|imagine)\s+/i, '').trim() || q;
  busy = true; $('send').disabled = true;
  if (!await puterReady()) { busy = false; $('send').disabled = false; return; }
  if (!hist.length) M.innerHTML = '';
  bub('user', q, q); hist.push({ role: 'user', content: q, shown: q });
  const b = bub('assistant', ''); pet('think'); b.innerHTML = '';
  let made = 0, lastErr = '';
  for (let i = 0; i < (IMS.n || 1); i++) {
    const ph = imLoader(); b.append(ph);
    try { const rec = await imGen(q); ph.replaceWith(imCard(rec)); made++; }
    catch (e) { ph.remove(); lastErr = e && e.message || ''; }
  }
  if (made) { hist.push({ role: 'assistant', content: '🎨 Image created: ' + q }); pet('happy', 3000); saveChat(); }
  else { b.textContent = 'Could not create the image. ' + (lastErr.length < 140 ? lastErr : '') + ' Please try a different description.'; hist.pop(); pet('sad', 3000); }
  busy = false; $('send').disabled = false; M.scrollTop = M.scrollHeight;
}

/* ---------- Image Studio ---------- */
let IM_BUSY = false;
function imSelect(map, cur, fn) {
  const s = el('select', { css: 'flex:1;min-width:0', onchange: () => fn(s.value) },
    Object.entries(map).map(([k, v]) => el('option', { value: k, textContent: v[0], selected: k === cur })));
  return s;
}
function imStudio(pre) {
  pre = pre || {};
  const c = $('mc'); c.innerHTML = '';
  let ref = pre.ref || null;
  const ta = el('textarea', { rows: 3, maxLength: 400, placeholder: 'Describe the image... (any language)', className: 'ims-ta' });
  ta.value = pre.prompt || '';
  const refBox = el('div', { css: 'display:flex;align-items:center;gap:8px;margin:6px 0' });
  const drawRef = () => {
    refBox.innerHTML = '';
    if (ref) refBox.append(el('img', { src: ref.url || ('data:' + ref.mime + ';base64,' + ref.b64), css: 'width:44px;height:44px;object-fit:cover;border-radius:8px' }),
      el('small', { textContent: 'Reference photo (will be edited / remixed)', css: 'flex:1;color:#c9a9b2' }),
      el('button', { textContent: '✕', className: 'ib', onclick: () => { ref = null; drawRef(); } }));
  };
  drawRef();
  const file = el('input', { type: 'file', accept: 'image/*', css: 'display:none', onchange: () => {
    const f = file.files[0]; if (!f) return;
    if (f.size > 6 * 1024 * 1024) return toast('Photo is too big (max 6 MB)');
    const r = new FileReader();
    r.onload = () => { ref = { b64: String(r.result).split(',')[1], mime: f.type || 'image/png', url: String(r.result) }; drawRef(); };
    r.readAsDataURL(f);
  } });
  const tpl = el('div', { css: 'display:flex;gap:6px;overflow-x:auto;padding:4px 0 8px' },
    IM_TEMPLATES.map(([t, p]) => el('button', { className: 'chip', textContent: t, onclick: () => { ta.value = p; ta.focus(); } })));
  const row = (label, node) => el('div', { css: 'display:flex;align-items:center;gap:8px;margin:6px 0' }, el('small', { textContent: label, css: 'width:62px;color:#c9a9b2;flex:none' }), node);
  const tog = (label, key) => { const b = el('button', { className: 'chip' + (IMS[key] ? ' on' : ''), textContent: label + (IMS[key] ? ': on' : ': off'), onclick: () => { IMS[key] = !IMS[key]; imSaveSet(); b.className = 'chip' + (IMS[key] ? ' on' : ''); b.textContent = label + (IMS[key] ? ': on' : ': off'); } }); return b; };
  const out = el('div', { className: 'ims-g' });
  const go2 = el('button', { className: 'pb', textContent: '🎨 Generate', onclick: async () => {
    const q = ta.value.trim();
    if (!q) return toast('Describe the image first');
    if (IM_BUSY) return;
    IM_BUSY = true; go2.disabled = true;
    if (!await puterReady()) { IM_BUSY = false; go2.disabled = false; return; }
    for (let i = 0; i < (IMS.n || 1); i++) {
      const ph = imLoader(); out.prepend(ph);
      try { const rec = await imGen(q, ref ? { ref } : {}); ph.replaceWith(imCard(rec)); }
      catch (e) { ph.replaceWith(el('p', { className: 'qw', textContent: '⚠️ ' + ((e && e.message) || 'Could not create the image.').slice(0, 160) })); }
    }
    IM_BUSY = false; go2.disabled = false;
  } });
  c.append(
    el('h3', { textContent: '🖼 Image Studio' }), tpl, ta,
    el('div', { css: 'display:flex;gap:8px;margin:6px 0' },
      el('button', { className: 'chip', textContent: '🎲 Surprise me', onclick: () => { ta.value = IM_IDEAS[Math.floor(Math.random() * IM_IDEAS.length)]; } }),
      el('button', { className: 'chip', textContent: '📷 Add photo', onclick: () => file.click() }), file),
    refBox,
    row('Style', imSelect(IM_STYLES, IMS.style, v => { IMS.style = v; imSaveSet(); })),
    row('Shape', imSelect(IM_RATIOS, IMS.ratio, v => { IMS.ratio = v; imSaveSet(); })),
    row('Model', imSelect(IM_MODELS, IMS.model, v => { IMS.model = v; imSaveSet(); })),
    row('How many', imSelect({ 1: ['1 image'], 2: ['2 images'], 4: ['4 images'] }, String(IMS.n), v => { IMS.n = +v; imSaveSet(); })),
    el('div', { css: 'display:flex;gap:8px;flex-wrap:wrap;margin:8px 0' }, tog('✨ Smart prompt', 'enh'), tog('💧 Watermark', 'wm')),
    go2,
    el('button', { className: 'pb', textContent: '🗂 My gallery', css: 'margin-top:8px;background:transparent;border:1px solid var(--line)', onclick: imGallery }),
    el('p', { className: 'qw', textContent: 'Tip: you can also just type “draw a …” in the chat.' }),
    out);
  openModal();
}

/* ---------- gallery ---------- */
async function imGallery() {
  const c = $('mc'); c.innerHTML = '<h3>🗂 My gallery</h3><p class="qw">Saved on this device only. The newest 40 images are kept; ❤️ favourites stay forever.</p>';
  let all = []; try { all = await imAll(); } catch (e) {}
  const back = el('button', { className: 'chip', textContent: '← Studio', onclick: () => imStudio() });
  c.append(back);
  if (!all.length) return c.append(el('p', { className: 'qw', textContent: 'No images yet. Create one in the Studio 💗' }));
  const grid = el('div', { className: 'ims-g2' });
  all.forEach(rec => {
    const t = el('button', { className: 'ims-t', onclick: () => {
      c.innerHTML = ''; c.append(el('button', { className: 'chip', textContent: '← Gallery', onclick: imGallery }), imCard(rec),
        el('button', { className: 'pb', textContent: '🗑 Delete', css: 'margin-top:10px;background:transparent;border:1px solid var(--line)', onclick: async () => { if (confirm('Delete this image?')) { await imDel(rec.id).catch(() => {}); imGallery(); } } }));
    } }, el('img', { src: URL.createObjectURL(rec.blob), alt: '' }), rec.fav ? el('span', { textContent: '❤️' }) : '');
    grid.append(t);
  });
  c.append(grid);
}

/* ---------- wire up the Images chip ---------- */
(function () { const b = $('im'); if (b) b.onclick = () => imStudio(); })();

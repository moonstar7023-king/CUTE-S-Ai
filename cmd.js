/* =====================================================================
   CUTE-S AI - Commands (cmd.js)
   Loaded after app.js, image.js and office.js.
   Like Meta AI / ChatGPT / Claude: just type a command (or ask in plain
   words) and CUTE-S AI makes the image, quiz, Word / Excel / PowerPoint
   / PDF / code file, etc. Type "/" in the chat to see every command.
   ===================================================================== */
(function () {
  const GEN_SYS = 'You are the file-generation engine of CUTE-S AI, an assistant for students. Follow the requested output format EXACTLY. Output only the requested content, with no greeting and no commentary. Write in the same language and script as the request (Urdu script, Roman Urdu, English, ...). Be accurate, well organised and ready to use. Never invent personal details, statistics or references: use [brackets] as placeholders when something is unknown.';

  /* ---------- file kinds ---------- */
  const FK = {
    docx: { i: '📝', l: 'Word', e: 'docx', m: 'md' }, pdf: { i: '📕', l: 'PDF', e: 'pdf', m: 'md' },
    xlsx: { i: '📊', l: 'Excel', e: 'xlsx', m: 'xl' }, pptx: { i: '📽', l: 'PowerPoint', e: 'pptx', m: 'pp' },
    md: { i: '📃', l: 'Markdown', e: 'md', m: 'md' }, txt: { i: '📃', l: 'Text', e: 'txt', m: 'raw' },
    csv: { i: '🧾', l: 'CSV', e: 'csv', m: 'raw' }, json: { i: '🧩', l: 'JSON', e: 'json', m: 'raw' }, xml: { i: '🧩', l: 'XML', e: 'xml', m: 'raw' },
    html: { i: '🌐', l: 'Web page', e: 'html', m: 'raw' }, ics: { i: '📅', l: 'Calendar', e: 'ics', m: 'raw' }, vcf: { i: '👤', l: 'Contact', e: 'vcf', m: 'raw' },
    zip: { i: '🗜', l: 'ZIP project', e: 'zip', m: 'zip' }, code: { i: '💻', l: 'Code', e: 'txt', m: 'raw' }
  };
  const TPL = {
    resume: { k: 'docx', h: 'This is a CV / resume. Layout: "# Full name", one contact line, ## Professional Summary, ## Education, ## Skills, ## Projects, ## Experience, ## Languages. Use ONLY facts the user gave; for anything missing write a [placeholder in brackets]. Never invent degrees, employers or numbers.' },
    letter: { k: 'docx', h: 'This is a formal letter / application. Format: date, recipient, a subject line in **bold**, salutation, short body paragraphs, closing, sender name. Use [brackets] for unknown details.' },
    report: { k: 'docx', h: 'This is a report / assignment. Include a title, a short introduction, clearly headed sections and a conclusion. Add references only if you are sure they exist; never invent references.' },
    invoice: { k: 'xlsx', h: 'This is an invoice: columns Item, Description, Qty, Unit price, Amount (formula per row), then Subtotal, Tax and Total rows using formulas. Use [brackets] placeholders for names.' },
    timetable: { k: 'xlsx', h: 'This is a weekly timetable: first column Time, then one column per day; fill the cells with subjects / activities.' },
    budget: { k: 'xlsx', h: 'This is a budget / expense sheet: columns Category, Planned, Actual, Difference (formula), and a Total row using SUM formulas.' },
    attendance: { k: 'xlsx', h: 'This is an attendance sheet: Roll No, Name, then day columns (1 = present, 0 = absent), then a Total present column using a SUM formula.' }
  };
  const CODE_EXT = { python: 'py', py: 'py', javascript: 'js', js: 'js', typescript: 'ts', ts: 'ts', java: 'java', c: 'c', cpp: 'cpp', 'c++': 'cpp', csharp: 'cs', 'c#': 'cs', cs: 'cs', php: 'php', sql: 'sql', css: 'css', go: 'go', rust: 'rs', rs: 'rs', kotlin: 'kt', kt: 'kt', swift: 'swift', bash: 'sh', sh: 'sh', r: 'r', dart: 'dart', ruby: 'rb', rb: 'rb', html: 'html' };
  const EXT_KIND = { docx: 'docx', doc: 'docx', xlsx: 'xlsx', pptx: 'pptx', pdf: 'pdf', md: 'md', zip: 'zip' };

  /* ---------- small helpers ---------- */
  const prefill = t => { const q = $('q'); q.value = t; go('chat'); q.focus(); q.dispatchEvent(new Event('input')); };
  const clearInput = () => { $('q').value = ''; $('q').style.height = 'auto'; hidePal(); };
  const lastAnswer = () => { const h = [...hist].reverse().find(x => x.role === 'assistant' && !x.content.startsWith('📎') && !x.content.startsWith('🎨')); return h ? h.content : ''; };
  const loader = t => el('div', { className: 'ldw' }, el('img', { className: 'ld', src: 'loading.gif', alt: '' }), el('span', { textContent: t }));
  async function begin(shown, needAI) {
    if (busy) { toast('Please wait...'); return null; }
    busy = true; $('send').disabled = true;
    if (needAI && !await puterReady()) { busy = false; $('send').disabled = false; return null; }
    if (!hist.length) M.innerHTML = '';
    go('chat'); bub('user', shown, shown); hist.push({ role: 'user', content: shown, shown });
    const b = bub('assistant', ''); b.innerHTML = ''; pet('think'); return b;
  }
  const finish = () => { busy = false; $('send').disabled = false; M.scrollTop = M.scrollHeight; };
  const slug = s => String(s || '').replace(/[^\w\u0600-\u06FF ]+/g, ' ').trim().split(/\s+/).slice(0, 5).join(' ');

  /* =================== IMAGES =================== */
  let lastImg = null;
  async function cmdImage(raw, pre) {
    pre = pre || {};
    const fl = ofImgFlags(raw || '', IM_RATIOS, IM_STYLES), q = fl.q, edit = !!pre.edit, cmd = pre.cmd || 'image';
    let src = null;
    if (edit) {
      src = (attach && attach.file) || (lastImg && lastImg.blob);
      if (!src) { toast('Attach a photo with 📎 first (or create an image), then /edit'); return; }
      if (src.size > 6 * 1024 * 1024) { toast('Photo is too big (max 6 MB)'); return; }
    } else if (!q) { toast('Describe the image, e.g. /' + cmd + ' a rabbit studying'); prefill('/' + cmd + ' '); return; }
    const b = await begin('/' + cmd + (raw ? ' ' + raw : ''), true); if (!b) return;
    if (edit && attach && attach.file) clearAttach();
    const style = fl.style || pre.style, n = Math.min(4, fl.n || pre.n || IMS.n || 1);
    let made = 0, lastErr = '';
    try {
      const o = {}; let ref = null;
      if (edit) {
        const bm = await createImageBitmap(src); IM_RATIOS.orig = ['Original', bm.width, bm.height, 'same composition'];
        ref = { b64: await imB64(src), mime: src.type || 'image/png' };
        Object.assign(o, { ref, ratio: 'orig', enh: false, style: style || 'auto' });
      } else { if (style) o.style = style; const rt = fl.ratio || pre.ratio; if (rt) o.ratio = rt; }
      const prompt = edit ? 'Edit the provided image: ' + (q || 'create a creative variation of it') : (pre.prefix || '') + q;
      for (let i = 0; i < (edit ? 1 : n); i++) {
        const ph = imLoader(); b.append(ph);
        try { const rec = await imGen(prompt, o); lastImg = rec; ph.replaceWith(imCard(rec)); made++; }
        catch (e) { ph.remove(); lastErr = (e && e.message) || ''; }
      }
    } catch (e) { lastErr = (e && e.message) || ''; }
    delete IM_RATIOS.orig;
    if (made) { hist.push({ role: 'assistant', content: '🎨 Image created: ' + (q || 'edited photo') }); pet('happy', 3000); saveChat(); }
    else { b.textContent = 'Could not create the image. ' + (lastErr.length < 140 ? lastErr : '') + ' Please try again.'; hist.pop(); pet('sad', 3000); }
    finish();
  }
  chatImage = q => cmdImage(String(q).replace(/^(\/image|\/img|imagine)\s+/i, ''), {});

  /* =================== STUDY =================== */
  function cmdStudy(kind, args, name) {
    if (busy) return toast('Please wait...');
    let n = null, t = String(args || '').trim();
    let m = t.match(/^(\d{1,2})\b\s*([\s\S]*)$/);
    if (m && +m[1] >= 2 && +m[1] <= 30) { n = +m[1]; t = m[2].trim(); }
    else { m = t.match(/\b(\d{1,2})\s*(?:mcqs?|questions?|qs|flash ?cards?|cards?)\b/i); if (m && +m[1] >= 2 && +m[1] <= 30) n = +m[1]; }
    if (attach) { t = (t ? t + '\n\n' : '') + attach.text; clearAttach(); }
    else if (!t) t = lastAnswer();
    if (!t) { toast('Add a topic, e.g. /' + name + ' Photosynthesis'); prefill('/' + name + ' '); return; }
    return gen(kind, t, n);
  }
  function cmdTool(i, args, name) {
    if (busy) return toast('Please wait...');
    let a = String(args || '').trim();
    if (!a && !attach) { prefill('/' + name + ' '); toast('Now type your topic after the command'); return; }
    let shown = '/' + name + ' ' + a;
    if (attach) { a += '\n\n[Attached file: ' + attach.name + ']\n' + (attach.text || '(photo without readable text)'); shown += ' 📎 ' + attach.name; clearAttach(); }
    return run(TOOLS[i][1] + a, shown.trim());
  }

  /* =================== FILES =================== */
  const PRM = {
    md: (req, o, K, ext) => 'Create a ' + (ext === 'pdf' ? 'PDF document' : 'professional document') + '. Request: "' + req + '"\n' + (o.hint || '') + '\nFormat: Markdown only. One "# " title line first, then ## and ### headings, short paragraphs, bullet and numbered lists, **bold** for key terms, and tables (| a | b |) where useful. Do not wrap the answer in a code fence. No text before or after the document.',
    xl: (req, o) => 'Create a spreadsheet. Request: "' + req + '"\n' + (o.hint || '') + '\nReply with ONLY valid JSON (no code fence) in exactly this shape:\n{"sheets":[{"name":"Sheet name","rows":[["Header 1","Header 2","Total"],["Item",10,"=B2*2"]]}]}\nRules: the first row of every sheet is the header row. Numbers must be real JSON numbers (no currency symbols or commas). Use Excel formulas (strings starting with "=", English function names, A1 references) for every total or calculation instead of typing the result. Add a Total row when it makes sense (its first cell is the word Total). Max 5 sheets, 150 rows each. If the user gave no data, use realistic sample data.',
    pp: (req, o) => 'Create a presentation. Request: "' + req + '"\n' + (o.hint || '') + '\nReply with ONLY valid JSON (no code fence) in exactly this shape:\n{"title":"Deck title","subtitle":"short subtitle","theme":"dark","slides":[{"title":"Slide title","bullets":["short point","short point"],"notes":"speaker notes"},{"title":"A chart","chart":{"type":"bar","labels":["A","B"],"values":[1,2]}},{"title":"A table","table":[["Col 1","Col 2"],["a","b"]]}]}\nRules: theme is "dark" or "light". Use 6 to 12 content slides unless the user asked for a number. Max 6 bullets per slide, each under 15 words. Include an agenda/overview slide and a summary/conclusion slide. Use chart or table slides only when data helps. Never invent statistics: use only data from the request or well-known facts.',
    zip: (req, o) => 'Create a small multi-file project. Request: "' + req + '"\n' + (o.hint || '') + '\nOutput EVERY file in exactly this format and nothing else:\n=== FILE: path/name.ext ===\n(file content)\n=== END ===\nInclude a README.md. Max 12 files. Working, clean, commented code.',
    raw: (req, o, K, ext) => {
      const rules = { csv: 'A valid CSV with a header row, comma separated; quote fields that contain commas.', json: 'Valid JSON only.', html: 'ONE complete self-contained HTML file with inline CSS and JS, mobile friendly, no external files or images.', xml: 'Well-formed XML only.', ics: 'A valid iCalendar file (BEGIN:VCALENDAR ... END:VCALENDAR) with VEVENT, DTSTART, DTEND, SUMMARY and DESCRIPTION. Today is ' + new Date().toISOString().slice(0, 10) + '.', vcf: 'A valid vCard 3.0 file.', txt: 'Plain text only, no markdown symbols.' }[ext] || 'Clean, well-commented, working content.';
      return 'Create the file "' + (o.name || 'file.' + ext) + '". Request: "' + req + '"\n' + (o.hint || '') + '\n' + rules + '\nReply with ONLY the complete file content inside ONE fenced code block. No explanation.';
    }
  };
  const lang = 'Write in the same language and script as the request.';
  const ctxText = () => {
    if (attach) { const t = 'Source material (attached file ' + attach.name + '):\n' + (attach.text || '').slice(0, 9000); clearAttach(); return '\n\n' + t; }
    const la = lastAnswer(); return la ? '\n\nPrevious answer in this chat (use it only if the request refers to it):\n' + la.slice(0, 4500) : '';
  };
  function directSource(kind, ext, src) {
    const K = FK[kind];
    if (K.m === 'md') return src;
    if (K.m === 'xl') { const s = mdToXlsxSpec(src); return s ? JSON.stringify(s) : null; }
    if (K.m === 'pp') return JSON.stringify(mdToPptSpec(src));
    if (ext === 'txt') return '```\n' + src.replace(/```[\w]*\n?/g, '').replace(/\*\*|__|`/g, '').replace(/^\s*#{1,6}\s+/gm, '') + '\n```';
    if (ext === 'html') return '```html\n<!DOCTYPE html><html><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>CUTE-S AI</title><style>body{font-family:system-ui,Arial,sans-serif;max-width:760px;margin:auto;padding:20px;line-height:1.6}table{border-collapse:collapse}th,td{border:1px solid #999;padding:6px 10px}pre{background:#eee;padding:10px;overflow:auto}</style></head><body dir="auto">' + md(src) + '</body></html>\n```';
    if (ext === 'csv') { const t = mdTables(src)[0]; return t ? '```\n' + t.rows.map(r => r.map(c => /[",\n]/.test(String(c)) ? '"' + String(c).replace(/"/g, '""') + '"' : c).join(',')).join('\n') + '\n```' : null; }
    return null;
  }
  async function pptLib() {
    if (window.PptxGenJS) return;
    try { await loadScript(PPT); } catch (e) { await loadScript('https://cdn.jsdelivr.net/npm/pptxgenjs@3.12.0/dist/pptxgen.bundle.js'); }
    if (!window.PptxGenJS) throw new Error('The PowerPoint maker could not load. Check your internet and try again.');
  }
  const tableMd = rows => { const w = Math.max(...rows.map(r => r.length)); const f = r => '| ' + Array.from({ length: w }, (_, i) => String(r[i] == null ? '' : r[i]).replace(/\|/g, '/')).join(' | ') + ' |'; return [f(rows[0]), '|' + ' --- |'.repeat(w), ...rows.slice(1, 40).map(f)].join('\n'); };

  async function build(kind, ext, full, o) {
    const K = FK[kind];
    if (K.m === 'md') {
      let m = full.trim(); const f = m.match(/^```(?:markdown|md)?\n([\s\S]*?)\n```$/); if (f) m = f[1];
      const title = ofStrip((m.match(/^\s*#\s+(.+)/m) || [])[1] || slug(o.req) || 'Document');
      const name = o.name || ofFileName(title, ext);
      const R = { name, source: m, full: m, hist: m.slice(0, 3500), preview: () => showText(name, m, 'summary', false) };
      if (kind === 'docx') R.blob = mdToDocx(m, { title });
      else if (kind === 'md') R.blob = new Blob([m], { type: OF_MIME.md });
      else R.print = () => toPdf(m);
      return R;
    }
    if (K.m === 'xl') {
      let spec = parseJsonLoose(full);
      if (!spec || !Array.isArray(spec.sheets)) {
        const r = await aiCall([{ role: 'user', content: 'Fix this so it is ONLY valid JSON of the form {"sheets":[{"name":"..","rows":[[..]]}]}. Reply with the JSON only.\n' + full.slice(0, 12000) }]);
        spec = parseJsonLoose(r.full);
      }
      if (!spec || !Array.isArray(spec.sheets)) throw new Error('The AI answered in the wrong format. Please try again.');
      const blob = specToXlsx(spec), s0 = spec.sheets[0] || {};
      const name = o.name || ofFileName(slug(o.req) || s0.name || 'spreadsheet', 'xlsx');
      const pv = spec.sheets.slice(0, 3).map(s => '### ' + (s.name || 'Sheet') + '\n' + tableMd((s.rows || []).filter(Array.isArray))).join('\n\n');
      return { name, blob, full: JSON.stringify(spec), source: pv, hist: pv.slice(0, 3000), preview: () => showText(name, pv, 'summary', false) };
    }
    if (K.m === 'pp') {
      let spec = parseJsonLoose(full);
      if (!spec || !Array.isArray(spec.slides)) {
        const r = await aiCall([{ role: 'user', content: 'Fix this so it is ONLY valid JSON of the form {"title":"","subtitle":"","theme":"dark","slides":[{"title":"","bullets":[""]}]}. Reply with the JSON only.\n' + full.slice(0, 12000) }]);
        spec = parseJsonLoose(r.full);
      }
      if (!spec || !Array.isArray(spec.slides) || !spec.slides.length) throw new Error('The AI answered in the wrong format. Please try again.');
      await pptLib();
      const blob = await specToPptx(spec), name = o.name || ofFileName(spec.title || slug(o.req) || 'presentation', 'pptx');
      const pv = '## ' + (spec.title || '') + '\n' + spec.slides.map((s, i) => '### ' + (i + 1) + '. ' + (s.title || '') + '\n' + (s.bullets || []).map(b => '- ' + b).join('\n') + (s.chart ? '\n- 📈 chart' : '') + (s.table ? '\n- 📋 table' : '')).join('\n\n');
      return { name, blob, full: JSON.stringify(spec), source: pv, hist: pv.slice(0, 3000), preview: () => showText(name, pv, 'summary', false) };
    }
    if (K.m === 'zip') {
      const files = parseProject(full); if (!files.length) throw new Error('No files were produced. Please try again with more detail.');
      const name = o.name || ofFileName(slug(o.req) || 'project', 'zip');
      const pv = '**' + files.length + ' files:**\n' + files.map(f => '- ' + f.name).join('\n');
      return { name, blob: ofZip(files), full, source: pv, hist: pv + '\n\n' + files.slice(0, 3).map(f => '**' + f.name + '**\n```\n' + f.data.slice(0, 800) + '\n```').join('\n'), preview: () => showText(name, pv, 'summary', false) };
    }
    /* raw text-like file */
    const code = extractCode(full), name = o.name || ofFileName(slug(o.req) || 'file', ext);
    const blob = new Blob([(ext === 'csv' ? '\ufeff' : '') + code], { type: OF_MIME[ext] || 'text/plain;charset=utf-8' });
    const pv = '```\n' + code.slice(0, 8000) + '\n```';
    return { name, blob, full: code, source: code, hist: pv.slice(0, 3000), preview: () => ext === 'html' ? preview('```html\n' + code + '\n```') : showText(name, pv, 'summary', false) };
  }

  async function share(rec) {
    try { const f = new File([rec.blob], rec.name, { type: rec.blob.type }); if (navigator.canShare && navigator.canShare({ files: [f] })) await navigator.share({ files: [f], title: rec.name }); else toast('Sharing is not supported here. Use Download.'); } catch (e) { }
  }
  function fileCard(rec) {
    const K = FK[rec.kind], w = el('div', { className: 'fcard' }), act = el('div', { className: 'act' });
    const mk = (t, fn) => act.append(el('button', { textContent: t, onclick: fn }));
    mk(rec.print ? '⬇️ Save as PDF' : '⬇️ Download', () => rec.print ? rec.print() : dl(rec.blob, rec.name));
    mk('👁 Preview', rec.preview);
    if (rec.blob && navigator.share) mk('📤 Share', () => share(rec));
    mk('✏️ Change', () => { const ins = (prompt('What should I change? (for example: make it shorter, add a conclusion, use a light theme)') || '').trim(); if (ins) cmdFile(rec.kind, rec.req, Object.assign({}, rec.o, { prev: rec.full, instr: ins, shown: '✏️ ' + ins })); });
    mk('🔄 Redo', () => cmdFile(rec.kind, rec.req, Object.assign({}, rec.o, { prev: null, instr: null, shown: null })));
    w.append(el('div', { className: 'fh' }, el('div', { className: 'fi', textContent: K.i }), el('div', { className: 'fm' }, el('b', { textContent: rec.name }), el('small', { textContent: K.l + ' · ' + (rec.print ? 'PDF via print' : ofFmtSize(rec.blob.size)) }))), act);
    return w;
  }

  async function cmdFile(kind, args, o) {
    o = Object.assign({}, o || {}); const K = FK[kind]; if (!K) return;
    const ext = o.ext || K.e, req = String(args || '').trim(), cmd = o.cmd || kind;
    const shown = o.shown || ('/' + cmd + (req ? ' ' + req : ''));
    const la = lastAnswer();
    const canDirect = !req && !attach && !o.prev && la && (K.m === 'md' || K.m === 'xl' || K.m === 'pp' || (K.m === 'raw' && ['txt', 'html', 'csv'].includes(ext)));
    if (!req && !attach && !o.prev && !canDirect) { toast('Tell me what to create, e.g. /' + cmd + ' ...'); prefill('/' + cmd + ' '); return; }
    if (busy) return toast('Please wait...');
    let full = canDirect ? directSource(kind, ext, la) : null;
    const b = await begin(shown, full == null); if (!b) return;
    const ph = loader('Creating your ' + K.l + ' file...'), span = ph.querySelector('span'); b.append(ph);
    try {
      if (full == null) {
        const need = req || (attach ? 'Convert the attached material into this file.' : 'Convert the previous answer into this file.');
        let p = PRM[K.m](need, o, K, ext) + '\n' + lang;
        if (o.prev) p += '\n\nCURRENT VERSION OF THE FILE CONTENT:\n' + String(o.prev).slice(0, 14000) + '\n\nCHANGE REQUESTED: ' + o.instr + '\nReturn the COMPLETE updated file content in exactly the same format.'; else p += ctxText();
        const r = await aiCall([{ role: 'system', content: GEN_SYS }, { role: 'user', content: p }], t => { span.textContent = 'Writing your ' + K.l + ' file... ' + t.length + ' characters'; });
        if (!r.full) throw new Error(r.err || 'no response');
        full = r.full;
      }
      span.textContent = 'Building the file...';
      const R = await build(kind, ext, full, { req: req || '', name: o.name });
      const rec = Object.assign({ kind, ext, req, o: { cmd, ext: o.ext, name: o.name, hint: o.hint } }, R);
      ph.replaceWith(fileCard(rec));
      hist.push({ role: 'assistant', content: '📎 ' + rec.name + '\n\n' + R.hist }); pet('happy', 3000); saveChat();
    } catch (e) {
      const m = (e && e.message) || String(e);
      b.textContent = 'Could not create the file. ' + m.slice(0, 160); hist.pop(); pet('sad', 3500);
    }
    finish();
  }

  /* =================== COMMAND TABLE =================== */
  const GI = '🎨 Images', GS = '📚 Study', GF = '📄 Files (Word, Excel, PowerPoint, PDF...)', GT = '🛠 Quick tools', GA = '⚙️ App';
  const img = (names, d, ex, pre) => ({ g: GI, c: names, d, u: ex, f: (a, n) => cmdImage(a, Object.assign({ cmd: n }, pre)) });
  const fil = (names, kind, d, ex, extra) => ({ g: GF, c: names, d, u: ex, f: (a, n) => cmdFile(kind, a, Object.assign({ cmd: n }, extra)) });
  const tpl = (names, t, d, ex) => fil(names, TPL[t].k, d, ex, { hint: TPL[t].h });
  const tool = (names, i, d) => ({ g: GT, c: names, d, f: (a, n) => cmdTool(i, a, n) });
  const CM = [
    img(['image', 'img', 'imagine', 'draw'], 'Create an image (add --16:9 --x4 --anime)', '/image a rabbit studying --16:9'),
    img(['edit', 'remix'], 'Edit the attached photo (or your last image)', '/edit make the background blue', { edit: 1 }),
    img(['logo'], 'Logo design', '/logo Moon Star coaching', { prefix: 'A modern logo for: ', style: 'logo' }),
    img(['poster'], 'Poster', '/poster Science fair 2026', { prefix: 'A bold poster for: ', ratio: 'port' }),
    img(['wallpaper'], 'Phone wallpaper (9:16)', '/wallpaper Hunza in autumn', { prefix: 'A beautiful phone wallpaper of: ', ratio: 'story' }),
    img(['dp'], 'Profile picture', '/dp stylish rabbit', { prefix: 'A stylish profile picture of: ', ratio: 'sq' }),
    img(['thumbnail'], 'YouTube thumbnail (16:9)', '/thumbnail Python in 10 minutes', { prefix: 'An eye-catching YouTube thumbnail about: ', ratio: 'land' }),
    img(['sticker'], 'Sticker', '/sticker happy cat', { prefix: 'A cute sticker of: ', style: 'sticker' }),
    img(['diagram'], 'Labeled study diagram', '/diagram human heart', { prefix: 'A clear labeled diagram explaining: ', style: 'edu' }),
    img(['anime'], 'Anime style', '/anime girl reading', { style: 'anime' }),
    img(['cartoon'], 'Cartoon style', '/cartoon a lion teacher', { style: 'cart' }),
    img(['3d'], '3D render style', '/3d cute robot', { style: 'd3' }),
    img(['realistic', 'photo'], 'Realistic photo style', '/realistic old library', { style: 'real' }),
    { g: GI, c: ['studio'], d: 'Open Image Studio (all options)', f: () => imStudio() },
    { g: GI, c: ['gallery'], d: 'My saved images', f: () => imGallery() },

    { g: GS, c: ['quiz', 'mcq', 'mcqs'], d: 'Quiz (add a number: /quiz 10 topic)', u: '/quiz 5 Pointers in C++', f: (a, n) => cmdStudy('quiz', a, n) },
    { g: GS, c: ['cards', 'flashcards'], d: 'Flashcards', u: '/cards 10 Photosynthesis', f: (a, n) => cmdStudy('cards', a, n) },
    { g: GS, c: ['notes', 'summary'], d: 'Exam-ready notes (topic, attached file or last answer)', u: '/notes Database normalization', f: (a, n) => cmdStudy('summary', a, n) },
    { g: GS, c: ['research'], d: 'Research report with sources', u: '/research Solar energy', f: a => a ? research(a.slice(0, 200)) : prefill('/research ') },
    { g: GS, c: ['focus', 'timer', 'pomodoro'], d: 'Focus timer (25 + 5)', f: () => focus() },
    { g: GS, c: ['save'], d: 'Save the last answer to My library', f: () => { const t = lastAnswer(); t ? saveLib({ type: 'note', title: titleOf(t), content: t }) : toast('Nothing to save yet'); } },

    fil(['word', 'docx', 'doc'], 'docx', 'Word document (.docx)', '/word Notes on Photosynthesis'),
    fil(['excel', 'xlsx', 'sheet', 'spreadsheet'], 'xlsx', 'Excel sheet with formulas (.xlsx)', '/excel Monthly expense tracker'),
    fil(['ppt', 'pptx', 'powerpoint', 'slides', 'presentation'], 'pptx', 'PowerPoint deck (.pptx)', '/ppt Climate change 8 slides'),
    fil(['pdf'], 'pdf', 'PDF document', '/pdf Study plan for finals'),
    fil(['txt', 'text'], 'txt', 'Text file', '/txt Shopping list'),
    fil(['md', 'markdown'], 'md', 'Markdown file', '/md README for my project'),
    fil(['csv'], 'csv', 'CSV data file', '/csv 20 students with marks'),
    fil(['json'], 'json', 'JSON file', '/json sample users list'),
    fil(['xml'], 'xml', 'XML file', '/xml book catalog'),
    fil(['html', 'webpage', 'website'], 'html', 'Web page (.html)', '/html Portfolio page for a student'),
    fil(['ics', 'calendar', 'event'], 'ics', 'Calendar event (.ics) for Outlook / Google', '/ics Math exam on 20 December 9am'),
    fil(['vcf', 'contact'], 'vcf', 'Contact card (.vcf)', '/vcf Ali Khan 0300 1234567'),
    fil(['zip', 'project'], 'zip', 'Multi-file project as .zip', '/zip Simple calculator website'),
    tpl(['resume', 'cv', 'biodata'], 'resume', 'Resume / CV (Word)', '/cv BS Computer Science fresher'),
    tpl(['letter', 'application'], 'letter', 'Letter / application (Word)', '/letter Leave application for 2 days'),
    tpl(['report', 'assignment'], 'report', 'Report / assignment (Word)', '/report Effects of social media'),
    tpl(['invoice'], 'invoice', 'Invoice (Excel)', '/invoice Web design services'),
    tpl(['timetable'], 'timetable', 'Weekly timetable (Excel)', '/timetable Class 10 science'),
    tpl(['budget'], 'budget', 'Budget sheet (Excel)', '/budget Monthly student budget'),
    tpl(['attendance'], 'attendance', 'Attendance sheet (Excel)', '/attendance Class 8-B November'),
    {
      g: GF, c: ['file'], d: 'Any file: name + what you want', u: '/file notes.docx Chapter 3 summary', f: (a, n) => {
        const m = a.match(/^([^\s\/\\]+\.(\w{1,5}))\s*([\s\S]*)$/);
        if (!m) { toast('Start with a file name, e.g. /file notes.docx topic'); return prefill('/file '); }
        const e = m[2].toLowerCase(), kind = EXT_KIND[e] || (FK[e] ? e : 'code');
        return cmdFile(kind, m[3], { cmd: n, ext: FK[kind] && kind !== 'code' ? undefined : e, name: ofFileName(m[1].replace(/\.\w+$/, ''), e), hint: kind === 'code' ? 'Write clean, well-commented, working content for this file.' : '' });
      }
    },
    {
      g: GF, c: ['code'], d: 'Code file in any language', u: '/code python bubble sort', f: (a, n) => {
        const m = a.match(/^(\S+)\s+([\s\S]+)$/), e = m && CODE_EXT[m[1].toLowerCase()];
        if (!e) { toast('Use: /code <language> <what to write>'); return prefill('/code python '); }
        return cmdFile('code', m[2], { cmd: n, ext: e, name: ofFileName(slug(m[2]) || 'program', e), hint: 'Write clean, well-commented, working ' + m[1] + ' code.' });
      }
    },

    tool(['explain', 'eli5'], 0, 'Explain simply with an example'), tool(['translate'], 1, 'Translate (say "to French" if needed)'),
    tool(['grammar', 'fix'], 2, 'Fix grammar and spelling'), tool(['essay'], 3, 'Write a structured essay'),
    tool(['solve'], 4, 'Solve step by step (attach a photo too)'), tool(['debug'], 5, 'Find and fix a bug in code'),
    tool(['mindmap'], 6, 'Mind map diagram'), tool(['plan', 'studyplan'], 7, 'Day-by-day study plan'),
    tool(['viva'], 8, 'Viva / interview practice'), tool(['memory', 'mnemonic'], 9, 'Memory tricks'),
    tool(['summarize', 'summary5'], 10, 'Summarize in 5 points'), tool(['email'], 11, 'Write a professional email'),
    tool(['compare'], 12, 'Compare in a table'), tool(['meaning'], 13, 'Word meanings with Urdu'),

    { g: GA, c: ['help', 'commands', 'menu'], d: 'Show all commands', f: () => help() },
    { g: GA, c: ['new'], d: 'Start a new chat', f: () => newChat() },
    { g: GA, c: ['history'], d: 'Open chat history', f: () => openDrawer() },
    { g: GA, c: ['settings'], d: 'Open settings', f: () => settings() },
    { g: GA, c: ['deep'], d: 'Toggle Deep mode', f: () => $('dp').click() },
    { g: GA, c: ['search'], d: 'Web search on / off', u: '/search on', f: a => { const on = /^on|yes|1/i.test(a), off = /^off|no|0/i.test(a); if (on || off) { SET.web = on; saveSet(); applySet(); toast(on ? 'Web search on (Wikipedia)' : 'Web search off'); } else $('sr').click(); } },
    { g: GA, c: ['connect'], d: 'Choose what the AI may read', f: () => connectors() },
    { g: GA, c: ['lang'], d: 'Reply language', u: '/lang ur', f: a => { const k = a.trim().toLowerCase(); if (k && (k === 'auto' || LN[k])) { SET.lang = k; saveSet(); toast(langName(k)); } else langMenu(); } },
    { g: GA, c: ['tools'], d: 'Study tools list + streak', f: () => tools() }
  ];

  /* =================== ROUTER =================== */
  window.cmdRoute = async function (q) {
    q = String(q || '').trim();
    const m = q.match(/^\/([\w\u0600-\u06FF+#]+)\s*([\s\S]*)$/);
    if (m) {
      const name = m[1].toLowerCase(), c = CM.find(x => x.c.includes(name));
      clearInput();
      if (!c) { toast('Unknown command /' + name); help(); return true; }
      await c.f(m[2].trim(), name); return true;
    }
    if (attach && !q) return false;
    const it = ofIntent(q);
    if (it && it.type === 'file') { clearInput(); await cmdFile(it.kind, q, { cmd: it.kind, hint: it.tpl ? TPL[it.tpl].h : '', shown: q }); return true; }
    if (it && it.type === 'study') { clearInput(); await cmdStudy(it.kind === 'quiz' ? 'quiz' : 'cards', q, it.kind); return true; }
    return false;
  };

  /* =================== UI: help + palette =================== */
  function help() {
    const c = $('mc'); c.innerHTML = '<h3>⌘ Commands</h3><p class="qw">Type <b>/</b> in the chat, or tap a command below. You can also just ask in plain words, like “make a ppt on AI” or “draw a cat”. Attach a PDF / photo with 📎 first and the command will use it.</p>';
    const groups = [GI, GS, GF, GT, GA];
    groups.forEach(g => {
      c.append(el('div', { className: 'cg', textContent: g }));
      CM.filter(x => x.g === g).forEach(x => c.append(el('button', { className: 'mi', onclick: () => { closeModal(); prefill('/' + x.c[0] + ' '); } }, el('b', { textContent: '/' + x.c[0] }), el('span', { textContent: '  ' + x.d }), x.u ? el('small', { textContent: x.u, css: 'display:block;color:#c9a9b2;margin-top:2px' }) : '')));
    });
    openModal();
  }
  const pal = el('div', { className: 'cmdp', hidden: true });
  const barEl = document.querySelector('#chat .bar'); if (barEl) barEl.before(pal);
  function hidePal() { pal.hidden = true; }
  function showPal(p) {
    const rows = []; CM.forEach(c => { const a = c.c.find(x => x.startsWith(p)); if (a) rows.push([a, c]); });
    pal.innerHTML = ''; if (!rows.length) return hidePal();
    (p ? rows : rows.slice(0, 14)).forEach(([a, c]) => pal.append(el('button', { onclick: () => prefill('/' + a + ' ') }, el('b', { textContent: '/' + a }), el('span', { textContent: c.d }))));
    if (!p) pal.append(el('button', { onclick: help }, el('b', { textContent: '⌘ All commands…' }), el('span', { textContent: 'see everything' })));
    pal.hidden = false;
  }
  $('q').addEventListener('input', () => { const m = $('q').value.match(/^\/([\w+#]*)$/); m ? showPal(m[1].toLowerCase()) : hidePal(); });
  const cm = $('cm'); if (cm) cm.onclick = help;
  window.cmdHelp = help;
})();

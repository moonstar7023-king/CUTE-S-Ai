/* =====================================================================
   CUTE-S AI - Office file builders (office.js)
   Pure functions (no DOM needed). Builds REAL .docx / .xlsx / .zip files
   with a tiny built-in ZIP writer, so no CDN is needed for them.
   PowerPoint (.pptx) uses PptxGenJS (loaded on demand by cmd.js).
   ===================================================================== */

const OF_MIME = {
  docx: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
  xlsx: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
  pptx: 'application/vnd.openxmlformats-officedocument.presentationml.presentation',
  pdf: 'application/pdf', csv: 'text/csv;charset=utf-8', json: 'application/json',
  html: 'text/html;charset=utf-8', md: 'text/markdown;charset=utf-8', txt: 'text/plain;charset=utf-8',
  xml: 'application/xml', ics: 'text/calendar;charset=utf-8', vcf: 'text/vcard;charset=utf-8', zip: 'application/zip'
};

/* ---------- tiny ZIP writer (no compression, always valid) ---------- */
const OF_CRC = (() => { const t = new Uint32Array(256); for (let n = 0; n < 256; n++) { let c = n; for (let k = 0; k < 8; k++) c = c & 1 ? 0xEDB88320 ^ (c >>> 1) : c >>> 1; t[n] = c >>> 0; } return t; })();
function ofCrc(b) { let c = 0xFFFFFFFF; for (let i = 0; i < b.length; i++) c = OF_CRC[(c ^ b[i]) & 255] ^ (c >>> 8); return (c ^ 0xFFFFFFFF) >>> 0; }
function ofZip(files, mime) {
  const enc = new TextEncoder(), chunks = [], cd = []; let off = 0;
  const w16 = (a, v) => a.push(v & 255, (v >>> 8) & 255), w32 = (a, v) => a.push(v & 255, (v >>> 8) & 255, (v >>> 16) & 255, (v >>> 24) & 255);
  for (const f of files) {
    const nm = enc.encode(f.name), d = typeof f.data === 'string' ? enc.encode(f.data) : f.data, crc = ofCrc(d);
    const h = []; w32(h, 0x04034b50); w16(h, 20); w16(h, 0x0800); w16(h, 0); w16(h, 0); w16(h, 0x21); w32(h, crc); w32(h, d.length); w32(h, d.length); w16(h, nm.length); w16(h, 0);
    chunks.push(new Uint8Array(h), nm, d);
    const c = []; w32(c, 0x02014b50); w16(c, 20); w16(c, 20); w16(c, 0x0800); w16(c, 0); w16(c, 0); w16(c, 0x21); w32(c, crc); w32(c, d.length); w32(c, d.length); w16(c, nm.length); w16(c, 0); w16(c, 0); w16(c, 0); w16(c, 0); w32(c, 0); w32(c, off);
    cd.push(new Uint8Array(c), nm);
    off += h.length + nm.length + d.length;
  }
  let cds = 0; cd.forEach(x => cds += x.length);
  const e = []; w32(e, 0x06054b50); w16(e, 0); w16(e, 0); w16(e, files.length); w16(e, files.length); w32(e, cds); w32(e, off); w16(e, 0);
  return new Blob([...chunks, ...cd, new Uint8Array(e)], { type: mime || 'application/zip' });
}

/* ---------- shared helpers ---------- */
const XE = s => String(s == null ? '' : s).replace(/[\u0000-\u0008\u000B\u000C\u000E-\u001F]/g, '').replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
const OF_RTL = /[\u0590-\u08FF\uFB1D-\uFDFF\uFE70-\uFEFF]/g, OF_LAT = /[A-Za-z]/g;
const ofRtl = s => { s = String(s || ''); return (s.match(OF_RTL) || []).length > (s.match(OF_LAT) || []).length; };
const XHEAD = '<?xml version="1.0" encoding="UTF-8" standalone="yes"?>\n';
const ofStrip = s => String(s).replace(/\*\*|__|`/g, '').replace(/\[([^\]]+)\]\([^)]*\)/g, '$1').replace(/^[\s>*•-]+/, '').replace(/^\d+[.)]\s+/, '').trim();

/* =====================================================================
   WORD (.docx)  -  Markdown -> real Word document
   ===================================================================== */
function ofInline(s) {
  const out = [], re = /(\*\*[^*\n]+\*\*|\*[^*\n]+\*|`[^`\n]+`|\[[^\]\n]+\]\(https?:\/\/[^)\s]+\))/g;
  let last = 0, m;
  while ((m = re.exec(s))) {
    if (m.index > last) out.push({ t: s.slice(last, m.index) });
    const x = m[0];
    if (x.startsWith('**')) out.push({ t: x.slice(2, -2), b: 1 });
    else if (x[0] === '*') out.push({ t: x.slice(1, -1), i: 1 });
    else if (x[0] === '`') out.push({ t: x.slice(1, -1), c: 1 });
    else { const k = x.match(/^\[([^\]]+)\]\((.+)\)$/); out.push({ t: k[1], link: k[2] }); }
    last = m.index + x.length;
  }
  if (last < s.length) out.push({ t: s.slice(last) });
  return out;
}

function mdToDocx(md, opt) {
  opt = opt || {};
  const links = [], nums = [];
  const run = (r, o) => {
    let p = '';
    if (r.c) p += '<w:rFonts w:ascii="Consolas" w:hAnsi="Consolas" w:cs="Consolas"/>';
    if (r.b || o.bold) p += '<w:b/><w:bCs/>';
    if (r.i) p += '<w:i/><w:iCs/>';
    const col = o.color || (r.link ? '0563C1' : '');
    if (col) p += '<w:color w:val="' + col + '"/>';
    if (o.size) p += '<w:sz w:val="' + o.size + '"/><w:szCs w:val="' + o.size + '"/>';
    if (r.link) p += '<w:u w:val="single"/>';
    if (r.c) p += '<w:shd w:val="clear" w:color="auto" w:fill="F2F2F2"/>';
    if (o.rtl) p += '<w:rtl/>';
    return '<w:r>' + (p ? '<w:rPr>' + p + '</w:rPr>' : '') + '<w:t xml:space="preserve">' + XE(r.t) + '</w:t></w:r>';
  };
  const runs = (text, o) => ofInline(text).map(r => {
    if (r.link) { links.push(r.link); return '<w:hyperlink r:id="rIdL' + links.length + '">' + run(r, o) + '</w:hyperlink>'; }
    return run(r, o);
  }).join('');
  const para = (text, o) => {
    o = o || {}; const rtl = o.rtl != null ? o.rtl : ofRtl(text);
    let pp = '';
    if (o.style) pp += '<w:pStyle w:val="' + o.style + '"/>';
    if (o.num) pp += '<w:numPr><w:ilvl w:val="' + (o.lvl || 0) + '"/><w:numId w:val="' + o.num + '"/></w:numPr>';
    if (o.border) pp += '<w:pBdr><w:bottom w:val="single" w:sz="8" w:space="1" w:color="E5162D"/></w:pBdr>';
    if (o.quote) pp += '<w:pBdr><w:left w:val="single" w:sz="18" w:space="8" w:color="E5162D"/></w:pBdr>';
    if (rtl) pp += '<w:bidi/>';
    if (o.after != null) pp += '<w:spacing w:before="0" w:after="' + o.after + '"/>';
    if (o.quote) pp += '<w:ind w:left="360"/>';
    if (o.center) pp += '<w:jc w:val="center"/>';
    return '<w:p>' + (pp ? '<w:pPr>' + pp + '</w:pPr>' : '') + runs(text, { rtl, bold: o.bold, color: o.color, size: o.size }) + '</w:p>';
  };
  const table = rows => {
    const n = Math.max(...rows.map(r => r.length)), w = Math.floor(9026 / n);
    const rtl = ofRtl(rows.map(r => r.join(' ')).join(' '));
    let x = '<w:tbl><w:tblPr>' + (rtl ? '<w:bidiVisual/>' : '') + '<w:tblW w:w="5000" w:type="pct"/><w:tblBorders>' +
      ['top', 'left', 'bottom', 'right', 'insideH', 'insideV'].map(s => '<w:' + s + ' w:val="single" w:sz="4" w:space="0" w:color="BFBFBF"/>').join('') +
      '</w:tblBorders><w:tblLayout w:type="fixed"/><w:tblCellMar><w:top w:w="60" w:type="dxa"/><w:left w:w="100" w:type="dxa"/><w:bottom w:w="60" w:type="dxa"/><w:right w:w="100" w:type="dxa"/></w:tblCellMar></w:tblPr><w:tblGrid>' +
      '<w:gridCol w:w="' + w + '"/>'.repeat(n) + '</w:tblGrid>';
    rows.forEach((r, ri) => {
      x += '<w:tr>' + (ri === 0 ? '<w:trPr><w:tblHeader/></w:trPr>' : '');
      for (let c = 0; c < n; c++) {
        const t = r[c] || '';
        x += '<w:tc><w:tcPr><w:tcW w:w="' + w + '" w:type="dxa"/>' + (ri === 0 ? '<w:shd w:val="clear" w:color="auto" w:fill="E5162D"/>' : ri % 2 === 0 ? '<w:shd w:val="clear" w:color="auto" w:fill="F7F7F7"/>' : '') + '</w:tcPr>' +
          para(t, { after: 0, bold: ri === 0, color: ri === 0 ? 'FFFFFF' : '' }) + '</w:tc>';
      }
      x += '</w:tr>';
    });
    return x + '</w:tbl>' + '<w:p><w:pPr><w:spacing w:before="0" w:after="120"/></w:pPr></w:p>';
  };

  const lines = String(md || '').replace(/\r/g, '').split('\n'); let body = '', i = 0, ol = null, firstH = true;
  const isRow = l => /^\s*\|.*\|\s*$/.test(l), isSep = l => /^\s*\|[\s:|-]+\|\s*$/.test(l);
  const cells = l => l.trim().replace(/^\||\|$/g, '').split('|').map(c => c.trim());
  while (i < lines.length) {
    const L = lines[i]; let m;
    if (/^\s*```/.test(L)) { // code block
      const code = []; i++;
      while (i < lines.length && !/^\s*```/.test(lines[i])) code.push(lines[i++]);
      i++; ol = null;
      code.forEach(c => { body += '<w:p><w:pPr><w:shd w:val="clear" w:color="auto" w:fill="F2F2F2"/><w:spacing w:before="0" w:after="0"/></w:pPr><w:r><w:rPr><w:rFonts w:ascii="Consolas" w:hAnsi="Consolas" w:cs="Consolas"/><w:sz w:val="19"/></w:rPr><w:t xml:space="preserve">' + XE(c) + '</w:t></w:r></w:p>'; });
      body += '<w:p><w:pPr><w:spacing w:before="0" w:after="80"/></w:pPr></w:p>';
      continue;
    }
    if (isRow(L) && i + 1 < lines.length && isSep(lines[i + 1])) {
      const rows = [cells(L)]; i += 2;
      while (i < lines.length && isRow(lines[i])) rows.push(cells(lines[i++]));
      body += table(rows); ol = null; continue;
    }
    if ((m = L.match(/^\s*(#{1,6})\s+(.*)/))) {
      const lv = Math.min(m[1].length, 3); ol = null;
      if (lv === 1 && firstH) { body += para(ofStrip(m[2]), { style: 'Title' }); firstH = false; }
      else body += para(m[2].replace(/\*\*/g, ''), { style: 'Heading' + lv });
    } else if (/^\s*([-*_])\1{2,}\s*$/.test(L)) { body += para('', { border: 1, after: 120 }); ol = null; }
    else if ((m = L.match(/^(\s*)[-*•]\s+(.*)/))) { body += para(m[2], { style: 'ListParagraph', num: 1, lvl: Math.min(2, Math.floor(m[1].length / 2)) }); ol = null; }
    else if ((m = L.match(/^(\s*)(\d+)[.)]\s+(.*)/))) {
      if (!ol) { nums.push(+m[2] || 1); ol = nums.length + 2; }
      body += para(m[3], { style: 'ListParagraph', num: ol, lvl: Math.min(2, Math.floor(m[1].length / 3)) });
    } else if ((m = L.match(/^\s*>\s?(.*)/))) { body += para(m[1], { quote: 1 }); ol = null; }
    else if (!L.trim()) { /* blank */ }
    else { body += para(L.trim()); ol = null; }
    i++;
  }
  if (!body) body = para(' ');

  const sect = '<w:sectPr><w:footerReference w:type="default" r:id="rIdF"/><w:pgSz w:w="11906" w:h="16838"/><w:pgMar w:top="1440" w:right="1440" w:bottom="1440" w:left="1440" w:header="720" w:footer="720" w:gutter="0"/></w:sectPr>';
  const NS = 'xmlns:w="http://schemas.openxmlformats.org/wordprocessingml/2006/main" xmlns:r="http://schemas.openxmlformats.org/officeDocument/2006/relationships"';
  const doc = XHEAD + '<w:document ' + NS + '><w:body>' + body + sect + '</w:body></w:document>';
  const sd = (id, name, based, ppr, rpr, extra) => '<w:style w:type="paragraph" w:styleId="' + id + '"><w:name w:val="' + name + '"/>' + (based ? '<w:basedOn w:val="' + based + '"/>' : '') + (extra || '') + '<w:qFormat/>' + (ppr ? '<w:pPr>' + ppr + '</w:pPr>' : '') + (rpr ? '<w:rPr>' + rpr + '</w:rPr>' : '') + '</w:style>';
  const styles = XHEAD + '<w:styles xmlns:w="http://schemas.openxmlformats.org/wordprocessingml/2006/main"><w:docDefaults><w:rPrDefault><w:rPr><w:rFonts w:ascii="Calibri" w:hAnsi="Calibri" w:eastAsia="Calibri" w:cs="Arial"/><w:sz w:val="22"/><w:szCs w:val="24"/><w:lang w:val="en-US" w:eastAsia="en-US" w:bidi="ur-PK"/></w:rPr></w:rPrDefault><w:pPrDefault><w:pPr><w:spacing w:after="120" w:line="276" w:lineRule="auto"/></w:pPr></w:pPrDefault></w:docDefaults>' +
    '<w:style w:type="paragraph" w:default="1" w:styleId="Normal"><w:name w:val="Normal"/><w:qFormat/></w:style>' +
    sd('Title', 'Title', 'Normal', '<w:keepNext/><w:pBdr><w:bottom w:val="single" w:sz="12" w:space="4" w:color="E5162D"/></w:pBdr><w:spacing w:before="0" w:after="240"/>', '<w:b/><w:bCs/><w:color w:val="1F1F1F"/><w:sz w:val="48"/><w:szCs w:val="48"/>') +
    sd('Heading1', 'heading 1', 'Normal', '<w:keepNext/><w:spacing w:before="360" w:after="120"/><w:outlineLvl w:val="0"/>', '<w:b/><w:bCs/><w:color w:val="C40F25"/><w:sz w:val="34"/><w:szCs w:val="34"/>') +
    sd('Heading2', 'heading 2', 'Normal', '<w:keepNext/><w:spacing w:before="280" w:after="100"/><w:outlineLvl w:val="1"/>', '<w:b/><w:bCs/><w:color w:val="333333"/><w:sz w:val="28"/><w:szCs w:val="28"/>') +
    sd('Heading3', 'heading 3', 'Normal', '<w:keepNext/><w:spacing w:before="200" w:after="80"/><w:outlineLvl w:val="2"/>', '<w:b/><w:bCs/><w:color w:val="555555"/><w:sz w:val="24"/><w:szCs w:val="24"/>') +
    sd('ListParagraph', 'List Paragraph', 'Normal', '<w:spacing w:after="60"/><w:contextualSpacing/>', '') +
    '</w:styles>';
  const lvl = (n, fmt, txt, left, start) => '<w:lvl w:ilvl="' + n + '"><w:start w:val="' + (start || 1) + '"/><w:numFmt w:val="' + fmt + '"/><w:lvlText w:val="' + txt + '"/><w:lvlJc w:val="left"/><w:pPr><w:ind w:left="' + left + '" w:hanging="360"/></w:pPr></w:lvl>';
  let numbering = XHEAD + '<w:numbering xmlns:w="http://schemas.openxmlformats.org/wordprocessingml/2006/main">' +
    '<w:abstractNum w:abstractNumId="0"><w:multiLevelType w:val="hybridMultilevel"/>' + lvl(0, 'bullet', '•', 720) + lvl(1, 'bullet', '◦', 1080) + lvl(2, 'bullet', '▪', 1440) + '</w:abstractNum>' +
    '<w:abstractNum w:abstractNumId="1"><w:multiLevelType w:val="hybridMultilevel"/>' + lvl(0, 'decimal', '%1.', 720) + lvl(1, 'lowerLetter', '%2.', 1080) + lvl(2, 'lowerRoman', '%3.', 1440) + '</w:abstractNum>' +
    '<w:num w:numId="1"><w:abstractNumId w:val="0"/></w:num><w:num w:numId="2"><w:abstractNumId w:val="1"/></w:num>';
  nums.forEach((st, k) => { numbering += '<w:num w:numId="' + (k + 3) + '"><w:abstractNumId w:val="1"/><w:lvlOverride w:ilvl="0"><w:startOverride w:val="' + st + '"/></w:lvlOverride></w:num>'; });
  numbering += '</w:numbering>';
  const footer = XHEAD + '<w:ftr ' + NS + '><w:p><w:pPr><w:jc w:val="center"/></w:pPr><w:r><w:rPr><w:color w:val="888888"/><w:sz w:val="18"/></w:rPr><w:fldChar w:fldCharType="begin"/></w:r><w:r><w:rPr><w:color w:val="888888"/><w:sz w:val="18"/></w:rPr><w:instrText xml:space="preserve"> PAGE </w:instrText></w:r><w:r><w:rPr><w:color w:val="888888"/><w:sz w:val="18"/></w:rPr><w:fldChar w:fldCharType="separate"/></w:r><w:r><w:rPr><w:color w:val="888888"/><w:sz w:val="18"/></w:rPr><w:t>1</w:t></w:r><w:r><w:rPr><w:color w:val="888888"/><w:sz w:val="18"/></w:rPr><w:fldChar w:fldCharType="end"/></w:r></w:p></w:ftr>';
  const R = 'http://schemas.openxmlformats.org/officeDocument/2006/relationships/';
  const rels = XHEAD + '<Relationships xmlns="http://schemas.openxmlformats.org/package/2006/relationships">' +
    '<Relationship Id="rIdS" Type="' + R + 'styles" Target="styles.xml"/><Relationship Id="rIdN" Type="' + R + 'numbering" Target="numbering.xml"/><Relationship Id="rIdF" Type="' + R + 'footer" Target="footer1.xml"/>' +
    links.map((u, k) => '<Relationship Id="rIdL' + (k + 1) + '" Type="' + R + 'hyperlink" Target="' + XE(u) + '" TargetMode="External"/>').join('') + '</Relationships>';
  const W = 'application/vnd.openxmlformats-officedocument.wordprocessingml.';
  const ct = XHEAD + '<Types xmlns="http://schemas.openxmlformats.org/package/2006/content-types"><Default Extension="rels" ContentType="application/vnd.openxmlformats-package.relationships+xml"/><Default Extension="xml" ContentType="application/xml"/>' +
    '<Override PartName="/word/document.xml" ContentType="' + W + 'document.main+xml"/><Override PartName="/word/styles.xml" ContentType="' + W + 'styles+xml"/><Override PartName="/word/numbering.xml" ContentType="' + W + 'numbering+xml"/><Override PartName="/word/footer1.xml" ContentType="' + W + 'footer+xml"/>' +
    '<Override PartName="/docProps/core.xml" ContentType="application/vnd.openxmlformats-package.core-properties+xml"/></Types>';
  const root = XHEAD + '<Relationships xmlns="http://schemas.openxmlformats.org/package/2006/relationships"><Relationship Id="rId1" Type="' + R + 'officeDocument" Target="word/document.xml"/><Relationship Id="rId2" Type="http://schemas.openxmlformats.org/package/2006/relationships/metadata/core-properties" Target="docProps/core.xml"/></Relationships>';
  const now = new Date().toISOString().replace(/\.\d+Z$/, 'Z');
  const core = XHEAD + '<cp:coreProperties xmlns:cp="http://schemas.openxmlformats.org/package/2006/metadata/core-properties" xmlns:dc="http://purl.org/dc/elements/1.1/" xmlns:dcterms="http://purl.org/dc/terms/" xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance"><dc:title>' + XE(opt.title || '') + '</dc:title><dc:creator>CUTE-S AI</dc:creator><dcterms:created xsi:type="dcterms:W3CDTF">' + now + '</dcterms:created></cp:coreProperties>';
  return ofZip([
    { name: '[Content_Types].xml', data: ct }, { name: '_rels/.rels', data: root },
    { name: 'word/document.xml', data: doc }, { name: 'word/styles.xml', data: styles }, { name: 'word/numbering.xml', data: numbering },
    { name: 'word/footer1.xml', data: footer }, { name: 'word/_rels/document.xml.rels', data: rels }, { name: 'docProps/core.xml', data: core }
  ], OF_MIME.docx);
}

/* =====================================================================
   EXCEL (.xlsx)  -  JSON spec -> real workbook (styled, formulas, filters)
   ===================================================================== */
function xlCol(n) { let s = ''; n++; while (n > 0) { const m = (n - 1) % 26; s = String.fromCharCode(65 + m) + s; n = Math.floor((n - 1) / 26); } return s; }
function xlColNum(s) { let n = 0; for (const ch of s) n = n * 26 + ch.charCodeAt(0) - 64; return n - 1; }

/* tiny, safe formula evaluator so numbers show even in viewers that do not recalculate */
function xlEvalFormula(f, get, depth) {
  try {
    if (depth > 20) return null;
    let e = String(f);
    if (/["'`;{}\[\]\\&%$@#?]/.test(e)) return null;
    e = e.replace(/<>/g, '!=').replace(/\^/g, '**').replace(/(^|[^<>!=])=(?!=)/g, '$1==');
    e = e.replace(/\b([A-Z]{1,3})(\d{1,5}):([A-Z]{1,3})(\d{1,5})\b/g, (m, a, b, c, d) => '__r(' + xlColNum(a) + ',' + (+b - 1) + ',' + xlColNum(c) + ',' + (+d - 1) + ')');
    e = e.replace(/\b([A-Z]{1,3})(\d{1,5})\b(?!\s*\()/g, (m, a, b) => '__c(' + xlColNum(a) + ',' + (+b - 1) + ')');
    const ids = e.match(/[A-Za-z_]\w*/g) || [];
    const OK = ['SUM', 'AVERAGE', 'MIN', 'MAX', 'COUNT', 'ROUND', 'ABS', 'IF', 'TRUE', 'FALSE', '__r', '__c'];
    if (ids.some(x => !OK.map(o => o.toUpperCase()).includes(x.toUpperCase()))) return null;
    const flat = a => a.flat(Infinity).filter(v => typeof v === 'number' && isFinite(v));
    const env = {
      __c: (c, r) => { const v = get(c, r, depth + 1); return typeof v === 'number' ? v : (v == null || v === '' ? 0 : NaN); },
      __r: (c1, r1, c2, r2) => { const o = []; for (let r = r1; r <= r2; r++) for (let c = c1; c <= c2; c++) o.push(get(c, r, depth + 1)); return o; },
      SUM: (...a) => flat(a).reduce((x, y) => x + y, 0), AVERAGE: (...a) => { const v = flat(a); return v.length ? v.reduce((x, y) => x + y, 0) / v.length : NaN; },
      MIN: (...a) => Math.min(...flat(a)), MAX: (...a) => Math.max(...flat(a)), COUNT: (...a) => flat(a).length,
      ROUND: (x, n) => { const k = Math.pow(10, n || 0); return Math.round(x * k) / k; }, ABS: Math.abs, IF: (c, a, b) => c ? a : b, TRUE: true, FALSE: false
    };
    const names = Object.keys(env), up = e.replace(/[A-Za-z_]\w*/g, x => x.startsWith('__') ? x : x.toUpperCase());
    const v = new Function(...names, '"use strict";return (' + up + ');')(...names.map(n => env[n]));
    return typeof v === 'number' && isFinite(v) ? v : null;
  } catch (e) { return null; }
}

function specToXlsx(spec) {
  const used = new Set(), sheets = [];
  (spec.sheets || []).slice(0, 8).forEach((s, idx) => {
    let name = String(s.name || 'Sheet' + (idx + 1)).replace(/[\[\]:*?\/\\]/g, ' ').trim().slice(0, 31) || 'Sheet' + (idx + 1);
    let k = 2, base = name; while (used.has(name.toLowerCase())) name = base.slice(0, 28) + ' ' + k++;
    used.add(name.toLowerCase());
    const rows = (s.rows || []).slice(0, 1000).map(r => Array.isArray(r) ? r.slice(0, 50) : Object.values(r || {}).slice(0, 50));
    if (rows.length) sheets.push({ name, rows });
  });
  if (!sheets.length) throw new Error('empty spreadsheet');
  const files = [];
  sheets.forEach((sh, si) => {
    const rows = sh.rows, nc = Math.max(...rows.map(r => r.length), 1);
    const grid = (c, r, d) => { const v = rows[r] && rows[r][c]; if (typeof v === 'string' && /^=./.test(v)) return xlEvalFormula(v.slice(1), grid, d || 0); if (typeof v === 'string' && /^-?\d+(\.\d+)?$/.test(v.trim())) return +v; return v; };
    const widths = Array(nc).fill(8);
    rows.forEach(r => r.forEach((v, c) => { const len = typeof v === 'string' && v[0] === '=' ? 12 : String(v == null ? '' : v).length; widths[c] = Math.max(widths[c], Math.min(48, len + 2)); }));
    const isTotal = r => /^(total|grand total|sum|subtotal|kul|majmua|مجموعہ|کل)\b/i.test(String(r[0] == null ? '' : r[0]).trim());
    let lastData = rows.length - 1; while (lastData > 0 && isTotal(rows[lastData])) lastData--;
    let sd = '';
    rows.forEach((r, ri) => {
      const total = ri > 0 && isTotal(r), st = ri === 0 ? 1 : total ? 5 : (ri % 2 === 0 ? 3 : 2);
      let cs = '';
      for (let c = 0; c < nc; c++) {
        const v = r[c], ref = xlCol(c) + (ri + 1);
        if (v === null || v === undefined || v === '') { cs += '<c r="' + ref + '" s="' + st + '"/>'; continue; }
        if (typeof v === 'number' && isFinite(v)) { cs += '<c r="' + ref + '" s="' + st + '"><v>' + v + '</v></c>'; continue; }
        if (typeof v === 'boolean') { cs += '<c r="' + ref + '" s="' + st + '" t="b"><v>' + (v ? 1 : 0) + '</v></c>'; continue; }
        const t = String(v);
        if (/^=./.test(t) && !/^==/.test(t)) { const cv = xlEvalFormula(t.slice(1), grid, 0); cs += '<c r="' + ref + '" s="' + st + '"><f>' + XE(t.slice(1)) + '</f>' + (cv != null ? '<v>' + cv + '</v>' : '') + '</c>'; continue; }
        if (ri > 0 && /^-?\d+(\.\d+)?$/.test(t.trim())) { cs += '<c r="' + ref + '" s="' + st + '"><v>' + t.trim() + '</v></c>'; continue; }
        cs += '<c r="' + ref + '" s="' + st + '" t="inlineStr"><is><t xml:space="preserve">' + XE(t) + '</t></is></c>';
      }
      sd += '<row r="' + (ri + 1) + '"' + (ri === 0 ? ' ht="24" customHeight="1"' : '') + '>' + cs + '</row>';
    });
    const rtl = ofRtl((rows[0] || []).join(' '));
    const xml = XHEAD + '<worksheet xmlns="http://schemas.openxmlformats.org/spreadsheetml/2006/main"><dimension ref="A1:' + xlCol(nc - 1) + rows.length + '"/>' +
      '<sheetViews><sheetView workbookViewId="0"' + (rtl ? ' rightToLeft="1"' : '') + (si === 0 ? ' tabSelected="1"' : '') + '>' + (rows.length > 1 ? '<pane ySplit="1" topLeftCell="A2" activePane="bottomLeft" state="frozen"/>' : '') + '</sheetView></sheetViews>' +
      '<sheetFormatPr defaultRowHeight="15"/><cols>' + widths.map((w, c) => '<col min="' + (c + 1) + '" max="' + (c + 1) + '" width="' + (w * 1.15).toFixed(1) + '" customWidth="1"/>').join('') + '</cols>' +
      '<sheetData>' + sd + '</sheetData>' + (rows.length > 2 ? '<autoFilter ref="A1:' + xlCol(nc - 1) + (lastData + 1) + '"/>' : '') + '</worksheet>';
    files.push({ name: 'xl/worksheets/sheet' + (si + 1) + '.xml', data: xml });
  });
  const S = 'application/vnd.openxmlformats-officedocument.spreadsheetml.', R = 'http://schemas.openxmlformats.org/officeDocument/2006/relationships/';
  const ct = XHEAD + '<Types xmlns="http://schemas.openxmlformats.org/package/2006/content-types"><Default Extension="rels" ContentType="application/vnd.openxmlformats-package.relationships+xml"/><Default Extension="xml" ContentType="application/xml"/><Override PartName="/xl/workbook.xml" ContentType="' + S + 'sheet.main+xml"/><Override PartName="/xl/styles.xml" ContentType="' + S + 'styles+xml"/>' +
    sheets.map((s, i) => '<Override PartName="/xl/worksheets/sheet' + (i + 1) + '.xml" ContentType="' + S + 'worksheet+xml"/>').join('') + '</Types>';
  const root = XHEAD + '<Relationships xmlns="http://schemas.openxmlformats.org/package/2006/relationships"><Relationship Id="rId1" Type="' + R + 'officeDocument" Target="xl/workbook.xml"/></Relationships>';
  const wb = XHEAD + '<workbook xmlns="http://schemas.openxmlformats.org/spreadsheetml/2006/main" xmlns:r="' + 'http://schemas.openxmlformats.org/officeDocument/2006/relationships' + '"><bookViews><workbookView/></bookViews><sheets>' +
    sheets.map((s, i) => '<sheet name="' + XE(s.name) + '" sheetId="' + (i + 1) + '" r:id="rId' + (i + 1) + '"/>').join('') + '</sheets><calcPr calcId="191029" fullCalcOnLoad="1"/></workbook>';
  const wbr = XHEAD + '<Relationships xmlns="http://schemas.openxmlformats.org/package/2006/relationships">' +
    sheets.map((s, i) => '<Relationship Id="rId' + (i + 1) + '" Type="' + R + 'worksheet" Target="worksheets/sheet' + (i + 1) + '.xml"/>').join('') + '<Relationship Id="rId' + (sheets.length + 1) + '" Type="' + R + 'styles" Target="styles.xml"/></Relationships>';
  const bd = '<border><left style="thin"><color rgb="FFD9D9D9"/></left><right style="thin"><color rgb="FFD9D9D9"/></right><top style="thin"><color rgb="FFD9D9D9"/></top><bottom style="thin"><color rgb="FFD9D9D9"/></bottom><diagonal/></border>';
  const fill = c => '<fill><patternFill patternType="solid"><fgColor rgb="FF' + c + '"/><bgColor indexed="64"/></patternFill></fill>';
  const styles = XHEAD + '<styleSheet xmlns="http://schemas.openxmlformats.org/spreadsheetml/2006/main">' +
    '<fonts count="4"><font><sz val="11"/><name val="Calibri"/></font><font><b/><sz val="11"/><color rgb="FFFFFFFF"/><name val="Calibri"/></font><font><b/><sz val="14"/><name val="Calibri"/></font><font><b/><sz val="11"/><name val="Calibri"/></font></fonts>' +
    '<fills count="5"><fill><patternFill patternType="none"/></fill><fill><patternFill patternType="gray125"/></fill>' + fill('E5162D') + fill('FFF3F5') + fill('FFE3E8') + '</fills>' +
    '<borders count="2"><border><left/><right/><top/><bottom/><diagonal/></border>' + bd + '</borders>' +
    '<cellStyleXfs count="1"><xf numFmtId="0" fontId="0" fillId="0" borderId="0"/></cellStyleXfs>' +
    '<cellXfs count="6"><xf numFmtId="0" fontId="0" fillId="0" borderId="0" xfId="0"/>' +
    '<xf numFmtId="0" fontId="1" fillId="2" borderId="1" xfId="0" applyFont="1" applyFill="1" applyBorder="1" applyAlignment="1"><alignment horizontal="center" vertical="center" wrapText="1"/></xf>' +
    '<xf numFmtId="0" fontId="0" fillId="0" borderId="1" xfId="0" applyBorder="1" applyAlignment="1"><alignment vertical="center"/></xf>' +
    '<xf numFmtId="0" fontId="0" fillId="3" borderId="1" xfId="0" applyFill="1" applyBorder="1" applyAlignment="1"><alignment vertical="center"/></xf>' +
    '<xf numFmtId="0" fontId="2" fillId="0" borderId="0" xfId="0" applyFont="1"/>' +
    '<xf numFmtId="0" fontId="3" fillId="4" borderId="1" xfId="0" applyFont="1" applyFill="1" applyBorder="1" applyAlignment="1"><alignment vertical="center"/></xf></cellXfs>' +
    '<cellStyles count="1"><cellStyle name="Normal" xfId="0" builtinId="0"/></cellStyles></styleSheet>';
  return ofZip([{ name: '[Content_Types].xml', data: ct }, { name: '_rels/.rels', data: root }, { name: 'xl/workbook.xml', data: wb }, { name: 'xl/_rels/workbook.xml.rels', data: wbr }, { name: 'xl/styles.xml', data: styles }, ...files], OF_MIME.xlsx);
}

/* =====================================================================
   POWERPOINT (.pptx)  -  JSON spec -> deck (needs PptxGenJS loaded)
   ===================================================================== */
async function specToPptx(spec) {
  if (typeof PptxGenJS === 'undefined') throw new Error('PptxGenJS not loaded');
  const P = new PptxGenJS(); P.layout = 'LAYOUT_16x9'; P.title = String(spec.title || 'Presentation'); P.author = 'CUTE-S AI';
  const dark = spec.theme !== 'light', BG = dark ? '0B0B0B' : 'FFFFFF', TX = dark ? 'F6EEF0' : '1F1F1F', MU = dark ? 'C9A9B2' : '666666', AC = 'E5162D', HI = dark ? 'FF4258' : 'C40F25', CARD = dark ? '1C1C1C' : 'F4F4F4';
  const rtl = ofRtl([spec.title, spec.subtitle, ...(spec.slides || []).map(s => s.title)].join(' ')), FONT = rtl ? 'Arial' : 'Calibri', AL = rtl ? 'right' : 'left';
  const T = (s, o) => Object.assign({ fontFace: FONT, color: TX, rtlMode: rtl }, o, rtl ? { align: 'right' } : {});
  const s0 = P.addSlide(); s0.background = { color: BG };
  s0.addShape('rect', { x: 0, y: 0, w: 0.3, h: 5.625, fill: { color: AC }, line: { color: AC } });
  s0.addText(String(spec.title || 'Presentation').slice(0, 90), T(0, { x: 0.9, y: 1.4, w: 8.4, h: 1.6, fontSize: String(spec.title || '').length > 45 ? 32 : 42, bold: true, valign: 'middle', align: AL }));
  s0.addShape('rect', { x: rtl ? 8.1 : 0.9, y: 3.15, w: 1.2, h: 0.07, fill: { color: AC }, line: { color: AC } });
  if (spec.subtitle) s0.addText(String(spec.subtitle).slice(0, 140), T(0, { x: 0.9, y: 3.35, w: 8.4, h: 0.9, fontSize: 20, color: MU, valign: 'top', align: AL }));
  s0.addText('CUTE-S AI', { x: 0.9, y: 5.0, w: 3, h: 0.4, fontSize: 11, color: MU, fontFace: 'Calibri' });
  (spec.slides || []).slice(0, 30).forEach(sl => {
    const s = P.addSlide(); s.background = { color: BG };
    const title = String(sl.title || '').slice(0, 100);
    s.addShape('rect', { x: rtl ? 9.75 : 0, y: 0.4, w: 0.25, h: 0.7, fill: { color: AC }, line: { color: AC } });
    s.addText(title, T(0, { x: 0.5, y: 0.35, w: 9, h: 0.8, fontSize: title.length > 48 ? 22 : 28, bold: true, valign: 'middle', align: AL }));
    s.slideNumber = { x: 9.2, y: 5.2, color: MU, fontSize: 10 };
    const bl = (Array.isArray(sl.bullets) ? sl.bullets : []).map(x => ofStrip(String(x)).slice(0, 220)).filter(Boolean).slice(0, 8);
    const hasVis = (sl.chart && Array.isArray(sl.chart.labels)) || (Array.isArray(sl.table) && sl.table.length);
    const chars = bl.join('').length;
    if (bl.length) {
      const w = hasVis ? 3.8 : 9;
      const fs = hasVis ? (chars > 260 ? 13 : 15) : (chars > 520 ? 15 : chars > 360 ? 17 : 20);
      s.addText(bl.map(b => ({ text: b, options: { bullet: { code: '25CF' }, breakLine: true, paraSpaceAfter: 8 } })),
        T(0, { x: rtl && hasVis ? 5.7 : 0.5, y: 1.35, w, h: 3.7, fontSize: fs, valign: 'top', align: AL }));
    }
    if (sl.chart && Array.isArray(sl.chart.labels) && Array.isArray(sl.chart.values)) {
      const ty = ['bar', 'line', 'pie'].includes(sl.chart.type) ? sl.chart.type : 'bar', vals = sl.chart.values.map(Number).map(v => isFinite(v) ? v : 0);
      try {
        s.addChart(ty, [{ name: String(sl.chart.title || title).slice(0, 40), labels: sl.chart.labels.map(String), values: vals }], {
          x: bl.length ? (rtl ? 0.5 : 4.5) : 0.8, y: 1.35, w: bl.length ? 5 : 8.4, h: 3.7, chartColors: ty === 'pie' ? ['E5162D', 'FF7A8C', 'C40F25', 'FFB3BB', '9B0F22', 'FF4258', '7A0B1A', 'FFD6DB'] : [AC],
          showLegend: ty === 'pie', legendColor: TX, legendFontSize: 11, catAxisLabelColor: TX, valAxisLabelColor: TX, catAxisLabelFontSize: 11, valAxisLabelFontSize: 11,
          showValue: ty !== 'line', dataLabelColor: ty === 'pie' ? 'FFFFFF' : TX, dataLabelFontSize: 11, valGridLine: { color: dark ? '333333' : 'DDDDDD', size: 0.5 }
        });
      } catch (e) { }
    } else if (Array.isArray(sl.table) && sl.table.length) {
      const rows = sl.table.slice(0, 10).map(r => (Array.isArray(r) ? r : [r]).slice(0, 6).map(c => String(c == null ? '' : c).slice(0, 60)));
      const nc = Math.max(...rows.map(r => r.length));
      s.addTable(rows.map((r, ri) => Array.from({ length: nc }, (_, c) => ({ text: r[c] || '', options: ri === 0 ? { bold: true, color: 'FFFFFF', fill: { color: AC }, align: 'center' } : { color: TX, fill: { color: ri % 2 ? CARD : BG } } }))),
        { x: bl.length ? (rtl ? 0.4 : 4.4) : 0.6, y: 1.4, w: bl.length ? 5.2 : 8.8, fontSize: 13, fontFace: FONT, border: { type: 'solid', pt: 0.5, color: dark ? '444444' : 'BBBBBB' }, rtlMode: rtl });
    }
    if (sl.notes) s.addNotes(String(sl.notes).slice(0, 1500));
  });
  try { return await P.write({ outputType: 'blob' }); } catch (e) { return await P.write('blob'); }
}

/* =====================================================================
   Parsers / converters
   ===================================================================== */
function parseJsonLoose(s) {
  s = String(s || '').replace(/```(?:json)?/gi, '');
  const a = s.indexOf('{'), b = s.lastIndexOf('}'); if (a < 0 || b <= a) return null;
  let t = s.slice(a, b + 1);
  try { return JSON.parse(t); } catch (e) { }
  try { return JSON.parse(t.replace(/,\s*([}\]])/g, '$1')); } catch (e) { return null; }
}
function extractCode(s) {
  s = String(s || '');
  let m = s.match(/```[\w.+#-]*[ \t]*\n([\s\S]*?)\n?```/); if (m) return m[1].replace(/\s+$/, '');
  m = s.match(/```[\w.+#-]*[ \t]*\n([\s\S]*)$/); if (m) return m[1].replace(/\s+$/, '');
  return s.trim();
}
function parseProject(s) {
  const out = [], re = /^=== FILE: (.+?) ===[ \t]*\n([\s\S]*?)\n=== END ===/gm; let m;
  while ((m = re.exec(String(s || '')))) {
    let p = m[1].trim().replace(/\\/g, '/').replace(/^\/+/, '').replace(/\.\.+\//g, '');
    let body = m[2]; const f = body.match(/^```[\w.+#-]*\n([\s\S]*?)\n```\s*$/); if (f) body = f[1];
    if (p) out.push({ name: p.slice(0, 120), data: body });
  }
  return out;
}
function mdTables(md) {
  const L = String(md || '').split('\n'), out = []; let i = 0, h = '';
  const isRow = l => /^\s*\|.*\|\s*$/.test(l), isSep = l => /^\s*\|[\s:|-]+\|\s*$/.test(l), cells = l => l.trim().replace(/^\||\|$/g, '').split('|').map(c => ofStrip(c.trim()));
  while (i < L.length) {
    const hm = L[i].match(/^\s*#{1,6}\s+(.*)/); if (hm) h = ofStrip(hm[1]);
    if (isRow(L[i]) && i + 1 < L.length && isSep(L[i + 1])) {
      const rows = [cells(L[i])]; i += 2;
      while (i < L.length && isRow(L[i])) rows.push(cells(L[i++]).map(c => c !== '' && !isNaN(c.replace(/,/g, '')) ? Number(c.replace(/,/g, '')) : c));
      out.push({ name: h || 'Table ' + (out.length + 1), rows });
    } else i++;
  }
  return out;
}
function mdToXlsxSpec(md) { const t = mdTables(md); return t.length ? { sheets: t } : null; }
function mdToPptSpec(md) {
  const slides = []; let cur = null, title = '', sub = '';
  String(md || '').replace(/```[\s\S]*?```/g, '').split('\n').forEach(l => {
    const m = l.match(/^\s*(#{1,4})\s+(.*)/);
    if (m) { const t = ofStrip(m[2]); if (m[1].length === 1 && !title) title = t; else { cur = { title: t, bullets: [] }; slides.push(cur); } }
    else if (l.trim() && !/^\s*\|/.test(l) && !/^\s*([-*_])\1{2,}\s*$/.test(l)) { const t = ofStrip(l); if (!t) return; if (!cur) { if (!sub && !title) { } cur = { title: title || 'Overview', bullets: [] }; slides.push(cur); } cur.bullets.push(t.slice(0, 200)); }
  });
  const out = []; slides.forEach(s => { for (let i = 0; i < Math.max(1, s.bullets.length); i += 6) out.push({ title: s.title + (i ? ' (cont.)' : ''), bullets: s.bullets.slice(i, i + 6) }); });
  return { title: title || (out[0] && out[0].title) || 'Presentation', subtitle: 'Made with CUTE-S AI', theme: 'dark', slides: out };
}
function ofFileName(base, ext) {
  let n = String(base || 'cute-s-ai').replace(/[\\/:*?"<>|#%&{}$!'@+`=\n\r\t]/g, ' ').replace(/\s+/g, ' ').trim().slice(0, 48).trim().replace(/[. ]+$/, '');
  return (n || 'cute-s-ai').replace(/ /g, '-') + '.' + ext;
}
const ofFmtSize = n => n < 1024 ? n + ' B' : n < 1048576 ? (n / 1024).toFixed(1) + ' KB' : (n / 1048576).toFixed(1) + ' MB';

/* =====================================================================
   Intent detection + image flags (pure, used by cmd.js)
   ===================================================================== */
const OF_START = /^(?:(?:please|plz|pls|kindly|ek|mujhe|mujh ko|mere liye|meray liye|can you|could you|will you|zara|i want|i need|mujhe chahiye)\s+)*(?:make|create|generate|build|prepare|write|design|banao|bana|bnao|banado|tayyar|likho|likh)\b/i;
const OF_END = /\b(?:bana|banao|bnao|banado|banadein|bana do|bana dein|bana den|banaye|banaiye|tayyar kar|tayar kar)\b|بنا/i;
const OF_TYPES = [
  ['pptx', /\b(?:power\s?point|pptx?|slides?|presentation)\b|پریزنٹیشن|سلائیڈ/i],
  ['xlsx', /\b(?:excel|xlsx?|spread\s?sheet)\b|ایکسل/i],
  ['docx', /\b(?:docx?|ms word|microsoft word|word (?:file|document|doc)|word (?:me|mein|ma|main))\b|ورڈ (?:فائل|ڈاکومنٹ)/i],
  ['pdf', /\bpdf\b|پی ڈی ایف/i],
  ['csv', /\bcsv\b/i],
  ['txt', /\b(?:txt|text file)\b/i],
  ['html', /\b(?:html (?:file|page)|web ?page)\b/i],
  ['zip', /\bzip\b/i]
];
const OF_TPLS = [['resume', /\b(?:resume|cv|biodata)\b/i, 'docx'], ['invoice', /\binvoice\b/i, 'xlsx'], ['timetable', /\b(?:timetable|time table|datesheet)\b/i, 'xlsx'], ['budget', /\bbudget\b/i, 'xlsx']];
function ofIntent(q) {
  q = String(q || '').trim(); if (!q || q.length > 600) return null;
  const gate = OF_START.test(q) || OF_END.test(q);
  if (!gate) return null;
  if (/^(?:how|kaise|kese|what|why|kya)\b/i.test(q)) return null;
  const codey = /\b(?:python|java|javascript|c\+\+|code|program|script|function|library|api|react|node)\b/i.test(q);
  let kind = null; for (const [k, re] of OF_TYPES) if (re.test(q)) { kind = k; break; }
  let tpl = null; for (const [t, re, k] of OF_TPLS) if (re.test(q) && (kind || (!/^\s*(?:please\s+)?write\b/i.test(q) && OF_START.test(q) || OF_END.test(q)))) { tpl = t; if (!kind) kind = k; break; }
  if (kind && !(codey && ['pdf', 'csv', 'docx', 'xlsx', 'txt', 'html'].includes(kind) && !tpl)) return { type: 'file', kind, tpl };
  const sk = /\b(?:quiz|mcqs?)\b/i.test(q) ? 'quiz' : /\bflash ?cards?\b/i.test(q) ? 'cards' : null;
  if (sk) return { type: 'study', kind: sk };
  return null;
}
function ofImgFlags(q, ratios, styles) {
  let ratio = null, n = null, style = null;
  const al = { '3d': 'd3', cartoon: 'cart', pixel: 'pix', real: 'real', realistic: 'real', anime: 'anime', sketch: 'sketch', neon: 'neon', flat: 'flat', logo: 'logo', sticker: 'sticker', islamic: 'islamic', watercolor: 'water', oil: 'oil', diagram: 'edu', study: 'edu', auto: 'auto' };
  q = String(q || '').replace(/(?:^|\s)--?([\w:]+)(?=\s|$)/g, (m, t) => {
    t = t.toLowerCase();
    const rk = Object.keys(ratios).find(k => ratios[k][1] + ':' + ratios[k][2] === t); if (rk) { ratio = rk; return ' '; }
    const nm = t.match(/^x([1-4])$/); if (nm) { n = +nm[1]; return ' '; }
    if (al[t] && styles[al[t]]) { style = al[t]; return ' '; }
    if (styles[t]) { style = t; return ' '; }
    return m;
  });
  return { q: q.replace(/\s+/g, ' ').trim(), ratio, n, style };
}

import {
  FORMAT_CHAR
} from "./chunk-WVQQCD4M.js";
import "./chunk-BR5K6SBL.js";
import {
  withDeadline
} from "./chunk-D2NTLAKL.js";
import {
  needsTableData,
  visualLines
} from "./chunk-F6RMRXIN.js";
import {
  altOf,
  cellVisuals,
  figures,
  parseColor
} from "./chunk-MXR6JBMP.js";
import {
  asciiUrl,
  drillUrl,
  safeUrl
} from "./chunk-72S6DETS.js";
import {
  IMAGE_LIMITS,
  PDFArray,
  PDFBool,
  PDFDict,
  PDFDocument,
  PDFHexString,
  PDFName,
  PDFNumber,
  PDFRawStream,
  PDFStream,
  PDFString,
  concatTransformationMatrix,
  dataUriBytes,
  dataUriBytesOf,
  embeddedFace,
  fontCss,
  fontkit,
  imageInfoOf,
  isStandard,
  loadFontkit,
  loadPdfLib,
  modelFontKeys,
  popGraphicsState,
  pushGraphicsState,
  rgb,
  svgLength,
  svgRootAttrs,
  xmlAttrs,
  xmlTags
} from "./chunk-JQTRDHQP.js";
import "./chunk-GJS242RR.js";

// src/exporters/pdfa.js
var xml = (s) => String(s).replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
function makePdfA(doc, { icc, title = "Report", author, created = /* @__PURE__ */ new Date(), conformance = "B", ua = false, id } = {}) {
  if (!icc?.length) throw new Error("PDF/A needs an sRGB colour profile: pass pdfa.icc (public/icc/sRGB-v2-magic.icc)");
  const when = new Date(Math.floor(created.getTime() / 1e3) * 1e3);
  const stamp = when.toISOString().replace(".000Z", "Z");
  doc.setTitle(title);
  doc.setProducer("ReportWright");
  doc.setCreator("ReportWright");
  if (author) doc.setAuthor(author);
  setInfoDates(doc, when);
  setMetadata(doc, xmpPacket({ title, author, stamp, pdfa: conformance, ua }));
  const ctx = doc.context;
  const profile = ctx.register(ctx.flateStream(icc, { N: 3 }));
  const intent = ctx.register(ctx.obj({ Type: "OutputIntent", S: "GTS_PDFA1", OutputConditionIdentifier: PDFString.of("sRGB"), Info: PDFString.of("sRGB IEC61966-2.1"), DestOutputProfile: profile }));
  doc.catalog.set(PDFName.of("OutputIntents"), ctx.obj([intent]));
  for (const page of doc.getPages()) {
    const annots = page.node.lookup(PDFName.of("Annots"));
    if (!(annots instanceof PDFArray)) continue;
    for (let i = 0; i < annots.size(); i++) {
      const a = annots.lookup(i);
      if (!(a instanceof PDFDict)) continue;
      const f = a.lookup(PDFName.of("F"));
      const flags = f instanceof PDFNumber ? f.asNumber() : 0;
      a.set(PDFName.of("F"), PDFNumber.of((flags | 4) & ~(1 | 2 | 32 | 256)));
    }
  }
  const acro = doc.catalog.lookup(PDFName.of("AcroForm"));
  if (acro instanceof PDFDict) acro.delete(PDFName.of("NeedAppearances"));
  const fileId = id ?? Array.from(crypto.getRandomValues(new Uint8Array(16)), (b) => b.toString(16).padStart(2, "0")).join("").toUpperCase();
  ctx.trailerInfo.ID = ctx.obj([PDFHexString.of(fileId), PDFHexString.of(fileId)]);
}
function setInfoDates(doc, when) {
  const s = new Date(Math.floor(when.getTime() / 1e3) * 1e3).toISOString().replace(/\D/g, "").slice(0, 14);
  const info = (
    /** @type {any} */
    doc.getInfoDict()
  );
  info.set(PDFName.of("CreationDate"), PDFString.of(`D:${s}+00'00'`));
  info.set(PDFName.of("ModDate"), PDFString.of(`D:${s}+00'00'`));
}
function xmpPacket({ title, author, stamp, pdfa = null, ua = false }) {
  return `<?xpacket begin="\uFEFF" id="W5M0MpCehiHzreSzNTczkc9d"?>
<x:xmpmeta xmlns:x="adobe:ns:meta/">
<rdf:RDF xmlns:rdf="http://www.w3.org/1999/02/22-rdf-syntax-ns#">
${pdfa ? `<rdf:Description rdf:about="" xmlns:pdfaid="http://www.aiim.org/pdfa/ns/id/"><pdfaid:part>2</pdfaid:part><pdfaid:conformance>${pdfa}</pdfaid:conformance></rdf:Description>
` : ""}${ua ? `<rdf:Description rdf:about="" xmlns:pdfuaid="http://www.aiim.org/pdfua/ns/id/"><pdfuaid:part>1</pdfuaid:part></rdf:Description>
` : ""}${ua && pdfa ? PDFUA_SCHEMA : ""}<rdf:Description rdf:about="" xmlns:dc="http://purl.org/dc/elements/1.1/"><dc:format>application/pdf</dc:format><dc:title><rdf:Alt><rdf:li xml:lang="x-default">${xml(title)}</rdf:li></rdf:Alt></dc:title>${author ? `<dc:creator><rdf:Seq><rdf:li>${xml(author)}</rdf:li></rdf:Seq></dc:creator>` : ""}</rdf:Description>
<rdf:Description rdf:about="" xmlns:xmp="http://ns.adobe.com/xap/1.0/"><xmp:CreatorTool>ReportWright</xmp:CreatorTool><xmp:CreateDate>${stamp}</xmp:CreateDate><xmp:ModifyDate>${stamp}</xmp:ModifyDate><xmp:MetadataDate>${stamp}</xmp:MetadataDate></rdf:Description>
<rdf:Description rdf:about="" xmlns:pdf="http://ns.adobe.com/pdf/1.3/"><pdf:Producer>ReportWright</pdf:Producer></rdf:Description>
</rdf:RDF>
</x:xmpmeta>
<?xpacket end="w"?>`;
}
var PDFUA_SCHEMA = `<rdf:Description rdf:about="" xmlns:pdfaExtension="http://www.aiim.org/pdfa/ns/extension/" xmlns:pdfaSchema="http://www.aiim.org/pdfa/ns/schema#" xmlns:pdfaProperty="http://www.aiim.org/pdfa/ns/property#"><pdfaExtension:schemas><rdf:Bag><rdf:li rdf:parseType="Resource"><pdfaSchema:schema>PDF/UA identification schema</pdfaSchema:schema><pdfaSchema:namespaceURI>http://www.aiim.or\
g/pdfua/ns/id/</pdfaSchema:namespaceURI><pdfaSchema:prefix>pdfuaid</pdfaSchema:prefix><pdfaSchema:property><rdf:Seq><rdf:li rdf:parseType="Resource"><pdfaProperty:name>part</pdfaProperty:name><pdfaProperty:valueType>Integer</pdfaProperty:valueType><pdfaProperty:category>internal</pdfaProperty:category><pdfaProperty:description>PDF/UA version identifier</pdfaProperty:description></rdf:li></rdf:Seq>\
</pdfaSchema:property></rdf:li></rdf:Bag></pdfaExtension:schemas></rdf:Description>
`;
function setMetadata(doc, xmp) {
  const ctx = doc.context;
  const bytes = new TextEncoder().encode(xmp);
  doc.catalog.set(PDFName.of("Metadata"), ctx.register(ctx.stream(bytes, { Type: "Metadata", Subtype: "XML", Length: bytes.length })));
}
function setUaMetadata(doc, { title = "Report", author = void 0, created = /* @__PURE__ */ new Date() } = {}) {
  const when = new Date(Math.floor(created.getTime() / 1e3) * 1e3);
  setInfoDates(doc, when);
  if (author) doc.setAuthor(author);
  setMetadata(doc, xmpPacket({ title, author, stamp: when.toISOString().replace(".000Z", "Z"), ua: true }));
}

// src/exporters/svgimage.js
var mul = (a, b) => [a[0] * b[0] + a[2] * b[1], a[1] * b[0] + a[3] * b[1], a[0] * b[2] + a[2] * b[3], a[1] * b[2] + a[3] * b[3], a[0] * b[4] + a[2] * b[5] + a[4], a[1] * b[4] + a[3] * b[5] + a[5]];
var I = [1, 0, 0, 1, 0, 0];
var TRANSFORMS = /* @__PURE__ */ new Set(["matrix", "translate", "scale", "rotate", "skewX", "skewY"]);
function parseTransform(s) {
  let m = I;
  const parts = String(s || "").split(")");
  for (let k = 0; k < parts.length && k < 64; k++) {
    const part = parts[k], p = part.indexOf("(");
    if (p < 0) continue;
    const fn = part.slice(0, p).replace(/[\s,]/g, "");
    if (!TRANSFORMS.has(fn)) continue;
    const a = part.slice(p + 1, p + 200).split(/[\s,]+/).filter(Boolean).map(Number);
    if (a.some((x) => !Number.isFinite(x))) continue;
    const r = (d) => d * Math.PI / 180;
    let t = I;
    if (fn === "matrix" && a.length === 6) t = /** @type {M} */
    a;
    else if (fn === "translate") t = [1, 0, 0, 1, a[0] || 0, a[1] || 0];
    else if (fn === "scale") t = [a[0] ?? 1, 0, 0, a[1] ?? a[0] ?? 1, 0, 0];
    else if (fn === "rotate") {
      const c = Math.cos(r(a[0] || 0)), sn = Math.sin(r(a[0] || 0)), cx = a[1] || 0, cy = a[2] || 0;
      t = mul(mul([1, 0, 0, 1, cx, cy], [c, sn, -sn, c, 0, 0]), [1, 0, 0, 1, -cx, -cy]);
    } else if (fn === "skewX") t = [1, 0, Math.tan(r(a[0] || 0)), 1, 0, 0];
    else if (fn === "skewY") t = [1, Math.tan(r(a[0] || 0)), 0, 1, 0, 0];
    m = mul(m, t);
  }
  return m;
}
function attrs(s) {
  const a = xmlAttrs(s);
  for (const d of String(a.style || "").split(";")) {
    const i = d.indexOf(":");
    if (i > 0) a[d.slice(0, i).trim()] = d.slice(i + 1).trim();
  }
  return a;
}
var num = (v, d = 0) => {
  const n = parseFloat(v);
  return Number.isFinite(n) ? n : d;
};
var pts = (v) => (String(v || "").match(/-?[\d.]+(?:e[-+]?\d+)?/gi) || []).map(Number);
function shapePath(tag, a) {
  switch (tag) {
    case "path":
      return a.d || null;
    case "rect": {
      const x = num(a.x), y = num(a.y), w = num(a.width), h = num(a.height);
      if (!(w > 0 && h > 0)) return null;
      let rx = num(a.rx, NaN), ry = num(a.ry, NaN);
      if (!Number.isFinite(rx)) rx = Number.isFinite(ry) ? ry : 0;
      if (!Number.isFinite(ry)) ry = rx;
      rx = Math.min(Math.max(rx, 0), w / 2);
      ry = Math.min(Math.max(ry, 0), h / 2);
      if (!rx || !ry) return `M${x} ${y}H${x + w}V${y + h}H${x}Z`;
      return `M${x + rx} ${y}H${x + w - rx}A${rx} ${ry} 0 0 1 ${x + w} ${y + ry}V${y + h - ry}A${rx} ${ry} 0 0 1 ${x + w - rx} ${y + h}H${x + rx}A${rx} ${ry} 0 0 1 ${x} ${y + h - ry}V${y + ry}A${rx} ${ry} 0 0 1 ${x + rx} ${y}Z`;
    }
    case "circle":
    case "ellipse": {
      const cx = num(a.cx), cy = num(a.cy), rx = tag === "circle" ? num(a.r) : num(a.rx), ry = tag === "circle" ? num(a.r) : num(a.ry);
      if (!(rx > 0 && ry > 0)) return null;
      return `M${cx - rx} ${cy}A${rx} ${ry} 0 1 0 ${cx + rx} ${cy}A${rx} ${ry} 0 1 0 ${cx - rx} ${cy}Z`;
    }
    case "line":
      return `M${num(a.x1)} ${num(a.y1)}L${num(a.x2)} ${num(a.y2)}`;
    case "polyline":
    case "polygon": {
      const p = pts(a.points);
      if (p.length < 4) return null;
      let d = `M${p[0]} ${p[1]}`;
      for (let i = 2; i + 1 < p.length; i += 2) d += `L${p[i]} ${p[i + 1]}`;
      return tag === "polygon" ? d + "Z" : d;
    }
  }
  return null;
}
var SKIP = /* @__PURE__ */ new Set(["defs", "clipPath", "mask", "pattern", "linearGradient", "radialGradient", "symbol", "marker", "text", "style", "script", "title", "desc", "metadata", "filter", "foreignObject"]);
function parseSvg(text) {
  if (typeof text !== "string" || text.length > IMAGE_LIMITS.svgBytes) return null;
  const root = svgRootAttrs(text);
  if (!root) return null;
  const vb = String(root.viewBox || "").trim().split(/[\s,]+/).map(Number);
  const hasVb = vb.length === 4 && vb.every(Number.isFinite) && vb[2] > 0 && vb[3] > 0;
  const w = svgLength(root.width) || (hasVb ? vb[2] : 0), h = svgLength(root.height) || (hasVb ? vb[3] : 0);
  if (!(w > 0 && h > 0)) return null;
  let base = I;
  if (hasVb) {
    const s = Math.min(w / vb[2], h / vb[3]);
    base = [s, 0, 0, s, (w - vb[2] * s) / 2 - vb[0] * s, (h - vb[3] * s) / 2 - vb[1] * s];
  }
  const shapes = [];
  const top = { m: base, fill: "#000", stroke: "none", sw: 1, op: 1, fo: 1, so: 1, skip: 0 };
  const stack = [top];
  let seenRoot = false;
  for (const { close, name: tag, attrs: rest, self } of xmlTags(text)) {
    const cur = stack[stack.length - 1];
    if (close) {
      if (stack.length > 1) stack.pop();
      continue;
    }
    if (tag === "svg" && !seenRoot) {
      seenRoot = true;
      if (self) break;
      continue;
    }
    const a = attrs(rest);
    const g = {
      m: a.transform ? mul(cur.m, parseTransform(a.transform)) : cur.m,
      fill: a.fill ?? cur.fill,
      stroke: a.stroke ?? cur.stroke,
      sw: a["stroke-width"] != null ? num(a["stroke-width"], cur.sw) : cur.sw,
      op: cur.op * (a.opacity != null ? Math.min(1, Math.max(0, num(a.opacity, 1))) : 1),
      fo: a["fill-opacity"] != null ? num(a["fill-opacity"], 1) : cur.fo,
      so: a["stroke-opacity"] != null ? num(a["stroke-opacity"], 1) : cur.so,
      skip: cur.skip || (SKIP.has(tag) || a.display === "none" || a.visibility === "hidden" ? 1 : 0)
    };
    if (tag === "svg") {
      g.m = mul(g.m, [1, 0, 0, 1, num(a.x), num(a.y)]);
    }
    if (!g.skip) {
      const d = shapePath(tag, a);
      if (d) {
        if (shapes.length >= IMAGE_LIMITS.svgShapes) break;
        const fill = tag === "line" ? null : parseColor(paint(g.fill));
        shapes.push({ d, m: g.m, fill, stroke: parseColor(paint(g.stroke)), sw: g.sw, fo: g.fo * g.op, so: g.so * g.op });
      }
    }
    if (!self && !/^(path|rect|circle|ellipse|line|polyline|polygon|image|use)$/.test(tag)) stack.push(g);
  }
  return { w, h, shapes };
}
var clamp01 = (v) => Number.isFinite(v) ? Math.min(1, Math.max(0, v)) : 1;
var paint = (v) => v === "currentColor" ? "#000" : /^url\(/.test(String(v || "")) ? "none" : v;
function drawSvg(page, svg, at) {
  const place = [at.sx, 0, 0, -at.sy, at.x, at.y + svg.h * at.sy];
  for (const s of svg.shapes) {
    if (!s.fill && !s.stroke) continue;
    const m = mul(mul(place, s.m), [1, 0, 0, -1, 0, 0]);
    if (!m.every(Number.isFinite)) continue;
    page.pushOperators(pushGraphicsState(), concatTransformationMatrix(...m));
    try {
      page.drawSvgPath(s.d, {
        x: 0,
        y: 0,
        color: s.fill ? rgb(s.fill.r, s.fill.g, s.fill.b) : void 0,
        opacity: s.fill ? clamp01(s.fill.a * s.fo) : void 0,
        borderColor: s.stroke ? rgb(s.stroke.r, s.stroke.g, s.stroke.b) : void 0,
        borderWidth: s.stroke ? s.sw : 0,
        borderOpacity: s.stroke ? clamp01(s.stroke.a * s.so) : void 0
      });
    } catch {
    }
    page.pushOperators(popGraphicsState());
  }
}

// src/exporters/encrypt.js
var subtle = () => {
  const s = globalThis.crypto?.subtle;
  if (!s) throw new Error("PDF encryption needs WebCrypto (a browser, or Node 20 or later)");
  return s;
};
var random = (n) => globalThis.crypto.getRandomValues(new Uint8Array(n));
var cat = (...parts) => {
  const out = new Uint8Array(parts.reduce((s, p) => s + p.length, 0));
  let o = 0;
  for (const p of parts) {
    out.set(p, o);
    o += p.length;
  }
  return out;
};
var hex = (b) => Array.from(b, (x) => x.toString(16).padStart(2, "0")).join("");
async function aesCbc(key, iv, data) {
  const k = await subtle().importKey("raw", key, "AES-CBC", false, ["encrypt"]);
  return new Uint8Array(await subtle().encrypt({ name: "AES-CBC", iv }, k, data));
}
var aesCbcNoPad = async (key, iv, data) => (await aesCbc(key, iv, data)).subarray(0, data.length);
var sha = async (alg, data) => new Uint8Array(await subtle().digest(alg, data));
async function hash2B(pw, salt, udata) {
  let K = await sha("SHA-256", cat(pw, salt, udata));
  for (let round = 0; ; round++) {
    const one = cat(pw, K, udata);
    const K1 = new Uint8Array(one.length * 64);
    for (let i = 0; i < 64; i++) K1.set(one, i * one.length);
    const E = await aesCbcNoPad(K.subarray(0, 16), K.subarray(16, 32), K1);
    let mod = 0;
    for (let i = 0; i < 16; i++) mod += E[i];
    K = await sha(["SHA-256", "SHA-384", "SHA-512"][mod % 3], E);
    if (round >= 63 && E[E.length - 1] <= round + 1 - 32) break;
  }
  return K.subarray(0, 32);
}
function passwordBytes(pw, which) {
  const b = new TextEncoder().encode(String(pw ?? "").normalize("NFKC"));
  if (b.length > 127) throw Object.assign(new Error(`The ${which} password is too long (at most 127 bytes in UTF-8)`), { status: 400 });
  return b;
}
var PERMISSION_BITS = { print: 3, modify: 4, copy: 5, annotate: 6, fillForms: 9, accessibility: 10, assemble: 11, printHighQuality: 12 };
function permissionsValue(perms = {}) {
  for (const k of Object.keys(perms)) if (!(k in PERMISSION_BITS)) throw Object.assign(new Error(`Unknown PDF permission "${String(k).slice(0, 40)}". Use ${Object.keys(PERMISSION_BITS).join(", ")}.`), { status: 400 });
  let p = 4294963392;
  for (const [k, bit] of Object.entries(PERMISSION_BITS)) if (perms[k] !== false) p |= 1 << bit - 1;
  return p | 0;
}
async function encryptPdf(doc, opt) {
  const user = passwordBytes(opt.userPassword, "user");
  const owner = opt.ownerPassword != null && opt.ownerPassword !== "" ? passwordBytes(opt.ownerPassword, "owner") : random(32);
  const P = permissionsValue(opt.permissions || {});
  const fileKey = random(32);
  const zero = new Uint8Array(16);
  const uvs = random(8), uks = random(8);
  const U = cat(await hash2B(user, uvs, new Uint8Array()), uvs, uks);
  const UE = await aesCbcNoPad(await hash2B(user, uks, new Uint8Array()), zero, fileKey);
  const ovs = random(8), oks = random(8);
  const O = cat(await hash2B(owner, ovs, U), ovs, oks);
  const OE = await aesCbcNoPad(await hash2B(owner, oks, U), zero, fileKey);
  const perms = new Uint8Array(16);
  new DataView(perms.buffer).setInt32(0, P, true);
  perms.set([255, 255, 255, 255, 84, 97, 100, 98], 4);
  perms.set(random(4), 12);
  const Perms = await aesCbcNoPad(fileKey, zero, perms);
  await doc.flush();
  const ctx = doc.context;
  const enc = async (bytes) => {
    const iv = random(16);
    return cat(iv, await aesCbc(fileKey, iv, bytes));
  };
  const seen = /* @__PURE__ */ new Set();
  const walk = async (obj) => {
    if (obj instanceof PDFString || obj instanceof PDFHexString) return PDFHexString.of(hex(await enc(obj.asBytes())));
    if (obj instanceof PDFArray) {
      for (let i = 0; i < obj.size(); i++) obj.set(i, await walk(obj.get(i)));
      return obj;
    }
    if (obj instanceof PDFDict) {
      if (seen.has(obj)) return obj;
      seen.add(obj);
      for (const [k, v] of obj.entries()) obj.set(k, await walk(v));
      return obj;
    }
    if (obj instanceof PDFStream) {
      await walk(obj.dict);
      const contents = obj instanceof PDFRawStream ? obj.contents : (
        /** @type {any} */
        obj.getContents()
      );
      return PDFRawStream.of(obj.dict, await enc(contents));
    }
    return obj;
  };
  for (const [ref, obj] of ctx.enumerateIndirectObjects()) ctx.assign(ref, await walk(obj));
  const encrypt = ctx.obj({
    Filter: "Standard",
    V: 5,
    R: 6,
    Length: 256,
    CF: { StdCF: { AuthEvent: "DocOpen", CFM: "AESV3", Length: 32 } },
    StmF: "StdCF",
    StrF: "StdCF",
    O: PDFHexString.of(hex(O)),
    U: PDFHexString.of(hex(U)),
    OE: PDFHexString.of(hex(OE)),
    UE: PDFHexString.of(hex(UE)),
    P: PDFNumber.of(P),
    Perms: PDFHexString.of(hex(Perms)),
    EncryptMetadata: PDFBool.True
  });
  ctx.trailerInfo.Encrypt = ctx.register(encrypt);
  const id = PDFHexString.of(hex(random(16)));
  ctx.trailerInfo.ID = ctx.obj([id, id]);
}

// src/exporters/pdfua.js
var MARKER = /^\s*(?:[•◦▪▫‣·○●■□–—-]|\d{1,4}[.)]|[a-zA-Z][.)]|[ivxlcdmIVXLCDM]{1,6}[.)])\s*$/;
function createTagger(model, doc) {
  const ctx = doc.context;
  const root = node("Document");
  const plans = model.pages.map((pg, pi) => {
    const p = plan(model, pg, pi, root);
    endPage(root);
    return p;
  });
  const mcids = model.pages.map(() => []);
  const annots = [];
  return {
    /**
     * Marked content around item ii of page pi: the operator that opens it, or null (nothing is drawn for it).
     * @returns {string|null}
     */
    open(pi, ii, it) {
      if (it.t === "link" || it.t === "field" || it.t === "bookmark") return null;
      const p = plans[pi].get(ii);
      if (!p?.el) return p?.art === "Pagination" ? "/Artifact <</Type /Pagination>> BDC\n" : "/Artifact BMC\n";
      const mcid = mcids[pi].length;
      mcids[pi].push(p.el);
      p.el.kids.push({ mcid, pi });
      return `/${p.el.S === "Document" ? "P" : p.el.S} <</MCID ${mcid}>> BDC
`;
    },
    /** A link annotation of item ii (or a field's widget): its structure element; returns its StructParent key. */
    annot(pi, ii, ref, kind) {
      const p = plans[pi].get(ii);
      if (p?.link) {
        p.link.kids.push({ objr: ref, pi });
        annots.push({ ref, el: p.link, pi });
        return;
      }
      const el = node(kind === "field" ? "Form" : "Link");
      (p?.near || root).kids.push(el);
      el.parent = p?.near || root;
      el.kids.push({ objr: ref, pi });
      annots.push({ ref, el, pi });
    },
    finish({ lang = "en", title = "Report" } = {}) {
      const pages = doc.getPages();
      const refOf = /* @__PURE__ */ new Map();
      const all = [];
      for (const t of root.tables?.values() || []) regular(t);
      const walk = (n) => {
        refOf.set(n, ctx.nextRef());
        all.push(n);
        for (const k of n.kids) if (k.S) {
          k.parent || (k.parent = n);
          walk(k);
        }
      };
      walk(root);
      const nums = [];
      let key = 0;
      pages.forEach((pg, pi) => {
        if (!mcids[pi].length) return;
        pg.node.set(PDFName.of("StructParents"), PDFNumber.of(key));
        nums.push(PDFNumber.of(key++), ctx.obj(mcids[pi].map((n) => refOf.get(n))));
      });
      for (const a of annots) {
        const d = ctx.lookup(a.ref);
        if (d instanceof PDFDict) d.set(PDFName.of("StructParent"), PDFNumber.of(key));
        nums.push(PDFNumber.of(key++), refOf.get(a.el));
        pages[a.pi]?.node.set(PDFName.of("Tabs"), PDFName.of("S"));
      }
      const treeRef = ctx.nextRef();
      for (const n of all) {
        const pgOf = n.kids.find((k) => k.mcid != null)?.pi;
        const K = n.kids.map((k) => {
          if (k.S) return refOf.get(k);
          if (k.objr) return ctx.obj({ Type: "OBJR", Obj: k.objr, Pg: pages[k.pi].ref });
          return k.pi === pgOf ? PDFNumber.of(k.mcid) : ctx.obj({ Type: "MCR", Pg: pages[k.pi].ref, MCID: k.mcid });
        });
        const d = ctx.obj({ Type: "StructElem", S: n.S, P: n === root ? treeRef : refOf.get(n.parent || root), K });
        if (pgOf != null) d.set(PDFName.of("Pg"), pages[pgOf].ref);
        if (n.alt != null) d.set(PDFName.of("Alt"), PDFHexString.fromText(n.alt));
        if (n.attrs) d.set(PDFName.of("A"), ctx.obj(n.attrs));
        ctx.assign(refOf.get(n), d);
      }
      ctx.assign(treeRef, ctx.obj({ Type: "StructTreeRoot", K: refOf.get(root), ParentTree: ctx.obj({ Nums: nums }), ParentTreeNextKey: key }));
      const cat2 = doc.catalog;
      cat2.set(PDFName.of("StructTreeRoot"), treeRef);
      cat2.set(PDFName.of("MarkInfo"), ctx.obj({ Marked: true }));
      cat2.set(PDFName.of("Lang"), PDFString.of(String(lang).replace(/[^A-Za-z0-9-]/g, "") || "en"));
      cat2.set(PDFName.of("ViewerPreferences"), ctx.obj({ DisplayDocTitle: true }));
      doc.setTitle(title, { showInWindowTitleBar: true });
    }
  };
}
function node(S, extra = {}) {
  return (
    /** @type {any} */
    { S, kids: [], ...extra }
  );
}
function plan(model, pg, pi, root) {
  const items = pg.items;
  const out = /* @__PURE__ */ new Map();
  const H = pg.height ?? model.height;
  const figAt = /* @__PURE__ */ new Map();
  for (const f of figures(items)) {
    const deco = (f.tag.k === "shape" || f.tag.k === "line") && !f.tag.alt;
    for (let k = f.at; k <= f.last; k++) figAt.set(k, deco ? "deco" : f);
  }
  const marks = (model.bookmarks || []).filter((b) => b.page === pi + 1);
  const headingOf = (it) => {
    if (it.tag?.h) return Math.min(6, Math.max(1, it.tag.h));
    if (!marks.length || !it.clip) return 0;
    const txt = visualLines(it).join(" ").trim();
    const b = marks.find((m) => Math.abs(m.y - it.clip.y) < 1 && txt && String(m.label).trim().startsWith(txt.slice(0, 40)));
    return b ? Math.min(6, (Number(b.level) || 0) + 1) : 0;
  };
  const tables = root.tables || (root.tables = /* @__PURE__ */ new Map());
  const rich = /* @__PURE__ */ new Map();
  let list = null, listId = null;
  const figEls = /* @__PURE__ */ new Map();
  const cellsByTable = /* @__PURE__ */ new Map();
  for (const it of items) if (it.t === "text" && it.cell && !it.art) (cellsByTable.get(it.cell.table) || cellsByTable.set(it.cell.table, { cells: [] }).get(it.cell.table)).cells.push(it);
  const visAt = /* @__PURE__ */ new Map();
  const taken = /* @__PURE__ */ new Set([...figAt.keys()]);
  const index = new Map(items.map((it, i) => [it, i]));
  for (const [tkey, m] of cellVisuals(items, taken, cellsByTable)) {
    const proto = cellsByTable.get(tkey).cells[0].cell;
    for (const [rc, v] of m) {
      const [row, col2] = rc.split("|");
      const rowCell = cellsByTable.get(tkey).cells.find((c) => String(c.cell.row) === row)?.cell;
      const vis = { cell: { ...proto, row: rowCell ? rowCell.row : row, col: Number(col2), kind: rowCell?.kind || "detail", span: 1, rowSpan: 1 } };
      for (const it of v.items) visAt.set(index.get(it), { vis, box: v.box, kind: v.items.some((x) => x.t === "path") ? "sparkline" : "databar" });
    }
  }
  const add = (el) => {
    root.kids.push(el);
    el.parent = root;
    return el;
  };
  let lastText = null;
  const tocLink = (e) => {
    const toc = root.toc || (root.toc = { el: null, last: -1, entries: /* @__PURE__ */ new Map() });
    if (!toc.el || e < toc.last) {
      toc.el = add(node("TOC"));
      toc.entries = /* @__PURE__ */ new Map();
    }
    toc.last = Math.max(toc.last, e);
    let link = toc.entries.get(e);
    if (!link) {
      const toci = node("TOCI"), ref = node("Reference");
      link = node("Link");
      toci.parent = toc.el;
      toc.el.kids.push(toci);
      ref.parent = toci;
      toci.kids.push(ref);
      link.parent = ref;
      ref.kids.push(link);
      toc.entries.set(e, link);
    }
    return link;
  };
  items.forEach((it, i) => {
    if (it.t === "bookmark") return;
    if (it.tocEntry != null && (it.t === "text" || it.t === "link") && !it.art) {
      const link = tocLink(it.tocEntry);
      out.set(i, it.t === "link" ? { link } : { el: link });
      return;
    }
    if (it.tocTitle && it.t === "text" && it.lines?.length) {
      out.set(i, { el: add(node("H1")) });
      return;
    }
    if (it.t === "link" || it.t === "field") {
      out.set(i, { near: lastText && overlaps(lastText.it, it) ? lastText.el : null });
      return;
    }
    const f = figAt.get(i);
    if (f === "deco") {
      out.set(i, { art: "Layout" });
      return;
    }
    if (it.art) {
      out.set(i, { art: "Pagination" });
      return;
    }
    const vis = visAt.get(i);
    if (vis) {
      let el2 = figEls.get(vis.vis);
      if (!el2) {
        const td = cellEl(tables, root, vis.vis, add);
        if (td.art) {
          out.set(i, { art: "Layout" });
          return;
        }
        const b = vis.box;
        el2 = node("Figure", { alt: "Chart in a table cell", attrs: { O: "Layout", BBox: [r2(b.x), r2(H - b.y - b.h), r2(b.x + b.w), r2(H - b.y)] } });
        el2.parent = td;
        td.kids.push(el2);
        figEls.set(vis.vis, el2);
      }
      out.set(i, { el: el2 });
      return;
    }
    if (f) {
      let el2 = figEls.get(f);
      if (!el2) {
        const b = f.box;
        el2 = add(node("Figure", { alt: altOf(f.tag), attrs: { O: "Layout", BBox: [r2(b.x), r2(H - b.y - b.h), r2(b.x + b.w), r2(H - b.y)] } }));
        figEls.set(f, el2);
      }
      out.set(i, { el: el2 });
      return;
    }
    if (it.t !== "text" || !it.lines?.length || !visualLines(it).join("").trim()) {
      out.set(i, { art: "Layout" });
      return;
    }
    let el;
    if (it.cell) el = cellEl(tables, root, it, add);
    else if (it.rich) {
      const key = `${it.rich.id}${it.rich.p}`;
      el = rich.get(key);
      if (!el) {
        const marker = MARKER.test(it.lines[0].text);
        if (marker) {
          if (listId !== it.rich.id || !list) {
            list = add(node("L"));
            listId = it.rich.id;
          }
          const li = node("LI");
          li.parent = list;
          list.kids.push(li);
          const lbl = node("Lbl");
          lbl.parent = li;
          li.kids.push(lbl);
          const body = node("LBody");
          body.parent = li;
          li.kids.push(body);
          rich.set(key, body);
          out.set(i, { el: lbl });
          lastText = { it, el: body };
          return;
        }
        list = null;
        const h = headingOf(it);
        el = add(node(h ? `H${h}` : "P"));
        rich.set(key, el);
      }
    } else {
      const h = headingOf(it);
      el = add(node(h ? `H${h}` : "P"));
    }
    if (el.art) {
      out.set(i, { art: "Pagination" });
      return;
    }
    out.set(i, { el });
    lastText = { it, el };
  });
  return out;
}
var r2 = (v) => Math.round(v * 100) / 100;
function overlaps(t, l) {
  const c = t.clip || { x: t.lines[0].x, y: t.lines[0].y - t.size, w: t.lines[0].w || 0, h: t.size * 1.3 };
  return l.x < c.x + c.w && c.x < l.x + l.w && l.y < c.y + c.h && c.y < l.y + l.h;
}
function cellEl(tables, root, it, add) {
  const c = it.cell;
  let t = tables.get(c.table);
  if (!t || t.closed) {
    t = { el: add(node("Table")), rows: /* @__PURE__ */ new Map(), cols: c.cols.length };
    tables.set(c.table, t);
    for (const [k, o] of tables) if (k !== c.table) o.closed = true;
  }
  let r = t.rows.get(c.row);
  if (!r) {
    r = { el: node("TR"), cells: /* @__PURE__ */ new Map(), kind: c.kind };
    r.el.parent = t.el;
    t.el.kids.push(r.el);
    t.rows.set(c.row, r);
  } else if (c.kind === "header" && r.done) return { art: true };
  let cell = r.cells.get(c.col);
  if (!cell) {
    const attrs2 = { O: "Table" };
    if (c.kind === "header") attrs2.Scope = "Column";
    if (c.span > 1) attrs2.ColSpan = c.span;
    if (c.rowSpan > 1) attrs2.RowSpan = c.rowSpan;
    cell = node(c.kind === "header" ? "TH" : "TD", { attrs: attrs2 });
    cell.parent = r.el;
    r.el.kids.push(cell);
    r.cells.set(c.col, cell);
  }
  r.pageSeen = true;
  return cell;
}
function endPage(root) {
  for (const t of root.tables?.values() || []) for (const r of t.rows.values()) if (r.kind === "header") r.done = true;
}
function regular(t) {
  const down = /* @__PURE__ */ new Map();
  for (const r of t.rows.values()) {
    const kids = [];
    for (let c = 0; c < t.cols; ) {
      const left = down.get(c);
      if (left) {
        if (left.n <= 1) down.delete(c);
        else left.n--;
        c += left.span;
        continue;
      }
      let cell = r.cells.get(c);
      if (!cell) {
        cell = node(r.kind === "header" ? "TH" : "TD", { attrs: r.kind === "header" ? { O: "Table", Scope: "Column" } : void 0 });
        cell.parent = r.el;
      }
      const span = Math.max(1, cell.attrs?.ColSpan || 1), rs = Math.max(1, cell.attrs?.RowSpan || 1);
      if (rs > 1) down.set(c, { n: rs - 1, span });
      kids.push(cell);
      c += span;
    }
    const placed = new Set(kids);
    const rest = [...r.cells.entries()].sort((x, y) => x[0] - y[0]).map((e) => e[1]).filter((k) => !placed.has(k));
    r.el.kids = [...kids, ...rest, ...r.el.kids.filter((k) => !k.S || k.S !== "TD" && k.S !== "TH")];
  }
}

// src/exporters/png.js
import { Unzlib } from "fflate";
var CRC = new Uint32Array(256).map((_, n) => {
  let c = n;
  for (let k = 0; k < 8; k++) c = c & 1 ? 3988292384 ^ c >>> 1 : c >>> 1;
  return c >>> 0;
});
function crc32(b, from, to) {
  let c = 4294967295;
  for (let i = from; i < to; i++) c = CRC[(c ^ b[i]) & 255] ^ c >>> 8;
  return (c ^ 4294967295) >>> 0;
}
var CHANNELS = { 0: 1, 2: 3, 3: 1, 4: 2, 6: 4 };
var PNG_LIMITS = { pixels: 1e8, rawBytes: 256 * 1048576, chunks: 4096 };
function rawBytes(w, h, bits, interlace) {
  const line = (pw) => pw > 0 ? 1 + Math.ceil(pw * bits / 8) : 0;
  if (!interlace) return h * line(w);
  let n = 0;
  for (const [x0, y0, dx, dy] of [[0, 0, 8, 8], [4, 0, 8, 8], [0, 4, 4, 8], [2, 0, 4, 4], [0, 2, 2, 4], [1, 0, 2, 2], [0, 1, 1, 2]]) {
    const pw = Math.ceil((w - x0) / dx), ph = Math.ceil((h - y0) / dy);
    if (pw > 0 && ph > 0) n += ph * line(pw);
  }
  return n;
}
function pngProblem(b) {
  const SIG = [137, 80, 78, 71, 13, 10, 26, 10];
  if (b.length < 8 || SIG.some((x, i) => b[i] !== x)) return "not a PNG";
  const u32 = (i) => (b[i] << 24 | b[i + 1] << 16 | b[i + 2] << 8 | b[i + 3]) >>> 0;
  let off = 8, ihdr = null, idat = [], end = false, first = true, chunks = 0;
  while (off < b.length) {
    if (++chunks > PNG_LIMITS.chunks) return `more than ${PNG_LIMITS.chunks} chunks`;
    if (off + 12 > b.length) return "the file is cut short";
    const len = u32(off);
    if (off + 12 + len > b.length) return "the file is cut short";
    const t = String.fromCharCode(b[off + 4], b[off + 5], b[off + 6], b[off + 7]);
    if (crc32(b, off + 4, off + 8 + len) !== u32(off + 8 + len)) return `the ${t} chunk is damaged (CRC)`;
    const d = off + 8;
    if (first && t !== "IHDR") return "IHDR is not first";
    first = false;
    if (t === "IHDR") {
      if (ihdr || len !== 13) return "a bad IHDR";
      ihdr = { w: u32(d), h: u32(d + 4), depth: b[d + 8], color: b[d + 9], interlace: b[d + 12] };
      if (ihdr.w * ihdr.h > PNG_LIMITS.pixels) return `${ihdr.w}×${ihdr.h} pixels, more than ${PNG_LIMITS.pixels / 1e6} MP`;
    } else if (t === "IDAT") idat.push(b.subarray(d, d + len));
    else if (t === "IEND") {
      end = true;
      break;
    }
    off = d + len + 4;
  }
  if (!ihdr) return "no IHDR";
  if (!idat.length) return "no image data (IDAT)";
  if (!end) return "no IEND: the file is cut short";
  const ch = CHANNELS[ihdr.color];
  if (!ch || ![1, 2, 4, 8, 16].includes(ihdr.depth) || ihdr.w < 1 || ihdr.h < 1 || ihdr.interlace > 1) return "an unsupported PNG header";
  const want = rawBytes(ihdr.w, ihdr.h, ch * ihdr.depth, ihdr.interlace);
  if (want > PNG_LIMITS.rawBytes) return `${Math.round(want / 1048576)} MB of pixel data, more than ${PNG_LIMITS.rawBytes / 1048576} MB`;
  let got = 0, over = false, failed = false;
  const OVER = new Error("over");
  const z = new Unzlib((chunk) => {
    got += chunk.length;
    if (got > want) {
      over = true;
      throw OVER;
    }
  });
  try {
    for (let i = 0; i < idat.length && !over; i++) z.push(idat[i], i === idat.length - 1);
  } catch (e) {
    if (e !== OVER) failed = true;
  }
  if (failed) return "the image data does not inflate";
  if (over) return "the image data is larger than its header says";
  if (got !== want) return "the image data is cut short";
  return null;
}

// src/exporters/pdfstream.js
import { Zlib, deflateSync, inflateSync } from "fflate";

// src/exporters/pdfstreamtags.js
function createStreamTagger(w, { maxElements = Infinity } = {}) {
  let count = 0;
  const made = () => {
    if (++count > maxElements) throw Object.assign(new Error(`The tagged PDF has more than ${maxElements.toLocaleString("en-US")} structure elements (tagged.maxElements). Filter the data, or export it untagged.`), { status: 413 });
  };
  const rootRef = w.reserve(), docRef = w.reserve();
  const docKids = [];
  let table = (
    /** @type {null | { ref: number, cols: number, rows: Int32Array, n: number }} */
    null
  );
  let headerDone = false;
  let nums = new Int32Array(1024), nn = 0, key = 0;
  const num3 = (k, ref) => {
    if (nn + 2 > nums.length) {
      const b = new Int32Array(nums.length * 2);
      b.set(nums);
      nums = b;
    }
    nums[nn++] = k;
    nums[nn++] = ref;
  };
  const addRow = (ref) => {
    const t = (
      /** @type {any} */
      table
    );
    if (t.n === t.rows.length) {
      const b = new Int32Array(t.n * 2);
      b.set(t.rows);
      t.rows = b;
    }
    t.rows[t.n++] = ref;
  };
  let mcids = (
    /** @type {number[]} */
    []
  );
  let rows = /* @__PURE__ */ new Map();
  let els = (
    /** @type {any[]} */
    []
  );
  let last = (
    /** @type {any} */
    null
  );
  let links = false, win = 0;
  const el = (S, parent, attrs2) => {
    made();
    const e = { ref: w.reserve(), S, parent, mcid: (
      /** @type {number[]} */
      []
    ), kids: (
      /** @type {any[]} */
      []
    ), attrs: attrs2 };
    els.push(e);
    return e;
  };
  const mark = (e) => {
    const m = mcids.length;
    mcids.push(e.ref);
    e.mcid.push(m);
    return `/${e.S} <</MCID ${m}>> BDC
`;
  };
  return {
    /** structure elements so far */
    get count() {
      return count;
    },
    /** elements of the page being drawn, held until it ends */
    get held() {
      return els.length + rows.size + mcids.length;
    },
    /** a new page (window: the paged window it came from; row ids are its own) @param {number} window */
    page(window) {
      mcids = [];
      rows = /* @__PURE__ */ new Map();
      els = [];
      last = null;
      links = false;
      win = window;
    },
    /**
     * The marked content that opens item it: a structure element's MCID, or an artifact; null for a link.
     * @param {any} it
     */
    open(it) {
      if (it.t === "link" || it.t === "bookmark") return null;
      if (it.art) return "/Artifact <</Type /Pagination>> BDC\n";
      if (it.t !== "text" || !it.lines?.some((l) => String(l.text).trim())) return "/Artifact BMC\n";
      const c = it.cell;
      if (!c) {
        const h = it.tag?.h ? Math.min(6, Math.max(1, it.tag.h)) : 0;
        const e = el(h ? `H${h}` : "P", docRef);
        docKids.push(e.ref);
        last = { e, it };
        return mark(e);
      }
      if (c.kind === "header" && headerDone) return "/Artifact <</Type /Pagination>> BDC\n";
      if (!table) {
        table = { ref: w.reserve(), cols: c.cols.length, rows: new Int32Array(4096), n: 0 };
        docKids.push(table.ref);
      }
      const rk = `${win}:${c.row}`;
      let r = rows.get(rk);
      if (!r) {
        made();
        r = { ref: w.reserve(), kind: c.kind, cells: /* @__PURE__ */ new Map() };
        rows.set(rk, r);
        addRow(r.ref);
      }
      let cell = r.cells.get(c.col);
      if (!cell) {
        const attrs2 = c.kind === "header" || c.span > 1 ? { O: "/Table", ...c.kind === "header" ? { Scope: "/Column" } : {}, ...c.span > 1 ? { ColSpan: c.span } : {} } : null;
        cell = el(c.kind === "header" ? "TH" : "TD", r.ref, attrs2);
        r.cells.set(c.col, cell);
      }
      last = { e: cell, it };
      return mark(cell);
    },
    /**
     * A link annotation of the page: its Link element (in the element of the text it covers, else the Document).
     * @returns {number} the annotation's StructParent
     * @param {any} it @param {number} annot the annotation's object number
     */
    link(it, annot) {
      const near = last && overlaps2(last.it, it) ? last.e : null;
      const e = el("Link", near ? near.ref : docRef);
      e.kids.push(`<< /Type /OBJR /Obj ${annot} 0 R >>`);
      (near ? near.kids : docKids).push(near ? `${e.ref} 0 R` : e.ref);
      links = true;
      num3(key, e.ref);
      return key++;
    },
    /**
     * The page is drawn: its elements and parent-tree array are written. @returns {Promise<string>} the page's entries
     * @param {number} pageRef
     */
    async end(pageRef) {
      for (const r of rows.values()) {
        const kids = [];
        for (let col2 = 0; col2 < /** @type {any} */
        table.cols; ) {
          let cell = r.cells.get(col2);
          if (!cell) {
            cell = el(r.kind === "header" ? "TH" : "TD", r.ref, r.kind === "header" ? { O: "/Table", Scope: "/Column" } : null);
          }
          kids.push(cell.ref);
          col2 += Math.max(1, cell.attrs?.ColSpan || 1);
        }
        for (const [col2, cell] of r.cells) if (!kids.includes(cell.ref)) {
          void col2;
          kids.push(cell.ref);
        }
        await w.objectAt(r.ref, `<< /S /TR /P ${/** @type {any} */
        table.ref} 0 R /K [${kids.map((k) => `${k} 0 R`).join(" ")}] >>`);
      }
      if (rows.size && [...rows.values()].some((r) => r.kind === "header")) headerDone = true;
      for (const e of els) {
        const K = [...e.mcid.map(String), ...e.kids].join(" ");
        const A = e.attrs ? ` /A << ${Object.entries(e.attrs).map(([k, v]) => `/${k} ${v}`).join(" ")} >>` : "";
        const P = e.parent === docRef ? docRef : e.parent;
        await w.objectAt(e.ref, `<< /S /${e.S} /P ${P} 0 R${e.mcid.length || e.S === "Link" ? ` /Pg ${pageRef} 0 R` : ""} /K [${K}]${A} >>`);
      }
      let extra = "";
      if (mcids.length) {
        const arr = await w.object(`[${mcids.map((r) => `${r} 0 R`).join(" ")}]`);
        num3(key, arr);
        extra += ` /StructParents ${key++}`;
      }
      if (links) extra += " /Tabs /S";
      mcids = [];
      rows = /* @__PURE__ */ new Map();
      els = [];
      last = null;
      return extra;
    },
    /**
     * The tree's top: Table, Document, the parent tree, the root. @returns {Promise<string>} the catalog's entries
     * @param {{ lang?: string }} o
     */
    async finish({ lang = "en" } = {}) {
      const t = table;
      if (t) await w.bigObject(t.ref, `<< /Type /StructElem /S /Table /P ${docRef} 0 R /K [`, refs(t.rows, t.n), "] >>");
      await w.objectAt(docRef, `<< /Type /StructElem /S /Document /P ${rootRef} 0 R /K [${docKids.map((k) => typeof k === "string" ? k : `${k} 0 R`).join(" ")}] >>`);
      const pt = w.reserve();
      await w.bigObject(pt, "<< /Nums [", pairs(nums, nn), "] >>");
      await w.objectAt(rootRef, `<< /Type /StructTreeRoot /K ${docRef} 0 R /ParentTree ${pt} 0 R /ParentTreeNextKey ${key} >>`);
      return ` /StructTreeRoot ${rootRef} 0 R /MarkInfo << /Marked true >> /Lang (${String(lang).replace(/[^A-Za-z0-9-]/g, "") || "en"}) /ViewerPreferences << /DisplayDocTitle true >>`;
    }
  };
}
function* refs(a, n) {
  for (let i = 0; i < n; i += 4096) {
    let s = "";
    for (let j = i; j < Math.min(n, i + 4096); j++) s += `${a[j]} 0 R `;
    yield s;
  }
}
function* pairs(a, n) {
  for (let i = 0; i < n; i += 4096) {
    let s = "";
    for (let j = i; j < Math.min(n, i + 4096); j += 2) s += `${a[j]} ${a[j + 1]} 0 R `;
    yield s;
  }
}
function overlaps2(t, l) {
  const c = t.clip || { x: t.lines[0].x, y: t.lines[0].y - t.size, w: t.lines[0].w || 0, h: t.size * 1.3 };
  return l.x < c.x + c.w && c.x < l.x + l.w && l.y < c.y + c.h && c.y < l.y + l.h;
}

// src/exporters/pdfstandard.js
function standardFontEntries(f) {
  return {
    Type: "Font",
    Subtype: "Type1",
    BaseFont: f.postscriptName,
    ...f.winAnsi ? { Encoding: "WinAnsiEncoding" } : {},
    FirstChar: 32,
    LastChar: 255,
    Widths: f.widths.slice(32, 256)
  };
}
function standardFontDict(f) {
  const e = standardFontEntries(f);
  return `<< /Type /Font /Subtype /Type1 /BaseFont /${e.BaseFont}${e.Encoding ? ` /Encoding /${e.Encoding}` : ""} /FirstChar 32 /LastChar 255 /Widths [${e.Widths.join(" ")}] >>`;
}
var standIns = (store) => [...new Set([...store.fonts.keys()].filter(isStandard).map(embeddedFace))];
var esc = (b) => b === 40 || b === 41 || b === 92 ? "\\" + String.fromCharCode(b) : b === 13 ? "\\r" : String.fromCharCode(b);
function standardLiteral(f, text) {
  let out = "";
  for (const ch of text) out += esc(f.glyphForCodePoint(
    /** @type {number} */
    ch.codePointAt(0)
  ).id);
  return out;
}
function embeddedPage(pg, fontOf, families) {
  const line = (l, key, size) => {
    const runs = l.runs || [{ font: key, x: 0, text: l.text, glyphs: null }];
    if (!runs.some((r) => isStandard(r.font))) return l;
    return { ...l, runs: runs.map((r) => {
      if (!isStandard(r.font)) return r;
      families.add(fontCss(r.font).family);
      const std = fontOf(r.font), sub = embeddedFace(r.font), emb = fontOf(sub);
      const glyphs = [];
      if (r.glyphs) {
        for (let i = 0; i < r.glyphs.length; i += 4) glyphs.push(emb.glyphForCodePoint(r.text.codePointAt(r.glyphs[i + 3])).id, r.glyphs[i + 1], r.glyphs[i + 2], r.glyphs[i + 3]);
        return { ...r, font: sub, glyphs };
      }
      let pen = 0;
      for (let i = 0; i < r.text.length; ) {
        const cp = (
          /** @type {number} */
          r.text.codePointAt(i)
        );
        glyphs.push(emb.glyphForCodePoint(cp).id, pen, 0, i);
        pen += std.glyphForCodePoint(cp).advanceWidth * size / 1e3;
        i += cp > 65535 ? 2 : 1;
      }
      return { ...r, font: sub, w: pen, glyphs };
    }) };
  };
  const item = (it) => {
    if (it.t === "field") {
      const draw = it.draw.map(item);
      return draw.some((d, i) => d !== it.draw[i]) ? { ...it, draw } : it;
    }
    if (it.t !== "text") return it;
    const lines = it.lines.map((l) => line(l, it.font, it.size));
    return lines.some((l, i) => l !== it.lines[i]) ? { ...it, lines } : it;
  };
  const items = pg.items.map(item);
  return items.some((x, i) => x !== pg.items[i]) ? { ...pg, items } : pg;
}
function embeddedWarnings(families) {
  return [...families].map((f) => `PDF/A and PDF/UA need embedded fonts, and "${f}" is a standard font that is not embedded: its text is drawn in ${fontCss(embeddedFace(f)).family} at ${f}'s spacing (no metric-compatible font ships, so the letters' widths differ).`);
}

// src/exporters/pdfpaint.js
var colors = /* @__PURE__ */ new Map();
var col = (c) => {
  if (colors.has(c)) return colors.get(c);
  const p = parseColor(c), v = p ? { color: rgb2(p.r, p.g, p.b), opacity: p.a, rgb: `${n3(p.r)} ${n3(p.g)} ${n3(p.b)}` } : null;
  if (colors.size < 1e3) colors.set(c, v);
  return v;
};
var BLACK = { color: rgb2(0, 0, 0), opacity: 1, rgb: "0 0 0" };
function rgb2(red, green, blue) {
  return { type: (
    /** @type {any} */
    "RGB"
  ), red, green, blue };
}
var hexText = (s) => {
  let h = "<FEFF";
  for (let i = 0; i < s.length; i++) h += s.charCodeAt(i).toString(16).toUpperCase().padStart(4, "0");
  return `${h}>`;
};
var n2 = (v) => Math.round(v * 100) / 100;
var n3 = (v) => Math.round(v * 1e3) / 1e3;
var n4 = (v) => Math.round(v * 1e4) / 1e4;
var hex4 = (id) => id.toString(16).padStart(4, "0");
var KAPPA = 4 * ((Math.SQRT2 - 1) / 3);
var cleanText = (t) => t.replace(/\t|\u0085|\u2028|\u2029/g, "    ").replace(/[\b\v]/g, "");
var formatAt = (run, cl) => {
  const cp = run.text.codePointAt(cl);
  return cp !== void 0 && FORMAT_CHAR.test(String.fromCodePoint(cp));
};
function drawRun(c, run, x, y, size, pf, color, spans, texts) {
  const f = pf.embedder.font;
  const per = 1e3 / size;
  const span = (text) => `/Span <</ActualText ${hexText(text)}>> BDC
`;
  c.et();
  c.paint(color, null);
  c.font(pf, size);
  if (!run.rtl) c.s += span(run.text);
  c.s += `BT ${n2(x)} ${n2(y)} Td
`;
  let arr = "";
  let pen = 0, rise = 0;
  const flush = () => {
    if (arr) c.s += `[${arr}] TJ
`;
    arr = "";
  };
  const all = run.glyphs;
  const adv = (id) => f.getGlyph(id).advanceWidth;
  let g = all, quietAt = -1;
  if (run.rtl) {
    const hasBase = /* @__PURE__ */ new Set();
    for (let i = 0; i < all.length; i += 4) if (adv(all[i]) > 0) hasBase.add(all[i + 3]);
    const quiet = (i) => spans?.has(all[i + 3]) ? adv(all[i]) === 0 && hasBase.has(all[i + 3]) : texts?.get(all[i]) === "";
    g = [];
    for (const late of [false, true]) {
      if (late) quietAt = g.length;
      for (let i = 0; i < all.length; i += 4) if (quiet(i) === late) g.push(all[i], all[i + 1], all[i + 2], all[i + 3]);
    }
    if (quietAt === g.length) quietAt = -1;
  }
  const starts = run.rtl ? [...new Set(all.filter((_, i) => i % 4 === 3))].sort((a, b) => a - b) : [];
  let inSpan = false;
  for (let i = 0; i < g.length; i += 4) {
    const id = g[i], gx = g[i + 1], gy = g[i + 2], cl = g[i + 3];
    if (i === quietAt) {
      flush();
      c.s += span("");
      inSpan = true;
    } else if (run.rtl && spans?.has(cl) && (quietAt < 0 || i < quietAt) && (i === 0 || g[i - 1] !== cl)) {
      flush();
      c.s += span(run.text.slice(cl, starts[starts.indexOf(cl) + 1] ?? run.text.length));
      inSpan = true;
    }
    if (gy !== rise) {
      flush();
      c.s += `${n4(gy)} Ts
`;
      rise = gy;
    }
    const adj = Math.round((pen - gx) * per * 1e3) / 1e3;
    if (id === 0 && (c.tagged || formatAt(run, cl))) pen = gx;
    else {
      arr += (adj ? `${adj}` : "") + `<${f.standard ? id.toString(16).padStart(2, "0") : hex4(id)}>`;
      pen = gx + adv(id) * size / f.unitsPerEm;
    }
    if (inSpan && (i + 4 >= g.length || (quietAt < 0 || i + 4 < quietAt) && g[i + 7] !== cl || i + 4 === quietAt)) {
      flush();
      c.s += "EMC\n";
      inSpan = false;
    }
  }
  flush();
  if (rise) c.s += "0 Ts\n";
  c.s += "ET\n";
  if (!run.rtl) c.s += "EMC\n";
}
function glyphText(run, font, out, spans) {
  const g = run.glyphs;
  const starts = [...new Set(g.filter((_, i) => i % 4 === 3))].sort((a, b) => a - b);
  for (let k = 0; k < starts.length; k++) {
    const chars = [...run.text.slice(starts[k], starts[k + 1] ?? run.text.length)];
    const ids = [];
    for (let i = 0; i < g.length; i += 4) if (g[i + 3] === starts[k]) ids.push(g[i]);
    const own = new Map(chars.map((ch) => [font.glyphForCodePoint(ch.codePointAt(0)).id, ch]));
    const rest = chars.filter((ch) => !ids.includes(font.glyphForCodePoint(ch.codePointAt(0)).id)).join("");
    const carrier = rest ? ids.find((id) => !own.has(id) && font.getGlyph(id).advanceWidth > 0) ?? ids.find((id) => !own.has(id)) : void 0;
    let ok = !rest || carrier !== void 0;
    const want = /* @__PURE__ */ new Map();
    for (const id of ids) {
      const t = own.get(id) ?? (id === carrier ? rest : "");
      if (want.has(id) && want.get(id) !== t) ok = false;
      want.set(id, t);
    }
    for (const [id, t] of want) {
      if (!out.has(id)) out.set(id, t);
      else if (out.get(id) !== t) ok = false;
    }
    if (!ok && run.rtl && spans) {
      let s = spans.get(run);
      if (!s) spans.set(run, s = /* @__PURE__ */ new Set());
      s.add(starts[k]);
    }
  }
}
function insideClip(it, m) {
  const k = it.clip, asc = m.asc * it.size, desc = m.desc * it.size;
  return it.lines.every((l) => l.w != null && !l.runs && l.x >= k.x && l.x + l.w <= k.x + k.w && l.y - asc >= k.y && l.y + desc <= k.y + k.h);
}
var Content = class {
  constructor(shared) {
    this.shared = shared;
    this._s = "";
    this.bt = false;
    this.tx = 0;
    this.ty = 0;
    this.st = { fill: "0 0 0", stroke: "0 0 0", lw: 1, dash: "[] 0", ca: 1, CA: 1, font: "", size: 0 };
    this.saved = [];
    this.lines = null;
    this.tagged = false;
    this.artLines = false;
  }
  /**
   * The operators so far. Any other drawing reads or appends to it, so the lines waiting are drawn first: the text
   * of a table's cells stays in one text object (relative moves, which compress to little) instead of one per cell.
   */
  get s() {
    this.flushLines();
    return this._s;
  }
  set s(v) {
    this._s = v;
  }
  /**
   * A straight line. Untagged, it waits until something other than text is drawn (table borders between cell
   * texts); collinear segments that touch, in the same stroke, become one (a row's border is one line).
   * ponytail: lines move after the text drawn just after them; both are thin and do not cover each other.
   */
  line(stroke, w, dash, x1, y1, x2, y2) {
    if (this.tagged && !this.artLines) {
      this.paint(null, stroke, w, dash);
      this._s += `${n2(x1)} ${n2(y1)} m ${n2(x2)} ${n2(y2)} l S
`;
      return;
    }
    const key = `${stroke.rgb}|${stroke.opacity}|${w}|${(dash || []).join(" ")}`;
    if (this.lines && this.lines.key !== key) this.flushLines();
    this.lines || (this.lines = { key, stroke, w, dash, segs: [] });
    const segs = this.lines.segs, last = segs[segs.length - 1];
    const eq = (a, b) => Math.abs(a - b) < 5e-3;
    if (last && eq(last[1], y1) && eq(last[3], y2) && eq(y1, y2) && eq(last[2], x1)) last[2] = x2;
    else if (last && eq(last[0], x1) && eq(last[2], x2) && eq(x1, x2) && eq(last[3], y1)) last[3] = y2;
    else segs.push([x1, y1, x2, y2]);
  }
  flushLines() {
    const L = this.lines;
    if (!L) return;
    this.lines = null;
    this.et();
    const end = this.artLines ? "EMC\n" : "";
    if (end) this._s += "/Artifact BMC\n";
    this.paint(null, L.stroke, L.w, L.dash);
    const g = L.segs;
    const dy = g.length > 2 ? Math.round((g[1][1] - g[0][1]) * 100) : 0;
    if (dy && g.every((q, i) => q[1] === q[3] && n2(q[0]) === n2(g[0][0]) && n2(q[2]) === n2(g[0][2]) && Math.abs(q[1] - (g[0][1] + i * dy / 100)) < 0.01)) {
      const one = `${n2(g[0][0])} ${n2(g[0][1])} m ${n2(g[0][2])} ${n2(g[0][1])} l S
`;
      this._s += `q
${one}${`1 0 0 1 0 ${dy / 100} cm ${one}`.repeat(g.length - 1)}Q
${end}`;
      return;
    }
    this._s += g.map(([a, b, c, d]) => `${n2(a)} ${n2(b)} m ${n2(c)} ${n2(d)} l`).join(" ") + " S\n" + end;
  }
  q() {
    this.et();
    this._s += "q\n";
    this.saved.push({ ...this.st });
  }
  Q() {
    this.et();
    this._s += "Q\n";
    this.st = this.saved.pop();
  }
  /**
   * A line of plain text at (x, y). Lines follow one another in one text object, each placed relative to the
   * last (in whole hundredths, so nothing drifts): most of a table page is these.
   * @param {string} str the glyphs, as a literal string's escaped body (array: a TJ array's body)
   */
  text(pf, size, color, x, y, str, array = false) {
    this.setPaint(color, null);
    this.setFont(pf, size);
    const X = Math.round(x * 10) * 10, Y = Math.round(y * 10) * 10;
    if (!this.bt) {
      this._s += "BT\n";
      this.bt = true;
      this.tx = 0;
      this.ty = 0;
    }
    this._s += array ? `${(X - this.tx) / 100} ${(Y - this.ty) / 100} Td [${str}] TJ
` : `${(X - this.tx) / 100} ${(Y - this.ty) / 100} Td (${str}) Tj
`;
    this.tx = X;
    this.ty = Y;
  }
  /** end the open text object, if any: anything but text needs that (and draws the lines waiting) */
  et() {
    if (this.bt) {
      this._s += "ET\n";
      this.bt = false;
    }
    if (this.lines) this.flushLines();
  }
  lineWidth(w) {
    if (this.lines) this.flushLines();
    this.setLineWidth(w);
  }
  setLineWidth(w) {
    if (this.st.lw !== w) {
      this._s += `${n3(w)} w
`;
      this.st.lw = w;
    }
  }
  /** the graphics state that sets these opacities, or undefined when they are set already */
  gsFor(ca, CA) {
    return ca === this.st.ca && CA === this.st.CA ? void 0 : this.shared.gs(ca, CA);
  }
  alpha(ca, CA) {
    if (this.lines) this.flushLines();
    this.setAlpha(ca, CA);
  }
  setAlpha(ca, CA) {
    const g = this.gsFor(ca, CA);
    if (g) {
      this._s += `/${g} gs
`;
      this.st.ca = ca;
      this.st.CA = CA;
    }
  }
  /** set up to fill with fill and/or stroke with stroke (width w, dash); the lines waiting are drawn first */
  paint(fill, stroke, w = 1, dash = null) {
    if (this.lines) this.flushLines();
    this.setPaint(fill, stroke, w, dash);
  }
  setPaint(fill, stroke, w = 1, dash = null) {
    const st = this.st;
    if (fill && fill.rgb !== st.fill) {
      this._s += `${fill.rgb} rg
`;
      st.fill = fill.rgb;
    }
    if (stroke) {
      if (stroke.rgb !== st.stroke) {
        this._s += `${stroke.rgb} RG
`;
        st.stroke = stroke.rgb;
      }
      this.setLineWidth(w);
      const d = `[${(dash || []).map(n3).join(" ")}] 0`;
      if (d !== st.dash) {
        this._s += `${d} d
`;
        st.dash = d;
      }
    }
    this.setAlpha(fill ? fill.opacity : st.ca, stroke ? stroke.opacity : st.CA);
  }
  font(pf, size) {
    if (this.lines) this.flushLines();
    this.setFont(pf, size);
  }
  setFont(pf, size) {
    const name = this.shared.font(pf);
    if (name !== this.st.font || size !== this.st.size) {
      this._s += `/${name} ${n3(size)} Tf
`;
      this.st.font = name;
      this.st.size = size;
    }
  }
};
function latin1(s) {
  const B = (
    /** @type {any} */
    globalThis.Buffer
  );
  if (B) return B.from(s, "latin1");
  const out = new Uint8Array(s.length);
  for (let i = 0; i < s.length; i++) out[i] = s.charCodeAt(i);
  return out;
}
async function deflate(bytes) {
  if (zslots.free > 0) zslots.free--;
  else await new Promise((ok) => zslots.wait.push(
    /** @type {() => void} */
    ok
  ));
  try {
    return await deflateNow(bytes);
  } finally {
    const next = zslots.wait.shift();
    if (next) next();
    else zslots.free++;
  }
}
var zslots = { free: 4, wait: (
  /** @type {(() => void)[]} */
  []
) };
var NODE_ZLIB = (
  /** @type {any} */
  globalThis.process?.getBuiltinModule?.("node:zlib")
);
async function deflateNow(bytes) {
  const zlib = NODE_ZLIB;
  if (zlib) return new Promise((ok, fail) => zlib.deflate(bytes, { level: 9 }, (e, z) => e ? fail(e) : ok(z)));
  if (typeof CompressionStream === "undefined") return (await import("fflate")).zlibSync(bytes);
  return new Uint8Array(await new Response(new Blob([bytes]).stream().pipeThrough(new CompressionStream("deflate"))).arrayBuffer());
}

// src/exporters/pdfstream.js
var CHUNK = 64 * 1024;
var LEAF = 64;
var OBJSTM = 100;
var XBITS = 14;
var XB = 1 << XBITS;
var TAGGED_LARGE = 1e6;
var IN_FLIGHT = 8;
var hex42 = (id) => id.toString(16).padStart(4, "0");
var num2 = (v) => String(Math.round(v * 1e3) / 1e3);
var fontRes = (key) => `F_${key.replace(/[^A-Za-z0-9.-]/g, "_")}`;
var esc2 = (b) => b === 40 || b === 41 || b === 92 ? "\\" + String.fromCharCode(b) : b === 13 ? "\\r" : String.fromCharCode(b);
function written(sink, r) {
  const s = (
    /** @type {any} */
    sink
  );
  if (r !== false || !s.once) return Promise.resolve(r);
  return new Promise((ok, fail) => {
    const off = () => {
      s.off?.("drain", onDrain);
      s.off?.("error", onError);
      s.off?.("close", onClose);
    };
    const onDrain = () => {
      off();
      ok(void 0);
    };
    const onError = (e) => {
      off();
      fail(e);
    };
    const onClose = () => {
      off();
      fail(Object.assign(new Error("The sink closed before the PDF was written"), { code: "ERR_STREAM_PREMATURE_CLOSE" }));
    };
    s.once("drain", onDrain);
    s.once("error", onError);
    s.once("close", onClose);
  });
}
function raced(p, signal) {
  if (!signal) return p;
  if (signal.aborted) {
    p.catch(() => {
    });
    return Promise.reject(signal.reason);
  }
  return new Promise((ok, fail) => {
    const on = () => fail(signal.reason);
    signal.addEventListener("abort", on, { once: true });
    p.then((v) => {
      signal.removeEventListener("abort", on);
      ok(v);
    }, (e) => {
      signal.removeEventListener("abort", on);
      fail(e);
    });
  });
}
function createPdfStream(sink, opt) {
  const { fontStore } = opt;
  let pos = 0, nextNum = 0;
  const blocks = [];
  const late = /* @__PURE__ */ new Map();
  let packed = 0;
  const place = (n, k, l, i = 0) => {
    const b = blocks[n >>> XBITS];
    if (b instanceof Uint8Array) {
      late.set(n, k * 2 ** 48 + l * 2 ** 16 + i);
      return;
    }
    const j = n & XB - 1;
    b.kind[j] = k;
    b.loc[j] = l;
    b.idx[j] = i;
  };
  const reserve = () => {
    const n = nextNum++;
    if (!(n & XB - 1)) {
      blocks.push({ kind: new Uint8Array(XB), loc: new Uint32Array(XB), idx: new Uint16Array(XB) });
      const old = blocks.length - 3, b = blocks[old];
      if (old > 0 && !(b instanceof Uint8Array)) {
        for (let j = 0; j < XB; j++) if (b.kind[j] !== 1 && b.kind[j] !== 2) late.set(old * XB + j, b.kind[j] * 2 ** 48);
        const raw = new Uint8Array(XB * 7);
        raw.set(b.kind);
        raw.set(new Uint8Array(b.loc.buffer), XB);
        raw.set(new Uint8Array(b.idx.buffer), XB * 5);
        packed += (blocks[old] = deflateSync(raw, { level: 1 })).length;
      }
    }
    return n;
  };
  let reading = [-1, null];
  const where = (n) => {
    const v = late.get(n);
    if (v !== void 0) return [Math.floor(v / 2 ** 48), Math.floor(v / 2 ** 16) % 2 ** 32, v % 2 ** 16];
    const bi = n >>> XBITS, j = n & XB - 1;
    const z = blocks[bi];
    if (z instanceof Uint8Array && reading[0] !== bi) {
      const raw = inflateSync(z);
      reading = [bi, { kind: raw.subarray(0, XB), loc: new Uint32Array(raw.buffer, raw.byteOffset + XB, XB), idx: new Uint16Array(raw.buffer, raw.byteOffset + XB * 5, XB) }];
    }
    const b = z instanceof Uint8Array ? reading[1] : z;
    return [b.kind[j], b.loc[j], b.idx[j]];
  };
  reserve();
  let parts = [];
  let size = 0;
  const flush = async () => {
    if (!size) return;
    const all = new Uint8Array(size);
    let at = 0;
    for (const p of parts) {
      all.set(p, at);
      at += p.length;
    }
    parts = [];
    size = 0;
    await raced(written(sink, sink.write(all)), opt.signal);
  };
  const put = (x) => {
    const u8 = typeof x === "string" ? latin12(x) : x;
    parts.push(u8);
    size += u8.length;
    pos += u8.length;
    return size >= CHUNK ? flush() : void 0;
  };
  let batch = [];
  const writeBatch = async () => {
    if (!batch.length) return;
    const b = batch;
    batch = [];
    const sn = reserve();
    let head = "", body = "";
    b.forEach(([n, d], i) => {
      head += `${n} ${body.length} `;
      body += `${d}
`;
      place(n, 2, sn, i);
    });
    const raw = latin12(head + body);
    await writeObj(sn, `<< /Type /ObjStm /N ${b.length} /First ${head.length} /Filter /FlateDecode >>`, await deflate(raw));
  };
  const writeObj = async (n, dict, stream) => {
    if (!stream) {
      batch.push([n, dict]);
      place(n, 3, 0);
      return batch.length >= OBJSTM ? writeBatch() : void 0;
    }
    place(n, 1, pos);
    await put(`${n} 0 obj
${dict.replace(/>>\s*$/, `/Length ${stream.length} >>`)}
stream
`);
    await put(stream);
    return put("\nendstream\nendobj\n");
  };
  put("%PDF-1.7\n%âãÏÓ\n");
  const fonts = /* @__PURE__ */ new Map();
  let pages = 0, done = false;
  const inFlight = [];
  const fontOf = (key) => {
    let f = fonts.get(key);
    if (!f) {
      if (done) throw new Error("The PDF is finished");
      fonts.set(key, f = { name: fontRes(key), ref: reserve(), font: fontStore.get(key), cps: /* @__PURE__ */ new Set([32]), glyphs: /* @__PURE__ */ new Map(), memo: /* @__PURE__ */ new Map(), lit: /* @__PURE__ */ new Map() });
    }
    return f;
  };
  const resRef = reserve();
  for (const key of opt.fonts || []) fontOf(key);
  const res = /* @__PURE__ */ new Map();
  const totals = [];
  const pageRefs = [];
  const leaves = [];
  const w = {
    /** @param {string} key @returns {string} the font's resource name (F1…) */
    fontName: (key) => fontOf(key).name,
    /**
     * The text's glyphs, one per character (as the engine measured it: no layout features), as hex for <…> Tj, with
     * the glyphs recorded for the subset, W and ToUnicode.
     * @param {string} key @param {string} text
     */
    encode(key, text) {
      const F = fontOf(key);
      let out = "";
      for (const ch of text) {
        const cp = (
          /** @type {number} */
          ch.codePointAt(0)
        );
        let h = F.memo.get(cp);
        if (h === void 0) {
          const id = F.font.glyphForCodePoint(cp).id;
          F.memo.set(cp, h = F.font.standard ? id.toString(16).padStart(2, "0") : hex42(id));
          F.cps.add(cp);
          if (!F.glyphs.has(id)) F.glyphs.set(id, ch);
        }
        out += h;
      }
      return out;
    },
    /**
     * The same glyphs as a literal string's body, two bytes each, escaped (as pdf.js draws plain text): ( … ) Tj.
     * @param {string} key @param {string} text
     */
    literal(key, text) {
      const F = fontOf(key);
      let out = "";
      for (const ch of text) {
        const cp = (
          /** @type {number} */
          ch.codePointAt(0)
        );
        let b = F.lit.get(cp);
        if (b === void 0) {
          const id = parseInt(w.encode(key, ch), 16);
          F.lit.set(cp, b = F.font.standard ? esc2(id) : esc2(id >> 8) + esc2(id & 255));
        }
        out += b;
      }
      return out;
    },
    /**
     * Shaped glyphs drawn by ID (conjuncts, joined forms): [glyph ID, the text it stands for ('' for none)].
     * @param {string} key @param {Iterable<[number, string]>} glyphs
     */
    addGlyphs(key, glyphs) {
      const F = fontOf(key);
      for (const [id, text] of glyphs) if (!F.glyphs.has(id)) F.glyphs.set(id, text);
    },
    /**
     * A name in the shared Resources dictionary for a value (an indirect ref "12 0 R" or an inline dictionary).
     * @param {'ExtGState'|'XObject'|'Pattern'|'Shading'|'ColorSpace'} kind @param {string} value
     */
    resource(kind, value, name = void 0) {
      let m = res.get(kind);
      if (!m) res.set(kind, m = /* @__PURE__ */ new Map());
      let n = m.get(value);
      if (!n) m.set(value, n = name || `${kind === "ExtGState" ? "GS" : kind[0]}${m.size + 1}`);
      return n;
    },
    /**
     * The ExtGState name for fill and stroke opacity, named by its values (the same name in every writer: pages
     * painted elsewhere, parallel.js, use it too). @param {number} ca @param {number} CA
     */
    gs: (ca, CA) => w.resource("ExtGState", `<< /Type /ExtGState /ca ${num2(ca)} /CA ${num2(CA)} >>`, `GS${num2(ca)}_${num2(CA)}`),
    /** What this writer's pages used, for another writer to take over (pages painted elsewhere). */
    used: () => ({ fonts: [...fonts].map(([key, F]) => [key, [...F.cps], [...F.glyphs]]), gs: [...res.get("ExtGState")?.keys() || []] }),
    /** Take over what pages painted elsewhere used (used() of their writer). @param {any} u */
    take(u) {
      for (const [key, cps, glyphs] of u.fonts) {
        const F = fontOf(key);
        for (const cp of cps) F.cps.add(cp);
        for (const [id, t] of glyphs) if (!F.glyphs.has(id)) F.glyphs.set(id, t);
      }
      for (const v of u.gs) {
        const m = (
          /** @type {any} */
          v.match(/\/ca (\S+) \/CA (\S+)/)
        );
        w.gs(Number(m[1]), Number(m[2]));
      }
    },
    /**
     * Write an object now (an image: its dictionary and its stream, already filtered). @returns {Promise<number>} its number
     * @param {string} dict @param {Uint8Array} [stream]
     */
    async object(dict, stream) {
      const n = reserve();
      await writeObj(n, dict, stream);
      return n;
    },
    /** Bytes held for the cross-reference: the open blocks, the deflated ones, the late entries (a Map's ~40 each). */
    get xrefBytes() {
      return blocks.reduce((t, b) => t + (b instanceof Uint8Array ? 0 : XB * 7), packed + late.size * 40);
    },
    /** An object number to write later (objectAt). */
    reserve: () => reserve(),
    /** Write a reserved object. @param {number} n @param {string} dict @param {Uint8Array} [stream] */
    objectAt: (n, dict, stream) => writeObj(n, dict, stream),
    /**
     * Write a reserved object whose text may be long (an array of every row's element): head, the parts as they come,
     * tail; written out in place, never held whole. @param {number} n @param {string} head @param {Iterable<string>} parts @param {string} tail
     */
    async bigObject(n, head, parts2, tail) {
      place(n, 1, pos);
      await put(`${n} 0 obj
${head}`);
      for (const x of parts2) await put(x);
      await put(`${tail}
endobj
`);
    },
    /** The object number of page i (0-based), written or not: links and outline entries may point ahead. @param {number} i */
    pageRef(i) {
      return pageRefs[i] ?? (pageRefs[i] = reserve());
    },
    /**
     * The total page count, drawn at the end: a Form XObject whose origin is the text's baseline at the box's left;
     * draw it with `q 1 0 0 1 x y cm /<name> Do Q`. align: within width.
     * @param {{ font: string, size: number, width: number, align?: 'left'|'center'|'right', color?: string }} o
     */
    totalPages(o) {
      fontOf(o.font);
      const ref = reserve();
      totals.push({ ref, font: o.font, size: o.size, width: o.width, align: o.align || "left", color: o.color || "0 0 0" });
      return w.resource("XObject", `${ref} 0 R`);
    },
    /**
     * Write a page: its content stream (deflated) and its dictionary, now. Nothing of it stays but two offsets.
     * @param {{ width: number, height: number, content?: string | Uint8Array, deflated?: Uint8Array, annots?: (string | { ref: number, dict: string })[], extra?: string }} p
     *   deflated: the content stream already compressed (zlib), as pages painted elsewhere come.
     *   content: the page's operators (a string holds bytes 0–255, as pdf.js's Content makes). annots: annotation
     *   dictionaries (with a reserved number: { ref, dict }). extra: more entries for the page dictionary (/StructParents 3).
     */
    async addPage(p) {
      if (done) throw new Error("The PDF is finished");
      const i = pages++;
      const ref = w.pageRef(i);
      if (i % LEAF === 0) leaves.push(reserve());
      const contents = reserve(), parent = leaves[leaves.length - 1];
      const z = p.deflated ? Promise.resolve(p.deflated) : deflate(typeof p.content === "string" ? latin12(p.content) : p.content);
      z.catch(() => {
      });
      inFlight.push({ ref, contents, parent, p: { width: p.width, height: p.height, annots: p.annots, extra: p.extra }, z });
      while (inFlight.length > IN_FLIGHT) await writeNext();
    },
    /**
     * The end of the file: totals, fonts, resources, page tree, outline, catalog, Info, xref, trailer.
     * @param {{ outline?: OutlineEntry[], info?: { title?: string, author?: string, subject?: string, creationDate?: Date }, catalog?: string }} [o]
     *   catalog: more entries for the catalog (the structure tree, metadata, output intents).
     * @returns {Promise<{ pages: number, bytes: number }>}
     */
    async finish(o = {}) {
      if (done) throw new Error("The PDF is finished");
      if (!pages) await w.addPage({ width: 595.28, height: 841.89, content: "" });
      while (inFlight.length) await writeNext();
      done = true;
      for (const t of totals) {
        const F = fontOf(t.font), text = String(pages), hex2 = w.encode(t.font, text);
        let adv = 0;
        for (const ch of text) adv += F.font.glyphForCodePoint(
          /** @type {number} */
          ch.codePointAt(0)
        ).advanceWidth;
        const tw = adv * t.size / F.font.unitsPerEm;
        const dx = t.align === "right" ? t.width - tw : t.align === "center" ? (t.width - tw) / 2 : 0;
        await writeObj(
          t.ref,
          `<< /Type /XObject /Subtype /Form /BBox [${num2(Math.min(0, dx))} ${num2(-t.size)} ${num2(Math.max(t.width, dx + tw))} ${num2(2 * t.size)}] /Resources << /Font << /${F.name} ${F.ref} 0 R >> >> /Filter /FlateDecode >>`,
          await deflate(latin12(`${t.color} rg BT /${F.name} ${num2(t.size)} Tf ${num2(dx)} 0 Td <${hex2}> Tj ET`))
        );
      }
      const fontDict = [];
      for (const [key, F] of fonts) {
        if (F.glyphs.size) {
          await writeFont(key, F);
          fontDict.push(`/${F.name} ${F.ref} 0 R`);
        }
      }
      let resDict = `<< /ProcSet [/PDF /Text /ImageB /ImageC /ImageI] /Font << ${fontDict.join(" ")} >>`;
      for (const [kind, m] of res) resDict += ` /${kind} << ${[...m].map(([v, n]) => `/${n} ${v}`).join(" ")} >>`;
      await writeObj(resRef, resDict + " >>");
      let level = leaves.map((ref, k) => ({ ref, kids: pageRefs.slice(k * LEAF, Math.min(pages, (k + 1) * LEAF)), count: Math.min(LEAF, pages - k * LEAF) }));
      while (level.length > 1) {
        const up = [];
        for (let k = 0; k < level.length; k += LEAF) {
          const kids = level.slice(k, k + LEAF);
          up.push({ ref: reserve(), kids: kids.map((x) => x.ref), count: kids.reduce((s, x) => s + x.count, 0), below: kids });
        }
        for (const node2 of up) for (const kid of node2.below) kid.parent = node2.ref;
        await writeNodes(level);
        level = /** @type {any} */
        up;
      }
      await writeNodes(level);
      const pagesRoot = level[0].ref;
      const outline = await writeOutline(o.outline || []);
      const catalog = reserve();
      await writeObj(catalog, `<< /Type /Catalog /Pages ${pagesRoot} 0 R /PageLabels << /Nums [0 << /S /D /St 1 >>] >>${outline ? ` /Outlines ${outline} 0 R /PageMode /UseOutlines` : ""}${o.catalog || ""} >>`);
      const info = reserve(), I2 = o.info || {};
      await writeObj(info, `<< /Producer ${pdfText("ReportWright")} /Creator ${pdfText("ReportWright")} /Title ${pdfText(I2.title || "Report")}${I2.author ? ` /Author ${pdfText(I2.author)}` : ""}${I2.subject ? ` /Subject ${pdfText(I2.subject)}` : ""} /CreationDate ${pdfDate(I2.creationDate || /* @__PURE__ */ new Date())} /ModDate ${pdfDate(I2.creationDate || /* @__PURE__ */ new Date())} >>`);
      for (let n = 1; n < nextNum; n++) if (!where(n)[0]) await writeObj(n, "null");
      await writeBatch();
      const xn = reserve(), size2 = nextNum, xref = pos;
      place(xn, 1, xref);
      const out = (
        /** @type {Uint8Array[]} */
        []
      );
      const zs = new Zlib({ level: 6 }, (d) => {
        out.push(d);
      });
      const prev = new Uint8Array(7), row = new Uint8Array(7);
      for (let from = 0; from < size2; from += 65536) {
        const to = Math.min(size2, from + 65536), rows = new Uint8Array((to - from) * 8);
        for (let n = from; n < to; n++) {
          row.fill(0);
          if (n === 0) {
            row[5] = 255;
            row[6] = 255;
          } else {
            const [k, l, i] = where(n);
            row[0] = k;
            row[1] = l >>> 24 & 255;
            row[2] = l >>> 16 & 255;
            row[3] = l >>> 8 & 255;
            row[4] = l & 255;
            if (k === 2) {
              row[5] = i >> 8;
              row[6] = i & 255;
            }
          }
          const at = (n - from) * 8;
          rows[at] = 2;
          for (let b = 0; b < 7; b++) {
            rows[at + 1 + b] = row[b] - prev[b] & 255;
            prev[b] = row[b];
          }
        }
        zs.push(rows, to === size2);
      }
      let zn = 0;
      for (const c of out) zn += c.length;
      const z = new Uint8Array(zn);
      zn = 0;
      for (const c of out) {
        z.set(c, zn);
        zn += c.length;
      }
      const id = opt.id || [...globalThis.crypto.getRandomValues(new Uint8Array(16))].map((b) => b.toString(16).padStart(2, "0")).join("");
      await put(`${xn} 0 obj
<< /Type /XRef /Size ${size2} /W [1 4 2] /DecodeParms << /Columns 7 /Predictor 12 >> /Root ${catalog} 0 R /Info ${info} 0 R /ID [<${id}> <${id}>] /Filter /FlateDecode /Length ${z.length} >>
stream
`);
      await put(z);
      await put(`
endstream
endobj
startxref
${xref}
%%EOF
`);
      await flush();
      return { pages, bytes: pos };
    }
  };
  async function writeNext() {
    const { ref, contents, parent, p, z } = (
      /** @type {any} */
      inFlight.shift()
    );
    await writeObj(contents, "<< /Filter /FlateDecode >>", await z);
    const annots = [];
    for (const a of p.annots || []) annots.push(typeof a === "string" ? await w.object(a) : (await writeObj(a.ref, a.dict), a.ref));
    await writeObj(ref, `<< /Type /Page /Parent ${parent} 0 R /MediaBox [0 0 ${num2(p.width)} ${num2(p.height)}] /Resources ${resRef} 0 R /Contents ${contents} 0 R${annots.length ? ` /Annots [${annots.map((a) => `${a} 0 R`).join(" ")}]` : ""}${p.extra || ""} >>`);
  }
  async function writeNodes(nodes) {
    for (const n of nodes) await writeObj(n.ref, `<< /Type /Pages${n.parent ? ` /Parent ${n.parent} 0 R` : ""} /Kids [${n.kids.map((k) => `${k} 0 R`).join(" ")}] /Count ${n.count} >>`);
  }
  async function writeFont(key, F) {
    if (F.font.standard) {
      await writeObj(F.ref, standardFontDict(F.font));
      return;
    }
    await loadFontkit();
    const f = F.font, full = (
      /** @type {Uint8Array} */
      fontStore.bytes.get(key)
    );
    let bytes = full, psName = f.postscriptName;
    if (opt.subset && !f["OS/2"]?.fsType?.noSubsetting) {
      try {
        const sub = await opt.subset(full, F.cps, { glyphs: F.glyphs.keys() });
        const padded = new Uint8Array(sub.length + 16);
        padded.set(sub);
        const check = fontkit.create(padded);
        for (const id of F.glyphs.keys()) void check.getGlyph(id).advanceWidth;
        bytes = sub;
        psName = check.postscriptName || psName;
      } catch {
      }
    }
    const cff = "CFF " in f.directory.tables || "CFF2" in f.directory.tables;
    const base = `${bytes === full ? "" : `${subsetTag(bytes)}+`}${String(psName || "Font").replace(/[^A-Za-z0-9_.-]/g, "")}`;
    const k = 1e3 / f.unitsPerEm, s = (v) => String(v * k);
    const desc = reserve(), file = reserve(), cid = reserve(), cmap = reserve();
    const fileDict = cff ? "<< /Subtype /OpenType /Filter /FlateDecode >>" : `<< /Length1 ${bytes.length} /Filter /FlateDecode >>`;
    await writeObj(file, fileDict, await deflate(bytes));
    const bb = f.bbox, italic = f.italicAngle || 0;
    const flags = (f.post?.isFixedPitch ? 1 : 0) | 4 | (italic ? 64 : 0);
    await writeObj(desc, `<< /Type /FontDescriptor /FontName /${base} /Flags ${flags} /FontBBox [${s(bb.minX)} ${s(bb.minY)} ${s(bb.maxX)} ${s(bb.maxY)}] /ItalicAngle ${num2(italic)} /Ascent ${s(f.ascent)} /Descent ${s(f.descent)} /CapHeight ${s(f.capHeight || f.ascent)} /XHeight ${s(f.xHeight || 0)} /StemV 0 /${cff ? "FontFile3" : "FontFile2"} ${file} 0 R >>`);
    const ids = [...F.glyphs.keys()].sort((a, b) => a - b);
    let W = "";
    for (let i = 0; i < ids.length; ) {
      let j = i;
      while (j + 1 < ids.length && ids[j + 1] === ids[j] + 1) j++;
      W += `${ids[i]} [${ids.slice(i, j + 1).map((id) => s(f.getGlyph(id).advanceWidth)).join(" ")}] `;
      i = j + 1;
    }
    await writeObj(cid, `<< /Type /Font /Subtype /${cff ? "CIDFontType0" : "CIDFontType2"} /BaseFont /${base} /CIDSystemInfo << /Registry (Adobe) /Ordering (Identity) /Supplement 0 >> /FontDescriptor ${desc} 0 R /W [${W}]${cff ? "" : " /CIDToGIDMap /Identity"} >>`);
    await writeObj(cmap, "<< /Filter /FlateDecode >>", await deflate(latin12(toUnicode(F.glyphs))));
    await writeObj(F.ref, `<< /Type /Font /Subtype /Type0 /BaseFont /${base} /Encoding /Identity-H /DescendantFonts [${cid} 0 R] /ToUnicode ${cmap} 0 R >>`);
  }
  async function writeOutline(entries) {
    const root = { ref: 0, level: -1, kids: [] };
    const stack = [root];
    for (const e of entries) {
      if (!(e.page >= 1 && e.page <= pages)) continue;
      const level = Math.max(0, Math.min(9, Number(e.level) || 0));
      while (stack[stack.length - 1].level >= level) stack.pop();
      const node2 = { ref: reserve(), level, kids: [], title: e.title, dest: `[${pageRefs[e.page - 1]} 0 R ${e.top == null ? "/Fit" : `/XYZ null ${num2(e.top)} null`}]` };
      stack[stack.length - 1].kids.push(node2);
      stack.push(node2);
    }
    if (!root.kids.length) return 0;
    root.ref = reserve();
    const count = (n) => n.kids.reduce((t, c) => t + 1 + count(c), 0);
    const children = (n) => n.kids.length ? ` /First ${n.kids[0].ref} 0 R /Last ${n.kids[n.kids.length - 1].ref} 0 R /Count ${count(n)}` : "";
    const write = async (n) => {
      for (let i = 0; i < n.kids.length; i++) {
        const c = n.kids[i];
        await writeObj(c.ref, `<< /Title ${pdfText(c.title)} /Parent ${n.ref} 0 R /Dest ${c.dest}${i ? ` /Prev ${n.kids[i - 1].ref} 0 R` : ""}${i < n.kids.length - 1 ? ` /Next ${n.kids[i + 1].ref} 0 R` : ""}${children(c)} >>`);
        await write(c);
      }
    };
    await write(root);
    await writeObj(root.ref, `<< /Type /Outlines${children(root)} >>`);
    return root.ref;
  }
  return w;
}
function toUnicode(glyphs) {
  const entries = [...glyphs].filter(([, t]) => t).sort((a, b) => a[0] - b[0]);
  let body = "";
  for (let i = 0; i < entries.length; i += 100) {
    const chunk = entries.slice(i, i + 100);
    body += `${chunk.length} beginbfchar
${chunk.map(([id, t]) => `<${hex42(id)}> <${utf16(t)}>`).join("\n")}
endbfchar
`;
  }
  return `/CIDInit /ProcSet findresource begin
12 dict begin
begincmap
/CIDSystemInfo << /Registry (Adobe) /Ordering (UCS) /Supplement 0 >> def
/CMapName /Adobe-Identity-UCS def
/CMapType 2 def
1 begincodespacerange
<0000> <ffff>
endcodespacerange
${body}endcmap
CMapName currentdict /CMap defineresource pop
end
end
`;
}
var utf16 = (t) => {
  let h = "";
  for (let i = 0; i < t.length; i++) h += hex42(t.charCodeAt(i));
  return h;
};
var pdfText = (t) => `<feff${utf16(String(t ?? ""))}>`;
var pdfDate = (d) => `(D:${d.toISOString().replace(/\D/g, "").slice(0, 14)}+00'00')`;
function subsetTag(bytes) {
  let h = 2166136261;
  for (let i = 0; i < bytes.length; i++) h = Math.imul(h ^ bytes[i], 16777619);
  let tag = "";
  for (let i = 0; i < 6; i++) {
    tag += String.fromCharCode(65 + (h >>> 0) % 26);
    h = Math.imul(h ^ i, 16777619) >>> 0;
  }
  return tag;
}
function latin12(s) {
  const B = (
    /** @type {any} */
    globalThis.Buffer
  );
  if (B) return B.from(s, "latin1");
  const out = new Uint8Array(s.length);
  for (let i = 0; i < s.length; i++) out[i] = s.charCodeAt(i);
  return out;
}
async function writePagedPdf(plan2, opts, sink) {
  const { fontStore } = opts;
  if (opts.pdfa || opts.tagged) await fontStore.load(standIns(fontStore));
  const w = createPdfStream(sink, { fontStore, subset: opts.subset, id: opts.id, signal: opts.signal });
  const { info, pages } = (
    /** @type {any} */
    plan2
  );
  const tags = opts.tagged ? createStreamTagger(w, { maxElements: Number(opts.tagged.maxElements) || Infinity }) : null;
  const env = paintEnv(w, fontStore, { drillBase: opts.drillBase, tags, embedAll: !!(opts.pdfa || tags) });
  const { shaped } = env;
  const pool = !tags && Number(opts.parallel) > 1 ? paintPool(Number(opts.parallel), fontStore, opts, info) : null;
  let pi = -1;
  const it = pages(pool ? { run: pool.run, parallel: pool.size } : {})[Symbol.asyncIterator]();
  let pending = false;
  try {
    for (; ; ) {
      opts.signal?.throwIfAborted();
      pending = true;
      const x = await raced(it.next(), opts.signal);
      pending = false;
      if (x.done) break;
      const pg = x.value;
      pi++;
      const H = pg.height ?? info.height;
      if (pg.deflated) {
        for (const f of pg.embedded || []) env.embedded?.add(f);
        if (pg.used) {
          w.take(pg.used);
          for (const [k, g] of pg.shaped) {
            const m = env.shapedOf(k);
            for (const [id, t] of g) if (!m.has(id)) m.set(id, t);
          }
        }
        const annots2 = pg.annots.map((a) => a.replace(/@@P(\d+)@@/g, (_, i) => String(w.pageRef(Number(i)))));
        await w.addPage({ width: pg.width ?? info.width, height: H, deflated: pg.deflated, annots: annots2 });
        continue;
      }
      const { content, annots } = paintPage(pg, H, env);
      await w.addPage({ width: pg.width ?? info.width, height: H, content, annots, extra: tags ? await tags.end(w.pageRef(pi)) : void 0 });
    }
  } finally {
    if (pending) it.return?.(void 0)?.catch(() => {
    });
    else await it.return?.(void 0);
    await pool?.close();
  }
  for (const [key, g] of shaped) w.addGlyphs(key, g);
  const seen = /* @__PURE__ */ new Set();
  const outline = [...info.bookmarks, ...info.headings].map((b, i) => ({ b, i })).sort((p, q) => p.b.page - q.b.page || (p.b.y ?? 0) - (q.b.y ?? 0) || p.i - q.i).map(({ b }) => b).filter((b) => {
    const k = `${b.page}|${Math.round(b.y ?? 0)}|${b.label}`;
    if (seen.has(k)) return false;
    seen.add(k);
    return true;
  }).map((b) => ({ title: b.label, page: b.page, top: info.height - b.y + 4, level: b.level }));
  const title = opts.title || "Report", when = new Date(Math.floor((opts.creationDate || /* @__PURE__ */ new Date()).getTime() / 1e3) * 1e3);
  let catalog = tags ? await tags.finish({ lang: opts.tagged.lang }) : "";
  if (opts.pdfa || tags) {
    const xmp = new TextEncoder().encode(xmpPacket({ title, author: opts.author, stamp: when.toISOString().replace(".000Z", "Z"), pdfa: opts.pdfa ? tags ? "A" : "B" : null, ua: !!tags }));
    catalog += ` /Metadata ${await w.object("<< /Type /Metadata /Subtype /XML >>", xmp)} 0 R`;
  }
  if (opts.pdfa) {
    const icc = await w.object("<< /N 3 /Filter /FlateDecode >>", await deflate(opts.pdfa.icc));
    catalog += ` /OutputIntents [${await w.object(`<< /Type /OutputIntent /S /GTS_PDFA1 /OutputConditionIdentifier (sRGB) /Info (sRGB IEC61966-2.1) /DestOutputProfile ${icc} 0 R >>`)} 0 R]`;
  }
  const res = await w.finish({ outline, catalog, info: { title, author: opts.author, creationDate: when } });
  for (const x of env.embedded ? embeddedWarnings(env.embedded) : []) info.warnings.push(x);
  if (tags && tags.count > TAGGED_LARGE) info.warnings.push(`The tagged PDF has ${tags.count.toLocaleString("en-US")} structure elements (${res.pages.toLocaleString("en-US")} pages): readers open it, but tools that load every object of a file (qpdf, pikepdf) may run out of memory on it. tagged.maxElements caps it.`);
  return { pages: res.pages, warnings: info.warnings };
}
var lit = (v) => `(${String(v).replace(/[\\()]/g, "\\$&")})`;
function coveredText(items, box) {
  const lines = [];
  for (const t of items) if (t.t === "text" && t.lines) {
    for (const l of t.lines) if (l.text?.trim() && l.x >= box.x && l.x <= box.x + box.w && l.y >= box.y && l.y <= box.y + box.h) lines.push(l);
  }
  return lines.sort((a, b) => a.y - b.y || a.x - b.x).map((l) => l.text.trim()).join(" ");
}
function paintPage(pg, H, env) {
  if (env.embedded) pg = embeddedPage(pg, env.font, env.embedded);
  const annots = [];
  const c = new Content(env.shared);
  const { tags } = env;
  if (tags) {
    c.tagged = true;
    c.artLines = true;
    tags.page(pg.win ?? 0);
  }
  for (const it of pg.items) {
    const mark = tags && it.t !== "line" && tags.open(it);
    const inText = mark && it.t === "text" && !it.rotate && it.lines.every((l) => !l.runs) && !(it.clip && !insideClip(it, env.vmetrics(it.font)));
    if (inText) {
      if (!c.bt) {
        c._s += "BT\n";
        c.bt = true;
        c.tx = 0;
        c.ty = 0;
      }
      c._s += mark;
    } else if (mark) {
      c.et();
      c.s += mark;
    }
    if (it.t !== "text" && it.t !== "line" || it.rotate) c.et();
    if (it.rotate) {
      const t = -it.rotate.a * Math.PI / 180, cs = Math.cos(t), sn = Math.sin(t);
      const px = it.rotate.cx, py = H - it.rotate.cy;
      c.q();
      c.s += `${n4(cs)} ${n4(sn)} ${n4(-sn)} ${n4(cs)} ${n2(px - px * cs + py * sn)} ${n2(py - px * sn - py * cs)} cm
`;
    }
    switch (it.t) {
      case "rect": {
        const fill = col(it.fill), stroke = col(it.stroke);
        if (!fill && !stroke) break;
        if (it.radius) throw new Error("rounded boxes do not stream yet");
        c.paint(fill, stroke, it.strokeWidth || 1, it.dash);
        const x = n2(it.x), y = n2(H - it.y - it.h), rw = n2(it.w), rh = n2(it.h);
        c.s += (stroke && it.dash?.length ? `${x} ${y} m ${x} ${n2(y + rh)} l ${n2(x + rw)} ${n2(y + rh)} l ${n2(x + rw)} ${y} l h` : `${x} ${y} ${rw} ${rh} re`) + (fill && stroke ? " B\n" : fill ? " f\n" : " S\n");
        break;
      }
      case "ellipse": {
        const fill = col(it.fill), stroke = col(it.stroke);
        if (!fill && !stroke) break;
        c.paint(fill, stroke, it.strokeWidth || 1, it.dash);
        const cx = it.cx, cy = H - it.cy, rx = it.rx, ry = it.ry, ox = rx * KAPPA, oy = ry * KAPPA;
        c.s += `${n2(cx - rx)} ${n2(cy)} m ${n2(cx - rx)} ${n2(cy - oy)} ${n2(cx - ox)} ${n2(cy - ry)} ${n2(cx)} ${n2(cy - ry)} c ${n2(cx + ox)} ${n2(cy - ry)} ${n2(cx + rx)} ${n2(cy - oy)} ${n2(cx + rx)} ${n2(cy)} c ${n2(cx + rx)} ${n2(cy + oy)} ${n2(cx + ox)} ${n2(cy + ry)} ${n2(cx)} ${n2(cy + ry)} c ${n2(cx - ox)} ${n2(cy + ry)} ${n2(cx - rx)} ${n2(cy + oy)} ${n2(cx - rx)} ${n2(cy)} c h ${fill &&
        stroke ? "B" : fill ? "f" : "S"}
`;
        break;
      }
      case "line": {
        const st = col(it.stroke);
        if (st) c.line(st, it.strokeWidth || 1, it.dash, it.x1, H - it.y1, it.x2, H - it.y2);
        break;
      }
      case "text": {
        const color = col(it.color) || BLACK;
        const clipped = it.clip && !insideClip(it, env.vmetrics(it.font));
        if (clipped) {
          c.q();
          c.s += `${n2(it.clip.x)} ${n2(H - it.clip.y - it.clip.h)} ${n2(it.clip.w)} ${n2(it.clip.h)} re W n
`;
        }
        for (const l of it.lines) {
          if (!l.runs) {
            c.text(env.pf(it.font), it.size, color, l.x, H - l.y, env.literal(it.font, cleanText(l.text)));
            continue;
          }
          for (const r of l.runs) {
            const g = env.shapedOf(r.font), spans = /* @__PURE__ */ new WeakMap();
            glyphText(r, env.font(r.font), g, spans);
            if (r.text.trim()) drawRun(c, r, l.x + r.x, H - l.y, it.size, env.pf(r.font), color, spans.get(r), g);
          }
        }
        if (clipped) c.Q();
        break;
      }
      case "link": {
        const rect = `[${[it.x, H - it.y - it.h, it.x + it.w, H - it.y].map(n2).join(" ")}]`;
        const a = it.action;
        const href = a?.type === "url" && safeUrl(a.href) ? a.href : a?.type === "drill" ? drillUrl(env.drillBase, a) : null;
        const to = href ? `/A << /Type /Action /S /URI /URI ${lit(asciiUrl(href))} >>` : a?.type === "bookmark" && a.page ? `/Dest [${env.pageRef(a.page - 1)} 0 R /XYZ null ${n2(H - a.y + 4)} null]` : null;
        if (!to) break;
        if (!tags) {
          annots.push(`<< /Type /Annot /Subtype /Link /F 4 /Rect ${rect} /Border [0 0 0] ${to} >>`);
          break;
        }
        const ref = env.reserve(), key = tags.link(it, ref);
        const say = coveredText(pg.items, it) || it.tip || href || (a.target ? `Go to ${a.target}` : `Go to page ${a.page}`);
        annots.push({ ref, dict: `<< /Type /Annot /Subtype /Link /F 4 /Rect ${rect} /Border [0 0 0] ${to} /Contents ${pdfText(say)} /StructParent ${key} >>` });
        break;
      }
      default:
        throw new Error(`A ${it.t} item does not stream yet`);
    }
    if (it.rotate) c.Q();
    if (inText) c._s += "EMC\n";
    else if (mark) {
      c.et();
      c.s += "EMC\n";
    }
  }
  c.et();
  return { content: c.s, annots };
}
function paintEnv(w, fontStore, o = {}) {
  const pfs = /* @__PURE__ */ new Map();
  const shaped = /* @__PURE__ */ new Map();
  const vm = /* @__PURE__ */ new Map();
  return {
    shared: { font: (f) => w.fontName(f.key), gs: (ca, CA) => w.gs(ca, CA), image: () => {
      throw new Error("images do not stream yet");
    } },
    pf: (key) => {
      let f = pfs.get(key);
      if (!f) pfs.set(key, f = { key, embedder: { font: fontStore.get(key) } });
      return f;
    },
    font: (key) => fontStore.get(key),
    shaped,
    shapedOf: (key) => {
      let g = shaped.get(key);
      if (!g) shaped.set(key, g = /* @__PURE__ */ new Map());
      return g;
    },
    vmetrics: (key) => {
      let m = vm.get(key);
      if (!m) {
        const f = fontStore.get(key), u = f?.unitsPerEm || 1e3;
        vm.set(key, m = { asc: (f?.ascent ?? u) / u, desc: -(f?.descent ?? 0) / u });
      }
      return m;
    },
    literal: (key, text) => w.literal(key, text),
    pageRef: o.pageRef || ((i) => w.pageRef(i)),
    reserve: () => w.reserve(),
    drillBase: o.drillBase,
    tags: o.tags || null,
    /** PDF/A, PDF/UA: standard fonts drawn in embedded stand-ins; the families that were @type {Set<string>|null} */
    embedded: o.embedAll ? /* @__PURE__ */ new Set() : null
  };
}
function paintPool(size, fontStore, opts, info) {
  const wt = (
    /** @type {any} */
    globalThis.process?.getBuiltinModule?.("node:worker_threads")
  );
  if (!wt) return null;
  let workers = [];
  let seq = 0, turn = 0;
  const waiting = /* @__PURE__ */ new Map();
  const clean = (r) => {
    if (!r) return r;
    const { __i, ...o } = r;
    return o;
  };
  const start = async () => {
    const fonts = [...fontStore.bytes];
    if (fontStore.shaper) fonts.push(["harfbuzz", await fontStore.loader("harfbuzz")]);
    workers = Array.from({ length: size }, () => {
      const w = new wt.Worker(new URL("./pdfstreamworker.js", import.meta.url), { workerData: { fonts } });
      w.on("message", (m) => {
        const p = waiting.get(m.id);
        waiting.delete(m.id);
        if (m.error) p.fail(Object.assign(new Error(m.error.message), { status: m.error.status, timeout: m.error.timeout }));
        else p.ok(m);
      });
      w.on("error", (e) => {
        for (const p of waiting.values()) p.fail(e);
        waiting.clear();
      });
      return w;
    });
  };
  let started = null;
  const pick = ["parameters", "now", "timeZone", "state", "target", "deadline", "timeoutMs"];
  return {
    size,
    /** @param {any} job */
    async run(job) {
      await (started || (started = start()));
      const id = ++seq;
      const pw = job.pageWindow;
      const msg = {
        id,
        def: job.def,
        rows: job.rows.map(clean),
        keep: job.keep,
        drillBase: opts.drillBase,
        embedAll: !!opts.pdfa,
        height: info.height,
        opts: Object.fromEntries(pick.filter((k) => opts[k] !== void 0).map((k) => [k, opts[k]])),
        pageWindow: { ...pw, first: clean(pw.first), cont: pw.cont.map((c) => c && { first: clean(c.first), before: c.before }) }
      };
      const r = await new Promise((ok, fail) => {
        waiting.set(id, { ok, fail });
        workers[turn++ % workers.length].postMessage(msg);
      });
      if (r.pages.length) {
        r.pages[0].used = r.used;
        r.pages[0].shaped = r.shaped;
        r.pages[0].embedded = r.embedded;
      }
      return r;
    },
    async close() {
      await Promise.all(workers.map((w) => w.terminate()));
    }
  };
}

// src/exporters/pdf.js
function exportPdf(model, fontStore, opt = {}) {
  return withDeadline(
    pdfOf(model, fontStore, opt),
    /** @type {any} */
    opt.timeoutMs
  );
}
async function pdfOf(model, fontStore, opt) {
  await fontStore.load(modelFontKeys(model));
  if (ownWriterFits(model, opt)) return ownWriter(model, fontStore, opt);
  await loadPdfLib();
  const fixed = fixedDate(opt);
  const when = fixed ?? /* @__PURE__ */ new Date();
  const fileId = fixed ? await contentId(model, opt, when) : void 0;
  const doc = await PDFDocument.create({ updateMetadata: false });
  doc.registerFontkit(fontkit);
  doc.setTitle(opt.title || "Report");
  doc.setProducer("ReportWright");
  doc.setCreator("ReportWright");
  if (opt.author) doc.setAuthor(opt.author);
  setInfoDates(doc, when);
  if (fileId) doc.context.trailerInfo.ID = doc.context.obj([PDFHexString.of(fileId), PDFHexString.of(fileId)]);
  if (opt.pdfa || opt.tagged || model.pages.some((pg) => pg.items.some((i) => i.t === "field"))) await fontStore.load(standIns(fontStore));
  if (opt.pdfa || opt.tagged) {
    const families = /* @__PURE__ */ new Set();
    model = { ...model, pages: model.pages.map((pg) => embeddedPage(pg, (k) => fontStore.get(k), families)) };
    for (const w of embeddedWarnings(families)) opt.onWarning?.(w);
  }
  const used = /* @__PURE__ */ new Map();
  const shaped = /* @__PURE__ */ new Map();
  const spans = /* @__PURE__ */ new WeakMap();
  const chars = (key) => {
    let c = used.get(key);
    if (!c) {
      c = /* @__PURE__ */ new Set([32]);
      used.set(key, c);
    }
    return c;
  };
  for (const pg of model.pages) for (const it of pg.items.flatMap((i) => i.t === "field" ? i.draw.filter((d) => d.t === "text") : i.t === "text" ? [i] : [])) {
    for (const l of it.lines) {
      if (!l.runs) {
        const c = chars(it.font);
        for (const ch of l.text) c.add(
          /** @type {number} */
          ch.codePointAt(0)
        );
        continue;
      }
      for (const r of l.runs) {
        const c = chars(r.font);
        for (const ch of r.text) c.add(
          /** @type {number} */
          ch.codePointAt(0)
        );
        let g = shaped.get(r.font);
        if (!g) {
          g = /* @__PURE__ */ new Map();
          shaped.set(r.font, g);
        }
        glyphText(r, fontStore.get(r.font), g, spans);
      }
    }
  }
  const fieldFonts = /* @__PURE__ */ new Set();
  for (const pg of model.pages) for (const it of pg.items) if (it.t === "field") fieldFonts.add(fieldFont(it));
  const fonts = /* @__PURE__ */ new Map();
  const font = async (key) => {
    if (!fonts.has(key) && isStandard(key)) {
      const f = fontStore.get(key);
      fonts.set(key, { ref: doc.context.register(doc.context.obj(
        /** @type {any} */
        standardFontEntries(f)
      )), embedder: { font: f, literalOf: (t) => standardLiteral(f, t), tjOf: () => null } });
    }
    if (!fonts.has(key)) {
      const full = fontStore.bytes.get(key);
      let bytes = full;
      if (!bytes) throw new Error(`Font "${key}" is not loaded`);
      let psName = fontStore.get(key).postscriptName;
      const glyphs = shaped.get(key);
      if (opt.subset && !fieldFonts.has(key) && !fontStore.get(key)["OS/2"]?.fsType?.noSubsetting) {
        const cps = used.get(key) || /* @__PURE__ */ new Set([32]);
        try {
          const sub = withPadding(await opt.subset(bytes, cps, glyphs ? { glyphs: glyphs.keys() } : void 0));
          const f = fontkit.create(sub);
          for (const cp of cps) void f.glyphForCodePoint(cp).advanceWidth;
          for (const id of glyphs?.keys() || []) void f.getGlyph(id).advanceWidth;
          bytes = sub;
          psName = f.postscriptName || psName;
        } catch {
        }
      }
      const pf = await doc.embedFont(bytes, { subset: false, customName: bytes === full ? void 0 : `${subsetTag2(bytes)}+${psName || "Font"}` });
      plainEncoding(pf);
      if (glyphs) addGlyphs(pf, glyphs, !!opt.tagged);
      const file = bytes, e = (
        /** @type {any} */
        pf.embedder
      );
      if (!e.isCFF()) e.embedFontStream = async (c) => c.register(PDFRawStream.of(c.obj({ Filter: "FlateDecode", Length1: file.length }), await deflate(file)));
      fonts.set(key, pf);
    }
    return fonts.get(key);
  };
  const images = /* @__PURE__ */ new Map();
  const image = async (src) => {
    if (images.has(src)) return images.get(src);
    const out = await loadImage(src).catch((e) => ({ img: null, why: `it could not be embedded (${e?.message || e})` }));
    images.set(src, out);
    return out;
  };
  async function loadImage(src) {
    const local = /^data:/i.test(src);
    if (local && dataUriBytes(src) > IMAGE_LIMITS.bytes) return { img: null, why: "it is larger than the image size limit" };
    if (!local && !opt.fetchImage) return { img: null, why: "it is a URL, and no fetchImage was given to load it" };
    const bytes = local ? dataUriBytesOf(src) : await opt.fetchImage(src);
    if (!bytes?.length) return { img: null, why: "it could not be loaded" };
    if (bytes.length > IMAGE_LIMITS.bytes) return { img: null, why: "it is larger than the image size limit" };
    const info = imageInfoOf(bytes);
    if (info?.type === "svg") {
      const svg = parseSvg(new TextDecoder().decode(bytes));
      return svg ? { img: { svg, width: svg.w, height: svg.h } } : { img: null, why: "the SVG could not be read" };
    }
    if (info?.type === "png") {
      const why = "w" in info && !/** @type {any} */
      info.suspect && info.w * info.h <= IMAGE_LIMITS.pixels ? pngProblem(bytes) : "too large or animated";
      return why ? { img: null, why: `the PNG is not usable (${why})` } : { img: await doc.embedPng(bytes) };
    }
    if (info?.type === "jpeg") return { img: await doc.embedJpg(bytes) };
    return { img: null, why: info ? `${info.type.toUpperCase()} is not embedded (PNG, JPEG and SVG are)` : "it is not a PNG, JPEG or SVG" };
  }
  const ctx = doc.context;
  const res = ctx.obj({ Font: {}, ExtGState: {}, XObject: {} });
  const resRef = ctx.register(res);
  const names = /* @__PURE__ */ new Map();
  const nameOf = (kind, key, value) => {
    let n = names.get(key);
    if (!n) {
      n = `${kind[0]}${names.size + 1}`;
      names.set(key, n);
      res.get(PDFName.of(kind)).set(PDFName.of(n), value());
    }
    return n;
  };
  const shared = {
    font: (pf) => nameOf("Font", pf, () => pf.ref),
    gs: (ca, CA) => nameOf("ExtGState", `gs ${ca} ${CA}`, () => ctx.obj({ Type: "ExtGState", ca, CA })),
    image: (img) => nameOf("XObject", img, () => img.ref)
  };
  const links = [];
  const taken = /* @__PURE__ */ new Set();
  const uniqueName = (n) => {
    let name = n, i = 1;
    while (taken.has(name)) name = `${n}_${++i}`;
    taken.add(name);
    return name;
  };
  const contents = [];
  if (opt.tagged) needsTableData(model, "An accessible PDF");
  const tags = opt.tagged ? createTagger(model, doc) : null;
  let pi = -1;
  const vm = /* @__PURE__ */ new Map();
  const vmetrics = (key) => {
    let m = vm.get(key);
    if (!m) {
      const f = fontStore.get(key), u = f?.unitsPerEm || 1e3;
      vm.set(key, m = { asc: (f?.ascent ?? u) / u, desc: -(f?.descent ?? 0) / u });
    }
    return m;
  };
  for (const pg of model.pages) {
    pi++;
    const H = pg.height ?? model.height;
    const p = doc.addPage([pg.width ?? model.width, H]);
    p.node.normalize();
    p.node.set(PDFName.of("Resources"), resRef);
    const c = new Content(shared);
    if (tags) c.tagged = true;
    p.maybeEmbedGraphicsState = (o) => c.gsFor(o.opacity ?? 1, o.borderOpacity ?? 1);
    const viaPdfLib = (draw) => {
      c.et();
      c.lineWidth(1);
      draw();
      const ops = (
        /** @type {any} */
        p.getContentStream().operators
      );
      for (const op of ops) c.s += op.toString() + "\n";
      ops.length = 0;
    };
    for (let ii = 0; ii < pg.items.length; ii++) {
      const it = pg.items[ii];
      const mark = tags && tags.open(pi, ii, it);
      if (mark) {
        c.et();
        c.s += mark;
      }
      if (it.t !== "text" && it.t !== "line" || it.rotate) c.et();
      if (it.rotate) {
        const t = -it.rotate.a * Math.PI / 180, cs = Math.cos(t), sn = Math.sin(t);
        const px = it.rotate.cx, py = H - it.rotate.cy;
        c.q();
        c.s += `${n4(cs)} ${n4(sn)} ${n4(-sn)} ${n4(cs)} ${n2(px - px * cs + py * sn)} ${n2(py - px * sn - py * cs)} cm
`;
      }
      switch (it.t) {
        case "rect": {
          const fill = col(it.fill), stroke = col(it.stroke);
          if (!fill && !stroke) break;
          if (it.radius) {
            viaPdfLib(() => p.drawSvgPath(roundRect(it.x, it.y, it.w, it.h, it.radius), {
              x: 0,
              y: H,
              color: fill?.color,
              opacity: fill?.opacity,
              borderColor: stroke?.color,
              borderWidth: stroke ? it.strokeWidth || 1 : 0,
              borderOpacity: stroke?.opacity,
              borderDashArray: it.dash || void 0
            }));
          } else {
            c.paint(fill, stroke, it.strokeWidth || 1, it.dash);
            const x = n2(it.x), y = n2(H - it.y - it.h), w = n2(it.w), h = n2(it.h);
            c.s += (stroke && it.dash?.length ? `${x} ${y} m ${x} ${n2(y + h)} l ${n2(x + w)} ${n2(y + h)} l ${n2(x + w)} ${y} l h` : `${x} ${y} ${w} ${h} re`) + (fill && stroke ? " B\n" : fill ? " f\n" : " S\n");
          }
          break;
        }
        case "ellipse": {
          const fill = col(it.fill), stroke = col(it.stroke);
          if (!fill && !stroke) break;
          c.paint(fill, stroke, it.strokeWidth || 1, it.dash);
          const cx = it.cx, cy = H - it.cy, rx = it.rx, ry = it.ry, ox = rx * KAPPA, oy = ry * KAPPA;
          c.s += `${n2(cx - rx)} ${n2(cy)} m ${n2(cx - rx)} ${n2(cy - oy)} ${n2(cx - ox)} ${n2(cy - ry)} ${n2(cx)} ${n2(cy - ry)} c ${n2(cx + ox)} ${n2(cy - ry)} ${n2(cx + rx)} ${n2(cy - oy)} ${n2(cx + rx)} ${n2(cy)} c ${n2(cx + rx)} ${n2(cy + oy)} ${n2(cx + ox)} ${n2(cy + ry)} ${n2(cx)} ${n2(cy + ry)} c ${n2(cx - ox)} ${n2(cy + ry)} ${n2(cx - rx)} ${n2(cy + oy)} ${n2(cx - rx)} ${n2(cy)} c h ${fill &&
          stroke ? "B" : fill ? "f" : "S"}
`;
          break;
        }
        case "line": {
          const s = col(it.stroke);
          if (!s) break;
          c.line(s, it.strokeWidth || 1, it.dash, it.x1, H - it.y1, it.x2, H - it.y2);
          break;
        }
        case "text": {
          const f = it.lines.some((l) => !l.runs) ? await font(it.font) : null;
          const color = col(it.color) || BLACK;
          const clipped = it.clip && !insideClip(it, vmetrics(it.font));
          if (clipped) {
            c.q();
            c.s += `${n2(it.clip.x)} ${n2(H - it.clip.y - it.clip.h)} ${n2(it.clip.w)} ${n2(it.clip.h)} re W n
`;
          }
          for (const l of it.lines) {
            if (!l.runs) {
              const tj = tags && /** @type {any} */
              f.embedder.tjOf(cleanText(l.text));
              if (tj) c.text(f, it.size, color, l.x, H - l.y, tj, true);
              else c.text(
                f,
                it.size,
                color,
                l.x,
                H - l.y,
                /** @type {any} */
                f.embedder.literalOf(cleanText(l.text))
              );
              continue;
            }
            for (const r of l.runs) if (r.text.trim()) drawRun(c, r, l.x + r.x, H - l.y, it.size, await font(r.font), color, spans.get(r), shaped.get(r.font));
          }
          if (clipped) c.Q();
          break;
        }
        case "path": {
          const fill = col(it.fill), stroke = col(it.stroke);
          viaPdfLib(() => p.drawSvgPath(it.d, { x: it.x, y: H - it.y, color: fill?.color, opacity: fill?.opacity, borderColor: stroke?.color, borderWidth: stroke ? it.strokeWidth || 1 : 0, borderOpacity: stroke?.opacity, borderLineCap: it.lineCap === "butt" ? 0 : 1, borderDashArray: it.dash || void 0 }));
          break;
        }
        case "field": {
          const form = doc.getForm();
          const f = await font(fieldFont(it));
          const name = uniqueName(it.name);
          const box = { x: it.x, y: H - it.y - it.h, width: it.w, height: it.h, borderColor: rgb(0.61, 0.64, 0.69), borderWidth: 0.75, backgroundColor: rgb(1, 1, 1) };
          let field;
          if (it.kind === "checkbox") {
            field = form.createCheckBox(name);
            field.addToPage(p, box);
            if (it.value) field.check();
          } else {
            if (it.kind === "choice") {
              field = form.createDropdown(name);
              field.addOptions(it.options);
              field.addToPage(p, { ...box, font: f });
              if (it.options.includes(String(it.value))) field.select(String(it.value));
            } else {
              field = form.createTextField(name);
              if (it.kind === "multiline") field.enableMultiline();
              field.addToPage(p, { ...box, font: f });
              field.setText(String(it.value ?? ""));
            }
            field.setFontSize(it.size);
            field.updateAppearances(f);
            const lines = it.draw.filter((d) => d.t === "text").flatMap((d) => d.lines.map((l) => ({ d, l })));
            if (lines.some((x) => x.l.runs)) {
              const a = new Content(shared);
              const top = it.y + it.h;
              a.s += "/Tx BMC\n";
              a.paint({ rgb: "1 1 1", opacity: 1 }, { rgb: "0.61 0.64 0.69", opacity: 1 }, 0.75);
              a.s += `0.375 0.375 ${n2(it.w - 0.75)} ${n2(it.h - 0.75)} re B
`;
              a.q();
              a.s += `1 1 ${n2(it.w - 2)} ${n2(it.h - 2)} re W n
`;
              for (const { d, l } of lines) {
                const color = col(d.color) || BLACK;
                if (!l.runs) {
                  const pf = await font(d.font);
                  a.text(
                    pf,
                    d.size,
                    color,
                    l.x - it.x,
                    top - l.y,
                    /** @type {any} */
                    pf.embedder.literalOf(cleanText(l.text))
                  );
                  continue;
                }
                for (const r of l.runs) if (r.text.trim()) drawRun(a, r, l.x - it.x + r.x, top - l.y, d.size, await font(r.font), color, spans.get(r), shaped.get(r.font));
              }
              a.Q();
              a.s += "EMC\n";
              const ap = ctx.register(ctx.flateStream(a.s, { Type: "XObject", Subtype: "Form", BBox: [0, 0, it.w, it.h], Resources: resRef }));
              for (const w of field.acroField.getWidgets()) w.setNormalAppearance(ap);
            }
          }
          if (it.required) field.enableRequired();
          if (it.readOnly) field.enableReadOnly();
          if (tags) {
            if (!it.label) opt.onWarning?.(`Form field "${name}" has no label, so a screen reader announces its name; give it a label`);
            field.acroField.dict.set(PDFName.of("TU"), PDFHexString.fromText(it.label || it.name || name));
            const w = field.acroField.getWidgets()[0];
            const ref2 = w && doc.context.getObjectRef(w.dict);
            if (ref2) tags.annot(pi, ii, ref2, "field");
          }
          break;
        }
        case "link": {
          const rect = [it.x, H - it.y - it.h, it.x + it.w, H - it.y];
          const text = tags ? coveredText2(pg.items, it) : "";
          if (it.action?.type === "url" && safeUrl(it.action.href)) links.push({ page: p, rect, href: it.action.href, pi, ii, tip: it.tip, text });
          else if (it.action?.type === "drill") {
            const href = drillUrl(opt.drillBase, it.action);
            if (href) links.push({ page: p, rect, href, pi, ii, tip: it.tip || `Open the report "${it.action.report}"`, text });
          } else if (it.action?.type === "bookmark") {
            const to = it.action.page ? it.action : model.bookmarks?.find((b) => b.label === it.action.target);
            if (to) links.push({ page: p, rect, to, pi, ii, tip: it.tip || `Go to ${it.action.target || `page ${to.page}`}`, text });
          }
          break;
        }
        case "image": {
          const { img, why } = await image(it.src);
          if (!img) {
            const alt = it.tag?.alt;
            opt.onWarning?.(`Image on page ${pi + 1} (${alt ? `"${alt}"` : String(it.src).slice(0, 40)}) was left out: ${why}`);
            break;
          }
          let w = it.w, h = it.h, x = it.x, y = it.y;
          const clipBox = it.fit === "clip" ? [it.x, H - it.y - it.ch, it.cw, it.ch] : it.fit === "cover" ? [it.x, H - it.y - it.h, it.w, it.h] : null;
          if (it.fit !== "fill" && it.fit !== "clip") {
            const s = it.fit === "cover" ? Math.max(it.w / img.width, it.h / img.height) : Math.min(it.w / img.width, it.h / img.height);
            w = img.width * s;
            h = img.height * s;
            x = it.x + (it.w - w) / 2;
            y = it.y + (it.h - h) / 2;
          }
          c.q();
          if (clipBox) c.s += `${clipBox.map(n2).join(" ")} re W n
`;
          if (img.svg) viaPdfLib(() => drawSvg(p, img.svg, { x, y: H - y - h, sx: w / img.width, sy: h / img.height }));
          else {
            c.alpha(1, c.st.CA);
            c.s += `${n4(w)} 0 0 ${n4(h)} ${n2(x)} ${n2(H - y - h)} cm /${shared.image(img)} Do
`;
          }
          c.Q();
          break;
        }
      }
      if (it.rotate) c.Q();
      if (mark) {
        c.et();
        c.s += "EMC\n";
      }
    }
    c.et();
    const own = (
      /** @type {any} */
      p.contentStreamRef
    );
    if (own) ctx.delete(own);
    const ref = ctx.nextRef();
    p.node.set(PDFName.of("Contents"), ref);
    contents.push(deflate(latin1(c.s)).then((z) => ctx.assign(ref, PDFRawStream.of(ctx.obj({ Filter: "FlateDecode" }), z))));
    if (NODE_ZLIB && contents.length > 8) await contents[contents.length - 9];
  }
  await Promise.all(contents);
  const pageH = (n) => model.pages[n - 1]?.height ?? model.height;
  const pages = doc.getPages();
  const dest = (b) => pages[b.page - 1] && [pages[b.page - 1].ref, PDFName.of("XYZ"), null, pageH(b.page) - b.y + 4, null];
  for (const l of links) {
    const to = l.href ? { A: { Type: "Action", S: "URI", URI: pdfLiteral(asciiUrl(l.href)) } } : { Dest: dest(l.to) };
    if (!l.href && !to.Dest) continue;
    const annot = doc.context.obj({ Type: "Annot", Subtype: "Link", F: 4, Rect: l.rect, Border: [0, 0, 0], ...to });
    if (tags) annot.set(PDFName.of("Contents"), PDFHexString.fromText(String(l.text || l.tip || l.href || "Link")));
    const ref = doc.context.register(annot);
    if (tags) tags.annot(l.pi, l.ii, ref, "link");
    const annots = l.page.node.lookup(PDFName.of("Annots"));
    if (annots) annots.push(ref);
    else l.page.node.set(PDFName.of("Annots"), doc.context.obj([ref]));
  }
  const marks = outlineEntries(model);
  if (marks.length) addOutline(doc, marks, dest);
  pageLabels(doc, model);
  if (tags) tags.finish({ lang: opt.tagged?.lang, title: opt.title || "Report" });
  if (opt.prepare) await opt.prepare(doc);
  if (opt.pdfa) makePdfA(doc, { ...opt.pdfa, title: opt.title || "Report", author: opt.author, created: when, id: fileId, ...tags ? { conformance: "A", ua: true } : {} });
  else if (tags) setUaMetadata(doc, { title: opt.title || "Report", author: opt.author, created: when });
  if (opt.encrypt) {
    if (opt.pdfa) throw Object.assign(new Error("A PDF/A file cannot have a password. Turn off PDF/A or the password."), { status: 400 });
    if (opt.prepare) throw Object.assign(new Error("A signed PDF cannot have a password here. Turn off signing or the password."), { status: 400 });
    await encryptPdf(doc, opt.encrypt);
    return doc.save({ updateFieldAppearances: false, ...opt.save || {}, useObjectStreams: false });
  }
  return doc.save({ updateFieldAppearances: false, ...opt.save || {} });
}
function ownWriterFits(model, opt) {
  if (opt.pdfa || opt.tagged || opt.encrypt || opt.prepare || opt.save || !model.pages.length) return false;
  if ((model.pageStarts || []).some((i) => i > 0)) return false;
  for (const pg of model.pages) {
    if ((pg.height ?? model.height) !== model.height) return false;
    for (const it of pg.items) {
      if (it.t === "text") {
        if (!isStandard(it.font) || it.lines.some((l) => l.runs)) return false;
      } else if (it.t === "link") {
        const a = it.action;
        if (a?.type === "bookmark" && !(a.page >= 1 && a.page <= model.pages.length)) return false;
      } else if (!(it.t === "line" || it.t === "ellipse" || it.t === "rect" && !it.radius)) return false;
    }
  }
  return true;
}
async function ownWriter(model, fontStore, opt) {
  const fixed = fixedDate(opt), when = fixed ?? /* @__PURE__ */ new Date();
  const parts = [];
  const info = { width: model.width, height: model.height, bookmarks: model.bookmarks || [], headings: model.headings || [], warnings: [] };
  await writePagedPdf(
    { info, pages: async function* () {
      yield* model.pages;
    } },
    { fontStore, subset: opt.subset, id: fixed ? await contentId(model, opt, when) : void 0, title: opt.title, author: opt.author, creationDate: when, drillBase: opt.drillBase },
    { write: (u8) => {
      parts.push(u8);
    } }
  );
  const out = new Uint8Array(parts.reduce((n, p) => n + p.length, 0));
  let at = 0;
  for (const p of parts) {
    out.set(p, at);
    at += p.length;
  }
  return out;
}
function coveredText2(items, box) {
  const lines = [];
  for (const t of items) if (t.t === "text" && t.lines) {
    for (const l of t.lines) if (l.text?.trim() && l.x >= box.x && l.x <= box.x + box.w && l.y >= box.y && l.y <= box.y + box.h) lines.push(l);
  }
  return lines.sort((a, b) => a.y - b.y || a.x - b.x).map((l) => l.text.trim()).join(" ");
}
function fixedDate(opt) {
  if (opt.creationDate !== void 0) {
    if (!(opt.creationDate instanceof Date) || Number.isNaN(opt.creationDate.getTime())) throw Object.assign(new Error("creationDate must be a valid Date"), { status: 400 });
    return opt.creationDate;
  }
  const epoch = globalThis.process?.env?.SOURCE_DATE_EPOCH;
  return epoch && /^\d+$/.test(epoch) ? new Date(Number(epoch) * 1e3) : null;
}
async function contentId(model, opt, when) {
  const bytes = new TextEncoder().encode(JSON.stringify([{ ...model, stats: void 0 }, opt.title || "Report", opt.author || "", when.toISOString()]));
  const digest = new Uint8Array(await globalThis.crypto.subtle.digest("SHA-256", bytes));
  return Array.from(digest.subarray(0, 16), (b) => b.toString(16).padStart(2, "0")).join("").toUpperCase();
}
function fieldFont(it) {
  for (const d of it.draw) if (d.t === "text") {
    for (const l of d.lines) for (const r of l.runs || []) if (r.font !== it.font && r.text.trim()) return embeddedFace(r.font);
  }
  return embeddedFace(it.font);
}
var pdfLiteral = (s) => PDFString.of(String(s).replace(/[\\()]/g, "\\$&"));
function plainEncoding(pf) {
  const e = pf.embedder, f = e.font, memo = /* @__PURE__ */ new Map();
  e.hexOf = (text) => {
    let hex2 = "";
    for (const ch of text) {
      const cp = (
        /** @type {number} */
        ch.codePointAt(0)
      );
      let h = memo.get(cp);
      if (h === void 0) memo.set(cp, h = hex4(f.glyphForCodePoint(cp).id));
      hex2 += h;
    }
    return hex2;
  };
  e.encodeText = (text) => PDFHexString.of(e.hexOf(text));
  e.widthOfTextAtSize = (text, size) => {
    let w = 0;
    for (const ch of text) w += f.glyphForCodePoint(
      /** @type {number} */
      ch.codePointAt(0)
    ).advanceWidth || 0;
    return w * size / f.unitsPerEm;
  };
  const lit2 = /* @__PURE__ */ new Map();
  const esc3 = (b) => b === 40 || b === 41 || b === 92 ? "\\" + String.fromCharCode(b) : b === 13 ? "\\r" : String.fromCharCode(b);
  e.tjOf = (text) => {
    let out = "", cur = "", any = false;
    for (const ch of text) {
      const cp = (
        /** @type {number} */
        ch.codePointAt(0)
      );
      if (f.glyphForCodePoint(cp).id === 0) {
        any = true;
        if (cur) out += `(${cur})`;
        cur = "";
        out += `${-Math.round(f.getGlyph(0).advanceWidth * 1e3 / f.unitsPerEm)}`;
        continue;
      }
      cur += e.literalOf(ch);
    }
    return any ? out + (cur ? `(${cur})` : "") : null;
  };
  e.literalOf = (text) => {
    let out = "";
    for (const ch of text) {
      const cp = (
        /** @type {number} */
        ch.codePointAt(0)
      );
      let b = lit2.get(cp);
      if (b === void 0) {
        const id = f.glyphForCodePoint(cp).id;
        lit2.set(cp, b = esc3(id >> 8) + esc3(id & 255));
      }
      out += b;
    }
    return out;
  };
}
function addGlyphs(pf, glyphs, tagged = false) {
  const e = pf.embedder;
  const byId = new Map(e.glyphCache.access().map((g) => [g.id, g]));
  for (const [id, text] of glyphs) byId.set(id, { id, advanceWidth: e.font.getGlyph(id).advanceWidth, codePoints: text || !tagged ? [...text].map((ch) => ch.codePointAt(0)) : [8205] });
  const all = [...byId.values()].sort((a, b) => a.id - b.id);
  e.glyphCache = { access: () => all };
  const cmap = e.embedUnicodeCmap.bind(e);
  e.embedUnicodeCmap = (ctx) => {
    e.glyphCache = { access: () => all.filter((g) => g.codePoints.length) };
    try {
      return cmap(ctx);
    } finally {
      e.glyphCache = { access: () => all };
    }
  };
}
function outlineEntries(model) {
  const seen = /* @__PURE__ */ new Set();
  return [...model.bookmarks || [], ...model.headings || []].map((b, i) => ({ b, i })).sort((p, q) => p.b.page - q.b.page || (p.b.y ?? 0) - (q.b.y ?? 0) || p.i - q.i).map(({ b }) => b).filter((b) => {
    const k = `${b.page}|${Math.round(b.y ?? 0)}|${b.label}`;
    if (seen.has(k)) return false;
    seen.add(k);
    return true;
  });
}
function pageLabels(doc, model) {
  const n = doc.getPageCount();
  if (!n) return;
  const starts = [.../* @__PURE__ */ new Set([0, ...model.pageStarts || []])].filter((i) => i >= 0 && i < n).sort((a, b) => a - b);
  const ctx = doc.context;
  const nums = starts.flatMap((i) => [i, ctx.obj({ S: "D", St: 1 })]);
  doc.catalog.set(PDFName.of("PageLabels"), ctx.obj({ Nums: nums }));
}
function addOutline(doc, bookmarks, dest) {
  const ctx = doc.context;
  const root = { ref: ctx.nextRef(), level: -1, kids: (
    /** @type {any[]} */
    []
  ) };
  const stack = [root];
  for (const b of bookmarks) {
    const Dest = dest(b);
    if (!Dest) continue;
    const level = Math.max(0, Math.min(9, Number(b.level) || 0));
    while (stack[stack.length - 1].level >= level) stack.pop();
    const node2 = { ref: ctx.nextRef(), level, kids: [], Title: PDFHexString.fromText(b.label), Dest };
    stack[stack.length - 1].kids.push(node2);
    stack.push(node2);
  }
  if (!root.kids.length) return;
  const count = (n) => n.kids.reduce((s, k) => s + 1 + count(k), 0);
  const children = (n) => n.kids.length ? { First: n.kids[0].ref, Last: n.kids[n.kids.length - 1].ref, Count: count(n) } : {};
  const write = (n) => n.kids.forEach((k, i) => {
    ctx.assign(k.ref, ctx.obj({ Title: k.Title, Parent: n.ref, Dest: k.Dest, ...i > 0 ? { Prev: n.kids[i - 1].ref } : {}, ...i < n.kids.length - 1 ? { Next: n.kids[i + 1].ref } : {}, ...children(k) }));
    write(k);
  });
  write(root);
  ctx.assign(root.ref, ctx.obj({ Type: "Outlines", ...children(root) }));
  doc.catalog.set(PDFName.of("Outlines"), root.ref);
  doc.catalog.set(PDFName.of("PageMode"), PDFName.of("UseOutlines"));
}
function withPadding(font) {
  const out = new Uint8Array(font.length + 16);
  out.set(font);
  return out;
}
function subsetTag2(bytes) {
  let h = 2166136261;
  for (let i = 0; i < bytes.length; i++) h = Math.imul(h ^ bytes[i], 16777619);
  let tag = "";
  for (let i = 0; i < 6; i++) {
    tag += String.fromCharCode(65 + (h >>> 0) % 26);
    h = Math.imul(h ^ i, 16777619) >>> 0;
  }
  return tag;
}
function roundRect(x, y, w, h, r) {
  r = Math.min(r, w / 2, h / 2);
  return `M ${x + r} ${y} H ${x + w - r} A ${r} ${r} 0 0 1 ${x + w} ${y + r} V ${y + h - r} A ${r} ${r} 0 0 1 ${x + w - r} ${y + h} H ${x + r} A ${r} ${r} 0 0 1 ${x} ${y + h - r} V ${y + r} A ${r} ${r} 0 0 1 ${x + r} ${y} Z`;
}
export {
  exportPdf
};

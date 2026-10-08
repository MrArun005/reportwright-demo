import {
  guardedFetch,
  redactUrl,
  resolvePage
} from "./chunk-BR5K6SBL.js";
import {
  fontFamilyCss,
  fontKeysOf
} from "./chunk-UJL7C2AS.js";
import {
  CORE_FONT_KEY,
  SHAPER,
  fontFile,
  isStandard,
  setCustomFonts
} from "./chunk-QFLVVM3H.js";

// src/viewer/dataFetch.js
function sqlCall(body, sqlPreview) {
  let b;
  try {
    b = JSON.parse(String(body));
  } catch {
    return false;
  }
  if (!b || typeof b !== "object" || Array.isArray(b)) return false;
  const keys = Object.keys(b);
  if (typeof b.report === "string" && typeof b.source === "string") return keys.every((k) => ["report", "source", "params"].includes(k));
  return sqlPreview && typeof b.query === "string" && keys.every((k) => ["connection", "query", "params"].includes(k));
}
var policy = { allowHosts: [], unsafeFetch: false, fetch: null };
function setFetchPolicy({ allowHosts, unsafeFetch = false, fetch: f = null } = {}) {
  policy = { allowHosts: (allowHosts || []).map((h) => String(h).toLowerCase().replace(/^\[|\]$/g, "")), unsafeFetch: !!unsafeFetch, fetch: typeof f === "function" ? f : null };
}
var POLICY_KEYS = ["allowHosts", "unsafeFetch", "allowPrivate"];
function policyKeysIn(def) {
  const has = (o) => POLICY_KEYS.filter((k) => o && typeof o === "object" && Object.hasOwn(o, k));
  return [...has(def), ...(Array.isArray(def?.dataSources) ? def.dataSources : []).flatMap((s) => has(s).map((k) => `${s.name}.${k}`))];
}
var fetchPolicy = () => policy;
function failed(e, url) {
  if (e?.status || !(e instanceof TypeError)) return e;
  return Object.assign(new Error(`the request to ${redactUrl(url)} failed (${e.message}): the server may not allow this page to read it (CORS: it must send Access-Control-Allow-Origin), the network or the server may be down, or the browser blocked it (a content security policy or an extension)`), { cause: e });
}
var DATA = [/^\/api\/sample\//, /^\/api\/data\/proxy$/];
var OURS = /^\/(?:$|api(?:\/|$)|admin(?:\/|$)|designer(?:\/|$)|viewer(?:\/|$)|login(?:\/|$)|embed(?:\/|$)|_next(?:\/|$))/i;
var BUSY = /* @__PURE__ */ new Set([429, 502, 503, 504]);
function withRetry(f, { onRetry, retries = 3, wait = (ms) => new Promise((r) => setTimeout(r, ms)) } = {}) {
  return (
    /** @type {any} */
    (async (url, init = {}) => {
      const method = String(init.method || "GET").toUpperCase();
      const read = method === "GET" || method === "HEAD" || method === "POST" && /\/api\/data\/sql$/.test(new URL(String(url), "http://x").pathname);
      for (let attempt = 1; ; attempt++) {
        const res = await f(url, init);
        if (!read || !BUSY.has(res.status) || attempt > retries) return res;
        const after = Number(res.headers?.get?.("retry-after"));
        const ms = Number.isFinite(after) && after >= 0 ? Math.min(1e4, after * 1e3) : Math.round(400 * 2 ** (attempt - 1) * (0.75 + Math.random() * 0.5));
        onRetry?.({ attempt, max: retries, status: res.status });
        await wait(ms);
      }
    })
  );
}
function reportFetch(base, f0 = policy.fetch || ((...a) => fetch(...a)), { sqlPreview = false, onRetry, retries = 3, wait } = {}) {
  const self = new URL(base).origin;
  const { allowHosts, unsafeFetch } = policy;
  const send = (url, init) => f0(url, init).catch((e) => {
    throw failed(e, url);
  });
  const f = withRetry(send, { onRetry, retries, wait });
  const guarded = unsafeFetch ? f : guardedFetch({ allowHosts, viaBase: true }, f);
  const other = (url, init) => guarded(url, init).catch((e) => {
    if (e?.code === "EPRIVATE") e.message = e.message.replace(/pass allowHosts: (\[[^\]]*\]) to render/, "mountViewer({ allowHosts: $1 })");
    else if (e && typeof e === "object") e.message = String(e.message).replace("(pass your own fetch to render)", "(a browser cannot see where it leads: use the URL it redirects to, or render on the server)");
    throw e;
  });
  const out = (
    /** @type {any} */
    (async (input, init = {}) => {
      const u = new URL(String(input instanceof Request ? input.url : input), base);
      const method = String(init.method || "GET").toUpperCase();
      if (u.origin !== self) return other(u.href, { ...init, credentials: "omit" });
      let path;
      try {
        path = decodeURIComponent(u.pathname).replace(/\/{2,}/g, "/");
      } catch {
        path = null;
      }
      const read = path !== null && ["GET", "HEAD"].includes(method) && !/%2f|%5c/i.test(u.pathname) && (DATA.some((r) => r.test(path)) || !OURS.test(path));
      if (!read && !(method === "POST" && u.pathname === "/api/data/sql" && sqlCall(init.body, sqlPreview))) {
        throw Object.assign(new Error(`A data source may only read data from this ReportWright server (sample data, the data proxy, saved SQL), not ${method} ${path}.`), { status: 403 });
      }
      const ours = DATA.some((r) => r.test(u.pathname)) || u.pathname === "/api/data/sql";
      return f(u.href, { ...init, credentials: ours ? "same-origin" : "omit", redirect: "error" });
    })
  );
  if (!unsafeFetch) out.hostRule = { allowHosts };
  return out;
}

// src/exporters/subset.js
var HB_MEMORY_MODE_WRITABLE = 2;
var HB_SUBSET_SETS_DROP_TABLE_TAG = 3;
var HB_SUBSET_SETS_LAYOUT_FEATURE_TAG = 6;
var HB_SUBSET_FLAGS_RETAIN_GIDS = 2;
var HB_SUBSET_FLAGS_NOTDEF_OUTLINE = 64;
var tag = (s) => [...s].reduce((a, c) => (a << 8) + c.charCodeAt(0), 0) >>> 0;
var WEIGHT_NAMES = { 100: "Thin", 200: "ExtraLight", 300: "Light", 400: "Regular", 500: "Medium", 600: "SemiBold", 700: "Bold", 800: "ExtraBold", 900: "Black" };
var WEIGHT_WORD = /\b(Thin|ExtraLight|UltraLight|Light|Regular|Medium|SemiBold|DemiBold|Bold|ExtraBold|UltraBold|Black|Heavy)\b/i;
var chars = (b) => {
  let s = "";
  for (const c of b) s += String.fromCharCode(c);
  return s;
};
function sfntTables(bytes) {
  const t = /* @__PURE__ */ new Map();
  if (bytes.length < 12 || chars(bytes.subarray(0, 4)) === "ttcf") return t;
  const dv = new DataView(bytes.buffer, bytes.byteOffset, bytes.byteLength);
  const n = dv.getUint16(4);
  for (let i = 0; i < n; i++) {
    const p = 12 + i * 16;
    const off = dv.getUint32(p + 8), len = dv.getUint32(p + 12);
    t.set(chars(bytes.subarray(p, p + 4)), bytes.subarray(off, off + len));
  }
  return t;
}
function buildSfnt(version, tables) {
  const tags = [...tables.keys()].sort();
  const n = tags.length, pow = 2 ** Math.floor(Math.log2(n));
  const offs = /* @__PURE__ */ new Map();
  let total = 12 + 16 * n;
  for (const tg of tags) {
    offs.set(tg, total);
    total += tables.get(tg).length + 3 & ~3;
  }
  const out = new Uint8Array(total), dv = new DataView(out.buffer);
  out.set(version.subarray ? version.subarray(0, 4) : [0, 1, 0, 0], 0);
  dv.setUint16(4, n);
  dv.setUint16(6, pow * 16);
  dv.setUint16(8, Math.log2(pow));
  dv.setUint16(10, n * 16 - pow * 16);
  tags.forEach((tg, i) => {
    const p = 12 + 16 * i, data = tables.get(tg), o = offs.get(tg);
    for (let k = 0; k < 4; k++) out[p + k] = tg.charCodeAt(k);
    out.set(data, o);
    dv.setUint32(p + 4, tableSum(out, o, data.length + 3 & ~3));
    dv.setUint32(p + 8, o);
    dv.setUint32(p + 12, data.length);
  });
  if (offs.has("head")) {
    const h = offs.get("head") + 8;
    dv.setUint32(h, 0);
    dv.setUint32(h, 2981146554 - tableSum(out, 0, out.length) >>> 0);
  }
  return out;
}
var tableSum = (b, o, len) => {
  const dv = new DataView(b.buffer, b.byteOffset + o, len);
  let s = 0;
  for (let i = 0; i < len; i += 4) s = s + dv.getUint32(i) >>> 0;
  return s;
};
function setNameStrings(name, strings) {
  const dv = new DataView(name.buffer, name.byteOffset, name.byteLength);
  const count = dv.getUint16(2), store = dv.getUint16(4);
  const recs = [];
  for (let i = 0; i < count; i++) {
    const p = 6 + 12 * i;
    const platform = dv.getUint16(p), id = dv.getUint16(p + 6), len = dv.getUint16(p + 8), off = store + dv.getUint16(p + 10);
    const rec = { platform, enc: dv.getUint16(p + 2), lang: dv.getUint16(p + 4), id, raw: name.subarray(off, off + len) };
    if (strings.has(id)) {
      const s = strings.get(id);
      rec.raw = platform === 1 ? Uint8Array.from(s, (c) => c.charCodeAt(0) & 255) : utf16(s);
    }
    recs.push(rec);
  }
  const size = 6 + 12 * count + recs.reduce((a, r) => a + r.raw.length, 0);
  const out = new Uint8Array(size), o = new DataView(out.buffer);
  o.setUint16(0, 0);
  o.setUint16(2, count);
  o.setUint16(4, 6 + 12 * count);
  let at = 6 + 12 * count;
  recs.forEach((r, i) => {
    const p = 6 + 12 * i;
    o.setUint16(p, r.platform);
    o.setUint16(p + 2, r.enc);
    o.setUint16(p + 4, r.lang);
    o.setUint16(p + 6, r.id);
    o.setUint16(p + 8, r.raw.length);
    o.setUint16(p + 10, at - (6 + 12 * count));
    out.set(r.raw, at);
    at += r.raw.length;
  });
  return out;
}
var utf16 = (s) => {
  const b = new Uint8Array(s.length * 2);
  for (let i = 0; i < s.length; i++) {
    b[2 * i] = s.charCodeAt(i) >> 8;
    b[2 * i + 1] = s.charCodeAt(i) & 255;
  }
  return b;
};
function renameForWeight(tables, weight) {
  const word = WEIGHT_NAMES[weight] || "Regular";
  const nm = tables.get("name");
  if (nm) {
    const dv = new DataView(nm.buffer, nm.byteOffset, nm.byteLength);
    const get = (id) => {
      const count = dv.getUint16(2), store = dv.getUint16(4);
      for (let i = 0; i < count; i++) {
        const p = 6 + 12 * i;
        if (dv.getUint16(p + 6) !== id) continue;
        const platform = dv.getUint16(p), len = dv.getUint16(p + 8), off = store + dv.getUint16(p + 10);
        const b = nm.subarray(off, off + len);
        if (platform === 1) return chars(b);
        let s = "";
        for (let k = 0; k + 1 < b.length; k += 2) s += String.fromCharCode(b[k] << 8 | b[k + 1]);
        return s;
      }
      return null;
    };
    const family = (get(16) ?? get(1) ?? "").replace(new RegExp(`\\s*\\b(${Object.values(WEIGHT_NAMES).join("|")})$`, "i"), "").trim() || get(1) || "Font";
    const ps = get(6)?.replace(/-(\w+)$/, "") || family.replace(/\s+/g, "");
    const strings = /* @__PURE__ */ new Map([
      [1, family],
      [2, word],
      [3, (get(3) ?? "").replace(WEIGHT_WORD, word)],
      [4, `${family} ${word}`],
      [6, `${ps}-${word}`],
      [16, family],
      [17, word]
    ]);
    tables.set("name", setNameStrings(nm, strings));
  }
  const os2 = tables.get("OS/2");
  if (os2 && os2.length >= 6) {
    const copy = os2.slice();
    new DataView(copy.buffer).setUint16(4, weight);
    tables.set("OS/2", copy);
  }
}
function createSubsetter(loadWasm) {
  let hbP = null;
  const hb = () => hbP || (hbP = (async () => {
    const bytes = await loadWasm();
    const u8 = bytes instanceof Uint8Array ? bytes : new Uint8Array(bytes);
    const src = (
      /** @type {any} */
      u8
    );
    const instance = (
      /** @type {any} */
      globalThis.process?.versions?.node ? new WebAssembly.Instance(new WebAssembly.Module(src), {}) : (await WebAssembly.instantiate(src, {})).instance
    );
    const x = (
      /** @type {any} */
      instance.exports
    );
    x._initialize?.();
    return x;
  })());
  return async function subset(font, codePoints, opt = {}) {
    const x = await hb();
    const heap = () => new Uint8Array(x.memory.buffer);
    const variable = sfntTables(font).has("fvar");
    const input = x.hb_subset_input_create_or_fail();
    if (!input) throw new Error("HarfBuzz: no subset input");
    const buf = x.malloc(font.byteLength);
    heap().set(font, buf);
    const blob = x.hb_blob_create(buf, font.byteLength, HB_MEMORY_MODE_WRITABLE, 0, 0);
    const face = x.hb_face_create(blob, 0);
    x.hb_blob_destroy(blob);
    try {
      if (!opt.layout) {
        x.hb_set_clear(x.hb_subset_input_set(input, HB_SUBSET_SETS_LAYOUT_FEATURE_TAG));
        const drop = x.hb_subset_input_set(input, HB_SUBSET_SETS_DROP_TABLE_TAG);
        for (const t of ["GSUB", "GPOS", "GDEF", "kern", "morx", "mort"]) x.hb_set_add(drop, tag(t));
      }
      x.hb_subset_input_set_flags(input, x.hb_subset_input_get_flags(input) | HB_SUBSET_FLAGS_NOTDEF_OUTLINE);
      const uni = x.hb_subset_input_unicode_set(input);
      for (const cp of codePoints) x.hb_set_add(uni, cp);
      if (opt.glyphs) {
        x.hb_subset_input_set_flags(input, x.hb_subset_input_get_flags(input) | HB_SUBSET_FLAGS_RETAIN_GIDS);
        const gs = x.hb_subset_input_glyph_set(input);
        for (const g of opt.glyphs) x.hb_set_add(gs, g);
      }
      x.hb_subset_input_pin_all_axes_to_default(input, face);
      x.hb_subset_input_pin_axis_location(input, face, tag("wght"), opt.weight ?? 400);
      const sub = x.hb_subset_or_fail(face, input);
      if (!sub) throw new Error("HarfBuzz: subsetting failed");
      const res = x.hb_face_reference_blob(sub);
      const off = x.hb_blob_get_data(res, 0);
      const len = x.hb_blob_get_length(res);
      let out = heap().slice(off, off + len);
      x.hb_blob_destroy(res);
      x.hb_face_destroy(sub);
      if (!len) throw new Error("HarfBuzz: empty subset");
      if (variable) {
        const t = sfntTables(out);
        for (const tg of ["fvar", "gvar", "avar", "cvar", "HVAR", "MVAR", "STAT"]) t.delete(tg);
        renameForWeight(t, opt.weight ?? 400);
        out = buildSfnt(out, t);
      }
      return out;
    } finally {
      x.hb_subset_input_destroy(input);
      x.hb_face_destroy(face);
      x.free(buf);
    }
  };
}

// src/viewer/engineClient.js
var assetBase = "";
function setAssetBase(url) {
  assetBase = String(url || "").replace(/\/$/, "");
  mainStore = null;
}
var origin = () => assetBase || window.location.origin;
var fontsUrl = null;
var standalone = false;
function setStandalone({ standalone: on = false, fontsUrl: f = null } = {}) {
  standalone = !!on;
  fontsUrl = f ? String(f).replace(/\/?$/, "/") : null;
  mainStore = null;
  fontList = null;
  fontBytes.clear();
}
var fontsBase = () => fontsUrl || `${assetBase}/fonts/`;
var besideFonts = (file) => fontsUrl ? new URL(`../${file}`, new URL(fontsUrl, typeof location !== "undefined" ? location.href : void 0)).href : `${assetBase}/${file}`;
var subsetter = createSubsetter(async () => (await fetch(besideFonts("harfbuzz-subset.wasm"))).arrayBuffer());
var worker = null;
var workerBroken = false;
var seq = 0;
var waiting = /* @__PURE__ */ new Map();
var mainStore = null;
var bundledFonts = null;
var bundledList = null;
function setBundledFonts(map, list) {
  bundledFonts = map || null;
  bundledList = list || null;
  mainStore = null;
  fontList = null;
}
var b64ToBuffer = (b64) => {
  const s = atob(b64);
  const u = new Uint8Array(s.length);
  for (let i = 0; i < s.length; i++) u[i] = s.charCodeAt(i);
  return u.buffer;
};
var fontBytes = /* @__PURE__ */ new Map();
var fetchFont = (k) => {
  if (!fontBytes.has(k)) {
    const p = (async () => {
      const r = await fetch(`${fontsBase()}${fontFile(k)}`);
      if (!r.ok) throw new Error(`Font "${k}" did not load (HTTP ${r.status})`);
      return r.arrayBuffer();
    })();
    p.catch(() => fontBytes.delete(k));
    fontBytes.set(k, p);
  }
  return fontBytes.get(k);
};
var getFont = async (k) => {
  if (bundledFonts?.[k]) return b64ToBuffer(bundledFonts[k]);
  return (await fetchFont(k)).slice(0);
};
var engineP = null;
var loadEngine = () => engineP || (engineP = import("./chunk-YIX3OJXU.js"));
async function loadFontStore() {
  const { FontStore } = await loadEngine();
  return mainStore || (mainStore = new FontStore(getFont));
}
var parameterOptions = async (...a) => (await loadEngine()).parameterOptions(...a);
var makeWorker = () => new Worker(new URL("./engine.worker.js", import.meta.url), { type: "module" });
var fontList = null;
function customFonts(refresh = false) {
  if (!fontList || refresh) {
    fontList = (bundledList ? Promise.resolve(bundledList) : standalone ? Promise.resolve([]) : fetch(`${assetBase}/api/fonts`).then((r) => r.ok ? r.json() : []).catch(() => [])).then((list) => {
      setCustomFonts(list);
      return list;
    });
  }
  return fontList;
}
var faces = /* @__PURE__ */ new Map();
function loadReportFonts(keys) {
  if (typeof document === "undefined" || !document.fonts || typeof FontFace === "undefined") return Promise.resolve([]);
  return Promise.all(keys.filter((k) => k !== SHAPER && !isStandard(k)).map((k) => {
    if (!faces.has(k)) {
      const bytes = bundledFonts?.[k] ? Promise.resolve(b64ToBuffer(bundledFonts[k])) : fetchFont(k).then((b) => b.slice(0));
      faces.set(k, bytes.then((src) => {
        const face = new FontFace(fontFamilyCss(k), src, { display: "block" });
        document.fonts.add(face);
        return face.load();
      }).then(() => null, (error) => {
        faces.delete(k);
        return { key: k, error };
      }));
    }
    return faces.get(k);
  })).then((results) => results.filter(Boolean));
}
var loadModelFonts = (model) => loadReportFonts([.../* @__PURE__ */ new Set([CORE_FONT_KEY, ...fontKeysOf(model)])]);
var warned = false;
function workerFailed(reason) {
  if (warned) return;
  warned = true;
  console.warn(`[reportwright] worker did not load (${reason}); rendering on the main thread`);
}
function getWorker() {
  if (workerBroken || typeof Worker === "undefined" || bundledFonts || fetchPolicy().fetch || typeof window !== "undefined" && /** @type {any} */
  window.__pwSnapshot) return null;
  if (worker) return worker;
  try {
    worker = makeWorker();
    worker.onmessage = (e) => {
      if (e.data.font) {
        const { fid } = e.data;
        getFont(e.data.font).then((buf) => worker?.postMessage({ fid, buf }, [buf]), (err) => worker?.postMessage({ fid, error: String(err?.message || err) }));
        return;
      }
      const w = waiting.get(e.data.id);
      if (!w) return;
      if (e.data.pagesPart) {
        const ps = w.pages || (w.pages = []);
        for (const p of e.data.pagesPart) ps.push(p);
        return;
      }
      if (e.data.inParts) {
        e.data.model.pages = w.pages || [];
        w.pages = [];
      }
      if (e.data.partial) {
        w.onPartial?.(e.data.model);
        return;
      }
      if (e.data.retry) {
        w.onRetry?.(e.data.retry);
        return;
      }
      waiting.delete(e.data.id);
      if (e.data.mainThread) {
        workerFailed(e.data.mainThread);
        w.retry();
        return;
      }
      if (e.data.ok) w.resolve(e.data.model);
      else w.reject(Object.assign(new Error(e.data.error.message), e.data.error));
    };
    worker.onerror = (ev) => {
      workerFailed(ev?.message || "the worker file did not load: it was not found or could not be built");
      workerBroken = true;
      worker = null;
      for (const [, w] of waiting) w.retry();
      waiting.clear();
    };
  } catch (err) {
    workerFailed(err?.message || String(err));
    workerBroken = true;
    worker = null;
  }
  return worker;
}
var bundled = /* @__PURE__ */ new Map();
function registerReports(map) {
  for (const [k, v] of Object.entries(map || {})) bundled.set(k, v);
}
var loadReport = async (rid) => {
  if (bundled.has(rid)) return structuredClone(bundled.get(rid));
  if (standalone) throw new Error(`Report "${rid}" is not loaded: pass it in reports: { "${rid}": definition }, or set server (a self-hosted ReportWright server)`);
  const r = await fetch(`${assetBase}/api/reports/${encodeURIComponent(rid)}`);
  if (!r.ok) throw new Error(`Report "${rid}" not found`);
  return r.json();
};
var fetchReport = loadReport;
async function renderMain(def, params, state, reportId, exportData = false, onRetry = void 0, dataOnly = false) {
  const [{ render }, store] = await Promise.all([loadEngine(), loadFontStore(), customFonts()]);
  return render(def, { parameters: params, state, reportId, exportData, dataOnly, fontStore: store, lazyFonts: true, baseUrl: origin(), loadReport, fetch: reportFetch(origin(), void 0, { onRetry }) });
}
async function renderReport(def, params = {}, state = {}, reportId = void 0, { onPartial, exportData = false, onRetry, dataOnly = false } = {}) {
  const policyKeys = policyKeysIn(def);
  if (policyKeys.length) console.warn(`ReportWright: ${policyKeys.join(", ")} in the report definition ignored: only the page's mountViewer options set allowHosts and unsafeFetch`);
  const w = getWorker();
  if (!w) return renderMain(def, params, state, reportId, exportData, onRetry, dataOnly);
  const fonts = await customFonts();
  return new Promise((resolve, reject) => {
    const id = ++seq;
    waiting.set(id, { resolve, reject, onPartial, onRetry, retry: () => renderMain(def, params, state, reportId, exportData, onRetry, dataOnly).then(resolve, reject) });
    const { allowHosts, unsafeFetch } = fetchPolicy();
    const env = { origin: origin(), standalone, reports: bundled.size ? Object.fromEntries(bundled) : null, fetchPolicy: { allowHosts, unsafeFetch } };
    w.postMessage({ id, def, params, state, reportId, fonts, firstPages: onPartial && !dataOnly ? 2 : 0, exportData, dataOnly, env });
  });
}
var usingWorker = () => !!worker && !workerBroken;
async function iccProfile() {
  const r = await fetch(fontsUrl ? besideFonts("icc/sRGB-v2-magic.icc") : `${origin()}/icc/sRGB-v2-magic.icc`);
  if (!r.ok) throw new Error(`the PDF/A colour profile did not load (HTTP ${r.status})`);
  return new Uint8Array(await r.arrayBuffer());
}
async function pdfBlob(model, title, o = {}) {
  const store = await loadFontStore();
  await customFonts();
  await store.load(fontKeysOf(model));
  const { exportPdf } = await import("./chunk-TZXEEVKE.js");
  const bytes = await exportPdf(model, store, {
    title,
    subset: subsetter,
    tagged: o.tagged,
    drillBase: origin(),
    // drill-through links open this viewer, as in the HTML export
    pdfa: o.pdfa ? { icc: await iccProfile() } : void 0,
    // a report's image: a GET under the same rules as its data (no cookies to our other routes or to other sites)
    fetchImage: async (src) => {
      try {
        const r = await reportFetch(origin())(src);
        return r.ok ? new Uint8Array(await r.arrayBuffer()) : null;
      } catch {
        return null;
      }
    }
  });
  return new Blob([bytes], { type: "application/pdf" });
}

// src/viewer/logic.js
var TOOLBAR_GROUP_KEYS = {
  export: (i) => i.group === "export" && i.id !== "print",
  search: (i) => i.group === "search",
  zoom: (i) => i.group === "zoom",
  navigation: (i) => i.group === "paging"
};
var TOOLBAR_ID_KEYS = { sidebar: ["thumbnails", "documentMap"] };
function arrangeToolbar(builtIns, { hide = [], add = [] } = {}) {
  if (!hide.length && !add.length) return builtIns;
  const out = [...builtIns];
  const taken = new Set(builtIns.map((i) => i.id));
  for (const a of add) {
    if (!a || !a.id || taken.has(a.id)) continue;
    taken.add(a.id);
    const at = out.findIndex((i) => i.id === a.after);
    const item = { ...a, custom: true, group: at >= 0 ? out[at].group : `custom:${a.id}` };
    if (at >= 0) out.splice(at + 1, 0, item);
    else out.push(item);
  }
  const hiddenIds = /* @__PURE__ */ new Set();
  const hiddenBy = [];
  for (const k of hide) {
    if (Object.hasOwn(TOOLBAR_GROUP_KEYS, k)) hiddenBy.push(TOOLBAR_GROUP_KEYS[k]);
    else for (const id of Object.hasOwn(TOOLBAR_ID_KEYS, k) ? TOOLBAR_ID_KEYS[k] : [k]) hiddenIds.add(id);
  }
  let kept = out.filter((i) => i.custom || !(hiddenIds.has(i.id) || hiddenBy.some((f) => f(i))));
  if (!kept.some((i) => i.format)) kept = kept.filter((i) => i.custom || i.id !== "exportOptions");
  return kept;
}
function galleyDefinition(def) {
  const pg = resolvePage(def.page);
  if (pg.pageless) return def;
  const m = pg.margins;
  return { ...def, page: { size: "Pageless", width: pg.width, margins: [m.top, m.right, m.bottom, m.left] } };
}
function frozenAt(page, y) {
  for (const r of page?.frozen || []) if (y > r.y && y < r.end - r.h) return r;
  return null;
}
var escapeRe = (s) => s.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
function findText(model, q, { matchCase = false, wholeWord = false } = {}) {
  if (!q || !model) return [];
  const W = "[\\p{L}\\p{M}\\p{N}_]";
  const re = new RegExp(wholeWord ? `(?<!${W})${escapeRe(q)}(?!${W})` : escapeRe(q), `u${matchCase ? "" : "i"}`);
  const out = [];
  model.pages.forEach((pg, pi) => {
    const rows = /* @__PURE__ */ new Map();
    pg.items.forEach((it, k) => {
      if (it.t !== "text") return;
      for (const l of it.lines) {
        const key = it.rich ? `r${it.rich.id}${it.rich.l}` : `${k}${l.y}`;
        const r = rows.get(key);
        if (r) r.lines.push(l);
        else rows.set(key, { rich: !!it.rich, size: it.size, lines: [l] });
      }
    });
    for (const { rich, size, lines: row } of rows.values()) {
      row.sort((a, b) => a.x - b.x);
      const text = row.map((l) => l.text).join(rich ? "" : " ");
      if (!re.test(text)) continue;
      const x0 = row[0].x, last = row[row.length - 1];
      const x1 = last.x + (last.w || size * last.text.length * 0.5);
      const y = Math.max(...row.map((l) => l.y));
      out.push({ page: pi, x: x0 - 1, y: y - size * 0.95, w: x1 - x0 + 2, h: size * 1.25, text });
    }
  });
  return out;
}
function rangeValue(a, b, p) {
  if (a === "" && b === "") return "";
  const lo = a !== "" ? a : String(p.min ?? b);
  const hi = b !== "" ? b : String(p.max ?? a);
  return `${lo},${hi}`;
}
function pathBox(d) {
  let x0 = Infinity, y0 = Infinity, x1 = -Infinity, y1 = -Infinity, cx = 0, cy = 0;
  const add = (x, y) => {
    cx = x;
    cy = y;
    if (x < x0) x0 = x;
    if (x > x1) x1 = x;
    if (y < y0) y0 = y;
    if (y > y1) y1 = y;
  };
  for (const [, c, args] of String(d || "").matchAll(/([MLHVCSQTAZ])([^MLHVCSQTAZ]*)/gi)) {
    const n = (args.match(/-?(?:\d+\.?\d*|\.\d+)(?:e[-+]?\d+)?/gi) || []).map(Number);
    const C = c.toUpperCase();
    if (C === "H") n.forEach((x) => add(x, cy));
    else if (C === "V") n.forEach((y) => add(cx, y));
    else if (C === "A") for (let i = 0; i + 6 < n.length; i += 7) add(n[i + 5], n[i + 6]);
    else if (C !== "Z") for (let i = 0; i + 1 < n.length; i += 2) add(n[i], n[i + 1]);
  }
  return x0 <= x1 ? { x: x0, y: y0, w: x1 - x0, h: y1 - y0 } : null;
}
var itemsOf = (page) => (page?.items || []).flatMap((i) => i.t === "field" ? i.draw || [] : [i]);
function pageLinks(page) {
  const items = itemsOf(page);
  const texts = items.filter((i) => i.t === "text");
  const out = [];
  for (const it of items) {
    if (it.t !== "link" || !it.action) continue;
    let box = { x: it.x, y: it.y, w: it.w, h: it.h };
    if (it.d) {
      const b = pathBox(it.d);
      if (!b) continue;
      box = { ...b, x: b.x + (it.x - (it.x0 ?? it.x)), y: b.y + (it.y - (it.y0 ?? it.y)) };
    }
    if (!(box.w > 0 && box.h > 0)) continue;
    const words = [];
    for (const t of texts) for (const l of t.lines || []) {
      const top = l.y - (t.size || 9) * 0.9, w = l.w || (t.size || 9) * String(l.text).length * 0.5;
      if (l.x < box.x + box.w && l.x + w > box.x && top < box.y + box.h && l.y > box.y) words.push(String(l.text));
    }
    out.push({ action: it.action, ...box, path: !!it.d, tip: it.tip ? String(it.tip) : "", text: words.join(" ").replace(/^[▶▼]\s*/, "").replace(/\s*[↑↓]$/, "").trim() });
  }
  return out.sort((a, b) => Math.abs(a.y - b.y) > 2 ? a.y - b.y : a.x - b.x);
}
function readingText(page) {
  const rows = /* @__PURE__ */ new Map();
  for (const it of itemsOf(page)) {
    if (it.t !== "text") continue;
    for (const l of it.lines || []) {
      const k = Math.round(l.y);
      const r = rows.get(k);
      if (r) r.push(l);
      else rows.set(k, [l]);
    }
  }
  return [...rows.entries()].sort((a, b) => a[0] - b[0]).map(([, ls]) => ls.sort((a, b) => a.x - b.x).map((l) => l.text).join(" ").trim()).filter(Boolean);
}
var EXPORT_DEFAULTS = { pdfua: false, pdfa: false, formulas: true, html: "tables" };
function exportOptionsFrom(stored) {
  const { v, ...rest } = stored && typeof stored === "object" ? stored : {};
  if (v !== 2) delete rest.html;
  return { ...EXPORT_DEFAULTS, ...rest };
}
function pruneSnapshot(snapshot, defs) {
  const text = defs.map((d) => JSON.stringify(d)).join("\n");
  const seen = /* @__PURE__ */ new Map();
  const used = (k) => {
    let u = seen.get(k);
    if (u === void 0) {
      u = text.includes(JSON.stringify(k).slice(1, -1));
      seen.set(k, u);
    }
    return u;
  };
  const walk = (x) => {
    if (Array.isArray(x)) return x.map(walk);
    if (!x || typeof x !== "object") return x;
    const o = {};
    for (const [k, y] of Object.entries(x)) if (y && typeof y === "object" || used(k)) o[k] = walk(y);
    return o;
  };
  return Object.fromEntries(Object.entries(snapshot).map(([url, x]) => [url, walk(x)]));
}
var SERVER_PDF_ROWS = 2e4;
var SERVER_PDF_PAGES = 800;
function serverPdfUrl(model, { reportId, params = {}, origin: origin2, timeZone, dirty = false }) {
  if (!reportId || dirty || !model) return null;
  const rows = Object.values(model.stats?.rows || {}).reduce((a, n) => a + (Number(n) || 0), 0);
  if (rows <= SERVER_PDF_ROWS && (model.pages?.length || 0) <= SERVER_PDF_PAGES) return null;
  const q = new URLSearchParams();
  for (const [k, v0] of Object.entries(params)) {
    const v = Array.isArray(v0) ? v0.length > 1 ? void 0 : v0[0] : v0;
    if (v === void 0 && Array.isArray(v0)) return null;
    if (v == null) continue;
    q.set(k, v instanceof Date ? v.toISOString() : String(v));
  }
  if (timeZone) q.set("timeZone", timeZone);
  const s = q.toString();
  return `${origin2}/api/reports/${encodeURIComponent(reportId)}/pdf${s ? `?${s}` : ""}`;
}
function paramChoices(def, fetched) {
  const out = { ...fetched };
  for (const p of def?.parameters || []) {
    if (!Array.isArray(p.options) || !p.optionsFrom || !Array.isArray(fetched?.[p.name])) continue;
    const fixed = p.options.map((o) => typeof o === "object" && o ? { value: o.value, label: String(o.label ?? o.value) } : { value: o, label: String(o) });
    const seen = new Set(fixed.map((o) => String(o.value)));
    out[p.name] = [...fixed, ...fetched[p.name].filter((o) => !seen.has(String(o.value)))];
  }
  return out;
}
function clearStaleParams(def, params, choices) {
  let out = params;
  for (const p of def?.parameters || []) {
    const list = choices?.[p.name], v = params[p.name];
    if (!p.optionsFrom || !Array.isArray(list) || v == null || v === "") continue;
    const ok = new Set(list.map((o) => String(o.value)));
    const fresh = ok.has(String(p.default)) ? String(p.default) : list.length ? String(list[0].value) : "";
    const next = p.multi ? String(v).split(",").filter((x) => ok.has(x)).join(",") : ok.has(String(v)) ? v : fresh;
    if (next !== v) out = { ...out, [p.name]: next };
  }
  return out;
}

export {
  setFetchPolicy,
  reportFetch,
  setAssetBase,
  origin,
  setStandalone,
  fontsBase,
  subsetter,
  setBundledFonts,
  loadFontStore,
  parameterOptions,
  customFonts,
  loadReportFonts,
  loadModelFonts,
  registerReports,
  fetchReport,
  renderReport,
  usingWorker,
  pdfBlob,
  arrangeToolbar,
  galleyDefinition,
  frozenAt,
  findText,
  rangeValue,
  pageLinks,
  readingText,
  EXPORT_DEFAULTS,
  exportOptionsFrom,
  pruneSnapshot,
  serverPdfUrl,
  paramChoices,
  clearStaleParams
};

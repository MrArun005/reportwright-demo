// src/engine/units.js
var PAGE_SIZES = {
  A4: [595.28, 841.89],
  A5: [419.53, 595.28],
  A3: [841.89, 1190.55],
  Letter: [612, 792],
  Legal: [612, 1008]
};
var UNITS = { pt: 1, in: 72, cm: 72 / 2.54, mm: 72 / 25.4, px: 0.75 };
var PAGELESS_MAX = 14400;
function normalizePageSize(size) {
  if (typeof size !== "string") return void 0;
  const t = size.trim().toLowerCase();
  if (t === "pageless") return "Pageless";
  return Object.keys(PAGE_SIZES).find((k) => k.toLowerCase() === t);
}
function resolvePage(page = {}) {
  const size = normalizePageSize(page.size);
  if (size === "Pageless") {
    const w2 = Number(page.width) || 960;
    const m2 = normBox(page.margins ?? 24);
    return { width: w2, height: PAGELESS_MAX, margins: { top: m2[0], right: m2[1], bottom: m2[2], left: m2[3] }, bodyWidth: w2 - m2[1] - m2[3], pageless: true, minHeight: Number(page.minHeight) || 0 };
  }
  let [w, h] = size ? PAGE_SIZES[size] : [page.width || PAGE_SIZES.A4[0], page.height || PAGE_SIZES.A4[1]];
  if (page.orientation === "landscape" && h > w) [w, h] = [h, w];
  const m = normBox(page.margins ?? 36);
  return { width: w, height: h, margins: { top: m[0], right: m[1], bottom: m[2], left: m[3] }, bodyWidth: w - m[1] - m[3] };
}
function normBox(v) {
  if (v == null) return [0, 0, 0, 0];
  if (typeof v === "number") return [v, v, v, v];
  if (typeof v === "string") v = v.trim().split(/[\s,]+/).map(Number);
  if (!Array.isArray(v)) return [0, 0, 0, 0];
  const a = v.map((x) => Number(x) || 0);
  if (a.length === 1) return [a[0], a[0], a[0], a[0]];
  if (a.length === 2) return [a[0], a[1], a[0], a[1]];
  if (a.length === 3) return [a[0], a[1], a[2], a[1]];
  return [a[0], a[1], a[2], a[3]];
}

// src/engine/lazylibs.js
var fontkit;
var req = (() => {
  try {
    return (
      /** @type {any} */
      globalThis.process?.getBuiltinModule?.("module")?.createRequire(import.meta.url)
    );
  } catch {
    return void 0;
  }
})();
var load = async (name, imp) => {
  if (req) try {
    return req(name);
  } catch {
  }
  return imp();
};
var fk;
var loadFontkit = () => fk || (fk = load("@pdf-lib/fontkit", () => import("@pdf-lib/fontkit")).then((m) => {
  const d = m.default || m;
  fontkit = d.default || d;
}));

// src/engine/text/shaper.js
var LTR = 4;
var RTL = 5;
var PLAIN = ["-kern", "-liga", "-clig", "-calt", "-dlig"];
async function createShaper(wasm) {
  let memory;
  const { instance } = await WebAssembly.instantiate(wasm, {
    env: {
      _emscripten_runtime_keepalive_clear() {
      },
      _abort_js() {
        throw new Error("HarfBuzz stopped");
      },
      _setitimer_js() {
        return 0;
      },
      emscripten_resize_heap(size) {
        const need = (size >>> 0) - memory.buffer.byteLength;
        try {
          memory.grow(Math.ceil(need / 65536));
          return 1;
        } catch {
          return 0;
        }
      }
    },
    wasi_snapshot_preview1: { proc_exit(code) {
      throw new Error(`HarfBuzz exited (${code})`);
    } }
  });
  const x = (
    /** @type {any} */
    instance.exports
  );
  memory = x.memory;
  x.__wasm_call_ctors();
  const featPtr = x.malloc(16 * PLAIN.length);
  PLAIN.forEach((f4, i) => {
    const s = x.malloc(f4.length + 1);
    new Uint8Array(memory.buffer).set([...f4].map((c) => c.charCodeAt(0)).concat(0), s);
    x.hb_feature_from_string(s, -1, featPtr + 16 * i);
    x.free(s);
  });
  return {
    /**
     * A HarfBuzz font for these bytes. It lives as long as the shaper: fonts are few and reused.
     * @param {Uint8Array} bytes @returns {{ ptr: number, upem: number }}
     */
    font(bytes) {
      const buf = x.malloc(bytes.byteLength);
      new Uint8Array(memory.buffer).set(bytes, buf);
      const blob = x.hb_blob_create(buf, bytes.byteLength, 1, 0, 0);
      const face = x.hb_face_create(blob, 0);
      const ptr = x.hb_font_create(face);
      const upem = x.hb_face_get_upem(face);
      x.hb_face_destroy(face);
      x.hb_blob_destroy(blob);
      return { ptr, upem };
    },
    /**
     * Shape one run (one font, one script, one direction).
     * @param {{ ptr: number }} font @param {string} text @param {boolean} rtl
     * @param {boolean} [plain] kerning and ligatures off (a simple-script run in a right-to-left context)
     * @returns {number[]} [glyph id, x advance, x offset, y offset, cluster (UTF-16 index)] per glyph, in visual order
     */
    shape(font, text, rtl, plain2 = false) {
      const n = text.length;
      const p = x.malloc(n * 2 + 2);
      const u16 = new Uint16Array(memory.buffer, p, n);
      for (let i = 0; i < n; i++) u16[i] = text.charCodeAt(i);
      const b = x.hb_buffer_create();
      x.hb_buffer_add_utf16(b, p, n, 0, n);
      x.hb_buffer_set_direction(b, rtl ? RTL : LTR);
      x.hb_buffer_guess_segment_properties(b);
      x.hb_shape(font.ptr, b, plain2 ? featPtr : 0, plain2 ? PLAIN.length : 0);
      const len = x.hb_buffer_get_length(b);
      const info = new Uint32Array(memory.buffer, x.hb_buffer_get_glyph_infos(b, 0), len * 5);
      const pos = new Int32Array(memory.buffer, x.hb_buffer_get_glyph_positions(b, 0), len * 5);
      const out = new Array(len * 5);
      for (let i = 0; i < len; i++) {
        out[i * 5] = info[i * 5];
        out[i * 5 + 1] = pos[i * 5];
        out[i * 5 + 2] = pos[i * 5 + 2];
        out[i * 5 + 3] = pos[i * 5 + 3];
        out[i * 5 + 4] = info[i * 5 + 2];
      }
      x.hb_buffer_destroy(b);
      x.free(p);
      return out;
    }
  };
}

// src/engine/text/standard.js
var STANDARD_FACES = [
  ["Helvetica", "Helvetica", 400, "normal"],
  ["Helvetica", "Helvetica-Bold", 700, "normal"],
  ["Helvetica", "Helvetica-Oblique", 400, "italic"],
  ["Helvetica", "Helvetica-BoldOblique", 700, "italic"],
  ["Times-Roman", "Times-Roman", 400, "normal"],
  ["Times-Roman", "Times-Bold", 700, "normal"],
  ["Times-Roman", "Times-Italic", 400, "italic"],
  ["Times-Roman", "Times-BoldItalic", 700, "italic"],
  ["Courier", "Courier", 400, "normal"],
  ["Courier", "Courier-Bold", 700, "normal"],
  ["Courier", "Courier-Oblique", 400, "italic"],
  ["Courier", "Courier-BoldOblique", 700, "italic"],
  ["Symbol", "Symbol", 400, "normal"],
  ["ZapfDingbats", "ZapfDingbats", 400, "normal"]
];
var STANDARD_KEYS = new Set(STANDARD_FACES.map((f4) => String(f4[1])));
var isStandard = (key) => STANDARD_KEYS.has(key);
async function standardFont(key) {
  const { Font, Encodings } = await import("@pdf-lib/standard-fonts");
  const afm = (
    /** @type {any} */
    Font.load(
      /** @type {any} */
      key
    )
  );
  const enc = (
    /** @type {any} */
    key === "Symbol" ? Encodings.Symbol : key === "ZapfDingbats" ? Encodings.ZapfDingbats : Encodings.WinAnsi
  );
  const widths = new Array(256).fill(0), codeOf = /* @__PURE__ */ new Map(), cpOf = new Array(256).fill(0);
  for (const [cp, [code, name]] of Object.entries(enc.unicodeMappings)) {
    if (cp === "173") continue;
    codeOf.set(Number(cp), code);
    widths[code] = afm.CharWidths[name] ?? 250;
    if (!cpOf[code] || Number(cp) === code) cpOf[code] = Number(cp);
  }
  const glyphs = /* @__PURE__ */ new Map();
  const getGlyph = (id) => {
    let g = glyphs.get(id);
    if (!g) glyphs.set(id, g = { id, advanceWidth: widths[id] || 0, codePoints: cpOf[id] ? [cpOf[id]] : [] });
    return g;
  };
  const [x0, y0, x1, y1] = afm.FontBBox;
  return {
    standard: true,
    postscriptName: key,
    familyName: afm.FamilyName,
    unitsPerEm: 1e3,
    ascent: afm.Ascender ?? y1,
    descent: afm.Descender ?? y0,
    capHeight: afm.CapHeight ?? y1,
    xHeight: afm.XHeight ?? 0,
    italicAngle: Number(afm.ItalicAngle) || 0,
    underlinePosition: afm.UnderlinePosition ?? -100,
    underlineThickness: afm.UnderlineThickness ?? 50,
    bbox: { minX: x0, minY: y0, maxX: x1, maxY: y1 },
    /** WinAnsi for the text fonts (Symbol and ZapfDingbats use their own built-in encodings) */
    winAnsi: enc === Encodings.WinAnsi,
    widths,
    /** @param {number} cp */
    hasGlyphForCodePoint: (cp) => codeOf.has(cp),
    /** @param {number} cp */
    glyphForCodePoint: (cp) => getGlyph(codeOf.get(cp) || 0),
    getGlyph
  };
}

// src/engine/text/fonts.js
var BUNDLED = [
  ["Inter", "Inter-Regular", 400],
  ["Inter", "Inter-Italic", 400, "italic"],
  ["Inter", "Inter-SemiBold", 600],
  ["Inter", "Inter-Bold", 700],
  ["Inter", "Inter-BoldItalic", 700, "italic"],
  ["JetBrains Mono", "JetBrainsMono-Regular", 400],
  ["JetBrains Mono", "JetBrainsMono-Bold", 700],
  ["Noto Sans Devanagari", "NotoSansDevanagari-Regular", 400],
  ["Noto Sans Devanagari", "NotoSansDevanagari-Bold", 700],
  ["Noto Sans Arabic", "NotoSansArabic-Regular", 400],
  ["Noto Sans Arabic", "NotoSansArabic-Bold", 700],
  ["Noto Sans Hebrew", "NotoSansHebrew-Regular", 400],
  ["Noto Sans Hebrew", "NotoSansHebrew-Bold", 700],
  // fallbacks loaded only when text uses the script (docs/TEXT.md has the sizes)
  ...["Thai", "Lao", "Khmer", "Myanmar", "Tamil", "Bengali", "Telugu", "Kannada", "Gujarati"].flatMap((s) => [
    [`Noto Sans ${s}`, `NotoSans${s}-Regular`, 400],
    [`Noto Sans ${s}`, `NotoSans${s}-Bold`, 700]
  ]),
  // optional, about 40 MB (npm run fonts:cjk fetches them into /fonts/cjk): variable fonts drawn at their default
  // (regular) weight. Without them the text shows as boxes, and the warning says how to add them.
  ["Noto Sans JP", "NotoSansJP", 400, "normal", "cjk/NotoSansJP.ttf"],
  ["Noto Sans KR", "NotoSansKR", 400, "normal", "cjk/NotoSansKR.ttf"],
  ["Noto Sans SC", "NotoSansSC", 400, "normal", "cjk/NotoSansSC.ttf"],
  ["Noto Emoji", "NotoEmoji", 400, "normal", "cjk/NotoEmoji.ttf"]
];
var OPTIONAL_KEYS = ["NotoSansJP", "NotoSansKR", "NotoSansSC", "NotoEmoji"];
var FONT_FAMILIES = {};
var FACES = /* @__PURE__ */ new Map();
var addFace = (f4) => {
  var _a;
  (FONT_FAMILIES[_a = f4.family] || (FONT_FAMILIES[_a] = [])).push(f4);
  FACES.set(f4.key, f4);
};
for (const [family, key, weight, style = "normal", file] of BUNDLED) {
  addFace({ family: String(family), key: String(key), weight: Number(weight), style: style === "italic" ? "italic" : "normal", file: String(file || `${key}.ttf`) });
}
for (const [family, key, weight, style] of STANDARD_FACES) {
  addFace({ family: String(family), key: String(key), weight: Number(weight), style: style === "italic" ? "italic" : "normal", file: "", standard: true });
}
var BUNDLED_FAMILIES = Object.keys(FONT_FAMILIES);
var DEFAULT_FAMILY = "Inter";
var ALL_FONT_KEYS = [...FONT_FAMILIES.Inter, ...FONT_FAMILIES["JetBrains Mono"]].map((f4) => f4.key);
var CORE_FONT_KEY = "Inter-Regular";
var PRELOAD_KEYS = [...ALL_FONT_KEYS];
var SHAPER = "harfbuzz";
function setCustomFonts(list) {
  familyCache.clear();
  for (const [k, f4] of FACES) if (k.startsWith("u-")) {
    FACES.delete(k);
    const left = FONT_FAMILIES[f4.family].filter((x) => x.key !== k);
    if (left.length) FONT_FAMILIES[f4.family] = left;
    else delete FONT_FAMILIES[f4.family];
  }
  for (const f4 of list || []) {
    if (BUNDLED_FAMILIES.includes(f4.family) || !/^[a-f0-9]{8,64}$/.test(String(f4.id))) continue;
    addFace({ key: `u-${f4.id}`, family: String(f4.family), weight: Number(f4.weight) || 400, style: f4.style === "italic" ? "italic" : "normal", file: `custom/${f4.id}` });
  }
}
var GENERIC = {
  "sans-serif": DEFAULT_FAMILY,
  "system-ui": DEFAULT_FAMILY,
  monospace: "JetBrains Mono",
  "ui-monospace": "JetBrains Mono",
  serif: "Times-Roman",
  // the standard fonts' common names (metric-compatible: Arial has Helvetica's widths, and so on)
  arial: "Helvetica",
  times: "Times-Roman",
  "times new roman": "Times-Roman",
  "courier new": "Courier",
  "zapf dingbats": "ZapfDingbats"
};
var MONO = /mono|courier|consol|menlo|monaco|code|typewriter|fixed|terminal|lucida console|andale/i;
var familyCache = /* @__PURE__ */ new Map();
function familyOf(name) {
  let r = familyCache.get(name);
  if (r) return r;
  const names = String(name).split(",").map((n) => n.trim().replace(/^['"]|['"]$/g, "")).filter(Boolean);
  const known = Object.keys(FONT_FAMILIES);
  for (const n of names) {
    const lc = n.toLowerCase();
    const hit = known.find((k) => k.toLowerCase() === lc) || GENERIC[lc];
    if (hit) {
      r = { family: hit };
      break;
    }
  }
  const first = names[0] || DEFAULT_FAMILY;
  r || (r = { family: MONO.test(first) ? "JetBrains Mono" : DEFAULT_FAMILY, unknown: first.slice(0, 60) });
  if (familyCache.size >= 500) familyCache.clear();
  familyCache.set(name, r);
  return r;
}
function resolveFontKey(family, weight, style, unknown) {
  let faces = FONT_FAMILIES[family || DEFAULT_FAMILY];
  if (!faces) {
    const f4 = familyOf(String(family));
    if (f4.unknown && unknown && !f4.unknown.startsWith("=")) unknown.add(f4.unknown);
    faces = FONT_FAMILIES[f4.family] || FONT_FAMILIES[DEFAULT_FAMILY];
  }
  const w = weight === "bold" ? 700 : weight === "normal" || weight == null ? 400 : Number(weight) || 400;
  const italic = faces.filter((f4) => f4.style === "italic");
  const list = style === "italic" && italic.length ? italic : faces.filter((f4) => f4.style !== "italic").length ? faces.filter((f4) => f4.style !== "italic") : faces;
  const rank2 = (f4) => {
    const fw = f4.weight;
    if (w >= 400 && w <= 500) return fw >= w && fw <= 500 ? fw - w : fw < w ? 1e3 + w - fw : 2e3 + fw - w;
    if (w < 400) return fw <= w ? w - fw : 1e3 + fw - w;
    return fw >= w ? fw - w : 1e3 + w - fw;
  };
  return list.reduce((best, f4) => rank2(f4) < rank2(best) ? f4 : best).key;
}
function embeddedFace(key) {
  if (!isStandard(key)) return key;
  const f4 = (
    /** @type {Face} */
    FACES.get(key)
  );
  return resolveFontKey(f4.family === "Courier" ? "JetBrains Mono" : DEFAULT_FAMILY, f4.weight, f4.style);
}
function fontCss(key) {
  const f4 = FACES.get(key);
  return f4 ? { family: f4.family, weight: f4.weight, style: f4.style } : { family: DEFAULT_FAMILY, weight: 400, style: "normal" };
}
var FALLBACK = [
  [1424, 1535, "Noto Sans Hebrew"],
  [64285, 64335, "Noto Sans Hebrew"],
  [1536, 2303, "Noto Sans Arabic"],
  [64336, 65023, "Noto Sans Arabic"],
  [65136, 65278, "Noto Sans Arabic"],
  [2304, 2431, "Noto Sans Devanagari"],
  [43232, 43263, "Noto Sans Devanagari"],
  [7376, 7423, "Noto Sans Devanagari"],
  [2432, 2559, "Noto Sans Bengali"],
  [2688, 2815, "Noto Sans Gujarati"],
  [2944, 3071, "Noto Sans Tamil"],
  [73664, 73727, "Noto Sans Tamil"],
  [3072, 3199, "Noto Sans Telugu"],
  [3200, 3327, "Noto Sans Kannada"],
  [3584, 3711, "Noto Sans Thai"],
  [3712, 3839, "Noto Sans Lao"],
  [4096, 4255, "Noto Sans Myanmar"],
  [43488, 43519, "Noto Sans Myanmar"],
  [43616, 43647, "Noto Sans Myanmar"],
  [6016, 6143, "Noto Sans Khmer"],
  [6624, 6655, "Noto Sans Khmer"],
  // CJK (optional fonts): kana and Han in the Japanese face (Han shapes differ a little from Chinese; a report can
  // set fontFamily "Noto Sans SC"), Hangul in the Korean one; emoji in Noto Emoji (monochrome)
  [12352, 12543, "Noto Sans JP"],
  [12784, 12799, "Noto Sans JP"],
  [12288, 12351, "Noto Sans JP"],
  [13312, 19903, "Noto Sans JP"],
  [19968, 40959, "Noto Sans JP"],
  [63744, 64255, "Noto Sans JP"],
  [65280, 65519, "Noto Sans JP"],
  [4352, 4607, "Noto Sans KR"],
  [12592, 12687, "Noto Sans KR"],
  [44032, 55215, "Noto Sans KR"],
  [126976, 129791, "Noto Emoji"],
  [9728, 10175, "Noto Emoji"],
  [11008, 11263, "Noto Emoji"]
];
function fallbackKey(cp, key) {
  for (const [a, b, family] of FALLBACK) {
    if (cp >= /** @type {number} */
    a && cp <= /** @type {number} */
    b) {
      const c = fontCss(key);
      return resolveFontKey(String(family), c.weight, c.style);
    }
  }
  return null;
}
var SIMPLE_FALLBACK = /* @__PURE__ */ new Set(["Noto Sans JP", "Noto Sans KR", "Noto Emoji"]);
var BEYOND_LATIN = /[^\u0000-\u024f\u1e00-\u1eff\u2000-\u20cf\u2100-\u218f]/;
function fontsForDef(def, unknown = void 0) {
  const keys = /* @__PURE__ */ new Set();
  const seen = /* @__PURE__ */ new Set();
  const walk = (o) => {
    if (!o || typeof o !== "object" || seen.has(o)) return;
    seen.add(o);
    if (Array.isArray(o)) {
      for (const x of o) walk(x);
      return;
    }
    if (o.fontFamily != null || o.fontWeight != null || o.fontStyle != null) keys.add(resolveFontKey(o.fontFamily, o.fontWeight, o.fontStyle, unknown));
    if (o.type === "chart") keys.add(resolveFontKey(o.fontFamily, "bold", "normal"));
    for (const [k, v] of Object.entries(o)) if (v && typeof v === "object" && k !== "dataSources" && k !== "data") walk(v);
  };
  walk(def);
  return [...keys];
}
function fontsFor(texts) {
  const keys = /* @__PURE__ */ new Set(), seen = /* @__PURE__ */ new Set();
  let shaper = false;
  for (const t of texts) {
    if (typeof t !== "string" || !BEYOND_LATIN.test(t)) continue;
    for (const ch of t) {
      const cp = (
        /** @type {number} */
        ch.codePointAt(0)
      );
      if (cp < 592 || seen.has(cp)) continue;
      seen.add(cp);
      for (const [a, b, family] of FALLBACK) {
        if (cp < /** @type {number} */
        a || cp > /** @type {number} */
        b) continue;
        keys.add(resolveFontKey(String(family), 400, "normal")).add(resolveFontKey(String(family), 700, "normal"));
        if (!SIMPLE_FALLBACK.has(String(family))) shaper = true;
        break;
      }
    }
  }
  if (shaper) keys.add(SHAPER);
  return [...keys];
}
var FontStore = class {
  /** @param {(key: string) => Promise<ArrayBuffer|Uint8Array>} loader */
  constructor(loader) {
    this.loader = loader;
    this.fonts = /* @__PURE__ */ new Map();
    this.bytes = /* @__PURE__ */ new Map();
    this.pending = /* @__PURE__ */ new Map();
    this.failed = /* @__PURE__ */ new Set();
    this.shaper = null;
    this.hb = /* @__PURE__ */ new Map();
  }
  /** @param {string[]} keys */
  async load(keys = ALL_FONT_KEYS) {
    await Promise.all(keys.map((k) => {
      if (this.fonts.has(k) || this.failed.has(k) || k === SHAPER && this.shaper) return null;
      if (!this.pending.has(k)) {
        this.pending.set(k, (async () => {
          try {
            if (isStandard(k)) {
              this.fonts.set(k, await standardFont(k));
              return;
            }
            const b = await this.loader(k);
            const u8 = b instanceof Uint8Array ? b : new Uint8Array(b);
            if (k === SHAPER) {
              this.shaper = await createShaper(u8);
              return;
            }
            await loadFontkit();
            this.fonts.set(k, fontkit.create(u8));
            this.bytes.set(k, u8);
          } catch (e) {
            this.pending.delete(k);
            if (k === CORE_FONT_KEY) throw e;
            this.failed.add(k);
          }
        })());
      }
      return this.pending.get(k);
    }));
  }
  /** @param {string} key */
  has(key) {
    return this.fonts.has(key);
  }
  /** The HarfBuzz font for a loaded key (the shaper must be loaded). @param {string} key */
  hbFont(key) {
    let f4 = this.hb.get(key);
    if (!f4) {
      f4 = this.shaper.font(this.bytes.get(key));
      this.hb.set(key, f4);
    }
    return f4;
  }
  /** @param {string} key */
  get(key) {
    const f4 = this.fonts.get(key);
    if (!f4) throw new Error(`Font "${key}" is not loaded`);
    return f4;
  }
};

// src/engine/url.js
function safeUrl(v) {
  if (typeof v !== "string" || !v || v.length > 8192) return null;
  for (let i = 0; i < v.length; i++) {
    const c = v.charCodeAt(i);
    if (c <= 32 || c >= 127 && c <= 159 || c === 92) return null;
  }
  if (/^https?:\/\//i.test(v)) {
    try {
      const u = new URL(v);
      return (u.protocol === "http:" || u.protocol === "https:") && u.hostname ? v : null;
    } catch {
      return null;
    }
  }
  if (/^mailto:/i.test(v)) return v;
  if (v[0] === "/" && v[1] !== "/") return v;
  return null;
}

// src/engine/text/measure.js
import bidiFactory from "bidi-js";
var bidi = bidiFactory();
function special(cp) {
  if (cp < 1424) return false;
  if (cp <= 7423) return true;
  if (cp >= 8192 && cp <= 8303) return cp >= 8203 && cp <= 8207 || cp >= 8234 && cp <= 8238 || cp >= 8288;
  return cp >= 11904 && cp <= 42191 || cp >= 43056 && cp <= 44031 || cp >= 44032 && cp <= 55215 || cp >= 63744 && cp <= 64255 || cp >= 64285 && cp <= 65023 || cp >= 65024 && cp <= 65039 || cp >= 65072 && cp <= 65103 || cp >= 65136 && cp <= 65278 || cp >= 65280 && cp <= 65519 || cp >= 65536;
}
var FORMAT_CHAR = /^\p{Cf}$/u;
var cjk = (cp) => cp >= 11904 && cp <= 40959 || cp >= 44032 && cp <= 55215 || cp >= 63744 && cp <= 64255 || cp >= 65280 && cp <= 65519 || cp >= 131072 && cp <= 262143;
var NO_START = new Set("、。，．・：；？！ー）」』】〕〉》〗〙〟’”｝｠ぁぃぅぇぉっゃゅょゎゕゖァィゥェォッャュョヮヵヶ々〻‐゠–〜～…‥,.!?:;)]}%ゝゞヽヾ゛゜ㇰㇱㇲㇳㇴㇵㇶㇷㇸㇹㇺㇻㇼㇽㇾㇿ｡｣､･ｰ％］｠");
var NO_END = new Set("（「『【〔〈《〖〘〝‘“｛｟([{［｢＄￥￡");
var MAYBE = /[^\u0000-\u058f]/;
var RTL_OR_CONTROLS = /[֐-ࣿיִ-﷿ﹰ-﻾‎‏‪-‮⁦-⁩]|[\uD802\uD803\uD83A]/;
var SCRIPTS = [
  "Latin",
  "Greek",
  "Cyrillic",
  "Armenian",
  "Hebrew",
  "Arabic",
  "Syriac",
  "Thaana",
  "Devanagari",
  "Bengali",
  "Gurmukhi",
  "Gujarati",
  "Oriya",
  "Tamil",
  "Telugu",
  "Kannada",
  "Malayalam",
  "Sinhala",
  "Thai",
  "Lao",
  "Tibetan",
  "Myanmar",
  "Georgian",
  "Hangul",
  "Ethiopic",
  "Khmer",
  "Mongolian",
  "Han",
  "Hiragana",
  "Katakana",
  "Bopomofo"
].map((s) => (
  /** @type {[string, RegExp]} */
  [s, new RegExp(`\\p{Script=${s}}`, "u")]
));
var SIMPLE = /* @__PURE__ */ new Set(["Latin", "Greek", "Cyrillic", "Armenian", "Georgian", "Hangul", "Han", "Hiragana", "Katakana", "Bopomofo", "Common"]);
var STICKY = /[\p{M}\p{Cf}]/u;
var SPACE = /\s/u;
var scriptCache = /* @__PURE__ */ new Map();
function scriptOf(cp) {
  let s = scriptCache.get(cp);
  if (s === void 0) {
    const ch = String.fromCodePoint(cp);
    s = "Common";
    for (const [name, re] of SCRIPTS) if (re.test(ch)) {
      s = name;
      break;
    }
    if (scriptCache.size >= 2e4) scriptCache.clear();
    scriptCache.set(cp, s);
  }
  return s;
}
var INTL = typeof Intl !== "undefined" && typeof Intl.Segmenter === "function";
var GRAPHEMES = INTL ? new Intl.Segmenter(void 0, { granularity: "grapheme" }) : null;
var JOINS = /[\p{M}\u200c\u200d\ufe00-\ufe0f]/u;
function clusters(s, intl = true) {
  if (intl && GRAPHEMES) return [...GRAPHEMES.segment(s)].map((x) => x.segment);
  const out = [];
  for (const ch of s) {
    if (out.length && (JOINS.test(ch) || out[out.length - 1].endsWith("‍"))) out[out.length - 1] += ch;
    else out.push(ch);
  }
  return out;
}
var graphemes = (s) => clusters(s);
var SA = /[\u0e00-\u0eff\u1000-\u109f\u1780-\u17ff\u19e0-\u19ff\u1a20-\u1aaf\ua9e0-\ua9ff\uaa60-\uaadf]/;
var WORDS = INTL ? new Intl.Segmenter(void 0, { granularity: "word" }) : null;
function saBreaks(text, segmenter = WORDS) {
  const out = /* @__PURE__ */ new Set();
  if (!segmenter) return out;
  for (const { index } of segmenter.segment(text)) {
    if (index > 0 && (SA.test(text[index]) || SA.test(text[index - 1]))) out.add(index);
  }
  return out;
}
var TextMeasurer = class {
  /** @param {import('./fonts.js').FontStore} store */
  constructor(store2) {
    this.store = store2;
    this.faces = /* @__PURE__ */ new Map();
    this.boxes = /* @__PURE__ */ new WeakMap();
    this.boxCount = 0;
    this.looks = /* @__PURE__ */ new WeakMap();
    this.cover = /* @__PURE__ */ new Map();
    this.cache = /* @__PURE__ */ new Map();
    this.missing = /* @__PURE__ */ new Set();
    this.noGlyph = /* @__PURE__ */ new Set();
    this.unknownFonts = /* @__PURE__ */ new Set();
    this.substituted = /* @__PURE__ */ new Map();
  }
  /**
   * The key to measure with: `key` when loaded; else (not loaded yet, or failed) the bundled face of the same weight
   * and style when that is loaded, else the core regular face. A key not yet loaded is asked for in the next pass.
   */
  usable(key) {
    if (this.store.has(key)) return key;
    if (!this.store.failed.has(key)) this.missing.add(key);
    const c = fontCss(key);
    const same2 = resolveFontKey(DEFAULT_FAMILY, c.weight, c.style);
    if (this.store.has(same2)) return same2;
    if (this.store.has(CORE_FONT_KEY)) return CORE_FONT_KEY;
    this.missing.add(this.store.failed.has(same2) ? CORE_FONT_KEY : same2);
    return this.store.fonts.keys().next().value ?? CORE_FONT_KEY;
  }
  /**
   * A loaded face's numbers, read once: fontkit's getters (unitsPerEm, ascent…) decode tables on every read.
   * adv: advances per code point (-1 = not on the fast path); words: fast-path units per string (a table repeats them).
   * @param {string} key a loaded key
   */
  face(key) {
    let f4 = this.faces.get(key);
    if (!f4) {
      const font = this.store.get(key);
      f4 = { font, upm: font.unitsPerEm, ascent: font.ascent, descent: font.descent, adv: /* @__PURE__ */ new Map(), words: /* @__PURE__ */ new Map(), met: /* @__PURE__ */ new Map() };
      this.faces.set(key, f4);
    }
    return f4;
  }
  /** Font units of `text` on the fast path, or -1 when it needs the complex path. */
  fast(text, key) {
    const f4 = this.face(key);
    const hit = f4.words.get(text);
    if (hit !== void 0) return hit;
    const m = f4.adv, font = f4.font;
    let units = 0;
    for (let i = 0; i < text.length; i++) {
      let cp = text.charCodeAt(i);
      if (cp >= 55296 && cp <= 56319) {
        const lo = text.charCodeAt(i + 1);
        if (lo >= 56320 && lo <= 57343) {
          cp = (cp - 55296) * 1024 + lo - 56320 + 65536;
          i++;
        }
      }
      let a = m.get(cp);
      if (a === void 0) {
        a = special(cp) || cp >= 32 && !font.hasGlyphForCodePoint(cp) ? -1 : font.glyphForCodePoint(cp).advanceWidth || 0;
        m.set(cp, a);
      }
      if (a < 0) {
        units = -1;
        break;
      }
      units += a;
    }
    if (text.length <= 256) {
      if (f4.words.size >= 5e4) f4.words.clear();
      f4.words.set(text, units);
    }
    return units;
  }
  /**
   * Advance width in points. @param {string} text @param {string} key @param {number} size
   * @param {'ltr'|'rtl'} [dir] paragraph direction (default: from the first strong character)
   */
  width(text, key, size, dir) {
    const k = this.store.has(key) ? key : this.usable(key);
    const u = this.fast(text, k);
    if (u >= 0) return u * size / this.face(k).upm;
    return this.layout(text, k, dir).w * size;
  }
  /**
   * Where underline and strike-through go, from the font's own tables (post and OS/2), in points:
   * y offsets of the stroke centre from the baseline (positive = down, as on the page) and thicknesses.
   * A font without the tables falls back to proportions of its descent and x-height.
   * @param {string} key @param {number} size
   */
  decoration(key, size) {
    const f4 = this.store.get(this.usable(key));
    const u = f4.unitsPerEm, os2 = f4["OS/2"] || {};
    const ut = f4.underlineThickness > 0 ? f4.underlineThickness : u / 14;
    const up = f4.underlinePosition < 0 ? f4.underlinePosition : f4.descent / 2;
    const st = os2.yStrikeoutSize > 0 ? os2.yStrikeoutSize : ut;
    const sp = os2.yStrikeoutPosition > 0 ? os2.yStrikeoutPosition : (f4.xHeight > 0 ? f4.xHeight : f4.ascent * 0.5) / 2 + st / 2;
    const k = size / u;
    return { underlineY: -(up - ut / 2) * k, underlineWidth: ut * k, strikeY: -(sp - st / 2) * k, strikeWidth: st * k };
  }
  /**
   * Superscript and subscript from the font's OS/2 table, in em: the size of the small text and how far its
   * baseline moves (rise up for superscript, drop down for subscript). Fonts without the values get the
   * proportions most fonts use.
   * @param {string} key
   */
  script(key) {
    const f4 = this.store.get(this.usable(key));
    const u = f4.unitsPerEm, o = f4["OS/2"] || {};
    const frac = (v, d) => v > 0 && v < u * 2 ? v / u : d;
    return { supScale: frac(o.ySuperscriptYSize, 0.65), supRise: frac(o.ySuperscriptYOffset, 0.35), subScale: frac(o.ySubscriptYSize, 0.65), subDrop: frac(o.ySubscriptYOffset, 0.15) };
  }
  /** @param {string} key @param {number} size */
  metrics(key, size) {
    const f4 = this.face(this.usable(key));
    let r = f4.met.get(size);
    if (!r) {
      r = Object.freeze({ ascent: f4.ascent * size / f4.upm, descent: -f4.descent * size / f4.upm });
      f4.met.set(size, r);
    }
    return r;
  }
  /**
   * The visually ordered runs of one line, or null when the line is simple (draw `text` as it is).
   * @param {string} text @param {string} key @param {number} size @param {'ltr'|'rtl'} [dir]
   * @returns {Run[]|null}
   */
  runs(text, key, size, dir) {
    if (!dir && !MAYBE.test(text) && !isStandard(key)) return null;
    const k = this.usable(key);
    if (this.fast(text, k) >= 0) return null;
    return this.layout(text, k, dir).runs.map((r) => ({
      ...r,
      x: r.x * size,
      w: r.w * size,
      glyphs: r.glyphs.map((v, i) => i % 4 === 1 || i % 4 === 2 ? v * size : v)
    }));
  }
  /** Paragraph direction of text that needs shaping, bidi or CJK breaks, else undefined. */
  direction(text, key) {
    if (!MAYBE.test(text)) return void 0;
    const k = this.usable(key);
    if (this.fast(text, k) >= 0) return void 0;
    return this.layout(text, k, void 0).rtl ? "rtl" : "ltr";
  }
  /**
   * Greedy line breaking. Simple paragraphs break at spaces (a word longer than the line breaks by
   * character), exactly as before. Others also break between CJK characters (kinsoku applied), never
   * inside a grapheme cluster (a conjunct, a letter and its marks), and remember their direction.
   * @param {string} text @param {string} key @param {number} size @param {number} maxWidth
   * @returns {{text: string, width: number, dir?: 'ltr'|'rtl'}[]}
   */
  wrap(text, key, size, maxWidth) {
    if (text === "") return [{ text: "", width: 0, end: true }];
    const out = [];
    const k = this.usable(key);
    const sp = this.width(" ", k, size);
    const str = String(text);
    for (const para of str.includes("\n") ? str.split(/\r?\n/) : [str]) {
      const dir = this.direction(para, k);
      if (dir) {
        this.wrapComplex(para, k, size, maxWidth, dir, sp, out);
        continue;
      }
      if (!para.includes(" ")) {
        const ww = this.width(para, k, size);
        if (ww <= maxWidth || maxWidth <= 0) {
          out.push({ text: para, width: ww, end: true });
          continue;
        }
      }
      const words = para.split(/ +/);
      let line2 = "", lw = 0;
      const push = () => {
        out.push({ text: line2, width: lw });
        line2 = "";
        lw = 0;
      };
      for (let wi = 0; wi < words.length; wi++) {
        const w = words[wi];
        if (w === "" && wi > 0) continue;
        const ww = this.width(w, k, size);
        if (line2 === "") {
          if (ww <= maxWidth || maxWidth <= 0) {
            line2 = w;
            lw = ww;
            continue;
          }
        } else if (lw + sp + ww <= maxWidth) {
          line2 += " " + w;
          lw += sp + ww;
          continue;
        } else {
          push();
          if (ww <= maxWidth) {
            line2 = w;
            lw = ww;
            continue;
          }
        }
        let after = -1;
        for (const ch of w) {
          const cw = this.width(ch, k, size);
          if (lw + cw > maxWidth && line2 !== "") {
            if (after > 0 && after < line2.length) {
              const rest = line2.slice(after);
              line2 = line2.slice(0, after);
              lw = this.width(line2, k, size);
              push();
              line2 = rest;
              lw = this.width(rest, k, size);
            } else push();
            after = -1;
          }
          line2 += ch;
          lw += cw;
          if ((ch === "/" || ch === "-") && line2.length > 1) after = line2.length;
        }
      }
      push();
      out[out.length - 1].end = true;
    }
    return out;
  }
  /** @param {string} para @param {string} key @param {number} size @param {number} maxWidth @param {'ltr'|'rtl'} dir @param {number} sp @param {any[]} out */
  wrapComplex(para, key, size, maxWidth, dir, sp, out) {
    const tokens = [];
    const sa = SA.test(para) ? saBreaks(para) : null;
    let cur = "", space = false, prev = "", at = 0;
    for (const ch of para) {
      const i = at;
      at += ch.length;
      if (ch === " ") {
        if (cur) {
          tokens.push({ text: cur, space });
          cur = "";
        }
        space = tokens.length > 0;
        prev = "";
        continue;
      }
      const cp = (
        /** @type {number} */
        ch.codePointAt(0)
      );
      const pcp = prev ? (
        /** @type {number} */
        prev.codePointAt(0)
      ) : 0;
      if (cur && (sa?.has(i) || (cjk(cp) || cjk(pcp)) && !NO_START.has(ch) && !NO_END.has(prev) && !STICKY.test(ch))) {
        tokens.push({ text: cur, space });
        cur = "";
        space = false;
      }
      cur += ch;
      prev = ch;
    }
    if (cur) tokens.push({ text: cur, space });
    let line2 = "", lw = 0;
    const push = () => {
      out.push({ text: line2, width: this.width(line2, key, size, dir), dir });
      line2 = "";
      lw = 0;
    };
    for (const t of tokens) {
      const tw = this.width(t.text, key, size, dir);
      const gap = line2 && t.space ? sp : 0;
      if (line2 === "" ? tw <= maxWidth || maxWidth <= 0 : lw + gap + tw <= maxWidth) {
        line2 += (line2 && t.space ? " " : "") + t.text;
        lw += gap + tw;
        continue;
      }
      if (line2) push();
      if (tw <= maxWidth) {
        line2 = t.text;
        lw = tw;
        continue;
      }
      for (const g of graphemes(t.text)) {
        const gw = this.width(g, key, size, dir);
        if (lw + gw > maxWidth && line2 !== "") push();
        line2 += g;
        lw += gw;
      }
    }
    push();
  }
  /** Cut a line so it fits, then add "…". */
  ellipsize(text, key, size, maxWidth, dir) {
    const ell = "…";
    if (this.width(text, key, size, dir) <= maxWidth) return text;
    const ew = this.width(ell, key, size);
    if (this.direction(text, key)) {
      const gs = graphemes(text);
      while (gs.length && this.width(gs.join(""), key, size, dir) + ew > maxWidth) gs.pop();
      return gs.join("").trimEnd() + ell;
    }
    let s = text;
    while (s.length && this.width(s, key, size) + ew > maxWidth) s = s.slice(0, -1);
    return s.trimEnd() + ell;
  }
  /** Does this font have a glyph for the character? */
  has(key, cp) {
    let m = this.cover.get(key);
    if (!m) {
      m = /* @__PURE__ */ new Map();
      this.cover.set(key, m);
    }
    let h = m.get(cp);
    if (h === void 0) {
      h = !!this.store.get(key).hasGlyphForCodePoint(cp);
      m.set(cp, h);
    }
    return h;
  }
  /** The font for one character: the chosen one, else the bundled fallback for its script, else the one before. */
  pick(cp, key, prev) {
    if (cp < 32 || this.has(key, cp) || FORMAT_CHAR.test(String.fromCodePoint(cp))) return key;
    if (isStandard(key)) {
      const sub = embeddedFace(key);
      if (!this.store.has(sub)) {
        if (!this.store.failed.has(sub)) {
          this.missing.add(sub);
          return key;
        }
      } else {
        if (this.has(sub, cp)) {
          let s = this.substituted.get(key);
          if (!s) this.substituted.set(key, s = /* @__PURE__ */ new Set());
          if (s.size < 20) s.add(String.fromCodePoint(cp));
          return sub;
        }
        key = sub;
      }
    }
    const fb = fallbackKey(cp, key);
    if (fb && !this.store.failed.has(fb)) {
      if (!this.store.has(fb)) {
        this.missing.add(fb);
        return key;
      }
      if (this.has(fb, cp)) return fb;
    }
    if (prev && prev !== key && this.has(prev, cp)) return prev;
    if (!this.missing.size) this.noGlyph.add(String.fromCodePoint(cp));
    return key;
  }
  /**
   * Bidi levels, a font per character, runs (one font, level, script, and space or not), shaping,
   * then visual order. Cached at size 1.
   * @param {string} text @param {string} key a loaded key @param {'ltr'|'rtl'|undefined} dir
   * @returns {{ w: number, rtl: boolean, runs: Run[] }}
   */
  layout(text, key, dir) {
    const ck = `${key}${dir || ""}${text}`;
    const hit = this.cache.get(ck);
    if (hit) return hit;
    let levels = null, rtl = dir === "rtl";
    if (dir === "rtl" || RTL_OR_CONTROLS.test(text)) {
      const e = bidi.getEmbeddingLevels(text, dir);
      levels = e.levels;
      rtl = ((e.paragraphs[0]?.level ?? 0) & 1) === 1;
    }
    const segs = [];
    let cur = null, prevFont = "";
    for (let i = 0; i < text.length; ) {
      const cp = (
        /** @type {number} */
        text.codePointAt(i)
      );
      const n = cp > 65535 ? 2 : 1;
      const ch = text.slice(i, i + n);
      const font = STICKY.test(ch) && prevFont ? prevFont : this.pick(cp, key, prevFont);
      const level = levels ? levels[i] : 0;
      const ws = SPACE.test(ch);
      const script = scriptOf(cp);
      if (!cur || font !== cur.font || level !== cur.level || ws !== cur.ws || script !== "Common" && cur.script !== "Common" && script !== cur.script) {
        cur = { start: i, end: i + n, font, level, script, ws };
        segs.push(cur);
      } else {
        cur.end = i + n;
        if (cur.script === "Common") cur.script = script;
      }
      prevFont = font;
      i += n;
    }
    const runs = segs.map((s) => this.shapeRun(text.slice(s.start, s.end), s.font, (s.level & 1) === 1, s.script));
    const order = runs.map((r, i) => ({ r, level: segs[i].level }));
    let max = 0, minOdd = Infinity;
    for (const o of order) {
      max = Math.max(max, o.level);
      if (o.level & 1) minOdd = Math.min(minOdd, o.level);
    }
    for (let l = max; l >= minOdd; l--) {
      for (let i = 0; i < order.length; ) {
        if (order[i].level < l) {
          i++;
          continue;
        }
        let j = i;
        while (j < order.length && order[j].level >= l) j++;
        const rev = order.slice(i, j).reverse();
        order.splice(i, j - i, ...rev);
        i = j;
      }
    }
    let x = 0;
    for (const o of order) {
      o.r.x = x;
      x += o.r.w;
    }
    const out = { w: x, rtl, runs: order.map((o) => o.r) };
    if (this.cache.size > 2e4) this.cache.clear();
    this.cache.set(ck, out);
    return out;
  }
  /** One run at size 1: HarfBuzz for complex scripts and right-to-left text, else character-map glyphs. @returns {Run} */
  shapeRun(text, key, rtl, script) {
    const store2 = this.store;
    const complex = !SIMPLE.has(script);
    const shape = (complex || rtl) && !store2.get(key).standard;
    const glyphs = [];
    let pen = 0;
    if (shape && store2.shaper) {
      const hf = store2.hbFont(key);
      const g = store2.shaper.shape(hf, text, rtl, !complex);
      for (let i = 0; i < g.length; i += 5) {
        glyphs.push(g[i], (pen + g[i + 2]) / hf.upem, g[i + 3] / hf.upem, g[i + 4]);
        pen += g[i + 1];
      }
      return { font: key, x: 0, w: pen / hf.upem, text, ...rtl ? { rtl } : {}, ...complex ? { shaped: true } : {}, glyphs };
    }
    if (shape && !store2.failed.has(SHAPER)) this.missing.add(SHAPER);
    else if (shape) this.unshaped = true;
    const f4 = store2.get(key);
    const list = [];
    for (let i = 0; i < text.length; ) {
      const cp = (
        /** @type {number} */
        text.codePointAt(i)
      );
      const g = f4.glyphForCodePoint(cp);
      list.push([g.id, g.advanceWidth || 0, i]);
      i += cp > 65535 ? 2 : 1;
    }
    if (rtl) list.reverse();
    for (const [id, a, c] of list) {
      glyphs.push(id, pen / f4.unitsPerEm, 0, c);
      pen += a;
    }
    return { font: key, x: 0, w: pen / f4.unitsPerEm, text, ...rtl ? { rtl } : {}, glyphs };
  }
};
function finishText(items, m) {
  for (const it of items) {
    if (it.t === "field") {
      finishText(it.draw, m);
      continue;
    }
    if (it.t !== "text") continue;
    it.font = m.usable(it.font);
    for (const l of it.lines) {
      const r = m.runs(l.text, it.font, it.size, l.dir);
      if (r) l.runs = r;
    }
  }
}

// src/engine/expr/parser.js
var ExprError = class extends Error {
  /** @param {string} msg @param {number} [pos] @param {string} [src] */
  constructor(msg, pos, src) {
    super(pos != null ? `${msg} (at ${pos + 1})` : msg);
    this.pos = pos;
    this.src = src;
  }
};
var MAX_TEXT = 1e6;
var capText = (fname, n) => {
  if (n > MAX_TEXT) throw new ExprError(`${fname}: the result would be longer than 1,000,000 characters`);
};
var MAX_PATTERN = 1e3;
var MAX_DIGITS = 340;
var capPattern = (fname, pat) => {
  if (pat.length > MAX_PATTERN) throw new ExprError(`${fname}: a format longer than ${MAX_PATTERN} characters`);
};
var capDigits = (fname, n) => {
  if (n > MAX_DIGITS) throw new ExprError(`${fname}: ${n} digits is more than ${MAX_DIGITS}`);
};
var OPS = ["<>", "<=", ">=", "==", "!=", "&&", "||", "+", "-", "*", "/", "%", "&", "=", "<", ">", "(", ")", ",", ".", "!", "[", "]", "?", ":", "^", "\\"];
var KEYWORDS = /* @__PURE__ */ new Set(["and", "or", "not", "true", "false", "null", "nothing", "mod", "is", "isnot", "xor", "andalso", "orelse"]);
function lex(src) {
  const toks = [];
  let i = 0;
  while (i < src.length) {
    const c = src[i];
    if (/\s/.test(c)) {
      i++;
      continue;
    }
    if (/[0-9]/.test(c) || c === "." && /[0-9]/.test(src[i + 1] || "")) {
      let j = i;
      while (j < src.length && /[0-9.]/.test(src[j])) j++;
      if (/[eE]/.test(src[j] || "") && /[-+0-9]/.test(src[j + 1] || "")) {
        j += 2;
        while (/[0-9]/.test(src[j] || "")) j++;
      }
      const n = Number(src.slice(i, j));
      if (Number.isNaN(n)) throw new ExprError(`Bad number "${src.slice(i, j)}"`, i, src);
      toks.push({ t: "num", v: n, p: i });
      i = j;
      continue;
    }
    if (c === '"' || c === "'") {
      let j = i + 1, s = "";
      while (j < src.length && src[j] !== c) {
        if (src[j] === "\\" && j + 1 < src.length) {
          s += src[j + 1];
          j += 2;
          continue;
        }
        s += src[j++];
      }
      if (j >= src.length) throw new ExprError("A string has no closing quote", i, src);
      toks.push({ t: "str", v: s, p: i });
      i = j + 1;
      continue;
    }
    if (/[A-Za-z_$]/.test(c)) {
      let j = i;
      while (j < src.length && /[A-Za-z0-9_$]/.test(src[j])) j++;
      const w = src.slice(i, j);
      toks.push(KEYWORDS.has(w.toLowerCase()) ? { t: "kw", v: w.toLowerCase(), p: i } : { t: "id", v: w, p: i });
      i = j;
      continue;
    }
    const op = OPS.find((o) => src.startsWith(o, i));
    if (op) {
      toks.push({ t: "op", v: op, p: i });
      i += op.length;
      continue;
    }
    throw new ExprError(`Unexpected character "${c}"`, i, src);
  }
  toks.push({ t: "eof", v: "", p: src.length });
  return toks;
}
var BIN = {
  "or": 1,
  "||": 1,
  "orelse": 1,
  "xor": 1,
  "and": 2,
  "&&": 2,
  "andalso": 2,
  "=": 4,
  "==": 4,
  "<>": 4,
  "!=": 4,
  "<": 4,
  "<=": 4,
  ">": 4,
  ">=": 4,
  "is": 4,
  "isnot": 4,
  "&": 5,
  "+": 6,
  "-": 6,
  // VB: Mod below \ below * and /, all above + -; ^ above unary minus (-2 ^ 2 is -4), left to right (2 ^ 3 ^ 2 is 64)
  "mod": 6.4,
  "\\": 6.7,
  "*": 7,
  "/": 7,
  "%": 7,
  "^": 8.5
};
function parse(src) {
  const toks = lex(src);
  let k = 0;
  const peek = () => toks[k];
  const next = () => toks[k++];
  const expect = (v) => {
    const t = next();
    if (t.v !== v) throw new ExprError(`Expected "${v}" but found "${t.v || "end"}"`, t.p, src);
    return t;
  };
  const lbp = (t) => {
    if (t.t === "op" && (t.v === "." || t.v === "[")) return 9;
    if (t.t === "op" && t.v === "(") return 9;
    if (t.t === "op" && t.v === "?") return 0.5;
    if ((t.t === "op" || t.t === "kw") && BIN[t.v] != null) return BIN[t.v];
    return 0;
  };
  function callArgs() {
    const args = [];
    if (peek().v !== ")") {
      do {
        args.push(expr(0));
      } while (peek().v === "," && next());
    }
    expect(")");
    return args;
  }
  function nud() {
    const t = next();
    if (t.t === "num" || t.t === "str") return { type: "lit", v: t.v };
    if (t.t === "kw") {
      if (t.v === "true") return { type: "lit", v: true };
      if (t.v === "false") return { type: "lit", v: false };
      if (t.v === "null" || t.v === "nothing") return { type: "lit", v: null };
      if (t.v === "not") return { type: "unary", op: "not", arg: expr(3) };
    }
    if (t.t === "id") {
      if (peek().v === "(") {
        next();
        return { type: "call", name: t.v, args: callArgs(), p: t.p };
      }
      return { type: "id", name: t.v, p: t.p };
    }
    if (t.t === "op") {
      if (t.v === "(") {
        const e = expr(0);
        expect(")");
        return e;
      }
      if (t.v === "-") return { type: "unary", op: "neg", arg: expr(8) };
      if (t.v === "+") return expr(8);
      if (t.v === "!") return { type: "unary", op: "not", arg: expr(8) };
    }
    throw new ExprError(t.t === "eof" ? "The expression ends too early" : `Unexpected "${t.v}"`, t.p, src);
  }
  function led(left) {
    const t = next();
    if (t.v === ".") {
      const id = next();
      if (id.t !== "id" && id.t !== "kw") throw new ExprError('Expected a name after "."', id.p, src);
      if (peek().v === "(") {
        next();
        return { type: "call", name: id.v, args: callArgs(), p: id.p, obj: left };
      }
      return { type: "member", obj: left, prop: id.v };
    }
    if (t.v === "[") {
      const e = expr(0);
      expect("]");
      return { type: "index", obj: left, key: e };
    }
    if (t.v === "(") {
      const args = callArgs();
      if (args.length !== 1) throw new ExprError('An index needs one value: Split(s, ",")(1)', t.p, src);
      return { type: "index", obj: left, key: args[0] };
    }
    if (t.v === "?") {
      const a = expr(0);
      expect(":");
      const b = expr(0);
      return { type: "cond", test: left, a, b };
    }
    return { type: "bin", op: t.v, a: left, b: expr(BIN[t.v]) };
  }
  function expr(rbp) {
    let left = nud();
    while (rbp < lbp(peek())) left = led(left);
    return left;
  }
  const ast = expr(0);
  if (peek().t !== "eof") throw new ExprError(`Unexpected "${peek().v}"`, peek().p, src);
  return ast;
}

// src/engine/expr/javafmt.js
var cache = /* @__PURE__ */ new Map();
var memo = (key, make) => {
  let v = cache.get(key);
  if (v === void 0) {
    v = make();
    if (cache.size >= 500) cache.clear();
    cache.set(key, v);
  }
  return v;
};
function symbols(locale) {
  return memo(`s${locale}`, () => {
    const s = { digits: "0123456789", dec: ".", grp: ",", minus: "-", percent: "%", exp: "E", expMinus: "-", inf: "∞", nan: "NaN", perMille: "‰", latnDec: "." };
    try {
      const nf2 = new Intl.NumberFormat(locale, { useGrouping: false });
      s.digits = [..."0123456789"].map((d) => nf2.format(Number(d))).join("");
      const BIDI = /^[\u061c\u200e\u200f]+$/;
      const parts = (f4, v) => f4.formatToParts(v);
      const signed = (ps, type) => {
        const i = ps.findIndex((p) => p.type === type);
        if (i < 0) return null;
        return (i > 0 && BIDI.test(ps[i - 1].value) ? ps[i - 1].value : "") + ps[i].value + (BIDI.test(ps[i + 1]?.value || "") ? ps[i + 1].value : "");
      };
      const np = parts(new Intl.NumberFormat(locale), -12345.5);
      for (const p of np) {
        if (p.type === "decimal") s.dec = p.value;
        else if (p.type === "group") s.grp = p.value;
      }
      s.minus = signed(np, "minusSign") ?? "-";
      s.percent = signed(parts(new Intl.NumberFormat(locale, { style: "percent" }), 0.5), "percentSign") ?? "%";
      const ep = parts(new Intl.NumberFormat(locale, { notation: "scientific" }), -15e-6);
      s.exp = ep.find((p) => p.type === "exponentSeparator")?.value ?? "E";
      s.expMinus = signed(ep, "exponentMinusSign") ?? "-";
      s.inf = nf2.format(Infinity);
      s.nan = nf2.format(NaN);
      for (const p of new Intl.NumberFormat(locale, { numberingSystem: "latn" }).formatToParts(1.5)) if (p.type === "decimal") s.latnDec = p.value;
      if (s.digits[0] === "٠") s.perMille = "؉";
    } catch {
    }
    if (s.digits.length !== 10) s.digits = "0123456789";
    return s;
  });
}
var localDigits = (str, sy) => sy.digits === "0123456789" ? str : str.replace(/[0-9]/g, (d) => sy.digits[Number(d)]);
function currency(locale, iso) {
  return memo(`c${locale}${iso}`, () => {
    try {
      const f4 = new Intl.NumberFormat(locale, { style: "currency", currency: iso });
      const ps = f4.formatToParts(1), i = ps.findIndex((p) => p.type === "currency");
      const sym = i < 0 ? iso : ps[i].value + (/^[\u200e\u200f\u061c]+$/.test(ps[i + 1]?.value || "") ? ps[i + 1].value : "");
      return { sym, iso, digits: f4.resolvedOptions().maximumFractionDigits ?? 2 };
    } catch {
      return { sym: iso, iso, digits: 2 };
    }
  });
}
function exact(x) {
  if (x === 0) return { M: 0n, s: 0 };
  const dv = new DataView(new ArrayBuffer(8));
  dv.setFloat64(0, x);
  const hi = dv.getUint32(0), lo = dv.getUint32(4);
  const be = hi >>> 20 & 2047;
  let m = BigInt(hi & 1048575) << 32n | BigInt(lo);
  let e = be - 1075;
  if (be === 0) e = -1074;
  else m |= 1n << 52n;
  if (e >= 0) return { M: m << BigInt(e), s: 0 };
  return { M: m * 5n ** BigInt(-e), s: -e };
}
function shortest(x) {
  if (x === 0) return { M: 0n, s: 0 };
  const [mant, ex] = x.toExponential().split("e");
  const digits = mant.replace(".", "");
  return { M: BigInt(digits), s: digits.length - 1 - Number(ex) };
}
var P10 = (n) => 10n ** BigInt(n);
function roundTo(d, f4, mode, neg) {
  if (d.s <= f4) return { M: d.M * P10(f4 - d.s), s: f4 };
  const k = P10(d.s - f4), q = d.M / k, r = d.M % k, half = k / 2n;
  let up;
  switch (mode) {
    case "HALF_UP":
      up = r >= half;
      break;
    case "HALF_DOWN":
      up = r > half;
      break;
    case "UP":
      up = r > 0n;
      break;
    case "DOWN":
      up = false;
      break;
    case "CEILING":
      up = r > 0n && !neg;
      break;
    case "FLOOR":
      up = r > 0n && neg;
      break;
    default:
      up = r > half || r === half && q % 2n === 1n;
  }
  return { M: up ? q + 1n : q, s: f4 };
}
var digitCount = (M) => M === 0n ? 0 : M.toString().length;
function affix(text) {
  const out = [];
  for (let i = 0; i < text.length; i++) {
    const c = text[i];
    if (c === "'") {
      const e = text.indexOf("'", i + 1);
      if (e === i + 1) {
        out.push("'");
        i++;
        continue;
      }
      out.push(e < 0 ? text.slice(i + 1) : text.slice(i + 1, e));
      i = e < 0 ? text.length : e;
      continue;
    }
    if (c === "¤") {
      let n = 1;
      while (text[i + n] === "¤") n++;
      out.push({ t: n >= 2 ? "iso" : "cur" });
      i += n - 1;
      continue;
    }
    if (c === "%" || c === "‰" || c === "-" || c === "‰") {
      out.push({ t: c === "-" ? "minus" : c === "%" ? "pct" : "mille" });
      continue;
    }
    out.push(c);
  }
  return out;
}
function numberPattern(pat) {
  return memo(`n${pat}`, () => {
    let mode = "HALF_EVEN";
    pat = pat.replace(/\{RoundingMode=([A-Z_]+)\}/, (_, m) => {
      mode = m;
      return "";
    });
    const split = (s) => {
      let q = false, start = -1;
      for (let i = 0; i < s.length; i++) {
        const c = s[i];
        if (c === "'") {
          q = !q;
          continue;
        }
        if (!q && "#0,.".includes(c)) {
          start = i;
          break;
        }
      }
      if (start < 0) return { prefix: s, num: "", suffix: "" };
      let end = start;
      while (end < s.length && "#0,.".includes(s[end])) end++;
      if (s[end] === "E") {
        let k = end + 1;
        if (s[k] === "+") k++;
        if (s[k] === "0") {
          while (s[k] === "0") k++;
          end = k;
        }
      }
      return { prefix: s.slice(0, start), num: s.slice(start, end), suffix: s.slice(end) };
    };
    const [posText, negText] = (() => {
      let q = false;
      for (let i = 0; i < pat.length; i++) {
        if (pat[i] === "'") q = !q;
        else if (!q && pat[i] === ";") return [pat.slice(0, i), pat.slice(i + 1)];
      }
      return [pat, null];
    })();
    const pos = split(posText);
    const num4 = pos.num;
    const ei = num4.indexOf("E");
    const mant = ei >= 0 ? num4.slice(0, ei) : num4;
    const expPart = ei >= 0 ? num4.slice(ei + 1) : null;
    const di = mant.indexOf(".");
    const intPart = di >= 0 ? mant.slice(0, di) : mant, fracPart = di >= 0 ? mant.slice(di + 1) : "";
    let zeros = (intPart.match(/0/g) || []).length, hashes = (intPart.match(/#/g) || []).length;
    let minFrac = (fracPart.match(/0/g) || []).length, maxFrac = (fracPart.match(/[0#]/g) || []).length;
    if (zeros === 0 && hashes > 0 && di >= 0) {
      zeros = 1;
      hashes--;
    }
    const commas = [];
    for (let i = 0, d = 0; i < intPart.length; i++) {
      if (intPart[i] === ",") commas.push(d);
      else d++;
    }
    const intDigits = zeros + hashes;
    const grouping = commas.length ? intDigits - commas[commas.length - 1] : 0;
    const secondary = commas.length > 1 ? commas[commas.length - 1] - commas[commas.length - 2] : 0;
    const pa = affix(pos.prefix), sa = affix(pos.suffix);
    const all = [...pa, ...sa];
    const mult = all.some((x) => typeof x === "object" && x.t === "pct") ? 2 : all.some((x) => typeof x === "object" && x.t === "mille") ? 3 : 0;
    const neg = negText != null ? split(negText) : null;
    for (const n of [intDigits, maxFrac, (expPart?.match(/0/g) || []).length]) capDigits("Format", n);
    return {
      mode,
      minInt: zeros,
      maxInt: expPart != null ? intDigits : Infinity,
      minFrac,
      maxFrac,
      grouping,
      secondary,
      exp: expPart != null ? { plus: expPart.startsWith("+"), min: (expPart.match(/0/g) || []).length || 1 } : null,
      prefix: pa,
      suffix: sa,
      negPrefix: neg ? affix(neg.prefix) : null,
      negSuffix: neg ? affix(neg.suffix) : null,
      mult,
      cur: all.some((x) => typeof x === "object" && (x.t === "cur" || x.t === "iso"))
    };
  });
}
var renderAffix = (parts, sy, cur) => parts.map((p) => typeof p === "string" ? p : p.t === "pct" ? sy.percent : p.t === "mille" ? sy.perMille : p.t === "minus" ? sy.minus : p.t === "iso" ? cur.iso : cur.sym).join("");
function group(int, size, secondary, sep) {
  if (!size || int.length <= size) return int;
  const head = int.slice(0, -size), tail = int.slice(-size);
  const s2 = secondary || size;
  const parts = [];
  for (let i = head.length; i > 0; i -= s2) parts.unshift(head.slice(Math.max(0, i - s2), i));
  return [...parts, tail].join(sep);
}
function formatNumber(v, pat, locale, icu) {
  const sy = symbols(locale);
  const p = numberPattern(pat);
  const neg = v < 0 || Object.is(v, -0);
  const iso = currencyOf(locale) || "USD";
  const cur = currency(locale, iso);
  let minFrac = p.minFrac, maxFrac = p.maxFrac;
  if (icu && p.cur && !p.exp) {
    minFrac = cur.digits;
    maxFrac = cur.digits;
  }
  let body;
  if (!Number.isFinite(v)) body = Number.isNaN(v) ? sy.nan : sy.inf;
  else {
    const a = Math.abs(v);
    const d0 = icu ? shortest(a) : exact(p.mult ? a * 10 ** p.mult : a);
    const d = icu && p.mult ? { M: d0.M, s: d0.s - p.mult } : d0;
    body = p.exp ? sci(d, p, minFrac, maxFrac, sy, neg) : fixed(d, p, minFrac, maxFrac, sy, neg);
  }
  if (Number.isNaN(v)) return body;
  let pre, suf;
  if (neg && p.negPrefix) {
    pre = renderAffix(p.negPrefix, sy, cur);
    suf = renderAffix(p.negSuffix || [], sy, cur);
  } else {
    pre = (neg ? sy.minus : "") + renderAffix(p.prefix, sy, cur);
    suf = renderAffix(p.suffix, sy, cur);
  }
  if (icu && p.cur) {
    const notSym = (ch) => ch && !/[\p{S}\s]/u.test(ch);
    const last = pre.replace(/[‎‏؜]+$/, "").slice(-1), first = suf.replace(/^[‎‏؜]+/, "")[0];
    if (p.prefix.some((x) => typeof x === "object" && (x.t === "cur" || x.t === "iso")) && notSym(last)) pre += " ";
    if (p.suffix.some((x) => typeof x === "object" && (x.t === "cur" || x.t === "iso")) && notSym(first) && !/^\s/.test(suf)) suf = " " + suf;
  }
  return pre + body + suf;
}
function fixed(d, p, minFrac, maxFrac, sy, neg) {
  const r = roundTo(d, maxFrac, p.mode, neg);
  let s = r.M.toString().padStart(r.s + 1, "0");
  let int = s.slice(0, s.length - r.s), frac = s.slice(s.length - r.s);
  frac = frac.replace(/0+$/, "");
  if (frac.length < minFrac) frac = frac.padEnd(minFrac, "0");
  int = int.replace(/^0+/, "");
  if (int.length < p.minInt) int = int.padStart(p.minInt, "0");
  if (!int && !frac) int = "0";
  const g = group(int, p.grouping, p.secondary, "\0");
  return localDigits(g, sy).replace(/\u0000/g, sy.grp) + (frac ? sy.dec + localDigits(frac, sy) : "");
}
function sci(d, p, minFrac, maxFrac, sy, neg) {
  const maxInt = p.maxInt === Infinity ? p.minInt : p.maxInt;
  const sig = Math.max(1, maxInt + maxFrac);
  let M = d.M, s = d.s;
  let exponent = 0, intDigits;
  if (M === 0n) {
    exponent = 0;
    intDigits = Math.max(1, p.minInt);
    M = 0n;
  } else {
    const n = digitCount(M);
    if (n > sig) {
      const r = roundTo({ M, s: n - 1 }, sig - 1, p.mode, neg);
      M = r.M;
      s = s - (n - 1) + (sig - 1);
    }
    const n2 = digitCount(M);
    const decimalAt = n2 - s;
    if (maxInt > 1 && maxInt > p.minInt) {
      exponent = decimalAt >= 1 ? Math.trunc((decimalAt - 1) / maxInt) * maxInt : Math.trunc((decimalAt - maxInt) / maxInt) * maxInt;
      intDigits = decimalAt - exponent;
    } else {
      exponent = decimalAt - Math.max(1, p.minInt);
      intDigits = Math.max(1, p.minInt);
    }
  }
  let digits = M === 0n ? "" : M.toString().replace(/0+$/, "");
  const minDigits = p.minInt + minFrac;
  const total = Math.max(digits.length, minDigits, intDigits);
  digits = digits.padEnd(total, "0");
  const int = digits.slice(0, intDigits).padEnd(intDigits, "0");
  let frac = digits.slice(intDigits);
  if (frac.length > minFrac) frac = frac.replace(/0+$/, "").padEnd(minFrac, "0");
  const e = String(Math.abs(exponent)).padStart(p.exp.min, "0");
  const es = exponent < 0 ? sy.expMinus : p.exp.plus ? "+" : "";
  return localDigits(int, sy) + (frac ? sy.dec + localDigits(frac, sy) : "") + sy.exp + es + localDigits(e, sy);
}
function javaDouble(x) {
  if (Number.isNaN(x)) return "NaN";
  if (!Number.isFinite(x)) return x > 0 ? "Infinity" : "-Infinity";
  if (x === 0) return Object.is(x, -0) ? "-0.0" : "0.0";
  const a = Math.abs(x);
  if (a >= 1e-3 && a < 1e7) {
    const s = String(x);
    return s.includes(".") ? s : `${s}.0`;
  }
  const [m, e] = x.toExponential().split("e");
  return `${m.includes(".") ? m : `${m}.0`}E${Number(e)}`;
}
var dtf = (locale, opts) => memo(`d${locale}${JSON.stringify(opts)}`, () => {
  try {
    return new Intl.DateTimeFormat(locale, { timeZone: "UTC", ...opts });
  } catch {
    return new Intl.DateTimeFormat("en-US", { timeZone: "UTC", ...opts });
  }
});
var part = (locale, opts, w, type) => dtf(locale, opts).formatToParts(w).find((p) => p.type === type)?.value ?? "";
function weekInfo(locale) {
  return memo(`w${locale}`, () => {
    try {
      const L = (
        /** @type {any} */
        new Intl.Locale(locale)
      );
      const w = L.getWeekInfo?.() || L.weekInfo;
      if (w) return { first: w.firstDay, min: w.minimalDays };
    } catch {
    }
    return { first: 7, min: 1 };
  });
}
var DAY_MS = 864e5;
function weekOf(w, info) {
  const dow = (x) => ((x.getUTCDay() || 7) - info.first + 7) % 7;
  const y = w.getUTCFullYear();
  const jan1 = new Date(Date.UTC(y, 0, 1));
  const doy = Math.round((Date.UTC(y, w.getUTCMonth(), w.getUTCDate()) - jan1.getTime()) / DAY_MS);
  const offset = dow(jan1);
  const firstWeekStart = 7 - offset >= info.min ? -offset : 7 - offset;
  let week = Math.floor((doy - firstWeekStart) / 7) + 1, wy = y;
  if (week < 1) {
    const prev = weekOf(new Date(Date.UTC(y - 1, 11, 31)), info);
    return prev;
  }
  const nextJan1 = new Date(Date.UTC(y + 1, 0, 1));
  const nOff = dow(nextJan1);
  const nextStart = Math.round((nextJan1.getTime() - jan1.getTime()) / DAY_MS) + (7 - nOff >= info.min ? -nOff : 7 - nOff);
  if (doy >= nextStart) {
    week = 1;
    wy = y + 1;
  }
  return { week, year: wy };
}
function formatDatePattern(d, pat, locale, tz, icu) {
  const sy = symbols(locale);
  const w = new Date(toWall(d, tz));
  const num4 = (n, width) => localDigits(String(n).padStart(width, "0"), sy);
  let out = "";
  for (let i = 0; i < pat.length; ) {
    const c = pat[i];
    if (c === "'") {
      if (pat[i + 1] === "'") {
        out += "'";
        i += 2;
        continue;
      }
      const e = pat.indexOf("'", i + 1);
      const lit = e < 0 ? pat.slice(i + 1) : pat.slice(i + 1, e);
      out += lit.replace(/''/g, "'");
      i = e < 0 ? pat.length : e + 1;
      continue;
    }
    if (!/[A-Za-z]/.test(c)) {
      out += c;
      i++;
      continue;
    }
    let n = 1;
    while (pat[i + n] === c) n++;
    i += n;
    capDigits("Format", n);
    out += field(c, n);
  }
  return out;
  function field(c, n) {
    const h = w.getUTCHours();
    switch (c) {
      case "G":
        return part(locale, { era: n >= 4 ? "long" : "short", year: "numeric" }, w, "era");
      case "y":
      case "Y":
      case "u": {
        if (c === "u" && !icu) return num4(w.getUTCDay() || 7, n);
        const y = c === "Y" ? weekOf(w, weekInfo(locale)).year : w.getUTCFullYear();
        return n === 2 ? num4(y % 100, 2) : num4(y, n);
      }
      case "M":
      case "L": {
        const m = w.getUTCMonth() + 1;
        if (n <= 2) return num4(m, n);
        const style = n === 3 ? "short" : n === 5 && icu ? "narrow" : "long";
        const fmtForm = c === "M" ? part(locale, { day: "numeric", month: style }, w, "month") : "";
        return fmtForm && !/^[\d\u0660-\u0669\u06f0-\u06f9]+$/.test(fmtForm) ? fmtForm : dtf(locale, { month: style }).format(w);
      }
      case "d":
        return num4(w.getUTCDate(), n);
      case "D":
        return num4(Math.round((Date.UTC(w.getUTCFullYear(), w.getUTCMonth(), w.getUTCDate()) - Date.UTC(w.getUTCFullYear(), 0, 1)) / DAY_MS) + 1, n);
      case "F":
        return num4(Math.floor((w.getUTCDate() - 1) / 7) + 1, n);
      case "w":
        return num4(weekOf(w, weekInfo(locale)).week, n);
      case "W": {
        const info = weekInfo(locale), first = new Date(Date.UTC(w.getUTCFullYear(), w.getUTCMonth(), 1));
        const off = ((first.getUTCDay() || 7) - info.first + 7) % 7;
        const startWeek1 = 7 - off >= info.min ? -off : 7 - off;
        return num4(Math.floor((w.getUTCDate() - 1 - startWeek1) / 7) + 1, n);
      }
      case "E":
      case "c":
      case "e":
        if ((c === "e" || c === "c") && n <= 2) return num4((w.getUTCDay() - weekInfo(locale).first + 7) % 7 + 1, n);
        return part(locale, { weekday: n >= 4 && !(n === 5 && icu) ? "long" : n === 5 && icu ? "narrow" : "short", day: "numeric", month: "long" }, w, "weekday");
      case "a":
        return part(locale, { hour: "numeric", hour12: true }, w, "dayPeriod") || (h < 12 ? "AM" : "PM");
      case "H":
        return num4(h, n);
      case "k":
        return num4(h || 24, n);
      case "K":
        return num4(h % 12, n);
      case "h":
        return num4(h % 12 || 12, n);
      case "m":
        return num4(w.getUTCMinutes(), n);
      case "s":
        return num4(w.getUTCSeconds(), n);
      case "S": {
        const ms = w.getUTCMilliseconds();
        if (!icu) return num4(ms, n);
        return localDigits(String(ms).padStart(3, "0").padEnd(n, "0").slice(0, n), sy);
      }
      case "z": {
        try {
          return new Intl.DateTimeFormat(locale, { timeZone: tz || void 0, timeZoneName: n >= 4 ? "long" : "short" }).formatToParts(d).find((x) => x.type === "timeZoneName")?.value || "UTC";
        } catch {
          return "UTC";
        }
      }
      case "Z":
      case "X":
      case "x": {
        const off = Math.round((w.getTime() - d.getTime()) / 6e4);
        if (c === "X" && off === 0) return "Z";
        const sign = off < 0 ? "-" : "+", a = Math.abs(off), hh = String(Math.floor(a / 60)).padStart(2, "0"), mm = String(a % 60).padStart(2, "0");
        if (c === "Z") return n >= 4 ? `GMT${sign}${hh}:${mm}` : `${sign}${hh}${mm}`;
        return n === 1 ? `${sign}${hh}${mm === "00" ? "" : mm}` : n === 2 ? `${sign}${hh}${mm}` : `${sign}${hh}:${mm}`;
      }
    }
    return icu ? "" : c.repeat(n);
  }
}
function formatStyle(d, spec, locale, tz) {
  const o = {};
  for (const kv of spec.split(";")) {
    const [k, v] = kv.split("=");
    if ((k === "date" || k === "time") && /^(short|medium|long|full)$/.test(v)) o[`${k}Style`] = v;
  }
  try {
    return new Intl.DateTimeFormat(locale, { ...o, timeZone: tz || void 0 }).format(d);
  } catch {
    return d.toISOString();
  }
}
var JAVA_DAYS = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
var JAVA_MONTHS = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
function javaDateString(d, tz) {
  const w = new Date(toWall(d, tz)), p = (n) => String(n).padStart(2, "0");
  const zone = tz && tz !== "UTC" ? part("en-US", { timeZoneName: "short" }, d, "timeZoneName") : "UTC";
  return `${JAVA_DAYS[w.getUTCDay()]} ${JAVA_MONTHS[w.getUTCMonth()]} ${p(w.getUTCDate())} ${p(w.getUTCHours())}:${p(w.getUTCMinutes())}:${p(w.getUTCSeconds())} ${zone} ${w.getUTCFullYear()}`;
}
var isJavaFormat = (fmt2) => typeof fmt2 === "string" && (fmt2.startsWith("java:") || fmt2.startsWith("icu:"));
function formatJava(value, fmt2, opt = {}) {
  if (value == null) return "";
  capPattern("Format", fmt2);
  const icu = fmt2.startsWith("icu:");
  const pat = fmt2.slice(icu ? 4 : 5);
  const locale = opt.locale || "en-US";
  if (typeof value === "boolean") return value ? "true" : "false";
  if (value instanceof Date) {
    if (Number.isNaN(value.getTime())) return "";
    if (!pat) {
      if (!icu) return javaDateString(value, opt.timeZone);
      const s = formatStyle(value, "date=medium;time=short", locale, opt.timeZone);
      return /^en\b/i.test(locale) ? s.replace(/^(.*\d{4}), /, "$1 ") : s;
    }
    if (pat.startsWith("@")) return formatStyle(value, pat.slice(1), locale, opt.timeZone);
    return formatDatePattern(value, pat, locale, opt.timeZone, icu);
  }
  if (typeof value === "number") {
    if (!pat || pat.startsWith("@")) {
      if (!icu) return javaDouble(value);
      if (!Number.isFinite(value)) return Number.isNaN(value) ? "NaN" : value > 0 ? "Infinity" : "-Infinity";
      return javaDouble(value).replace(/\.0$/, "").replace(".", symbols(locale).dec);
    }
    return formatNumber(value, pat, locale, icu);
  }
  return String(value);
}
function javaString(v, kind, tz) {
  if (v == null) return "null";
  if (typeof v === "boolean") return v ? "true" : "false";
  if (typeof v === "number") return String(kind).toLowerCase() === "int" && Number.isFinite(v) ? String(Math.trunc(v)) : javaDouble(v);
  if (v instanceof Date) return javaDateString(v, tz);
  return String(v);
}
function jsString(v) {
  if (v === null) return "null";
  if (v === void 0) return "undefined";
  if (v instanceof Date) return v.toString();
  return String(v);
}
function javaFormatString(f4, args, locale = "en-US", tz) {
  const sy = symbols(locale);
  let next = 0, out = "";
  const re = /%(?:(\d{1,4})\$)?([-#+ 0,(]{0,7})(\d{1,9})?(?:\.(\d{1,9}))?([a-zA-Z%])/g;
  capText("JavaFormat", f4.length);
  let last = 0, m;
  const lit = (a, b) => {
    const t = f4.slice(a, b);
    if (t.includes("%")) throw new ExprError(`JavaFormat: "${t.slice(t.indexOf("%"), t.indexOf("%") + 12)}…" is not a format specifier`);
    return t;
  };
  while (m = re.exec(f4)) {
    out += lit(last, m.index);
    last = re.lastIndex;
    const [, idx, flags, width, prec, conv] = m;
    if (conv === "%") {
      out += "%";
      continue;
    }
    if (conv === "n") {
      out += "\n";
      continue;
    }
    const v = idx ? args[Number(idx) - 1] : args[next++];
    const w = width ? Number(width) : 0, p = prec != null ? Number(prec) : null;
    capDigits("JavaFormat", w);
    if (p != null && /[fFeE]/.test(conv)) capDigits("JavaFormat", p);
    let s;
    const lc = conv.toLowerCase();
    if (lc === "s") s = javaString(v, void 0, tz);
    else if (lc === "b") s = v == null ? "false" : typeof v === "boolean" ? String(v) : "true";
    else if (lc === "c") s = v == null ? "null" : typeof v === "number" ? String.fromCodePoint(v) : String(v)[0] ?? "";
    else if (v == null) s = "null";
    else {
      const x = Number(v);
      const neg = x < 0 || Object.is(x, -0);
      let body;
      if (lc === "d") body = group(String(Math.abs(Math.trunc(x))), flags.includes(",") ? 3 : 0, 0, "\0");
      else if (lc === "o" || lc === "x") {
        const t = Math.trunc(x);
        const u = t >= 0 ? t : t >= -(2 ** 31) ? t >>> 0 : Number(BigInt.asUintN(64, BigInt(t)));
        body = u.toString(lc === "o" ? 8 : 16);
      } else if (lc === "f") {
        const r = roundTo(shortest(Math.abs(x)), p ?? 6, "HALF_UP", neg);
        const str = r.M.toString().padStart(r.s + 1, "0");
        const int = str.slice(0, str.length - r.s), frac = str.slice(str.length - r.s);
        body = group(int, flags.includes(",") ? 3 : 0, 0, "\0") + (frac ? `${frac}` : "");
      } else if (lc === "e") {
        const d = shortest(Math.abs(x)), n = digitCount(d.M) || 1, pp = p ?? 6;
        const r = d.M === 0n ? { M: 0n, s: pp } : roundTo({ M: d.M, s: n - 1 }, pp, "HALF_UP", neg);
        let e = d.M === 0n ? 0 : n - 1 - d.s;
        let str = r.M.toString();
        if (str.length > pp + 1) {
          str = str.slice(0, -1);
          e++;
        }
        str = str.padStart(pp + 1, "0");
        body = str[0] + (pp ? `${str.slice(1)}` : "") + `${conv}${e < 0 ? "-" : "+"}${String(Math.abs(e)).padStart(2, "0")}`;
      } else {
        s = String(v);
        body = null;
      }
      if (body != null) {
        const loc = lc === "x" || lc === "o" ? body : localDigits(body, sy).replace(/\u0000/g, sy.grp).replace(/\u0001/g, sy.dec);
        const signed = lc === "x" || lc === "o" ? loc : neg ? flags.includes("(") ? `(${loc})` : `-${loc}` : flags.includes("+") ? `+${loc}` : flags.includes(" ") ? ` ${loc}` : loc;
        s = signed;
        if (flags.includes("0") && !flags.includes("-") && s.length < w) {
          const sign = /^[-+ (]/.test(s) ? s[0] : "";
          s = sign + localDigits("0".repeat(w - s.length), sy) + s.slice(sign.length);
        }
      }
    }
    if (p != null && (lc === "s" || lc === "b" || lc === "c")) s = s.slice(0, p);
    if (conv === "S" || conv === "B" || conv === "X" || conv === "E") s = s.toUpperCase();
    if (s.length < w) s = flags.includes("-") ? s.padEnd(w) : s.padStart(w);
    capText("JavaFormat", out.length + s.length + (f4.length - last));
    out += s;
  }
  return out + lit(last, f4.length);
}

// src/engine/expr/format.js
var nfCache = /* @__PURE__ */ new Map();
function nf(locale, opts) {
  const key = locale + JSON.stringify(opts);
  let f4 = nfCache.get(key);
  if (!f4) {
    f4 = new Intl.NumberFormat(locale, { numberingSystem: "latn", ...opts });
    if (nfCache.size >= 500) nfCache.clear();
    nfCache.set(key, f4);
  }
  return f4;
}
var DAY_MS2 = 864e5;
var zoneFmt = /* @__PURE__ */ new Map();
function offsetAt(t, tz) {
  if (!tz) return -new Date(t).getTimezoneOffset();
  if (tz === "UTC" || tz === "Etc/UTC") return 0;
  let z = zoneFmt.get(tz);
  if (!z) {
    let f4 = null;
    try {
      f4 = new Intl.DateTimeFormat("en-US", { timeZone: tz, hourCycle: "h23", year: "numeric", month: "numeric", day: "numeric", hour: "numeric", minute: "numeric", second: "numeric" });
    } catch {
    }
    z = { f: f4, cache: /* @__PURE__ */ new Map() };
    if (zoneFmt.size >= 100) zoneFmt.clear();
    zoneFmt.set(tz, z);
  }
  if (!z.f) return -new Date(t).getTimezoneOffset();
  const key = Math.floor(t / 9e5);
  let o = z.cache.get(key);
  if (o === void 0) {
    const p = {};
    for (const x of z.f.formatToParts(new Date(key * 9e5))) p[x.type] = Number(x.value);
    o = Math.round((Date.UTC(p.year, p.month - 1, p.day, p.hour, p.minute, p.second) - key * 9e5) / 6e4);
    if (z.cache.size >= 2e4) z.cache.clear();
    z.cache.set(key, o);
  }
  return o;
}
var validTimeZone = (tz) => {
  try {
    new Intl.DateTimeFormat("en-US", { timeZone: tz });
    return true;
  } catch {
    return false;
  }
};
var toWall = (d, tz) => {
  const t = d instanceof Date ? d.getTime() : d;
  return t + offsetAt(t, tz) * 6e4;
};
function fromWall(w, tz) {
  const a = w - offsetAt(w, tz) * 6e4;
  const b = w - offsetAt(a, tz) * 6e4;
  return new Date(toWall(b, tz) === w ? b : a);
}
var zoneDate = (y, m, d, tz, h = 0, mi = 0, sec = 0, ms = 0) => {
  const w = /* @__PURE__ */ new Date(0);
  w.setUTCFullYear(y, m, d);
  w.setUTCHours(h, mi, sec, ms);
  return fromWall(w.getTime(), tz);
};
var wallDate = (d, tz) => new Date(toWall(d, tz));
var ISO = /^(\d{4})-(\d{2})-(\d{2})(?:[T ](\d{2}):(\d{2})(?::(\d{2})(?:\.(\d{1,9}))?)?\s*(Z|[+-]\d{2}:?\d{2})?)?$/i;
var NUMERIC = /^(\d{1,4})([./-])(\d{1,2})\2(\d{1,4})(?:[ T,]+(\d{1,2}):(\d{2})(?::(\d{2}))?\s*([AaPp][Mm])?)?$/;
var orderCache = /* @__PURE__ */ new Map();
function dateOrder(locale) {
  const l = locale || "en-US";
  let o = orderCache.get(l);
  if (!o) {
    try {
      o = new Intl.DateTimeFormat(l, { year: "numeric", month: "2-digit", day: "2-digit", timeZone: "UTC" }).formatToParts(new Date(Date.UTC(2026, 2, 5))).filter((p) => p.type === "year" || p.type === "month" || p.type === "day").map((p) => p.type[0]).join("");
    } catch {
      o = "mdy";
    }
    if (!/^(mdy|dmy|ymd)$/.test(o)) o = "mdy";
    if (orderCache.size >= 200) orderCache.clear();
    orderCache.set(l, o);
  }
  return o;
}
var year2 = (y) => y < 100 ? y + (y < 30 ? 2e3 : 1900) : y;
var validParts = (y, mo, d, h = 0, mi = 0, s = 0) => mo >= 1 && mo <= 12 && d >= 1 && d <= new Date(Date.UTC(y, mo, 0)).getUTCDate() && h <= 23 && mi <= 59 && s <= 59;
function toDate(v, opt) {
  if (v == null || v === "") return null;
  if (v instanceof Date) return Number.isNaN(v.getTime()) ? null : v;
  if (typeof v === "number") {
    const d2 = new Date(v);
    return Number.isNaN(d2.getTime()) ? null : d2;
  }
  const s = String(v).trim();
  const tz = opt?.timeZone;
  let m = ISO.exec(s);
  if (m) {
    const [y, mo, d2, h = 0, mi = 0, sec = 0] = [m[1], m[2], m[3], m[4], m[5], m[6]].map((x) => x == null ? void 0 : Number(x));
    if (!validParts(y, mo, d2, h, mi, sec)) return null;
    const ms = m[7] ? Math.round(Number(`0.${m[7]}`) * 1e3) : 0;
    if (!m[8]) return zoneDate(y, mo - 1, d2, tz, h, mi, sec, ms);
    const off = m[8].toUpperCase() === "Z" ? 0 : (m[8][0] === "-" ? -1 : 1) * (Number(m[8].slice(1, 3)) * 60 + Number(m[8].slice(-2)));
    return new Date(Date.UTC(y, mo - 1, d2, h, mi, sec, ms) - off * 6e4);
  }
  m = NUMERIC.exec(s);
  if (m) {
    const a = Number(m[1]), b = Number(m[3]), c = Number(m[4]);
    const ord = m[1].length === 4 ? "ymd" : dateOrder(opt?.locale);
    let [y, mo, d2] = ord === "ymd" ? [a, b, c] : ord === "dmy" ? [c, b, a] : [c, a, b];
    y = year2(y);
    let h = m[5] ? Number(m[5]) : 0;
    const mi = m[6] ? Number(m[6]) : 0, sec = m[7] ? Number(m[7]) : 0;
    if (m[8]) {
      if (h < 1 || h > 12) return null;
      h = h % 12 + (/p/i.test(m[8]) ? 12 : 0);
    }
    if (!validParts(y, mo, d2, h, mi, sec)) return null;
    return zoneDate(y, mo - 1, d2, tz, h, mi, sec);
  }
  if (!/[A-Za-z]{3}/.test(s)) return null;
  const d = new Date(s);
  if (Number.isNaN(d.getTime())) return null;
  return /(Z|GMT|UTC|[+-]\d{2}:?\d{2})\s*$/i.test(s) || !tz ? d : zoneDate(d.getFullYear(), d.getMonth(), d.getDate(), tz, d.getHours(), d.getMinutes(), d.getSeconds(), d.getMilliseconds());
}
var isoDate = (d, tz) => formatDate(d, "yyyy-MM-dd", void 0, tz);
var sepCache = /* @__PURE__ */ new Map();
function latinDecimal(locale) {
  const d = separators(locale).dec;
  return /^[.,]$/.test(d) ? d : ".";
}
function separators(locale) {
  const l = locale || "en-US";
  let r = sepCache.get(l);
  if (!r) {
    let dec2 = ".", grp = ",";
    try {
      for (const p of new Intl.NumberFormat(l).formatToParts(12345.6)) {
        if (p.type === "decimal") dec2 = p.value;
        else if (p.type === "group") grp = p.value;
      }
    } catch {
    }
    r = { dec: dec2, grp };
    if (sepCache.size >= 200) sepCache.clear();
    sepCache.set(l, r);
  }
  return r;
}
function parseNumber(text, locale) {
  let s = String(text).trim();
  if (s === "") return NaN;
  if (/^[+-]?(\d+\.?\d*|\.\d+)(e[+-]?\d+)?$/i.test(s)) {
    const { dec: dec3, grp: grp2 } = separators(locale);
    if (dec3 === "," && grp2 === "." && /^[+-]?\d{1,3}(\.\d{3})+$/.test(s)) return Number(s.replace(/\./g, ""));
    return Number(s);
  }
  let neg = false;
  if (/^\(.*\)$/.test(s)) {
    neg = true;
    s = s.slice(1, -1).trim();
  }
  let pct = false;
  if (s.endsWith("%")) {
    pct = true;
    s = s.slice(0, -1).trim();
  }
  s = s.replace(/^[\p{L}\p{Sc}]+\.?\s*|\s*[\p{L}\p{Sc}]+\.?$/gu, "").replace(/^[^\d.,+-]+|[^\d.,+-]+$/g, "").trim();
  if (/^[+-]/.test(s)) {
    neg = neg !== (s[0] === "-");
    s = s.slice(1).trim();
  } else if (/[+-]$/.test(s)) {
    neg = neg !== s.endsWith("-");
    s = s.slice(0, -1).trim();
  }
  s = s.replace(/^[^\d.,]+|[^\d.,]+$/g, "").trim();
  const { dec: dec2, grp } = separators(locale);
  const g = grp === " " || grp === " " || grp === " " ? "[   ]" : grp === "." ? "\\." : grp === "'" || grp === "’" ? "['’]" : grp;
  const d = dec2 === "." ? "\\." : dec2;
  const india = /-IN$/i.test(locale || "");
  const re = new RegExp(`^(\\d{1,3}(?:${g}\\d{3})+${india ? `|\\d{1,2}(?:${g}\\d{2})+${g}\\d{3}` : ""}|\\d+)(?:${d}(\\d+))?$`);
  const m = re.exec(s);
  if (!m) return NaN;
  const int = m[1].replace(new RegExp(g, "g"), "");
  const n = Number(`${int}${m[2] ? `.${m[2]}` : ""}`);
  if (!Number.isFinite(n)) return NaN;
  const r = pct ? shiftDecSafe(n, -2) : n;
  return neg ? -r : r;
}
var shiftDecSafe = (x, e) => Number(`${x}e${e}`);
var P10F = Array.from({ length: 23 }, (_, i) => 10 ** i);
var shiftDec = (x, e) => {
  const [m, k = "0"] = String(x).split("e");
  return Number(`${m}e${Number(k) + e}`);
};
function roundHalfAway(v, digits = 0) {
  if (!Number.isFinite(v)) return v;
  if (digits >= 0 && digits <= 22) {
    const i = Math.round(v * P10F[digits]);
    if (i / P10F[digits] === v) return v + 0;
  }
  return Math.sign(v) * shiftDec(Math.round(shiftDec(Math.abs(v), digits)), -digits) + 0;
}
function roundHalfEven(v, digits = 0) {
  if (!Number.isFinite(v)) return v;
  const x = shiftDec(Math.abs(v), digits);
  const f4 = Math.floor(x), diff = x - f4;
  const r = diff > 0.5 || diff === 0.5 && f4 % 2 !== 0 ? f4 + 1 : f4;
  return Math.sign(v) * shiftDec(r, -digits) + 0;
}
var REGION_CURRENCY = {
  US: "USD",
  IN: "INR",
  GB: "GBP",
  DE: "EUR",
  FR: "EUR",
  ES: "EUR",
  IT: "EUR",
  NL: "EUR",
  BE: "EUR",
  AT: "EUR",
  PT: "EUR",
  IE: "EUR",
  FI: "EUR",
  GR: "EUR",
  JP: "JPY",
  CN: "CNY",
  CA: "CAD",
  AU: "AUD",
  NZ: "NZD",
  CH: "CHF",
  SG: "SGD",
  AE: "AED",
  SA: "SAR",
  BR: "BRL",
  MX: "MXN",
  ZA: "ZAR",
  KR: "KRW",
  RU: "RUB",
  ID: "IDR",
  MY: "MYR",
  PH: "PHP",
  TH: "THB",
  VN: "VND",
  PK: "PKR",
  BD: "BDT",
  LK: "LKR",
  NP: "NPR",
  SE: "SEK",
  NO: "NOK",
  DK: "DKK",
  PL: "PLN",
  TR: "TRY",
  IL: "ILS",
  EG: "EGP",
  NG: "NGN",
  KE: "KES",
  HK: "HKD",
  TW: "TWD"
};
var currencyOf = (locale) => {
  const l = locale || "";
  if (CURRENCY_OF.has(l)) return CURRENCY_OF.get(l);
  const m = /^[a-z]{2,3}-(?:[A-Za-z]{4}-)?([A-Za-z]{2})$/i.exec(l);
  const c = m ? REGION_CURRENCY[m[1].toUpperCase()] : void 0;
  if (CURRENCY_OF.size < 1e3 && l.length <= 35) CURRENCY_OF.set(l, c);
  return c;
};
var CURRENCY_OF = /* @__PURE__ */ new Map();
var MONTHS = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];
var DAYS = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];
function formatValue(value, fmt2, opt = {}) {
  if (value == null) return "";
  if (typeof fmt2 === "string") capPattern("Format", fmt2);
  if (isJavaFormat(fmt2)) {
    if (typeof value === "string" && /^\d{4}-\d{2}-\d{2}/.test(value)) {
      const d = toDate(value, opt);
      if (d) value = d;
    }
    return formatJava(
      value,
      /** @type {string} */
      fmt2,
      opt
    );
  }
  const locale = opt.locale || "en-US";
  if (value instanceof Date) {
    const t = value.getTime();
    if (Number.isNaN(t)) return "";
    const tz = opt.timeZone;
    if (!fmt2 && toWall(value, tz) % DAY_MS2 !== 0) fmt2 = `dd MMM yyyy ${standardDate("t", locale)}`;
    if (!opt.fmtMemo) return formatDate(value, fmt2 || "dd MMM yyyy", locale, tz);
    const memo2 = memoFor(opt.fmtMemo, "i", fmt2 || "dd MMM yyyy", locale);
    let out = memo2.get(t);
    if (out === void 0) {
      out = formatDate(value, fmt2 || "dd MMM yyyy", locale, tz);
      memo2.set(t, out);
    }
    return out;
  }
  if (typeof value === "number") {
    if (!Number.isFinite(value)) return opt.nonFinite === "blank" ? "" : opt.nonFinite === "error" ? "#Error" : String(value);
    if (!fmt2) return Number.isSafeInteger(value) && !Object.is(value, -0) ? String(value) : general(value, 15, "E", void 0, locale);
    return numberFn(fmt2, locale, opt.currency || currencyOf(opt.locale), opt.grouping)(value);
  }
  if (typeof value === "boolean") return value ? "True" : "False";
  if (typeof value === "object") return plainText(value);
  if (typeof value === "string" && fmt2 && /^\d{4}-\d{2}-\d{2}/.test(value)) {
    const memo2 = opt.fmtMemo && value.length <= 40 ? memoFor(opt.fmtMemo, "s", fmt2, locale) : null;
    let out = memo2?.get(value);
    if (out === void 0) {
      const d = toDate(value, opt);
      out = d && /[yMd]/.test(fmt2) ? formatDate(d, fmt2, locale, opt.timeZone) : value;
      memo2?.set(value, out);
    }
    return out;
  }
  return String(value);
}
function plainText(v) {
  if (typeof v === "number") {
    const s = String(v);
    return Number.isFinite(v) && /e/.test(s) ? v.toLocaleString("en-US", { useGrouping: false, maximumFractionDigits: 100 }) : s;
  }
  if (Array.isArray(v)) return v.map((x) => x == null ? "" : plainText(x)).join(", ");
  if (v && typeof v === "object" && !(v instanceof Date)) {
    try {
      return JSON.stringify(v) ?? String(v);
    } catch {
      return String(v);
    }
  }
  return String(v);
}
function memoFor(all, kind, fmt2, locale) {
  const key = `${kind}${fmt2}${locale}`;
  let memo2 = all.get(key);
  if (!memo2) {
    if (all.size >= 50) all.clear();
    memo2 = /* @__PURE__ */ new Map();
    all.set(key, memo2);
  } else if (memo2.size >= 5e3) memo2.clear();
  return memo2;
}
var numberFns = /* @__PURE__ */ new Map();
function numberFn(fmt2, locale, currency2, grouping) {
  const key = `${fmt2}${locale}${currency2 ?? ""}${grouping ?? ""}`;
  let fn = numberFns.get(key);
  if (!fn) {
    fn = compileNumber(fmt2, locale, currency2, grouping);
    if (key.length <= 128) {
      if (numberFns.size >= 2e3) numberFns.clear();
      numberFns.set(key, fn);
    }
  }
  return fn;
}
var BIDI_MARKS = /[\u200e\u061c]/g;
function compileNumber(fmt2, locale, currency2, grouping) {
  const m = /^([CcNnFfPpDdEeXxGgRr])(\d{0,2})$/.exec(fmt2);
  if (m) {
    const k = m[1].toUpperCase();
    const d = m[2] === "" ? null : Number(m[2]);
    const useGrouping = grouping === "always" ? "always" : grouping === "never" ? false : "auto";
    const fixed2 = { minimumFractionDigits: d ?? 2, maximumFractionDigits: d ?? 2, signDisplay: "negative", useGrouping };
    switch (k) {
      // ja-JP JPY comes out as the full-width ￥ (U+FFE5), which the bundled fonts lack; .NET ja-JP writes ¥ (U+00A5)
      case "C": {
        const f4 = nf(locale, currency2 ? { style: "currency", currency: currency2, ...fixed2 } : fixed2);
        return (v) => f4.format(v).replace(/\uFFE5/g, "¥");
      }
      case "N": {
        const f4 = nf(locale, fixed2);
        return (v) => f4.format(v).replace(BIDI_MARKS, "");
      }
      // .NET's plain "-" (CLDR ar adds U+200E)
      case "F": {
        const f4 = nf(locale, { ...fixed2, useGrouping: false });
        return (v) => f4.format(v);
      }
      // the locale's decimal sign, no grouping
      case "P": {
        const f4 = nf(locale, { style: "percent", ...fixed2 });
        return (v) => f4.format(v).replace(BIDI_MARKS, "");
      }
      case "D":
        return (value) => {
          const t = Math.trunc(value);
          return (t < 0 ? "-" : "") + String(Math.abs(t)).padStart(d ?? 0, "0");
        };
      case "E": {
        const dec2 = latinDecimal(locale);
        return (v) => scientific(v, d ?? 6, m[1] === "e" ? "e" : "E", 3).replace(".", dec2);
      }
      case "X":
        return (value) => {
          const t = Math.trunc(value);
          const h = t >= 0 ? t.toString(16) : BigInt.asUintN(t >= -(2 ** 31) ? 32 : 64, BigInt(t)).toString(16);
          return (m[1] === "X" ? h.toUpperCase() : h).padStart(d ?? 0, "0");
        };
      case "G":
        return (v) => general(v, d || 15, m[1] === "g" ? "e" : "E", void 0, locale);
      case "R":
        return (v) => general(v, 17, "E", String(v), locale);
    }
  }
  if (/[#0]/.test(fmt2)) return (v) => customNumber(v, fmt2, locale);
  return (v) => String(v);
}
function scientific(v, digits, e, expDigits) {
  const [mant, exp] = Math.abs(v).toExponential(digits).split("e");
  const x = Number(exp);
  return `${v < 0 ? "-" : ""}${mant}${e}${x < 0 ? "-" : "+"}${String(Math.abs(x)).padStart(expDigits, "0")}`;
}
function general(v, p, e, shortest2, locale) {
  if (v === 0) return "0";
  const [mant, exp] = (shortest2 ? Number(shortest2) : v).toExponential(shortest2 ? void 0 : Math.min(p, 100) - 1).split("e");
  const x = Number(exp), digits = mant.includes(".") ? mant.replace(/\.?0+$/, "") : mant;
  const dec2 = locale ? latinDecimal(locale) : ".";
  if (x > -5 && x < p) return nf("en-US", { maximumFractionDigits: 20, maximumSignificantDigits: 21, useGrouping: false }).format(Number(`${digits}e${x}`)).replace(".", dec2);
  return `${digits.replace(".", dec2)}${e}${x < 0 ? "-" : "+"}${String(Math.abs(x)).padStart(2, "0")}`;
}
function sections(fmt2) {
  const out = [""];
  for (let i = 0; i < fmt2.length; i++) {
    const c = fmt2[i];
    if (c === "\\") {
      out[out.length - 1] += fmt2.slice(i, i + 2);
      i++;
      continue;
    }
    if (c === '"' || c === "'") {
      const j = fmt2.indexOf(c, i + 1);
      const end = j < 0 ? fmt2.length : j;
      out[out.length - 1] += fmt2.slice(i, end + 1);
      i = end;
      continue;
    }
    if (c === ";") {
      out.push("");
      continue;
    }
    out[out.length - 1] += c;
  }
  return out;
}
function numTokens(sec) {
  const toks = [];
  for (let i = 0; i < sec.length; i++) {
    const c = sec[i];
    if (c === "\\") {
      toks.push({ k: "lit", s: sec[i + 1] ?? "" });
      i++;
      continue;
    }
    if (c === '"' || c === "'") {
      const j = sec.indexOf(c, i + 1);
      const end = j < 0 ? sec.length : j;
      toks.push({ k: "lit", s: sec.slice(i + 1, end) });
      i = end;
      continue;
    }
    toks.push("0#.,%".includes(c) ? { k: c } : { k: "lit", s: c });
  }
  return toks;
}
function customNumber(v, fmt2, locale) {
  const secs = sections(fmt2);
  let sec = secs[0], minus = v < 0;
  if (v < 0 && secs.length > 1 && secs[1] !== "") {
    sec = secs[1];
    minus = false;
  }
  const sci2 = exponentOf(sec);
  if (sci2) return (minus ? "-" : "") + scientificCustom(Math.abs(v), sci2, locale);
  const shape = numShape(numTokens(sec));
  let x = Math.abs(v);
  if (shape.pct) x = shiftDec(x, 2 * shape.pct);
  if (shape.mille) x = shiftDec(x, 3 * shape.mille);
  if (shape.scale) x = shiftDec(x, -3 * shape.scale);
  if (secs.length > 2 && secs[2] !== "" && roundHalfAway(x, shape.decimals) === 0) return formatShape(numShape(numTokens(secs[2])), 0, false, locale);
  return formatShape(shape, x, minus, locale);
}
function exponentOf(sec) {
  let q = null;
  for (let i = 0; i < sec.length; i++) {
    const c = sec[i];
    if (q) {
      if (c === q) q = null;
      continue;
    }
    if (c === '"' || c === "'") {
      q = c;
      continue;
    }
    if (c === "\\") {
      i++;
      continue;
    }
    if (c === "E" || c === "e") {
      const m = /^([+-]?)(0+)/.exec(sec.slice(i + 1));
      if (m && /[0#]/.test(sec.slice(0, i))) return { mant: sec.slice(0, i), e: c, plus: m[1] === "+", digits: m[2].length, rest: sec.slice(i + 1 + m[0].length) };
    }
  }
  return null;
}
function scientificCustom(x, sci2, locale) {
  const intPh = (sci2.mant.split(".")[0].match(/[0#]/g) || []).length || 1;
  const decimals = ((sci2.mant.split(".")[1] || "").match(/[0#]/g) || []).length;
  let exp = 0, m = x;
  if (x !== 0) {
    exp = Math.floor(Math.log10(x)) - (intPh - 1);
    m = shiftDec(x, -exp);
    if (roundHalfAway(m, decimals) >= 10 ** intPh) {
      exp++;
      m = shiftDec(x, -exp);
    } else if (m < 10 ** (intPh - 1)) {
      exp--;
      m = shiftDec(x, -exp);
    }
  }
  const sign = exp < 0 ? "-" : sci2.plus ? "+" : "";
  const mant = formatShape(numShape(numTokens(sci2.mant)), roundHalfAway(m, decimals), false, locale);
  const rest = litText(numTokens(sci2.rest));
  return `${mant}${sci2.e}${sign}${String(Math.abs(exp)).padStart(sci2.digits, "0")}${rest}`;
}
function numShape(toks) {
  const ph = (t) => t.k === "0" || t.k === "#";
  const last = toks.findLastIndex(ph);
  const first = toks.findIndex((t) => ph(t) || t.k === ".");
  if (last < 0) return { toks, pre: toks, post: [], int: [], frac: [], decimals: 0, minDec: 0, minInt: 0, grouping: false, scale: 0, pct: 0, inner: false };
  const span = toks.slice(first, last + 1);
  let dot = span.findIndex((t) => t.k === ".");
  if (dot < 0) dot = span.length;
  const int = span.slice(0, dot), frac = span.slice(dot + 1).filter(ph);
  let scale = 0;
  for (let i = int.length - 1; i >= 0 && int[i].k === ","; i--) scale++;
  const intCore = int.slice(0, int.length - scale);
  if (dot === span.length) for (let j = last + 1; j < toks.length && toks[j].k === ","; j++) scale++;
  const intPh = intCore.filter(ph);
  const z = intPh.findIndex((t) => t.k === "0");
  const lastZero = frac.findLastIndex((t) => t.k === "0");
  const sizes = [];
  for (let i = intCore.length - 1, n = 0; i >= 0; i--) {
    if (intCore[i].k === ",") {
      sizes.push(n);
      n = 0;
    } else if (ph(intCore[i])) n++;
  }
  const groups = sizes.length > 1 && sizes.some((n) => n !== sizes[0]) && sizes.every((n) => n > 0) ? sizes : null;
  capDigits("Format", frac.length);
  capDigits("Format", intPh.length);
  return {
    pre: toks.slice(0, first),
    post: toks.slice(last + 1).filter((t) => t.k !== ","),
    int: intCore,
    frac,
    decimals: frac.length,
    minDec: lastZero + 1,
    minInt: z < 0 ? 0 : intPh.length - z,
    grouping: intCore.some((t) => t.k === ","),
    groups,
    inner: intCore.some((t) => t.k === "lit"),
    scale,
    pct: toks.filter((t) => t.k === "%").length,
    mille: toks.filter((t) => t.k === "lit" && t.s === "‰").length
  };
}
var litText = (toks) => toks.map((t) => t.k === "lit" ? t.s : t.k === "%" ? "%" : t.k === "." ? "." : t.k === "," ? "," : "").join("");
function formatShape(s, x, minus, locale) {
  if (!s.int.length && !s.frac.length) return (minus ? "-" : "") + litText(s.pre);
  let body;
  if (s.inner) {
    const r = roundHalfAway(x, s.decimals);
    const [ip, fp = ""] = r.toFixed(s.decimals).split(".");
    let digits = ip === "0" ? "" : ip;
    const out = [];
    const phs = s.int.filter((t) => t.k === "0" || t.k === "#").length;
    let k = 0;
    for (let i = s.int.length - 1; i >= 0; i--) {
      const t = s.int[i];
      if (t.k === "lit") {
        out.unshift(t.s);
        continue;
      }
      if (t.k !== "0" && t.k !== "#") continue;
      k++;
      if (k === phs) {
        out.unshift(digits || (t.k === "0" ? "0" : ""));
        digits = "";
        continue;
      }
      const dch = digits.slice(-1);
      digits = digits.slice(0, -1);
      out.unshift(dch || (t.k === "0" ? "0" : ""));
    }
    const frac = fp.slice(0, s.decimals).replace(new RegExp(`0{0,${s.decimals - s.minDec}}$`), "");
    body = out.join("") + (frac ? latinDecimal(locale) + frac : "");
    minus = minus && r !== 0;
  } else {
    body = nf(locale, { useGrouping: s.grouping && !s.groups, minimumFractionDigits: s.minDec, maximumFractionDigits: s.decimals, minimumIntegerDigits: Math.max(1, s.minInt) }).format(x);
    minus = minus && /[1-9]/.test(body);
    if (s.groups) body = body.replace(/^\d+/, (d) => {
      const out = [];
      let k = 0;
      while (d.length > s.groups[Math.min(k, s.groups.length - 1)]) {
        const n = s.groups[Math.min(k++, s.groups.length - 1)];
        out.unshift(d.slice(-n));
        d = d.slice(0, -n);
      }
      return [d, ...out].join(separators(locale).grp);
    });
    if (s.minInt === 0) body = body.replace(/^0(?=\D|$)/, "");
  }
  return (minus ? "-" : "") + litText(s.pre) + body + litText(s.post);
}
var dtfCache = /* @__PURE__ */ new Map();
function localName(locale, kind, style, w) {
  const key = `${locale}|${kind}|${style}`;
  let f4 = dtfCache.get(key);
  if (f4 === void 0) {
    try {
      f4 = new Intl.DateTimeFormat(locale, { [kind]: style, timeZone: "UTC" });
    } catch {
      f4 = null;
    }
    if (dtfCache.size >= 500) dtfCache.clear();
    dtfCache.set(key, f4);
  }
  return f4 ? f4.format(w) : null;
}
function localPart(locale, opts, w, type) {
  const key = `p|${locale}|${JSON.stringify(opts)}`;
  let f4 = dtfCache.get(key);
  if (f4 === void 0) {
    try {
      f4 = new Intl.DateTimeFormat(locale, { ...opts, timeZone: "UTC" });
    } catch {
      f4 = null;
    }
    if (dtfCache.size >= 500) dtfCache.clear();
    dtfCache.set(key, f4);
  }
  return f4 ? f4.formatToParts(w).find((p) => p.type === type)?.value ?? null : null;
}
function dateSep(locale) {
  const l = locale || "en-US";
  const key = `sep|${l}`;
  let v = dtfCache.get(key);
  if (v === void 0) {
    try {
      v = new Intl.DateTimeFormat(l, { day: "2-digit", month: "2-digit", year: "numeric", calendar: "gregory", numberingSystem: "latn", timeZone: "UTC" }).formatToParts(new Date(Date.UTC(2026, 2, 5))).find((p) => p.type === "literal")?.value.trim() || "/";
    } catch {
      v = "/";
    }
    if (/[\u200e\u200f]/.test(v)) v = v.replace(/[\u200e\u200f]/g, "") || "/";
    dtfCache.set(key, v);
  }
  return v;
}
var english = (locale) => !locale || /^en\b/i.test(locale);
var US_DATES = { d: "M/d/yyyy", D: "dddd, MMMM d, yyyy", t: "h:mm tt", T: "h:mm:ss tt", M: "MMMM d", Y: "MMMM yyyy" };
var DAY_FIRST = { d: "dd/MM/yyyy", D: "dddd, dd MMMM yyyy", t: "HH:mm", T: "HH:mm:ss", M: "dd MMMM", Y: "MMMM yyyy" };
var NET_SHORT = { "en-IN": "dd-MM-yyyy" };
var INVARIANT = { s: "yyyy-MM-dd'T'HH:mm:ss", u: "yyyy-MM-dd HH:mm:ss'Z'", o: "yyyy-MM-dd'T'HH:mm:ss.fffffff" };
var patCache = /* @__PURE__ */ new Map();
function intlPattern(locale, opts) {
  const parts = new Intl.DateTimeFormat(locale, { ...opts, calendar: "gregory", numberingSystem: "latn", timeZone: "UTC" }).formatToParts(new Date(Date.UTC(2026, 2, 5, 9, 4, 7)));
  const h12 = parts.some((p) => p.type === "dayPeriod");
  return parts.map((p) => {
    const v = p.value;
    switch (p.type) {
      case "year":
        return "yyyy";
      case "month":
        return /^[\d\u0660-\u0669\u06f0-\u06f9]+$/.test(v) ? v.length > 1 ? "MM" : "M" : v.length > 4 || opts.month === "long" ? "MMMM" : "MMM";
      case "day":
        return v.length > 1 ? "dd" : "d";
      case "weekday":
        return opts.weekday === "long" ? "dddd" : "ddd";
      case "hour":
        return h12 ? v.length > 1 ? "hh" : "h" : v.length > 1 ? "HH" : "H";
      case "minute":
        return "mm";
      case "second":
        return "ss";
      case "dayPeriod":
        return "tt";
      default:
        return !v ? "" : v.includes("'") ? [...v].map((c) => `\\${c}`).join("") : `'${v}'`;
    }
  }).join("");
}
function localePatterns(locale) {
  let p = patCache.get(locale);
  if (!p) {
    try {
      p = {
        d: NET_SHORT[locale] || intlPattern(locale, { dateStyle: "short" }),
        D: intlPattern(locale, { weekday: "long", year: "numeric", month: "long", day: "numeric" }),
        t: intlPattern(locale, { hour: "numeric", minute: "2-digit" }),
        T: intlPattern(locale, { hour: "numeric", minute: "2-digit", second: "2-digit" }),
        M: intlPattern(locale, { month: "long", day: "numeric" }),
        Y: intlPattern(locale, { year: "numeric", month: "long" })
      };
    } catch {
      p = DAY_FIRST;
    }
    if (patCache.size >= 200) patCache.clear();
    patCache.set(locale, p);
  }
  return p;
}
function standardDate(fmt2, locale) {
  const p = !locale || /^en-US$/i.test(locale) ? US_DATES : localePatterns(locale);
  switch (fmt2) {
    case "d":
    case "D":
    case "t":
    case "T":
      return p[fmt2];
    case "f":
      return `${p.D} ${p.t}`;
    case "F":
      return `${p.D} ${p.T}`;
    case "g":
      return `${p.d} ${p.t}`;
    case "G":
      return `${p.d} ${p.T}`;
    case "M":
    case "m":
      return p.M;
    case "Y":
    case "y":
      return p.Y;
    case "s":
    case "u":
    case "o":
      return INVARIANT[fmt2];
    case "O":
      return INVARIANT.o;
  }
  return null;
}
function formatDate(d, fmt2, locale, tz) {
  if (fmt2.length === 1) {
    const std = standardDate(fmt2, locale);
    if (std) return formatDate(d, std, locale, tz);
  }
  if (fmt2.length === 2 && fmt2[0] === "%") fmt2 = fmt2[1];
  const w = wallDate(d, tz);
  const en = english(locale);
  const name = (kind, style, fallback) => en ? fallback : localName(locale, kind, style, w) ?? fallback;
  const withDay = /(^|[^d])d{1,2}([^d]|$)/.test(fmt2.replace(/'[^']*'|"[^"]*"/g, " "));
  const month = (style, fallback) => {
    if (en) return fallback;
    if (withDay) {
      const g = localPart(locale, { day: "numeric", month: style }, w, "month");
      if (g && !/^\d+$/.test(g)) return g;
    }
    return localName(locale, "month", style, w) ?? fallback;
  };
  const p2 = (n) => String(n).padStart(2, "0");
  return fmt2.replace(/(y+|M+|d+|H+|h+|m+|s+|f+|F+|t+|z+|\/)|'([^']*)'?|"([^"]*)"?|\\(.?)/g, (tok, run, q1, q2, esc) => {
    if (!run) return q1 ?? q2 ?? esc ?? "";
    const n = run.length;
    switch (run[0]) {
      case "y": {
        const y = w.getUTCFullYear();
        return n === 1 ? String(y % 100) : n === 2 ? p2(y % 100) : String(y).padStart(n, "0");
      }
      case "M":
        return n >= 4 ? month("long", MONTHS[w.getUTCMonth()]) : n === 3 ? month("short", MONTHS[w.getUTCMonth()].slice(0, 3)) : n === 2 ? p2(w.getUTCMonth() + 1) : String(w.getUTCMonth() + 1);
      case "d":
        return n >= 4 ? name("weekday", "long", DAYS[w.getUTCDay()]) : n === 3 ? name("weekday", "short", DAYS[w.getUTCDay()].slice(0, 3)) : n === 2 ? p2(w.getUTCDate()) : String(w.getUTCDate());
      case "H":
        return n >= 2 ? p2(w.getUTCHours()) : String(w.getUTCHours());
      case "h": {
        const h = (w.getUTCHours() + 11) % 12 + 1;
        return n >= 2 ? p2(h) : String(h);
      }
      case "m":
        return n >= 2 ? p2(w.getUTCMinutes()) : String(w.getUTCMinutes());
      case "s":
        return n >= 2 ? p2(w.getUTCSeconds()) : String(w.getUTCSeconds());
      case "f":
      case "F": {
        const f4 = String(w.getUTCMilliseconds()).padStart(3, "0").padEnd(7, "0").slice(0, Math.min(n, 7));
        return run[0] === "F" ? f4.replace(/0+$/, "") : f4;
      }
      case "t": {
        const s = (en ? null : localPart(locale, { hour: "numeric", hour12: true }, w, "dayPeriod")) || (w.getUTCHours() < 12 ? "AM" : "PM");
        return n === 1 ? [...s][0] : s;
      }
      case "/":
        return dateSep(locale);
      // .NET: the culture's date separator (de-DE 05.03.2026); '/' or \/ for a slash (N17)
      case ":":
        return ":";
      case "z": {
        const o = Math.round((w.getTime() - d.getTime()) / 6e4), a = Math.abs(o), sg = o < 0 ? "-" : "+";
        return n === 1 ? `${sg}${Math.floor(a / 60)}` : n === 2 ? `${sg}${p2(Math.floor(a / 60))}` : `${sg}${p2(Math.floor(a / 60))}:${p2(a % 60)}`;
      }
    }
    return run;
  });
}

// src/engine/expr/evaluate.js
var ROOTS = { fields: "Fields", parameters: "Parameters", globals: "Globals", parent: "Parent", theme: "Theme", partproperties: "PartProperties" };
var astCache = /* @__PURE__ */ new Map();
function compile(src) {
  let a = astCache.get(src);
  if (!a) {
    a = parse(src);
    if (astCache.size > 5e3) astCache.clear();
    astCache.set(src, a);
  }
  return a;
}
var tplCache = /* @__PURE__ */ new Map();
function parseValue(v) {
  if (typeof v !== "string") return { kind: "lit", v };
  let p = tplCache.get(v);
  if (p) {
    if (p.kind === "err") throw p.error;
    return p;
  }
  try {
    p = parseFresh(v);
  } catch (e) {
    if (!(e instanceof ExprError)) throw e;
    p = { kind: "err", error: e };
  }
  if (tplCache.size > 5e3) tplCache.clear();
  tplCache.set(v, p);
  if (p.kind === "err") throw p.error;
  return p;
}
function parseFresh(v) {
  let p;
  if (v.startsWith("=")) {
    const ast = compile(v.slice(1));
    p = { kind: "expr", ast, fn: closureFor(ast) };
  } else if (!v.includes("{")) p = { kind: "lit", v };
  else {
    const parts = [];
    let i = 0, buf = "";
    while (i < v.length) {
      if (v.startsWith("{{", i)) {
        buf += "{";
        i += 2;
        continue;
      }
      if (v.startsWith("}}", i)) {
        buf += "}";
        i += 2;
        continue;
      }
      if (v[i] === "{") {
        const end = findClose(v, i + 1);
        if (end < 0) throw new ExprError('A "{" has no closing "}"', i, v);
        if (buf) {
          parts.push(buf);
          buf = "";
        }
        parts.push({ ast: compile(v.slice(i + 1, end)) });
        i = end + 1;
        continue;
      }
      buf += v[i++];
    }
    if (buf) parts.push(buf);
    p = { kind: "tpl", parts };
  }
  return p;
}
function findClose(s, i) {
  let q = null;
  for (; i < s.length; i++) {
    const c = s[i];
    if (q) {
      if (c === q) q = null;
      continue;
    }
    if (c === '"' || c === "'") {
      q = c;
      continue;
    }
    if (c === "}") return i;
  }
  return -1;
}
function isDynamic(v) {
  return typeof v === "string" && (v.startsWith("=") || /\{[^{]/.test(v));
}
function evalValue(v, ctx) {
  let p;
  try {
    p = parseValue(v);
  } catch (e) {
    const clock = ctx.clock;
    if (clock && (clock.over || (++clock.n & 1023) === 0 && Date.now() > clock.until && (clock.over = true))) throw new ExprError(OVER_TIME, 0);
    throw e;
  }
  if (p.kind === "lit") return p.v;
  if (p.kind === "expr") return p.fn ? p.fn(ctx) : evaluate(p.ast, ctx);
  let out = "";
  for (const part2 of p.parts) out += typeof part2 === "string" ? part2 : toText(evaluate(part2.ast, ctx), null, ctx);
  return out;
}
function toText(v, fmt2, ctx) {
  return formatValue(v, fmt2, ctx);
}
function checkValue(v) {
  try {
    parseValue(v);
    return null;
  } catch (e) {
    return e.message;
  }
}
function closureFor(ast) {
  if (ast.type !== "member" || ast.obj.type !== "id") return null;
  const root = ast.obj.name.toLowerCase(), prop = ast.prop;
  if (root !== "fields" && root !== "parameters") return null;
  const key = root === "fields" ? "fields" : "params";
  return (ctx) => {
    const src = ctx[key];
    if (ctx.locals || !src || typeof src !== "object" || !Object.hasOwn(src, prop)) return evaluate(ast, ctx);
    const clock = ctx.clock;
    if (clock && (clock.over || ((clock.n += 2) & 1022) === 0 && Date.now() > clock.until && (clock.over = true))) throw new ExprError(OVER_TIME, ast.p);
    return src[prop];
  };
}
var OVER_TIME = "The report ran past its time limit.";
function evaluate(n, ctx) {
  const clock = ctx.clock;
  if (clock && (clock.over || (++clock.n & 1023) === 0 && Date.now() > clock.until && (clock.over = true))) throw new ExprError(OVER_TIME, n.p);
  switch (n.type) {
    case "lit":
      return n.v;
    case "id": {
      const lower = n.name.toLowerCase();
      if (ctx.locals && Object.hasOwn(ctx.locals, lower)) return ctx.locals[lower];
      const r = Object.hasOwn(ROOTS, lower) ? ROOTS[lower] : void 0;
      if (r) return { __root: r };
      if (Object.hasOwn(CONSTANTS, lower)) return CONSTANTS[lower];
      throw new ExprError(`Unknown name "${n.name}". Use Fields.x, Parameters.x, Globals.x or Parent.x`, n.p);
    }
    case "member": {
      const o = evaluate(n.obj, ctx);
      return member(o, n.prop, ctx);
    }
    case "index": {
      const o = evaluate(n.obj, ctx);
      return member(o, String(evaluate(n.key, ctx)), ctx);
    }
    case "unary": {
      const v = evaluate(n.arg, ctx);
      if (n.op === "neg") return v == null ? ctx.nullPropagation === true ? null : 0 : typeof v === "boolean" ? -vbNum(v) : -Number(v);
      return !truthy(v);
    }
    case "cond":
      return truthy(evaluate(n.test, ctx)) ? evaluate(n.a, ctx) : evaluate(n.b, ctx);
    case "bin":
      return binary(n, ctx);
    case "call":
      return call(n, ctx);
  }
  throw new ExprError("Bad expression node");
}
var ROW_PARENT = /* @__PURE__ */ new WeakMap();
function member(o, prop, ctx) {
  if (o && o.__root) {
    const src = o.__root === "Fields" ? ctx.fields : o.__root === "Parameters" ? ctx.params : o.__root === "Parent" ? ctx.parentFields ?? (ctx.fields && typeof ctx.fields === "object" ? ROW_PARENT.get(ctx.fields) : null) : o.__root === "Theme" ? ctx.theme : o.__root === "PartProperties" ? ctx.partProps : ctx.globals;
    if (!src || typeof src !== "object") return null;
    if (Object.hasOwn(src, prop)) return src[prop];
    const lower = prop.toLowerCase();
    for (const k of Object.keys(src)) if (k.toLowerCase() === lower) return src[k];
    if (o.__root === "Fields" && ctx.fields && Object.keys(ctx.fields).length) throw new ExprError(`The field "${prop}" does not exist; check the spelling, or the data set that has it`);
    if (o.__root === "Parameters") throw new ExprError(`The parameter "${prop}" does not exist; declare it under parameters, or check the spelling`);
    return null;
  }
  if (o == null) return null;
  if (prop === "Value") return o;
  if (prop in Object(o) && !Object.hasOwn(Object(o), prop)) throw new ExprError(`The value has no member ${prop}`);
  if (typeof o === "object") return Object.hasOwn(o, prop) ? o[prop] ?? null : null;
  return null;
}
function truthy(v) {
  if (v == null) return false;
  if (typeof v === "string") return v !== "" && v.toLowerCase() !== "false";
  return Boolean(v);
}
var num = (v) => v == null || v === "" ? null : v instanceof Date ? v.getTime() : Number(v);
var P102 = Array.from({ length: 23 }, (_, i) => 10 ** i);
var DEC_MAX = 2 ** 49;
function dec(x) {
  if (Number.isInteger(x)) return Math.abs(x) <= DEC_MAX ? [x, 0] : null;
  if (!Number.isFinite(x)) return null;
  for (let k = 1; k <= 15; k++) {
    const i = Math.round(x * P102[k]);
    if (Math.abs(i) > DEC_MAX) return null;
    if (i / P102[k] === x) return [i, k];
  }
  return null;
}
function decBig(x) {
  const m = Number.isFinite(x) ? /^(-?)(\d+)(?:\.(\d+))?(?:e([+-]\d+))?$/.exec(String(x)) : null;
  if (!m) return null;
  const frac = m[3] || "";
  let scale = frac.length - Number(m[4] || 0), digits = m[2] + frac;
  if (scale < 0) {
    digits += "0".repeat(-scale);
    scale = 0;
  }
  return scale > 15 ? null : [BigInt(m[1] + digits), scale];
}
function decNum(t, k) {
  const neg = t < 0n;
  let s = (neg ? -t : t).toString().padStart(k + 1, "0");
  if (k) s = `${s.slice(0, -k)}.${s.slice(-k)}`;
  return Number((neg ? "-" : "") + s);
}
function decAdd(a, b) {
  if (Number.isInteger(a) && Number.isInteger(b)) return a + b;
  const x = dec(a), y = dec(b);
  if (x && y) {
    const k2 = Math.max(x[1], y[1]);
    const p = x[0] * P102[k2 - x[1]], q = y[0] * P102[k2 - y[1]], t = p + q;
    if (Number.isSafeInteger(p) && Number.isSafeInteger(q) && Number.isSafeInteger(t)) return t / P102[k2];
  }
  const X = decBig(a), Y = decBig(b);
  if (!X || !Y) return a + b;
  const k = Math.max(X[1], Y[1]);
  return decNum(X[0] * 10n ** BigInt(k - X[1]) + Y[0] * 10n ** BigInt(k - Y[1]), k);
}
function decMul(a, b) {
  if (Number.isInteger(a) && Number.isInteger(b)) return a * b;
  const x = dec(a), y = dec(b);
  if (!x || !y) return a * b;
  const p = x[0] * y[0], k = x[1] + y[1];
  return Number.isSafeInteger(p) && k <= 22 ? p / P102[k] : a * b;
}
var add = (a, b, ctx) => ctx?.doubles ? a + b : decAdd(a, b);
function cmpVal(a, b) {
  if (a instanceof Date) a = a.getTime();
  if (b instanceof Date) b = b.getTime();
  if (typeof a === "number" && typeof b === "string" && b.trim() !== "" && !Number.isNaN(Number(b))) b = Number(b);
  if (typeof b === "number" && typeof a === "string" && a.trim() !== "" && !Number.isNaN(Number(a))) a = Number(a);
  if (a < b) return -1;
  if (a > b) return 1;
  return 0;
}
var vbNum = (v) => v == null || v === "" ? 0 : typeof v === "boolean" ? v ? -1 : 0 : v instanceof Date ? v.getTime() : Number(v);
function widen(other) {
  if (typeof other === "string") return "";
  if (other instanceof Date) return /* @__PURE__ */ new Date(-621355968e5);
  if (typeof other === "boolean") return false;
  return 0;
}
var collators = /* @__PURE__ */ new Map();
function collator(ctx) {
  const key = `${ctx?.locale || "en-US"}|${ctx?.caseSensitive === true}|${ctx?.naturalSort === true}|${ctx?.collation || ""}`;
  let c = collators.get(key);
  if (!c && ctx?.collation === "ordinal") {
    c = { compare: (x, y) => x < y ? -1 : x > y ? 1 : 0 };
    collators.set(key, c);
  }
  if (!c && ctx?.collation === "java") {
    try {
      c = new Intl.Collator(ctx?.locale || "en-US", { ignorePunctuation: true, sensitivity: "variant", caseFirst: "lower" });
    } catch {
      c = new Intl.Collator("en-US", { ignorePunctuation: true });
    }
    collators.set(key, c);
  }
  if (!c) {
    const numeric = ctx?.naturalSort === true;
    try {
      c = new Intl.Collator(ctx?.locale || "en-US", { numeric, sensitivity: ctx?.caseSensitive === true ? "variant" : "accent" });
    } catch {
      c = new Intl.Collator("en-US", { numeric, sensitivity: "accent" });
    }
    if (collators.size >= 100) collators.clear();
    collators.set(key, c);
  }
  return c;
}
function sortCompare(a, b, ctx) {
  if (a instanceof Date) a = a.getTime();
  if (b instanceof Date) b = b.getTime();
  if (a === b) return 0;
  if (a == null) return ctx?.nullOrder === "low" ? -1 : 1;
  if (b == null) return ctx?.nullOrder === "low" ? 1 : -1;
  const sa = typeof a === "string", sb = typeof b === "string";
  if (sa && sb) return collator(ctx).compare(a, b);
  if (sa !== sb) return sa ? 1 : -1;
  return a < b ? -1 : a > b ? 1 : 0;
}
function groupKeyText(key, ctx) {
  if (key instanceof Date) return String(key.getTime());
  if (typeof key === "string" && ctx?.caseSensitive !== true) return key.toLocaleLowerCase(ctx?.locale || "en-US");
  return String(key);
}
function binary(n, ctx) {
  const op = n.op;
  if (op === "and" || op === "&&" || op === "andalso") return truthy(evaluate(n.a, ctx)) && truthy(evaluate(n.b, ctx));
  if (op === "or" || op === "||" || op === "orelse") return truthy(evaluate(n.a, ctx)) || truthy(evaluate(n.b, ctx));
  let a = evaluate(n.a, ctx), b = evaluate(n.b, ctx);
  if (op === "is" || op === "isnot") {
    const same2 = a == null || b == null ? a == null && b == null : a === b || cmpVal(a, b) === 0;
    return op === "is" ? same2 : !same2;
  }
  if (op === "xor") return truthy(a) !== truthy(b);
  if (op === "&") {
    const x = toText(a, null, ctx), y = toText(b, null, ctx);
    capText("&", x.length + y.length);
    return x + y;
  }
  const sql = ctx.nullPropagation === true;
  if (!sql && (a == null || b == null)) {
    if (a == null && b == null) {
      a = 0;
      b = 0;
    } else if (a == null) a = widen(b);
    else b = widen(a);
  }
  if (!sql && (typeof a === "boolean" || typeof b === "boolean") && "+-*/%".includes(op) && typeof a !== "string" && typeof b !== "string") {
    a = vbNum(a);
    b = vbNum(b);
  }
  switch (op) {
    case "+":
      if (typeof a === "string" || typeof b === "string") {
        if (typeof a === "number" && numericText(b)) return add(a, Number(b), ctx);
        if (typeof b === "number" && numericText(a)) return add(Number(a), b, ctx);
        if (!sql && (typeof a === "number" || typeof b === "number")) throw new ExprError(`"${String(typeof a === "string" ? a : b).slice(0, 40)}" + a number: the text is not a number (join text with &)`);
        {
          const x = String(a ?? ""), y = String(b ?? "");
          capText("+", x.length + y.length);
          return x + y;
        }
      }
      if (a == null || b == null) return null;
      if (a instanceof Date && b === 0) return a;
      if (b instanceof Date && a === 0) return b;
      if (a instanceof Date || b instanceof Date) return Number(a) + Number(b);
      return add(Number(a), Number(b), ctx);
    case "-":
      if (a == null || b == null) return null;
      return a instanceof Date || b instanceof Date ? num(a) - num(b) : add(num(a), -num(b), ctx);
    case "*":
      return a == null || b == null ? null : ctx.doubles ? num(a) * num(b) : decMul(num(a), num(b));
    case "/": {
      if (a == null || b == null) return null;
      const d = num(b);
      return d === 0 && sql ? null : num(a) / d;
    }
    case "%":
    case "mod":
      return a == null || b == null ? null : num(a) % num(b) + 0;
    // + 0: no -0 // VB Mod: the dividend's sign (-7 Mod 3 is -1)
    case "^":
      return a == null || b == null ? null : num(a) ** num(b);
    case "\\": {
      if (a == null || b == null) return null;
      const x = roundHalfEven(num(a), 0), y = roundHalfEven(num(b), 0);
      if (y === 0) throw new ExprError("\\ by zero");
      return Math.trunc(x / y) + 0;
    }
    case "=":
    case "==":
      if (a == null || b == null) return a == null && b == null;
      return cmpVal(a, b) === 0;
    case "<>":
    case "!=":
      if (a == null || b == null) return !(a == null && b == null);
      return cmpVal(a, b) !== 0;
    case "<":
      return a != null && b != null && cmpVal(a, b) < 0;
    case "<=":
      return a != null && b != null && cmpVal(a, b) <= 0;
    case ">":
      return a != null && b != null && cmpVal(a, b) > 0;
    case ">=":
      return a != null && b != null && cmpVal(a, b) >= 0;
  }
  throw new ExprError(`Unknown operator "${op}"`);
}
var MONTH_NAMES = Array.from({ length: 12 }, (_, i) => new Date(2e3, i, 1).toLocaleString("en", { month: "long" }));
function scopeRows(args, idx, ctx, fname) {
  if (args.length > idx) {
    const s = evaluate(args[idx], ctx);
    const sc = ctx.scopes?.[s];
    if (sc?.recRows && args.length > idx + 1 && String(evaluate(args[idx + 1], ctx)).toLowerCase() === "recursive") return sc.recRows;
    const rows = sc?.rows || ctx.dataSets[s] || groupInstanceRows(s, ctx);
    if (!rows) throw new ExprError(`${fname}: the scope "${s}" does not exist`);
    return rows;
  }
  if (ctx.aggIndex != null && ctx.fields) return [ctx.fields];
  if (ctx.aggRows) return ctx.aggRows;
  return ctx.fields ? [ctx.fields] : [];
}
function groupInstanceRows(name, ctx) {
  const g = ctx.groupChains?.[name];
  if (!g || !ctx.fields) return null;
  const keys = g.keys.map((k) => compile(String(k).replace(/^=/, "")));
  const c = Object.assign({}, ctx, { aggRows: void 0, aggIndex: void 0 });
  const keyOf2 = (r) => {
    c.fields = r;
    return keys.map((k) => {
      const v = evaluate(k, c);
      return v instanceof Date ? v.getTime() : v;
    }).join("");
  };
  const want = keyOf2(ctx.fields);
  return g.rows.filter((r) => keyOf2(r) === want);
}
var RUN_CACHE = /* @__PURE__ */ new WeakMap();
function prefixValues(base, n, ast, ctx) {
  let byAst = RUN_CACHE.get(base);
  if (!byAst) {
    byAst = /* @__PURE__ */ new Map();
    RUN_CACHE.set(base, byAst);
  }
  let vals = byAst.get(ast);
  if (!vals) {
    vals = [];
    byAst.set(ast, vals);
  }
  if (vals.length < n) {
    const c = Object.assign({}, ctx, { aggRows: base, aggIndex: void 0 });
    for (let i = vals.length; i < n; i++) {
      c.fields = base[i];
      vals.push(evaluate(ast, c));
    }
  }
  return vals.length === n ? vals : vals.slice(0, n);
}
var RUN_SUMS = /* @__PURE__ */ new WeakMap();
function runningSum(base, n, ast, ctx) {
  prefixValues(base, n, ast, ctx);
  const vals = RUN_CACHE.get(base).get(ast);
  let sums = RUN_SUMS.get(vals);
  if (!sums) {
    sums = [];
    RUN_SUMS.set(vals, sums);
  }
  for (let i = sums.length; i < n; i++) {
    const v = vals[i];
    const prev = i ? sums[i - 1] : 0;
    sums.push(v != null && v !== "" ? add(prev, Number(v), ctx) : prev);
  }
  return n ? sums[n - 1] : 0;
}
var ROW_LOCAL = /* @__PURE__ */ new WeakMap();
function rowLocal(ast) {
  let r = ROW_LOCAL.get(ast);
  if (r === void 0) {
    const local = (n) => {
      if (n.type === "id") return n.name.toLowerCase() in ROOTS || n.name.toLowerCase() in CONSTANTS;
      if (n.type !== "call") return true;
      const k = n.name.toLowerCase();
      return !n.obj && (k in FUNCTIONS || k === "iif" || k === "switch" || k === "choose" || k === "lookup" || k === "lookupset");
    };
    const walk = (n) => !n || typeof n !== "object" || (Array.isArray(n) ? n.every(walk) : local(n) && Object.values(n).every(walk));
    r = walk(ast);
    ROW_LOCAL.set(ast, r);
  }
  return r;
}
var PURE_ROWS = /* @__PURE__ */ new WeakMap();
function pureRows(ast) {
  let r = PURE_ROWS.get(ast);
  if (r === void 0) {
    const walk = (n) => !n || typeof n !== "object" || (Array.isArray(n) ? n.every(walk) : !(n.type === "id" && ["globals", "parent", "partproperties"].includes(n.name.toLowerCase())) && Object.values(n).every(walk));
    r = rowLocal(ast) && walk(ast);
    PURE_ROWS.set(ast, r);
  }
  return r;
}
function mapRows(rows, ast, ctx) {
  const c = Object.assign({}, ctx, { aggRows: rows, aggIndex: void 0 });
  const out = new Array(rows.length);
  for (let i = 0; i < rows.length; i++) {
    c.fields = rows[i];
    out[i] = evaluate(ast, c);
  }
  return out;
}
var isAggregate = (name) => Object.hasOwn(AGG, name);
var AGG = {
  // text that is not a number is #Error, as in SSRS (it printed NaN)
  sum: (vals, ctx) => {
    let s = 0;
    for (const v of vals) if (v != null && v !== "") {
      const x = Number(v);
      if (Number.isNaN(x) && typeof v === "string") throw new ExprError(`Sum: "${v.slice(0, 40)}" is not a number`);
      s = add(s, x, ctx);
    }
    return s;
  },
  avg: (vals, ctx) => {
    let s = 0, c = 0;
    for (const v of vals) if (v != null && v !== "") {
      s = add(s, Number(v), ctx);
      c++;
    }
    return c ? s / c : null;
  },
  count: (vals) => vals.filter((v) => v != null).length,
  countdistinct: (vals) => new Set(vals.filter((v) => v != null).map((v) => v instanceof Date ? v.getTime() : v)).size,
  min: (vals) => {
    let m = null;
    for (const v of vals) if (v != null && (m == null || cmpVal(v, m) < 0)) m = v;
    return m;
  },
  max: (vals) => {
    let m = null;
    for (const v of vals) if (v != null && (m == null || cmpVal(v, m) > 0)) m = v;
    return m;
  },
  first: (vals) => vals.length ? vals[0] : null,
  last: (vals) => vals.length ? vals[vals.length - 1] : null,
  median: (vals) => {
    const xs = nums(vals).sort((a, b) => a - b), n = xs.length;
    return n ? n % 2 ? xs[(n - 1) / 2] : (xs[n / 2 - 1] + xs[n / 2]) / 2 : null;
  },
  mode: (vals) => {
    const counts = /* @__PURE__ */ new Map();
    let best = null, top = 0;
    for (const v of vals) {
      if (v == null || v === "") continue;
      const k = v instanceof Date ? v.getTime() : v;
      const c = (counts.get(k) || 0) + 1;
      counts.set(k, c);
      if (c > top) {
        top = c;
        best = v;
      }
    }
    return best;
  },
  var: (vals) => variance(vals, true),
  varp: (vals) => variance(vals, false),
  stdev: (vals) => {
    const v = variance(vals, true);
    return v == null ? null : Math.sqrt(v);
  },
  stdevp: (vals) => {
    const v = variance(vals, false);
    return v == null ? null : Math.sqrt(v);
  }
};
function nums(vals) {
  const out = [];
  for (const v of vals) {
    if (v == null || v === "" || typeof v === "boolean") continue;
    const n = num(v);
    if (Number.isFinite(n)) out.push(n);
  }
  return out;
}
function variance(vals, sample) {
  const xs = nums(vals);
  if (xs.length < (sample ? 2 : 1)) return null;
  let m = 0;
  for (const x of xs) m += x;
  m /= xs.length;
  let s = 0;
  for (const x of xs) s += (x - m) ** 2;
  return s / (xs.length - (sample ? 1 : 0));
}
function aggValues(rows, ast, ctx) {
  const vals = mapRows(rows, ast, ctx);
  return vals.some(Array.isArray) ? vals.flat() : vals;
}
var DAY = 864e5;
var wall = (d, z) => toWall(d, z?.timeZone);
var fromWall2 = (ms, z) => fromWall(ms, z?.timeZone);
var W = (d, z) => new Date(wall(d, z));
var toDate2 = (v, z) => toDate(v, z);
var msOf = (n, unit) => Math.sign(n) * Math.round(Math.abs(n) * unit);
function dateAdd(interval, n, d, z) {
  d = toDate2(d, z);
  if (!d) return null;
  n = Number(n);
  if (!Number.isFinite(n)) return null;
  const whole = Math.trunc(n);
  switch (String(interval).toLowerCase()) {
    case "yyyy":
    case "year":
      return addMonths(d, 12 * whole, z);
    case "q":
    case "quarter":
      return addMonths(d, 3 * whole, z);
    case "m":
    case "month":
      return addMonths(d, whole, z);
    case "d":
    case "day":
    case "y":
    case "dayofyear":
    case "w":
    case "weekday":
      return fromWall2(wall(d, z) + whole * DAY, z);
    case "ww":
    case "week":
    case "weekofyear":
      return fromWall2(wall(d, z) + whole * 7 * DAY, z);
    case "h":
    case "hour":
      return fromWall2(wall(d, z) + msOf(n, 36e5), z);
    case "n":
    case "minute":
      return fromWall2(wall(d, z) + msOf(n, 6e4), z);
    case "s":
    case "second":
      return fromWall2(wall(d, z) + msOf(n, 1e3), z);
  }
  throw new ExprError(`DateAdd: unknown interval "${interval}"`);
}
function dateDiff(interval, a0, b0, first, z) {
  const a1 = toDate2(a0, z), b1 = toDate2(b0, z);
  if (!a1 || !b1) return null;
  const a = W(a1, z), b = W(b1, z);
  const ms = b.getTime() - a.getTime();
  const fix = (x) => Math.trunc(x) + 0;
  switch (String(interval).toLowerCase()) {
    case "yyyy":
    case "year":
      return b.getUTCFullYear() - a.getUTCFullYear();
    case "q":
    case "quarter":
      return (b.getUTCFullYear() - a.getUTCFullYear()) * 4 + Math.floor(b.getUTCMonth() / 3) - Math.floor(a.getUTCMonth() / 3);
    case "m":
    case "month":
      return (b.getUTCFullYear() - a.getUTCFullYear()) * 12 + b.getUTCMonth() - a.getUTCMonth();
    case "d":
    case "day":
    case "y":
    case "dayofyear":
      return fix(ms / DAY);
    case "w":
    case "weekday":
      return fix(ms / DAY / 7);
    case "ww":
    case "week":
    case "weekofyear": {
      const start = (x) => x.getTime() - (weekdayW(x, first) - 1) * DAY;
      return fix((start(b) - start(a)) / DAY / 7);
    }
    case "h":
    case "hour":
      return fix(ms / 36e5);
    case "n":
    case "minute":
      return fix(ms / 6e4);
    case "s":
    case "second":
      return fix(ms / 1e3);
  }
  throw new ExprError(`DateDiff: unknown interval "${interval}"`);
}
var S = (v) => v == null ? "" : String(v);
var vbUpper = (s) => {
  const u = s.toUpperCase();
  return u.length === s.length ? u : [...s].map((c) => {
    const x = c.toUpperCase();
    return x.length === c.length ? x : c;
  }).join("");
};
var FUNCTIONS = {
  format: (ctx, v, f4) => toText(v, f4, ctx),
  upper: (ctx, s) => vbUpper(S(s)),
  ucase: (ctx, s) => vbUpper(S(s)),
  lower: (ctx, s) => S(s).toLowerCase(),
  lcase: (ctx, s) => S(s).toLowerCase(),
  left: (ctx, s, n) => S(s).slice(0, Number(n)),
  right: (ctx, s, n) => Number(n) <= 0 ? "" : S(s).slice(-Number(n)),
  // VB Mid: the start is 1 or more (0 raises an error, as VB does: it printed the last character)
  mid: (ctx, s, start, len) => {
    const st = Number(start);
    if (!(st >= 1)) throw new ExprError("Mid: the start must be 1 or more");
    if (len != null && Number(len) < 0) throw new ExprError("Mid: the length must be 0 or more");
    return S(s).substr(st - 1, len == null ? void 0 : Number(len));
  },
  len: (ctx, s) => S(s).length,
  trim: (ctx, s) => S(s).trim(),
  replace: (ctx, s, a, b, start, count) => replaceText(S(s), S(a), S(b), start, count),
  instr: (ctx, s, sub) => S(s).indexOf(S(sub)) + 1,
  join: (ctx, arr, sep) => {
    if (!Array.isArray(arr)) return toText(arr, null, ctx);
    const parts = arr.map((v) => toText(v, null, ctx)), j = sep == null ? ", " : S(sep);
    capText("Join", parts.reduce((n, p) => n + p.length, 0) + j.length * Math.max(0, parts.length - 1));
    return parts.join(j);
  },
  // .NET String.Contains and VB Like are ordinal: "Hello".Contains("ELL") is False (N12)
  contains: (ctx, hay, needle) => Array.isArray(hay) ? hay.some((v) => cmpVal(v, needle) === 0) : S(hay).includes(S(needle)),
  inlist: (ctx, v, ...list) => list.flat().some((x) => cmpVal(v, x) === 0),
  cstr: (ctx, v) => toText(v, null, ctx),
  // String.valueOf in Java (imported JasperReports expressions) and String() in JavaScript (BIRT): "null", true/false,
  // Double.toString ("2.0"); JavaStr(x, "int") for an integral value. JavaFormat is java.util.Formatter (String.format).
  javastr: (ctx, v, kind) => javaString(v, kind, ctx.timeZone),
  jsstr: (ctx, v, digits) => digits != null && typeof v === "number" ? v.toFixed(Math.max(0, Math.min(100, Number(digits) || 0))) : jsString(v),
  // JsStr(x, n): x.toFixed(n)
  javaformat: (ctx, f4, ...args) => javaFormatString(S(f4), args, ctx.locale, ctx.timeZone),
  // capped inside, before it builds
  // VB conversions: CInt rounds half to even and raises #Error for text that is not a number; a blank stays blank
  // VB: Nothing converts to the type default (0) unless the report keeps SQL nulls; True is -1
  cdbl: (ctx, v) => v == null ? ctx.nullPropagation === true ? null : 0 : v === "" ? null : v instanceof Date ? v.getTime() : typeof v === "boolean" ? vbNum(v) : toNumber("CDbl", v, ctx.locale),
  cnum: (ctx, v) => num(v),
  val: (ctx, v) => vbVal(v),
  cint: (ctx, v) => v == null ? ctx.nullPropagation === true ? null : 0 : v === "" ? null : toInt("CInt", typeof v === "boolean" ? vbNum(v) : v, 32, ctx.locale),
  cbool: (ctx, v) => vbBool(v),
  // VB CDate: text that is not a date (or a day that does not exist, 30 February) raises #Error
  cdate: (ctx, v) => {
    if (v == null) return null;
    const d = toDate2(v, ctx);
    if (!d) throw new ExprError(`CDate: "${String(v).slice(0, 40)}" is not a date`);
    return d;
  },
  isnull: (ctx, v) => v == null,
  isnothing: (ctx, v) => v == null,
  coalesce: (ctx, ...vs) => {
    for (const v of vs) if (v != null && v !== "") return v;
    return null;
  },
  // Round is VB's Math.Round: half to even (2.5 → 2). RoundHalfAway is the Excel / format-string rule (2.5 → 3).
  round: (ctx, v, d) => v == null ? null : roundHalfEven(Number(v), Number(d || 0)),
  roundhalfaway: (ctx, v, d) => v == null ? null : roundHalfAway(Number(v), Number(d || 0)),
  abs: (ctx, v) => v == null ? null : Math.abs(Number(v)),
  floor: (ctx, v) => v == null ? null : Math.floor(Number(v)),
  ceiling: (ctx, v) => v == null ? null : Math.ceil(Number(v)),
  int: (ctx, v) => v == null ? null : Math.floor(Number(v)),
  // VB Int rounds down (Int(-2.5) = -3); Fix truncates
  pow: (ctx, a, b) => Number(a) ** Number(b),
  sqrt: (ctx, v) => Math.sqrt(Number(v)),
  now: (ctx) => ctx.globals.ExecutionTime instanceof Date ? new Date(ctx.globals.ExecutionTime.getTime()) : /* @__PURE__ */ new Date(),
  // midnight on the report's clock
  today: (ctx) => fromWall2(Math.floor(wall(FUNCTIONS.now(ctx), ctx) / DAY) * DAY, ctx),
  dateadd: (ctx, i, n, d) => dateAdd(i, n, d, ctx),
  datediff: (ctx, i, a, b, first) => dateDiff(i, a, b, first, ctx),
  dateserial: (ctx, y, m, d) => {
    let yr = Number(y);
    if (yr >= 0 && yr < 100) yr += yr < 30 ? 2e3 : 1900;
    const w = /* @__PURE__ */ new Date(0);
    w.setUTCFullYear(yr, Number(m) - 1, Number(d));
    return fromWall2(w.getTime(), ctx);
  },
  year: (ctx, d) => {
    const x = toDate2(d, ctx);
    return x ? W(x, ctx).getUTCFullYear() : null;
  },
  month: (ctx, d) => {
    const x = toDate2(d, ctx);
    return x ? W(x, ctx).getUTCMonth() + 1 : null;
  },
  day: (ctx, d) => {
    const x = toDate2(d, ctx);
    return x ? W(x, ctx).getUTCDate() : null;
  },
  monthname: (ctx, m, abbr) => {
    if (!english(ctx.locale)) return formatDate(new Date(Date.UTC(2e3, Number(m) - 1, 1)), truthy(abbr) ? "MMM" : "MMMM", ctx.locale, "UTC");
    const s = MONTH_NAMES[Number(m) - 1] ?? new Date(2e3, Number(m) - 1, 1).toLocaleString("en", { month: "long" });
    return truthy(abbr) ? s.slice(0, 3) : s;
  }
};
var fin = (x) => Number.isFinite(x) ? x : null;
var math1 = (f4) => (ctx, v) => v == null || v === "" ? null : fin(f4(num(v)));
var dt = (v, z) => {
  const d = toDate2(v, z);
  return d ? W(d, z) : null;
};
var weekdayW = (w, first) => (w.getUTCDay() - ((Number(first) || 1) - 1) + 7) % 7 + 1;
var dayOfYear = (w) => Math.round((Date.UTC(w.getUTCFullYear(), w.getUTCMonth(), w.getUTCDate()) - Date.UTC(w.getUTCFullYear(), 0, 1)) / DAY) + 1;
function addMonths(v, n, z) {
  const d = dt(v, z);
  if (!d || n == null || !Number.isFinite(Number(n))) return null;
  const day = d.getUTCDate();
  d.setUTCDate(1);
  d.setUTCMonth(d.getUTCMonth() + Math.trunc(Number(n)));
  d.setUTCDate(Math.min(day, new Date(Date.UTC(d.getUTCFullYear(), d.getUTCMonth() + 1, 0)).getUTCDate()));
  return fromWall2(d.getTime(), z);
}
function addUnits(v, n, ms, z) {
  const d = toDate2(v, z);
  if (!d || n == null || !Number.isFinite(Number(n))) return null;
  return fromWall2(wall(d, z) + msOf(Number(n), ms), z);
}
function datePart(interval, v, first, z) {
  const d = dt(v, z);
  if (!d) return null;
  switch (String(interval).toLowerCase()) {
    case "yyyy":
    case "year":
      return d.getUTCFullYear();
    case "q":
    case "quarter":
      return Math.floor(d.getUTCMonth() / 3) + 1;
    case "m":
    case "month":
      return d.getUTCMonth() + 1;
    case "y":
    case "dayofyear":
      return dayOfYear(d);
    case "d":
    case "day":
      return d.getUTCDate();
    case "w":
    case "weekday":
      return weekdayW(d, first);
    case "ww":
    case "weekofyear": {
      const jan1 = weekdayW(new Date(Date.UTC(d.getUTCFullYear(), 0, 1)), first) - 1;
      return Math.floor((dayOfYear(d) - 1 + jan1) / 7) + 1;
    }
    case "h":
    case "hour":
      return d.getUTCHours();
    case "n":
    case "minute":
      return d.getUTCMinutes();
    case "s":
    case "second":
      return d.getUTCSeconds();
    default:
      throw new ExprError(`DatePart: unknown interval "${interval}"`);
  }
}
var numericText = (v) => typeof v === "string" && v.trim() !== "" && Number.isFinite(Number(v.trim()));
function isDate(v, z) {
  if (v instanceof Date) return !Number.isNaN(v.getTime());
  if (typeof v !== "string") return false;
  return toDate2(v, z) != null;
}
function toNumber(fname, v, locale) {
  if (v == null) return null;
  if (typeof v === "boolean") return v ? 1 : 0;
  if (typeof v === "number") return v;
  const t = typeof v === "string" ? v.trim() : "";
  const n = t === "" ? NaN : Number.isFinite(Number(t)) ? Number(t) : parseNumber(t, locale);
  if (!Number.isFinite(n)) throw new ExprError(`${fname}: "${String(v).slice(0, 40)}" is not a number`);
  return n;
}
function vbVal(v) {
  if (v == null) return 0;
  if (typeof v === "number") return v;
  if (typeof v === "boolean") return v ? -1 : 0;
  const s = String(v).replace(/[ \t\r\n]/g, "");
  const radix2 = /^&([HhOo])([0-9A-Fa-f]*)/.exec(s);
  if (radix2) {
    const n = parseInt(radix2[2], radix2[1].toLowerCase() === "h" ? 16 : 8);
    return Number.isNaN(n) ? 0 : n;
  }
  const m = /^[+-]?(\d+\.?\d*|\.\d+)([eEdD][+-]?\d+)?/.exec(s);
  return m ? Number(m[0].replace(/[dD]/, "e")) : 0;
}
function vbBool(v) {
  if (v == null || v === "") return false;
  if (typeof v === "boolean") return v;
  if (typeof v === "number") return v !== 0;
  const t = String(v).trim().toLowerCase();
  if (t === "true" || t === "false") return t === "true";
  if (numericText(v)) return Number(v) !== 0;
  throw new ExprError(`CBool: "${String(v).slice(0, 40)}" is not True, False or a number`);
}
function toInt(fname, v, bits, locale) {
  const n = toNumber(fname, v, locale);
  if (n == null) return null;
  const f4 = Math.floor(n), diff = n - f4;
  const r = diff > 0.5 || diff === 0.5 && f4 % 2 !== 0 ? f4 + 1 : f4;
  const lim = 2 ** (bits - 1);
  if (r < -lim || r >= lim) throw new ExprError(`${fname}: ${n} is outside the Int${bits} range`);
  return r + 0;
}
function replaceText(s, a, b, start, count) {
  const st = start == null ? 1 : Math.trunc(Number(start));
  if (!(st >= 1)) throw new ExprError("Replace: the start must be 1 or more");
  if (st > 1) s = s.slice(st - 1);
  if (a === "") return s;
  let n = count == null ? -1 : Math.trunc(Number(count));
  if (n === 0) return s;
  let out = "", i = 0, len = 0;
  for (; ; ) {
    const j = s.indexOf(a, i);
    if (j < 0 || n === 0) break;
    len += j - i + b.length;
    capText("Replace", len + (s.length - j - a.length));
    out += s.slice(i, j) + b;
    i = j + a.length;
    if (n > 0) n--;
  }
  return out + s.slice(i);
}
function radix(v, base) {
  const t = roundHalfEven(Number(v), 0);
  if (!Number.isFinite(t)) throw new ExprError(`${base === 16 ? "Hex" : "Oct"}: ${v} is not a number`);
  const h = t >= 0 ? t.toString(base) : BigInt.asUintN(t >= -(2 ** 31) ? 32 : 64, BigInt(t)).toString(base);
  return h.toUpperCase();
}
var firstChar = (c) => c == null || c === "" ? " " : [...String(c)][0];
function pad(fname, s, width, c, left) {
  s = S(s);
  const w = Number(width) || 0;
  capText(fname, w);
  if (w <= s.length) return s;
  const fill = firstChar(c).repeat(w - s.length);
  return left ? fill + s : s + fill;
}
Object.assign(FUNCTIONS, {
  // text
  startswith: (ctx, s, p) => S(s).startsWith(S(p)),
  endswith: (ctx, s, p) => S(s).endsWith(S(p)),
  indexof: (ctx, s, sub, start) => S(s).indexOf(S(sub), Number(start) || 0),
  lastindexof: (ctx, s, sub, start) => start == null ? S(s).lastIndexOf(S(sub)) : S(s).lastIndexOf(S(sub), Number(start)),
  substring: (ctx, s, start, len) => {
    const a = Math.max(0, Number(start) || 0);
    return len == null ? S(s).slice(a) : S(s).slice(a, a + Math.max(0, Number(len) || 0));
  },
  padleft: (ctx, s, w, c) => pad("PadLeft", s, w, c, true),
  padright: (ctx, s, w, c) => pad("PadRight", s, w, c, false),
  split: (ctx, s, sep) => s == null ? [] : sep == null || sep === "" ? [S(s)] : S(s).split(S(sep)),
  chr: (ctx, c) => {
    const n = Number(c);
    return c == null || !Number.isInteger(n) || n < 0 || n > 1114111 ? null : String.fromCodePoint(n);
  },
  asc: (ctx, s) => s == null || s === "" ? null : S(s).codePointAt(0) ?? null,
  trimstart: (ctx, s) => S(s).trimStart(),
  trimend: (ctx, s) => S(s).trimEnd(),
  strreverse: (ctx, s) => {
    s = S(s);
    capText("StrReverse", s.length);
    return [...s].reverse().join("");
  },
  space: (ctx, n) => {
    n = Math.max(0, Number(n) || 0);
    capText("Space", n);
    return " ".repeat(n);
  },
  // VB StrDup(count, character): the first character of the text, count times (checked before it is built)
  // VB Hex/Oct: Int32 two's complement for a negative (Long when outside Int32)
  hex: (ctx, v) => v == null ? null : radix(v, 16),
  oct: (ctx, v) => v == null ? null : radix(v, 8),
  instrrev: (ctx, s, sub, start) => {
    s = S(s);
    const st = start == null || Number(start) === -1 ? s.length : Number(start);
    return s.lastIndexOf(S(sub), st - S(sub).length) + 1;
  },
  formatnumber: (ctx, v, d) => toText(v == null ? null : Number(v), `N${d == null || Number(d) < 0 ? 2 : Math.min(99, Number(d))}`, ctx),
  formatpercent: (ctx, v, d) => toText(v == null ? null : Number(v), `P${d == null || Number(d) < 0 ? 2 : Math.min(99, Number(d))}`, ctx),
  formatcurrency: (ctx, v, d) => toText(v == null ? null : Number(v), `C${d == null || Number(d) < 0 ? 2 : Math.min(99, Number(d))}`, ctx),
  lset: (ctx, s, n) => {
    n = Math.max(0, Math.trunc(Number(n)) || 0);
    capText("LSet", n);
    return S(s).slice(0, n).padEnd(n);
  },
  rset: (ctx, s, n) => {
    n = Math.max(0, Math.trunc(Number(n)) || 0);
    capText("RSet", n);
    return S(s).slice(0, n).padStart(n);
  },
  strdup: (ctx, n, c) => {
    n = Math.max(0, Math.trunc(Number(n)) || 0);
    capText("StrDup", n);
    return c == null || c === "" ? "" : [...S(c)][0].repeat(n);
  },
  // math
  sign: math1(Math.sign),
  log: (ctx, v, base) => v == null || v === "" ? null : fin(base == null ? Math.log(num(v)) : Math.log(num(v)) / Math.log(num(base))),
  log10: math1(Math.log10),
  exp: math1(Math.exp),
  truncate: math1(Math.trunc),
  fix: math1(Math.trunc),
  sin: math1(Math.sin),
  cos: math1(Math.cos),
  tan: math1(Math.tan),
  asin: math1(Math.asin),
  acos: math1(Math.acos),
  atan: math1(Math.atan),
  atan2: (ctx, y, x) => y == null || x == null ? null : fin(Math.atan2(num(y), num(x))),
  pi: () => Math.PI,
  e: () => Math.E,
  // dates
  datepart: (ctx, i, d, first) => datePart(i, d, first, ctx),
  weekday: (ctx, d, first) => {
    const w = dt(d, ctx);
    return w ? weekdayW(w, first) : null;
  },
  weekdayname: (ctx, n, abbr, first) => {
    n = Number(n);
    if (!Number.isInteger(n) || n < 1 || n > 7) return null;
    const d = new Date(Date.UTC(2e3, 0, 2 + n - 1 + ((Number(first) || 1) - 1)));
    return formatDate(d, truthy(abbr) ? "ddd" : "dddd", ctx.locale, "UTC");
  },
  quarter: (ctx, d) => {
    const w = dt(d, ctx);
    return w ? Math.floor(w.getUTCMonth() / 3) + 1 : null;
  },
  quartername: (ctx, d) => {
    const w = dt(d, ctx);
    return w ? `Q${Math.floor(w.getUTCMonth() / 3) + 1}` : null;
  },
  hour: (ctx, d) => dt(d, ctx)?.getUTCHours() ?? null,
  minute: (ctx, d) => dt(d, ctx)?.getUTCMinutes() ?? null,
  second: (ctx, d) => dt(d, ctx)?.getUTCSeconds() ?? null,
  addyears: (ctx, d, n) => addMonths(d, n == null ? null : 12 * Math.trunc(Number(n)), ctx),
  addmonths: (ctx, d, n) => addMonths(d, n, ctx),
  adddays: (ctx, d, n) => addUnits(d, n, 864e5, ctx),
  addhours: (ctx, d, n) => addUnits(d, n, 36e5, ctx),
  addminutes: (ctx, d, n) => addUnits(d, n, 6e4, ctx),
  addseconds: (ctx, d, n) => addUnits(d, n, 1e3, ctx),
  datevalue: (ctx, v) => {
    const d = toDate2(v, ctx);
    return d ? fromWall2(Math.floor(wall(d, ctx) / DAY) * DAY, ctx) : null;
  },
  timeserial: (ctx, h, m, s) => {
    const w = /* @__PURE__ */ new Date(0);
    w.setUTCFullYear(1, 0, 1);
    w.setUTCHours(Number(h) || 0, Number(m) || 0, Number(s) || 0, 0);
    return fromWall2(w.getTime(), ctx);
  },
  datestring: (ctx) => formatDate(FUNCTIONS.now(ctx), "MM-dd-yyyy", void 0, ctx.timeZone),
  // inspection
  // VB IsNumeric reads the culture's grouping, currency symbol and parentheses: "1,000" and "$5" are numbers
  // VB Information.IsNumeric: a number, a Boolean (True is -1), or text that reads as a number in the report's locale
  isnumeric: (ctx, v) => typeof v === "number" ? Number.isFinite(v) : typeof v === "boolean" || typeof v === "string" && (numericText(v) || !/\p{L}/u.test(v.replace(/e[+-]?\d+\s*$/i, "")) && Number.isFinite(parseNumber(v, ctx.locale))),
  // no letters: "12a" is not
  isdate: (ctx, v) => isDate(v, ctx),
  isarray: (ctx, v) => Array.isArray(v),
  // conversion
  tostring: (ctx, v, f4) => toText(v, f4, ctx),
  toint16: (ctx, v) => toInt("ToInt16", v, 16, ctx.locale),
  toint32: (ctx, v) => toInt("ToInt32", v, 32, ctx.locale),
  toint64: (ctx, v) => toInt("ToInt64", v, 64, ctx.locale),
  todouble: (ctx, v) => toNumber("ToDouble", v, ctx.locale),
  tosingle: (ctx, v) => toNumber("ToSingle", v, ctx.locale),
  todecimal: (ctx, v) => toNumber("ToDecimal", v, ctx.locale),
  toboolean: (ctx, v) => {
    if (v == null) return null;
    if (typeof v === "boolean") return v;
    if (typeof v === "number") return v !== 0;
    const t = String(v).trim().toLowerCase();
    if (t === "true" || t === "false") return t === "true";
    throw new ExprError(`ToBoolean: "${String(v).slice(0, 40)}" is not True or False`);
  },
  todatetime: (ctx, v) => {
    if (v == null) return null;
    const d = toDate2(v, ctx);
    if (!d) throw new ExprError(`ToDateTime: "${String(v).slice(0, 40)}" is not a date`);
    return d;
  }
});
var JASPER = /* @__PURE__ */ new WeakMap();
var astIds = /* @__PURE__ */ new WeakMap();
var astNext = 0;
var astId = (a) => {
  let i = astIds.get(a);
  if (i === void 0) {
    i = ++astNext;
    astIds.set(a, i);
  }
  return i;
};
function jasperValue(n, ctx) {
  const a = n.args;
  if (a.length < 6) throw new ExprError("JasperValue needs a data set, a calculation, an expression, a time, a reset and an end", n.p);
  const ds = String(evaluate(a[0], ctx)), at = String(evaluate(a[3], ctx)).toLowerCase();
  const [calc, incrS] = String(evaluate(a[1], ctx)).toLowerCase().split("@");
  const incr = incrS ? Math.trunc(Number(incrS)) || 0 : 0;
  const reset = Math.trunc(Number(evaluate(a[4], ctx))) || 0, end = Math.trunc(Number(evaluate(a[5], ctx)));
  const keys = a.slice(6);
  if (reset < 0 || reset > keys.length || end > keys.length || incr < 0 || incr > keys.length) throw new ExprError("JasperValue: no such group", n.p);
  const rows = ctx.dataSets?.[ds];
  if (!rows) throw new ExprError(`JasperValue: the data set "${ds}" does not exist`, n.p);
  let byRows = JASPER.get(rows);
  if (!byRows) {
    byRows = /* @__PURE__ */ new Map();
    JASPER.set(rows, byRows);
  }
  const kid = keys.map(astId).join(",");
  let info = byRows.get(`k|${kid}`);
  if (!info) {
    info = jasperIndex(rows, keys, ctx);
    byRows.set(`k|${kid}`, info);
  }
  const N = rows.length;
  const posOf = (r) => r ? info.pos.get(r) : void 0;
  let anchor;
  if (at === "detail") anchor = posOf(ctx.fields);
  else if (at === "header") anchor = posOf(ctx.aggRows?.[0]);
  else if (at === "footer") anchor = posOf(ctx.aggRows?.[ctx.aggRows.length - 1]);
  else if (at === "start") anchor = -1;
  else anchor = N - 1;
  if (anchor === void 0) return null;
  let b;
  if (end === 0) b = N - 1;
  else if (end > 0) b = N ? info.end[end][Math.max(0, anchor)] : -1;
  else b = at === "header" ? anchor - 1 : anchor;
  if (b < 0) return calc === "rows" ? 0 : null;
  if (end < 0 && at === "header" && reset > 0 && info.start[reset][anchor] > b) return calc === "rows" ? 0 : null;
  const vk = `v|${astId(a[2])}|${calc}|${reset}|${incr}|${kid}`;
  let vals = byRows.get(vk);
  if (!vals) {
    vals = jasperRun(rows, a[2], calc, reset ? info.start[reset] : null, incr ? info.end[incr] : null, ctx);
    byRows.set(vk, vals);
  }
  return vals[b];
}
function jasperIndex(rows, keys, ctx) {
  const pos = new Map(rows.map((r, i) => [r, i]));
  const kv = keys.map((k) => mapRows(rows, k, ctx).map((v) => v instanceof Date ? v.getTime() : v));
  const start = [null], endA = [null];
  for (let d = 1; d <= keys.length; d++) {
    const st = new Array(rows.length), en = new Array(rows.length);
    for (let i = 0; i < rows.length; i++) {
      let brk = i === 0;
      for (let k = 0; k < d && !brk; k++) if (kv[k][i] !== kv[k][i - 1]) brk = true;
      st[i] = brk ? i : st[i - 1];
    }
    for (let i = rows.length - 1; i >= 0; i--) en[i] = i === rows.length - 1 || st[i + 1] !== st[i] ? i : en[i + 1];
    start.push(st);
    endA.push(en);
  }
  return { pos, start, end: endA };
}
function jasperRun(rows, ast, calc, start, incrEnd, ctx) {
  const xs = calc === "rows" ? null : mapRows(rows, ast, ctx);
  const out = new Array(rows.length);
  let sum = null, cnt = 0, nn = 0, mn = null, mx = null, first, seen = null;
  for (let i = 0; i < rows.length; i++) {
    if (i === 0 || start && start[i] === i) {
      sum = null;
      cnt = 0;
      nn = 0;
      mn = null;
      mx = null;
      first = void 0;
      seen = /* @__PURE__ */ new Set();
    }
    const v = xs ? xs[i] : 1;
    if (incrEnd && incrEnd[i] !== i) {
      out[i] = i && !(start && start[i] === i) ? out[i - 1] : null;
      continue;
    }
    cnt++;
    if (v != null && v !== "") {
      nn++;
      if (calc === "sum" || calc === "average") sum = sum == null ? Number(v) : add(sum, Number(v), ctx);
      if (mn == null || cmpVal(v, mn) < 0) mn = v;
      if (mx == null || cmpVal(v, mx) > 0) mx = v;
      seen.add(v instanceof Date ? v.getTime() : v);
    }
    if (first === void 0) first = v ?? null;
    out[i] = calc === "sum" ? sum : calc === "count" ? nn : calc === "rows" ? cnt : calc === "average" ? nn ? sum / nn : null : calc === "lowest" ? mn : calc === "highest" ? mx : calc === "distinctcount" ? seen.size : calc === "first" ? first : null;
  }
  return out;
}
var CONSTANTS = { pi: Math.PI, e: Math.E };
var FUNCTION_NAMES = [
  "Sum",
  "Avg",
  "Count",
  "CountDistinct",
  "CountRows",
  "Min",
  "Max",
  "First",
  "Last",
  "RunningValue",
  "RowNumber",
  "Median",
  "Mode",
  "Rank",
  "StDev",
  "StDevP",
  "Var",
  "VarP",
  "DistinctSum",
  "AggregateIf",
  "IIF",
  "Switch",
  "IsNull",
  "Coalesce",
  "Lookup",
  "LookupSet",
  "Previous",
  "GroupIndex",
  "Level",
  "Join",
  "Contains",
  "InList",
  ...[
    "Format",
    "Upper",
    "Lower",
    "Left",
    "Right",
    "Mid",
    "Len",
    "Trim",
    "Replace",
    "InStr",
    "CStr",
    "CDbl",
    "CInt",
    "CDate",
    "CBool",
    "Round",
    "RoundHalfAway",
    "Abs",
    "Floor",
    "Ceiling",
    "Int",
    "Pow",
    "Sqrt",
    "Now",
    "Today",
    "DateAdd",
    "DateDiff",
    "DateSerial",
    "Year",
    "Month",
    "Day",
    "MonthName"
  ],
  "StartsWith",
  "EndsWith",
  "IndexOf",
  "LastIndexOf",
  "Substring",
  "PadLeft",
  "PadRight",
  "Split",
  "Chr",
  "Asc",
  "TrimStart",
  "TrimEnd",
  "StrReverse",
  "Space",
  "StrDup",
  "Hex",
  "Oct",
  "InStrRev",
  "FormatNumber",
  "FormatPercent",
  "FormatCurrency",
  "LSet",
  "RSet",
  "JavaStr",
  "JsStr",
  "JavaFormat",
  "LCase",
  "UCase",
  "Sign",
  "Log",
  "Log10",
  "Exp",
  "Truncate",
  "Fix",
  "Sin",
  "Cos",
  "Tan",
  "Asin",
  "Acos",
  "Atan",
  "Atan2",
  "PI",
  "E",
  "DatePart",
  "Weekday",
  "WeekdayName",
  "Quarter",
  "QuarterName",
  "Hour",
  "Minute",
  "Second",
  "AddYears",
  "AddMonths",
  "AddDays",
  "AddHours",
  "AddMinutes",
  "AddSeconds",
  "DateValue",
  "TimeSerial",
  "DateString",
  "IsNumeric",
  "IsDate",
  "IsArray",
  "Choose",
  "ToString",
  "ToInt16",
  "ToInt32",
  "ToInt64",
  "ToDouble",
  "ToSingle",
  "ToDecimal",
  "ToBoolean",
  "ToDateTime"
];
function previous(n, ctx) {
  const args = n.args;
  if (!args.length) throw new ExprError("Previous needs an expression: Previous(Fields.amount)", n.p);
  let sc;
  if (args.length > 1) {
    sc = ctx.scopes?.[evaluate(args[1], ctx)];
    if (!sc) throw new ExprError("Previous: unknown scope", n.p);
  }
  let rows = null;
  if (ctx.aggIndex != null) {
    const run = (sc || ctx.region)?.run;
    if (run) rows = run.length > 1 ? [run[run.length - 2]] : null;
    else if (ctx.aggIndex > 0) rows = [ctx.aggRows[ctx.aggIndex - 1]];
  } else rows = (sc || ctx.group || ctx.region)?.prevRows || null;
  if (!rows) return null;
  return evaluate(args[0], Object.assign({}, ctx, { fields: rows[0], aggRows: rows, aggIndex: void 0 }));
}
var RANKS = /* @__PURE__ */ new WeakMap();
function rank(n, ctx) {
  const args = n.args;
  if (!args.length) throw new ExprError('Rank needs an expression: Rank(Fields.amount[, "Scope"[, descending]])', n.p);
  const rows = args.length > 1 && evaluate(args[1], ctx) != null ? scopeRows(args, 1, ctx, n.name) : ctx.region?.rows || ctx.aggRows || (ctx.fields ? [ctx.fields] : []);
  const d = args.length > 2 ? evaluate(args[2], ctx) : true;
  const desc = typeof d === "string" ? !/^asc/i.test(d.trim()) : d == null || truthy(d);
  const x = evaluate(args[0], ctx);
  if (x == null || x === "") return null;
  if (ctx.aggIndex == null && ctx.group?.siblings && ctx.group.siblings.length > 1) {
    let byCall2 = RANKS.get(ctx.group.siblings);
    if (!byCall2) RANKS.set(ctx.group.siblings, byCall2 = /* @__PURE__ */ new Map());
    let gv = byCall2.get(n);
    if (!gv) {
      gv = [];
      for (const rs of ctx.group.siblings) {
        const v = evaluate(args[0], Object.assign({}, ctx, { fields: rs[0], aggRows: rs, aggIndex: void 0 }));
        if (v != null && v !== "") gv.push(v);
      }
      gv.sort((p, q) => sortCompare(p, q, ctx));
      byCall2.set(n, gv);
    }
    const lt = gv.filter((v) => sortCompare(v, x, ctx) < 0).length, gt = gv.filter((v) => sortCompare(v, x, ctx) > 0).length;
    return desc ? gt + 1 : lt + 1;
  }
  let byCall = RANKS.get(rows);
  if (!byCall) RANKS.set(rows, byCall = /* @__PURE__ */ new Map());
  let hit = pureRows(args[0]) ? byCall.get(n) : null;
  if (!hit || hit.len !== rows.length) {
    const c = Object.assign({}, ctx, { aggIndex: 0 });
    const vals2 = [];
    for (const r of rows) {
      c.fields = r;
      c.aggRows = [r];
      const v = evaluate(args[0], c);
      if (v != null && v !== "") vals2.push(v);
    }
    hit = { len: rows.length, vals: vals2.sort((p, q) => sortCompare(p, q, ctx)) };
    if (pureRows(args[0])) byCall.set(n, hit);
  }
  const vals = hit.vals;
  const bound = (strict) => {
    let lo = 0, hi = vals.length;
    while (lo < hi) {
      const m = lo + hi >> 1;
      const c = sortCompare(vals[m], x, ctx);
      if (c < 0 || !strict && c === 0) lo = m + 1;
      else hi = m;
    }
    return lo;
  };
  return desc ? vals.length - bound(false) + 1 : bound(true) + 1;
}
function call(n, ctx) {
  const name = n.name.toLowerCase();
  const args = n.args;
  if (n.obj) return callCustom(n, name, ctx);
  if (name === "iif") {
    if (args.length !== 3) throw new ExprError("IIF needs 3 arguments: IIF(test, ifTrue, ifFalse)", n.p);
    return truthy(evaluate(args[0], ctx)) ? evaluate(args[1], ctx) : evaluate(args[2], ctx);
  }
  if (name === "choose") {
    if (!args.length) throw new ExprError('Choose needs an index and choices: Choose(2, "a", "b")', n.p);
    const i = Number(evaluate(args[0], ctx));
    return Number.isInteger(i) && i >= 1 && i < args.length ? evaluate(args[i], ctx) : null;
  }
  if (name === "switch") {
    for (let i = 0; i + 1 < args.length; i += 2) if (truthy(evaluate(args[i], ctx))) return evaluate(args[i + 1], ctx);
    return null;
  }
  if (Object.hasOwn(AGG, name)) {
    if (!args.length) throw new ExprError(`${n.name} needs an expression, e.g. ${n.name}(Fields.amount)`, n.p);
    const rows = scopeRows(args, 1, ctx, n.name);
    const cache2 = ctx.aggCache;
    if (cache2 && rows.length > 1 && pureRows(args[0])) {
      let m = cache2.get(rows);
      if (!m) cache2.set(rows, m = /* @__PURE__ */ new Map());
      const hit = m.get(n);
      if (hit && hit.len === rows.length) return hit.v;
      const v = AGG[name](aggValues(rows, args[0], ctx), ctx);
      m.set(n, { len: rows.length, v });
      return v;
    }
    return AGG[name](aggValues(rows, args[0], ctx), ctx);
  }
  if (name === "distinctsum") {
    if (args.length < 2) throw new ExprError("DistinctSum needs 2 arguments: DistinctSum(distinct, value)", n.p);
    const rows = scopeRows(args, 2, ctx, n.name);
    const keys = mapRows(rows, args[0], ctx);
    const seen = /* @__PURE__ */ new Set(), pick = [];
    for (let i = 0; i < rows.length; i++) {
      const k = keys[i] instanceof Date ? keys[i].getTime() : keys[i];
      if (!seen.has(k)) {
        seen.add(k);
        pick.push(rows[i]);
      }
    }
    return AGG.sum(aggValues(pick, args[1], ctx), ctx);
  }
  if (name === "aggregateif") {
    if (args.length < 3) throw new ExprError('AggregateIf needs 3 arguments: AggregateIf(condition, "Sum", expr)', n.p);
    const fn = String(evaluate(args[1], ctx)).toLowerCase();
    if (!Object.hasOwn(AGG, fn)) throw new ExprError(`AggregateIf: unknown aggregate "${fn}"`, n.p);
    const rows = scopeRows(args, 3, ctx, n.name);
    const ok = mapRows(rows, args[0], ctx);
    return AGG[fn](aggValues(rows.filter((_, i) => truthy(ok[i])), args[2], ctx), ctx);
  }
  if (name === "countrows") return scopeRows(args, 0, ctx, n.name).length;
  if (name === "rownumber") {
    if (args.length && evaluate(args[0], ctx) != null) {
      const sc = ctx.scopes?.[evaluate(args[0], ctx)];
      if (!sc) throw new ExprError("RowNumber: unknown scope", n.p);
      return sc.index + 1 + (ctx.pendingRows?.length || 0);
    }
    if (ctx.rowNumber != null) return ctx.rowNumber;
    return ctx.region?.run ? ctx.region.index + 1 + (ctx.pendingRows?.length || 0) : 1;
  }
  if (name === "runningvalue") {
    if (args.length < 2) throw new ExprError('RunningValue needs 2 arguments: RunningValue(expr, "Sum")', n.p);
    const fn = String(evaluate(args[1], ctx)).toLowerCase();
    if (!Object.hasOwn(AGG, fn)) throw new ExprError(`RunningValue: unknown function "${fn}"`, n.p);
    let rows;
    const noScope = args.length <= 2 || evaluate(args[2], ctx) == null;
    if (noScope && ctx.region?.run && !ctx.runningRows) {
      const sc = ctx.region;
      rows = sc.run;
      const pend = ctx.pendingRows;
      if (pend?.length) return AGG[fn](rowLocal(args[0]) ? prefixValues(rows, rows.length, args[0], ctx).concat(mapRows(pend, args[0], ctx)) : mapRows(rows.concat(pend), args[0], ctx), ctx);
      if (rowLocal(args[0])) return fn === "sum" ? runningSum(rows, rows.length, args[0], ctx) : AGG[fn](prefixValues(rows, rows.length, args[0], ctx), ctx);
      return AGG[fn](mapRows(rows, args[0], ctx), ctx);
    }
    if (args.length > 2 && !noScope) {
      const sn = evaluate(args[2], ctx);
      const sc = ctx.scopes?.[sn];
      if (!sc) {
        const gr = groupInstanceRows(sn, ctx);
        if (!gr) throw new ExprError("RunningValue: unknown scope", n.p);
        return AGG[fn](mapRows(gr.slice(0, gr.indexOf(ctx.fields) + 1), args[0], ctx), ctx);
      }
      rows = sc.run || sc.rows.slice(0, sc.index + 1);
      const pend = ctx.pendingRows;
      if (pend?.length && sc.run) {
        if (fn === "sum" && rowLocal(args[0])) return add(runningSum(rows, rows.length, args[0], ctx), AGG.sum(mapRows(pend, args[0], ctx), ctx), ctx);
        return AGG[fn](rowLocal(args[0]) ? prefixValues(rows, rows.length, args[0], ctx).concat(mapRows(pend, args[0], ctx)) : mapRows(rows.concat(pend), args[0], ctx), ctx);
      }
    } else if (ctx.runningRows) rows = ctx.runningRows;
    else if (ctx.aggRows && ctx.aggIndex != null) rows = ctx.aggRows.slice(0, ctx.aggIndex + 1);
    else rows = ctx.fields ? [ctx.fields] : [];
    if (args.length > 2 || !ctx.runningRows && ctx.aggRows && ctx.aggIndex != null) {
      const base = args.length > 2 ? rows : ctx.aggRows;
      if (rowLocal(args[0])) return fn === "sum" ? runningSum(base, rows.length, args[0], ctx) : AGG[fn](prefixValues(base, rows.length, args[0], ctx), ctx);
    }
    return AGG[fn](mapRows(rows, args[0], ctx), ctx);
  }
  if (name === "rank") return rank(n, ctx);
  if (name === "jaspervalue") return jasperValue(n, ctx);
  if (name === "previous") return previous(n, ctx);
  if (name === "groupindex") {
    const sc = args.length ? ctx.scopes?.[evaluate(args[0], ctx)] : ctx.group;
    if (args.length && !sc) throw new ExprError("GroupIndex: unknown scope", n.p);
    return sc?.number ?? null;
  }
  if (name === "level") {
    if (args.length) {
      const sc = ctx.scopes?.[evaluate(args[0], ctx)];
      if (!sc) throw new ExprError("Level: unknown scope", n.p);
      return sc.level ?? 0;
    }
    return ctx.level ?? 0;
  }
  if (name === "lookupset") {
    if (args.length !== 4) throw new ExprError('LookupSet needs 4 arguments: LookupSet(source, destination, result, "DataSet")', n.p);
    const key = evaluate(args[0], ctx);
    const setName = evaluate(args[3], ctx);
    const rows = ctx.dataSets[setName];
    if (!rows) throw new ExprError(`LookupSet: the data set "${setName}" does not exist`, n.p);
    const c = Object.assign({}, ctx), out = [];
    for (const r of rows) {
      c.fields = r;
      if (cmpVal(evaluate(args[1], c), key) === 0) out.push(evaluate(args[2], c));
    }
    return out;
  }
  if (name === "lookup") {
    if (args.length !== 4) throw new ExprError('Lookup needs 4 arguments: Lookup(source, destination, result, "DataSet")', n.p);
    const key = evaluate(args[0], ctx);
    const setName = evaluate(args[3], ctx);
    const rows = ctx.dataSets[setName];
    if (!rows) throw new ExprError(`Lookup: the data set "${setName}" does not exist`, n.p);
    const c = Object.assign({}, ctx);
    for (const r of rows) {
      c.fields = r;
      if (cmpVal(evaluate(args[1], c), key) === 0) return evaluate(args[2], c);
    }
    return null;
  }
  const f4 = Object.hasOwn(FUNCTIONS, name) ? FUNCTIONS[name] : void 0;
  if (f4) return f4(ctx, ...args.map((a) => evaluate(a, ctx)));
  return callCustom(n, name, ctx);
}
var MAX_FN_DEPTH = 32;
var MAX_FN_CALLS = 1e6;
var MAX_FUNCTIONS = 200;
var MAX_FN_PARAMS = 32;
var IDENT = /^[A-Za-z_][A-Za-z0-9_]*$/;
var RESERVED = /* @__PURE__ */ new Set([
  "rank",
  "jaspervalue",
  "iif",
  "switch",
  "choose",
  "lookup",
  "lookupset",
  "previous",
  "groupindex",
  "level",
  "countrows",
  "rownumber",
  "runningvalue",
  "distinctsum",
  "aggregateif",
  "code",
  "fields",
  "parameters",
  "globals",
  "parent",
  "and",
  "or",
  "not",
  "true",
  "false",
  "null",
  "nothing"
]);
var builtin = (lower) => RESERVED.has(lower) || Object.hasOwn(FUNCTIONS, lower) || Object.hasOwn(AGG, lower) || Object.hasOwn(CONSTANTS, lower);
function functionTable(def, count = { n: 0 }) {
  const byName3 = /* @__PURE__ */ new Map();
  for (const f4 of Array.isArray(def?.functions) ? def.functions.slice(0, MAX_FUNCTIONS) : []) {
    if (f4 && typeof f4.name === "string") byName3.set(f4.name.toLowerCase(), f4);
  }
  return { byName: byName3, count };
}
function callIssues(ast, custom, suggest) {
  const out = [], seen = /* @__PURE__ */ new Set();
  const say = (key, msg) => {
    if (!seen.has(key)) {
      seen.add(key);
      out.push(msg);
    }
  };
  const known = () => [...FUNCTION_NAMES, ...Object.keys(FUNCTIONS)];
  const walk = (n, depth) => {
    if (!n || typeof n !== "object" || depth > 200) return;
    if (Array.isArray(n)) {
      for (const x of n) walk(x, depth + 1);
      return;
    }
    if (n.type === "call") {
      const lower = String(n.name).toLowerCase();
      const isCode = n.obj?.type === "id" && n.obj.name.toLowerCase() === "code";
      const isString = n.obj?.type === "id" && n.obj.name.toLowerCase() === "string" && lower === "format";
      if (!n.obj && !builtin(lower) && !custom.has(lower)) {
        const g = suggest?.(n.name, known());
        say(lower, `Unknown function "${n.name}"${g ? ` (did you mean "${g}"?)` : ""}`);
      } else if (isCode && !custom.has(lower)) say(`code.${lower}`, `The report has no function "${n.name}" (Code.${n.name})`);
      else if (n.obj && !isCode && !isString && !METHODS[lower]) say(`.${lower}`, `"${n.name}(…)" after "." is not supported`);
    }
    for (const k in n) if (k !== "p" && n[k] && typeof n[k] === "object") walk(n[k], depth + 1);
  };
  walk(ast, 0);
  return out;
}
function checkFunctions(list) {
  const errors = [];
  if (list == null) return errors;
  if (!Array.isArray(list)) return ['"functions" must be a list'];
  if (list.length > MAX_FUNCTIONS) errors.push(`A report can have at most ${MAX_FUNCTIONS} functions`);
  const seen = /* @__PURE__ */ new Set();
  for (const f4 of list.slice(0, MAX_FUNCTIONS)) {
    const name = String(f4?.name ?? "");
    const label = `Function "${name.slice(0, 40)}"`;
    if (!IDENT.test(name)) {
      errors.push(`${label}: the name must start with a letter or _ and hold only letters, digits and _`);
      continue;
    }
    const lower = name.toLowerCase();
    if (builtin(lower)) errors.push(`${label}: a built-in function or name is called that`);
    if (seen.has(lower)) errors.push(`${label}: two functions have this name`);
    seen.add(lower);
    const ps = f4.params ?? [];
    if (!Array.isArray(ps) || ps.length > MAX_FN_PARAMS) {
      errors.push(`${label}: "params" must be a list of at most ${MAX_FN_PARAMS} names`);
      continue;
    }
    const pset = /* @__PURE__ */ new Set();
    for (const p of ps) {
      const pl = String(p).toLowerCase();
      if (!IDENT.test(String(p)) || RESERVED.has(pl) || pl in CONSTANTS) errors.push(`${label}: "${String(p).slice(0, 40)}" cannot be a parameter name`);
      else if (pset.has(pl)) errors.push(`${label}: two parameters are called "${p}"`);
      pset.add(pl);
    }
    if (typeof f4.body !== "string" || !f4.body.replace(/^=/, "").trim()) {
      errors.push(`${label}: the body is empty`);
      continue;
    }
    try {
      compile(f4.body.replace(/^=/, ""));
    } catch (e) {
      errors.push(`${label}: ${e.message}`);
    }
  }
  return errors;
}
var METHODS = {
  padleft: "padleft",
  padright: "padright",
  substring: "substring",
  toupper: "ucase",
  toupperinvariant: "ucase",
  tolower: "lcase",
  tolowerinvariant: "lcase",
  trim: "trim",
  trimstart: "trimstart",
  trimend: "trimend",
  startswith: "startswith",
  endswith: "endswith",
  indexof: "indexof",
  lastindexof: "lastindexof",
  contains: "contains",
  replace: "replace",
  split: "split",
  tostring: "tostring"
};
function netFormat(f4, args, ctx) {
  let out = "";
  for (let i = 0; i < f4.length; i++) {
    const c = f4[i];
    if (c === "{" && f4[i + 1] === "{") {
      out += "{";
      i++;
      continue;
    }
    if (c === "}" && f4[i + 1] === "}") {
      out += "}";
      i++;
      continue;
    }
    if (c === "}") throw new ExprError('String.Format: a "}" without its "{"');
    if (c !== "{") {
      out += c;
      continue;
    }
    const e = f4.indexOf("}", i);
    if (e < 0) throw new ExprError('String.Format: a "{" without its "}"');
    const m = /^\s*(\d{1,3})\s*(?:,\s*(-?\d{1,4}))?\s*(?::([^}]*))?$/.exec(f4.slice(i + 1, e));
    if (!m) throw new ExprError(`String.Format: "{${f4.slice(i + 1, e).slice(0, 20)}}" is not a placeholder`);
    const k = Number(m[1]);
    if (k >= args.length) throw new ExprError(`String.Format: {${k}} has no argument`);
    let t = toText(args[k], m[3] || null, ctx);
    const w = m[2] ? Number(m[2]) : 0;
    if (Math.abs(w) > t.length) t = w < 0 ? t.padEnd(-w) : t.padStart(w);
    capText("String.Format", out.length + t.length + f4.length - e);
    out += t;
    i = e;
  }
  return out;
}
function callCustom(n, name, ctx) {
  if (n.obj && n.obj.type === "id" && n.obj.name.toLowerCase() === "string" && name === "format") {
    if (!n.args.length) throw new ExprError("String.Format needs a format", n.p);
    const [f5, ...rest] = n.args.map((a) => evaluate(a, ctx));
    return netFormat(S(f5), rest, ctx);
  }
  const viaValue = n.obj && !(n.obj.type === "id" && n.obj.name.toLowerCase() === "code");
  if (viaValue && Object.hasOwn(METHODS, name)) {
    return FUNCTIONS[METHODS[name]](ctx, evaluate(n.obj, ctx), ...n.args.map((a) => evaluate(a, ctx)));
  }
  if (viaValue && n.name in Object.prototype) throw new ExprError(`The value has no member ${n.name}`, n.p);
  const viaCode = !!n.obj;
  if (viaCode && !(n.obj.type === "id" && n.obj.name.toLowerCase() === "code")) throw new ExprError(`"${n.name}(…)" after "." is not supported; report functions are called as Code.${n.name}(…)`, n.p);
  const table = ctx.functions;
  const f4 = table?.byName.get(name);
  if (!f4 || !viaCode && builtin(name)) throw new ExprError(viaCode ? `The report has no function "${n.name}"` : `Unknown function "${n.name}"`, n.p);
  const params = Array.isArray(f4.params) ? f4.params : [];
  if (n.args.length !== params.length) throw new ExprError(`${f4.name} needs ${params.length} argument${params.length === 1 ? "" : "s"}`, n.p);
  const depth = (ctx.fnDepth || 0) + 1;
  if (depth > MAX_FN_DEPTH) throw new ExprError(`${f4.name}: functions call each other more than ${MAX_FN_DEPTH} deep`, n.p);
  if (++table.count.n > MAX_FN_CALLS) throw new ExprError(`Report functions were called more than 1,000,000 times in this render`, n.p);
  const locals = /* @__PURE__ */ Object.create(null);
  for (let i = 0; i < params.length; i++) locals[String(params[i]).toLowerCase()] = evaluate(n.args[i], ctx);
  return evaluate(compile(String(f4.body).replace(/^=/, "")), Object.assign({}, ctx, { locals, fnDepth: depth }));
}

// src/engine/data/guard.js
var FETCH_DEFAULTS = { timeoutMs: 3e4, maxBytes: 64 * 1048576, hops: 5 };
var V4 = [
  ["0.0.0.0", 8],
  ["10.0.0.0", 8],
  ["100.64.0.0", 10],
  ["127.0.0.0", 8],
  ["169.254.0.0", 16],
  ["172.16.0.0", 12],
  ["192.0.0.0", 24],
  ["192.0.2.0", 24],
  ["192.168.0.0", 16],
  ["198.18.0.0", 15],
  ["198.51.100.0", 24],
  ["203.0.113.0", 24],
  ["224.0.0.0", 3]
].map(([a, p]) => [v4num(String(a)), Number(p)]);
function v4num(ip) {
  return ip.split(".").reduce((n, x) => n * 256 + Number(x), 0);
}
function privateV4(ip) {
  const n = v4num(ip);
  return V4.some(([a, p]) => Math.floor(n / 2 ** (32 - p)) === Math.floor(a / 2 ** (32 - p)));
}
function groups6(ip) {
  const [h, t = ""] = ip.split("::");
  const a = h ? h.split(":") : [], b = t ? t.split(":") : [];
  if (b.length && b[b.length - 1].includes(".")) {
    const q = b.pop().split(".").map(Number);
    b.push((q[0] << 8 | q[1]).toString(16), (q[2] << 8 | q[3]).toString(16));
  }
  return [...a, ...Array(Math.max(0, 8 - a.length - b.length)).fill("0"), ...b].map((x) => parseInt(x, 16) || 0);
}
function privateV6(ip) {
  const g = groups6(ip);
  const v4 = () => `${g[6] >> 8}.${g[6] & 255}.${g[7] >> 8}.${g[7] & 255}`;
  if (g.slice(0, 6).every((x) => x === 0)) return true;
  if (g.slice(0, 5).every((x) => x === 0) && g[5] === 65535) return privateV4(v4());
  if (g[0] === 100 && g[1] === 65435) return g[2] === 1 || privateV4(v4());
  if (g[0] === 8194 || g[0] === 8193 && g[1] === 0) return true;
  if ((g[0] & 65024) === 64512 || (g[0] & 65472) === 65152 || (g[0] & 65472) === 65216 || (g[0] & 65280) === 65280) return true;
  return false;
}
function privateHost(host) {
  const h = host.replace(/^\[|\]$/g, "").toLowerCase();
  if (h.includes(":")) return privateV6(h);
  if (/^\d+\.\d+\.\d+\.\d+$/.test(h)) return privateV4(h);
  return h === "localhost" || h.endsWith(".localhost") || h.endsWith(".local") || h.endsWith(".internal");
}
var refuse = (host) => Object.assign(new Error(`"${host}" is a private or local address; a data source may not reach it (pass allowHosts: ["${host}"] to render to allow it)`), { status: 403, code: "EPRIVATE" });
function nodeMod(name) {
  const p = (
    /** @type {any} */
    globalThis.process
  );
  if (!p?.versions?.node) return null;
  if (!p.getBuiltinModule) throw Object.assign(new Error("The engine's fetch guard needs Node 20.16 or later (process.getBuiltinModule); or pass your own fetch to render"), { status: 500 });
  return p.getBuiltinModule(name);
}
var inNode = () => !!/** @type {any} */
globalThis.process?.versions?.node;
var addrHost = (a) => a.family === 6 || String(a.address).includes(":") ? `[${a.address}]` : String(a.address);
function checkUrl(input, allow) {
  let u;
  try {
    u = new URL(input);
  } catch {
    throw Object.assign(new Error(`Not a URL: ${String(input).slice(0, 200)}`), { status: 400 });
  }
  if (u.protocol !== "http:" && u.protocol !== "https:") throw Object.assign(new Error(`Only http and https URLs can be fetched, not ${u.protocol}`), { status: 400 });
  if (u.username || u.password) throw Object.assign(new Error("A user name or password in a data URL is not allowed"), { status: 400 });
  const host = u.hostname.replace(/^\[|\]$/g, "").toLowerCase();
  if (!host) throw Object.assign(new Error("A data URL needs a host"), { status: 400 });
  if (allow.includes(host)) return u;
  let bad = true;
  try {
    bad = privateHost(u.hostname);
  } catch {
  }
  if (bad) throw refuse(host);
  return u;
}
function nodeRequest(url, init, trusted) {
  const http = nodeMod("node:http"), https = nodeMod("node:https"), dns = nodeMod("node:dns"), stream = nodeMod("node:stream");
  const lookup = (name, o, cb) => dns.lookup(name, { ...o, all: true }, (err, list) => {
    if (err || !Array.isArray(list) || !list.length) return cb(err || refuse(name));
    let bad = true;
    try {
      bad = !trusted && list.some((a) => privateHost(addrHost(a)));
    } catch {
    }
    if (bad) return cb(refuse(name));
    return o.all ? cb(null, list) : cb(null, list[0].address, list[0].family);
  });
  const headers = Object.fromEntries(new Headers(init.headers || {}));
  headers["accept-encoding"] = "identity";
  return new Promise((resolve, reject) => {
    const req2 = (url.protocol === "https:" ? https : http).request(url, { method: init.method || "GET", headers, lookup, signal: init.signal }, (res) => {
      const pairs = [];
      for (let i = 0; i < res.rawHeaders.length; i += 2) pairs.push([res.rawHeaders[i], res.rawHeaders[i + 1]]);
      const none = [101, 204, 205, 304].includes(res.statusCode) || (init.method || "GET").toUpperCase() === "HEAD";
      if (none) res.resume();
      const enc = String(res.headers["content-encoding"] || "").trim().toLowerCase();
      let body = res, decoded = false;
      if (!none && enc && enc !== "identity") {
        const zlib = nodeMod("node:zlib");
        const dec2 = enc === "gzip" || enc === "x-gzip" ? zlib.createGunzip() : enc === "deflate" ? zlib.createInflate() : enc === "br" ? zlib.createBrotliDecompress() : null;
        if (!dec2) {
          res.resume();
          return reject(Object.assign(new Error(`the response is encoded as "${enc}", which the data fetch cannot decode`), { status: 415 }));
        }
        body = stream.pipeline(res, dec2, () => {
        });
        decoded = true;
      }
      const kept = decoded ? pairs.filter(([k]) => !/^(content-encoding|content-length)$/i.test(k)) : pairs;
      resolve(new Response(none ? null : stream.Readable.toWeb(body), { status: res.statusCode, statusText: res.statusMessage, headers: (
        /** @type {any} */
        kept
      ) }));
    });
    req2.on("error", reject);
    req2.end(init.body ?? void 0);
  });
}
var CROSS_ORIGIN_KEEP = /* @__PURE__ */ new Set(["accept", "accept-language", "content-type"]);
function redirectRequest(from, to, req2, status) {
  if (from.protocol === "https:" && to.protocol !== "https:") throw Object.assign(new Error(`${from.host} redirects from https to http; not followed`), { status: 403 });
  const headers = new Headers(req2.headers || {});
  if (to.origin !== from.origin) {
    for (const k of [...headers.keys()]) if (!CROSS_ORIGIN_KEEP.has(k)) headers.delete(k);
  }
  const get = status === 303 || (status === 301 || status === 302) && (req2.method || "GET").toUpperCase() !== "GET";
  return get ? { ...req2, method: "GET", body: void 0, headers } : { ...req2, headers };
}
function guardedFetch(opt, base) {
  const allow = (opt.allowHosts || []).map((h) => String(h).toLowerCase().replace(/^\[|\]$/g, ""));
  const node = !opt.viaBase && inNode();
  return (
    /** @type {any} */
    (async (input, init = {}) => {
      let url = checkUrl(String(input), allow);
      let req2 = { ...init };
      for (let hop = 0; ; hop++) {
        const trusted = allow.includes(url.hostname.replace(/^\[|\]$/g, "").toLowerCase());
        const res = node ? await nodeRequest(url, req2, trusted) : await base(url.href, { ...req2, redirect: "manual" });
        if (res.type === "opaqueredirect") throw new Error(`${url.host} redirects; a redirect cannot be checked here (pass your own fetch to render)`);
        const loc = res.status >= 300 && res.status < 400 ? res.headers.get("location") : null;
        if (!loc) return res;
        await res.body?.cancel().catch(() => {
        });
        if (hop >= FETCH_DEFAULTS.hops) throw new Error(`Too many redirects from ${url.host}`);
        const next = checkUrl(new URL(loc, url).href, allow);
        req2 = redirectRequest(url, next, req2, res.status);
        url = next;
      }
    })
  );
}
function boundedFetch(f4, opt) {
  const ms0 = Number(opt.fetchTimeoutMs) > 0 ? Number(opt.fetchTimeoutMs) : FETCH_DEFAULTS.timeoutMs;
  const max = Number(opt.maxFetchBytes) > 0 ? Number(opt.maxFetchBytes) : FETCH_DEFAULTS.maxBytes;
  return (
    /** @type {any} */
    (async (input, init = {}) => {
      const ms = Math.max(1, Math.min(ms0, opt.deadline ? opt.deadline - Date.now() : Infinity));
      const ctl = new AbortController();
      const timer = setTimeout(() => ctl.abort(Object.assign(new Error(`The data request took longer than ${Math.round(ms)} ms`), { status: 504 })), ms);
      const signal = init.signal ? anySignal([init.signal, ctl.signal]) : ctl.signal;
      let res;
      const stop = new Promise((_, rej) => signal.addEventListener("abort", () => rej(signal.reason), { once: true }));
      stop.catch(() => {
      });
      try {
        res = await Promise.race([f4(input, { ...init, signal }), stop]);
      } catch (e) {
        clearTimeout(timer);
        throw ctl.signal.aborted ? ctl.signal.reason : fetchFailure(e, input);
      }
      if (!res.body || /** @type {any} */
      init.pwStream) {
        clearTimeout(timer);
        return res;
      }
      let n = 0;
      const reader = res.body.getReader();
      const body = new ReadableStream({
        async pull(c) {
          try {
            const { done, value } = await reader.read();
            if (done) {
              clearTimeout(timer);
              c.close();
              return;
            }
            n += value.byteLength;
            if (n > max) {
              clearTimeout(timer);
              reader.cancel().catch(() => {
              });
              c.error(Object.assign(new Error(`The data response is larger than ${Math.round(max / 1048576)} MB (maxFetchBytes)`), { status: 413 }));
              return;
            }
            c.enqueue(value);
          } catch (e) {
            clearTimeout(timer);
            c.error(ctl.signal.aborted ? ctl.signal.reason : e);
          }
        },
        cancel(r) {
          clearTimeout(timer);
          return reader.cancel(r);
        }
      });
      return new Response(body, { status: res.status, statusText: res.statusText, headers: res.headers });
    })
  );
}
var CAUSES = {
  ENOTFOUND: "the host name did not resolve",
  EAI_AGAIN: "DNS lookup timed out",
  ECONNREFUSED: "connection refused",
  ECONNRESET: "connection reset",
  EPIPE: "connection closed",
  UND_ERR_SOCKET: "connection closed early",
  ETIMEDOUT: "timed out",
  UND_ERR_CONNECT_TIMEOUT: "connect timed out",
  EPROTO: "TLS error",
  ERR_TLS_CERT_ALTNAME_INVALID: "TLS certificate does not match the host",
  DEPTH_ZERO_SELF_SIGNED_CERT: "TLS certificate is self-signed",
  SELF_SIGNED_CERT_IN_CHAIN: "TLS certificate chain is untrusted",
  UNABLE_TO_VERIFY_LEAF_SIGNATURE: "TLS certificate chain is untrusted",
  CERT_HAS_EXPIRED: "TLS certificate has expired"
};
function redactUrl(s) {
  const str = String(s);
  const q = str.search(/[?#]/);
  const base = (q >= 0 ? str.slice(0, q) : str).replace(/^([a-z][\w+.-]*:\/\/)[^/?#]*@/i, "$1");
  return q >= 0 ? `${base}${str[q]}…` : base;
}
function fetchFailure(e, input) {
  if (!e || e.status) return e;
  const code = String(e.cause?.code || e.code || "");
  if (!code && e.message !== "fetch failed") return e;
  const why = CAUSES[code] || (/^ERR_TLS|CERT_|SSL/.test(code) ? "TLS error" : "");
  const at = redactUrl(input?.href ?? input);
  return Object.assign(new Error(`the request to ${at} failed${why ? `: ${why}` : ""}${code ? ` (${code})` : ""}`), { code: e.code });
}
function anySignal(list) {
  const S3 = (
    /** @type {any} */
    AbortSignal
  );
  if (S3.any) return S3.any(list);
  const c = new AbortController();
  for (const s of list) {
    if (s.aborted) c.abort(s.reason);
    else s.addEventListener("abort", () => c.abort(s.reason), { once: true });
  }
  return c.signal;
}

// src/importers/xml.js
var XmlError = class extends Error {
};
var XML_LIMITS = { maxChars: 16 * 1024 * 1024, maxDepth: 128, maxElements: 25e4, maxAttributes: 64 };
var ENTITIES = { amp: "&", lt: "<", gt: ">", quot: '"', apos: "'" };
var isSpace = (c) => c === " " || c === "\n" || c === "\r" || c === "	";
var isNameChar = (c) => !(isSpace(c) || c === ">" || c === "/" || c === "=" || c === "<" || c === '"' || c === "'" || c === "");
function decode(s, at) {
  if (!s.includes("&")) return s;
  let out = "", i = 0;
  for (; ; ) {
    const amp = s.indexOf("&", i);
    if (amp < 0) return out + s.slice(i);
    out += s.slice(i, amp);
    const semi = s.indexOf(";", amp);
    if (semi < 0 || semi - amp > 12) throw new XmlError(`A "&" that does not start a reference, near character ${at + amp}`);
    const ref = s.slice(amp + 1, semi);
    if (ref[0] === "#") {
      const hex2 = ref[1] === "x" || ref[1] === "X";
      const digits = ref.slice(hex2 ? 2 : 1);
      const n = parseInt(digits, hex2 ? 16 : 10);
      if (!(hex2 ? /^[0-9a-fA-F]+$/ : /^[0-9]+$/).test(digits) || !(n > 0 && n <= 1114111) || n >= 55296 && n <= 57343) throw new XmlError(`The character reference &${ref}; is not valid`);
      out += String.fromCodePoint(n);
    } else if (Object.hasOwn(ENTITIES, ref)) out += ENTITIES[ref];
    else throw new XmlError(`The entity &${ref}; is not defined (DTD entities are not read)`);
    i = semi + 1;
  }
}
function parseXml(src, limits = {}) {
  const L = { ...XML_LIMITS, ...limits };
  if (typeof src !== "string") throw new XmlError("The file is not text");
  if (src.length > L.maxChars) throw new XmlError(`The file is too large (more than ${L.maxChars} characters)`);
  if (src.charCodeAt(0) === 65279) src = src.slice(1);
  const stack2 = [];
  const nsStack = [Object.assign(/* @__PURE__ */ Object.create(null), { xml: "http://www.w3.org/XML/1998/namespace" })];
  let root = null;
  let count = 0, i = 0;
  const n = src.length;
  const fail = (msg, at = i) => {
    throw new XmlError(`${msg} (character ${at})`);
  };
  const addText = (t, at) => {
    if (!t) return;
    const top = stack2[stack2.length - 1];
    if (top) top.text += t;
    else for (let k = 0; k < t.length; k++) if (!isSpace(t[k])) fail("Text outside the root element", at + k);
  };
  while (i < n) {
    const lt = src.indexOf("<", i);
    if (lt < 0) {
      addText(decode(src.slice(i), i), i);
      break;
    }
    if (lt > i) addText(decode(src.slice(i, lt), i), i);
    i = lt;
    const c1 = src[i + 1];
    if (c1 === "?") {
      const e = src.indexOf("?>", i + 2);
      if (e < 0) fail('A "<?" without its "?>"');
      i = e + 2;
      continue;
    }
    if (c1 === "!") {
      if (src.startsWith("<!--", i)) {
        const e = src.indexOf("-->", i + 4);
        if (e < 0) fail('A comment without its "-->"');
        i = e + 3;
        continue;
      }
      if (src.startsWith("<![CDATA[", i)) {
        const e = src.indexOf("]]>", i + 9);
        if (e < 0) fail('A CDATA section without its "]]>"');
        if (!stack2.length) fail("CDATA outside the root element");
        stack2[stack2.length - 1].text += src.slice(i + 9, e);
        i = e + 3;
        continue;
      }
      fail("The file has a DOCTYPE or other declaration, which is not allowed (it could define entities)");
    }
    if (c1 === "/") {
      const e = src.indexOf(">", i + 2);
      if (e < 0) fail('A closing tag without its ">"');
      const qname2 = src.slice(i + 2, e).trim();
      const top = stack2.pop();
      nsStack.pop();
      if (!top) fail(`The closing tag </${qname2}> has no opening tag`);
      if (qname2 !== /** @type {any} */
      top.qname) fail(`</${qname2}> closes <${/** @type {any} */
      top.qname}>`);
      delete /** @type {any} */
      top.qname;
      i = e + 1;
      continue;
    }
    let j = i + 1;
    while (j < n && isNameChar(src[j])) j++;
    const qname = src.slice(i + 1, j);
    if (!qname) fail('A "<" that does not start a tag');
    if (root && !stack2.length) fail("A second root element");
    if (++count > L.maxElements) fail(`The file has more than ${L.maxElements} elements`);
    if (stack2.length >= L.maxDepth) fail(`Elements are nested more than ${L.maxDepth} deep`);
    const raw = /* @__PURE__ */ Object.create(null);
    let attrs = 0, selfClose = false;
    for (; ; ) {
      while (j < n && isSpace(src[j])) j++;
      if (j >= n) fail(`The tag <${qname}> is not closed`);
      if (src[j] === ">") {
        j++;
        break;
      }
      if (src[j] === "/") {
        if (src[j + 1] !== ">") fail(`A "/" inside the tag <${qname}>`, j);
        selfClose = true;
        j += 2;
        break;
      }
      const a0 = j;
      while (j < n && isNameChar(src[j])) j++;
      const an = src.slice(a0, j);
      if (!an) fail(`An unexpected character in the tag <${qname}>`, j);
      while (j < n && isSpace(src[j])) j++;
      if (src[j] !== "=") fail(`The attribute ${an} has no value`, j);
      j++;
      while (j < n && isSpace(src[j])) j++;
      const qc = src[j];
      if (qc !== '"' && qc !== "'") fail(`The value of ${an} is not quoted`, j);
      const end = src.indexOf(qc, j + 1);
      if (end < 0) fail(`The value of ${an} has no closing quote`, j);
      const v = src.slice(j + 1, end);
      if (v.includes("<")) fail(`A "<" in the value of ${an}`, j);
      if (++attrs > L.maxAttributes) fail(`The tag <${qname}> has more than ${L.maxAttributes} attributes`);
      if (Object.hasOwn(raw, an)) fail(`The attribute ${an} appears twice in <${qname}>`, a0);
      raw[an] = decode(v, j + 1);
      j = end + 1;
    }
    const scope = Object.create(nsStack[nsStack.length - 1]);
    const attrsOut = /* @__PURE__ */ Object.create(null);
    for (const [k, v] of Object.entries(raw)) {
      if (k === "xmlns") scope[""] = v;
      else if (k.startsWith("xmlns:")) scope[k.slice(6)] = v;
      else {
        const c = k.indexOf(":");
        attrsOut[c < 0 ? k : k.slice(c + 1)] = v;
      }
    }
    const colon = qname.indexOf(":");
    const prefix = colon < 0 ? "" : qname.slice(0, colon);
    const ns = scope[prefix] ?? (prefix ? fail(`The prefix "${prefix}" is not declared`) : "");
    const el = { name: colon < 0 ? qname : qname.slice(colon + 1), ns, attrs: attrsOut, children: [], text: "" };
    if (stack2.length) stack2[stack2.length - 1].children.push(el);
    else root = el;
    if (!selfClose) {
      el.qname = qname;
      stack2.push(el);
      nsStack.push(scope);
    }
    i = j;
  }
  if (stack2.length) throw new XmlError(`The file ends inside <${/** @type {any} */
  stack2[stack2.length - 1].qname}>: it is cut off or not well formed`);
  if (!root) throw new XmlError("The file has no root element");
  return root;
}

// src/engine/data/xml.js
var DOCS = /* @__PURE__ */ new WeakSet();
var PARENTS = /* @__PURE__ */ new WeakMap();
var XPATH_MAX = 512;
function xmlDocument(text, src = {}) {
  const root = parseXml(String(text ?? ""));
  const doc = { $xml: root, $ns: { ...src.namespaces || {} } };
  DOCS.add(doc);
  return doc;
}
var isXmlDoc = (v) => v != null && typeof v === "object" && DOCS.has(v);
function soapBody(text, src = {}) {
  const doc = xmlDocument(text, src);
  const env = doc.$xml;
  if (env.name !== "Envelope") throw new Error(`The SOAP response is not an Envelope (it is <${env.name}>)`);
  const body = env.children.find((c) => c.name === "Body");
  if (!body) throw new Error("The SOAP response has no Body");
  const first = body.children[0];
  if (!first) throw new Error("The SOAP response Body is empty");
  if (first.name === "Fault") {
    const msg = stringValue(first.children.find((c) => c.name === "faultstring") || first.children.find((c) => c.name === "Reason") || first);
    throw new Error(`SOAP fault: ${msg.slice(0, 300)}`);
  }
  const out = { $xml: first, $ns: doc.$ns };
  DOCS.add(out);
  return out;
}
var xmlEscape = (s) => String(s ?? "").replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&apos;" })[c]);
var NAME = /^(?:([A-Za-z_][\w.-]*):)?([A-Za-z_][\w.-]*|\*)$/;
var pathCache = /* @__PURE__ */ new Map();
function compileXPath(path) {
  path = String(path ?? "").trim();
  const hit = pathCache.get(path);
  if (hit) return hit;
  if (path.length > XPATH_MAX) throw new Error(`The XPath is longer than ${XPATH_MAX} characters`);
  if (!path) throw new Error("Give an XPath");
  const parts = [];
  let cur = "", depth = 0, q = "";
  for (const c of path) {
    if (q) {
      if (c === q) q = "";
      cur += c;
      continue;
    }
    if (c === "'" || c === '"') {
      q = c;
      cur += c;
      continue;
    }
    if (c === "[") depth++;
    if (c === "]") depth--;
    if (c === "/" && depth === 0) {
      parts.push(cur);
      cur = "";
      continue;
    }
    cur += c;
  }
  if (q || depth) throw new Error(`The XPath "${path}" has an unclosed quote or [`);
  parts.push(cur);
  const abs = parts[0] === "";
  if (abs) parts.shift();
  const steps = [];
  let desc = false;
  for (let k = 0; k < parts.length; k++) {
    const p = parts[k].trim();
    if (p === "") {
      if (desc || k === parts.length - 1) throw new Error(`The XPath "${path}" has an empty step`);
      desc = true;
      continue;
    }
    steps.push(step(p, desc, path));
    desc = false;
  }
  if (!steps.length) throw new Error(`The XPath "${path}" has no steps`);
  steps.forEach((s, k) => {
    if ((s.test.kind === "attr" || s.test.kind === "text") && k < steps.length - 1) throw new Error(`In "${path}", @attribute and text() must come last`);
  });
  const out = { abs, steps };
  if (pathCache.size > 500) pathCache.clear();
  pathCache.set(path, out);
  return out;
}
function step(p, desc, path) {
  const b = p.indexOf("[");
  const head = (b < 0 ? p : p.slice(0, b)).trim();
  const preds = [];
  if (b >= 0) {
    let rest = p.slice(b);
    while (rest) {
      if (rest[0] !== "[") throw new Error(`The XPath "${path}": text after a predicate`);
      let k = 1, q = "";
      for (; k < rest.length; k++) {
        const c = rest[k];
        if (q) {
          if (c === q) q = "";
        } else if (c === "'" || c === '"') q = c;
        else if (c === "]") break;
      }
      preds.push(pred(rest.slice(1, k).trim(), path));
      rest = rest.slice(k + 1).trim();
    }
  }
  let test;
  if (head === ".") test = { kind: "self" };
  else if (head === "..") test = { kind: "parent" };
  else if (head === "text()") test = { kind: "text" };
  else if (head.startsWith("@")) {
    const m = NAME.exec(head.slice(1));
    if (!m) throw new Error(`The XPath "${path}": "${head}" is not an attribute name`);
    test = { kind: "attr", local: m[2] };
  } else {
    const m = NAME.exec(head);
    if (!m) throw new Error(`The XPath "${path}": "${head}" is not supported (names, *, ., .., @attr, text() and simple [predicates] are)`);
    test = { kind: "name", prefix: m[1] || "", local: m[2] };
  }
  if (preds.length && test.kind !== "name") throw new Error(`The XPath "${path}": a predicate goes on an element step`);
  return { desc, test, preds };
}
var LIT = /^(?:'([^']*)'|"([^"]*)"|(-?\d+(?:\.\d+)?))$/;
function pred(s, path) {
  if (/^\d+$/.test(s)) {
    const n = Number(s);
    if (n < 1) throw new Error(`The XPath "${path}": positions start at 1`);
    return { pos: n };
  }
  if (s === "last()") return { last: true };
  const m = /^(@?[A-Za-z_][\w.:-]*|text\(\)|\.)\s*(?:(!?=)\s*(.+))?$/.exec(s);
  if (!m) throw new Error(`The XPath "${path}": the predicate [${s}] is not supported`);
  let value = null;
  if (m[2]) {
    const l = LIT.exec(m[3].trim());
    if (!l) throw new Error(`The XPath "${path}": compare with a quoted value in [${s}]`);
    value = l[1] ?? l[2] ?? l[3];
  }
  const what = m[1];
  const local = what.replace(/^@/, "").replace(/^[^:]*:/, "");
  return { attr: what.startsWith("@"), self: what === "." || what === "text()", local, op: m[2] || null, value };
}
function parentsOf(root) {
  let m = PARENTS.get(root);
  if (m) return m;
  m = /* @__PURE__ */ new Map();
  const stack2 = [root];
  while (stack2.length) {
    const e = (
      /** @type {XmlElement} */
      stack2.pop()
    );
    for (const c of e.children) {
      m.set(c, e);
      stack2.push(c);
    }
  }
  PARENTS.set(root, m);
  return m;
}
function stringValue(el) {
  if (!el.children.length) return el.text.trim();
  let s = "";
  const stack2 = [el];
  while (stack2.length) {
    const e = (
      /** @type {XmlElement} */
      stack2.pop()
    );
    s += e.text;
    for (let i = e.children.length - 1; i >= 0; i--) stack2.push(e.children[i]);
  }
  return s.trim();
}
function selectXml(doc, path, context) {
  const { abs, steps } = compileXPath(path);
  const root = doc.$xml;
  const DOC = { name: "#document", ns: "", attrs: {}, children: [root], text: "" };
  let cur = abs ? [DOC] : [context || root];
  const up = (e) => e === DOC ? null : e === root ? DOC : parentsOf(root).get(e) || null;
  for (const s of steps) {
    if (s.desc) {
      const seen2 = /* @__PURE__ */ new Set(), all = [];
      for (const c of cur) {
        if (typeof c === "string") continue;
        const stack2 = [c];
        while (stack2.length) {
          const e = stack2.pop();
          if (seen2.has(e)) continue;
          seen2.add(e);
          all.push(e);
          for (let i = e.children.length - 1; i >= 0; i--) stack2.push(e.children[i]);
        }
      }
      cur = all;
    }
    const next = [], seen = /* @__PURE__ */ new Set();
    const add2 = (x) => {
      if (typeof x === "string") next.push(x);
      else if (!seen.has(x)) {
        seen.add(x);
        next.push(x);
      }
    };
    for (const c of cur) {
      if (typeof c === "string") continue;
      const t = s.test;
      if (t.kind === "self") add2(c);
      else if (t.kind === "parent") {
        const p = up(c);
        if (p) add2(p);
      } else if (t.kind === "text") {
        if (c !== DOC) add2(c.text.trim());
      } else if (t.kind === "attr") {
        if (t.local === "*") Object.values(c.attrs).forEach(add2);
        else if (Object.hasOwn(c.attrs, t.local)) add2(c.attrs[t.local]);
      } else {
        let ns = null;
        if (t.prefix) {
          if (!Object.hasOwn(doc.$ns, t.prefix)) throw new Error(`The XPath prefix "${t.prefix}" has no namespace; add it to the source's namespaces`);
          ns = doc.$ns[t.prefix];
        }
        let kids = c.children.filter((e) => (t.local === "*" || e.name === t.local) && (ns === null || e.ns === ns));
        for (const p of s.preds) kids = filterPred(kids, p);
        kids.forEach(add2);
      }
    }
    cur = next;
  }
  return cur.filter((x) => x && (typeof x === "string" || x.name !== "#document"));
}
function filterPred(list, p) {
  if (p.pos) return list[p.pos - 1] ? [list[p.pos - 1]] : [];
  if (p.last) return list.length ? [list[list.length - 1]] : [];
  return list.filter((e) => {
    let vals;
    if (p.self) vals = [stringValue(e)];
    else if (p.attr) vals = Object.hasOwn(e.attrs, p.local) ? [e.attrs[p.local]] : [];
    else vals = e.children.filter((c) => c.name === p.local).map(stringValue);
    if (!p.op) return vals.length > 0;
    const eq = vals.some((v) => v === p.value);
    return p.op === "=" ? eq : vals.length > 0 && !eq;
  });
}
function xmlValue(doc, el, path) {
  const r = selectXml(doc, path, el)[0];
  return r == null ? null : typeof r === "string" ? r : stringValue(r);
}
var SKIP_KEY = "__proto__";
function xmlObject(el) {
  const o = {};
  for (const [k, v] of Object.entries(el.attrs)) if (k !== SKIP_KEY) o[k] = v;
  if (!el.children.length) {
    const t = el.text.trim();
    if (t && el.name !== SKIP_KEY) o[el.name] = t;
    return o;
  }
  const kids = /* @__PURE__ */ new Set(), lists = /* @__PURE__ */ new Set();
  for (const c of el.children) {
    if (c.name === SKIP_KEY) continue;
    const v = c.children.length ? xmlObject(c) : c.text.trim();
    if (!kids.has(c.name)) {
      o[c.name] = v;
      kids.add(c.name);
      continue;
    }
    if (!lists.has(c.name)) {
      o[c.name] = [o[c.name]];
      lists.add(c.name);
    }
    o[c.name].push(v);
  }
  return o;
}
function xmlRowPaths(doc) {
  const seen = /* @__PURE__ */ new Map();
  const stack2 = [{ e: doc.$xml, path: `/${doc.$xml.name}`, depth: 0 }];
  while (stack2.length) {
    const { e, path, depth } = (
      /** @type {any} */
      stack2.pop()
    );
    const counts = /* @__PURE__ */ new Map();
    for (const c of e.children) counts.set(c.name, (counts.get(c.name) || 0) + 1);
    for (const c of e.children) {
      const p = `${path}/${c.name}`;
      let s = seen.get(p);
      if (!s) seen.set(p, s = { rows: 0, repeats: false, fields: /* @__PURE__ */ new Set(), depth: depth + 1 });
      s.rows++;
      if (counts.get(c.name) > 1) s.repeats = true;
      if (s.rows <= 50) {
        for (const k of Object.keys(c.attrs)) s.fields.add(k);
        for (const g of c.children) if (!g.children.length) s.fields.add(g.name);
        if (!c.children.length && c.text.trim()) s.fields.add(c.name);
      }
      if (c.children.length) stack2.push({ e: c, path: p, depth: depth + 1 });
    }
  }
  return [...seen].filter(([, s]) => s.repeats).map(([path, s]) => ({ path, rows: s.rows, objects: true, fields: [...s.fields], spreads: s.depth }));
}
function bestXmlRows(doc) {
  const list = xmlRowPaths(doc).sort((a, b) => b.rows - a.rows || a.spreads - b.spreads);
  return list[0] || null;
}
function xmlRows(doc, path) {
  let p = path && path !== "$" ? path : bestXmlRows(doc)?.path;
  if (!p) return { els: [doc.$xml], rows: [xmlObject(doc.$xml)] };
  const found = selectXml(doc, p);
  const els = found.filter((x) => typeof x !== "string");
  if (!els.length && found.length) return { els: null, rows: found.map((v) => ({ value: v })) };
  return { els, rows: els.map(xmlObject) };
}

// src/engine/data/odata.js
var ODATA_MAX_PAGES = 100;
var ODATA_DEFAULT_PAGES = 10;
var IDENT2 = /^[A-Za-z_][\w]*(?:\/[A-Za-z_][\w]*)*$/;
var NUMERIC2 = /^Edm\.(Int16|Int32|Int64|Byte|SByte|Decimal|Double|Single)$/;
var OPS2 = /* @__PURE__ */ new Set(["eq", "ne", "gt", "ge", "lt", "le", "contains", "startswith", "endswith"]);
var ident = (s, what) => {
  const v = String(s ?? "").trim();
  if (!IDENT2.test(v)) throw new Error(`OData: "${v.slice(0, 60)}" is not a valid ${what} name`);
  return v;
};
function odataLiteral(v, type) {
  const t = String(type || "");
  if (NUMERIC2.test(t) || !t && typeof v === "number") {
    const n = typeof v === "number" ? v : Number(String(v).trim());
    if (!Number.isFinite(n) || String(v).trim() === "") throw new Error(`OData: "${String(v).slice(0, 40)}" is not a number`);
    return String(n);
  }
  if (t === "Edm.Boolean" || !t && typeof v === "boolean") return ["true", "1", "yes"].includes(String(v).toLowerCase()) ? "true" : "false";
  if (/^Edm\.(Date|DateTime|DateTimeOffset)$/.test(t) || !t && v instanceof Date) {
    const d = toDate(v);
    if (!d) throw new Error(`OData: "${String(v).slice(0, 40)}" is not a date`);
    return t === "Edm.Date" ? isoDate(d) : t === "Edm.DateTime" ? `datetime'${d.toISOString().slice(0, 19)}'` : d.toISOString();
  }
  if (t === "Edm.Guid") {
    if (!/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(String(v))) throw new Error(`OData: "${String(v).slice(0, 40)}" is not a GUID`);
    return String(v);
  }
  return `'${(v instanceof Date ? v.toISOString() : String(v)).replace(/'/g, "''")}'`;
}
function odataQuery(src, value) {
  const q = [];
  const sel = (src.select || []).map((s) => ident(s, "property"));
  if (sel.length) q.push(`$select=${sel.join(",")}`);
  const clauses = [];
  for (const f4 of src.filters || []) {
    if (!f4 || !f4.field) continue;
    const field = ident(f4.field, "property");
    const op = String(f4.op || "eq");
    if (!OPS2.has(op)) throw new Error(`OData: the operator "${op}" is not supported`);
    const v = value(f4.value);
    if (v == null || v === "" || Array.isArray(v) && !v.length) continue;
    const one = (x) => op === "contains" || op === "startswith" || op === "endswith" ? `${op}(${field},${odataLiteral(x, "Edm.String")})` : `${field} ${op} ${odataLiteral(x, f4.type)}`;
    clauses.push(Array.isArray(v) ? `(${v.map(one).join(op === "ne" ? " and " : " or ")})` : one(v));
  }
  if (clauses.length) q.push(`$filter=${encodeURIComponent(clauses.join(" and "))}`);
  const ord = (src.orderby || []).filter((o) => o && o.field).map((o) => `${ident(o.field, "property")}${o.dir === "desc" ? " desc" : ""}`);
  if (ord.length) q.push(`$orderby=${encodeURIComponent(ord.join(","))}`);
  for (const k of ["top", "skip"]) {
    if (src[k] == null || src[k] === "") continue;
    const v = value(src[k]);
    if (v == null || v === "") continue;
    const n = Number(v);
    if (!Number.isInteger(n) || n < 0) throw new Error(`OData: $${k} must be a whole number, not "${String(v).slice(0, 20)}"`);
    q.push(`$${k}=${n}`);
  }
  const exp = (src.expand || []).map((s) => ident(s, "navigation property"));
  if (exp.length) q.push(`$expand=${exp.join(",")}`);
  return q.join("&");
}
function odataUrl(root, src, value) {
  const set = ident(src.entitySet, "entity set");
  const q = odataQuery(src, value);
  const r = String(root || "");
  const [base, existing] = r.split("?");
  const url = `${base.replace(/\/+$/, "")}/${set}`;
  const all = [existing, q].filter(Boolean).join("&");
  return all ? `${url}?${all}` : url;
}
function odataPage(json) {
  const d = json?.d;
  const rows = Array.isArray(json?.value) ? json.value : Array.isArray(d?.results) ? d.results : Array.isArray(d) ? d : null;
  if (!rows) throw new Error('OData: the response has no "value" list (is the URL an entity set?)');
  const next = json["@odata.nextLink"] ?? json["odata.nextLink"] ?? d?.__next ?? null;
  return { rows, next: typeof next === "string" && next ? next : null };
}
function odataClean(rows, types = {}) {
  return rows.map((r) => {
    if (!r || typeof r !== "object") return r;
    const o = {};
    for (const [k, v] of Object.entries(r)) {
      if (k.startsWith("@odata.") || k.startsWith("odata.") || k === "__metadata" || k === "__proto__" || k.includes("@odata.")) continue;
      if (v && typeof v === "object" && v.__deferred) continue;
      const t = types[k];
      if (t && NUMERIC2.test(t) && typeof v === "string" && v.trim() !== "" && Number.isFinite(Number(v))) o[k] = Number(v);
      else if (typeof v === "string" && /^\/Date\((-?\d+)(?:[+-]\d{4})?\)\/$/.test(v)) o[k] = new Date(Number(/-?\d+/.exec(v)?.[0])).toISOString();
      else o[k] = v;
    }
    return o;
  });
}

// src/engine/data/index.js
function pathTokens(path) {
  const toks = [];
  const re = /\.([A-Za-z_$][\w$]*)|\[(\d+|\*)\]|\['([^']+)'\]|\["([^"]+)"\]/g;
  const p = path.startsWith("$") ? path.slice(1) : "." + path;
  let m, last = 0;
  while (m = re.exec(p)) {
    if (m.index !== last) throw new Error(`Bad data path "${path}"`);
    toks.push(m[1] ?? m[3] ?? m[4] ?? (m[2] === "*" ? "*" : Number(m[2])));
    last = re.lastIndex;
  }
  if (last !== p.length) throw new Error(`Bad data path "${path}"`);
  return toks;
}
function jsonPath(obj, path) {
  if (!path || path === "$") return obj;
  let cur = [obj], spread = false;
  for (const t of pathTokens(path)) {
    const nxt = [];
    for (const c of cur) {
      if (c == null) continue;
      if (t === "*") {
        if (typeof c === "object") for (const k of Array.isArray(c) ? c : Object.values(c)) nxt.push(k);
        spread = true;
      } else nxt.push(c[t]);
    }
    cur = nxt;
  }
  return spread ? cur : cur[0];
}
function jsonPathRows(obj, path) {
  if (!path || path === "$") return { rows: obj, parents: null };
  let cur = [obj], hold = [null], par = [null], spread = false;
  for (const t of pathTokens(path)) {
    const nv = [], nh = [], np = [];
    for (let i = 0; i < cur.length; i++) {
      const c = cur[i];
      if (c == null) continue;
      if (t === "*") {
        if (typeof c !== "object") continue;
        const kids = Array.isArray(c) ? c : Object.values(c);
        for (const k of kids) {
          nv.push(k);
          nh.push(c);
          np.push(hold[i]);
        }
        spread = true;
      } else {
        nv.push(c[t]);
        nh.push(c);
        np.push(par[i]);
      }
    }
    cur = nv;
    hold = nh;
    par = np;
  }
  return spread ? { rows: cur, parents: par } : { rows: cur[0], parents: null };
}
function coerce(v, type, opt) {
  if (v == null || v === "") {
    if (type === "number" || type === "date") opt?.empty?.();
    return v === "" && type === "string" ? "" : null;
  }
  switch (type) {
    case "number": {
      const n = typeof v === "number" ? v : typeof v === "boolean" ? v ? 1 : 0 : parseNumber(String(v), opt?.locale);
      if (Number.isNaN(n)) {
        opt?.bad?.(v);
        return null;
      }
      return n;
    }
    case "date": {
      const d = toDate(v, opt);
      if (!d) opt?.bad?.(v);
      return d;
    }
    case "boolean":
      return typeof v === "boolean" ? v : ["true", "1", "yes", "y"].includes(String(v).toLowerCase());
    case "string":
      return typeof v === "string" ? v : plainText(v);
    // 1e21 and {…} as data, not 1e+21 or [object Object]
    // a list of values (a sparkline's points): an array as it is, or text split at commas or semicolons
    case "list": {
      if (Array.isArray(v)) return v;
      if (typeof v !== "string") return [v];
      return v.split(/[,;]/).map((x) => x.trim()).filter((x) => x !== "").map((x) => /^-?\d+(\.\d+)?$/.test(x) ? Number(x) : x);
    }
    default:
      return v;
  }
}
function badValues(dsName, warn) {
  const bad = /* @__PURE__ */ new Map();
  let row = 0;
  return {
    /** the row being typed, 1-based */
    at: (n) => {
      row = n;
    },
    /** coerce() options for one field, on top of base */
    opt: (fd, base) => ({
      ...base,
      bad: (v) => {
        const b = bad.get(fd.name);
        if (b) b.n++;
        else bad.set(fd.name, { n: 1, v, row, type: fd.type, empty: 0 });
      },
      empty: () => {
        const b = bad.get(fd.name) || (bad.set(fd.name, { n: 0, v: null, row: 0, type: fd.type, empty: 0 }), bad.get(fd.name));
        b.empty++;
      }
    }),
    done: () => {
      for (const [f4, b] of bad) if (b.n) warn(`Data set "${dsName}", field "${f4}": ${b.n} value${b.n > 1 ? "s do" : " does"} not read as ${b.type === "date" ? "a date" : "a number"} (for example "${String(b.v).slice(0, 40)}"), so ${b.n > 1 ? "they are" : "it is"} blank. First: row ${b.row}.${b.empty ? ` ${b.empty} ${b.empty > 1 ? "are" : "is"} empty.` : ""}`);
    }
  };
}
function detectFields(rows, { dates = true } = {}) {
  const out = /* @__PURE__ */ new Map();
  for (const r of rows.slice(0, 50)) {
    if (!r || typeof r !== "object") continue;
    for (const [k, v] of Object.entries(r)) {
      const list = Array.isArray(v) && v.every((x) => x == null || typeof x !== "object");
      if (v != null && typeof v === "object" && !(v instanceof Date) && !list) continue;
      const t = list ? "list" : guessType(v, dates);
      if (!out.has(k) || out.get(k) === "null") out.set(k, t);
      else if (out.get(k) !== t && t !== "null") out.set(k, "string");
    }
  }
  return [...out].map(([name, type]) => ({ name, type: type === "null" ? "string" : type }));
}
function guessType(v, dates = true) {
  if (v == null) return "null";
  if (typeof v === "number") return "number";
  if (typeof v === "boolean") return "boolean";
  if (v instanceof Date) return "date";
  if (dates && typeof v === "string" && /^\d{4}-\d{2}-\d{2}([T ][\d:.]+(Z|[+-]\d{2}:?\d{2})?)?$/.test(v)) return "date";
  return "string";
}
var MAX_CSV_COLUMNS = 1e4;
var MAX_CSV_CELLS = 5e6;
function csvChar(v, dflt, what) {
  if (v == null || v === "") return dflt;
  const c = v === "tab" || v === "\\t" ? "	" : String(v);
  if (c.length !== 1 || c === "\n" || c === "\r") throw new Error(`The CSV ${what} must be one character`);
  return c;
}
function parseCsv(text, opts = {}) {
  const sep = csvChar(opts.separator, ",", "separator");
  const quote = csvChar(opts.quote, '"', "quote");
  if (sep === quote) throw new Error("The CSV separator and quote must differ");
  text = String(text ?? "");
  const n = text.length;
  const rows = [];
  let row = [], i = 0;
  const endOfField = (k) => {
    while (k < n && text[k] !== sep && text[k] !== "\n" && text[k] !== "\r") k++;
    return k;
  };
  for (; ; ) {
    let cell;
    if (text[i] === quote) {
      let j = i + 1, buf = "";
      for (; ; ) {
        const k = text.indexOf(quote, j);
        if (k < 0) {
          buf += text.slice(j);
          j = n;
          break;
        }
        buf += text.slice(j, k);
        if (text[k + 1] === quote) {
          buf += quote;
          j = k + 2;
          continue;
        }
        j = k + 1;
        break;
      }
      const e = endOfField(j);
      cell = buf + text.slice(j, e);
      i = e;
    } else {
      const e = endOfField(i);
      cell = text.slice(i, e);
      i = e;
    }
    row.push(cell);
    if (row.length > MAX_CSV_COLUMNS) throw new Error(`A CSV row has more than ${MAX_CSV_COLUMNS} columns`);
    if (i >= n) {
      rows.push(row);
      break;
    }
    if (text[i] === sep) {
      i++;
      continue;
    }
    if (text[i] === "\r" && text[i + 1] === "\n") i++;
    i++;
    rows.push(row);
    row = [];
    if (i >= n) break;
  }
  const start = Math.max(1, Math.floor(Number(opts.startRow) || 1));
  const kept = rows.slice(start - 1).filter((r) => r.length > 1 || r[0] !== "");
  let width = 0;
  for (const r of kept) width = Math.max(width, r.length);
  if (width * kept.length > MAX_CSV_CELLS) throw new Error(`The CSV has more than ${MAX_CSV_CELLS.toLocaleString("en")} cells (rows × columns)`);
  if (opts.headerRow === false) {
    const names2 = Array.from({ length: width }, (_, k) => `Column${k + 1}`);
    return kept.map((r) => Object.fromEntries(names2.map((h, k) => [h, r[k] ?? ""])));
  }
  const [head, ...body] = kept;
  if (!head) return [];
  const names = head.map((h) => h.trim());
  return body.map((r) => Object.fromEntries(names.map((h, k) => [h, r[k] ?? ""])));
}
var NO_FETCH = "No fetch() available: pass render(def, { fetch })";
function fetcherFor(opt) {
  let f4 = opt.fetch;
  if (!f4) {
    if (!globalThis.fetch) return null;
    const plain2 = globalThis.fetch.bind(globalThis);
    f4 = opt.unsafeFetch ? plain2 : guardedFetch(opt, plain2);
  }
  return boundedFetch(f4, opt);
}
function checkHostSource(src, url, opt) {
  const rule = opt.fetch ? opt.fetch.hostRule : opt.unsafeFetch ? null : opt;
  if (!rule) return;
  const scheme = /^([a-z][a-z0-9+.-]*):/i.exec(String(url).trim());
  if (scheme && !/^https?$/i.test(scheme[1])) throw Object.assign(new Error(`Only http and https URLs can be fetched, not ${scheme[1].toLowerCase()}:`), { status: 400 });
  const t = String(src.url ?? "").trim();
  if (/^\/(?![/\\])/.test(t)) return;
  const m = /^https?:\/\/([^/?#\\]*)/i.exec(t);
  if (m && !m[1].includes("{")) return;
  const whole = t.startsWith("=") || /^\{[^{}]+\}$/.test(t);
  let host = "";
  try {
    host = new URL(url).hostname.replace(/^\[|\]$/g, "").toLowerCase();
  } catch {
  }
  if (whole && host && (rule.allowHosts || []).map((h) => String(h).toLowerCase()).includes(host)) return;
  throw Object.assign(new Error("its host is made by a parameter or an expression: write the scheme and host out (parameters may fill the path and query), or make the whole URL a parameter and list its host in allowHosts"), { status: 403 });
}
async function loadSources(def, opt) {
  const ctx = { params: opt.params, globals: {}, dataSets: {}, fields: null, functions: functionTable(def) };
  const out = {};
  const f4 = fetcherFor(opt);
  await Promise.all((def.dataSources || []).map(async (src) => {
    try {
      if (src.type === "json") out[src.name] = typeof src.data === "string" ? JSON.parse(src.data) : src.data;
      else if (src.type === "sql") out[src.name] = await loadSql(src, ctx.params, opt, f4);
      else if (src.type === "csv" && src.data) out[src.name] = parseCsv(src.data, src);
      else if (src.type === "xml" && src.data) out[src.name] = xmlDocument(src.data, src);
      else if (FETCHED_TYPES.includes(src.type)) {
        if (!f4) throw new Error(NO_FETCH);
        out[src.name] = await loadFetched(src, ctx, opt, f4);
      } else throw new Error(`Unknown data source type "${src.type}"`);
    } catch (e) {
      throw Object.assign(new Error(`Data source "${src.name}": ${e.message}`), { status: e.status });
    }
  }));
  return out;
}
var FETCHED_TYPES = ["rest", "csv", "graphql", "xml", "soap", "odata"];
async function loadFetched(src, ctx, opt, f4) {
  const target = urlFrom(src.url || "", ctx);
  checkHostSource(src, target, opt);
  const headers = {};
  for (const [k, v] of Object.entries(src.headers || {})) headers[k] = String(evalValue(v, ctx));
  const call2 = async (url, init) => {
    let u2 = url;
    if (src.useProxy) u2 = `/api/data/proxy?url=${encodeURIComponent(u2)}`;
    if (opt.baseUrl && u2.startsWith("/")) u2 = opt.baseUrl.replace(/\/$/, "") + u2;
    const res2 = utf8Response(await f4(u2, init));
    return { res: res2, u: u2 };
  };
  if (src.type === "odata") return loadOData(src, ctx, target, headers, call2);
  if (src.type === "soap") {
    if (src.useProxy) throw new Error("The data proxy only reads (GET); a SOAP call cannot go through it");
    const version = String(src.soapVersion || "1.1");
    const action = String(src.soapAction || "");
    if (/["\r\n]/.test(action)) throw new Error("The SOAP action may not hold quotes or line breaks");
    const h = { ...headers };
    if (version === "1.2") h["content-type"] = `application/soap+xml; charset=utf-8${action ? `; action="${action}"` : ""}`;
    else {
      h["content-type"] = "text/xml; charset=utf-8";
      h.SOAPAction = `"${action}"`;
    }
    const { res: res2, u: u2 } = await call2(target, { method: "POST", headers: h, body: soapEnvelope(src.envelope, ctx) });
    const text = await res2.text();
    if (!res2.ok) {
      let fault = null;
      try {
        soapBody(text, src);
      } catch (e) {
        fault = /^SOAP fault/.test(e.message) ? e.message : null;
      }
      throw new Error(fault || `HTTP ${res2.status} from ${redactUrl(u2)}`);
    }
    return soapBody(text, src);
  }
  const { res, u } = await call2(target, requestInit(src, ctx, headers));
  if (!res.ok) throw new Error(`HTTP ${res.status} from ${redactUrl(u)}`);
  if (src.type === "csv") return parseCsv(await res.text(), src);
  if (src.type === "xml") return xmlDocument(await res.text(), src);
  const json = await res.json();
  if (src.type === "graphql" && json.errors?.length) throw new Error(`GraphQL: ${json.errors[0].message}`);
  return src.type === "graphql" ? json.data : json;
}
function requestInit(src, ctx, headers) {
  const init = { method: src.type === "graphql" ? "POST" : src.method || "GET", headers };
  if (src.type === "graphql") {
    headers["content-type"] || (headers["content-type"] = "application/json");
    const vars = src.variables ? variablesFrom(src.variables, ctx) : {};
    init.body = JSON.stringify({ query: src.query, variables: vars });
  } else if (src.body && init.method !== "GET") init.body = src.type === "xml" ? soapEnvelope(src.body, ctx) : String(evalValue(src.body, ctx));
  return init;
}
function utf8Response(res) {
  const m = /charset\s*=\s*["']?([^"';\s]+)/i.exec(res.headers?.get?.("content-type") || "");
  if (!m || !res.body || /^utf-?8$/i.test(m[1])) return res;
  let dec2;
  try {
    dec2 = new TextDecoder(m[1]);
  } catch {
    throw new Error(`The response character set "${m[1]}" is not known`);
  }
  const enc = new TextEncoder();
  const body = res.body.pipeThrough(new TransformStream({
    transform(chunk, c) {
      const s = dec2.decode(chunk, { stream: true });
      if (s) c.enqueue(enc.encode(s));
    },
    flush(c) {
      const s = dec2.decode();
      if (s) c.enqueue(enc.encode(s));
    }
  }));
  return new Response(body, { status: res.status, statusText: res.statusText, headers: res.headers });
}
function soapEnvelope(tpl, ctx) {
  const p = parseValue(String(tpl ?? ""));
  if (p.kind === "expr") throw new Error("Write the envelope as XML with {Parameters.x} for values, not as an =expression");
  if (p.kind !== "tpl") return String(p.v ?? "");
  return p.parts.map((part2) => typeof part2 === "string" ? part2 : xmlEscape(plain(evaluate(part2.ast, ctx), ctx))).join("");
}
async function loadOData(src, ctx, root, headers, call2) {
  const pages = Math.min(ODATA_MAX_PAGES, Math.max(1, Math.floor(Number(src.maxPages) || ODATA_DEFAULT_PAGES)));
  let url = odataUrl(root, src, (v) => evalValue(v, ctx));
  const DUMMY = "http://reportwright.invalid";
  const first = new URL(url, DUMMY);
  const rows = [];
  const h = { accept: "application/json", ...headers };
  for (let n = 0; n < pages && url; n++) {
    const { res, u } = await call2(url, { method: "GET", headers: h });
    if (!res.ok) throw new Error(`HTTP ${res.status} from ${redactUrl(u)}`);
    const page = odataPage(await res.json());
    for (const r of page.rows) rows.push(r);
    const here = new URL(url, DUMMY);
    url = null;
    if (page.next) {
      const next = new URL(page.next, here);
      if (next.origin !== first.origin) throw new Error(`OData: the next page link goes to another site (${next.origin}); it is not followed`);
      url = first.origin === DUMMY ? next.pathname + next.search : next.href;
    }
  }
  return odataClean(rows, src.types || {});
}
async function loadSql(src, params, opt, f4) {
  const day = (v) => v instanceof Date ? isoDate(v) : v;
  const p = Object.fromEntries(Object.entries(params || {}).map(([k, v]) => [k, Array.isArray(v) ? v.map(day) : day(v)]));
  if (opt.sql) return opt.sql(src, p);
  if (!f4) throw new Error(NO_FETCH);
  if (!opt.reportId && !opt.sqlPreview) throw new Error("Save the report first: SQL runs on the server, from the saved report.");
  const url = `${(opt.baseUrl || "").replace(/\/$/, "")}/api/data/sql`;
  const body = opt.sqlPreview ? { connection: src.connection, query: src.query, procedure: src.procedure, args: src.args, params: p } : { report: opt.reportId, source: src.name, params: p };
  const res = await f4(url, { method: "POST", headers: { "content-type": "application/json" }, body: JSON.stringify(body) });
  const json = await res.json().catch(() => ({}));
  if (!res.ok) throw Object.assign(new Error(json.error || `HTTP ${res.status} from ${redactUrl(url)}`), { status: res.status });
  return json.rows;
}
var plain = (x, ctx) => x instanceof Date ? isoDate(x) : toText(x, null, ctx);
function urlFrom(v, ctx) {
  const p = parseValue(v);
  if (p.kind !== "tpl") return String(evalValue(v, ctx) ?? "");
  let url = "";
  const filled = [];
  p.parts.forEach((part2, i) => {
    if (typeof part2 === "string") {
      url += part2;
      return;
    }
    const s = plain(evaluate(part2.ast, ctx), ctx);
    if (i === 0) {
      url += s;
      return;
    }
    filled.push([url.length, url.length + encodeURIComponent(s).length]);
    url += encodeURIComponent(s);
  });
  const q = url.search(/[?#]/), pathEnd = q < 0 ? url.length : q;
  let start = 0;
  for (let i = 0; i <= pathEnd; i++) {
    if (i < pathEnd && url[i] !== "/") continue;
    const seg = url.slice(start, i).toLowerCase().replaceAll("%2e", ".");
    if ((seg === "." || seg === "..") && filled.some(([a, b]) => a < i && b > start)) {
      throw Object.assign(new Error(`a parameter makes the URL path segment "${url.slice(start, i)}"; "." and ".." are not allowed from parameters`), { status: 400 });
    }
    start = i + 1;
  }
  return url;
}
function variablesFrom(src, ctx) {
  let json;
  try {
    json = JSON.parse(src);
  } catch {
    return JSON.parse(String(evalValue(src, ctx)));
  }
  const fill = (v) => {
    if (Array.isArray(v)) return v.map(fill);
    if (v && typeof v === "object") return Object.fromEntries(Object.entries(v).map(([k, x]) => [k, fill(x)]));
    if (typeof v !== "string") return v;
    const p = parseValue(v);
    if (p.kind === "tpl" && p.parts.length === 1 && typeof p.parts[0] !== "string") {
      const x = evaluate(p.parts[0].ast, ctx);
      return x instanceof Date ? isoDate(x) : x;
    }
    return evalValue(v, ctx);
  };
  return fill(json);
}
function like(s, p) {
  s = s.toLowerCase();
  p = p.toLowerCase();
  let i = 0, j = 0, star = -1, mark = 0;
  while (i < s.length) {
    if (j < p.length && (p[j] === "?" || p[j] === s[i])) {
      i++;
      j++;
    } else if (j < p.length && p[j] === "*") {
      star = j++;
      mark = i;
    } else if (star >= 0) {
      j = star + 1;
      i = ++mark;
    } else return false;
  }
  while (p[j] === "*") j++;
  return j === p.length;
}
function buildDataSets(def, sources, baseCtx) {
  const sets = {};
  const raws = new Set((def.dataSets || []).filter((d) => d.relation).map((d) => d.relation.parent));
  for (const ds of def.dataSets || []) {
    let list, parents = null, xdoc = null, xels = null, asObject = null;
    if (ds.relation) {
      const prows = sets[ds.relation.parent];
      if (!prows) throw new Error(`Data set "${ds.name}": its parent "${ds.relation.parent}" must be a data set declared above it`);
      list = [];
      parents = [];
      for (const p of prows) {
        let kids = jsonPath(RAW.get(p), ds.relation.path || "$");
        if (kids == null) continue;
        if (!Array.isArray(kids)) kids = [kids];
        for (const k of kids) {
          list.push(k);
          parents.push(p);
        }
      }
    } else {
      let raw = sources[ds.source];
      if (raw === void 0) throw new Error(`Data set "${ds.name}": the source "${ds.source}" does not exist`);
      const xmlSrc = (def.dataSources || []).find((s) => s.name === ds.source && (s.type === "xml" || s.type === "soap"));
      if (xmlSrc && typeof raw === "string") raw = xmlDocument(raw, xmlSrc);
      if (isXmlDoc(raw)) {
        xdoc = raw;
        ({ rows: list, els: xels } = xmlRows(raw, ds.path));
      } else {
        ({ rows: list, parents } = jsonPathRows(raw, xmlSrc ? "$" : ds.path || "$"));
        if (list == null) list = [];
        if (!Array.isArray(list)) {
          asObject = list;
          list = [list];
        }
      }
    }
    if (!ds.relation && !xdoc) {
      const rawSrc = sources[ds.source];
      if (!list.length && ds.path && ds.path !== "$" && rawSrc != null && typeof rawSrc === "object" && !(Array.isArray(rawSrc) && !rawSrc.length) && jsonPath(rawSrc, ds.path) == null) baseCtx.warn?.(`Data set "${ds.name}": the path ${ds.path} matches nothing in the source "${ds.source}", so it has no rows`);
      if (asObject && typeof asObject === "object") {
        const inner = Object.keys(asObject).filter((k) => Array.isArray(asObject[k]) && asObject[k].some((x) => x && typeof x === "object"));
        const declared = (ds.fields || []).filter((fd) => !fd.expr && !fd.path);
        const hasFields = Object.values(asObject).some((v) => v != null && typeof v !== "object");
        if (inner.length && !hasFields && !declared.some((fd) => Object.hasOwn(asObject, fd.name))) {
          const at = ds.path && ds.path !== "$" ? ds.path : `$.${ds.source}`;
          baseCtx.warn?.(`Data set "${ds.name}": ${at} is an object, not a list of rows, so it is one row; expected an array of rows (did you mean ${at}.${inner[0]}?)`);
        }
      }
      const keys = /* @__PURE__ */ new Set();
      for (const r of list.slice(0, 200)) if (r && typeof r === "object" && !Array.isArray(r)) for (const k of Object.keys(r)) keys.add(k);
      if (keys.size) {
        const declared = (ds.fields || []).filter((fd) => !fd.expr && !fd.path);
        const missing = declared.filter((fd) => !keys.has(fd.name) && ![...keys].some((k) => k.toLowerCase() === String(fd.name).toLowerCase()));
        if (missing.length) baseCtx.warn?.(`Data set "${ds.name}": no row has the field${missing.length > 1 ? "s" : ""} ${missing.slice(0, 8).map((f4) => `"${f4.name}"`).join(", ")}${missing.length > 8 ? "…" : ""}, so ${missing.length > 1 ? "they are" : "it is"} blank (the rows have ${[...keys].slice(0, 8).map((k) => `"${k}"`).join(", ")})`);
        const src = (def.dataSources || []).find((x) => x.name === ds.source);
        if (src?.type === "csv" && keys.size === 1 && declared.length > 1) {
          const only = [...keys][0];
          const guess = [";", "	", "|", ","].find((c) => only.includes(c === "	" ? "	" : c) && c !== (src.separator || ","));
          baseCtx.warn?.(`Data source "${src.name}": every line reads as one column ("${only.slice(0, 40)}")${guess ? `; is the separator "${guess}"? Set separator on the source` : ""}`);
        }
      }
    }
    const fields = ds.fields && ds.fields.length ? ds.fields : detectFields(list, { dates: ds.detectDates !== false });
    const plain2 = fields.filter((fd) => !fd.expr);
    const calc = fields.filter((fd) => fd.expr);
    const keepRaw = raws.has(ds.name);
    const watch = badValues(ds.name, baseCtx.warn || (() => {
    }));
    const opts = new Map(fields.map((fd) => [fd, watch.opt(fd, { locale: ds.locale || baseCtx.locale, timeZone: baseCtx.timeZone })]));
    let rows = list.map((r, i) => {
      watch.at(i + 1);
      const o = {};
      for (const fd of plain2) o[fd.name] = coerce(fd.path ? xels ? xmlValue(xdoc, xels[i], fd.path) : jsonPath(r, fd.path) : r?.[fd.name], fd.type, opts.get(fd));
      if (parents && parents[i] != null) ROW_PARENT.set(o, parents[i]);
      if (keepRaw) RAW.set(o, r);
      return o;
    });
    if (calc.length) {
      const c = { ...baseCtx, dataSets: { ...baseCtx.dataSets || {}, ...sets }, fields: null };
      const failed2 = /* @__PURE__ */ new Set();
      for (const r of rows) {
        c.fields = r;
        for (const fd of calc) {
          if (failed2.has(fd.name)) {
            r[fd.name] = null;
            continue;
          }
          try {
            r[fd.name] = coerce(evalValue(fd.expr, c), fd.type, opts.get(fd));
          } catch (e) {
            failed2.add(fd.name);
            r[fd.name] = null;
            baseCtx.warn?.(`Data set "${ds.name}", field "${fd.name}": ${e.message}`);
          }
        }
      }
    }
    watch.done();
    const setCtx = { ...baseCtx, dataSets: { ...baseCtx.dataSets, ...sets }, ...ds.caseSensitive != null ? { caseSensitive: ds.caseSensitive === true } : {} };
    rows = applyFilters(rows, ds.filters, setCtx);
    rows = applySort(rows, ds.sort, setCtx);
    if (ds.relation) {
      const byParent = /* @__PURE__ */ new Map();
      for (const r of rows) {
        const p = ROW_PARENT.get(r);
        let a = byParent.get(p);
        if (!a) byParent.set(p, a = []);
        a.push(r);
      }
      RELATIONS.set(rows, { parent: ds.relation.parent, byParent });
    }
    sets[ds.name] = rows;
  }
  return sets;
}
var RAW = /* @__PURE__ */ new WeakMap();
var RELATIONS = /* @__PURE__ */ new WeakMap();
function related(rows, ctx) {
  const rel = RELATIONS.get(rows);
  const cur = rel && ctx?.current?.[rel.parent];
  if (!cur) return rows;
  if (cur.length === 1) return rel.byParent.get(cur[0]) || [];
  const out = [];
  for (const p of cur) for (const r of rel.byParent.get(p) || []) out.push(r);
  return out;
}
function applyFilters(rows, filters, baseCtx) {
  if (!filters || !filters.length) return rows;
  const c = { ...baseCtx };
  let i = 0;
  while (i < filters.length) {
    const f4 = filters[i];
    if (SET_OPS.has(String(f4.op || "").toLowerCase())) {
      rows = rankFilter(rows, f4, c);
      i++;
      continue;
    }
    let j = i;
    while (j < filters.length && !SET_OPS.has(String(filters[j].op || "").toLowerCase())) j++;
    const run = filters.slice(i, j);
    rows = rows.filter((r) => {
      c.fields = r;
      return run.every((f5) => rowFilter(f5, c));
    });
    i = j;
  }
  return rows;
}
var SET_OPS = /* @__PURE__ */ new Set(["topn", "bottomn", "toppercent", "bottompercent"]);
var PARAM_ONLY = /^=\s*Parameters\s*[.!]\s*\w+(\.Value)?\s*$/i;
var blank = (v) => v == null || v === "" || Array.isArray(v) && !v.length;
function rowFilter(f4, c) {
  const b = evalValue(f4.value, c);
  if (f4.skipBlank && (blank(b) || (f4.op === "between" || f4.op === "Between") && !Array.isArray(b) && blank(evalValue(f4.value2, c)))) return true;
  const a = evalValue(f4.expr, c);
  switch (f4.op || "=") {
    case "=":
      return looseEq(a, b);
    case "<>":
      return !looseEq(a, b);
    case ">":
      return a > b;
    case ">=":
      return a >= b;
    case "<":
      return a < b;
    case "<=":
      return a <= b;
    case "in": {
      const list = Array.isArray(b) ? b : b == null || b === "" ? [] : [b];
      if (!list.length) return PARAM_ONLY.test(String(f4.value ?? ""));
      return list.some((x) => looseEq(a, x));
    }
    case "like":
      return like(String(a ?? ""), String(b ?? ""));
    case "contains":
      return String(a ?? "").toLowerCase().includes(String(b ?? "").toLowerCase());
    case "between":
    case "Between": {
      const [lo, hi] = Array.isArray(b) ? b : [b, evalValue(f4.value2, c)];
      return a != null && lo != null && hi != null && cmpVal(a, lo) >= 0 && cmpVal(a, hi) <= 0;
    }
    default:
      throw new Error(`Unknown filter operator "${f4.op}"`);
  }
}
function rankFilter(rows, f4, c) {
  const op = String(f4.op).toLowerCase();
  c.fields = rows[0] || null;
  const n = Number(evalValue(f4.value, c));
  if (!Number.isFinite(n)) throw new Error(`The ${f4.op} filter needs a number, not "${String(f4.value).slice(0, 40)}"`);
  const keys = rows.map((r) => {
    c.fields = r;
    return evalValue(f4.expr, c);
  });
  const ranked = keys.filter((k) => k != null && k !== "");
  const count = op.endsWith("percent") ? Math.ceil(ranked.length * Math.min(n, 100) / 100) : Math.min(n, ranked.length);
  if (count <= 0) return [];
  const top = op.startsWith("top");
  ranked.sort((x, y) => top ? cmpVal(y, x) : cmpVal(x, y));
  const edge = ranked[Math.ceil(count) - 1];
  return rows.filter((_, i) => keys[i] != null && keys[i] !== "" && (top ? cmpVal(keys[i], edge) >= 0 : cmpVal(keys[i], edge) <= 0));
}
function looseEq(a, b) {
  if (a instanceof Date) a = a.getTime();
  if (b instanceof Date) b = b.getTime();
  return a == b;
}
var sortKeys = (sort, c) => sort.map((s) => {
  const v = evalValue(s.by, c);
  return v instanceof Date ? v.getTime() : v;
});
function compareKeys(ka, kb, sort, ctx) {
  for (let k = 0; k < sort.length; k++) {
    const a = ka[k], b = kb[k];
    if (a === b) continue;
    const low = ctx?.nullOrder === "low", desc = sort[k].dir === "desc";
    if (a == null) return low ? desc ? 1 : -1 : 1;
    if (b == null) return low ? desc ? -1 : 1 : -1;
    const r = sortCompare(a, b, ctx);
    if (r === 0) continue;
    return desc ? -r : r;
  }
  return 0;
}
function applySort(rows, sort, baseCtx) {
  if (!sort || !sort.length) return rows;
  const c = { ...baseCtx };
  const keys = rows.map((r) => {
    c.fields = r;
    return sortKeys(sort, c);
  });
  const idx = rows.map((_, i) => i);
  idx.sort((i, j) => compareKeys(keys[i], keys[j], sort, baseCtx) || i - j);
  return idx.map((i) => rows[i]);
}

// src/engine/style.js
var BASE_STYLE = {
  fontFamily: "Inter",
  fontSize: 9,
  fontWeight: "normal",
  fontStyle: "normal",
  color: "#1f2328",
  backgroundColor: null,
  backgroundImage: null,
  // URL or data URI (an expression is fine)
  backgroundFit: "cover",
  // cover | contain | fill
  textAlign: "auto",
  // auto = numbers right, text left
  verticalAlign: "top",
  padding: 2,
  lineHeight: 1.25,
  border: null,
  // "1 solid #ccc" for all sides
  borderTop: null,
  borderRight: null,
  borderBottom: null,
  borderLeft: null,
  format: null,
  wrap: true,
  textDecoration: "none",
  // underline | line-through | both
  textDecorationColor: null,
  // the line's colour; null = the text colour
  writingMode: "lr-tb",
  // tb-rl = vertical: columns right to left, CJK upright, other text turned 90°
  // shapes and lines
  fill: null,
  stroke: "#1f2328",
  strokeWidth: 1,
  strokeDash: "solid",
  radius: 0
};
function resolveStyle(layers, ctx) {
  let node = null, allStatic = true;
  for (const l of layers) {
    if (!l || typeof l !== "object") continue;
    if (hasDynamic(l)) {
      allStatic = false;
      break;
    }
  }
  if (allStatic) {
    let map = CACHE;
    for (const l of layers) {
      if (!l || typeof l !== "object") continue;
      let next = map.get(l);
      if (!next) {
        next = { map: /* @__PURE__ */ new WeakMap(), value: null };
        map.set(l, next);
      }
      node = next;
      map = next.map;
    }
    if (node?.value) return node.value;
  }
  const out = {};
  for (const l of layers) {
    if (!l || typeof l !== "object") continue;
    for (const k in l) {
      const v = l[k];
      if (v === void 0) continue;
      out[k] = isDynamic(v) ? safe(v, ctx) : v;
    }
  }
  if (allStatic && node) node.value = Object.freeze(out);
  return out;
}
var CACHE = /* @__PURE__ */ new WeakMap();
var DYN = /* @__PURE__ */ new WeakMap();
function hasDynamic(l) {
  let d = DYN.get(l);
  if (d === void 0) {
    d = false;
    for (const k in l) if (isDynamic(l[k])) {
      d = true;
      break;
    }
    DYN.set(l, d);
  }
  return d;
}
function safe(v, ctx) {
  try {
    return evalValue(v, ctx);
  } catch {
    return void 0;
  }
}
function parseBorder(b) {
  if (!b || b === "none") return null;
  if (typeof b === "object") return b.width > 0 ? { width: b.width, style: b.style || "solid", color: b.color || "#000" } : null;
  const parts = String(b).trim().split(/\s+/);
  let width = 1, style = "solid", color2 = "#000000";
  for (const p of parts) {
    if (/^[\d.]+(pt)?$/.test(p)) width = parseFloat(p);
    else if (["solid", "dashed", "dotted", "double"].includes(p)) style = p;
    else if (p !== "none") color2 = p;
  }
  return width > 0 ? { width, style, color: color2 } : null;
}
function borders(st) {
  const all = parseBorder(st.border);
  const side = (k) => st[k] != null ? parseBorder(st[k]) : all;
  return { top: side("borderTop"), right: side("borderRight"), bottom: side("borderBottom"), left: side("borderLeft") };
}
var padding = (st) => {
  if (!Object.isFrozen(st)) return normBox(st.padding ?? 0);
  let p = PADS.get(st);
  if (!p) {
    p = Object.freeze(normBox(st.padding ?? 0));
    PADS.set(st, p);
  }
  return p;
};
var PADS = /* @__PURE__ */ new WeakMap();
var DASH = { solid: null, dashed: [4, 3], dotted: [1, 2] };

// src/engine/image.js
var IMAGE_LIMITS = {
  bytes: 10 * 1024 * 1024,
  // one image
  total: 50 * 1024 * 1024,
  // all images of one render (each distinct image counted once)
  pixels: 4e7,
  // a PNG larger than this is not decoded (a small file can inflate to gigabytes)
  svgBytes: 2 * 1024 * 1024,
  // an SVG drawn as vector paths in the PDF
  svgShapes: 1e4
};
var PX = 0.75;
var MIME = { png: "image/png", jpeg: "image/jpeg", gif: "image/gif", webp: "image/webp", svg: "image/svg+xml" };
function sniff(b) {
  if (b.length >= 8 && b[0] === 137 && b[1] === 80 && b[2] === 78 && b[3] === 71) return "png";
  if (b.length >= 3 && b[0] === 255 && b[1] === 216 && b[2] === 255) return "jpeg";
  if (b.length >= 6 && b[0] === 71 && b[1] === 73 && b[2] === 70 && b[3] === 56) return "gif";
  if (b.length >= 12 && b[0] === 82 && b[1] === 73 && b[2] === 70 && b[3] === 70 && b[8] === 87 && b[9] === 69 && b[10] === 66 && b[11] === 80) return "webp";
  const head = String.fromCharCode(...b.subarray(0, 512)).replace(/^﻿|^\xEF\xBB\xBF/, "").trimStart();
  if (/^<(\?xml|svg|!--|!DOCTYPE svg)/i.test(head) && /<svg[\s>]/i.test(head + (b.length > 512 ? "<svg " : ""))) return "svg";
  return null;
}
function toBase64(b) {
  let s = "";
  for (let i = 0; i < b.length; i += 32768) s += String.fromCharCode(...b.subarray(i, i + 32768));
  return btoa(s);
}
function fromBase64(s) {
  const bin = atob(s);
  const out = new Uint8Array(bin.length);
  for (let i = 0; i < bin.length; i++) out[i] = bin.charCodeAt(i);
  return out;
}
var B64 = /^[A-Za-z0-9+/]+={0,2}$/;
function toDataUri(v) {
  if (v instanceof ArrayBuffer) v = new Uint8Array(v);
  if (v instanceof Uint8Array) {
    if (v.length > IMAGE_LIMITS.bytes) return null;
    const type2 = sniff(v);
    return type2 ? `data:${MIME[type2]};base64,${toBase64(v)}` : null;
  }
  if (typeof v !== "string" || v.length < 16 || v.startsWith("data:")) return v;
  if (/[^A-Za-z0-9+/=\r\n]/.test(v)) return v;
  const s = v.replace(/[\r\n]/g, "");
  if (!B64.test(s) || s.length % 4) return v;
  let type;
  try {
    type = sniff(fromBase64(s.slice(0, 700)));
  } catch {
    return v;
  }
  return type ? `data:${MIME[type]};base64,${s}` : v;
}
function splitDataUri(uri) {
  if (typeof uri !== "string" || !/^data:/i.test(uri)) return null;
  const c = uri.indexOf(",");
  if (c < 0) return null;
  const meta = uri.slice(5, c);
  return { meta, b64: meta.slice(meta.lastIndexOf(";") + 1).trim().toLowerCase() === "base64" && meta.includes(";"), body: uri.slice(c + 1) };
}
function dataUriBytes(uri) {
  const d = splitDataUri(uri);
  if (!d) return 0;
  return d.b64 ? Math.floor(d.body.length * 3 / 4) : d.body.length;
}
function dataUriHead(uri, max = 262144) {
  const d = splitDataUri(uri);
  if (!d) return null;
  try {
    if (d.b64) return fromBase64(d.body.slice(0, Number.isFinite(max) ? Math.ceil(max / 3) * 4 : void 0).replace(/\s/g, ""));
    return new TextEncoder().encode(decodeURIComponent(d.body.slice(0, max)));
  } catch {
    return null;
  }
}
var UNIT = { px: 1, pt: 4 / 3, pc: 16, mm: 96 / 25.4, cm: 96 / 2.54, in: 96, "": 1 };
function svgLength(v) {
  const t = String(v ?? "").trim();
  if (t.length > 64) return null;
  const m = /^([\d.]+(?:e[-+]?\d+)?)(px|pt|pc|mm|cm|in)?$/i.exec(t);
  if (!m) return null;
  const n = Number(m[1]) * UNIT[(m[2] || "").toLowerCase()];
  return Number.isFinite(n) && n > 0 ? n : null;
}
var isName = (c) => c >= "a" && c <= "z" || c >= "A" && c <= "Z" || c >= "0" && c <= "9" || c === "_" || c === ":" || c === "-" || c === ".";
var isSpace2 = (c) => c === " " || c === "	" || c === "\n" || c === "\r";
function* xmlTags(text) {
  const n = text.length;
  let i = 0;
  while (i < n) {
    const lt = text.indexOf("<", i);
    if (lt < 0) return;
    if (text.startsWith("<!--", lt)) {
      const e = text.indexOf("-->", lt + 4);
      if (e < 0) return;
      i = e + 3;
      continue;
    }
    if (text.startsWith("<![CDATA[", lt)) {
      const e = text.indexOf("]]>", lt + 9);
      if (e < 0) return;
      i = e + 3;
      continue;
    }
    if (text[lt + 1] === "?" || text[lt + 1] === "!") {
      const e = text.indexOf(">", lt + 2);
      if (e < 0) return;
      i = e + 1;
      continue;
    }
    let j = lt + 1, q = "";
    for (; j < n; j++) {
      const c = text[j];
      if (q) {
        if (c === q) q = "";
      } else if (c === '"' || c === "'") q = c;
      else if (c === ">") break;
    }
    if (j >= n) return;
    i = j + 1;
    let body = text.slice(lt + 1, j);
    const close = body[0] === "/";
    if (close) body = body.slice(1);
    const self2 = body.endsWith("/");
    if (self2) body = body.slice(0, -1);
    let k = 0;
    while (k < body.length && isName(body[k])) k++;
    const name = body.slice(0, k);
    if (!/^[a-zA-Z]/.test(name)) continue;
    yield { close, name, attrs: body.slice(k), self: self2 };
  }
}
function xmlAttrs(s) {
  const a = /* @__PURE__ */ Object.create(null);
  const n = s.length;
  let i = 0;
  while (i < n) {
    while (i < n && !isName(s[i])) i++;
    const st = i;
    while (i < n && isName(s[i])) i++;
    const name = s.slice(st, i);
    while (i < n && isSpace2(s[i])) i++;
    if (s[i] !== "=") continue;
    i++;
    while (i < n && isSpace2(s[i])) i++;
    const q = s[i];
    if (q !== '"' && q !== "'") continue;
    const e = s.indexOf(q, i + 1);
    if (e < 0) break;
    if (name) a[name] = s.slice(i + 1, e);
    i = e + 1;
  }
  return a;
}
function svgRootAttrs(text) {
  for (const t of xmlTags(String(text))) if (!t.close && t.name.toLowerCase() === "svg") return xmlAttrs(t.attrs);
  return null;
}
function svgSize(text) {
  const a = svgRootAttrs(text);
  if (!a) return null;
  const vb = String(a.viewBox || "").trim().split(/[\s,]+/).map(Number);
  const hasVb = vb.length === 4 && vb.every(Number.isFinite) && vb[2] > 0 && vb[3] > 0;
  let w = svgLength(a.width), h = svgLength(a.height);
  if (w && !h) h = hasVb ? w * vb[3] / vb[2] : null;
  if (h && !w) w = hasVb ? h * vb[2] / vb[3] : null;
  if (!w && hasVb) {
    w = vb[2];
    h = vb[3];
  }
  return w && h ? { w, h } : null;
}
function imageInfoOf(b) {
  const type = sniff(b);
  if (!type) return null;
  const u32 = (i) => (b[i] << 24 | b[i + 1] << 16 | b[i + 2] << 8 | b[i + 3]) >>> 0;
  if (type === "png") return pngInfo(b);
  if (type === "gif" && b.length >= 10) return { type, w: b[6] | b[7] << 8, h: b[8] | b[9] << 8 };
  if (type === "jpeg") {
    for (let i = 2; i + 9 < b.length; ) {
      if (b[i] !== 255) {
        i++;
        continue;
      }
      const mk = b[i + 1];
      if (mk === 255) {
        i++;
        continue;
      }
      if (mk === 216 || mk === 1 || mk >= 208 && mk <= 215) {
        i += 2;
        continue;
      }
      if (mk >= 192 && mk <= 207 && mk !== 196 && mk !== 200 && mk !== 204) return { type, w: b[i + 7] << 8 | b[i + 8], h: b[i + 5] << 8 | b[i + 6] };
      i += 2 + (b[i + 2] << 8 | b[i + 3]);
    }
    return { type };
  }
  if (type === "svg") {
    const s = svgSize(new TextDecoder().decode(b));
    return s ? { type, ...s } : { type };
  }
  return { type };
}
function pngInfo(b) {
  const u32 = (i) => (b[i] << 24 | b[i + 1] << 16 | b[i + 2] << 8 | b[i + 3]) >>> 0;
  let w = 0, h = 0, ihdrs = 0, animated = false;
  for (let off = 8; off + 8 <= b.length; ) {
    const len = u32(off);
    const t = String.fromCharCode(b[off + 4], b[off + 5], b[off + 6], b[off + 7]);
    const d = off + 8;
    if (t === "IHDR" && d + 8 <= b.length) {
      w = u32(d);
      h = u32(d + 4);
      ihdrs++;
    } else if (t === "acTL" || t === "fcTL" || t === "fdAT") animated = true;
    else if (t === "IEND") break;
    off = d + len + 4;
  }
  if (!ihdrs) return { type: "png" };
  return { type: "png", w, h, ...animated || ihdrs > 1 ? { suspect: true } : {} };
}
function imageInfo(uri) {
  const b = typeof uri === "string" && uri.startsWith("data:") ? dataUriHead(uri) : null;
  return b ? imageInfoOf(b) : null;
}
function resolveImageSrc(v, who, c) {
  var _a;
  if (v == null || v === "" || v === "#Error") return null;
  if (typeof v === "string" && v.startsWith("embedded:")) {
    const name = v.slice(9);
    const img = c.images && Object.prototype.hasOwnProperty.call(c.images, name) ? c.images[name] : void 0;
    if (typeof img !== "string" || !/^data:image\/[\w.+-]+[;,]/i.test(img)) {
      c.warn(`${who}: there is no embedded image named "${name}" (add it to the report's images as a data:image/… URI)`);
      return null;
    }
    v = img;
  }
  const memo2 = c.budget ? (_a = c.budget).memo || (_a.memo = /* @__PURE__ */ new Map()) : null;
  let u = memo2?.get(v);
  if (u === void 0) {
    u = toDataUri(v);
    memo2?.set(v, u);
  }
  if (u == null) {
    c.warn(`${who}: the image data is not a PNG, JPEG, GIF, WebP or SVG image, or is larger than 10 MB`);
    return null;
  }
  const s = String(u);
  if (s.startsWith("data:")) {
    const n = dataUriBytes(s);
    if (n > IMAGE_LIMITS.bytes) {
      c.warn(`${who}: the image is ${(n / 1048576).toFixed(1)} MB; images are limited to 10 MB each, so it is left out`);
      return null;
    }
    const b = c.budget;
    if (b && !b.seen.has(s)) {
      if (b.bytes + n > IMAGE_LIMITS.total) {
        c.warn(`${who}: the report's images pass 50 MB in all, so this one is left out`);
        return null;
      }
      b.seen.add(s);
      b.bytes += n;
    }
  }
  return s;
}

// src/engine/items/paint.js
var MAX_CACHED_TEXT = 256;
paintBoxAt.shapes = [
  { x: null, y: null, w: null, h: null },
  // a text's clip
  { x: null, y: null, text: null, w: null },
  // a text line
  { t: null, font: null, size: null, color: null, lines: null, clip: null },
  // a text
  { t: null, x: null, y: null, w: null, h: null, fill: null },
  // a rect
  { t: null, x1: null, y1: null, x2: null, y2: null, stroke: null, strokeWidth: null, dash: null }
  // a line
];
function layoutTextLines(text, st, width, m, opt) {
  const wrap = opt?.wrap ?? true;
  const atom = !!opt?.atom;
  if (typeof text !== "string" || text.length > MAX_CACHED_TEXT || !m.boxes || !Object.isFrozen(st)) return layoutText(text, st, width, m, wrap, atom);
  let byW = m.boxes.get(st);
  if (!byW) {
    byW = /* @__PURE__ */ new Map();
    m.boxes.set(st, byW);
  }
  const wk = wrap ? atom ? `a${width}` : width : -1 - width;
  let byText = byW.get(wk);
  if (!byText) {
    byText = /* @__PURE__ */ new Map();
    byW.set(wk, byText);
  }
  const tl = byText.get(text);
  if (tl) return tl;
  if (++m.boxCount > 2e5) {
    m.boxes = /* @__PURE__ */ new WeakMap();
    m.boxCount = 0;
  }
  if (tl === void 0) {
    byText.set(text, 0);
    return layoutText(text, st, width, m, wrap, atom);
  }
  const out = layoutText(text, st, width, m, wrap, atom);
  Object.freeze(out.lines);
  byText.set(text, Object.freeze(out));
  return out;
}
function lookOf(st, m) {
  let l = m.looks && Object.isFrozen(st) ? m.looks.get(st) : void 0;
  if (!l) {
    const size = Number(st.fontSize) || 9;
    l = { key: resolveFontKey(st.fontFamily, st.fontWeight, st.fontStyle, m.unknownFonts), size, pad: padding(st), lh: size * (Number(st.lineHeight) || 1.25) };
    if (m.looks && Object.isFrozen(st)) m.looks.set(st, l);
  }
  return l;
}
var NUMBER = /^[\s(+\-\u2212]*[\p{Sc}]?\s?[\p{Sc}A-Z]{0,3}\.?\s?[\d][\d.,'\u00a0\u202f\s]*(?:[eE][+-]?\d+)?\s?%?\)?\s?[\p{Sc}A-Z]{0,3}$/u;
var MIN_FONT = 5;
var MIN_NUMBER_FONT = 3;
function fitSize(text, key, size, inner, m, atom = false) {
  const s = String(text);
  if (s.length > 200) return size;
  const num4 = atom || NUMBER.test(s.trim());
  let longest = 0, word = "";
  if (num4) longest = m.width(s.trim(), key, size);
  else for (const w of s.split(/\s+/)) {
    const ww = w ? m.width(w, key, size) : 0;
    if (ww > longest) {
      longest = ww;
      word = w;
    }
  }
  if (longest <= inner) return size;
  const floor = num4 || NUMBER.test(word) || word.length <= 12 && word === s.trim() ? Math.min(size, MIN_NUMBER_FONT) : s.length <= 40 ? Math.min(size, MIN_FONT) : Math.max(MIN_FONT, size * 0.75);
  return Math.max(floor, Math.min(size, Math.floor((size * (inner / longest) - 0.01) * 2) / 2));
}
function layoutText(text, st, width, m, wrap, atom = false) {
  const look = lookOf(st, m);
  const { key, pad: pad2 } = look;
  const inner = Math.max(1, width - pad2[1] - pad2[3]);
  const wraps = wrap && st.wrap !== false;
  const size = wraps && !m.direction(String(text), key) ? fitSize(text, key, look.size, inner, m, atom && !/\n/.test(String(text))) : look.size;
  const lh = size === look.size ? look.lh : look.lh * (size / look.size);
  const lines = wraps ? size !== look.size && (atom && !/\n/.test(String(text)) || NUMBER.test(String(text).trim())) ? [{ text: String(text).trim(), width: m.width(String(text).trim(), key, size), end: true }] : m.wrap(text, key, size, inner) : String(text).split(/\r?\n/).map((t) => {
    const dir = m.direction(t, key);
    return dir ? { text: t, width: m.width(t, key, size, dir), dir } : { text: t, width: m.width(t, key, size) };
  });
  return { key, size, lines, lh, pad: pad2, inner, needed: lines.length * lh + pad2[0] + pad2[2] };
}
function paintBox({ x, y, w, h, st, tl, numeric = false, m, ellipsis = true, out = null, cell = null }) {
  return paintBoxAt(x, y, w, h, st, tl, numeric, m, ellipsis, out || [], cell);
}
function paintBoxAt(x, y, w, h, st, tl, numeric, m, ellipsis, items, cell = null) {
  const radius = Math.max(0, Math.min(Number(st.radius) || 0, w / 2, h / 2));
  if (st.backgroundColor) items.push(radius ? { t: "rect", x, y, w, h, fill: st.backgroundColor, radius } : { t: "rect", x, y, w, h, fill: st.backgroundColor });
  if (st.backgroundImage) items.push({ t: "image", x, y, w, h, src: st.backgroundImage, fit: st.backgroundFit || "cover" });
  if (tl && tl.lines.length) {
    const { key, size, lh, pad: pad2 } = tl;
    let lines = tl.lines;
    const avail = h - pad2[0] - pad2[2];
    const maxLines = Math.max(1, Math.floor((avail + 1.01) / lh));
    if (lines.length > maxLines) {
      lines = lines.slice(0, maxLines);
      if (ellipsis) {
        const last = lines[lines.length - 1];
        const t = m.ellipsize(last.text + " …", key, size, tl.inner, last.dir);
        lines[lines.length - 1] = { ...last, text: t, width: m.width(t, key, size, last.dir) };
      }
    }
    let ascent = 0, half = 0;
    const blockH = lines.length * lh;
    let top = y + pad2[0];
    if (st.verticalAlign === "middle") top = y + pad2[0] + (avail - blockH) / 2;
    else if (st.verticalAlign === "bottom") top = y + h - pad2[2] - blockH;
    const auto = st.textAlign === "auto" || !st.textAlign;
    const cut = lines.length < tl.lines.length;
    const out = [];
    for (let i = 0; i < lines.length; i++) {
      const ln = lines[i];
      if (ln.text === "") continue;
      if (!ascent) {
        const mt = m.metrics(key, size);
        ascent = mt.ascent;
        half = (lh - (ascent + mt.descent)) / 2;
      }
      const align = auto ? numeric || ln.dir === "rtl" ? "right" : "left" : st.textAlign;
      const ly = top + i * lh + half + ascent;
      if (align === "justify" && !ln.end && !ln.dir && !(cut && i === lines.length - 1)) {
        const words = ln.text.split(" ").filter(Boolean);
        if (words.length > 1) {
          const ws = words.map((wd) => m.width(wd, key, size));
          const gap = (tl.inner - ws.reduce((s, v) => s + v, 0)) / (words.length - 1);
          let wx = x + pad2[3];
          for (let k = 0; k < words.length; k++) {
            out.push({ x: wx, y: ly, text: words[k], w: ws[k] });
            wx += ws[k] + gap;
          }
          continue;
        }
      }
      let lx = x + pad2[3];
      if (align === "right") lx = x + w - pad2[1] - ln.width;
      else if (align === "center") lx = x + pad2[3] + (tl.inner - ln.width) / 2;
      const o = { x: lx, y: ly, text: ln.text, w: ln.width };
      if (ln.dir) o.dir = ln.dir;
      out.push(o);
    }
    if (out.length) {
      const deco = st.textDecoration && st.textDecoration !== "none" ? String(st.textDecoration).toLowerCase() : "";
      const under = deco.includes("underline"), strike = deco.includes("line-through");
      const color2 = st.color || "#000", ls = out.length === 1 ? [out[0]] : out.slice(), clip = { x, y, w, h };
      const text = under || strike ? cell ? { t: "text", font: key, size, color: color2, lines: ls, clip, deco, cell } : { t: "text", font: key, size, color: color2, lines: ls, clip, deco } : cell ? { t: "text", font: key, size, color: color2, lines: ls, clip, cell } : { t: "text", font: key, size, color: color2, lines: ls, clip };
      items.push(text);
      if (under || strike) {
        const d = m.decoration(key, size), stroke = st.textDecorationColor || st.color || "#000";
        for (const l of text.lines) {
          if (under) items.push({ t: "line", x1: l.x, y1: l.y + d.underlineY, x2: l.x + l.w, y2: l.y + d.underlineY, stroke, strokeWidth: d.underlineWidth, dash: null });
          if (strike) items.push({ t: "line", x1: l.x, y1: l.y + d.strikeY, x2: l.x + l.w, y2: l.y + d.strikeY, stroke, strokeWidth: d.strikeWidth, dash: null });
        }
      }
    }
  }
  const b = bordersOf(st);
  if (radius && same(b.top, b.right) && same(b.top, b.bottom) && same(b.top, b.left)) {
    items.push({ t: "rect", x, y, w, h, fill: null, stroke: b.top.color, strokeWidth: b.top.width, dash: DASH[b.top.style] || null, radius });
    return items;
  }
  if (b.top) items.push(line(x, y, x + w, y, b.top));
  if (b.bottom) items.push(line(x, y + h, x + w, y + h, b.bottom));
  if (b.left) items.push(line(x, y, x, y + h, b.left));
  if (b.right) items.push(line(x + w, y, x + w, y + h, b.right));
  return items;
}
var same = (p, q) => p && q && p.width === q.width && p.style === q.style && p.color === q.color;
var BORDERS = /* @__PURE__ */ new WeakMap();
function bordersOf(st) {
  if (!Object.isFrozen(st)) return borders(st);
  let b = BORDERS.get(st);
  if (!b) {
    b = borders(st);
    BORDERS.set(st, b);
  }
  return b;
}
function line(x1, y1, x2, y2, b) {
  return { t: "line", x1, y1, x2, y2, stroke: b.color, strokeWidth: b.width, dash: DASH[b.style] || null };
}
var OWNED = /* @__PURE__ */ new WeakSet();
function placeItems(items, dx, dy, out) {
  if (!OWNED.delete(items)) {
    for (const it of shiftItems(items, dx, dy)) out.push(it);
    return;
  }
  for (const it of items) {
    moveItem(it, dx, dy);
    out.push(it);
  }
}
function moveItem(it, dx, dy) {
  switch (it.t) {
    case "text":
      for (const l of it.lines) {
        l.x += dx;
        l.y += dy;
      }
      if (it.clip) {
        it.clip.x += dx;
        it.clip.y += dy;
      }
      break;
    case "line":
      it.x1 += dx;
      it.y1 += dy;
      it.x2 += dx;
      it.y2 += dy;
      break;
    case "ellipse":
      it.cx += dx;
      it.cy += dy;
      break;
    case "field":
      it.x += dx;
      it.y += dy;
      it.draw = shiftItems(it.draw, dx, dy);
      break;
    default:
      it.x += dx;
      it.y += dy;
  }
  if (it.rotate) it.rotate = { ...it.rotate, cx: it.rotate.cx + dx, cy: it.rotate.cy + dy };
}
function shiftItems(items, dx, dy) {
  return items.map((it) => {
    let o;
    switch (it.t) {
      case "text":
        o = { ...it, lines: it.lines.map((l) => ({ ...l, x: l.x + dx, y: l.y + dy })), clip: it.clip && { ...it.clip, x: it.clip.x + dx, y: it.clip.y + dy } };
        break;
      case "line":
        o = { ...it, x1: it.x1 + dx, y1: it.y1 + dy, x2: it.x2 + dx, y2: it.y2 + dy };
        break;
      case "ellipse":
        o = { ...it, cx: it.cx + dx, cy: it.cy + dy };
        break;
      case "field":
        o = { ...it, x: it.x + dx, y: it.y + dy, draw: shiftItems(it.draw, dx, dy) };
        break;
      default:
        o = { ...it, x: it.x + dx, y: it.y + dy };
    }
    if (it.rotate) o.rotate = { ...it.rotate, cx: it.rotate.cx + dx, cy: it.rotate.cy + dy };
    return o;
  });
}

// src/engine/items/chart-kit.js
var CAPS = { categories: 1e3, series: 50, points: 1e4, overlays: 20, period: 1e3 };
var PALETTES = {
  default: ["#2563eb", "#f59e0b", "#10b981", "#ef4444", "#8b5cf6", "#06b6d4", "#ec4899", "#84cc16", "#64748b", "#f97316"],
  office: ["#4472c4", "#ed7d31", "#a5a5a5", "#ffc000", "#5b9bd5", "#70ad47", "#264478", "#9e480e", "#636363", "#997300"],
  // Okabe–Ito: tells the series apart with any kind of colour blindness
  colorblind: ["#0072b2", "#e69f00", "#009e73", "#d55e00", "#cc79a7", "#56b4e9", "#000000", "#f0e442"],
  vivid: ["#e6194b", "#3cb44b", "#4363d8", "#f58231", "#911eb4", "#42d4f4", "#f032e6", "#9a6324"],
  pastel: ["#8fb3e8", "#f6b78c", "#94d3a2", "#f19c9c", "#c3a6e6", "#8ed3dc", "#f2a7cf", "#c9de8a"],
  ocean: ["#03396c", "#005b96", "#0e7c86", "#2a9d8f", "#6497b1", "#48cae4", "#90e0ef", "#023047"],
  sunset: ["#9d0208", "#d00000", "#dc2f02", "#e85d04", "#f48c06", "#faa307", "#6a040f", "#ffba08"],
  forest: ["#1b4332", "#2d6a4f", "#40916c", "#52b788", "#74c69d", "#95d5b2", "#606c38", "#283618"],
  berry: ["#5a189a", "#7b2cbf", "#9d4edd", "#c77dff", "#b5179e", "#f72585", "#7209b7", "#3a0ca3"],
  earth: ["#7f5539", "#9c6644", "#b08968", "#ddb892", "#6b705c", "#a5a58d", "#cb997e", "#3f4238"],
  grayscale: ["#111827", "#374151", "#6b7280", "#9ca3af", "#4b5563", "#1f2937", "#d1d5db", "#030712"],
  highContrast: ["#000000", "#d00000", "#0033cc", "#007a00", "#e07000", "#8000a0", "#008080", "#806000"]
};
var HEX = /^#([0-9a-f]{3}|[0-9a-f]{6}|[0-9a-f]{8})$/i;
function paletteOf(p) {
  if (Array.isArray(p)) {
    const ok = p.slice(0, 64).filter((c) => typeof c === "string" && HEX.test(c));
    return ok.length ? ok : PALETTES.default;
  }
  return typeof p === "string" && Object.hasOwn(PALETTES, p) && PALETTES[p] || PALETTES.default;
}
function rgbOf(c) {
  if (typeof c !== "string" || !HEX.test(c)) return null;
  let h = c.slice(1);
  if (h.length === 3) h = h.replace(/./g, (x) => x + x);
  return [0, 2, 4].map((i) => parseInt(h.slice(i, i + 2), 16) / 255);
}
var lum = (rgb) => {
  const [r, g, b] = rgb.map((v) => v <= 0.03928 ? v / 12.92 : ((v + 0.055) / 1.055) ** 2.4);
  return 0.2126 * r + 0.7152 * g + 0.0722 * b;
};
function contrast(a, b) {
  const x = rgbOf(a), y = rgbOf(b);
  if (!x || !y) return 1;
  const [l1, l2] = [lum(x), lum(y)].sort((p, q) => q - p);
  return (l1 + 0.05) / (l2 + 0.05);
}
var DARK_INK = "#111827";
function inkOn(fill) {
  if (!rgbOf(fill)) return "#ffffff";
  return contrast(fill, "#ffffff") >= contrast(fill, DARK_INK) ? "#ffffff" : DARK_INK;
}
function niceScale(min, max, ticks = 5) {
  if (!Number.isFinite(min) || !Number.isFinite(max)) {
    min = 0;
    max = 1;
  }
  if (min === max) {
    if (max === 0) max = 1;
    else if (max > 0) min = 0;
    else max = 0;
  }
  const range = niceNum(max - min, false);
  const step3 = niceNum(range / Math.max(1, ticks - 1), true);
  return { lo: Math.floor(min / step3) * step3, hi: Math.ceil(max / step3) * step3, step: step3 };
}
function niceScaleSpan(min, max, ticks = 5) {
  if (!Number.isFinite(min) || !Number.isFinite(max) || !(max > min)) return niceScale(min, max, ticks);
  const step3 = niceNum((max - min) / Math.max(1, ticks - 1), true);
  return { lo: Math.floor(min / step3) * step3, hi: Math.ceil(max / step3) * step3, step: step3 };
}
function niceNum(x, round) {
  const e = Math.floor(Math.log10(x));
  const f4 = x / 10 ** e;
  const nf2 = round ? f4 < 1.5 ? 1 : f4 < 3 ? 2 : f4 < 7 ? 5 : 10 : f4 <= 1 ? 1 : f4 <= 2 ? 2 : f4 <= 5 ? 5 : 10;
  return nf2 * 10 ** e;
}
function linearTicks(lo, hi, step3) {
  const out = [];
  if (!(step3 > 0) || !Number.isFinite(lo) || !Number.isFinite(hi)) return [lo, hi];
  for (let v = lo, i = 0; v <= hi + step3 / 2 && i < 200; v += step3, i++) out.push(Math.round(v * 1e9) / 1e9 || 0);
  return out;
}
function logTicks(min, max) {
  const a = Math.floor(Math.log10(min)), b = Math.max(a + 1, Math.ceil(Math.log10(max)));
  const out = [];
  for (let e = a; e <= b && out.length < 60; e++) out.push(Number((10 ** e).toPrecision(12)));
  return out;
}
var r2 = (v) => Math.round(v * 100) / 100;
function curvePath(pts, mode = "straight", { along = "x", move = true } = {}) {
  if (!pts.length) return "";
  const sw = along === "y";
  const P = sw ? pts.map((p) => ({ x: p.y, y: p.x })) : pts;
  const xy = (x, y) => sw ? `${r2(y)} ${r2(x)}` : `${r2(x)} ${r2(y)}`;
  let d = `${move ? "M" : "L"} ${xy(P[0].x, P[0].y)}`;
  if (P.length === 1) return d;
  if (mode === "step") {
    for (let i = 1; i < P.length; i++) {
      const mid = (P[i - 1].x + P[i].x) / 2;
      d += sw ? ` V ${r2(mid)} H ${r2(P[i].y)} V ${r2(P[i].x)}` : ` H ${r2(mid)} V ${r2(P[i].y)} H ${r2(P[i].x)}`;
    }
    return d;
  }
  if (mode !== "smooth" || P.length < 3) {
    for (let i = 1; i < P.length; i++) d += ` L ${xy(P[i].x, P[i].y)}`;
    return d;
  }
  const n = P.length, dx = [], s = [], m = new Array(n);
  for (let i = 0; i < n - 1; i++) {
    dx[i] = P[i + 1].x - P[i].x;
    s[i] = dx[i] ? (P[i + 1].y - P[i].y) / dx[i] : 0;
  }
  m[0] = s[0];
  m[n - 1] = s[n - 2];
  for (let i = 1; i < n - 1; i++) m[i] = s[i - 1] * s[i] <= 0 ? 0 : (s[i - 1] + s[i]) / 2;
  for (let i = 0; i < n - 1; i++) {
    if (s[i] === 0) {
      m[i] = 0;
      m[i + 1] = 0;
      continue;
    }
    const a = m[i] / s[i], b = m[i + 1] / s[i], h = a * a + b * b;
    if (h > 9) {
      const t = 3 / Math.sqrt(h);
      m[i] = t * a * s[i];
      m[i + 1] = t * b * s[i];
    }
  }
  for (let i = 0; i < n - 1; i++) {
    const h = dx[i] / 3;
    d += ` C ${xy(P[i].x + h, P[i].y + m[i] * h)} ${xy(P[i + 1].x - h, P[i + 1].y - m[i + 1] * h)} ${xy(P[i + 1].x, P[i + 1].y)}`;
  }
  return d;
}
function fitTrend(pts, kind = "linear", order = 2) {
  pts = pts.filter(([x, y]) => Number.isFinite(x) && Number.isFinite(y));
  if (kind === "exp") {
    const pos = pts.filter(([, y]) => y > 0);
    const l = fitPoly(pos.map(([x, y]) => [x, Math.log(y)]), 1);
    return l && { at: (x) => Math.exp(l.at(x)), order: 1 };
  }
  if (kind === "poly") return fitPoly(pts, Math.max(2, Math.min(6, Math.round(Number(order)) || 2)));
  return fitPoly(pts, 1);
}
function fitPoly(pts, order) {
  const n = pts.length;
  if (n < order + 1 || n < 2) return null;
  let mean = 0;
  for (const [x] of pts) mean += x;
  mean /= n;
  let sc = 0;
  for (const [x] of pts) sc = Math.max(sc, Math.abs(x - mean));
  sc = sc || 1;
  const k = order + 1;
  const A = Array.from({ length: k }, () => new Array(k + 1).fill(0));
  for (const [x, y] of pts) {
    const u = (x - mean) / sc;
    const pw = [1];
    for (let i = 1; i < 2 * k; i++) pw.push(pw[i - 1] * u);
    for (let r = 0; r < k; r++) {
      for (let c = 0; c < k; c++) A[r][c] += pw[r + c];
      A[r][k] += pw[r] * y;
    }
  }
  for (let c = 0; c < k; c++) {
    let p = c;
    for (let r = c + 1; r < k; r++) if (Math.abs(A[r][c]) > Math.abs(A[p][c])) p = r;
    if (Math.abs(A[p][c]) < 1e-12) return null;
    [A[c], A[p]] = [A[p], A[c]];
    for (let r = 0; r < k; r++) if (r !== c) {
      const f4 = A[r][c] / A[c][c];
      for (let j = c; j <= k; j++) A[r][j] -= f4 * A[c][j];
    }
  }
  const coef = A.map((row, i) => row[k] / row[i]);
  return { order, at: (x) => {
    const u = (x - mean) / sc;
    let v = 0;
    for (let i = k - 1; i >= 0; i--) v = v * u + coef[i];
    return v;
  } };
}
function movingAverage(values, period) {
  const p = Math.max(1, Math.min(CAPS.period, Math.round(Number(period)) || 1));
  const out = new Array(values.length).fill(null);
  let sum = 0, run = 0;
  for (let i = 0; i < values.length; i++) {
    const v = values[i];
    if (v == null || !Number.isFinite(v)) {
      sum = 0;
      run = 0;
      continue;
    }
    sum += v;
    run++;
    if (run > p) {
      sum -= values[i - p];
      run = p;
    }
    if (run === p) out[i] = sum / p;
  }
  return out;
}
var LabelPlacer = class {
  constructor(bounds, cell = 24) {
    this.b = bounds;
    this.cell = cell;
    this.grid = /* @__PURE__ */ new Map();
  }
  fits(r) {
    const b = this.b;
    if (r.x < b.x - 0.5 || r.y < b.y - 0.5 || r.x + r.w > b.x + b.w + 0.5 || r.y + r.h > b.y + b.h + 0.5) return false;
    for (const key of this.keys(r)) for (const o of this.grid.get(key) || []) {
      if (r.x < o.x + o.w && o.x < r.x + r.w && r.y < o.y + o.h && o.y < r.y + r.h) return false;
    }
    return true;
  }
  place(r) {
    if (!this.fits(r)) return false;
    for (const key of this.keys(r)) {
      let l = this.grid.get(key);
      if (!l) this.grid.set(key, l = []);
      l.push(r);
    }
    return true;
  }
  *keys(r) {
    const c = this.cell;
    for (let i = Math.floor(r.x / c); i <= Math.floor((r.x + r.w) / c); i++) for (let j = Math.floor(r.y / c); j <= Math.floor((r.y + r.h) / c); j++) yield `${i},${j}`;
  }
};

// src/engine/items/chart-round.js
var ROUND_TYPES = /* @__PURE__ */ new Set(["pie", "donut", "radar", "gauge", "funnel"]);
var f = (v) => Math.round(v * 100) / 100;
var tag = (o, a) => {
  if (a) o.anim = a;
  return o;
};
function arc(cx, cy, r, ri, a0, a1) {
  const large = a1 - a0 > Math.PI ? 1 : 0;
  const p = (rad, a) => `${f(cx + Math.cos(a) * rad)} ${f(cy + Math.sin(a) * rad)}`;
  if (!ri) return `M ${f(cx)} ${f(cy)} L ${p(r, a0)} A ${f(r)} ${f(r)} 0 ${large} 1 ${p(r, a1)} Z`;
  return `M ${p(r, a0)} A ${f(r)} ${f(r)} 0 ${large} 1 ${p(r, a1)} L ${p(ri, a1)} A ${f(ri)} ${f(ri)} 0 ${large} 0 ${p(ri, a0)} Z`;
}
function paintRound(type, g) {
  if (type === "radar") return paintRadar(g);
  if (type === "gauge") return paintGauge(g);
  if (type === "funnel") return paintFunnel(g);
  return paintPie(type, g);
}
function paintPie(type, g) {
  const { item, data, out, X, W: W2, top, bottom, fs, bold, text, measure, fmtV, pointFill, pointLink, pal, label, labelText, anim } = g;
  const vals = (data.series[0]?.values || []).map((v) => Math.max(0, v || 0));
  const total = vals.reduce((a, b) => a + b, 0) || 1;
  const showL = item.showValues !== false;
  const outside = item.labelPosition === "outside" && showL;
  const pctOf = (v) => `${Math.round(v / total * 100)}%`;
  const texts = outside ? vals.map((v, i) => item.labelTemplate ? labelText(i, data.series[0], v, v / total) : `${data.categories[i]}: ${pctOf(v)}`) : null;
  const lw = [0, 0];
  if (outside) {
    let b0 = -Math.PI / 2;
    vals.forEach((v, i) => {
      const b1 = b0 + v / total * Math.PI * 2;
      if (v > 0 && i < 400) {
        const k = Math.cos((b0 + b1) / 2) >= 0 ? 1 : 0;
        lw[k] = Math.max(lw[k], measure(texts[i]).w);
      }
      b0 = b1;
    });
  }
  let r, cx = X + W2 / 2;
  const cy = (top + bottom) / 2;
  if (outside) {
    const gap = 18, minR = Math.min(W2, bottom - top) * 0.2;
    const fit = (W2 - lw[0] - lw[1] - gap * 2) / 2;
    if (fit < minR) {
      const k = Math.max(0, (W2 - gap * 2 - minR * 2) / Math.max(1, lw[0] + lw[1]));
      lw[0] *= k;
      lw[1] *= k;
    }
    r = Math.max(4, Math.min((W2 - lw[0] - lw[1] - gap * 2) / 2, (bottom - top) / 2 - fs));
    const slack = W2 - lw[0] - lw[1] - gap * 2 - r * 2;
    cx = X + gap + lw[0] + r + slack / 2;
  } else r = Math.max(4, Math.min(W2, bottom - top) / 2 - 6);
  const ri = type === "donut" ? r * 0.58 : 0;
  const sides = [[], []];
  let a0 = -Math.PI / 2;
  vals.forEach((v, i) => {
    const a1 = a0 + v / total * Math.PI * 2;
    const fill = pointFill(i, pal[i % pal.length]);
    if (v > 0) {
      const d = arc(cx, cy, r, ri, a0, Math.min(a1, a0 + Math.PI * 2 - 1e-4));
      out.push(tag({ t: "path", x: 0, y: 0, d, fill, stroke: "#ffffff", strokeWidth: 0.75 }, anim && { k: anim === "grow" ? "scale" : "fade", i }));
      pointLink(i, { x: cx - r, y: cy - r, w: r * 2, h: r * 2 }, `${data.categories[i]}: ${fmtV(v)} (${pctOf(v)})`, d);
    }
    const mid = (a0 + a1) / 2, frac = v / total;
    if (outside && v > 0) sides[Math.cos(mid) >= 0 ? 1 : 0].push({ i, v, mid, y: cy + Math.sin(mid) * (r + 10) });
    else if (!outside && frac >= 0.05 && showL) {
      const s = item.labelTemplate ? labelText(i, data.series[0], v, frac) : pctOf(v);
      const lr = ri ? (r + ri) / 2 : r * 0.62;
      label(s, cx + Math.cos(mid) * lr, cy + Math.sin(mid) * lr + fs * 0.35, { color: inkOn(fill), f: bold, size: fs });
    }
    a0 = a1;
  });
  if (outside) placeOutside(sides, { cx, cy, r, lw, lh: fs * 1.3, lo: top + fs * 0.9, hi: bottom - fs * 0.4, out, text, texts, fs, ink: g.ink });
  if (type === "donut" && item.centerText !== false) {
    text(fmtV(total), cx, cy + fs * 0.45, { align: "center", size: fs * 1.4, f: bold, color: "#111827" });
  }
}
function placeOutside(sides, { cx, cy, r, lw, lh, lo, hi, out, text, texts, fs, ink }) {
  sides.forEach((list, right) => {
    const room = Math.max(1, Math.floor((hi - lo) / lh) + 1);
    if (list.length > room) {
      const keep = new Set([...list].sort((a, b) => b.v - a.v).slice(0, room));
      list = list.filter((l) => keep.has(l));
    }
    list.sort((a, b) => a.y - b.y);
    let prev = -Infinity;
    for (const l of list) {
      l.y = Math.max(l.y, prev + lh, lo);
      prev = l.y;
    }
    let next = Infinity;
    for (let k = list.length - 1; k >= 0; k--) {
      const l = list[k];
      l.y = Math.min(l.y, next - lh, hi);
      next = l.y;
    }
    const dir = right ? 1 : -1;
    for (const l of list) {
      const c = Math.cos(l.mid), s = Math.sin(l.mid);
      const ex = cx + c * (r + 8), ey = cy + s * (r + 8);
      const kx = cx + dir * (r + 12);
      out.push({ t: "path", x: 0, y: 0, d: `M ${f(cx + c * r)} ${f(cy + s * r)} L ${f(ex)} ${f(ey)} L ${f(kx)} ${f(l.y)}`, fill: null, stroke: "#9ca3af", strokeWidth: 0.6 });
      text(texts[l.i], kx + dir * 3, l.y + fs * 0.35, { align: right ? "left" : "right", maxW: Math.max(fs, lw[right] + 1), color: ink });
    }
  });
}
function paintRadar(g) {
  const { item, data, out, X, W: W2, top, bottom, fs, text, measure, fmtV, pointLink, label, labelsOn, labelText, grid, anim, axes } = g;
  const n = data.categories.length;
  const catW = Math.min(W2 * 0.25, data.categories.reduce((m, c) => Math.max(m, measure(c).w), 10));
  const cx = X + W2 / 2, cy = (top + bottom) / 2 + fs * 0.3;
  const R = Math.max(6, Math.min(W2 / 2 - catW - 8, (bottom - top) / 2 - fs * 1.6));
  let lo = 0, hi = 0;
  for (const s of data.series) for (const v of s.values) if (v != null) {
    lo = Math.min(lo, v);
    hi = Math.max(hi, v);
  }
  const ys = axes.y || {};
  const sc = niceScale(Number.isFinite(Number(ys.min)) && ys.min !== "" && ys.min != null ? Number(ys.min) : lo, Number.isFinite(Number(ys.max)) && ys.max !== "" && ys.max != null ? Number(ys.max) : hi, 5);
  const a = ys.min != null && ys.min !== "" ? Number(ys.min) : sc.lo, b = ys.max != null && ys.max !== "" ? Number(ys.max) : sc.hi;
  const ticks = linearTicks(a, b, sc.step);
  const rad = (v) => Math.max(0, Math.min(1, (v - a) / (b - a || 1))) * R;
  const ang = (i) => -Math.PI / 2 + i / Math.max(1, n) * Math.PI * 2;
  const at = (i, r) => ({ x: cx + Math.cos(ang(i)) * r, y: cy + Math.sin(ang(i)) * r });
  const poly = (r) => Array.from({ length: n }, (_, i) => at(i, r)).map((p, i) => `${i ? "L" : "M"} ${f(p.x)} ${f(p.y)}`).join(" ") + " Z";
  if (ys.gridlines !== false) {
    for (const t of ticks) if (rad(t) > 0) out.push({ t: "path", x: 0, y: 0, d: n > 2 ? poly(rad(t)) : "", fill: null, stroke: grid, strokeWidth: 0.5 });
  }
  for (let i = 0; i < n; i++) {
    const e = at(i, R);
    out.push({ t: "line", x1: cx, y1: cy, x2: e.x, y2: e.y, stroke: grid, strokeWidth: 0.5 });
  }
  for (const t of ticks) if (rad(t) > 0 && rad(t) < R - 0.5) text(fmtV(t), cx + 3, cy - rad(t) + fs * 0.3, { size: fs * 0.8, color: "#6b7280" });
  data.categories.forEach((c, i) => {
    const p = at(i, R + 4), cos = Math.cos(ang(i));
    text(c, p.x, p.y + fs * 0.35 + (Math.sin(ang(i)) > 0.5 ? fs * 0.5 : 0), { align: Math.abs(cos) < 0.2 ? "center" : cos > 0 ? "left" : "right", maxW: catW });
  });
  data.series.forEach((s, si) => {
    const pts = s.values.map((v, i) => v == null ? null : { ...at(i, rad(v)), v, i }).filter(Boolean);
    if (!pts.length) return;
    const d = pts.map((p, i) => `${i ? "L" : "M"} ${f(p.x)} ${f(p.y)}`).join(" ") + " Z";
    out.push(tag({ t: "path", x: 0, y: 0, d, fill: s.color + (s.def.type === "line" ? "00" : "2e"), stroke: s.color, strokeWidth: 1.4 }, anim && { k: anim === "grow" ? "scale" : "fade", i: si }));
    if (n <= 40) for (const p of pts) out.push({ t: "ellipse", cx: p.x, cy: p.y, rx: 1.8, ry: 1.8, fill: s.color, stroke: null });
    for (const p of pts) pointLink(p.i, { x: p.x - 4, y: p.y - 4, w: 8, h: 8 }, `${data.categories[p.i]}${data.series.length > 1 ? ` · ${s.name}` : ""}: ${fmtV(p.v)}`);
    if (labelsOn || item.labelTemplate) for (const p of pts) label(labelText(p.i, s, p.v), p.x, p.y - 3, { size: fs * 0.85 });
  });
}
var GAUGE_SHAPES = { half: [Math.PI, Math.PI], threeQuarter: [Math.PI * 0.75, Math.PI * 1.5], full: [-Math.PI / 2, Math.PI * 2] };
var GAUGE_INDICATORS = ["needle", "pointer", "bar"];
function paintGauge(g) {
  const { item, data, out, X, W: W2, top, bottom, fs, bold, text, fmtV, pointLink, axes, lc, who, safe: safe3, ctx } = g;
  const v = data.series[0]?.values?.[0] ?? null;
  const ys = axes.y || {};
  const num4 = (x) => x == null || x === "" ? null : Number.isFinite(Number(x)) ? Number(x) : null;
  const lo = num4(ys.min) ?? 0;
  let hi = num4(ys.max) ?? niceScale(lo, Math.max(lo + 1, v ?? 0), 5).hi;
  if (!(hi > lo)) hi = lo + 1;
  const shape = Object.hasOwn(GAUGE_SHAPES, item.gaugeShape) ? item.gaugeShape : "half";
  const indicator = GAUGE_INDICATORS.includes(item.gaugeIndicator) ? item.gaugeIndicator : "needle";
  const [start, sweep] = GAUGE_SHAPES[shape];
  const frac = (x) => Math.max(0, Math.min(1, (x - lo) / (hi - lo)));
  const ang = (x) => start + frac(x) * sweep;
  const end = start + sweep - (shape === "full" ? 1e-4 : 0);
  const cx = X + W2 / 2, H = bottom - top;
  let R, cy;
  if (shape === "full") {
    R = Math.max(8, Math.min(W2 / 2 - 8, H / 2 - 4));
    cy = (top + bottom) / 2;
  } else if (shape === "threeQuarter") {
    R = Math.max(8, Math.min(W2 / 2 - 8, (H - fs * 1.4 - 4) / (1 + Math.SQRT1_2)));
    cy = top + 4 + R;
  } else {
    R = Math.max(8, Math.min(W2 / 2 - 8, H - fs * 3.6));
    cy = top + 4 + R;
  }
  const th = R * 0.22;
  const at = (a2, rad) => ({ x: cx + Math.cos(a2) * rad, y: cy + Math.sin(a2) * rad });
  const scope = { ...ctx, fields: data.rows[0] || null, aggRows: data.rows, aggIndex: void 0 };
  const val = (o, k) => typeof o[k] === "number" ? o[k] : num4(safe3(o[k], scope, lc, who));
  const overlays = (Array.isArray(item.overlays) ? item.overlays : []).slice(0, 20).filter((o) => o && typeof o === "object");
  const bands = overlays.filter((o) => o.type === "band");
  out.push({ t: "path", x: 0, y: 0, d: arc(cx, cy, R, R - th, start, end), fill: "#e5e7eb", stroke: null });
  const BAND = ["#16a34a", "#f59e0b", "#dc2626", "#2563eb", "#8b5cf6"];
  bands.forEach((o, i) => {
    const a2 = val(o, "from"), b = val(o, "to");
    if (a2 == null || b == null) return;
    const a0 = ang(Math.min(a2, b)), a1 = Math.min(end, ang(Math.max(a2, b)));
    if (a1 - a0 > 1e-4) out.push({ t: "path", x: 0, y: 0, d: arc(cx, cy, R, R - th, a0, a1), fill: typeof o.color === "string" && o.color ? o.color : BAND[i % BAND.length], stroke: null });
  });
  const color2 = data.series[0]?.color || g.pal[0];
  if (v != null && frac(v) > 0 && (indicator === "bar" || !bands.length)) {
    const [ro, rin] = bands.length ? [R - th * 0.3, R - th * 0.7] : [R, R - th];
    out.push(tag({ t: "path", x: 0, y: 0, d: arc(cx, cy, ro, rin, start, Math.min(end, Math.max(start + 1e-4, ang(v)))), fill: color2, stroke: null }, g.anim && { k: "fade", i: 0 }));
  }
  for (const o of overlays) if (o.type === "line") {
    const t = val(o, "value");
    if (t == null) continue;
    const a2 = ang(t), p1 = at(a2, R - th - 2), p2 = at(a2, R + 2);
    out.push({ t: "line", x1: p1.x, y1: p1.y, x2: p2.x, y2: p2.y, stroke: o.color || "#111827", strokeWidth: 1.5 });
  }
  const sc = niceScale(lo, hi, shape === "half" ? 5 : 7);
  const ticks = linearTicks(Math.ceil(lo / sc.step - 1e-9) * sc.step, hi, sc.step).filter((t) => t >= lo - 1e-9 && t <= hi + 1e-9);
  const tickOn = item.gaugeTicks !== false && R >= fs * 5 && ticks.length > 1;
  if (tickOn) {
    const ri = R - th - 1;
    const minor = sc.step / 5;
    for (let t = ticks[0] - sc.step, k = 0; t <= hi + 1e-9 && k < 200; t += minor, k++) {
      if (t < lo - 1e-9) continue;
      const isMajor = ticks.some((m) => Math.abs(m - t) < minor / 2);
      const a2 = ang(t), p1 = at(a2, ri), p2 = at(a2, ri - th * (isMajor ? 0.4 : 0.2));
      out.push({ t: "line", x1: p1.x, y1: p1.y, x2: p2.x, y2: p2.y, stroke: isMajor ? "#6b7280" : "#9ca3af", strokeWidth: isMajor ? 0.9 : 0.5 });
    }
    const lr = ri - th * 0.4 - fs * 1.1;
    ticks.forEach((t, k) => {
      if (shape === "full" && k === ticks.length - 1 && Math.abs(frac(t) - 1) < 1e-9) return;
      const p = at(ang(t), lr);
      text(fmtV(t), p.x, p.y + fs * 0.3, { align: "center", size: fs * 0.8, color: "#6b7280" });
    });
  } else if (shape !== "full") {
    const e0 = at(start, R - th / 2), e1 = at(start + sweep, R - th / 2);
    text(fmtV(lo), e0.x, e0.y + fs * 1.3, { align: "center", color: "#6b7280" });
    text(fmtV(hi), e1.x, e1.y + fs * 1.3, { align: "center", color: "#6b7280" });
  }
  const vy = shape === "half" ? cy + fs * 2.6 : cy + R * 0.5 + fs * 0.6;
  if (v == null) {
    text("No data", cx, shape === "half" ? cy - R / 3 : cy + fs * 0.35, { align: "center", color: "#9ca3af" });
    return;
  }
  const a = ang(v), ink = typeof item.pointerColor === "string" && /^#[0-9a-f]{6}$/i.test(item.pointerColor) ? item.pointerColor : "#1f2937";
  if (indicator === "needle") {
    const len = R - th * 0.4, bw = Math.max(1.5, R * 0.03);
    const tip = at(a, len), n1 = at(a + Math.PI / 2, bw), n2 = at(a - Math.PI / 2, bw);
    const d = `M ${f(n1.x)} ${f(n1.y)} L ${f(tip.x)} ${f(tip.y)} L ${f(n2.x)} ${f(n2.y)} Z`;
    out.push(tag({ t: "path", x: 0, y: 0, d, fill: ink, stroke: null }, g.anim && { k: "fade", i: 0 }));
    out.push({ t: "ellipse", cx, cy, rx: bw * 1.4, ry: bw * 1.4, fill: ink, stroke: null });
  } else if (indicator === "pointer") {
    const tip = at(a, R - th * 0.85), half = Math.max(0.05, Math.min(0.2, th * 0.55 / Math.max(1, R - th)));
    const b1 = at(a - half, R - th * 1.7), b2 = at(a + half, R - th * 1.7);
    const d = `M ${f(b1.x)} ${f(b1.y)} L ${f(tip.x)} ${f(tip.y)} L ${f(b2.x)} ${f(b2.y)} Z`;
    out.push(tag({ t: "path", x: 0, y: 0, d, fill: ink, stroke: "#ffffff", strokeWidth: 0.6 }, g.anim && { k: "fade", i: 0 }));
  }
  text(item.labelTemplate ? g.labelText(0, data.series[0], v) : fmtV(v), cx, indicator === "needle" || shape === "half" ? vy : cy + fs * 0.55, { align: "center", size: fs * 1.6, f: bold, color: "#111827" });
  pointLink(0, { x: cx - R, y: cy - R, w: R * 2, h: shape === "half" ? R : R * 2 }, `${data.series[0]?.name || "Value"}: ${fmtV(v)}`);
}
function paintFunnel(g) {
  const { item, data, out, X, W: W2, top, bottom, fs, text, measure, fmtV, pointFill, pointLink, pal, labelText, anim } = g;
  const vals = (data.series[0]?.values || []).map((v) => Math.max(0, v || 0));
  const n = vals.length;
  let max = 0;
  for (const v of vals) max = Math.max(max, v);
  if (!max) {
    text("No data", X + W2 / 2, (top + bottom) / 2, { align: "center", color: "#9ca3af" });
    return;
  }
  const gap = n > 1 ? Math.min(2, (bottom - top) / n / 4) : 0;
  const sh = (bottom - top - fs * 0.6 - gap * (n - 1)) / n;
  const maxW = W2 * 0.62, cx = X + W2 * 0.36;
  let y = top + fs * 0.6;
  const total = vals.reduce((a, b) => a + b, 0) || 1;
  vals.forEach((v, i) => {
    const tw = Math.max(2, maxW * v / max), bw = Math.max(2, i < n - 1 ? maxW * vals[i + 1] / max : tw * 0.6);
    const d = `M ${f(cx - tw / 2)} ${f(y)} L ${f(cx + tw / 2)} ${f(y)} L ${f(cx + Math.min(tw, bw) / 2)} ${f(y + sh)} L ${f(cx - Math.min(tw, bw) / 2)} ${f(y + sh)} Z`;
    const fill = pointFill(i, pal[i % pal.length]);
    out.push(tag({ t: "path", x: 0, y: 0, d, fill, stroke: "#ffffff", strokeWidth: 0.75 }, anim && { k: "fade", i }));
    pointLink(i, { x: cx - tw / 2, y, w: tw, h: sh }, `${data.categories[i]}: ${fmtV(v)} (${Math.round(v / total * 100)}%)`, d);
    if (item.showValues !== false) {
      const s = item.labelTemplate ? labelText(i, data.series[0], v, v / total) : `${data.categories[i]}: ${fmtV(v)}`;
      const sz = Math.min(fs, sh * 0.7);
      const { w } = measure(s, { size: sz });
      const narrow = Math.min(tw, bw);
      if (w + 6 < narrow) text(s, cx, y + sh / 2 + sz * 0.35, { align: "center", size: sz, color: inkOn(fill) });
      else {
        const lx = cx + (tw + Math.min(tw, bw)) / 4 + 6;
        text(s, lx, y + sh / 2 + sz * 0.35, { size: sz, maxW: X + W2 - lx - 2 });
      }
    }
    y += sh + gap;
  });
}

// src/engine/items/chart-more.js
var MORE_TYPES = /* @__PURE__ */ new Set(["treemap", "histogram", "boxplot", "waterfall", "gantt"]);
var MORE_CAPS = { bins: 500, outliers: 2e3 };
var DAY2 = 864e5;
function moreLegend(type, item, data, pal) {
  if (type === "waterfall") return [{ name: "Increase", color: item.upColor || "#16a34a" }, { name: "Decrease", color: item.downColor || "#dc2626" }, { name: "Total", color: item.totalColor || "#2563eb" }];
  if (type === "gantt" && item.seriesGroup) return ganttGroups(item, data, pal).list.map((gr) => ({ name: gr.name, color: gr.color }));
  return [];
}
function paintMore(type, g) {
  if (type === "treemap") return paintTreemap(g);
  if (type === "histogram") return paintHistogram(g);
  if (type === "boxplot") return paintBoxPlot(g);
  if (type === "waterfall") return paintWaterfall(g);
  return paintGantt(g);
}
var num2 = (v) => {
  if (v == null || v === "") return null;
  const n = Number(v);
  return Number.isFinite(n) ? n : null;
};
function rowValues(g, expr, rows) {
  const { ctx, lc, who } = g;
  const c = { ...ctx };
  const out = [];
  for (const r of rows) {
    c.fields = r;
    c.aggRows = [r];
    c.aggIndex = void 0;
    let v;
    try {
      v = evalValue(expr, c);
    } catch (e) {
      lc.warn(`${who}: ${e.message}`);
      v = null;
    }
    out.push(num2(v));
  }
  return out;
}
function capRows(g, rows) {
  if (rows.length <= CAPS.points) return rows;
  g.lc.warn(`${g.who}: ${rows.length} rows; only the first ${CAPS.points} are drawn`);
  return rows.slice(0, CAPS.points);
}
var noData = (g) => g.text("No data", g.X + g.W / 2, (g.top + g.bottom) / 2, { align: "center", color: "#9ca3af" });
function frame(g, lo, hi, fmt2, { cats = null, catW = 0 } = {}) {
  const { item, lc, X, W: W2, top, bottom, fs, text, out, axes, who, grid } = g;
  const ys = axes.y || {};
  const plotTop = top + fs * 0.6;
  const xTitle = axes.x?.title || item.xTitle, yTitle = ys.title;
  const plotBottom = bottom - fs * 1.8 - (xTitle ? fs * 1.6 : 0);
  const ay = g.valueAxis(ys, lo, hi, Infinity, { includeZero: true, len: plotBottom - plotTop, fs, fmt: fmt2, lc, who, name: "y" });
  const valW = Math.max(10, ...ay.ticks.map((t) => lc.m.width(ay.fmt(t), g.font, fs)));
  const left = X + 4 + (yTitle ? fs * 1.6 : 0) + valW + 6, right = X + W2 - 6;
  const vy = (v) => {
    const fr = Math.max(0, Math.min(1, ay.frac(v) ?? 0));
    return ys.reversed ? plotTop + fr * (plotBottom - plotTop) : plotBottom - fr * (plotBottom - plotTop);
  };
  for (const t of ay.ticks) {
    if (ys.gridlines !== false) out.push({ t: "line", x1: left, y1: vy(t), x2: right, y2: vy(t), stroke: grid, strokeWidth: 0.5 });
    text(ay.fmt(t), left - 5, vy(t) + fs * 0.35, { align: "right" });
  }
  if (xTitle) text(xTitle, (left + right) / 2, bottom - 2, { align: "center", color: "#6b7280" });
  if (yTitle) {
    const my = (plotTop + plotBottom) / 2;
    text(yTitle, X + 4 + fs, my, { align: "center", color: "#6b7280", maxW: plotBottom - plotTop, rotate: { a: -90, cx: X + 4 + fs, cy: my } });
  }
  const band = (right - left) / Math.max(1, cats ? cats.length : 1);
  if (cats) {
    const every = Math.max(1, Math.ceil((catW + 6) / band));
    cats.forEach((c, i) => {
      if (i % every === 0) text(c, left + band * (i + 0.5), plotBottom + fs * 1.35, { align: "center", maxW: band * every - 2 });
    });
  }
  return { left, right, plotTop, plotBottom, vy, band, ay };
}
function squarify(items, x, y, w, h) {
  const total = items.reduce((s, it) => s + it.v, 0);
  const out = [];
  if (!(total > 0) || w <= 0 || h <= 0) return out;
  const scale = w * h / total;
  let row = [], sum = 0, min = Infinity, max = 0;
  const worst = (s, mn, mx, side) => Math.max(side * side * mx / (s * s), s * s / (side * side * mn));
  const flush = () => {
    if (!row.length) return;
    if (w >= h) {
      const cw = sum / h;
      let yy = y;
      for (const r of row) {
        const rh = r.a / cw;
        out.push({ x, y: yy, w: cw, h: rh, i: r.i });
        yy += rh;
      }
      x += cw;
      w -= cw;
    } else {
      const rh = sum / w;
      let xx = x;
      for (const r of row) {
        const rw = r.a / rh;
        out.push({ x: xx, y, w: rw, h: rh, i: r.i });
        xx += rw;
      }
      y += rh;
      h -= rh;
    }
    row = [];
    sum = 0;
    min = Infinity;
    max = 0;
  };
  for (const it of items) {
    const a = it.v * scale;
    const side = Math.min(w, h);
    if (row.length && worst(sum + a, Math.min(min, a), Math.max(max, a), side) > worst(sum, min, max, side)) flush();
    row.push({ a, i: it.i });
    sum += a;
    min = Math.min(min, a);
    max = Math.max(max, a);
  }
  flush();
  return out;
}
function paintTreemap(g) {
  const { item, data, out, X, W: W2, top, bottom, fs, pal, pointFill, pointLink, fmtV, lc, who, anim } = g;
  const s = data.series[0];
  const items = [];
  let dropped = 0;
  (s?.values || []).forEach((v, i) => {
    if (v != null && v > 0) items.push({ v, i });
    else if (v != null) dropped++;
  });
  if (dropped) lc.warn(`${who}: ${dropped} categories with a value of 0 or less have no area in a treemap`);
  if (!items.length) return noData(g);
  items.sort((a, b) => b.v - a.v);
  const total = items.reduce((t, it) => t + it.v, 0);
  const rects = squarify(items, X + 2, top + 2, W2 - 4, bottom - top - 4);
  for (const r of rects) {
    const fill = pointFill(r.i, pal[r.i % pal.length]);
    out.push({ t: "rect", x: r.x, y: r.y, w: r.w, h: r.h, fill, stroke: "#ffffff", strokeWidth: 1, ...anim ? { anim: { k: "fade", i: r.i } } : {} });
    const v = s.values[r.i];
    pointLink(r.i, { x: r.x, y: r.y, w: r.w, h: r.h }, `${data.categories[r.i]}: ${fmtV(v)} (${Math.round(v / total * 100)}%)`);
    if (r.w > fs * 3 && r.h > fs * 1.6) {
      const ink = inkOn(fill);
      g.text(data.categories[r.i], r.x + 4, r.y + fs * 1.3, { color: ink, maxW: r.w - 8, f: g.bold });
      if (r.h > fs * 3 && item.showValues !== false) g.text(g.labelText(r.i, s, v, v / total), r.x + 4, r.y + fs * 2.5, { color: ink, maxW: r.w - 8, size: fs * 0.9 });
    }
  }
}
function binValues(vals, { binCount, binWidth } = {}) {
  let lo = Infinity, hi = -Infinity;
  for (const v of vals) {
    if (v < lo) lo = v;
    if (v > hi) hi = v;
  }
  if (!vals.length) return { lo: 0, hi: 1, width: 1, counts: [], capped: false };
  let n, width, capped2 = false;
  const wantW = num2(binWidth);
  if (wantW != null && wantW > 0) {
    lo = Math.floor(lo / wantW) * wantW;
    n = Math.floor((hi - lo) / wantW + 1e-9) + 1;
    width = wantW;
    if (!(n <= MORE_CAPS.bins)) {
      capped2 = true;
      n = MORE_CAPS.bins;
      width = (hi - lo) / n || 1;
    }
  } else {
    const want = num2(binCount);
    n = Math.round(want != null && want > 0 ? want : Math.ceil(Math.log2(vals.length)) + 1);
    if (n > MORE_CAPS.bins) {
      capped2 = true;
      n = MORE_CAPS.bins;
    }
    n = Math.max(1, n);
    width = hi > lo ? (hi - lo) / n : 1;
  }
  const counts = new Array(n).fill(0);
  for (const v of vals) counts[Math.min(n - 1, Math.max(0, Math.floor((v - lo) / width)))]++;
  return { lo, hi: lo + width * n, width, counts, capped: capped2 };
}
function paintHistogram(g) {
  const { item, data, out, fs, lc, who, ctx, pal, axes, anim } = g;
  const s = data.series[0];
  const rows = capRows(g, data.rows);
  const vals = rowValues(g, s?.def?.value || "=0", rows).filter((v) => v != null);
  if (!vals.length) return noData(g);
  const b = binValues(vals, { binCount: item.binCount, binWidth: item.binWidth });
  if (b.capped) lc.warn(`${who}: more than ${MORE_CAPS.bins} bins; drawn with ${MORE_CAPS.bins}`);
  const peak = Math.max(...b.counts);
  const fmtX = (v) => toText(v, axes.x?.format || item.valueFormat || "N0", ctx);
  const f4 = frame(g, 0, Math.max(peak, 4), (v) => toText(v, axes.y?.format || "N0", ctx));
  const n = b.counts.length, bw = (f4.right - f4.left) / n;
  const color2 = s?.color || pal[0];
  b.counts.forEach((c, i) => {
    const x = f4.left + i * bw, y = f4.vy(c), base = f4.vy(0);
    if (c > 0) out.push({ t: "rect", x: x + 0.5, y, w: Math.max(0.5, bw - 1), h: base - y, fill: color2, ...anim ? { anim: { k: anim === "grow" ? "growY" : "fade", o: "bottom", i } } : {} });
    if (item.tooltips !== false) g.links.push({ t: "link", x, y: f4.plotTop, w: bw, h: f4.plotBottom - f4.plotTop, action: null, tip: `${fmtX(b.lo + i * b.width)} – ${fmtX(b.lo + (i + 1) * b.width)}: ${c}` });
    if (g.labelsOn && c > 0) g.label(String(c), x + bw / 2, y - 3, { size: fs * 0.85 });
  });
  const edgeW = Math.max(...[b.lo, b.hi].map((v) => g.measure(fmtX(v)).w));
  const every = Math.max(1, Math.ceil((edgeW + 6) / bw));
  for (let i = 0; i <= n; i += every) g.text(fmtX(b.lo + i * b.width), f4.left + i * bw, f4.plotBottom + fs * 1.35, { align: "center" });
  out.push({ t: "line", x1: f4.left, y1: f4.plotBottom, x2: f4.right, y2: f4.plotBottom, stroke: "#9ca3af", strokeWidth: 0.75 });
}
function boxStats(sorted) {
  const n = sorted.length;
  const q = (p) => {
    const h = (n - 1) * p, l = Math.floor(h);
    return sorted[l] + (h - l) * (sorted[Math.min(n - 1, l + 1)] - sorted[l]);
  };
  const q1 = q(0.25), med = q(0.5), q3 = q(0.75), iqr = q3 - q1;
  const loF = q1 - 1.5 * iqr, hiF = q3 + 1.5 * iqr;
  let lo = med, hi = med;
  const outliers = [];
  for (const v of sorted) {
    if (v < loF || v > hiF) outliers.push(v);
    else {
      if (v < lo) lo = v;
      if (v > hi) hi = v;
    }
  }
  let sum = 0;
  for (const v of sorted) sum += v;
  return { min: sorted[0], max: sorted[n - 1], q1, med, q3, lo, hi, outliers, mean: sum / n, n };
}
function paintBoxPlot(g) {
  const { item, data, out, fs, pal, lc, who, pointFill, pointLink, fmtV, ctx } = g;
  const s = data.series[0];
  let budget = CAPS.points;
  const stats = data.buckets.map((bk) => {
    let rows = bk.rows;
    if (rows.length > budget) {
      lc.warn(`${who}: more than ${CAPS.points} rows; the rest are left out`);
      rows = rows.slice(0, Math.max(0, budget));
    }
    budget -= rows.length;
    const vals = rowValues(g, s?.def?.value || "=0", rows).filter((v) => v != null).sort((a, b) => a - b);
    return vals.length ? boxStats(vals) : null;
  });
  if (!stats.some(Boolean)) return noData(g);
  let lo = Infinity, hi = -Infinity;
  for (const st of stats) if (st) {
    lo = Math.min(lo, st.min);
    hi = Math.max(hi, st.max);
  }
  const catW = data.categories.reduce((m, c) => Math.max(m, g.measure(c).w), 10);
  const f4 = frame(g, lo, hi, (v) => toText(v, g.axes.y?.format || item.valueFormat || "N0", ctx), { cats: data.categories, catW });
  let dots = 0, cut = false;
  stats.forEach((st, i) => {
    if (!st) return;
    const cx = f4.left + f4.band * (i + 0.5), bw = Math.min(f4.band * 0.5, 40);
    const color2 = pointFill(i, s?.color || pal[0]);
    const ln = (x1, y12, x2, y2, w = 1) => out.push({ t: "line", x1, y1: y12, x2, y2, stroke: color2, strokeWidth: w });
    ln(cx, f4.vy(st.hi), cx, f4.vy(st.q3));
    ln(cx, f4.vy(st.q1), cx, f4.vy(st.lo));
    ln(cx - bw / 4, f4.vy(st.hi), cx + bw / 4, f4.vy(st.hi));
    ln(cx - bw / 4, f4.vy(st.lo), cx + bw / 4, f4.vy(st.lo));
    const y3 = f4.vy(st.q3), y1 = f4.vy(st.q1);
    out.push({ t: "rect", x: cx - bw / 2, y: Math.min(y1, y3), w: bw, h: Math.max(0.75, Math.abs(y1 - y3)), fill: color2 + "40", stroke: color2, strokeWidth: 1 });
    ln(cx - bw / 2, f4.vy(st.med), cx + bw / 2, f4.vy(st.med), 1.8);
    if (item.showMean) out.push({ t: "path", x: cx, y: f4.vy(st.mean), d: "M -3 0 L 0 -3 L 3 0 L 0 3 Z", fill: "#ffffff", stroke: color2, strokeWidth: 1 });
    for (const v of st.outliers) {
      if (dots >= MORE_CAPS.outliers) {
        cut = true;
        break;
      }
      dots++;
      out.push({ t: "ellipse", cx, cy: f4.vy(v), rx: 2, ry: 2, fill: null, stroke: color2, strokeWidth: 0.9 });
    }
    pointLink(i, { x: cx - f4.band / 2, y: f4.plotTop, w: f4.band, h: f4.plotBottom - f4.plotTop }, `${data.categories[i]}: min ${fmtV(st.lo)}, Q1 ${fmtV(st.q1)}, median ${fmtV(st.med)}, Q3 ${fmtV(st.q3)}, max ${fmtV(st.hi)}${st.outliers.length ? `, ${st.outliers.length} outliers` : ""} (n ${st.n})`);
    if (g.labelsOn) g.label(fmtV(st.med), cx + bw / 2 + 3, f4.vy(st.med) + fs * 0.3, { align: "left", size: fs * 0.85 });
  });
  if (cut) lc.warn(`${who}: more than ${MORE_CAPS.outliers} outliers; the rest are not drawn`);
  out.push({ t: "line", x1: f4.left, y1: f4.plotBottom, x2: f4.right, y2: f4.plotBottom, stroke: "#9ca3af", strokeWidth: 0.75 });
}
function paintWaterfall(g) {
  const { item, data, out, fs, ctx, lc, who, pointLink, fmtV, anim } = g;
  const s = data.series[0];
  const up = item.upColor || "#16a34a", down = item.downColor || "#dc2626", tot = item.totalColor || "#2563eb";
  const isTotal = (i) => {
    if (!item.waterfallTotals) return false;
    const b = data.buckets[i];
    try {
      const v = evalValue(item.waterfallTotals, { ...ctx, fields: b.rows[0] || null, aggRows: b.rows, aggIndex: void 0 });
      return v === true || v === 1 || typeof v === "string" && v.toLowerCase() === "true";
    } catch (e) {
      lc.warn(`${who}: ${e.message}`);
      return false;
    }
  };
  const bars = [];
  let cum = 0;
  (s?.values || []).forEach((v, i) => {
    if (isTotal(i)) {
      bars.push({ i, a: 0, b: cum, kind: "total", v: cum, label: data.categories[i] });
      return;
    }
    if (v == null) return;
    bars.push({ i, a: cum, b: cum + v, kind: v >= 0 ? "up" : "down", v, label: data.categories[i] });
    cum += v;
  });
  if (item.showTotal !== false) bars.push({ i: -1, a: 0, b: cum, kind: "total", v: cum, label: item.totalLabel || "Total" });
  if (!bars.length) return noData(g);
  let lo = 0, hi = 0;
  for (const b of bars) {
    lo = Math.min(lo, b.a, b.b);
    hi = Math.max(hi, b.a, b.b);
  }
  const cats = bars.map((b) => b.label);
  const catW = cats.reduce((m, c) => Math.max(m, g.measure(c).w), 10);
  const f4 = frame(g, lo, hi, (v) => toText(v, g.axes.y?.format || item.valueFormat || "N0", ctx), { cats, catW });
  const bw = f4.band * 0.62;
  bars.forEach((b, k) => {
    const cx = f4.left + f4.band * (k + 0.5);
    const y0 = f4.vy(b.a), y1 = f4.vy(b.b);
    const fill = b.kind === "up" ? up : b.kind === "down" ? down : tot;
    out.push({ t: "rect", x: cx - bw / 2, y: Math.min(y0, y1), w: bw, h: Math.max(0.75, Math.abs(y1 - y0)), fill, ...anim ? { anim: { k: "fade", i: k } } : {} });
    if (k < bars.length - 1) out.push({ t: "line", x1: cx + bw / 2, y1, x2: cx + f4.band - bw / 2, y2: y1, stroke: "#9ca3af", strokeWidth: 0.6, dash: [2, 2] });
    const rect = { x: cx - f4.band / 2, y: f4.plotTop, w: f4.band, h: f4.plotBottom - f4.plotTop };
    const tip = `${b.label}: ${b.kind === "total" ? fmtV(b.v) : `${b.v >= 0 ? "+" : ""}${fmtV(b.v)} → ${fmtV(b.b)}`}`;
    if (b.i >= 0) pointLink(b.i, rect, tip);
    else if (item.tooltips !== false) g.links.push({ t: "link", ...rect, action: null, tip });
    if (g.labelsOn) g.label(b.kind === "total" ? fmtV(b.v) : `${b.v >= 0 ? "+" : ""}${fmtV(b.v)}`, cx, Math.min(y0, y1) - 3, { size: fs * 0.85, alt: { y: Math.max(y0, y1) + fs, color: g.ink } });
  });
  out.push({ t: "line", x1: f4.left, y1: f4.vy(0), x2: f4.right, y2: f4.vy(0), stroke: "#9ca3af", strokeWidth: 0.75 });
}
function ganttGroups(item, data, pal) {
  const keyOf2 = /* @__PURE__ */ new Map(), list = [];
  if (!item.seriesGroup) return { keyOf: keyOf2, list };
  for (const b of data.buckets) for (const r of b.rows) {
    let k;
    try {
      k = evalValue(item.seriesGroup, { ...data.ctx, fields: r, aggRows: [r], aggIndex: void 0 });
    } catch {
      k = null;
    }
    const name = k == null ? "" : String(k);
    let gr = list.find((x) => x.name === name);
    if (!gr) {
      if (list.length >= CAPS.series) continue;
      gr = { name, color: pal[list.length % pal.length] };
      list.push(gr);
    }
    keyOf2.set(r, gr);
  }
  return { keyOf: keyOf2, list };
}
function timeOf(v) {
  if (v instanceof Date) return { t: v.getTime(), date: true };
  if (typeof v === "number") return Number.isFinite(v) ? { t: v, date: false } : null;
  if (typeof v === "string" && v.trim()) {
    const n = Number(v);
    if (Number.isFinite(n)) return { t: n, date: false };
    const d = Date.parse(v);
    return Number.isFinite(d) ? { t: d, date: true } : null;
  }
  return null;
}
function dateTicks(lo, hi, max = 8) {
  const steps = [[1, "d"], [2, "d"], [7, "d"], [14, "d"], [1, "m"], [3, "m"], [6, "m"], [1, "y"], [2, "y"], [5, "y"], [10, "y"], [50, "y"], [100, "y"]];
  for (const [n, u] of steps) {
    const ticks = [];
    const d = new Date(lo);
    if (u === "d") {
      d.setUTCHours(0, 0, 0, 0);
      if (n === 7 || n === 14) d.setUTCDate(d.getUTCDate() - (d.getUTCDay() + 6) % 7);
    } else {
      d.setUTCHours(0, 0, 0, 0);
      d.setUTCDate(1);
      if (u === "y") d.setUTCMonth(0);
    }
    while (d.getTime() < lo) step2(d, n, u);
    for (let i = 0; d.getTime() <= hi && i <= max; i++) {
      ticks.push(d.getTime());
      step2(d, n, u);
    }
    if (ticks.length <= max) return { ticks, unit: u };
  }
  return { ticks: [lo, hi], unit: "y" };
}
function step2(d, n, u) {
  if (u === "d") d.setUTCDate(d.getUTCDate() + n);
  else if (u === "m") d.setUTCMonth(d.getUTCMonth() + n);
  else d.setUTCFullYear(d.getUTCFullYear() + n);
}
function paintGantt(g) {
  const { item, data, out, X, W: W2, top, bottom, fs, ctx, lc, who, pal, pointFill, pointLink, axes, grid, text, anim } = g;
  const cats = data.categories;
  if (!item.ganttStart || !item.ganttEnd) {
    text("Set the start and end of the bars", X + W2 / 2, (top + bottom) / 2, { align: "center", color: "#9ca3af" });
    return;
  }
  const groups = ganttGroups(item, { ...data, ctx }, pal);
  const bars = [];
  let left = CAPS.points, cut = false, dates = false;
  const c = { ...ctx };
  data.buckets.forEach((bk, ci) => {
    for (const r of bk.rows) {
      if (left-- <= 0) {
        cut = true;
        return;
      }
      c.fields = r;
      c.aggRows = [r];
      c.aggIndex = void 0;
      let s0, e0;
      try {
        s0 = timeOf(evalValue(item.ganttStart, c));
        e0 = timeOf(evalValue(item.ganttEnd, c));
      } catch (e) {
        lc.warn(`${who}: ${e.message}`);
        continue;
      }
      if (!s0 || !e0) continue;
      if (s0.date || e0.date) dates = true;
      bars.push({ ci, r, a: Math.min(s0.t, e0.t), b: Math.max(s0.t, e0.t) });
    }
  });
  if (cut) lc.warn(`${who}: more than ${CAPS.points} bars; the rest are left out`);
  if (!bars.length) return noData(g);
  let lo = Infinity, hi = -Infinity;
  for (const b of bars) {
    lo = Math.min(lo, b.a);
    hi = Math.max(hi, b.b);
  }
  const xs = axes.x || {};
  const now = ctx.globals?.ExecutionTime instanceof Date ? ctx.globals.ExecutionTime.getTime() : null;
  const today = dates && item.ganttToday !== false && now != null ? now : null;
  if (today != null && today >= lo - (hi - lo) * 0.1 && today <= hi + (hi - lo) * 0.1) {
    lo = Math.min(lo, today);
    hi = Math.max(hi, today);
  }
  if (hi === lo) {
    hi = lo + (dates ? DAY2 : 1);
  }
  const fmtT = (t) => dates ? toText(new Date(t), xs.format || "dd MMM", ctx) : toText(t, xs.format || "N0", ctx);
  let ticks;
  if (dates) ticks = dateTicks(lo, hi, Math.max(2, Math.floor(W2 / 70))).ticks;
  else {
    const sc = niceScale(lo, hi, 5);
    lo = Math.min(lo, sc.lo);
    hi = Math.max(hi, sc.hi);
    ticks = linearTicks(sc.lo, sc.hi, sc.step);
  }
  const catW = Math.min(cats.reduce((m, s) => Math.max(m, g.measure(s).w), 10), W2 * 0.32);
  const plotLeft = X + 4 + catW + 6, plotRight = X + W2 - 6;
  const plotTop = top + fs * 0.6, plotBottom = bottom - fs * 1.8 - (xs.title ? fs * 1.6 : 0);
  const px = (t) => plotLeft + (t - lo) / (hi - lo) * (plotRight - plotLeft);
  for (const t of ticks) {
    if (t < lo || t > hi) continue;
    if (xs.gridlines !== false) out.push({ t: "line", x1: px(t), y1: plotTop, x2: px(t), y2: plotBottom, stroke: grid, strokeWidth: 0.5 });
    text(fmtT(t), px(t), plotBottom + fs * 1.35, { align: "center" });
  }
  if (xs.title) text(xs.title, (plotLeft + plotRight) / 2, bottom - 2, { align: "center", color: "#6b7280" });
  const lane = (plotBottom - plotTop) / Math.max(1, cats.length);
  const every = Math.max(1, Math.ceil(fs * 1.2 / lane));
  cats.forEach((s, i) => {
    if (i % every === 0) text(s, plotLeft - 5, plotTop + lane * (i + 0.5) + fs * 0.35, { align: "right", maxW: catW });
  });
  const bh = Math.max(1, Math.min(lane * 0.62, 22));
  bars.forEach((b, k) => {
    const y = plotTop + lane * (b.ci + 0.5) - bh / 2;
    const x0 = px(b.a), x1 = px(b.b);
    const fill = groups.keyOf.get(b.r)?.color || pointFill(b.ci, pal[0]);
    out.push({ t: "rect", x: x0, y, w: Math.max(1, x1 - x0), h: bh, fill, radius: Math.min(2, bh / 4), ...anim ? { anim: { k: anim === "grow" ? "growX" : "fade", o: "left", i: k } } : {} });
    pointLink(b.ci, { x: x0, y, w: Math.max(4, x1 - x0), h: bh }, `${cats[b.ci]}: ${fmtT(b.a)} – ${fmtT(b.b)}`);
    if (g.labelsOn) g.label(cats[b.ci], x1 + 3, y + bh / 2 + fs * 0.3, { align: "left", size: fs * 0.85 });
  });
  out.push({ t: "line", x1: plotLeft, y1: plotBottom, x2: plotRight, y2: plotBottom, stroke: "#9ca3af", strokeWidth: 0.75 });
  if (today != null && today >= lo && today <= hi) {
    const tx = px(today);
    out.push({ t: "line", x1: tx, y1: plotTop, x2: tx, y2: plotBottom, stroke: item.todayColor || "#dc2626", strokeWidth: 1, dash: [3, 2] });
    text("Today", tx + 2, plotTop + fs * 0.9, { color: item.todayColor || "#dc2626", size: fs * 0.85 });
  }
}

// src/engine/items/chart.js
var PALETTE = PALETTES.default;
var CHART_TYPES = ["column", "bar", "line", "area", "pie", "donut", "scatter", "bubble", "radar", "polar", "candlestick", "ohlc", "gauge", "funnel", "treemap", "histogram", "boxplot", "waterfall", "gantt"];
var PER_ROW = /* @__PURE__ */ new Set(["scatter", "bubble", "polar"]);
var SERIES_FIELDS = ["value", "low", "high", "open", "close"];
function safe2(v, ctx, lc, who) {
  try {
    return evalValue(v, ctx);
  } catch (e) {
    lc.warn(`${who}: ${e.message}`);
    return null;
  }
}
var keyOf = (k) => k instanceof Date ? `d${k.getTime()}` : `${typeof k}:${k}`;
var numOrNull = (v) => {
  if (v == null || v === "") return null;
  const n = Number(v);
  return Number.isFinite(n) ? n : null;
};
var tag2 = (o, a) => {
  if (a) o.anim = a;
  return o;
};
var f2 = (v) => Math.round(v * 100) / 100;
var byName = (lc, pal) => (name) => {
  const m = lc.categoryColors || (lc.categoryColors = /* @__PURE__ */ new Map());
  const k = String(name);
  if (!m.has(k)) m.set(k, m.size);
  return pal[
    /** @type {number} */
    m.get(k) % pal.length
  ];
};
function chartData(item, ctx, lc, pal = paletteOf(item.palette)) {
  let rows = item.dataSet ? related(lc.dataSets[item.dataSet] || [], ctx) : ctx.aggRows || [];
  if (item.dataSet && !lc.dataSets[item.dataSet]) lc.warn(`${item.name || item.type}: the data set "${item.dataSet}" does not exist`);
  if (item.filters?.length) rows = applyFilters(rows, item.filters, ctx);
  if (item.sort?.length) rows = applySort(rows, item.sort, ctx);
  const who = item.name || "Chart";
  const c = { ...ctx };
  const bucket = (list, expr) => {
    const m = /* @__PURE__ */ new Map();
    for (const r of list) {
      c.fields = r;
      const k = expr ? safe2(expr, c, lc, who) : "";
      const kk = keyOf(k);
      let b = m.get(kk);
      if (!b) {
        b = { key: k, rows: [] };
        m.set(kk, b);
      }
      b.rows.push(r);
    }
    return [...m.values()];
  };
  let cats = item.chartType === "gauge" || item.chartType === "histogram" ? [{ key: "", rows }] : bucket(rows, item.category);
  if (item.categorySort === "asc" || item.categorySort === "desc") {
    const d = item.categorySort === "desc" ? -1 : 1;
    cats.sort((a, b) => (a.key instanceof Date ? a.key.getTime() : a.key) > (b.key instanceof Date ? b.key.getTime() : b.key) ? d : -d);
  }
  const maxN = typeof item.maxCategories === "string" ? numOrNull(safe2(item.maxCategories, ctx, lc, who)) : item.maxCategories;
  if (maxN > 0) cats = cats.slice(0, Math.floor(maxN));
  if (cats.length > CAPS.categories) {
    lc.warn(`${who}: ${cats.length} categories; only the first ${CAPS.categories} are drawn`);
    cats = cats.slice(0, CAPS.categories);
  }
  let defs = item.series?.length ? item.series : [{ name: "Value", value: "=Count(Fields)" }];
  if (defs.length > CAPS.series) {
    lc.warn(`${who}: ${defs.length} series; only the first ${CAPS.series} are drawn`);
    defs = defs.slice(0, CAPS.series);
  }
  const agg = (rs, expr) => {
    if (!rs.length || expr == null || expr === "") return null;
    return numOrNull(safe2(expr, { ...ctx, fields: rs[0], aggRows: rs, aggIndex: void 0 }, lc, who));
  };
  const dateFmt = (() => {
    const ts = cats.filter((c2) => c2.key instanceof Date).map((c2) => c2.key.getTime()).sort((a, b) => a - b);
    let gap = Infinity;
    for (let i = 1; i < ts.length; i++) if (ts[i] > ts[i - 1]) gap = Math.min(gap, ts[i] - ts[i - 1]);
    return gap < 864e5 ? ts[ts.length - 1] - ts[0] < 864e5 ? "HH:mm" : "d MMM HH:mm" : gap < 28 * 864e5 ? "d MMM" : "MMM yyyy";
  })();
  const labelOf = (k) => toText(k, item.categoryFormat || (k instanceof Date ? dateFmt : null), ctx);
  const perRow = PER_ROW.has(item.chartType);
  const make = (sd, name, color2, rowsOf) => {
    const s = { name, color: color2, def: sd, values: [] };
    if (!perRow) {
      for (const k of SERIES_FIELDS) if (sd[k] != null && sd[k] !== "") s[k] = cats.map((cat, i) => agg(rowsOf(cat, i), sd[k]));
    }
    s.values = s.value || s.close || s.high || cats.map(() => null);
    return s;
  };
  const series = [];
  if (item.seriesGroup) {
    let groups = bucket(rows, item.seriesGroup).sort((a, b) => sortCompare(a.key, b.key, ctx));
    const max = Math.max(1, Math.floor(CAPS.series / defs.length));
    if (groups.length > max) {
      lc.warn(`${who}: ${groups.length} series groups; only the first ${max} are drawn`);
      groups = groups.slice(0, max);
    }
    const gi = /* @__PURE__ */ new Map();
    groups.forEach((gr, i) => {
      for (const r of gr.rows) gi.set(r, i);
    });
    const split = cats.map((cat) => {
      const parts = groups.map(() => []);
      for (const r of cat.rows) {
        const i = gi.get(r);
        if (i !== void 0) parts[i].push(r);
      }
      return parts;
    });
    let ci = 0;
    groups.forEach((gr, gIdx) => {
      for (const sd of defs) {
        const name = defs.length > 1 ? `${toText(gr.key, null, ctx)} · ${sd.name}` : toText(gr.key, null, ctx);
        series.push(make(sd, name, item.colorByCategory ? byName(lc, pal)(name) : pal[ci % pal.length], (cat, i) => split[i][gIdx]));
        ci++;
      }
    });
  } else {
    defs.forEach((sd, i) => series.push(make(sd, sd.name || `Series ${i + 1}`, sd.color || pal[i % pal.length], (cat) => cat.rows)));
  }
  return { categories: cats.map((c2) => labelOf(c2.key)), buckets: cats, series, rows };
}
function paintChart(item, ctx, lc, base, meta = {}) {
  const m = lc.m;
  const font = resolveFontKey(base.fontFamily, "normal", "normal");
  const bold = resolveFontKey(base.fontFamily, "bold", "normal");
  const fs = Math.max(6, Number(item.fontSize) || 7.5);
  const ink = item.textColor || "#374151";
  const grid = "#e5e7eb";
  const X = item.x, W2 = item.w, H = item.h;
  const who = item.name || "Chart";
  const out = [];
  const measure = (s, { size = fs, f: fk2 = font, maxW = 9999 } = {}) => {
    let str = String(s).slice(0, 200);
    if (m.width(str, fk2, size) > maxW) str = m.ellipsize(str, fk2, size, maxW);
    return { str, w: m.width(str, fk2, size) };
  };
  const text = (s, x, y, { size = fs, f: fk2 = font, color: color2 = ink, align = "left", maxW = 9999, rotate = null } = {}) => {
    const { str, w } = measure(s, { size, f: fk2, maxW });
    const lx = align === "right" ? x - w : align === "center" ? x - w / 2 : x;
    const t = { t: "text", font: fk2, size, color: color2, lines: [{ x: lx, y, text: str, w }] };
    if (rotate) t.rotate = rotate;
    out.push(t);
    return w;
  };
  if (item.background) out.push({ t: "rect", x: X, y: 0, w: W2, h: H, fill: item.background });
  let pal = paletteOf(item.palette);
  const type = CHART_TYPES.includes(item.chartType) ? item.chartType : "column";
  const data = chartData({ ...item, chartType: type, ...MORE_TYPES.has(type) ? { seriesGroup: void 0 } : {} }, ctx, lc, pal);
  if (item.colorByCategory && (type === "pie" || type === "donut" || type === "funnel") && data.categories.length) pal = data.categories.map(byName(lc, pal));
  const links = [];
  const pointCtx = (ci) => {
    const b = data.buckets[ci];
    return { ...ctx, fields: b?.rows[0] || null, aggRows: b?.rows || [], aggIndex: void 0 };
  };
  const pointFill = (ci, fallback) => {
    if (!item.pointColor) return fallback;
    const v = safe2(item.pointColor, pointCtx(ci), lc, who);
    return v ? String(v) : fallback;
  };
  const pointLink = (ci, rect, tip, d) => {
    let l = item.pointAction ? lc.linkFor({ action: item.pointAction, name: item.name }, pointCtx(ci), rect) : null;
    if (!l && item.tooltips === false) return;
    if (!l) l = { t: "link", ...rect, action: null };
    if (tip && item.tooltips !== false) l.tip = tip;
    if (d) {
      l.d = d;
      l.x0 = rect.x;
      l.y0 = rect.y;
    }
    links.push(l);
  };
  let top = 4, bottom = H - 4;
  const title = item.title ? String(safe2(item.title, ctx, lc, who) ?? "") : "";
  if (title) {
    const tw = W2 - 8, full = fs * 1.35, s = String(title).slice(0, 200);
    const fit = m.width(s, bold, full) <= tw ? full : Math.max(fs, Math.floor(full * tw / m.width(s, bold, full) * 10) / 10);
    if (m.width(s, bold, fit) <= tw) {
      text(s, X + 4, top + fs * 1.4, { size: fit, f: bold, color: "#111827", maxW: tw });
      top += fs * 2.1;
    } else {
      const words = s.split(/\s+/);
      let first = "";
      while (words.length && m.width(first ? `${first} ${words[0]}` : words[0], bold, fs) <= tw) first = first ? `${first} ${words.shift()}` : words.shift();
      if (!first) first = words.shift() || "";
      text(first, X + 4, top + fs * 1.4, { size: fs, f: bold, color: "#111827", maxW: tw });
      if (words.length) text(words.join(" "), X + 4, top + fs * 2.6, { size: fs, f: bold, color: "#111827", maxW: tw });
      top += fs * (words.length ? 3.3 : 2.1);
    }
  }
  const byCategory = type === "pie" || type === "donut" || type === "funnel";
  const ovLegend = legendOverlays(item, type, data);
  const more = MORE_TYPES.has(type) ? moreLegend(type, item, { ...data, ctx }, pal) : null;
  const legendItems = more || (byCategory ? data.categories.map((c, i) => ({ name: c, color: pointFill(i, pal[i % pal.length]) })) : [...data.series.map((s) => ({ name: s.name, color: s.color })), ...ovLegend]);
  const legendOn = item.legend !== "none" && type !== "gauge" && (more ? more.length > 0 : byCategory || data.series.length > 1 || ovLegend.length > 0);
  if (legendOn) {
    const rowsL = [];
    let line2 = [], lw = 0;
    for (const li of legendItems.slice(0, 200)) {
      const key = li.mark ? 14 : 10;
      const w = key + m.width(String(li.name).slice(0, 200), font, fs) + 12;
      if (lw + w > W2 - 8 && line2.length) {
        rowsL.push(line2);
        line2 = [];
        lw = 0;
      }
      line2.push({ ...li, w, key });
      lw += w;
    }
    if (line2.length) rowsL.push(line2);
    const lh = fs * 1.6;
    const keep = rowsL.slice(0, Math.max(1, Math.floor((bottom - top) / 2 / lh)));
    bottom -= keep.length * lh;
    keep.forEach((ln, ri) => {
      let lx = X + (W2 - ln.reduce((s, l) => s + l.w, 0)) / 2;
      const ly = bottom + ri * lh + lh * 0.75;
      for (const l of ln) {
        if (l.mark === "line") out.push({ t: "line", x1: lx, y1: ly - fs * 0.35, x2: lx + 11, y2: ly - fs * 0.35, stroke: l.color, strokeWidth: 1.4, ...l.dash ? { dash: [3, 2] } : {} });
        else if (l.mark === "band") out.push({ t: "rect", x: lx, y: ly - fs * 0.75, w: 11, h: 7, fill: l.color + "40", stroke: l.color, strokeWidth: 0.5, radius: 1.5 });
        else out.push({ t: "rect", x: lx, y: ly - fs * 0.75, w: 7, h: 7, fill: l.color, radius: 1.5 });
        text(l.name, lx + l.key, ly, { maxW: l.w - l.key });
        lx += l.w;
      }
    });
    bottom -= 4;
  }
  if (!data.categories.length && !PER_ROW.has(type)) {
    text("No data", X + W2 / 2, (top + bottom) / 2, { align: "center", color: "#9ca3af" });
    return out;
  }
  const axes = item.axes && typeof item.axes === "object" ? item.axes : {};
  const fmtV = (v) => toText(v, axes.y?.format || item.valueFormat || "N0", ctx);
  const anim = item.animation === "grow" || item.animation === "fade" ? item.animation : null;
  const placer = new LabelPlacer({ x: X, y: 0, w: W2, h: H });
  const label = (s, x, y, { size = fs * 0.9, align = "center", color: color2 = ink, f: fk2 = font, alt: alt2 = null } = {}) => {
    const { str, w } = measure(s, { size, f: fk2 });
    if (!str.trim()) return false;
    const tries = [{ x, y, align, color: color2 }];
    if (alt2 != null) tries.push(typeof alt2 === "number" ? { x, y: alt2, align, color: color2 } : { x, y, align, color: color2, ...alt2 });
    for (const p of tries) {
      const lx = p.align === "right" ? p.x - w : p.align === "center" ? p.x - w / 2 : p.x;
      if (placer.place({ x: lx, y: p.y - size * 0.8, w, h: size })) {
        out.push({ t: "text", font: fk2, size, color: p.color, lines: [{ x: lx, y: p.y, text: str, w }] });
        return true;
      }
    }
    return false;
  };
  const labelsOn = !!(item.showValues || item.labelTemplate);
  const labelText = (ci, s, v, pct) => {
    const tpl = item.labelTemplate;
    if (!tpl) return fmtV(v);
    if (typeof tpl === "string" && tpl.startsWith("=")) return toText(safe2(tpl, pointCtx(ci), lc, who), null, ctx);
    const vars = { value: fmtV(v), category: data.categories[ci] ?? "", series: s?.name ?? "", percent: pct == null ? "" : `${Math.round(pct * 100)}%` };
    return String(tpl).slice(0, 500).replace(/\{(\w+)\}/g, (all, k) => Object.hasOwn(vars, k.toLowerCase()) ? vars[k.toLowerCase()] : all);
  };
  const inLegend = (o) => legendOn && o.legend !== false;
  const g = { inLegend, item, ctx, lc, data, out, links, X, W: W2, H, top, bottom, fs, font, bold, ink, grid, text, measure, fmtV, pointFill, pointLink, pointCtx, pal, label, labelsOn, labelText, anim, who, axes, safe: safe2, valueAxis };
  if (MORE_TYPES.has(type)) paintMore(type, g);
  else if (ROUND_TYPES.has(type)) paintRound(type, g);
  else if (PER_ROW.has(type)) paintXY(type, g);
  else paintCartesian(type, g);
  if (lc.regions && out.length && NATIVE_XL.has(type)) out[0].xchart = nativeSpec(type, item, data, g, title, axes);
  const kind = type[0].toUpperCase() + type.slice(1);
  const n = data.categories.length;
  const alt = `${kind} chart${title ? `: ${title}` : ""}${data.series.length ? `; series ${data.series.map((s) => s.name).join(", ")}` : ""}; ${n} ${n === 1 ? "category" : "categories"}`;
  meta.alt = alt;
  return out.concat(links);
}
var NATIVE_XL = /* @__PURE__ */ new Set(["column", "bar", "line", "area", "pie", "donut", "scatter", "bubble", "radar"]);
var XL_CAP = 4e3;
function nativeSpec(type, item, data, g, title, axes) {
  const num4 = (v) => typeof v === "number" && Number.isFinite(v) ? v : null;
  const base = {
    type,
    title: title || null,
    stacked: item.stacked === "percent" ? "percent" : item.stacked ? "stacked" : null,
    xTitle: axes.x?.title || item.xTitle || null,
    yTitle: axes.y?.title || null,
    format: axes.y?.format || item.valueFormat || null,
    legend: item.legend !== "none"
  };
  if (g.xy) return { ...base, series: g.xy.slice(0, 50).map((st) => ({ name: String(st.s.name ?? ""), color: st.s.color, x: st.pts.slice(0, XL_CAP).map((p) => p.x), y: st.pts.slice(0, XL_CAP).map((p) => p.y), size: type === "bubble" ? st.pts.slice(0, XL_CAP).map((p) => p.size) : void 0 })) };
  const colors = type === "pie" || type === "donut" ? data.categories.slice(0, XL_CAP).map((_, i) => g.pointFill(i, g.pal[i % g.pal.length])) : void 0;
  return {
    ...base,
    colors,
    categories: data.categories.slice(0, XL_CAP).map(String),
    series: data.series.slice(0, 50).map((s) => ({
      name: String(s.name ?? ""),
      color: s.color,
      values: s.values.slice(0, XL_CAP).map(num4),
      kind: ["column", "bar", "line", "area"].includes(s.def?.type) ? s.def.type : void 0,
      secondary: s.def?.axis === "secondary" || void 0
    }))
  };
}
var stepDecimals = (step3) => {
  const t = String(Number(step3.toPrecision(6)));
  const m = /\.(\d+)$/.exec(t);
  return t.includes("e-") ? Math.min(6, Number(t.split("e-")[1])) : m ? Math.min(6, m[1].length) : 0;
};
function valueAxis(spec, lo, hi, minPos, { includeZero = true, len = 100, fs = 7.5, fmt: fmt2, percent = false, pad: pad2 = 0, lc, who, name, autoFmt }) {
  spec = spec && typeof spec === "object" ? spec : {};
  const smin = numOrNull(spec.min), smax = numOrNull(spec.max);
  if (spec.log) {
    if (!(minPos > 0) && !(smin > 0)) lc.warn(`${who}: the ${name} axis is logarithmic but has no value above 0`);
    const a2 = smin > 0 ? smin : 10 ** Math.floor(Math.log10(minPos > 0 && minPos < Infinity ? minPos : 1));
    const b2 = smax > a2 ? smax : 10 ** Math.ceil(Math.log10(Math.max(hi, a2 * 10)));
    const ticks2 = logTicks(a2, b2).filter((t) => t >= a2 * 0.999999 && t <= b2 * 1.000001);
    const la = Math.log10(a2), lb = Math.log10(b2);
    return { lo: a2, hi: b2, ticks: ticks2, log: true, fmt: fmt2, frac: (v) => v > 0 ? (Math.log10(v) - la) / (lb - la) : null };
  }
  if (includeZero) {
    lo = Math.min(lo, 0);
    hi = Math.max(hi, 0);
  }
  if (percent) {
    lo = lo < 0 ? -1 : 0;
    hi = 1;
  }
  let padded = false;
  if (pad2 > 0 && hi > lo) {
    const d = (hi - lo) * pad2;
    if (smin == null) lo = lo >= 0 && lo - d < 0 ? 0 : lo - d;
    if (smax == null) hi = hi <= 0 && hi + d > 0 ? 0 : hi + d;
    padded = true;
  }
  const want = len < fs * 6 ? 3 : 5;
  const sc = padded && smin == null && smax == null && (lo >= 0 || hi <= 0) ? niceScaleSpan(lo, hi, want) : niceScale(smin ?? lo, smax ?? hi, want);
  let a = sc.lo, b = sc.hi, ticks;
  if (smin != null || smax != null) {
    a = smin ?? sc.lo;
    b = smax ?? sc.hi;
    if (!(b > a)) b = a + (sc.step || 1);
    const s2 = niceScale(a, b, want);
    ticks = linearTicks(Math.ceil(a / s2.step - 1e-9) * s2.step, b, s2.step);
  } else ticks = linearTicks(a, b, sc.step);
  if (autoFmt && ticks.length > 1) {
    const d = stepDecimals(ticks[1] - ticks[0]);
    if (d > 0) fmt2 = autoFmt(d);
  }
  return { lo: a, hi: b, ticks, log: false, fmt: fmt2, frac: (v) => (v - a) / (b - a) };
}
function overlayValues(o, g) {
  const keys = o.type === "band" ? ["from", "to"] : o.type === "line" ? ["value"] : [];
  const scope = { ...g.ctx, fields: g.data.rows[0] || null, aggRows: g.data.rows, aggIndex: void 0 };
  const vals = [];
  for (const k of keys) {
    const v = typeof o[k] === "number" ? o[k] : numOrNull(g.safe(o[k], scope, g.lc, g.who));
    if (v != null) vals.push(v);
  }
  return o.type === "band" && vals.length !== 2 ? [] : vals;
}
function legendOverlays(item, type, data) {
  if (ROUND_TYPES.has(type) || type === "polar") return [];
  const list = (Array.isArray(item.overlays) ? item.overlays : []).slice(0, CAPS.overlays).filter((o) => o && typeof o === "object" && o.legend !== false);
  const hex2 = (c, d) => typeof c === "string" && /^#[0-9a-f]{6}$/i.test(c) ? c : d;
  const sname = (o) => data.series[Math.max(0, Math.min(data.series.length - 1, Math.floor(Number(o.series)) || 0))]?.name || "";
  const out = [];
  for (const o of list) {
    const lab = o.label != null && String(o.label).trim() ? String(o.label) : null;
    if (o.type === "line") out.push({ name: lab || "Reference line", color: hex2(o.color, "#dc2626"), mark: "line", dash: true });
    else if (o.type === "band") out.push({ name: lab || "Band", color: hex2(o.color, "#f59e0b"), mark: "band" });
    else if (o.type === "trend") out.push({ name: lab || `Trend (${sname(o)})`, color: hex2(o.color, "#475569"), mark: "line", dash: true });
    else if (o.type === "movingAverage" && !PER_ROW.has(type)) out.push({ name: lab || `Moving average ${Math.max(1, Math.round(Number(o.period ?? 3)) || 1)} (${sname(o)})`, color: hex2(o.color, "#475569"), mark: "line" });
  }
  return out;
}
function overlaysOf(item, lc, who) {
  const list = (Array.isArray(item.overlays) ? item.overlays : []).filter((o) => o && typeof o === "object");
  if (list.length > CAPS.overlays) lc.warn(`${who}: ${list.length} overlays; only the first ${CAPS.overlays} are drawn`);
  return list.slice(0, CAPS.overlays);
}
var CAT_KINDS = /* @__PURE__ */ new Set(["column", "bar", "line", "area"]);
function paintCartesian(type, g) {
  const { item, lc, data, out, X, W: W2, top, bottom, fs, font, text, measure, pointFill, pointLink, label, labelsOn, labelText, anim, who, axes, ink, grid } = g;
  const m = lc.m;
  const horiz = type === "bar";
  const financialChart = type === "candlestick" || type === "ohlc";
  const stackMode = item.stacked === "percent" ? "percent" : item.stacked ? "stack" : null;
  const S3 = data.series.map((s, i) => {
    let kind = CAT_KINDS.has(s.def.type) ? s.def.type : financialChart ? "column" : type;
    if (horiz && kind === "column") kind = "bar";
    if (!horiz && kind === "bar") kind = "column";
    const fin2 = financialChart && (s.open || s.close) ? type : null;
    const range = !fin2 && !!(s.low && s.high);
    const filled = kind === "column" || kind === "bar";
    const stacks = !!stackMode && !range && !fin2 && (filled || kind === "area") && (CAT_KINDS.has(s.def.type) || type === "column" || type === "bar" || type === "area");
    const mode = ["smooth", "step", "straight"].includes(s.def.line) ? s.def.line : ["smooth", "step"].includes(item.line) ? item.line : "straight";
    return { s, i, kind, fin: fin2, range, filled, stacks, mode, axis: s.def.axis === "secondary" ? 1 : 0, pts: [], slot: 0 };
  });
  const n = data.categories.length;
  const stackKey = (r) => `${r.axis}:${r.filled ? "f" : "a"}`;
  const totals = /* @__PURE__ */ new Map();
  if (stackMode === "percent") {
    for (const r of S3) if (r.stacks) {
      let t = totals.get(stackKey(r));
      if (!t) totals.set(stackKey(r), t = new Array(n).fill(0));
      r.s.values.forEach((v, ci) => {
        if (v != null) t[ci] += Math.abs(v);
      });
    }
  }
  const acc = /* @__PURE__ */ new Map();
  const stackOf = (r) => {
    let st = acc.get(stackKey(r));
    if (!st) acc.set(stackKey(r), st = { pos: new Array(n).fill(0), neg: new Array(n).fill(0), run: new Array(n).fill(0), axis: r.axis });
    return st;
  };
  for (const r of S3) {
    r.pts = r.s.values.map((v, ci) => {
      if (r.fin) {
        const o = r.s.open?.[ci] ?? null, h = r.s.high?.[ci] ?? null, l = r.s.low?.[ci] ?? null, c = r.s.close?.[ci] ?? null;
        if (h == null || l == null || c == null && o == null) return null;
        return { o: o ?? c, h, l, c: c ?? o, v: c ?? o, a: l, b: h };
      }
      if (r.range) {
        const l = r.s.low[ci], h = r.s.high[ci];
        return l == null || h == null ? null : { a: l, b: h, v: h, l };
      }
      if (v == null) return null;
      if (!r.stacks) return { a: 0, b: v, v };
      const t = stackMode === "percent" ? totals.get(stackKey(r))[ci] : 0;
      const val = stackMode === "percent" ? t ? v / t : 0 : v;
      const st = stackOf(r);
      if (val >= 0) st.pos[ci] += val;
      else st.neg[ci] += val;
      const pct = stackMode === "percent" ? val : null;
      if (!r.filled) {
        const a2 = st.run[ci];
        st.run[ci] = a2 + val;
        return { a: a2, b: a2 + val, v, pct };
      }
      const arr = val >= 0 ? st.posBar || (st.posBar = new Array(n).fill(0)) : st.negBar || (st.negBar = new Array(n).fill(0));
      const a = arr[ci];
      arr[ci] = a + val;
      return { a, b: a + val, v, pct };
    });
  }
  const ovs = overlaysOf(item, lc, who).map((o) => ({ ...o, axisI: o.axis === "secondary" ? 1 : 0, vals: overlayValues(o, g) }));
  const rng = [0, 1].map(() => ({ lo: Infinity, hi: -Infinity, minPos: Infinity, any: false, allFin: true }));
  const see = (ai, v) => {
    if (v == null || !Number.isFinite(v)) return;
    const q = rng[ai];
    q.lo = Math.min(q.lo, v);
    q.hi = Math.max(q.hi, v);
    if (v > 0) q.minPos = Math.min(q.minPos, v);
  };
  for (const r of S3) {
    rng[r.axis].any = true;
    if (!r.fin) rng[r.axis].allFin = false;
    if (!r.stacks) {
      for (const p of r.pts) if (p) {
        see(r.axis, p.a);
        see(r.axis, p.b);
      }
    }
  }
  for (const st of acc.values()) for (let ci = 0; ci < n; ci++) {
    see(st.axis, st.pos[ci]);
    see(st.axis, st.neg[ci]);
  }
  for (const o of ovs) for (const v of o.vals) see(o.axisI, v);
  for (const q of rng) if (q.lo === Infinity) {
    q.lo = 0;
    q.hi = 0;
  }
  const hasY2 = rng[1].any;
  const ySpec = axes.y || {}, y2Spec = axes.y2 || {}, xSpec = axes.x || {};
  const fmtFor = (spec, fallback) => (v) => toText(v, stackMode === "percent" && !spec.format ? "P0" : spec.format || fallback, g.ctx);
  const fmt1 = fmtFor(ySpec, item.valueFormat || "N0");
  const fmt2 = fmtFor(y2Spec, ySpec.format || item.valueFormat || "N0");
  const auto = (spec, ...given) => stackMode === "percent" || spec.format || given.some(Boolean) ? void 0 : (d) => (v) => toText(v, `N${d}`, g.ctx);
  const catW = data.categories.reduce((m2, c) => Math.max(m2, measure(c).w), 10);
  const leftTitle = horiz ? xSpec.title : ySpec.title;
  const bottomTitle = horiz ? ySpec.title || item.xTitle : xSpec.title || item.xTitle;
  const angleSet = !horiz ? Math.max(-90, Math.min(90, Number(xSpec.labelAngle) || 0)) : 0;
  const layoutAt = (angle2) => {
    const sin2 = Math.abs(Math.sin(angle2 * Math.PI / 180)), cos2 = Math.abs(Math.cos(angle2 * Math.PI / 180));
    const catBand2 = angle2 ? Math.min(catW, (bottom - top) * 0.4) * sin2 + fs * cos2 + fs * 0.8 : fs * 1.8;
    const plotTop2 = top + fs * 0.6 + (horiz && hasY2 ? fs * 1.6 : 0);
    const plotBottom2 = bottom - (horiz ? fs * 1.6 : catBand2) - (bottomTitle ? fs * 1.6 : 0);
    const opt = { len: horiz ? W2 * 0.6 : plotBottom2 - plotTop2, fs, lc, who, percent: stackMode === "percent" };
    const ax2 = [
      valueAxis(ySpec, rng[0].lo, rng[0].hi, rng[0].minPos, { ...opt, includeZero: !rng[0].allFin || !rng[0].any, fmt: fmt1, name: "y", autoFmt: auto(ySpec, item.valueFormat) }),
      valueAxis(y2Spec, rng[1].lo, rng[1].hi, rng[1].minPos, { ...opt, includeZero: !rng[1].allFin, fmt: fmt2, name: "secondary y", autoFmt: auto(y2Spec, ySpec.format, item.valueFormat) })
    ];
    const valW3 = Math.max(10, ...ax2[0].ticks.map((t) => m.width(ax2[0].fmt(t), font, fs)));
    const valW22 = hasY2 ? Math.max(10, ...ax2[1].ticks.map((t) => m.width(ax2[1].fmt(t), font, fs))) : 0;
    const left2 = X + 4 + (leftTitle ? fs * 1.6 : 0) + (horiz ? Math.min(catW, W2 * 0.32) : valW3) + 6;
    const right2 = X + W2 - 6 - (!horiz && hasY2 ? valW22 + 6 + (y2Spec.title ? fs * 1.6 : 0) : 0);
    return { angle: angle2, sin: sin2, cos: cos2, catBand: catBand2, plotTop: plotTop2, plotBottom: plotBottom2, ax: ax2, valW: valW3, valW2: valW22, left: left2, right: right2 };
  };
  let lay = layoutAt(angleSet);
  if (!horiz && xSpec.labelAngle == null && catW + 6 > (lay.right - lay.left) / Math.max(1, n)) lay = layoutAt(-45);
  const { angle, sin, cos, catBand, plotTop, plotBottom, ax, valW, valW2, left, right } = lay;
  for (const r of S3) if (ax[r.axis].log && r.pts.some((p) => p && !r.fin && p.b <= 0)) {
    lc.warn(`${who}: values of 0 or less cannot be drawn on a logarithmic axis`);
    break;
  }
  if (bottomTitle) text(bottomTitle, (left + right) / 2, bottom - 2, { align: "center", color: "#6b7280" });
  const midY = (plotTop + plotBottom) / 2;
  if (leftTitle) text(leftTitle, X + 4 + fs, midY, { align: "center", color: "#6b7280", maxW: plotBottom - plotTop, rotate: { a: -90, cx: X + 4 + fs, cy: midY } });
  if (hasY2 && y2Spec.title) {
    if (horiz) text(y2Spec.title, (left + right) / 2, top + fs, { align: "center", color: "#6b7280" });
    else text(y2Spec.title, X + W2 - 4 - fs, midY, { align: "center", color: "#6b7280", maxW: plotBottom - plotTop, rotate: { a: 90, cx: X + W2 - 4 - fs, cy: midY } });
  }
  const vpos = (ai, v) => {
    let fr = ax[ai].frac(v);
    fr = fr == null ? 0 : Math.max(0, Math.min(1, fr));
    const rev = (ai ? y2Spec : ySpec).reversed;
    if (horiz) return rev ? right - fr * (right - left) : left + fr * (right - left);
    return rev ? plotTop + fr * (plotBottom - plotTop) : plotBottom - fr * (plotBottom - plotTop);
  };
  const baseOf = (ai) => ax[ai].log ? ax[ai].lo : Math.max(ax[ai].lo, Math.min(0, ax[ai].hi));
  const tickEvery = (a, w) => !horiz || a.ticks.length < 2 ? 1 : Math.max(1, Math.ceil((w + 6) / (Math.abs(right - left) / (a.ticks.length - 1))));
  const e1 = tickEvery(ax[0], valW);
  ax[0].ticks.forEach((t, i) => {
    const p = vpos(0, t);
    const showGrid = ySpec.gridlines !== false;
    if (horiz) {
      if (showGrid) out.push({ t: "line", x1: p, y1: plotTop, x2: p, y2: plotBottom, stroke: grid, strokeWidth: 0.5 });
      if (i % e1 === 0) text(ax[0].fmt(t), p, plotBottom + fs * 1.3, { align: "center" });
    } else {
      if (showGrid) out.push({ t: "line", x1: left, y1: p, x2: right, y2: p, stroke: grid, strokeWidth: 0.5 });
      text(ax[0].fmt(t), left - 5, p + fs * 0.35, { align: "right" });
    }
  });
  if (hasY2) {
    const e2 = tickEvery(ax[1], valW2);
    ax[1].ticks.forEach((t, i) => {
      const p = vpos(1, t);
      if (y2Spec.gridlines) out.push(horiz ? { t: "line", x1: p, y1: plotTop, x2: p, y2: plotBottom, stroke: grid, strokeWidth: 0.5, dash: [2, 2] } : { t: "line", x1: left, y1: p, x2: right, y2: p, stroke: grid, strokeWidth: 0.5, dash: [2, 2] });
      if (horiz) {
        if (i % e2 === 0) text(ax[1].fmt(t), p, plotTop - fs * 0.5, { align: "center" });
      } else text(ax[1].fmt(t), right + 5, p + fs * 0.35);
    });
  }
  const span = horiz ? plotBottom - plotTop : right - left;
  const band = span / Math.max(1, n);
  const center = (i) => {
    const j = xSpec.reversed ? n - 1 - i : i;
    return (horiz ? plotTop : left) + band * (j + 0.5);
  };
  const P = (c, v) => horiz ? { x: v, y: c } : { x: c, y: v };
  if (xSpec.gridlines) for (let i = 0; i <= n; i++) {
    const p = (horiz ? plotTop : left) + band * i;
    out.push(horiz ? { t: "line", x1: left, y1: p, x2: right, y2: p, stroke: grid, strokeWidth: 0.5 } : { t: "line", x1: p, y1: plotTop, x2: p, y2: plotBottom, stroke: grid, strokeWidth: 0.5 });
  }
  for (const o of ovs) if (o.type === "band" && o.vals.length === 2) {
    const ai = o.axisI && hasY2 ? 1 : 0;
    const p0 = vpos(ai, o.vals[0]), p1 = vpos(ai, o.vals[1]);
    const color2 = typeof o.color === "string" && /^#[0-9a-f]{6}$/i.test(o.color) ? o.color : "#f59e0b";
    out.push(horiz ? { t: "rect", x: Math.min(p0, p1), y: plotTop, w: Math.abs(p1 - p0), h: plotBottom - plotTop, fill: color2 + "26" } : { t: "rect", x: left, y: Math.min(p0, p1), w: right - left, h: Math.abs(p1 - p0), fill: color2 + "26" });
    if (o.label && !g.inLegend(o)) text(String(o.label), horiz ? Math.max(p0, p1) - 2 : right - 2, horiz ? plotTop + fs : Math.min(p0, p1) + fs * 1.1, { align: "right", color: "#92400e", size: fs * 0.9 });
  }
  const zero = vpos(0, baseOf(0));
  out.push(horiz ? { t: "line", x1: zero, y1: plotTop, x2: zero, y2: plotBottom, stroke: "#9ca3af", strokeWidth: 0.75 } : { t: "line", x1: left, y1: zero, x2: right, y2: zero, stroke: "#9ca3af", strokeWidth: 0.75 });
  if (angle) {
    const every = Math.max(1, Math.ceil(fs * 1.2 / Math.max(band * sin, 0.01)));
    const maxW = Math.max(10, (catBand - fs * cos - fs * 0.8) / Math.max(sin, 0.01));
    data.categories.forEach((c, i) => {
      if (i % every) return;
      const cx = center(i), cy = plotBottom + fs * 0.6;
      text(c, cx, cy + fs * 0.35 * cos, { align: angle < 0 ? "right" : "left", maxW, rotate: { a: angle, cx, cy } });
    });
    if (every > 1) lc.warn(`${who}: ${n - Math.ceil(n / every)} of ${n} category labels do not fit even turned, so they are not shown (every bar is drawn)`);
  } else {
    const every = Math.max(1, Math.ceil((horiz ? fs * 1.3 : catW + 6) / band));
    data.categories.forEach((c, i) => {
      if (i % every) return;
      if (horiz) text(c, left - 5, center(i) + fs * 0.35, { align: "right", maxW: left - X - 8 - (leftTitle ? fs * 1.6 : 0) });
      else text(c, center(i), plotBottom + fs * 1.35, { align: "center", maxW: band * every - 2 });
    });
    if (every > 1) lc.warn(`${who}: ${n - Math.ceil(n / every)} of ${n} category labels do not fit, so they are not shown (every bar is drawn)`);
  }
  const multi = data.series.length > 1;
  const tipOf = (r, ci, p) => {
    const head = `${data.categories[ci]}${multi ? ` · ${r.s.name}` : ""}: `;
    const fmt3 = r.axis && hasY2 ? ax[1].fmt : g.fmtV;
    if (r.fin) return `${head}open ${fmt3(p.o)}, high ${fmt3(p.h)}, low ${fmt3(p.l)}, close ${fmt3(p.c)}`;
    if (r.range) return `${head}${fmt3(p.l)} – ${fmt3(p.v)}`;
    return `${head}${fmt3(p.v)}${p.pct != null ? ` (${Math.round(p.pct * 100)}%)` : ""}`;
  };
  const growAnim = (rect, p0, i) => anim === "grow" ? { k: horiz ? "growX" : "growY", o: horiz ? p0 <= rect.x + 0.01 ? "left" : "right" : p0 >= rect.y + rect.h - 0.01 ? "bottom" : "top", i } : anim ? { k: "fade", i } : null;
  const fadeAnim = (i) => anim ? { k: "fade", i } : null;
  const pos = item.labelPosition;
  const shares = /* @__PURE__ */ new Map();
  const share = (r, v) => {
    if (!item.labelTemplate || !/\{percent\}/i.test(String(item.labelTemplate))) return null;
    if (!shares.has(r)) {
      let t2 = 0;
      for (const p of r.pts) if (p) t2 += Math.abs(p.v || 0);
      shares.set(r, t2);
    }
    const t = shares.get(r);
    return t ? v / t : null;
  };
  const order = [...S3.filter((r) => r.kind === "area" && !r.fin), ...S3.filter((r) => r.filled && !r.fin), ...S3.filter((r) => r.fin), ...S3.filter((r) => r.kind === "line" && !r.fin)];
  const slots = /* @__PURE__ */ new Map();
  for (const r of S3) if (r.filled && !r.fin) {
    const key = r.stacks ? `stack:${r.axis}` : `s${r.i}`;
    if (!slots.has(key)) slots.set(key, slots.size);
    r.slot = slots.get(key);
  }
  const groupW = band * 0.72;
  const bw = groupW / Math.max(1, slots.size);
  for (const r of order) {
    const s = r.s, ai = r.axis && hasY2 ? 1 : 0;
    if (r.fin) {
      const finW = Math.min(band * 0.6, 24);
      r.pts.forEach((p, ci) => {
        if (!p) return;
        const color2 = p.c >= p.o ? item.upColor || "#16a34a" : item.downColor || "#dc2626";
        const c = center(ci);
        const ph = vpos(ai, p.h), pl = vpos(ai, p.l), po = vpos(ai, p.o), pc = vpos(ai, p.c);
        const ln = (c1, v1, c2, v2, w = 1) => {
          const a = P(c1, v1), b = P(c2, v2);
          out.push(tag2({ t: "line", x1: a.x, y1: a.y, x2: b.x, y2: b.y, stroke: color2, strokeWidth: w }, fadeAnim(ci)));
        };
        if (r.fin === "candlestick") {
          ln(c, ph, c, pl);
          const a = Math.min(po, pc), len = Math.max(0.75, Math.abs(po - pc));
          out.push(tag2(horiz ? { t: "rect", x: a, y: c - finW / 2, w: len, h: finW, fill: color2 } : { t: "rect", x: c - finW / 2, y: a, w: finW, h: len, fill: color2 }, fadeAnim(ci)));
        } else {
          ln(c, ph, c, pl, 1.25);
          ln(c - finW / 2, po, c, po, 1.25);
          ln(c, pc, c + finW / 2, pc, 1.25);
        }
        pointLink(ci, horiz ? { x: Math.min(ph, pl) - 2, y: c - band / 2, w: Math.abs(ph - pl) + 4, h: band } : { x: c - band / 2, y: Math.min(ph, pl) - 2, w: band, h: Math.abs(ph - pl) + 4 }, tipOf(r, ci, p));
        if (labelsOn) {
          const q = P(c, ph);
          if (horiz) label(labelText(ci, s, p.v), q.x + 3, q.y + fs * 0.35, { align: "left" });
          else label(labelText(ci, s, p.v), q.x, q.y - 3);
        }
      });
      continue;
    }
    if (r.filled) {
      r.pts.forEach((p, ci) => {
        if (!p) return;
        const p0 = vpos(ai, r.range || r.stacks ? p.a : baseOf(ai)), p1 = vpos(ai, p.b);
        const off = center(ci) - groupW / 2 + r.slot * bw;
        const fill = data.series.length === 1 ? pointFill(ci, s.color) : s.color;
        const rect = horiz ? { t: "rect", x: Math.min(p0, p1), y: off + bw * 0.08, w: Math.abs(p1 - p0), h: bw * 0.84, fill } : { t: "rect", x: off + bw * 0.08, y: Math.min(p0, p1), w: bw * 0.84, h: Math.abs(p1 - p0), fill };
        out.push(tag2(rect, anim && growAnim(rect, p0, ci)));
        pointLink(ci, horiz ? { x: left, y: rect.y, w: right - left, h: rect.h } : { x: rect.x, y: plotTop, w: rect.w, h: plotBottom - plotTop }, tipOf(r, ci, p));
        if (!labelsOn) return;
        const str = labelText(ci, s, p.v, p.pct ?? share(r, p.v));
        const where = pos === "inside" || pos === "center" || pos === "outside" ? pos : r.stacks ? "center" : "outside";
        const sz = fs * 0.9;
        const color2 = where === "outside" ? ink : inkOn(fill);
        const back = horiz ? p1 < p0 : p1 > p0;
        if (where === "center") label(str, rect.x + rect.w / 2, rect.y + rect.h / 2 + sz * 0.35, { color: color2, size: sz });
        else if (where === "inside") {
          if (horiz) label(str, back ? rect.x + 3 : rect.x + rect.w - 3, rect.y + rect.h / 2 + sz * 0.35, { align: back ? "left" : "right", color: color2, size: sz });
          else label(str, rect.x + rect.w / 2, back ? rect.y + rect.h - 3 : rect.y + sz + 2, { color: color2, size: sz });
        } else if (horiz) label(str, Math.max(p0, p1) + 3, rect.y + rect.h / 2 + fs * 0.35, { align: "left", size: sz, alt: { x: Math.max(p0, p1) - 3, align: "right", color: inkOn(fill) } });
        else label(str, rect.x + rect.w / 2, Math.min(p0, p1) - 3, { size: sz, alt: { y: Math.min(p0, p1) + sz + 2, color: inkOn(fill) } });
      });
      continue;
    }
    const pts = [];
    r.pts.forEach((p, ci) => {
      if (p) pts.push({ ...P(center(ci), vpos(ai, p.b)), base: P(center(ci), vpos(ai, r.range || r.stacks ? p.a : baseOf(ai))), v: p.v, p, ci });
    });
    if (!pts.length) continue;
    const along = horiz ? "y" : "x";
    if (r.kind === "area" || r.range) {
      let d;
      if (r.mode === "straight" && !r.range) {
        const last = pts[pts.length - 1];
        d = `M ${f2(pts[0].base.x)} ${f2(pts[0].base.y)} ` + pts.map((q) => `L ${f2(q.x)} ${f2(q.y)}`).join(" ") + ` L ${f2(last.base.x)} ${f2(last.base.y)} ` + [...pts].reverse().map((q) => `L ${f2(q.base.x)} ${f2(q.base.y)}`).join(" ") + " Z";
      } else {
        d = curvePath(pts, r.mode, { along }) + " " + curvePath([...pts].reverse().map((q) => q.base), r.mode, { along, move: false }) + " Z";
      }
      out.push(tag2({ t: "path", x: 0, y: 0, d, fill: s.color + "40", stroke: null }, fadeAnim(r.i)));
      if (r.range) out.push(tag2({ t: "path", x: 0, y: 0, d: curvePath(pts.map((q) => q.base), r.mode, { along }), fill: null, stroke: s.color, strokeWidth: 1 }, fadeAnim(r.i)));
    }
    out.push(tag2({ t: "path", x: 0, y: 0, d: curvePath(pts, r.mode, { along }), fill: null, stroke: s.color, strokeWidth: r.range ? 1 : 1.6 }, fadeAnim(r.i)));
    if (r.kind === "line" && !r.range && pts.length <= 40) for (const q of pts) out.push(tag2({ t: "ellipse", cx: q.x, cy: q.y, rx: 2, ry: 2, fill: "#ffffff", stroke: s.color, strokeWidth: 1.2 }, fadeAnim(q.ci)));
    for (const q of pts) pointLink(q.ci, horiz ? { x: left, y: q.y - band / 2, w: right - left, h: band } : { x: q.x - band / 2, y: plotTop, w: band, h: plotBottom - plotTop }, tipOf(r, q.ci, q.p));
    if (labelsOn) for (const q of pts) {
      const str = labelText(q.ci, s, q.v, q.p.pct ?? share(r, q.v));
      const sz = fs * 0.85;
      if (horiz) label(str, q.x + 4, q.y - 3, { align: "left", size: sz, alt: q.y + sz + 3 });
      else if (pos === "center" || pos === "inside") label(str, q.x, q.y + sz * 0.35, { size: sz });
      else label(str, q.x, q.y - 4, { size: sz, alt: q.y + sz + 4 });
    }
  }
  for (const o of ovs) {
    if (o.type === "band") continue;
    const color2 = typeof o.color === "string" && /^#[0-9a-f]{6}$/i.test(o.color) ? o.color : o.type === "line" ? "#dc2626" : "#475569";
    if (o.type === "line") {
      const ai2 = o.axisI && hasY2 ? 1 : 0;
      for (const v of o.vals) {
        const p = vpos(ai2, v);
        out.push(horiz ? { t: "line", x1: p, y1: plotTop, x2: p, y2: plotBottom, stroke: color2, strokeWidth: 1, dash: [4, 3] } : { t: "line", x1: left, y1: p, x2: right, y2: p, stroke: color2, strokeWidth: 1, dash: [4, 3] });
        if (o.label) {
          const s = `${o.label}${o.showValue === false ? "" : ` ${ax[ai2].fmt(v)}`}`;
          if (horiz) text(s, p + 2, plotTop + fs, { color: color2, size: fs * 0.9 });
          else text(s, right - 2, p - 2.5, { align: "right", color: color2, size: fs * 0.9 });
        }
      }
      continue;
    }
    if (o.type !== "trend" && o.type !== "movingAverage") continue;
    const r = S3[Math.max(0, Math.min(S3.length - 1, Math.floor(Number(o.series)) || 0))];
    if (!r) continue;
    const ai = r.axis && hasY2 ? 1 : 0;
    const vals = r.pts.map((p) => p ? r.fin ? p.c : p.b : null);
    const pts = [];
    if (o.type === "movingAverage") {
      movingAverage(vals, o.period ?? 3).forEach((v, ci) => {
        if (v != null) pts.push(P(center(ci), vpos(ai, v)));
      });
    } else {
      const kind = o.kind === "exp" || o.kind === "poly" ? o.kind : "linear";
      const fit = fitTrend(vals.map((v, ci) => [ci, v]).filter(([, v]) => v != null), kind, o.order);
      if (!fit) {
        lc.warn(`${who}: not enough values for the ${kind} trend line`);
        continue;
      }
      const steps = kind === "linear" ? 1 : Math.min(60, Math.max(2, n * 4));
      for (let i = 0; i <= steps; i++) {
        const ci = (n - 1) * (i / steps);
        const v = fit.at(ci);
        if (Number.isFinite(v)) pts.push(P(center(ci), vpos(ai, v)));
      }
    }
    if (pts.length < 2) continue;
    out.push({ t: "path", x: 0, y: 0, d: curvePath(pts, "straight"), fill: null, stroke: color2, strokeWidth: 1.2, ...o.type === "trend" ? { dash: [4, 3] } : {} });
    if (o.label && !g.inLegend(o)) {
      const e = pts[pts.length - 1];
      if (horiz) text(String(o.label), e.x + 3, e.y + fs * 0.35, { color: color2, size: fs * 0.9 });
      else text(String(o.label), Math.min(e.x, right) - 2, e.y - 4, { align: "right", color: color2, size: fs * 0.9 });
    }
  }
}
function robustWindow(vals) {
  const s = vals.filter(Number.isFinite).sort((a, b) => a - b);
  if (s.length < 2) return null;
  const at = (q) => s[Math.min(s.length - 1, Math.floor(q * (s.length - 1)))];
  const p1 = at(0.01), p99 = at(0.99);
  return { p1, p99, extreme: p99 > p1 && s[s.length - 1] - s[0] > 5 * (p99 - p1) };
}
function rowPoints(type, g) {
  const { item, ctx, lc, data, who } = g;
  const c = { ...ctx };
  const cap = Math.max(1, Math.floor(CAPS.points / Math.max(1, data.series.length)));
  let rows = data.rows;
  if (rows.length > cap) {
    lc.warn(`${who}: ${rows.length} rows; only the first ${cap} points are drawn`);
    rows = rows.slice(0, cap);
  }
  const blank2 = (v) => v == null || v === "";
  const drawn = /* @__PURE__ */ new Set();
  const sets = data.series.map((s, si) => {
    const pts = [];
    rows.forEach((r, ri) => {
      c.fields = r;
      const rx = safe2(item.xValue, c, lc, who), ry = safe2(s.def.value || "=0", { ...c, aggRows: [r] }, lc, who);
      if (blank2(rx) || blank2(ry)) return;
      const x = Number(rx), y = Number(ry);
      if (!Number.isFinite(x) || !Number.isFinite(y)) return;
      let size = 1;
      if (type === "bubble") {
        size = Number(safe2(s.def.size || "=1", { ...c, aggRows: [r] }, lc, who));
        if (!Number.isFinite(size) || size <= 0) return;
      }
      pts.push({ x, y, size });
      drawn.add(ri);
    });
    return { s, pts, i: si };
  });
  const missing = rows.length - drawn.size;
  if (missing > 0 && !(type === "polar" && item.xValue == null)) lc.warn(`${who}: ${missing} of ${rows.length} rows have no x or y value and are not drawn`);
  return sets;
}
function paintXY(type, g) {
  const { item, ctx, lc, out, X, W: W2, top, bottom, fs, font, text, label, labelsOn, axes, who, grid, anim } = g;
  const sets = rowPoints(type, g);
  g.xy = sets;
  if (!sets.some((x) => x.pts.length)) {
    text("No data", X + W2 / 2, (top + bottom) / 2, { align: "center", color: "#9ca3af" });
    return;
  }
  if (type === "polar") {
    paintPolar(g, sets);
    return;
  }
  let xlo = Infinity, xhi = -Infinity, ylo = Infinity, yhi = -Infinity, xmp = Infinity, ymp = Infinity, smax = 0;
  for (const st of sets) for (const p of st.pts) {
    xlo = Math.min(xlo, p.x);
    xhi = Math.max(xhi, p.x);
    ylo = Math.min(ylo, p.y);
    yhi = Math.max(yhi, p.y);
    smax = Math.max(smax, p.size);
    if (p.x > 0) xmp = Math.min(xmp, p.x);
    if (p.y > 0) ymp = Math.min(ymp, p.y);
  }
  const xs = axes.x || {}, ys = axes.y || {};
  const fmtY = (v) => toText(v, ys.format || item.valueFormat || "N0", ctx);
  const fmtX = (v) => toText(v, xs.format || item.xFormat || "N0", ctx);
  const allX = sets.flatMap((st) => st.pts.map((p) => p.x)), allY = sets.flatMap((st) => st.pts.map((p) => p.y));
  const wx = robustWindow(allX), wy = robustWindow(allY);
  const clipOn = item.outliers === "clip" || item.outliers !== "none" && allX.length >= 20 && !!(wx?.extreme || wy?.extreme);
  const clipX = clipOn && wx ? { lo: wx.p1, hi: wx.p99 } : null, clipY = clipOn && wy ? { lo: wy.p1, hi: wy.p99 } : null;
  const beyond = (p) => clipX && (p.x < clipX.lo || p.x > clipX.hi) || clipY && (p.y < clipY.lo || p.y > clipY.hi);
  const clipped = clipOn ? sets.reduce((k, st) => k + st.pts.filter(beyond).length, 0) : 0;
  if (clipped) lc.warn(`${who}: ${clipped} of ${allX.length} points are outside the 1st-99th percentile range and are drawn at the edge (set outliers: 'none' to show the full range)`);
  const xmin = numOrNull(xs.min), xmax = numOrNull(xs.max), ymin = numOrNull(ys.min), ymax = numOrNull(ys.max);
  const pastAxis = (p) => xmin != null && p.x < xmin || xmax != null && p.x > xmax || ymin != null && p.y < ymin || ymax != null && p.y > ymax;
  const pinned = sets.reduce((k, st) => k + st.pts.filter(pastAxis).length, 0);
  if (pinned) lc.warn(`${who}: ${pinned} points are outside the axis range you set and are drawn at the edge`);
  if (clipX) {
    xlo = clipX.lo;
    xhi = clipX.hi;
  }
  if (clipY) {
    ylo = clipY.lo;
    yhi = clipY.hi;
  }
  const ay = valueAxis(ys, ylo, yhi, ymp, { includeZero: false, pad: 0.05, len: bottom - top, fs, fmt: fmtY, lc, who, name: "y" });
  const axx = valueAxis(xs, xlo, xhi, xmp, { includeZero: false, pad: 0.05, len: W2, fs, fmt: fmtX, lc, who, name: "x" });
  const leftTitle = ys.title, bottomTitle = xs.title || item.xTitle;
  const left = X + 10 + (leftTitle ? fs * 1.6 : 0) + Math.max(...ay.ticks.map((t) => lc.m.width(fmtY(t), font, fs)));
  const right = X + W2 - 6, pb = bottom - fs * 1.8 - (bottomTitle ? fs * 1.6 : 0), pt = top + fs * 0.6;
  const maxR = Math.max(4, Math.min(right - left, pb - pt) / 12);
  const ins = type === "bubble" ? maxR : 0;
  const clamp2 = (v) => Math.max(0, Math.min(1, v ?? 0));
  const px = (v) => {
    const fr = clamp2(axx.frac(v));
    return xs.reversed ? right - ins - fr * (right - left - 2 * ins) : left + ins + fr * (right - left - 2 * ins);
  };
  const py = (v) => {
    const fr = clamp2(ay.frac(v));
    return ys.reversed ? pt + ins + fr * (pb - pt - 2 * ins) : pb - ins - fr * (pb - pt - 2 * ins);
  };
  if (bottomTitle) text(bottomTitle, (left + right) / 2, bottom - 2, { align: "center", color: "#6b7280" });
  if (leftTitle) text(leftTitle, X + 4 + fs, (pt + pb) / 2, { align: "center", color: "#6b7280", rotate: { a: -90, cx: X + 4 + fs, cy: (pt + pb) / 2 } });
  for (const t of ay.ticks) {
    if (ys.gridlines !== false) out.push({ t: "line", x1: left, y1: py(t), x2: right, y2: py(t), stroke: grid, strokeWidth: 0.5 });
    text(fmtY(t), left - 5, py(t) + fs * 0.35, { align: "right" });
  }
  const tw = Math.max(...axx.ticks.map((t) => lc.m.width(fmtX(t), font, fs)));
  const every = Math.max(1, Math.ceil((tw + 6) / (Math.abs(right - left) / Math.max(1, axx.ticks.length - 1))));
  axx.ticks.forEach((t, i) => {
    if (xs.gridlines) out.push({ t: "line", x1: px(t), y1: pt, x2: px(t), y2: pb, stroke: grid, strokeWidth: 0.5 });
    if (i % every === 0) text(fmtX(t), px(t), pb + fs * 1.35, { align: "center" });
  });
  out.push({ t: "line", x1: left, y1: pb, x2: right, y2: pb, stroke: "#9ca3af", strokeWidth: 0.75 });
  const overlays = overlaysOf(item, lc, who);
  for (const o of overlays) if (o.type === "band") {
    const v = overlayValues(o, g);
    if (v.length !== 2) continue;
    out.push({ t: "rect", x: left, y: Math.min(py(v[0]), py(v[1])), w: right - left, h: Math.abs(py(v[0]) - py(v[1])), fill: (/^#[0-9a-f]{6}$/i.test(o.color || "") ? o.color : "#f59e0b") + "26" });
  }
  const multi = sets.length > 1;
  for (const { s, pts, i: si } of sets) {
    const col = s.color || g.pal[si % g.pal.length];
    const list = type === "bubble" ? [...pts].sort((a, b) => b.size - a.size) : pts;
    list.forEach((p, j) => {
      const r = type === "bubble" ? Math.max(1.5, maxR * Math.sqrt(p.size / smax)) : 2.2;
      const e = type === "bubble" ? { t: "ellipse", cx: px(p.x), cy: py(p.y), rx: r, ry: r, fill: col + "99", stroke: col, strokeWidth: 0.75 } : { t: "ellipse", cx: px(p.x), cy: py(p.y), rx: r, ry: r, fill: col + "b3", stroke: null };
      out.push(tag2(e, anim && { k: anim === "grow" ? "scale" : "fade", i: j }));
      const isClipped = clipped && beyond(p) || pastAxis(p);
      if (isClipped) out.push({ t: "ellipse", cx: e.cx, cy: e.cy, rx: r + 1.6, ry: r + 1.6, fill: "none", stroke: col, strokeWidth: 0.9 });
      if (item.tooltips !== false && (type === "bubble" || multi || isClipped)) g.links.push({ t: "link", x: e.cx - r, y: e.cy - r, w: r * 2, h: r * 2, action: null, tip: `${multi ? `${s.name}: ` : ""}${fmtX(p.x)}, ${fmtY(p.y)}${type === "bubble" ? ` (${toText(p.size, null, ctx)})` : ""}${isClipped ? clipped && beyond(p) ? " (outlier, drawn at the edge)" : " (outside the axis range you set, drawn \
at the edge)" : ""}` });
      if (labelsOn) {
        const str = item.labelTemplate ? String(item.labelTemplate).slice(0, 500).replace(/\{(\w+)\}/g, (all, k) => ({ value: fmtY(p.y), x: fmtX(p.x), series: s.name, size: toText(p.size, null, ctx) })[k.toLowerCase()] ?? all) : fmtY(p.y);
        label(str, e.cx, e.cy - r - 2, { size: fs * 0.85 });
      }
    });
  }
  for (const o of overlays) {
    const color2 = /^#[0-9a-f]{6}$/i.test(o.color || "") ? o.color : o.type === "line" ? "#dc2626" : "#475569";
    if (o.type === "line") {
      for (const v of overlayValues(o, g)) {
        out.push({ t: "line", x1: left, y1: py(v), x2: right, y2: py(v), stroke: color2, strokeWidth: 1, dash: [4, 3] });
        if (o.label) text(`${o.label} ${fmtY(v)}`, right - 2, py(v) - 2.5, { align: "right", color: color2, size: fs * 0.9 });
      }
    } else if (o.type === "trend") {
      const set = sets[Math.max(0, Math.min(sets.length - 1, Math.floor(Number(o.series)) || 0))];
      const kind = o.kind === "exp" || o.kind === "poly" ? o.kind : "linear";
      const fit = fitTrend(set.pts.map((p) => [p.x, p.y]), kind, o.order);
      if (!fit) {
        lc.warn(`${who}: not enough values for the ${kind} trend line`);
        continue;
      }
      const steps = 60;
      const pts = [];
      for (let i = 0; i <= steps; i++) {
        const x = axx.lo + (axx.hi - axx.lo) * i / steps;
        const y = fit.at(x);
        if (Number.isFinite(y) && y >= ay.lo && y <= ay.hi) pts.push({ x: px(x), y: py(y) });
      }
      if (pts.length > 1) {
        out.push({ t: "path", x: 0, y: 0, d: curvePath(pts, "straight"), fill: null, stroke: color2, strokeWidth: 1.2, dash: [4, 3] });
        if (o.label && !g.inLegend(o)) text(String(o.label), pts[pts.length - 1].x - 2, pts[pts.length - 1].y - 4, { align: "right", color: color2, size: fs * 0.9 });
      }
    }
  }
}
function paintPolar(g, sets) {
  const { item, ctx, out, X, W: W2, top, bottom, fs, text, grid, axes, lc, who, anim } = g;
  const cx = X + W2 / 2, cy = (top + bottom) / 2;
  const R = Math.max(6, Math.min(W2, bottom - top) / 2 - fs * 2);
  let hi = 0, lo = 0;
  for (const st of sets) for (const p of st.pts) {
    hi = Math.max(hi, p.y);
    lo = Math.min(lo, p.y);
  }
  const fmtY = (v) => toText(v, axes.y?.format || item.valueFormat || "N0", ctx);
  const ay = valueAxis(axes.y, lo, hi, Infinity, { includeZero: true, len: R * 2, fs, fmt: fmtY, lc, who, name: "radius" });
  const rad = (v) => Math.max(0, Math.min(1, ay.frac(v) ?? 0)) * R;
  const at = (deg, r) => {
    const a = (deg - 90) * Math.PI / 180;
    return { x: cx + Math.cos(a) * r, y: cy + Math.sin(a) * r };
  };
  for (const t of ay.ticks) {
    const r = rad(t);
    if (r > 0) out.push({ t: "ellipse", cx, cy, rx: r, ry: r, fill: null, stroke: grid, strokeWidth: 0.5 });
  }
  for (let d = 0; d < 360; d += 45) {
    const e = at(d, R), l = at(d, R + fs * 0.9);
    out.push({ t: "line", x1: cx, y1: cy, x2: e.x, y2: e.y, stroke: grid, strokeWidth: 0.5 });
    text(`${d}°`, l.x, l.y + fs * 0.35, { align: Math.abs(l.x - cx) < 1 ? "center" : l.x > cx ? "left" : "right", size: fs * 0.85, color: "#6b7280" });
  }
  for (const t of ay.ticks) if (rad(t) > 0 && rad(t) < R - 0.5) text(fmtY(t), cx + 3, cy - rad(t) + fs * 0.3, { size: fs * 0.8, color: "#6b7280" });
  for (const { s, pts, i } of sets) {
    const q = pts.map((p) => ({ ...at(p.x, rad(p.y)), p }));
    if (s.def.type === "line" || s.def.type === "area") {
      const deg = (e) => (e.p.x % 360 + 360) % 360;
      const sorted = [...q].sort((a, b) => deg(a) - deg(b));
      if (sorted.length > 1) out.push(tag2({ t: "path", x: 0, y: 0, d: curvePath(sorted, "straight") + (s.def.type === "area" ? " Z" : ""), fill: s.def.type === "area" ? s.color + "33" : null, stroke: s.color, strokeWidth: 1.4 }, anim && { k: "fade", i }));
    }
    for (const e of q) {
      out.push(tag2({ t: "ellipse", cx: e.x, cy: e.y, rx: 2.4, ry: 2.4, fill: s.color, stroke: "#ffffff", strokeWidth: 0.5 }, anim && { k: "fade", i }));
      if (item.tooltips !== false) g.links.push({ t: "link", x: e.x - 3, y: e.y - 3, w: 6, h: 6, action: null, tip: `${sets.length > 1 ? `${s.name}: ` : ""}${toText(e.p.x, "N0", ctx)}°, ${fmtY(e.p.y)}` });
    }
  }
}

// src/engine/items/visuals.js
var MAX_POINTS = 5e3;
var ICON_SETS = ["trafficLights", "arrows", "symbols", "flags", "ratings"];
var STATE = ["#dc2626", "#f59e0b", "#16a34a"];
var f3 = (v) => Math.round(v * 100) / 100;
var COLRANGE = /* @__PURE__ */ new WeakMap();
function columnRange(expr, ctx, lc, who) {
  if (expr == null || !ctx?.region?.rows) return null;
  const detail = ctx.aggIndex != null;
  const sets = detail ? ctx.region.rows.map((r) => [r]) : ctx.group?.siblings;
  if (!sets?.length) return null;
  let byExpr = COLRANGE.get(sets);
  if (!byExpr) COLRANGE.set(sets, byExpr = /* @__PURE__ */ new Map());
  if (byExpr.has(expr)) return byExpr.get(expr);
  let lo = null, hi = null;
  for (const rs of sets) {
    const v = num3(expr, { ...ctx, fields: rs[0], aggRows: rs, aggIndex: detail ? 0 : void 0 }, lc, who);
    if (v != null && Number.isFinite(v)) {
      if (lo == null || v < lo) lo = v;
      if (hi == null || v > hi) hi = v;
    }
  }
  const out = lo == null ? null : { lo, hi };
  byExpr.set(expr, out);
  return out;
}
function num3(expr, ctx, lc, who) {
  if (expr == null || expr === "") return null;
  try {
    const v = evalValue(expr, ctx);
    return v == null || v === "" ? null : Number(v);
  } catch (e) {
    lc.warn(`${who}: ${e.message}`);
    return null;
  }
}
function capped(list, lc, who) {
  if (list.length <= MAX_POINTS) return list;
  lc.warn(`${who}: ${list.length} values; only the first ${MAX_POINTS} are drawn`);
  return list.slice(0, MAX_POINTS);
}
function lineBox(box, base, lc) {
  const key = resolveFontKey(base.fontFamily, "normal", "normal");
  const size = Number(base.fontSize) || 9;
  const pd = padding(base);
  const lh = Math.min(size * (Number(base.lineHeight) || 1.25), Math.max(1, box.h - pd[0] - pd[2]));
  const avail = box.h - pd[0] - pd[2];
  let top = box.y + pd[0];
  if (base.verticalAlign === "middle") top += (avail - lh) / 2;
  else if (base.verticalAlign === "bottom") top = box.y + box.h - pd[2] - lh;
  const { ascent, descent } = lc.m.metrics(key, size);
  return { key, size, top, lh, baseline: top + (lh - (ascent + descent)) / 2 + ascent };
}
function paintVisual(v, box, ctx, lc, base, who = "Visual", opt = {}) {
  const out = [];
  const pad2 = 3;
  const x = box.x + pad2, y = box.y + pad2, w = Math.max(1, box.w - pad2 * 2), h = Math.max(1, box.h - pad2 * 2);
  const line2 = opt.cell ? lineBox(box, base, lc) : null;
  let color2 = v.color || "#2563eb";
  if (isDynamic(color2)) {
    try {
      color2 = String(evalValue(color2, ctx) || "#2563eb");
    } catch {
      color2 = "#2563eb";
    }
  }
  if (v.type === "sparkline") {
    let vals = [];
    if (v.values) {
      try {
        const arr = evalValue(v.values, ctx);
        if (Array.isArray(arr)) vals = capped(arr, lc, who).map(Number);
      } catch (e) {
        lc.warn(`${who}: ${e.message}`);
      }
    } else if (v.category) {
      const rows = ctx.aggRows || [];
      const c = { ...ctx };
      const buckets = /* @__PURE__ */ new Map();
      for (const r of rows) {
        c.fields = r;
        let k;
        try {
          k = evalValue(v.category, c);
        } catch {
          k = null;
        }
        const kk = k instanceof Date ? k.getTime() : k;
        if (!buckets.has(kk)) buckets.set(kk, []);
        buckets.get(kk).push(r);
      }
      const keys = capped([...buckets.keys()].sort((a, b) => a > b ? 1 : a < b ? -1 : 0), lc, who);
      vals = keys.map((k) => {
        const rs = buckets.get(k);
        return num3(v.value, { ...ctx, fields: rs[0], aggRows: rs, aggIndex: void 0 }, lc, who);
      });
    } else {
      const rows = capped(ctx.aggRows || [], lc, who);
      const c = { ...ctx };
      vals = rows.map((r) => {
        c.fields = r;
        return num3(v.value, c, lc, who);
      });
    }
    vals = vals.filter((n) => Number.isFinite(n));
    if (vals.length < 2) return out;
    let lo = Infinity, hi = -Infinity;
    for (const n of vals) {
      if (n < lo) lo = n;
      if (n > hi) hi = n;
    }
    const span = hi - lo || 1;
    const px = (i) => x + i / (vals.length - 1) * w, py = (n) => y + h - (n - lo) / span * h;
    const bl = num3(v.bandLow, ctx, lc, who), bh = num3(v.bandHigh, ctx, lc, who);
    if (bl != null && bh != null) {
      const clampY = (n) => Math.max(y, Math.min(y + h, py(n)));
      const a = clampY(Math.max(bl, bh)), b = clampY(Math.min(bl, bh));
      if (b > a) out.push({ t: "rect", x, y: a, w, h: b - a, fill: v.bandColor || "#e5e7eb" });
    }
    if (v.style === "winloss") {
      const bw = w / vals.length, mid = y + h / 2;
      vals.forEach((n, i) => out.push(n === 0 ? { t: "rect", x: x + i * bw + bw * 0.1, y: mid - 0.5, w: bw * 0.8, h: 1, fill: "#9ca3af" } : { t: "rect", x: x + i * bw + bw * 0.1, y: n > 0 ? mid - h / 2 : mid, w: bw * 0.8, h: h / 2, fill: n > 0 ? color2 : v.negColor || "#dc2626" }));
      return out;
    }
    if (v.style === "area") {
      const line3 = vals.map((n, i) => `${f3(px(i))} ${f3(py(n))}`).join(" L ");
      out.push({ t: "path", x: 0, y: 0, d: `M ${f3(px(0))} ${f3(y + h)} L ${line3} L ${f3(px(vals.length - 1))} ${f3(y + h)} Z`, fill: color2 + "33", stroke: null });
    }
    if (v.style === "column") {
      const bw = w / vals.length;
      vals.forEach((n, i) => out.push({ t: "rect", x: x + i * bw + bw * 0.1, y: py(n), w: bw * 0.8, h: y + h - py(n) + 0.5, fill: color2 }));
    } else {
      out.push({ t: "path", x: 0, y: 0, d: "M " + vals.map((n, i) => `${f3(px(i))} ${f3(py(n))}`).join(" L "), fill: null, stroke: color2, strokeWidth: 1.1 });
      const last = vals.length - 1;
      out.push({ t: "ellipse", cx: px(last), cy: py(vals[last]), rx: 1.6, ry: 1.6, fill: color2, stroke: null });
    }
    return out;
  }
  if (v.type === "iconset") {
    const val2 = num3(v.value, ctx, lc, who);
    if (val2 == null) return out;
    const lower = num3(v.lower, ctx, lc, who) ?? 33, upper = num3(v.upper, ctx, lc, who) ?? 67;
    const level = val2 < lower ? 0 : val2 < upper ? 1 : 2;
    const state = v.reverse === true ? 2 - level : level;
    const sz = Math.max(4, Math.min(w, line2 ? line2.lh : h)), ix = x + (w - sz) / 2, iy = line2 ? line2.top + (line2.lh - sz) / 2 : y + (h - sz) / 2;
    out.push(...icon(ICON_SETS.includes(v.iconSet) ? v.iconSet : "trafficLights", state, ix, iy, sz));
    return out;
  }
  if (v.type === "rangebar") {
    const low = num3(v.low, ctx, lc, who), high = num3(v.high, ctx, lc, who);
    const min = num3(v.min, ctx, lc, who) ?? 0;
    let max2 = num3(v.max, ctx, lc, who) ?? Math.max(high ?? 1, 1);
    if (!(max2 > min)) max2 = min + 1;
    const fr = (n) => Math.max(0, Math.min(1, (n - min) / (max2 - min)));
    out.push({ t: "rect", x, y: y + h * 0.3, w, h: h * 0.4, fill: "#e5e7eb", radius: 1 });
    if (low != null && high != null) {
      const a = fr(Math.min(low, high)), b = fr(Math.max(low, high));
      out.push({ t: "rect", x: x + w * a, y: y + h * 0.15, w: Math.max(1, w * (b - a)), h: h * 0.7, fill: color2, radius: 1 });
    }
    return out;
  }
  const val = num3(v.value, ctx, lc, who) ?? 0;
  const range = columnRange(v.value, ctx, lc, who);
  const absMax = range ? Math.max(Math.abs(range.lo), Math.abs(range.hi)) : 0;
  const max = num3(v.max, ctx, lc, who) ?? (absMax > 0 ? absMax : null) ?? Math.max(val, 1);
  const frac = Math.max(0, Math.min(1, max ? val / max : 0));
  if (v.type === "databar") {
    const neg = (range?.lo ?? 0) < 0 || val < 0;
    let x0 = x, bw = w * frac, zf = 0;
    if (neg) {
      const hi = Math.max(0, num3(v.max, ctx, lc, who) ?? range?.hi ?? val, val), lo = Math.min(0, range?.lo ?? val, val);
      const span = hi - lo;
      zf = -lo / span;
      bw = val >= 0 ? Math.min(w * val / span, w * (1 - zf)) : Math.min(w * -val / span, w * zf);
      x0 = val >= 0 ? x + w * zf : x + w * zf - bw;
    }
    let negColor = v.negativeColor || "#dc2626";
    if (isDynamic(negColor)) {
      try {
        negColor = String(evalValue(negColor, ctx) || "#dc2626");
      } catch {
        negColor = "#dc2626";
      }
    }
    const barColor = val < 0 ? negColor : color2;
    const by = line2 ? line2.top + line2.lh * 0.05 : y + h * 0.18, bh = line2 ? line2.lh * 0.9 : h * 0.64;
    out.push({ t: "rect", x: x0, y: by, w: bw, h: bh, fill: barColor + "cc", radius: 1 });
    if (neg) out.push({ t: "rect", x: x + w * zf - 0.5, y: by, w: 1, h: bh, fill: "#6b7280" });
    if (v.showValue !== false) {
      const key = resolveFontKey(base.fontFamily, "normal", "normal");
      let size = line2 ? line2.size : Math.min(h * 0.75, Number(base.fontSize) || 8);
      const s = toText(val, v.format || base.format || "N0", ctx);
      let tw = lc.m.width(s, key, size);
      if (tw > w) {
        size *= w / tw;
        tw = w;
      }
      const barEnd = val < 0 ? x0 : x0 + bw;
      const after = val < 0 ? barEnd - 3 - tw >= x : barEnd + 3 + tw <= x + w;
      if (!after && tw > bw - 6) {
        const fit = Math.max(0, bw - 6);
        size *= fit / tw;
        tw = fit;
      }
      const lx = after ? val < 0 ? barEnd - 3 - tw : barEnd + 3 : val < 0 ? barEnd + 3 : Math.max(x, barEnd - 3 - tw);
      out.push({ t: "text", font: key, size, color: after ? "#374151" : inkOn(barColor), lines: [{ x: lx, y: line2 ? line2.baseline : y + h / 2 + size * 0.35, text: s, w: tw }] });
    }
    return out;
  }
  if (v.type === "bullet") {
    const target = num3(v.target, ctx, lc, who);
    out.push({ t: "rect", x, y, w, h, fill: "#e5e7eb" });
    out.push({ t: "rect", x, y: y + h * 0.3, w: w * frac, h: h * 0.4, fill: color2 });
    if (target != null && max) {
      const tx = x + w * Math.max(0, Math.min(1, target / max));
      out.push({ t: "line", x1: tx, y1: y + h * 0.1, x2: tx, y2: y + h * 0.9, stroke: "#111827", strokeWidth: 1.5 });
    }
    return out;
  }
  return out;
}
function icon(set, state, x, y, sz) {
  const c = STATE[state];
  const cx = x + sz / 2, cy = y + sz / 2, r = sz * 0.42;
  const P = (pts) => "M " + pts.map(([a, b]) => `${f3(x + a * sz)} ${f3(y + b * sz)}`).join(" L ") + " Z";
  if (set === "arrows") {
    if (state === 1) return [{ t: "path", x: 0, y: 0, d: P([[0.1, 0.4], [0.55, 0.4], [0.55, 0.2], [0.9, 0.5], [0.55, 0.8], [0.55, 0.6], [0.1, 0.6]]), fill: c, stroke: null }];
    const up = [[0.5, 0.08], [0.88, 0.5], [0.62, 0.5], [0.62, 0.92], [0.38, 0.92], [0.38, 0.5], [0.12, 0.5]];
    return [{ t: "path", x: 0, y: 0, d: P(state === 2 ? up : up.map(([a, b]) => [a, 1 - b])), fill: c, stroke: null }];
  }
  if (set === "symbols") {
    if (state === 1) return [
      { t: "path", x: 0, y: 0, d: P([[0.5, 0.06], [0.95, 0.9], [0.05, 0.9]]), fill: c, stroke: null },
      { t: "path", x: 0, y: 0, d: `M ${f3(cx)} ${f3(y + sz * 0.36)} L ${f3(cx)} ${f3(y + sz * 0.62)} M ${f3(cx)} ${f3(y + sz * 0.74)} L ${f3(cx)} ${f3(y + sz * 0.76)}`, fill: null, stroke: "#ffffff", strokeWidth: Math.max(0.8, sz * 0.1) }
    ];
    const mark = state === 2 ? `M ${f3(x + sz * 0.3)} ${f3(y + sz * 0.52)} L ${f3(x + sz * 0.45)} ${f3(y + sz * 0.67)} L ${f3(x + sz * 0.72)} ${f3(y + sz * 0.36)}` : `M ${f3(x + sz * 0.33)} ${f3(y + sz * 0.33)} L ${f3(x + sz * 0.67)} ${f3(y + sz * 0.67)} M ${f3(x + sz * 0.67)} ${f3(y + sz * 0.33)} L ${f3(x + sz * 0.33)} ${f3(y + sz * 0.67)}`;
    return [{ t: "ellipse", cx, cy, rx: r, ry: r, fill: c, stroke: null }, { t: "path", x: 0, y: 0, d: mark, fill: null, stroke: "#ffffff", strokeWidth: Math.max(0.8, sz * 0.1) }];
  }
  if (set === "flags") {
    return [
      { t: "line", x1: x + sz * 0.22, y1: y + sz * 0.1, x2: x + sz * 0.22, y2: y + sz * 0.92, stroke: "#4b5563", strokeWidth: Math.max(0.6, sz * 0.07) },
      { t: "path", x: 0, y: 0, d: P([[0.25, 0.1], [0.85, 0.3], [0.25, 0.52]]), fill: c, stroke: null }
    ];
  }
  if (set === "ratings") {
    return [0, 1, 2].map((i) => ({ t: "rect", x: x + sz * (0.1 + i * 0.3), y: y + sz * (0.6 - i * 0.25), w: sz * 0.22, h: sz * (0.3 + i * 0.25), fill: i <= state ? "#2563eb" : "#d1d5db" }));
  }
  return [{ t: "ellipse", cx, cy, rx: r, ry: r, fill: c, stroke: "#ffffff", strokeWidth: 0.5 }];
}

// src/engine/items/barcode.js
var bwip = null;
async function loadBarcodes() {
  if (!bwip) {
    const m = (
      /** @type {any} */
      await import("bwip-js")
    );
    bwip = m.default || m;
  }
}
var S2 = (id, name, sample, max = 128, twoD = false) => ({ id, name, sample, max, twoD });
var SYMBOLOGIES = [
  S2("code128", "Code 128", "ReportWright-128"),
  S2("gs1-128", "GS1-128", "(01)09521234543213(10)ABC123"),
  S2("code39", "Code 39", "CODE-39"),
  S2("code39ext", "Code 39 Extended", "Code39 Ext"),
  S2("code93", "Code 93", "CODE93"),
  S2("code93ext", "Code 93 Extended", "Code93 Ext"),
  S2("code11", "Code 11", "0123452"),
  S2("rationalizedCodabar", "Codabar", "A0123456789B"),
  S2("interleaved2of5", "Interleaved 2 of 5", "2401234567"),
  S2("itf14", "ITF-14", "04601234567893"),
  S2("ean13", "EAN-13", "9520123456788", 20),
  S2("ean8", "EAN-8", "95200002", 12),
  S2("ean5", "EAN-5 (add-on)", "90200", 5),
  S2("ean2", "EAN-2 (add-on)", "05", 2),
  S2("upca", "UPC-A", "416000336108", 20),
  S2("upce", "UPC-E", "00123457", 12),
  S2("isbn", "ISBN", "978-1-56581-231-4", 24),
  S2("issn", "ISSN", "0311-175X", 16),
  S2("ismn", "ISMN", "979-0-2605-3211-3", 24),
  S2("ean14", "EAN-14", "(01)04601234567893", 24),
  S2("sscc18", "SSCC-18", "(00)106141412345678908", 26),
  S2("msi", "MSI Plessey", "0123456709"),
  S2("plessey", "Plessey UK", "01234ABCD"),
  S2("pharmacode", "Pharmacode", "117480", 6),
  S2("telepen", "Telepen", "Telepen"),
  S2("databaromni", "GS1 DataBar Omnidirectional", "(01)24012345678905", 20),
  S2("databarlimited", "GS1 DataBar Limited", "(01)15012345678907", 20),
  S2("databarexpanded", "GS1 DataBar Expanded", "(01)98898765432106(3202)012345(15)991231", 80),
  S2("postnet", "USPS POSTNET", "01234", 12),
  S2("planet", "USPS PLANET", "01234567890", 14),
  S2("onecode", "USPS Intelligent Mail", "0123456709498765432101234567891", 34),
  S2("royalmail", "Royal Mail 4-State", "LE28HS9Z", 32),
  S2("kix", "Dutch KIX", "1231FZ13XHS", 32),
  S2("auspost", "Australia Post", "5956439111ABA 9", 32),
  S2("japanpost", "Japan Post", "6540123789-A-K-Z", 32),
  S2("code16k", "Code 16K", "Code 16K", 77, true),
  S2("code49", "Code 49", "CODE 49", 49, true),
  S2("codablockf", "Codablock F", "CODABLOCK F", 2725, true),
  S2("qrcode", "QR Code", "https://reportwright.dev", 7089, true),
  S2("microqrcode", "Micro QR Code", "1234", 35, true),
  S2("gs1qrcode", "GS1 QR Code", "(01)03453120000011(10)ABCD1234", 2e3, true),
  S2("datamatrix", "Data Matrix", "Data Matrix", 3116, true),
  S2("gs1datamatrix", "GS1 Data Matrix", "(01)03453120000011(17)191125(10)ABCD1234", 2e3, true),
  S2("pdf417", "PDF417", "PDF417 sample", 2710, true),
  S2("micropdf417", "MicroPDF417", "MicroPDF417", 366, true),
  S2("azteccode", "Aztec Code", "Aztec sample", 3832, true),
  S2("maxicode", "MaxiCode", "MaxiCode sample", 138, true),
  S2("dotcode", "DotCode", "DotCode sample", 450, true),
  S2("hanxin", "Han Xin", "Han Xin sample", 3261, true)
];
var BY_ID = new Map(SYMBOLOGIES.map((s) => [s.id, s]));
var BARCODE_TYPES = SYMBOLOGIES.map((s) => s.id);
var OTHER_MAX = 4096;
var QR = ["qrcode", "microqrcode", "gs1qrcode"];
var DM = ["datamatrix", "gs1datamatrix"];
var PDF = ["pdf417", "micropdf417"];
var BARCODE_OPTIONS = [
  { key: "qrErrorLevel", label: "Error correction", for: QR, opt: "eclevel", enum: ["L", "M", "Q", "H"] },
  { key: "qrVersion", label: "Version (1–40, empty = smallest)", for: QR, opt: "version", int: [1, 40], str: true },
  { key: "qrMask", label: "Mask (1–8)", for: QR, opt: "mask", int: [1, 8] },
  { key: "dmShape", label: "Shape", for: DM, opt: "format", enum: ["square", "rectangle"] },
  { key: "dmSize", label: "Rows×columns (e.g. 24x24)", for: DM, opt: "rows", size: true },
  { key: "pdfColumns", label: "Columns (1–30)", for: PDF, opt: "columns", int: [1, 30] },
  { key: "pdfRows", label: "Rows (3–90)", for: ["pdf417"], opt: "rows", int: [3, 90] },
  { key: "pdfErrorLevel", label: "Error correction (0–8)", for: ["pdf417"], opt: "eclevel", int: [0, 8] },
  { key: "pdfCompact", label: "Compact (truncated)", for: ["pdf417"], opt: "compact", bool: true },
  { key: "aztecLayers", label: "Layers (1–32)", for: ["azteccode"], opt: "layers", int: [1, 32] },
  { key: "aztecErrorPercent", label: "Error correction % (5–95)", for: ["azteccode"], opt: "eccpercent", int: [5, 95] },
  { key: "maxiMode", label: "Mode (2–6)", for: ["maxicode"], opt: "mode", int: [2, 6] },
  { key: "checkDigit", label: "Add a check digit", for: ["code39", "code39ext", "code93", "code93ext", "interleaved2of5", "rationalizedCodabar", "code11", "msi"], opt: "includecheck", bool: true },
  { key: "barRatio", label: "Wide-to-narrow ratio (2–3)", for: ["code39", "code39ext", "interleaved2of5", "rationalizedCodabar"], opt: "barratio", num: [2, 3] }
];
function bwipOptions(item) {
  const sym = item.symbology || item.type || "code128";
  const out = {};
  for (const o of BARCODE_OPTIONS) {
    if (!o.for.includes(sym)) continue;
    const v = item[o.key];
    if (v == null || v === "") continue;
    if (o.enum) {
      if (o.enum.includes(String(v))) out[o.opt] = String(v);
    } else if (o.bool) {
      if (v === true || v === "true") out[o.opt] = true;
    } else if (o.size) {
      const m = /^(\d{1,3})\s*[x×]\s*(\d{1,3})$/i.exec(String(v).trim());
      if (m) {
        out.rows = Number(m[1]);
        out.columns = Number(m[2]);
      }
    } else {
      const [lo, hi] = o.int || o.num;
      const n = Number(v);
      if (Number.isFinite(n) && n >= lo && n <= hi && (!o.int || Number.isInteger(n))) out[o.opt] = o.str ? String(n) : n;
    }
  }
  return out;
}
var BWIP_IDS = /* @__PURE__ */ new Set([
  "ean5",
  "ean2",
  "ean13",
  "ean8",
  "upca",
  "upce",
  "isbn",
  "ismn",
  "issn",
  "mands",
  "code128",
  "gs1-128",
  "ean14",
  "sscc18",
  "code39",
  "code39ext",
  "code32",
  "pzn",
  "code93",
  "code93ext",
  "interleaved2of5",
  "itf14",
  "identcode",
  "leitcode",
  "databaromni",
  "databarstacked",
  "databarstackedomni",
  "databartruncated",
  "databarlimited",
  "databarexpanded",
  "databarexpandedstacked",
  "gs1northamericancoupon",
  "pharmacode",
  "pharmacode2",
  "code2of5",
  "industrial2of5",
  "iata2of5",
  "matrix2of5",
  "coop2of5",
  "datalogic2of5",
  "code11",
  "bc412",
  "rationalizedCodabar",
  "onecode",
  "postnet",
  "planet",
  "royalmail",
  "auspost",
  "kix",
  "japanpost",
  "msi",
  "plessey",
  "telepen",
  "telepennumeric",
  "posicode",
  "codablockf",
  "code16k",
  "code49",
  "channelcode",
  "flattermarken",
  "raw",
  "daft",
  "symbol",
  "pdf417",
  "pdf417compact",
  "micropdf417",
  "datamatrix",
  "datamatrixrectangular",
  "datamatrixrectangularextension",
  "mailmark",
  "qrcode",
  "swissqrcode",
  "microqrcode",
  "rectangularmicroqrcode",
  "maxicode",
  "azteccode",
  "azteccodecompact",
  "aztecrune",
  "codeone",
  "hanxin",
  "dotcode",
  "ultracode",
  "gs1-cc",
  "ean13composite",
  "ean8composite",
  "upcacomposite",
  "upcecomposite",
  "databaromnicomposite",
  "databarstackedcomposite",
  "databarstackedomnicomposite",
  "databartruncatedcomposite",
  "databarlimitedcomposite",
  "databarexpandedcomposite",
  "databarexpandedstackedcomposite",
  "gs1-128composite",
  "d3aqr",
  "gs1datamatrix",
  "gs1datamatrixrectangular",
  "gs1dldatamatrix",
  "gs1qrcode",
  "gs1dlqrcode",
  "gs1dotcode",
  "hibccode39",
  "hibccode128",
  "hibcdatamatrix",
  "hibcdatamatrixrectangular",
  "hibcpdf417",
  "hibcmicropdf417",
  "hibcqrcode",
  "hibccodablockf",
  "hibcazteccode"
]);
var NICK = { qr: "qrcode", "qr-code": "qrcode", dm: "datamatrix", "data-matrix": "datamatrix", ean: "ean13", upc: "upca", c128: "code128", aztec: "azteccode", pdf: "pdf417", itf: "interleaved2of5", codabar: "rationalizedCodabar" };
function symbologyError(sym) {
  const s = String(sym ?? "");
  if (BWIP_IDS.has(s)) return null;
  const lower = s.toLowerCase();
  const all = [...BWIP_IDS];
  const near = NICK[lower] || all.find((id) => id.toLowerCase() === lower) || (lower.length >= 2 ? SYMBOLOGIES.find((x) => x.id.startsWith(lower))?.id || all.find((id) => id.startsWith(lower)) : null);
  return `"${s.slice(0, 40)}" is not a barcode symbology${near ? ` (did you mean "${near}"?)` : ""}`;
}
var SVGS = /* @__PURE__ */ new Map();
var SVG_CACHE = 2e3;
var isTwoD = (id) => BY_ID.get(id)?.twoD ?? false;
function transformPath(d, sx, sy, tx, ty) {
  const toks = d.match(/[a-zA-Z]|-?\d*\.?\d+(?:e[-+]?\d+)?/g) || [];
  const out = [];
  let cmd = "M", i = 0, argi = 0;
  const ARGS = { M: 2, L: 2, H: 1, V: 1, C: 6, S: 4, Q: 4, T: 2, A: 7, Z: 0 };
  while (i < toks.length) {
    const t = toks[i];
    if (/[a-zA-Z]/.test(t)) {
      cmd = t;
      out.push(t);
      argi = 0;
      i++;
      continue;
    }
    const C = cmd.toUpperCase(), rel = cmd !== C;
    const n = Number(t);
    let v = n;
    if (C === "H") v = n * sx + (rel ? 0 : tx);
    else if (C === "V") v = n * sy + (rel ? 0 : ty);
    else if (C === "A") {
      const k = argi % 7;
      v = k === 0 ? n * sx : k === 1 ? n * sy : k === 5 ? n * sx + (rel ? 0 : tx) : k === 6 ? n * sy + (rel ? 0 : ty) : n;
    } else {
      const isX = argi % 2 === 0;
      v = isX ? n * sx + (rel ? 0 : tx) : n * sy + (rel ? 0 : ty);
    }
    out.push(String(Math.round(v * 1e3) / 1e3));
    argi++;
    i++;
    if (ARGS[C] && argi >= ARGS[C] && C !== "M") argi = 0;
    if (C === "M" && argi >= 2) {
      argi = 0;
      cmd = rel ? "l" : "L";
    }
  }
  return out.join(" ");
}
function paintBarcode({ type = "code128", text, x, y, w, h, color: color2 = "#000000", showText = true, textHeight = 0, captionAbove = false, options = {} }) {
  if (!text) return { items: [] };
  text = String(text);
  const bad = symbologyError(type);
  if (bad) return { items: [], error: bad };
  const max = BY_ID.get(type)?.max ?? OTHER_MAX;
  if (text.length > max) return { items: [], error: `The value is too long for ${BY_ID.get(type)?.name || type} (${text.length} characters; at most ${max})` };
  if (!bwip) return { items: [], error: "The barcode library is not loaded (call loadBarcodes() before layout)" };
  const twoD = isTwoD(type);
  const key = JSON.stringify([type, text, options]);
  let svg = SVGS.get(key);
  if (svg === void 0) {
    try {
      svg = bwip.toSVG({ ...options, bcid: type, text, scale: 1, ...twoD ? {} : { height: 10 }, includetext: false, paddingwidth: 0, paddingheight: 0 });
    } catch (e) {
      svg = { error: String(e.message || e).replace(/^bwipp\.\w+#\d+:\s*/, "") };
    }
    if (SVGS.size >= SVG_CACHE) SVGS.clear();
    SVGS.set(key, svg);
  }
  if (typeof svg !== "string") return { items: [], error: svg.error };
  const vb = /viewBox="0 0 ([\d.]+) ([\d.]+)"/.exec(svg);
  if (!vb) return { items: [], error: "No barcode output" };
  const vw = Number(vb[1]), vh = Number(vb[2]);
  const capH = showText && !twoD ? textHeight : 0;
  const availH = Math.max(1, h - capH);
  let sx = w / vw, sy = availH / vh, ox = x, oy = y + (captionAbove ? capH : 0);
  if (twoD) {
    const s = Math.min(sx, sy);
    sx = sy = s;
    ox = x + (w - vw * s) / 2;
    oy = y + (availH - vh * s) / 2;
  }
  const items = [];
  for (const m of svg.matchAll(/<path([^>]*)d="([^"]+)"/g)) {
    const attrs = m[1];
    const sw = /stroke-width="([\d.]+)"/.exec(attrs);
    const d = transformPath(m[2], sx, sy, 0, 0);
    if (/stroke=/.test(attrs) && sw) items.push({ t: "path", x: ox, y: oy, d, fill: null, stroke: color2, strokeWidth: Number(sw[1]) * sx, lineCap: "butt" });
    else items.push({ t: "path", x: ox, y: oy, d, fill: color2, stroke: null });
  }
  return { items, twoD };
}

// src/engine/items/map.js
var LEGEND_H = 20;
var MAP_CAPS = { shapes: 5e3, coords: 2e5, points: 1e4, classes: 9 };
var MAX_LAT = 85.0511;
function linesOf(g) {
  const line2 = (l) => Array.isArray(l) && l.length >= 2 && l.every((p) => Array.isArray(p) && Number.isFinite(p[0]) && Number.isFinite(p[1]));
  if (g?.type === "LineString" && line2(g.coordinates)) return [g.coordinates];
  if (g?.type === "MultiLineString" && Array.isArray(g.coordinates) && g.coordinates.length && g.coordinates.every(line2)) return g.coordinates;
  return null;
}
function polygonsOf(g) {
  const ring = (r) => Array.isArray(r) && r.length >= 3 && r.every((p) => Array.isArray(p) && Number.isFinite(p[0]) && Number.isFinite(p[1]));
  const poly = (p) => Array.isArray(p) && p.length > 0 && p.every(ring);
  if (g?.type === "Polygon" && poly(g.coordinates)) return [g.coordinates];
  if (g?.type === "MultiPolygon" && Array.isArray(g.coordinates) && g.coordinates.length && g.coordinates.every(poly)) return g.coordinates;
  return null;
}
var project = (lon, lat) => {
  const phi = Math.max(-MAX_LAT, Math.min(MAX_LAT, lat)) * Math.PI / 180;
  return [lon * Math.PI / 180, Math.log(Math.tan(Math.PI / 4 + phi / 2))];
};
var hex = (c) => {
  const m = /^#?([0-9a-f]{6})$/i.exec(String(c || ""));
  const n = m ? parseInt(m[1], 16) : 0;
  return [n >> 16, n >> 8 & 255, n & 255];
};
var mix = (a, b, t) => "#" + hex(a).map((v, i) => Math.round(v + (hex(b)[i] - v) * t).toString(16).padStart(2, "0")).join("");
var r22 = (v) => Math.round(v * 100) / 100;
function paintMap(item, ctx, lc, base) {
  const who = item.name || "Map";
  const warn = (msg) => lc.warn(`${who}: ${msg}`);
  const ev = (v, c) => {
    if (v == null || v === "") return null;
    try {
      return evalValue(v, c);
    } catch (e) {
      warn(e.message);
      return null;
    }
  };
  const rowsOf = (name) => {
    const r = lc.dataSets[name];
    if (!r) warn(`the data set "${name}" does not exist`);
    return r || [];
  };
  const shapes = [], lines = [];
  let coords = 0, capped2 = "";
  const count = (parts) => {
    let n = 0;
    for (const p of parts) n += p.length;
    return n;
  };
  const addShape = (key, geom, row) => {
    if (capped2) return;
    if (shapes.length + lines.length >= MAP_CAPS.shapes) {
      capped2 = "shapes";
      warn(`more than ${MAP_CAPS.shapes.toLocaleString("en-US")} shapes; the rest are not drawn`);
      return;
    }
    const polys = polygonsOf(geom);
    const ls = polys ? null : linesOf(geom);
    if (!polys && !ls) {
      warn(`the shape "${key ?? "?"}" has no Polygon, MultiPolygon, LineString or MultiLineString geometry`);
      return;
    }
    const n = polys ? polys.reduce((a, p) => a + count(p), 0) : count(ls);
    if (coords + n > MAP_CAPS.coords) {
      warn(`more than ${MAP_CAPS.coords.toLocaleString("en-US")} coordinates; the shape "${key ?? "?"}" and those after it are not drawn`);
      capped2 = "coords";
      return;
    }
    coords += n;
    const k2 = key == null ? null : String(key);
    if (polys) shapes.push({ key: k2, polys, row });
    else lines.push({ key: k2, lines: ls, row });
  };
  if (item.dataSet) {
    for (const r of rowsOf(item.dataSet)) {
      const c = { ...ctx, fields: r };
      addShape(ev(item.shapeKey, c), ev(item.geometry || "=Fields.geometry", c), r);
    }
  } else if (item.geojson) {
    let gj = null;
    try {
      gj = typeof item.geojson === "string" ? JSON.parse(item.geojson) : item.geojson;
    } catch {
      warn("the GeoJSON text is not valid JSON");
    }
    const features = gj?.type === "FeatureCollection" ? gj.features || [] : gj?.type === "Feature" ? [gj] : gj ? [{ properties: {}, geometry: gj }] : [];
    for (const f4 of features) addShape(item.shapeKey ? ev(item.shapeKey, { ...ctx, fields: f4?.properties || {} }) : f4?.properties?.name, f4?.geometry, f4?.properties || {});
  }
  const values = /* @__PURE__ */ new Map(), groupsOf = /* @__PURE__ */ new Map();
  if (item.valueDataSet) {
    const groups = /* @__PURE__ */ new Map();
    for (const r of rowsOf(item.valueDataSet)) {
      const k2 = String(ev(item.valueKey, { ...ctx, fields: r }));
      if (!groups.has(k2)) groups.set(k2, []);
      groups.get(k2).push(r);
    }
    for (const [k2, g] of groups) {
      groupsOf.set(k2, g);
      const v = ev(item.value, { ...ctx, fields: g[0], aggRows: g });
      if (typeof v === "number" && Number.isFinite(v)) values.set(k2, v);
    }
  }
  const points = [];
  if (item.pointDataSet) {
    let prs = rowsOf(item.pointDataSet);
    if (prs.length > MAP_CAPS.points) {
      warn(`${prs.length} points; only the first ${MAP_CAPS.points.toLocaleString("en-US")} are drawn`);
      prs = prs.slice(0, MAP_CAPS.points);
    }
    for (const r of prs) {
      const c = { ...ctx, fields: r };
      const lat = Number(ev(item.lat, c)), lon = Number(ev(item.lon, c));
      if (!Number.isFinite(lat) || !Number.isFinite(lon)) continue;
      const size = item.pointSize ? Number(ev(item.pointSize, c)) : null;
      points.push({ lat, lon, size: Number.isFinite(size) ? size : null, label: item.pointLabel ? ev(item.pointLabel, c) : null });
    }
  }
  const out = [];
  const font = resolveFontKey(base.fontFamily, "normal", "normal");
  const fs = Math.max(6, Number(item.fontSize) || 7);
  const text = (s, x, y, align = "left") => {
    const str = String(s), w = lc.m.width(str, font, fs);
    out.push({ t: "text", font, size: fs, color: "#374151", lines: [{ x: align === "right" ? x - w : x, y, text: str, w }] });
  };
  const pts = [...shapes.flatMap((s) => s.polys.flat(2)), ...lines.flatMap((l) => l.lines.flat(1)), ...points.map((p) => [p.lon, p.lat])].map(([lon, lat]) => project(lon, lat));
  if (!pts.length) {
    text("No shapes or points to draw", item.x + 4, fs + 4);
    return out;
  }
  const showLegend = item.legend !== "none" && values.size > 0;
  const H = item.h - (showLegend ? LEGEND_H : 0), W2 = item.w, pad2 = 4;
  let [x0, x1, y0, y1] = [Infinity, -Infinity, Infinity, -Infinity];
  for (const [x, y] of pts) {
    x0 = Math.min(x0, x);
    x1 = Math.max(x1, x);
    y0 = Math.min(y0, y);
    y1 = Math.max(y1, y);
  }
  const spanX = x1 - x0 || 0.01, spanY = y1 - y0 || 0.01;
  const k = Math.min((W2 - 2 * pad2) / spanX, (H - 2 * pad2) / spanY);
  const ox = item.x + (W2 - spanX * k) / 2, oy = (H - spanY * k) / 2;
  const toXY = (lon, lat) => {
    const [x, y] = project(lon, lat);
    return [ox + (x - x0) * k, oy + (y1 - y) * k];
  };
  let lo = Infinity, hi = -Infinity;
  for (const v of values.values()) {
    lo = Math.min(lo, v);
    hi = Math.max(hi, v);
  }
  const low = item.colorLow || "#dbeafe", high = item.colorHigh || "#1e3a8a";
  const nk = item.colorScale === "classes" ? Math.max(2, Math.min(MAP_CAPS.classes, Math.round(Number(item.classes)) || 5)) : 0;
  const classOf = (v) => Math.min(nk - 1, Math.max(0, Math.floor(hi > lo ? (v - lo) / (hi - lo) * nk : nk - 1)));
  const colorOf = (v) => nk ? mix(low, high, classOf(v) / (nk - 1)) : mix(low, high, hi > lo ? (v - lo) / (hi - lo) : 1);
  const fmt2 = (v) => toText(v, item.valueFormat, ctx);
  const pathOf = (parts, close, dx) => parts.map((ring) => ring.map(([lon, lat], i) => {
    const [x, y] = toXY(lon, lat);
    return `${i ? "L" : "M"} ${r22(x - dx)} ${r22(y)}`;
  }).join(" ") + (close ? " Z" : "")).join(" ");
  const links = [];
  for (const s of shapes) {
    const v = s.key == null ? void 0 : values.get(s.key);
    const fill = v === void 0 ? values.size ? item.fillEmpty || "#e5e7eb" : item.fill || "#cbd5e1" : colorOf(v);
    const rings = s.polys.flat(1);
    out.push({ t: "path", x: item.x, y: 0, d: pathOf(rings, true, item.x), fill, stroke: item.stroke || "#ffffff", strokeWidth: 0.5, shape: s.key });
    const g = s.key == null ? null : groupsOf.get(s.key);
    const rctx = { ...ctx, fields: g?.[0] || s.row || null, aggRows: g || (s.row ? [s.row] : []), aggIndex: void 0 };
    const tip = item.tooltips === false || s.key == null ? null : v === void 0 ? s.key : `${s.key}: ${fmt2(v)}`;
    let l = item.regionAction?.type && item.regionAction.type !== "none" ? lc.linkFor?.({ action: item.regionAction, name: item.name }, rctx, null) : null;
    if (!l && !tip) continue;
    let x02 = Infinity, y02 = Infinity, x12 = -Infinity, y12 = -Infinity;
    for (const ring of rings) for (const [lon, lat] of ring) {
      const [x, y] = toXY(lon, lat);
      x02 = Math.min(x02, x);
      x12 = Math.max(x12, x);
      y02 = Math.min(y02, y);
      y12 = Math.max(y12, y);
    }
    l = { ...l || { t: "link", action: null }, x: x02, y: y02, w: x12 - x02, h: y12 - y02, d: pathOf(rings, true, 0), x0: x02, y0: y02 };
    if (tip) l.tip = tip;
    links.push(l);
  }
  for (const ln of lines) {
    const v = ln.key == null ? void 0 : values.get(ln.key);
    out.push({ t: "path", x: item.x, y: 0, d: pathOf(ln.lines, false, item.x), fill: null, stroke: v === void 0 ? item.lineColor || "#2563eb" : colorOf(v), strokeWidth: Number(item.lineWidth) > 0 ? Math.min(20, Number(item.lineWidth)) : 1.2, shape: ln.key });
  }
  const maxSize = points.reduce((m, p) => Math.max(m, p.size || 0), 0);
  const maxR = Number(item.pointMaxRadius) || 8;
  for (const p of points) {
    const [cx, cy] = toXY(p.lon, p.lat);
    const r = p.size != null && maxSize > 0 ? Math.max(1, maxR * Math.sqrt(Math.max(0, p.size) / maxSize)) : 3;
    out.push({ t: "ellipse", cx, cy, rx: r, ry: r, fill: item.pointColor || "#dc2626", stroke: "#ffffff", strokeWidth: 0.5 });
    if (p.label != null && p.label !== "") text(p.label, cx + r + 2, cy + fs / 3);
  }
  if (showLegend) {
    const ly = H + 4;
    if (nk) {
      const step3 = (hi - lo) / nk;
      const labels = Array.from({ length: nk }, (_, i) => `${fmt2(lo + step3 * i)} – ${fmt2(i === nk - 1 ? hi : lo + step3 * (i + 1))}`);
      const ws = labels.map((s) => 10 + lc.m.width(s, font, fs) + 8);
      let lx = item.x + Math.max(0, (W2 - ws.reduce((a, b) => a + b, 0)) / 2);
      labels.forEach((s, i) => {
        out.push({ t: "rect", x: lx, y: ly, w: 8, h: 8, fill: mix(low, high, i / (nk - 1)) });
        text(s, lx + 10, ly + 7);
        lx += ws[i];
      });
    } else {
      const n = 20, sw = 4;
      const lx = item.x + (W2 - sw * n) / 2;
      for (let i = 0; i < n; i++) out.push({ t: "rect", x: lx + i * sw, y: ly, w: sw + 0.2, h: 8, fill: mix(low, high, i / (n - 1)) });
      text(fmt2(lo), lx - 4, ly + 7, "right");
      text(fmt2(hi), lx + n * sw + 4, ly + 7);
    }
  }
  return out.concat(links);
}

// src/engine/text/rich.js
var RICH_LIMITS = { maxLength: 1e5, maxDepth: 32, maxRuns: 2e4, maxBlocks: 5e3, maxBreaks: 5e3, maxAttrs: 64, maxDecls: 100 };
var BLOCK = /* @__PURE__ */ new Set(["p", "div", "h1", "h2", "h3", "h4", "h5", "h6", "li", "ul", "ol"]);
var INLINE = /* @__PURE__ */ new Set(["span", "b", "strong", "i", "em", "u", "s", "strike", "del", "sup", "sub", "a"]);
var SKIP = /* @__PURE__ */ new Set(["script", "style"]);
var HEADING = { h1: 2, h2: 1.5, h3: 1.17, h4: 1, h5: 0.83, h6: 0.67 };
var NAMED = {
  black: "#000000",
  white: "#ffffff",
  red: "#ff0000",
  green: "#008000",
  blue: "#0000ff",
  gray: "#808080",
  grey: "#808080",
  orange: "#ffa500",
  yellow: "#ffff00",
  purple: "#800080",
  navy: "#000080",
  maroon: "#800000",
  teal: "#008080",
  silver: "#c0c0c0"
};
var ENT = {
  amp: "&",
  lt: "<",
  gt: ">",
  quot: '"',
  apos: "'",
  nbsp: " ",
  mdash: "—",
  ndash: "–",
  hellip: "…",
  lsquo: "‘",
  rsquo: "’",
  ldquo: "“",
  rdquo: "”",
  bull: "•",
  middot: "·",
  copy: "©",
  reg: "®",
  trade: "™",
  euro: "€",
  pound: "£",
  yen: "¥",
  times: "×",
  divide: "÷",
  deg: "°",
  plusmn: "±",
  sect: "§",
  para: "¶"
};
var safeHref = safeUrl;
function color(v) {
  const s = v.trim().toLowerCase();
  if (s.length > 60) return void 0;
  if (NAMED[s]) return NAMED[s];
  if (/^#[0-9a-f]{3,8}$/.test(s) || /^rgba?\([0-9.,\s%]+\)$/.test(s)) return s;
  return void 0;
}
function decode2(s) {
  if (!s.includes("&")) return s;
  let out = "";
  for (let i = 0; i < s.length; i++) {
    const c = s[i];
    if (c !== "&") {
      out += c;
      continue;
    }
    let end = -1;
    for (let k = i + 1; k < s.length && k <= i + 10; k++) if (s[k] === ";") {
      end = k;
      break;
    }
    if (end < 0) {
      out += c;
      continue;
    }
    const name = s.slice(i + 1, end);
    let rep;
    if (name[0] === "#") {
      const n = name[1] === "x" || name[1] === "X" ? parseInt(name.slice(2), 16) : parseInt(name.slice(1), 10);
      if (Number.isFinite(n) && n > 0 && n <= 1114111 && !(n >= 55296 && n <= 57343)) rep = String.fromCodePoint(n);
    } else rep = ENT[name.toLowerCase()];
    if (rep === void 0) {
      out += c;
      continue;
    }
    out += rep;
    i = end;
  }
  return out;
}
var clampSize = (n) => Math.round(Math.min(400, Math.max(1, n)) * 100) / 100;
function fontSize(v, parent) {
  const s = v.trim().toLowerCase();
  let k = s.length;
  while (k > 0 && !(s[k - 1] >= "0" && s[k - 1] <= "9") && s[k - 1] !== ".") k--;
  const n = Number(s.slice(0, k)), unit = s.slice(k).trim();
  if (!Number.isFinite(n) || n <= 0) return void 0;
  if (unit === "" || unit === "pt") return n;
  if (unit === "px") return n * 0.75;
  if (unit === "em" || unit === "rem") return n * parent;
  if (unit === "%") return n / 100 * parent;
  return void 0;
}
function cssDecls(css) {
  const out = [];
  let start = 0, amp = -1;
  for (let i = 0; i < css.length && out.length < RICH_LIMITS.maxDecls; i++) {
    const c = css[i];
    if (c === "&") amp = i;
    else if (c === ";") {
      if (amp >= 0 && i - amp <= 10) {
        amp = -1;
        continue;
      }
      out.push(css.slice(start, i));
      start = i + 1;
      amp = -1;
    }
  }
  if (out.length < RICH_LIMITS.maxDecls && start < css.length) out.push(css.slice(start));
  return out;
}
function applyCss(css, st) {
  for (const raw of cssDecls(css)) {
    const decl = decode2(raw);
    const c = decl.indexOf(":");
    if (c < 0) continue;
    const prop = decl.slice(0, c).trim().toLowerCase(), val = decl.slice(c + 1).trim();
    if (!val) continue;
    const low = val.toLowerCase();
    switch (prop) {
      case "color": {
        const x = color(val);
        if (x) st.color = x;
        break;
      }
      case "background-color":
      case "background": {
        const x = color(val);
        if (x) st.background = x;
        break;
      }
      case "font-size": {
        const x = fontSize(val, st.fontSize || 9);
        if (x) st.fontSize = clampSize(x);
        break;
      }
      case "font-weight":
        if (low === "bold" || low === "bolder") st.fontWeight = "bold";
        else if (low === "normal" || low === "lighter") st.fontWeight = "normal";
        else if (/^[1-9]00$/.test(low)) st.fontWeight = low;
        break;
      case "font-style":
        if (low === "italic" || low === "oblique") st.fontStyle = "italic";
        else if (low === "normal") st.fontStyle = "normal";
        break;
      case "font-family": {
        const f4 = val.split(",")[0].trim().replace(/^['"]|['"]$/g, "");
        if (f4 && f4.length < 60) st.fontFamily = f4;
        break;
      }
      case "text-decoration":
      case "text-decoration-line":
        if (low.includes("none")) {
          st.underline = false;
          st.strike = false;
        }
        if (low.includes("underline")) st.underline = true;
        if (low.includes("line-through")) st.strike = true;
        break;
      case "text-align":
        if (["left", "center", "right", "justify"].includes(low)) st.align = low === "justify" ? "left" : low;
        break;
    }
  }
  return st;
}
function readTag(s, i) {
  let j = i + 1;
  const close = s[j] === "/";
  if (close) j++;
  let name = "";
  while (j < s.length && /[a-zA-Z0-9]/.test(s[j])) name += s[j++];
  const attrs = {};
  let self2 = false, count = 0;
  while (j < s.length) {
    const c = s[j];
    if (c === ">") return { end: j + 1, name: name.toLowerCase(), close, self: self2, attrs };
    if (c === "/") {
      self2 = true;
      j++;
      continue;
    }
    if (c === " " || c === "	" || c === "\n" || c === "\r" || c === "\f") {
      j++;
      continue;
    }
    self2 = false;
    let an = "";
    while (j < s.length && !" 	\n\r\f/>=".includes(s[j])) an += s[j++];
    while (j < s.length && " 	\n\r\f".includes(s[j])) j++;
    let av = "";
    if (s[j] === "=") {
      j++;
      while (j < s.length && " 	\n\r\f".includes(s[j])) j++;
      const q = s[j];
      if (q === '"' || q === "'") {
        const e = s.indexOf(q, j + 1);
        if (e < 0) return null;
        av = s.slice(j + 1, e);
        j = e + 1;
      } else while (j < s.length && !" 	\n\r\f>".includes(s[j])) av += s[j++];
    }
    if (an && an.length < 40 && ++count <= RICH_LIMITS.maxAttrs) attrs[an.toLowerCase()] = av;
    if (!an && j < s.length && s[j] !== ">") j++;
  }
  return null;
}
function parseRich(html, opt = {}) {
  const warn = opt.warn || (() => {
  });
  let s = String(html ?? "");
  if (s.length > RICH_LIMITS.maxLength) {
    s = s.slice(0, RICH_LIMITS.maxLength);
    const lt = s.lastIndexOf("<");
    if (lt >= 0 && s.indexOf(">", lt) < 0) s = s.slice(0, lt);
    warn(`the markup is longer than ${RICH_LIMITS.maxLength} characters and was cut.`);
  }
  const low = s.toLowerCase();
  const blocks = [];
  const stack2 = [{ name: "", st: { fontSize: opt.baseSize || 9 } }];
  const lists = [];
  const unknown = /* @__PURE__ */ new Set();
  let ignored = 0, deepWarned = false, nRuns = 0, nBreaks = 0, full = false;
  const cutAt = (what) => {
    if (!full) {
      full = true;
      warn(`more than ${what}; the rest is cut.`);
    }
  };
  let cur = null;
  let marker = (
    /** @type {string|undefined} */
    void 0
  );
  let lastSpace = true;
  const top = () => stack2[stack2.length - 1];
  const blockTag = () => {
    for (let k = stack2.length - 1; k > 0; k--) if (BLOCK.has(stack2[k].name) && stack2[k].name !== "ul" && stack2[k].name !== "ol") return stack2[k].name;
    return "";
  };
  const flush = () => {
    if (cur) {
      const runs = cur.runs;
      while (runs.length && runs[runs.length - 1].text.endsWith(" ")) {
        const r = runs[runs.length - 1];
        r.text = r.text.slice(0, -1);
        if (!r.text) runs.pop();
      }
      if (runs.length) {
        if (blocks.length >= RICH_LIMITS.maxBlocks) cutAt(`${RICH_LIMITS.maxBlocks} paragraphs`);
        else blocks.push(cur);
      }
    }
    cur = null;
    lastSpace = true;
  };
  const add2 = (text2, st, force = false) => {
    if (!cur) {
      if (!force && !text2.trim()) return;
      cur = { tag: blockTag(), level: lists.length, runs: [] };
      if (top().st.align) cur.align = top().st.align;
      if (marker) {
        cur.marker = marker;
        marker = void 0;
      }
    }
    const last = cur.runs[cur.runs.length - 1];
    if (last && last.st === st) last.text += text2;
    else if (++nRuns > RICH_LIMITS.maxRuns) cutAt(`${RICH_LIMITS.maxRuns} styled pieces`);
    else cur.runs.push({ text: text2, st });
  };
  const text = (raw) => {
    let t = "";
    for (const ch of raw) {
      if (ch === " " || ch === "\n" || ch === "	" || ch === "\r" || ch === "\f") {
        if (!lastSpace) {
          t += " ";
          lastSpace = true;
        }
        continue;
      }
      t += ch;
      lastSpace = false;
    }
    if (t) add2(decode2(t), top().st);
  };
  let i = 0;
  while (i < s.length && !full) {
    const lt = s.indexOf("<", i);
    if (lt < 0) {
      text(s.slice(i));
      break;
    }
    if (lt > i) text(s.slice(i, lt));
    i = lt;
    if (s.startsWith("<!--", i)) {
      const e = s.indexOf("-->", i + 4);
      if (e < 0) break;
      i = e + 3;
      continue;
    }
    const nx = s[i + 1] || "";
    if (!/[a-zA-Z\/!?]/.test(nx)) {
      text("<");
      i++;
      continue;
    }
    if (nx === "!" || nx === "?") {
      const e = s.indexOf(">", i);
      if (e < 0) break;
      i = e + 1;
      continue;
    }
    const tag3 = readTag(s, i);
    if (!tag3) break;
    i = tag3.end;
    const name = tag3.name;
    if (!name) continue;
    if (!tag3.close && SKIP.has(name)) {
      const e = low.indexOf(`</${name}`, i);
      if (e < 0) break;
      const g = s.indexOf(">", e);
      if (g < 0) break;
      i = g + 1;
      continue;
    }
    if (name === "br") {
      if (tag3.close) continue;
      if (++nBreaks > RICH_LIMITS.maxBreaks) {
        cutAt(`${RICH_LIMITS.maxBreaks} line breaks`);
        continue;
      }
      add2("\n", top().st, true);
      lastSpace = true;
      continue;
    }
    if (!BLOCK.has(name) && !INLINE.has(name)) {
      if (unknown.size < 20) unknown.add(name.slice(0, 20));
      continue;
    }
    if (tag3.close) {
      if (ignored > 0) {
        ignored--;
        continue;
      }
      let k = stack2.length - 1;
      while (k > 0 && stack2[k].name !== name) k--;
      if (k === 0) continue;
      if (BLOCK.has(name)) {
        const b = cur;
        flush();
        const last = b && blocks[blocks.length - 1] === b ? b : blocks[blocks.length - 1];
        if (last && (name === "p" || name in HEADING || (name === "ul" || name === "ol") && lists.length === 1)) last.spaceAfter = true;
      }
      for (let n = stack2.length - 1; n >= k; n--) if (stack2[n].name === "ul" || stack2[n].name === "ol") lists.pop();
      stack2.length = k;
      continue;
    }
    if (tag3.self && name !== "li") continue;
    if (stack2.length > RICH_LIMITS.maxDepth) {
      ignored++;
      if (!deepWarned) {
        deepWarned = true;
        warn(`tags nest more than ${RICH_LIMITS.maxDepth} deep; the deeper ones are ignored (their text is kept).`);
      }
      continue;
    }
    const st = { ...top().st };
    switch (name) {
      case "b":
      case "strong":
        st.fontWeight = "bold";
        break;
      case "i":
      case "em":
        st.fontStyle = "italic";
        break;
      case "u":
        st.underline = true;
        break;
      case "s":
      case "strike":
      case "del":
        st.strike = true;
        break;
      case "sup":
        st.script = "sup";
        break;
      case "sub":
        st.script = "sub";
        break;
      case "a": {
        const h = decode2(tag3.attrs.href ?? "");
        const ok = safeHref(h);
        if (ok) st.href = ok;
        else if (h) warn(`the link "${h.slice(0, 40)}" is not allowed (only http, https, mailto and / links); its text is kept.`);
        break;
      }
      default:
        if (name in HEADING) {
          st.fontSize = clampSize((st.fontSize || 9) * HEADING[name]);
          st.fontWeight = "bold";
        }
    }
    if (tag3.attrs.style) applyCss(tag3.attrs.style, st);
    if (BLOCK.has(name)) {
      flush();
      if (name === "ul" || name === "ol") lists.push({ ordered: name === "ol", n: 0 });
      if (name === "li") {
        const l = lists[lists.length - 1];
        marker = l ? l.ordered ? `${++l.n}.` : "•" : "•";
      }
    }
    stack2.push({ name, st });
  }
  flush();
  if (unknown.size) warn(`these tags are not supported and were left out (their text is kept): ${[...unknown].slice(0, 10).join(", ")}.`);
  return { blocks };
}

// src/engine/items/rich.js
var RICH_DEFAULTS = { listIndent: 18, paragraphSpacing: 4, linkColor: "#0563c1", maxFragments: 2e4, maxLines: 5e3 };
var SIZE = { min: 1, max: 400 };
var LINE_HEIGHT = { min: 0.5, max: 5 };
var MAX_LIST_LEVEL = 10;
var clamp = (v, lo, hi) => Math.min(hi, Math.max(lo, v));
var ESC = { "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;", ";": "&#59;" };
var escapeHtml = (s) => String(s).replace(/[&<>"';]/g, (c) => ESC[c]);
function richValue(v, ctx, htmlFromData = false) {
  const p = parseValue(v);
  const data = (r) => {
    const s = String(toText(r, null, ctx)).slice(0, RICH_LIMITS.maxLength + 1);
    return htmlFromData ? s : escapeHtml(s);
  };
  if (p.kind === "lit") return p.v == null ? "" : String(p.v);
  if (p.kind === "expr") return data(evaluate(p.ast, ctx));
  let out = "";
  for (const part2 of p.parts) {
    if (out.length > RICH_LIMITS.maxLength) break;
    out += typeof part2 === "string" ? part2 : data(evaluate(part2.ast, ctx));
  }
  return out;
}
function layoutRich(blocks, st, width, m, opt = {}) {
  const pad2 = padding(st);
  const inner = Math.max(1, width - pad2[1] - pad2[3]);
  const lhf = clamp(Number(st.lineHeight) || 1.25, LINE_HEIGHT.min, LINE_HEIGHT.max);
  const baseSize = clamp(Number(st.fontSize) || 9, SIZE.min, SIZE.max);
  const warn = opt.warn || (() => {
  });
  const maxH = opt.maxLineHeight > 0 ? opt.maxLineHeight : Infinity;
  const baseAlign = st.textAlign === "center" || st.textAlign === "right" ? st.textAlign : "left";
  const indent = Number.isFinite(Number(opt.listIndent)) && opt.listIndent != null ? clamp(Number(opt.listIndent), 0, 144) : RICH_DEFAULTS.listIndent;
  const spacing = Number.isFinite(Number(opt.paragraphSpacing)) && opt.paragraphSpacing != null ? clamp(Number(opt.paragraphSpacing), 0, 144) : RICH_DEFAULTS.paragraphSpacing;
  const looks = /* @__PURE__ */ new Map();
  const lookOf2 = (rs) => {
    let l = looks.get(rs);
    if (l) return l;
    const key = resolveFontKey(rs.fontFamily || st.fontFamily, rs.fontWeight || st.fontWeight, rs.fontStyle || st.fontStyle, m.unknownFonts);
    const lineSize = clamp(rs.fontSize || baseSize, SIZE.min, SIZE.max);
    let size = lineSize, rise = 0;
    if (rs.script) {
      const sc = m.script(key);
      size = Math.round(lineSize * (rs.script === "sup" ? sc.supScale : sc.subScale) * 100) / 100;
      rise = rs.script === "sup" ? lineSize * sc.supRise : -lineSize * sc.subDrop;
    }
    const under = rs.underline ?? (rs.href ? true : false);
    const color2 = rs.color || (rs.href ? RICH_DEFAULTS.linkColor : st.color || "#000");
    l = { id: "", key, size, lineSize, rise, color: color2, under: !!under, strike: !!rs.strike, bg: rs.background, href: rs.href };
    l.id = [key, size, rise, color2, l.under, l.strike, l.bg || "", l.href || ""].join("|");
    looks.set(rs, l);
    return l;
  };
  const lines = [];
  let fragCount = 0, full = false;
  blocks.forEach((b, bi) => {
    if (full) return;
    const left = Math.min(MAX_LIST_LEVEL, Math.max(b.level, b.marker ? 1 : 0)) * indent;
    const avail = Math.max(1, inner - left);
    const align = b.align || baseAlign;
    const words = [];
    let cur = null;
    for (const run of b.runs) {
      const look = lookOf2(run.st);
      for (const ch of run.text) {
        if (ch === "\n") {
          cur = null;
          words.push({ parts: [], space: null, br: true });
          continue;
        }
        if (ch === " ") {
          if (cur) {
            cur.space = look;
            cur = null;
          }
          continue;
        }
        if (!cur) {
          cur = { parts: [], space: null };
          words.push(cur);
        }
        const last = cur.parts[cur.parts.length - 1];
        if (last && last.look === look) last.text += ch;
        else cur.parts.push({ text: ch, look });
      }
    }
    let segs = [];
    let lw = 0, br = false, first = true, prevSpace = (
      /** @type {Look|null} */
      null
    );
    const width1 = (t, l) => m.width(t, l.key, l.size);
    const endLine = (nextBr) => {
      if (full) return;
      if (lines.length >= RICH_DEFAULTS.maxLines || fragCount >= RICH_DEFAULTS.maxFragments) {
        full = true;
        warn(`more than ${RICH_DEFAULTS.maxLines} lines or ${RICH_DEFAULTS.maxFragments} styled pieces; the rest is cut.`);
        return;
      }
      const frags = [];
      for (const s of segs) {
        const f4 = frags[frags.length - 1];
        if (f4 && f4.look.id === s.look.id) f4.text += s.text;
        else frags.push({ text: s.text, look: s.look, x: 0, w: 0 });
      }
      let x = 0, above = 0, below = 0, ls = 0;
      for (const f4 of frags) {
        f4.w = width1(f4.text, f4.look);
        f4.x = x;
        x += f4.w;
        const mt = m.metrics(f4.look.key, f4.look.size);
        above = Math.max(above, mt.ascent + f4.look.rise);
        below = Math.max(below, mt.descent - f4.look.rise);
        ls = Math.max(ls, f4.look.lineSize);
      }
      if (!frags.length) {
        const mt = m.metrics(resolveFontKey(st.fontFamily, st.fontWeight, st.fontStyle), baseSize);
        above = mt.ascent;
        below = mt.descent;
        ls = baseSize;
      }
      const h = Math.min(maxH, Math.max(ls * lhf, above + below));
      if (first && b.marker) {
        const ml = lookOf2(b.runs[0]?.st || {});
        const mw = width1(b.marker, ml);
        frags.splice(0, 0, { text: `${b.marker} `, look: { ...ml, under: false, strike: false, bg: void 0, href: void 0, rise: 0, size: ml.lineSize, id: "marker" }, x: -Math.min(indent, mw + ml.lineSize * 0.4), w: mw + width1(" ", ml) });
      }
      fragCount += frags.length;
      lines.push({ frags, w: x, h, base: (h - above - below) / 2 + above, left, align, p: bi, br, gap: 0 });
      segs = [];
      lw = 0;
      br = nextBr;
      first = false;
      prevSpace = null;
    };
    const pushParts = (parts) => {
      for (let k = 0; k < parts.length; k++) segs.push(parts[k]);
    };
    for (const wd of words) {
      if (full) break;
      if (wd.br) {
        endLine(true);
        continue;
      }
      const ww = wd.parts.reduce((s, p) => s + width1(p.text, p.look), 0);
      const sp = prevSpace ? width1(" ", prevSpace) : 0;
      if (segs.length && lw + sp + ww <= avail) {
        segs.push({ text: " ", look: (
          /** @type {Look} */
          prevSpace
        ) });
        pushParts(wd.parts);
        lw += sp + ww;
      } else {
        if (segs.length) endLine(false);
        if (ww <= avail) {
          pushParts(wd.parts);
          lw = ww;
        } else {
          for (const p of wd.parts) for (const ch of p.text) {
            if (full) break;
            const cw = width1(ch, p.look);
            if (lw + cw > avail && segs.length) endLine(false);
            const last = segs[segs.length - 1];
            if (last && last.look === p.look) last.text += ch;
            else segs.push({ text: ch, look: p.look });
            lw += cw;
          }
        }
      }
      prevSpace = wd.space;
    }
    if (segs.length || !words.length || !words[words.length - 1].br) endLine(false);
    else if (!lines.length || lines[lines.length - 1].p !== bi) endLine(false);
    if (b.spaceAfter && bi < blocks.length - 1) lines[lines.length - 1].gap = spacing;
  });
  const needed = lines.reduce((s, l) => s + l.h + l.gap, 0) + pad2[0] + pad2[2];
  return { lines, needed, pad: pad2, inner, fragments: fragCount };
}
function paintRich({ x, y, w, h, st, rl, m, id }) {
  const box = paintBox({ x, y, w, h, st, tl: null, m });
  const nb = (st.backgroundColor ? 1 : 0) + (st.backgroundImage ? 1 : 0);
  const { lines, pad: pad2, inner } = rl;
  const bgs = [], texts = [], decos = [], links = [];
  const avail = h - pad2[0] - pad2[2];
  let blockH = 0;
  for (let i = 0; i < lines.length; i++) blockH += lines[i].h + (i < lines.length - 1 ? lines[i].gap : 0);
  let top = y + pad2[0];
  if (st.verticalAlign === "middle") top += Math.max(0, (avail - blockH) / 2);
  else if (st.verticalAlign === "bottom") top += Math.max(0, avail - blockH);
  const clip = { x, y, w, h };
  for (let li = 0; li < lines.length; li++) {
    const ln = lines[li];
    if (top + ln.h > y + h - pad2[2] + 1.01 && ln !== lines[0]) break;
    const avl = Math.max(1, inner - ln.left);
    let lx = x + pad2[3] + ln.left;
    if (ln.align === "right") lx += avl - ln.w;
    else if (ln.align === "center") lx += (avl - ln.w) / 2;
    const baseY = top + ln.base;
    ln.frags.forEach((f4, k) => {
      const L = f4.look, fx = lx + f4.x, by = baseY - L.rise;
      const mt = m.metrics(L.key, L.size);
      if (L.bg) bgs.push({ t: "rect", x: fx, y: by - mt.ascent, w: f4.w, h: mt.ascent + mt.descent, fill: L.bg });
      const rich = { id, p: ln.p, l: li };
      if (ln.br && k === 0) rich.br = true;
      if (ln.align !== "left") rich.a = ln.align;
      if (L.rise) {
        rich.s = L.rise > 0 ? "sup" : "sub";
        rich.z = L.lineSize;
      }
      const t = { t: "text", font: L.key, size: L.size, color: L.color, lines: [{ x: fx, y: by, text: f4.text, w: f4.w }], clip, rich };
      if (L.under || L.strike) {
        t.deco = [L.under ? "underline" : "", L.strike ? "line-through" : ""].filter(Boolean).join(" ");
        if (f4.text.trim()) {
          const d = m.decoration(L.key, L.size);
          if (L.under) decos.push({ t: "line", x1: fx, y1: by + d.underlineY, x2: fx + f4.w, y2: by + d.underlineY, stroke: L.color, strokeWidth: d.underlineWidth, dash: null });
          if (L.strike) decos.push({ t: "line", x1: fx, y1: by + d.strikeY, x2: fx + f4.w, y2: by + d.strikeY, stroke: L.color, strokeWidth: d.strikeWidth, dash: null });
        }
      }
      texts.push(t);
      if (L.href && f4.text.trim()) links.push({ t: "link", x: fx, y: top, w: f4.w, h: ln.h, action: { type: "url", href: L.href } });
    });
    top += ln.h + ln.gap;
  }
  return [...box.slice(0, nb), ...bgs, ...texts, ...decos, ...box.slice(nb), ...links];
}
var upright = (cp) => cp >= 11904 && cp <= 42191 || cp >= 44032 && cp <= 55215 || cp >= 63744 && cp <= 64255 || cp >= 65072 && cp <= 65103 || cp >= 65280 && cp <= 65519 || cp >= 131072 && cp <= 262143;
var MAX_VERTICAL = { tokens: 2e4 };
function paintVertical({ x, y, w, h, st, text, m }) {
  const box = paintBox({ x, y, w, h, st, tl: null, m });
  const nb = (st.backgroundColor ? 1 : 0) + (st.backgroundImage ? 1 : 0);
  const key = resolveFontKey(st.fontFamily, st.fontWeight, st.fontStyle);
  const size = clamp(Number(st.fontSize) || 9, SIZE.min, SIZE.max);
  const colW = size * clamp(Number(st.lineHeight) || 1.25, LINE_HEIGHT.min, LINE_HEIGHT.max);
  const pad2 = padding(st);
  const innerH = Math.max(1, h - pad2[0] - pad2[2]), innerW = Math.max(1, w - pad2[1] - pad2[3]);
  const maxCols = Math.max(1, Math.floor((innerW + 0.01) / colW));
  const { ascent, descent } = m.metrics(key, size);
  const cols = [];
  let col = null, n = 0;
  const newCol = () => {
    if (cols.length >= maxCols) return false;
    col = { toks: [], len: 0 };
    cols.push(col);
    return true;
  };
  const place = (up, t) => {
    const adv = up ? size : m.width(t, key, size);
    if (col.len + adv > innerH + 0.01 && col.toks.length && !newCol()) return false;
    col.toks.push({ up, text: t, at: col.len, adv });
    col.len += adv;
    return ++n < MAX_VERTICAL.tokens;
  };
  out: for (const para of String(text).split(/\r?\n/)) {
    if (!newCol()) break;
    let run = "";
    for (const ch of para) {
      const up = upright(
        /** @type {number} */
        ch.codePointAt(0)
      );
      if (!up && ch !== " ") {
        run += ch;
        continue;
      }
      if (!up) {
        run += ch;
        if (!place(false, run)) break out;
        run = "";
        continue;
      }
      if (run && !place(false, run)) break out;
      run = "";
      if (!place(true, ch)) break out;
    }
    if (run && !place(false, run)) break;
  }
  const texts = [];
  const clip = { x, y, w, h };
  cols.forEach((c, ci) => {
    const cx = x + w - pad2[1] - (ci + 0.5) * colW;
    let top = y + pad2[0];
    if (st.textAlign === "center") top += (innerH - c.len) / 2;
    else if (st.textAlign === "right") top += innerH - c.len;
    const ups = [];
    for (const t of c.toks) {
      if (t.up) {
        const cw = m.width(t.text, key, size);
        ups.push({ x: cx - cw / 2, y: top + t.at + size / 2 + (ascent - descent) / 2, text: t.text, w: cw });
        continue;
      }
      const s = t.text.trimEnd();
      if (!s) continue;
      const sw = m.width(s, key, size), cy = top + t.at + sw / 2;
      texts.push({
        t: "text",
        font: key,
        size,
        color: st.color || "#000",
        lines: [{ x: cx - sw / 2, y: cy + (ascent - descent) / 2, text: s, w: sw }],
        clip: { x: cx - sw / 2, y: cy - colW / 2, w: sw, h: colW },
        rotate: { a: 90, cx, cy }
      });
    }
    if (ups.length) texts.push({ t: "text", font: key, size, color: st.color || "#000", lines: ups, clip });
  });
  return [...box.slice(0, nb), ...texts, ...box.slice(nb)];
}

// src/engine/items/toc.js
var ROMAN = (
  /** @type {[number, string][]} */
  [[1e3, "M"], [900, "CM"], [500, "D"], [400, "CD"], [100, "C"], [90, "XC"], [50, "L"], [40, "XL"], [10, "X"], [9, "IX"], [5, "V"], [4, "IV"], [1, "I"]]
);
function formatNumber2(n, kind) {
  if (kind === "roman" && n > 0 && n < 4e3) {
    let s = "";
    for (const [v, r] of ROMAN) while (n >= v) {
      s += r;
      n -= v;
    }
    return s;
  }
  if (kind === "alpha" && n > 0) {
    let s = "";
    while (n > 0) {
      n--;
      s = String.fromCharCode(65 + n % 26) + s;
      n = Math.floor(n / 26);
    }
    return s;
  }
  return String(n);
}
function tocNumbers(entries, numbering) {
  const kinds = Array.isArray(numbering) ? numbering : [numbering];
  const counters = [];
  return entries.map((e) => {
    const L = Math.max(0, Math.min(9, Number(e.level) || 0));
    for (let k = 0; k < L; k++) counters[k] || (counters[k] = 1);
    counters[L] = (counters[L] || 0) + 1;
    counters.length = L + 1;
    return counters.map((c, k) => formatNumber2(c, kinds[Math.min(k, kinds.length - 1)] || "decimal")).join(".");
  });
}

// src/engine/items/pivot.js
var PIVOT_LIMITS = { depth: 8, values: 50, columns: 1e3, cells: 25e4, tree: 64 };
function groupRows(rows, expr, ctx, lc, who, adjacent = false) {
  const map = /* @__PURE__ */ new Map();
  const out = [];
  const c = { ...ctx };
  let prev = null;
  for (const r of rows) {
    c.fields = r;
    let key;
    try {
      key = evalValue(expr, c);
    } catch (e) {
      lc.warn(`${who} group: ${e.message}`);
      key = "#Error";
    }
    const k = groupKeyText(key, ctx);
    if (adjacent) {
      if (!prev || prev.k !== k) {
        prev = { k, b: { key, text: key instanceof Date ? String(key.getTime()) : String(key), rows: [] } };
        out.push(prev.b);
      }
      prev.b.rows.push(r);
      continue;
    }
    let b = map.get(k);
    if (!b) {
      b = { key, text: key instanceof Date ? String(key.getTime()) : String(key), rows: [] };
      map.set(k, b);
    }
    b.rows.push(r);
  }
  return adjacent ? out : [...map.values()];
}
function emptyCellFields(rchain, rg, cchain, cg) {
  const out = {};
  for (const [chain, groups] of [[rchain, rg], [cchain, cg]]) {
    for (let l = 0; l < chain.length; l++) {
      const m = /^=\s*Fields\s*[.!]\s*(\w+)\s*$/.exec(String(groups[l]?.expr ?? ""));
      const r = chain[l]?.rows?.[0];
      if (!m || !r) return null;
      out[m[1]] = r[m[1]];
    }
  }
  return Object.keys(out).length ? out : null;
}
var cmpKey = (a, b, ctx) => sortCompare(a, b, ctx);
var isTablix = (item) => Array.isArray(item.rowGroups) || Array.isArray(item.columnGroups) || Array.isArray(item.values);
var OVERFLOWS = ["paginate", "shrink", "clip"];
function normalizeMatrix(item) {
  if (isTablix(item)) {
    return {
      rowGroups: (item.rowGroups || []).filter((g) => g && typeof g === "object"),
      columnGroups: (item.columnGroups || []).filter((g) => g && typeof g === "object"),
      values: (Array.isArray(item.values) && item.values.length ? item.values : [{ value: "=Count(Fields)" }]).filter((v) => v && typeof v === "object"),
      legacy: false,
      overflow: OVERFLOWS.includes(item.overflow) ? item.overflow : "paginate",
      pageOrder: item.pageOrder === "across" ? "across" : "down"
    };
  }
  return {
    rowGroups: [{ expr: item.rowGroup || "=''", sort: item.rowSort, total: item.columnTotals !== false ? "after" : "none", width: item.rowHeaderWidth || 110 }],
    columnGroups: [{ expr: item.columnGroup || "=''", sort: item.columnSort, total: item.rowTotals !== false ? "after" : "none" }],
    values: [{ value: item.value || "=Count(Fields)", format: item.valueFormat || null }],
    legacy: true,
    overflow: OVERFLOWS.includes(item.overflow) ? item.overflow : "paginate",
    // too wide: the next pages, as SSRS (not narrowed)
    pageOrder: item.pageOrder === "across" ? "across" : "down"
  };
}
function sortBuckets(bs, g, ctx, lc, who) {
  const dir = g.sort === "desc" ? -1 : 1;
  if (g.sortBy) {
    const keys = new Map(bs.map((b) => {
      try {
        return [b, evalValue(g.sortBy, { ...ctx, fields: b.rows[0], aggRows: b.rows, aggIndex: void 0 })];
      } catch (e) {
        lc.warn(`${who}: ${e.message}`);
        return [b, null];
      }
    }));
    bs.sort((a, b) => {
      const x = keys.get(a), y = keys.get(b);
      if (x == null || y == null) return x == null && y == null ? 0 : x == null ? 1 : -1;
      return cmpKey(x, y, ctx) * dir;
    });
  } else if (g.sort === "asc" || g.sort === "desc") bs.sort((a, b) => cmpKey(a.key, b.key, ctx) * dir);
  return bs;
}
function buildTree(groups, rows, ctx, lc, who, axis, state) {
  let warnedRec = false;
  const recurse = (n, g, l) => {
    const nodes = n.children;
    const byText = new Map(nodes.map((x) => [x.text, x]));
    const roots = [];
    for (const x of nodes) {
      let pk;
      try {
        pk = evalValue(g.parent, { ...ctx, fields: x.rows[0], aggRows: x.rows, aggIndex: void 0 });
      } catch (e) {
        lc.warn(`${who}: ${e.message}`);
        pk = null;
      }
      const pr = pk == null || pk === "" ? null : byText.get(pk instanceof Date ? String(pk.getTime()) : String(pk));
      if (!pr || pr === x) roots.push(x);
      else (pr.rec || (pr.rec = [])).push(x);
    }
    const seen = /* @__PURE__ */ new Set(), late = [];
    let deep = false;
    const visit = (x, d, path) => {
      seen.add(x);
      x.depth = d;
      x.path = `${path}/${x.text}`;
      let all = x.rows;
      const kids = [];
      for (const c of x.rec || []) {
        if (seen.has(c)) continue;
        if (d + 1 >= PIVOT_LIMITS.tree) {
          deep = true;
          late.push(c);
          continue;
        }
        kids.push(c);
        all = all.concat(visit(c, d + 1, x.path));
      }
      x.rec = kids;
      x.recRows = all;
      const coll = g.collapsible || g.expandLevels != null;
      if (coll && kids.length) {
        const key = `${who}|${axis}${l}|${x.path}`;
        const dflt = g.expandLevels != null ? d < Number(g.expandLevels) : !g.initiallyCollapsed;
        x.open = state?.toggles?.[key] ?? dflt;
        x.toggle = { key, open: x.open };
      }
      return all;
    };
    for (const r of roots) visit(r, 0, n.path);
    const top = [...roots];
    const rest = [...late, ...nodes.filter((x) => !seen.has(x))];
    if (deep) lc.warn(`${who}: the recursive group is more than ${PIVOT_LIMITS.tree} levels deep; deeper rows are listed at the top level`);
    let cyc = 0;
    for (const x of rest) if (!seen.has(x)) {
      if (!late.includes(x)) cyc++;
      visit(x, 0, n.path);
      top.push(x);
    }
    if (cyc) lc.warn(`${who}: ${cyc} rows of the recursive group have no root (a cycle); they are listed at the top level`);
    n.children = top;
  };
  const root = { key: null, label: "", rows, level: -1, parent: null, children: null, path: "", open: true, lo: 0, hi: 0 };
  let frontier = [root];
  groups.forEach((g, l) => {
    const next = [];
    for (const n of frontier) {
      const bs = sortBuckets(groupRows(n.rows, g.expr || "=''", ctx, lc, who), g, ctx, lc, who);
      n.children = bs.map((b) => {
        const node = { key: b.key, text: b.text, label: "", rows: b.rows, level: l, parent: n, children: null, path: `${n.path}/${b.text}`, open: true, lo: 0, hi: 0, toggle: null };
        if (g.label) {
          let v;
          try {
            v = evalValue(g.label, { ...ctx, fields: b.rows[0], aggRows: b.rows, aggIndex: void 0 });
          } catch (e) {
            lc.warn(`${who}: ${e.message}`);
            v = "#Error";
          }
          node.label = toText(v, g.format || null, ctx);
        } else node.label = toText(b.key, g.format || null, ctx);
        if (g.collapsible && l < groups.length - 1) {
          const key = `${who}|${axis}${l}|${node.path}`;
          node.open = state?.toggles?.[key] ?? !g.initiallyCollapsed;
          node.toggle = { key, open: node.open };
        }
        return node;
      });
      if (g.parent && axis === "r") {
        if (l === groups.length - 1) recurse(n, g, l);
        else if (!warnedRec) {
          warnedRec = true;
          lc.warn(`${who}: only the innermost row group can be recursive; "parent" on an outer group is left out`);
        }
      }
      for (const k of n.children) next.push(k);
    }
    frontier = next;
  });
  let ord = 0;
  const number = (n) => {
    if (!n.children) {
      n.lo = n.hi = ord++;
      return;
    }
    n.lo = ord;
    for (const c of n.children) number(c);
    n.hi = Math.max(n.lo, ord - 1);
    if (!n.children.length) ord++;
  };
  number(root);
  return root;
}
function visible(root, groups) {
  const out = [];
  if (!groups.length) {
    out.push({ kind: "leaf", node: root, level: -1, chain: [] });
    return out;
  }
  const chainOf = (n) => {
    const c = [];
    for (let p = n; p && p.level >= 0; p = p.parent) c.unshift(p);
    return c;
  };
  const walk = (n, l) => {
    const g = groups[l];
    const total = { kind: "total", node: n, level: l, chain: chainOf(n) };
    if (g.total === "before") out.push(total);
    const leaf = (c) => {
      const st = [c];
      while (st.length) {
        const x = st.pop();
        out.push({ kind: "leaf", node: x, level: l, chain: chainOf(x) });
        if (x.open && x.rec) for (let i = x.rec.length - 1; i >= 0; i--) st.push(x.rec[i]);
      }
    };
    for (const c of n.children || []) {
      if (l === groups.length - 1) leaf(c);
      else if (!c.open) out.push({ kind: "collapsed", node: c, level: l, chain: chainOf(c) });
      else walk(c, l + 1);
    }
    if (g.total === "after") out.push(total);
  };
  walk(root, 0);
  return out;
}
function spans(entries) {
  const first = /* @__PURE__ */ new Map(), count = /* @__PURE__ */ new Map();
  entries.forEach((e, i) => {
    for (const n of e.chain) {
      if (!first.has(n)) first.set(n, i);
      count.set(n, (count.get(n) || 0) + 1);
    }
  });
  return { first, count };
}
function buildPivot(item, rows, ctx, lc) {
  const who = item.name || "Matrix";
  const spec = normalizeMatrix(item);
  let rg = spec.rowGroups, cg = spec.columnGroups;
  if (rg.length > PIVOT_LIMITS.depth || cg.length > PIVOT_LIMITS.depth) {
    lc.warn(`${who}: more than ${PIVOT_LIMITS.depth} levels of row or column groups; the deeper levels are left out`);
    rg = rg.slice(0, PIVOT_LIMITS.depth);
    cg = cg.slice(0, PIVOT_LIMITS.depth);
  }
  let vals = spec.values;
  if (vals.length > PIVOT_LIMITS.values) {
    lc.warn(`${who}: more than ${PIVOT_LIMITS.values} values; the rest are left out`);
    vals = vals.slice(0, PIVOT_LIMITS.values);
  }
  const R = rg.length, C = cg.length, V = vals.length;
  const rowRoot = buildTree(rg, rows, ctx, lc, who, "r", lc.state);
  const colRoot = buildTree(cg, rows, ctx, lc, who, "c", lc.state);
  const ord = /* @__PURE__ */ new Map();
  const mark = (n) => {
    if (!n.children) {
      for (const r of n.rows) ord.set(r, n.lo);
      return;
    }
    for (const c of n.children) mark(c);
  };
  mark(colRoot);
  let rowsV = visible(rowRoot, rg);
  let colsV = visible(colRoot, cg);
  if (lc.colLimit > 0) {
    let n = 0;
    colsV = colsV.filter((e) => e.kind === "total" || n++ < lc.colLimit);
  }
  if (colsV.length * V > PIVOT_LIMITS.columns) {
    const keep = Math.max(1, Math.floor(PIVOT_LIMITS.columns / V));
    lc.warn(`${who}: ${colsV.length * V} value columns is more than ${PIVOT_LIMITS.columns}; showing the first ${keep * V}`);
    colsV = colsV.slice(0, keep);
  }
  if (rowsV.length * colsV.length * V > PIVOT_LIMITS.cells) {
    const keep = Math.max(1, Math.floor(PIVOT_LIMITS.cells / (colsV.length * V)));
    lc.warn(`${who}: ${rowsV.length * colsV.length * V} cells is more than ${PIVOT_LIMITS.cells}; showing the first ${keep} rows`);
    rowsV = rowsV.slice(0, keep);
  }
  const rs = spans(rowsV), cs = spans(colsV);
  const scopeName = (g, l, axis) => g.name || `${axis === "r" ? "Row" : "Column"}Group${l + 1}`;
  const evalAgg = (expr, cellRows2, scopes) => {
    if (!cellRows2.length) return /^=\s*(Count|CountDistinct|CountRows)\s*\(/i.test(String(expr)) ? 0 : null;
    try {
      return evalValue(expr, { ...ctx, fields: cellRows2[0], aggRows: cellRows2, aggIndex: void 0, scopes });
    } catch (e) {
      lc.warn(`${who}: ${e.message}`);
      return null;
    }
  };
  const baseScopes = { ...ctx.scopes || {}, [who]: { rows, index: -1 } };
  const scopesFor = (re, ce) => {
    var _a, _b;
    const s = { ...baseScopes };
    re.chain.forEach((n, l) => {
      s[scopeName(rg[l], l, "r")] = { rows: n.rows, index: -1, ...n.recRows ? { recRows: n.recRows } : {} };
    });
    ce.chain.forEach((n, l) => {
      s[scopeName(cg[l], l, "c")] = { rows: n.rows, index: -1 };
    });
    for (let l = re.chain.length; l < R; l++) s[_a = scopeName(rg[l], l, "r")] ?? (s[_a] = { rows: re.node.rows, index: -1, recRows: re.node.rows });
    for (let l = ce.chain.length; l < C; l++) s[_b = scopeName(cg[l], l, "c")] ?? (s[_b] = { rows: ce.node.rows, index: -1 });
    return s;
  };
  const clickOf = (o, akey = "action") => {
    const c = {};
    if (o?.[akey]) c.action = o[akey];
    if (akey === "action" && o?.bookmark) c.bookmark = o.bookmark;
    return c.action || c.bookmark ? c : null;
  };
  const headCtx = (n, chain, groups, axis) => {
    const s = { ...baseScopes };
    chain.forEach((m, k) => {
      s[scopeName(groups[k], k, axis)] = { rows: m.rows, index: -1, ...m.recRows ? { recRows: m.recRows } : {} };
    });
    return { ...ctx, fields: n.rows[0] || null, aggRows: n.rows, aggIndex: void 0, scopes: s };
  };
  const withClick = (cell, click, n, chain, groups, axis) => click ? Object.assign(cell, click, { ctx: headCtx(n, chain, groups, axis) }) : cell;
  const isPct = (v) => v.show === "percentOfTotal" || v.show === "percentOfRow" || v.show === "percentOfColumn";
  const denCache = /* @__PURE__ */ new Map();
  const den = (vi, kind, node, scopes) => {
    let m = denCache.get(node);
    if (!m) {
      m = /* @__PURE__ */ new Map();
      denCache.set(node, m);
    }
    const k = `${vi}|${kind}`;
    if (!m.has(k)) m.set(k, evalAgg(vals[vi].value || "=Count(Fields)", node.rows, scopes));
    return m.get(k);
  };
  const cols = [];
  for (const e of colsV) for (let v = 0; v < V; v++) cols.push({ kind: e.kind, level: e.level, node: e.node, v, entry: e });
  const valueRow = V > 1 || C === 0;
  const H = C + (valueRow ? 1 : 0);
  const header = Array.from({ length: H }, () => []);
  if (H && R) {
    const labels = rg.map((g) => g.header).filter((h) => h != null && h !== "");
    if (labels.length && H > 0) {
      if (H > 1) header[0].push({ c: 0, text: item.corner || "", rowSpan: H - 1, colSpan: R, role: "corner" });
      rg.forEach((g, l) => header[H - 1].push({ c: l, text: g.header ?? (l === 0 && H === 1 ? item.corner || "" : ""), rowSpan: 1, colSpan: 1, role: "corner" }));
    } else header[0].push({ c: 0, text: item.corner || "", rowSpan: H, colSpan: R, role: "corner" });
  }
  colsV.forEach((e, j) => {
    const c0 = R + j * V;
    e.chain.forEach((n, l) => {
      if (cs.first.get(n) !== j) return;
      const last = e.kind === "collapsed" && l === e.level;
      header[l].push(withClick({ c: c0, text: n.label, rowSpan: last ? C - l : 1, colSpan: cs.count.get(n) * V, role: "group", level: l, toggle: n.toggle || void 0 }, clickOf(cg[l]), n, e.chain.slice(0, l + 1), cg, "c"));
    });
    if (e.kind === "total") header[e.level].push(withClick({ c: c0, text: cg[e.level].totalLabel ?? "Total", rowSpan: C - e.level, colSpan: V, role: "total", level: e.level }, clickOf(cg[e.level], "totalAction"), e.node, e.chain, cg, "c"));
    if (valueRow) vals.forEach((v, vi) => header[H - 1].push({ c: c0 + vi, text: v.label ?? v.name ?? (C === 0 ? "Value" : ""), rowSpan: 1, colSpan: 1, role: "value" }));
  });
  const body = [];
  const bucketCache = /* @__PURE__ */ new Map();
  const cellRows = (rn, cn) => {
    if (cn === colRoot) return rn.rows;
    if (cn.lo === cn.hi && !cn.children) {
      let b = bucketCache.get(rn);
      if (!b) {
        b = /* @__PURE__ */ new Map();
        for (const r of rn.rows) {
          const o = ord.get(r);
          let a = b.get(o);
          if (!a) {
            a = [];
            b.set(o, a);
          }
          a.push(r);
        }
        bucketCache.set(rn, b);
      }
      return b.get(cn.lo) || [];
    }
    if (rn === rowRoot) return cn.rows;
    const out = [];
    for (const r of rn.rows) {
      const o = ord.get(r);
      if (o >= cn.lo && o <= cn.hi) out.push(r);
    }
    return out;
  };
  rowsV.forEach((re, i) => {
    const cells = [];
    re.chain.forEach((n, l) => {
      if (rs.first.get(n) !== i) return;
      const last = re.kind === "collapsed" && l === re.level;
      cells.push(withClick({ c: l, text: n.label, rowSpan: last ? 1 : rs.count.get(n), colSpan: last ? R - l : 1, role: "rowHeader", level: l, toggle: n.toggle || void 0, ...n.depth ? { indent: n.depth * (Number(rg[l].indent) || 12) } : {} }, clickOf(rg[l]), n, re.chain.slice(0, l + 1), rg, "r"));
    });
    if (re.kind === "total") cells.push(withClick({ c: re.level, text: rg[re.level].totalLabel ?? "Total", rowSpan: 1, colSpan: R - re.level, role: "total", level: re.level }, clickOf(rg[re.level], "totalAction"), re.node, re.chain, rg, "r"));
    const rn = re.node;
    cols.forEach((ce, j) => {
      const v = vals[ce.v];
      const cr = cellRows(rn, ce.node);
      const scopes = scopesFor(re, ce.entry);
      let val = evalAgg(v.value || "=Count(Fields)", cr, scopes);
      if (isPct(v) && val != null) {
        const d = v.show === "percentOfTotal" ? den(ce.v, "t", rowRoot, scopes) : v.show === "percentOfRow" ? den(ce.v, "r", rn, scopes) : den(ce.v, "c", ce.node, scopes);
        val = typeof val === "number" && typeof d === "number" && d !== 0 ? val / d : null;
      }
      let click = clickOf(v);
      let fields = cr[0] || null;
      if (!fields && click?.action) {
        fields = emptyCellFields(re.chain, rg, ce.entry.chain, cg);
        if (!fields) click = click.bookmark ? { bookmark: click.bookmark } : null;
      }
      cells.push({ c: R + j, raw: val, rowSpan: 1, colSpan: 1, role: "value", v: ce.v, colTotal: ce.kind === "total", ctx: { ...ctx, fields, aggRows: cr, aggIndex: void 0, scopes }, ...click || {} });
    });
    body.push({ kind: re.kind, level: re.level, node: rn, cells });
  });
  return { R, C, V, spec: { ...spec, rowGroups: rg, columnGroups: cg, values: vals }, cols, header, body, valueRow, empty: !rows.length };
}

// src/engine/items/hpage.js
var EPS = 0.01;
var MAX_SETS = 200;
function itemLeft(it) {
  if (it.t === "text") return it.clip ? it.clip.x : Math.min(...it.lines.map((l) => l.x));
  if (it.t === "line") return Math.min(it.x1, it.x2);
  if (it.t === "ellipse") return it.cx - it.rx;
  return it.x ?? 0;
}
function itemRight(it) {
  if (it.t === "text") return it.clip ? it.clip.x + it.clip.w : Math.max(...it.lines.map((l) => l.x + (l.w || 0)));
  if (it.t === "line") return Math.max(it.x1, it.x2);
  if (it.t === "ellipse") return it.cx + it.rx;
  return (it.x ?? 0) + (it.w || 0);
}
function clipTo(it, a, b) {
  const l = itemLeft(it), r = itemRight(it);
  if (l >= a - EPS && r <= b + EPS) return it;
  if (it.t === "rect" || it.t === "image" || it.t === "link") {
    const x = Math.max(l, a);
    return { ...it, x, w: Math.max(0, Math.min(r, b) - x) };
  }
  if (it.t === "line") {
    if (it.x1 === it.x2) return it;
    const lo = Math.max(l, a), hi = Math.min(r, b);
    return it.x1 <= it.x2 ? { ...it, x1: lo, x2: hi } : { ...it, x1: hi, x2: lo };
  }
  if (it.t === "text" && it.clip) {
    const dx = Math.max(0, a - it.clip.x);
    const x = it.clip.x + dx;
    return { ...it, lines: it.lines.map((ln) => ({ ...ln, x: ln.x + dx })), clip: { ...it.clip, x, w: Math.max(0, Math.min(r, b) - x) } };
  }
  return it;
}
function sliceColumns(o) {
  const n = o.widths.length;
  const rep = Math.max(0, Math.min(o.repeat | 0, n - 1));
  const repW = o.widths.slice(0, rep).reduce((s, w) => s + w, 0);
  const avail = o.room - repW;
  if (avail <= 1) {
    o.warn(`${o.name}: its repeated columns leave no room on the page`);
    return null;
  }
  const B = Math.max(1, o.block | 0);
  const blocks = [];
  for (let ci = rep; ci < n; ci += B) {
    const to = Math.min(n, ci + B);
    let w = 0;
    for (let c = ci; c < to; c++) {
      w += o.widths[c];
      if (o.widths[c] > avail + EPS) o.warn(`${o.name}: column ${c + 1} is wider than the page, so it is cut`, true);
    }
    blocks.push({ from: ci, to, w });
  }
  let sets = [];
  for (const b of blocks) {
    const last = sets[sets.length - 1];
    if (last && last.w + b.w <= avail + EPS) {
      last.to = b.to;
      last.w += b.w;
      continue;
    }
    sets.push({ from: b.from, to: b.to, w: b.w });
  }
  const k = sets.length;
  if (k >= 2) {
    const base = Math.floor(blocks.length / k), extra = blocks.length % k;
    const even = [];
    let at = 0;
    for (let p = 0; p < k; p++) {
      const part2 = blocks.slice(at, at + base + (p < extra ? 1 : 0));
      at += part2.length;
      even.push({ from: part2[0].from, to: part2[part2.length - 1].to, w: part2.reduce((s, b) => s + b.w, 0) });
    }
    if (even.every((s) => s.w <= avail + EPS)) sets = even;
  }
  if (sets.length < 2) return null;
  if (sets.length > MAX_SETS) {
    o.warn(`${o.name}: its columns would fill more than ${MAX_SETS} pages across; the rest are left out`, true);
    sets.length = MAX_SETS;
  }
  const right = o.colX[n - 1] + o.widths[n - 1];
  for (const s of sets) {
    s.a = o.colX[s.from];
    s.b = s.to < n ? o.colX[s.to] : right;
    s.dx = o.x + repW - s.a;
    s.cols = [...o.widths.slice(0, rep), ...o.widths.slice(s.from, s.to)];
  }
  const repEnd = rep ? o.colX[rep] : o.x;
  const colAt = (x) => {
    let lo = 0, hi = n - 1;
    while (lo < hi) {
      const mid = lo + hi + 1 >> 1;
      if (o.colX[mid] <= x + EPS) lo = mid;
      else hi = mid - 1;
    }
    return lo;
  };
  const setOf = new Int32Array(n);
  setOf.fill(-1);
  sets.forEach((s, k2) => {
    for (let ci = s.from; ci < s.to; ci++) setOf[ci] = k2;
  });
  const bucketsOf = (items) => {
    const rep0 = [], by = sets.map(() => []);
    for (const it of items) {
      const l = itemLeft(it);
      if (l < repEnd - EPS) {
        rep0.push(it);
        continue;
      }
      const r = Math.max(l, itemRight(it));
      const k0 = Math.max(0, setOf[colAt(l)]), k1 = Math.max(k0, setOf[colAt(Math.max(l, r - EPS * 2))]);
      for (let k2 = k0; k2 <= k1; k2++) by[k2].push(it);
    }
    return { rep0, by };
  };
  const cache2 = /* @__PURE__ */ new WeakMap();
  const slice = (items, s, k2) => {
    let b = cache2.get(items);
    if (!b) {
      b = bucketsOf(items);
      cache2.set(items, b);
    }
    const out2 = [...b.rep0];
    for (const it of b.by[k2]) {
      const l = itemLeft(it);
      const r = Math.max(l, itemRight(it));
      if (r <= s.a + EPS || l >= s.b - EPS) continue;
      let c = clipTo(it, s.a, s.b);
      if (c.t === "text" && c.cell) {
        const col = c.cell.col < rep ? c.cell.col : Math.max(rep, colAt(c.clip?.x ?? l) - s.from + rep);
        c = { ...c, cell: { ...c.cell, col, span: Math.max(1, Math.min(c.cell.span || 1, s.cols.length - col)), cols: s.cols } };
      }
      out2.push(...shiftItems([c], s.dx, 0));
    }
    return out2;
  };
  const out = [];
  let y = 0;
  const emit = (u, s, k2, first) => {
    const si = sets.indexOf(s);
    const c = { ...u, top: y, items: slice(u.items, s, si), x0: o.x, x1: o.x + repW + s.w };
    if (u.cont) c.cont = slice(u.cont, s, si);
    if (u.block) c.block = `${u.block}#${k2}`;
    if (si > 0 && c.sectionStart) delete c.sectionStart;
    if (si > 0) delete c.grp;
    if (first) c.breakBefore = true;
    out.push(c);
    y += u.height;
  };
  const tables = [];
  const head = o.units.slice(0, o.headerCount), rest = o.units.slice(o.headerCount);
  if (o.order === "across") {
    const cap = Math.max(1, o.pageH - o.headerHeight);
    const blocks2 = [];
    let cur = [], h = 0;
    for (const u of rest) {
      if (cur.length && h + u.height > cap + EPS) {
        blocks2.push(cur);
        cur = [];
        h = 0;
      }
      cur.push(u);
      h += u.height;
    }
    if (cur.length || !blocks2.length) blocks2.push(cur);
    let k2 = 0;
    for (const b of blocks2) {
      for (const s of sets) {
        k2++;
        [...head, ...b].forEach((u, i) => emit({ ...u, keepWithNext: i < head.length || u.keepWithNext }, s, k2, i === 0));
      }
    }
  } else {
    const chunks = [[]];
    const gridId = o.nextId();
    rest.forEach((u, i) => {
      if (i > 0 && u.sectionStart) chunks.push([]);
      chunks[chunks.length - 1].push(u);
    });
    chunks.forEach((chunk, ch) => sets.forEach((s, k2) => {
      const top = y;
      const brk = k2 > 0 || ch > 0;
      const opens = chunk[0]?.sectionStart && k2 === 0;
      head.forEach((u, i) => emit(i === 0 && opens ? { ...u, sectionStart: true } : u, s, k2, i === 0 && brk));
      const headerItems = [];
      for (const u of out.slice(out.length - head.length)) for (const it of o.shiftLocal(u.items.filter((i) => i.t !== "link" && i.t !== "bookmark"), u.top - top)) headerItems.push(it);
      const gid = `${gridId}|${ch}`;
      chunk.forEach((u, i) => emit({ ...i === 0 && head.length ? { ...u, breakBefore: false, sectionStart: false } : u, hgrid: { id: gid, row: i, set: k2 } }, s, k2, i === 0 && brk && !head.length));
      if (o.repeatHeader && o.headerHeight) tables.push({ id: o.nextId(), headerHeight: o.headerHeight, headerItems, x: o.x, x0: o.x, x1: o.x + repW + s.w, top, bottom: y });
    }));
  }
  return { height: y, units: out, tables, width: repW + Math.max(...sets.map((s) => s.w)) };
}

// src/engine/items/cells.js
function rowCells(cells, ncols) {
  const list = Array.isArray(cells) ? cells : [];
  const span = (c) => Math.max(1, Math.floor(Number(c?.colSpan)) || 1);
  const at = new Array(ncols).fill(null);
  const covered = [];
  if (list.length < ncols && list.some((c) => span(c) > 1)) {
    let pos = 0;
    for (const c of list) {
      if (pos >= ncols) break;
      at[pos] = c ?? null;
      pos += span(c);
    }
    return { at, covered };
  }
  let until = -1, by = -1;
  for (let k = 0; k < Math.min(list.length, ncols); k++) {
    const c = list[k];
    if (k <= until) {
      if (c) covered.push([k, by]);
      continue;
    }
    at[k] = c ?? null;
    if (span(c) > 1) {
      until = k + span(c) - 1;
      by = k;
    }
  }
  return { at, covered };
}

// src/engine/items/index.js
var ROW_CHARTS = /* @__PURE__ */ new Set(["scatter", "bubble", "polar"]);
var MORE_CHARTS = /* @__PURE__ */ new Set(["treemap", "histogram", "boxplot", "waterfall", "gantt"]);
var AXIS_CHARTS = /* @__PURE__ */ new Set(["column", "bar", "line", "area", "candlestick", "ohlc"]);
var ITEMS = {};
var GROW_TOLERANCE = 1;
var DATA_ONLY_TL = Object.freeze({ lines: Object.freeze([]), needed: 0, lh: 1, pad: [0, 0, 0, 0], size: 0, key: "", inner: 0 });
function register(type, spec) {
  ITEMS[type] = { type, ...spec };
}
var ALT = { key: "alt", label: "Alternative text (screen readers: accessible PDF, Word)", type: "text", category: "Accessibility" };
function evalSafe(v, ctx, lc, who) {
  try {
    return { v: evalValue(v, ctx) };
  } catch (e) {
    lc.warn(`${who}: ${e.message}`);
    return { v: "#Error", err: true };
  }
}
var SIBS = /* @__PURE__ */ new WeakMap();
var sibRows = (sibs) => {
  let r = SIBS.get(sibs);
  if (!r) SIBS.set(sibs, r = sibs.map((b) => b.rows));
  return r;
};
function textOf(raw, st, ctx, lc) {
  if (typeof raw === "string") return raw;
  if (raw == null && st.nullText != null) return String(st.nullText);
  try {
    return toText(raw, st.format, ctx);
  } catch (e) {
    if (!(e instanceof ExprError)) throw e;
    lc?.warn(e.message);
    return "#Error";
  }
}
function hidden(item, ctx, lc) {
  let h = false;
  if (item.hidden === true) h = true;
  else if (item.hidden != null && item.hidden !== false && item.hidden !== "") {
    const r = evalSafe(item.hidden, ctx, lc, item.name || item.type);
    h = !r.err && truthy(r.v);
  }
  return item.name && lc.state?.toggles?.[`item:${item.name || item.type}`] ? !h : h;
}
var SHRINK_DEFAULTS = { minFontSize: 4, step: 0.5 };
function rotationOf(item) {
  const a = ((Number(item.rotate) || 0) % 360 + 360) % 360;
  if (!a) return null;
  return { a, swap: a === 90 || a === 270 };
}
function paintTextbox(item, lc, ctx, forcedH) {
  let st = resolveStyle([lc.base, lc.named?.[item.styleName], item.style], ctx);
  const r = evalSafe(item.value ?? "", ctx, lc, item.name || "TextBox");
  const text = textOf(r.v, st, ctx, lc);
  const rot = rotationOf(item);
  const layoutW = rot?.swap ? item.h : item.w, layoutH = rot?.swap ? item.w : item.h;
  let tl = layoutTextLines(text, st, layoutW, lc.m);
  const size0 = Number(st.fontSize) || 9;
  const shrink = (min, fits, step3) => {
    const steps = Number.isFinite(size0) ? Math.max(0, Math.floor((size0 - min) / step3 + 1e-9)) : 0;
    const at = (i) => {
      const s2 = { ...st, fontSize: Math.max(min, size0 - step3 * (i + 1)) };
      return { s2, t2: layoutTextLines(text, s2, layoutW, lc.m) };
    };
    let lo = 0, hi = steps - 1, best = null;
    while (lo <= hi) {
      const mid = Math.floor((lo + hi) / 2);
      const c = at(mid);
      if (fits(c.t2)) {
        best = c;
        hi = mid - 1;
      } else lo = mid + 1;
    }
    return { best, last: steps > 0 ? () => at(steps - 1) : null };
  };
  const fitsBox = (t) => t.needed <= layoutH + GROW_TOLERANCE;
  if (item.shrinkToFit && !fitsBox(tl)) {
    const min = Math.max(1, Number(item.minFontSize) || SHRINK_DEFAULTS.minFontSize);
    const asked = Number(item.shrinkStep) > 0 ? Number(item.shrinkStep) : SHRINK_DEFAULTS.step;
    const r23 = shrink(min, fitsBox, Math.max(asked, 0.05, (size0 - min) / 4096));
    const best = r23.best || r23.last?.();
    if (best) {
      st = best.s2;
      tl = best.t2;
    }
  } else if (!item.shrinkToFit && !rot && forcedH == null && String(text).length <= 80 && tl.lines.length > 1) {
    const fixed2 = item.canGrow === false && !fitsBox(tl);
    const oneLine = !fixed2 && layoutH < 2 * tl.lh + tl.pad[0] + tl.pad[2] - GROW_TOLERANCE;
    if (fixed2 || oneLine) {
      const { best } = shrink(Math.max(SHRINK_DEFAULTS.minFontSize, size0 * (fixed2 ? 0.5 : 0.85)), fixed2 ? fitsBox : (t) => t.lines.length === 1, 0.25);
      if (best) {
        st = best.s2;
        tl = best.t2;
      }
    }
  }
  let h = item.h;
  if (forcedH == null) {
    if (item.canGrow !== false && !item.shrinkToFit && !rot && tl.needed > h + GROW_TOLERANCE) h = tl.needed;
    if (item.canShrink && !rot && tl.needed < h) h = tl.needed;
  } else h = forcedH;
  return { st, tl, h, numeric: typeof r.v === "number", rot, text };
}
register("textbox", {
  label: "Text box",
  defaults: () => ({ type: "textbox", w: 144, h: 18, value: "Text", canGrow: true, canShrink: false, style: {} }),
  props: [
    { key: "value", label: "Value", type: "expr", category: "Data" },
    { key: "dataSet", label: "Data set", type: "dataset", category: "Data" },
    { key: "styleName", label: "Named style", type: "stylename", category: "Text" },
    { key: "canGrow", label: "Can grow", type: "bool", category: "Layout" },
    { key: "canShrink", label: "Can shrink", type: "bool", category: "Layout" },
    { key: "shrinkToFit", label: "Shrink text to fit", type: "bool", category: "Layout" },
    { key: "minFontSize", label: "Shrink no smaller than (pt, default 4)", type: "number", category: "Layout" },
    { key: "shrinkStep", label: "Shrink step (pt, default 0.5)", type: "number", category: "Layout" },
    { key: "rotate", label: "Rotate (degrees clockwise)", type: "number", category: "Layout" },
    { key: "headingLevel", label: "Heading level (1–6, for a table of contents)", type: "select", number: true, options: ["1", "2", "3", "4", "5", "6"], category: "Interactivity" },
    { key: "pageBreakBefore", label: "Page break before", type: "bool", category: "Layout" },
    { key: "pageBreakAfter", label: "Page break after", type: "bool", category: "Layout" },
    { key: "hidden", label: "Hidden", type: "expr", category: "Visibility" },
    { key: "bookmark", label: "Bookmark (document map)", type: "expr", category: "Interactivity" },
    { key: "action", label: "Action", type: "action", category: "Interactivity" },
    { key: "tooltip", label: "Tooltip (hover text)", type: "expr", category: "Interactivity" }
  ],
  layout(item, lc) {
    const ctx = lc.ctxFor(item);
    if (hidden(item, ctx, lc)) return { height: 0, units: [] };
    const { st, tl, h: h0, numeric, rot, text } = paintTextbox(item, lc, ctx, lc.fixed ? item.h : null);
    if (st.writingMode === "tb-rl") {
      const items2 = paintVertical({ x: item.x, y: 0, w: item.w, h: item.h, st, text, m: lc.m });
      addInteractivity(items2, item, ctx, lc, { x: item.x, y: 0, w: item.w, h: item.h }, text);
      return { height: item.h, units: [{ top: 0, height: item.h, items: items2 }] };
    }
    const h = h0;
    if (!rot && !lc.fixed && h > lc.maxUnitHeight && tl.lines.length > 1) {
      const per = Math.max(1, Math.floor((lc.maxUnitHeight - tl.pad[0] - tl.pad[2]) / tl.lh));
      const units = [];
      for (let i = 0, top = 0; i < tl.lines.length; i += per) {
        const lines = tl.lines.slice(i, i + per);
        const ch = lines.length * tl.lh + tl.pad[0] + tl.pad[2];
        units.push({ top, height: ch, items: paintBox({ x: item.x, y: 0, w: item.w, h: ch, st, tl: { ...tl, lines }, numeric, m: lc.m }) });
        top += ch;
      }
      return { height: units.reduce((s, u) => s + u.height, 0), units };
    }
    let items;
    if (rot) {
      const cx = item.x + item.w / 2, cy = h / 2;
      const bw = rot.swap ? h : item.w, bh = rot.swap ? item.w : h;
      items = paintBox({ x: cx - bw / 2, y: cy - bh / 2, w: bw, h: bh, st, tl, numeric, m: lc.m }).map((i) => ({ ...i, rotate: { a: rot.a, cx, cy } }));
    } else items = paintBox({ x: item.x, y: 0, w: item.w, h, st, tl, numeric, m: lc.m });
    addInteractivity(items, item, ctx, lc, { x: item.x, y: 0, w: item.w, h }, text);
    return { height: h, units: [{ top: 0, height: h, items }] };
  }
});
register("richtext", {
  label: "Rich text",
  defaults: () => ({ type: "richtext", w: 240, h: 48, value: "<p>Rich <b>text</b> with <i>styles</i> and {Globals.PageNumber}</p>", canGrow: true, style: {} }),
  props: [
    { key: "value", label: "HTML (p, b, i, u, s, sup, sub, br, ul/ol/li, a, h1–h6, span style; {Fields.x})", type: "html", category: "Data" },
    { key: "htmlFromData", label: "Field values are HTML (trusted data only)", type: "bool", category: "Data" },
    { key: "dataSet", label: "Data set", type: "dataset", category: "Data" },
    { key: "styleName", label: "Named style", type: "stylename", category: "Text" },
    { key: "canGrow", label: "Can grow", type: "bool", category: "Layout" },
    { key: "canShrink", label: "Can shrink", type: "bool", category: "Layout" },
    { key: "listIndent", label: "List indent (pt, default 18)", type: "number", category: "Layout" },
    { key: "paragraphSpacing", label: "Space after paragraphs (pt, default 4)", type: "number", category: "Layout" },
    { key: "pageBreakBefore", label: "Page break before", type: "bool", category: "Layout" },
    { key: "pageBreakAfter", label: "Page break after", type: "bool", category: "Layout" },
    { key: "hidden", label: "Hidden", type: "expr", category: "Visibility" },
    { key: "bookmark", label: "Bookmark (document map)", type: "expr", category: "Interactivity" },
    { key: "action", label: "Action", type: "action", category: "Interactivity" },
    { key: "tooltip", label: "Tooltip (hover text)", type: "expr", category: "Interactivity" }
  ],
  layout(item, lc) {
    const ctx = lc.ctxFor(item);
    if (hidden(item, ctx, lc)) return { height: 0, units: [] };
    const who = item.name || "Rich text";
    const st = resolveStyle([lc.base, lc.named?.[item.styleName], item.style], ctx);
    let html;
    try {
      html = richValue(item.value ?? "", ctx, item.htmlFromData === true);
    } catch (e) {
      lc.warn(`${who}: ${e.message}`);
      html = "#Error";
    }
    const { blocks } = parseRich(html, { baseSize: Number(st.fontSize) || 9, warn: (msg) => lc.warn(`${who}: ${msg}`) });
    const rl = layoutRich(blocks, st, item.w, lc.m, { listIndent: item.listIndent, paragraphSpacing: item.paragraphSpacing, maxLineHeight: lc.maxUnitHeight - padding(st)[0] - padding(st)[2], warn: (msg) => lc.warn(`${who}: ${msg}`) });
    let h = item.h;
    if (!lc.fixed) {
      if (item.canGrow !== false && rl.needed > h + GROW_TOLERANCE) h = rl.needed;
      if (item.canShrink && rl.needed < h) h = rl.needed;
    }
    const id = `${who}:${lc.nextId?.() ?? 0}`;
    const pv = rl.pad[0] + rl.pad[2];
    if (!lc.fixed && h > lc.maxUnitHeight && rl.lines.length > 1) {
      const units = [];
      let top = 0, start = 0;
      while (start < rl.lines.length) {
        let end = start, ch = pv;
        while (end < rl.lines.length && (end === start || ch + rl.lines[end].h <= lc.maxUnitHeight)) {
          ch += rl.lines[end].h + rl.lines[end].gap;
          end++;
        }
        const lines = rl.lines.slice(start, end);
        ch -= lines[lines.length - 1].gap;
        const items2 = paintRich({ x: item.x, y: 0, w: item.w, h: ch, st, rl: { ...rl, lines }, m: lc.m, id: `${id}:${start}` });
        if (!start) addInteractivity(items2, item, ctx, lc, { x: item.x, y: 0, w: item.w, h: ch });
        units.push({ top, height: ch, items: items2 });
        top += ch;
        start = end;
      }
      return { height: top, units };
    }
    const items = paintRich({ x: item.x, y: 0, w: item.w, h, st, rl, m: lc.m, id });
    addInteractivity(items, item, ctx, lc, { x: item.x, y: 0, w: item.w, h });
    return { height: h, units: [{ top: 0, height: h, items }] };
  }
});
function addInteractivity(items, item, ctx, lc, rect, heading) {
  const link = lc.linkFor?.(item, ctx, rect);
  if (link) items.push(link);
  const hl = Number(item.headingLevel);
  if (heading && hl >= 1 && hl <= 6) items.push({ t: "bookmark", heading: true, label: String(heading).replace(/\s+/g, " ").trim(), x: rect.x, y: rect.y, level: hl - 1 });
  if (item.bookmark) {
    const b = evalSafe(item.bookmark, ctx, lc, `${item.name || item.type} bookmark`).v;
    if (b != null && b !== "" && b !== "#Error") items.push({ t: "bookmark", label: String(b), x: rect.x, y: rect.y, level: item.bookmarkLevel ?? (hl >= 1 && hl <= 6 ? hl - 1 : 0) });
  }
}
register("image", {
  label: "Image",
  defaults: () => ({ type: "image", w: 96, h: 64, src: "", fit: "contain", style: {} }),
  props: [
    { key: "src", label: "Source (URL, data URI, embedded:name, or a field with base64 or bytes)", type: "expr", category: "Data" },
    { key: "dataSet", label: "Data set", type: "dataset", category: "Data" },
    { key: "fit", label: "Fit", type: "select", options: ["contain", "cover", "fill", "clip"], category: "Layout" },
    { key: "autoSize", label: "Size to the image (96 dpi)", type: "bool", category: "Layout" },
    ALT,
    { key: "hidden", label: "Hidden", type: "expr", category: "Visibility" }
  ],
  layout(item, lc) {
    const ctx = lc.ctxFor(item);
    if (hidden(item, ctx, lc)) return { height: 0, units: [] };
    const st = resolveStyle([lc.base, lc.named?.[item.styleName], item.style], ctx);
    const who = item.name || "Image";
    const src = resolveImageSrc(evalSafe(item.src ?? "", ctx, lc, who).v, who, { images: lc.images, budget: lc.imageBudget, warn: lc.warn });
    let w = item.w, h = item.h, fit = ["contain", "cover", "fill", "clip"].includes(item.fit) ? item.fit : "contain";
    const info = src && (item.autoSize || fit === "clip") ? imageInfo(src) : null;
    const nat = info && "w" in info && info.w > 0 && info.h > 0 ? { w: info.w * PX, h: info.h * PX } : null;
    if (src && (item.autoSize || fit === "clip") && !nat) {
      lc.warn(`${who}: the image's size is not known before it loads, so it is fitted inside the box`);
      fit = "contain";
    }
    if (item.autoSize && nat) {
      w = nat.w;
      h = nat.h;
      if (fit === "clip") fit = "fill";
    }
    const items = paintBox({ x: item.x, y: 0, w, h, st, tl: null, m: lc.m });
    const img = fit === "clip" && nat ? { t: "image", x: item.x, y: 0, w: nat.w, h: nat.h, cw: w, ch: h, src, fit } : { t: "image", x: item.x, y: 0, w, h, src, fit };
    if (src) items.splice((st.backgroundColor ? 1 : 0) + (st.backgroundImage ? 1 : 0), 0, img);
    return { height: h, units: [{ top: 0, height: h, items }] };
  }
});
register("line", {
  label: "Line",
  defaults: () => ({ type: "line", w: 144, h: 0, direction: "down", style: { stroke: "#1f2328", strokeWidth: 1 } }),
  props: [
    { key: "direction", label: "Direction", type: "select", options: ["down", "up"], category: "Layout" },
    ALT,
    { key: "hidden", label: "Hidden", type: "expr", category: "Visibility" }
  ],
  styleProps: ["stroke", "strokeWidth", "strokeDash"],
  layout(item, lc) {
    const ctx = lc.ctxFor(item);
    if (hidden(item, ctx, lc)) return { height: 0, units: [] };
    const st = resolveStyle([lc.base, lc.named?.[item.styleName], item.style], ctx);
    const up = item.direction === "up";
    const sw = Number(st.strokeWidth) || 1;
    const dash = st.strokeDash === "dashed" ? [4, 3] : st.strokeDash === "dotted" ? [1, 2] : null;
    return {
      height: Math.max(item.h, sw),
      units: [{ top: 0, height: Math.max(item.h, sw), items: [{ t: "line", x1: item.x, y1: up ? item.h : 0, x2: item.x + item.w, y2: up ? 0 : item.h, stroke: st.stroke || "#000", strokeWidth: sw, dash }] }]
    };
  }
});
register("shape", {
  label: "Shape",
  defaults: () => ({ type: "shape", shape: "rect", w: 96, h: 48, style: { fill: "#eef2ff", stroke: "#4f46e5", strokeWidth: 1, radius: 4 } }),
  props: [
    { key: "shape", label: "Shape", type: "select", options: ["rect", "ellipse"], category: "Layout" },
    ALT,
    { key: "hidden", label: "Hidden", type: "expr", category: "Visibility" }
  ],
  styleProps: ["fill", "stroke", "strokeWidth", "strokeDash", "radius"],
  layout(item, lc) {
    const ctx = lc.ctxFor(item);
    if (hidden(item, ctx, lc)) return { height: 0, units: [] };
    const st = resolveStyle([lc.base, lc.named?.[item.styleName], item.style], ctx);
    const sw = st.stroke && st.stroke !== "none" ? Number(st.strokeWidth) || 0 : 0;
    const dash = st.strokeDash === "dashed" ? [4, 3] : st.strokeDash === "dotted" ? [1, 2] : null;
    const shape = item.shape === "ellipse" ? { t: "ellipse", cx: item.x + item.w / 2, cy: item.h / 2, rx: item.w / 2, ry: item.h / 2, fill: st.fill || null, stroke: sw ? st.stroke : null, strokeWidth: sw, dash } : { t: "rect", x: item.x, y: 0, w: item.w, h: item.h, fill: st.fill || null, stroke: sw ? st.stroke : null, strokeWidth: sw, radius: Number(st.radius) || 0, dash };
    return { height: item.h, units: [{ top: 0, height: item.h, items: [shape] }] };
  }
});
var OVERFLOW_OPTIONS = [{ value: "paginate", label: "Continue on the next pages" }, { value: "shrink", label: "Narrow the columns" }, { value: "clip", label: "Cut at the page edge" }];
var FIT_ROWS = 50;
function fitColumns(item, cols, rows, tctx, lc) {
  const auto = cols.map((c) => !!item.fitColumns || c.width == null);
  const nat = cols.map(() => 0);
  const measure = (row, ctx) => {
    const rst = resolveStyle([lc.base, lc.named?.[item.styleName], item.style, row.style], ctx);
    const { at } = rowCells(row.cells, cols.length);
    for (let ci = 0; ci < cols.length; ci++) {
      const cell = at[ci];
      if (!auto[ci] || !cell || (cell.colSpan || 1) > 1 || cell.item) continue;
      let v;
      try {
        v = evalValue(cell.value ?? "", ctx);
      } catch {
        continue;
      }
      const st = resolveStyle([rst, lc.named?.[cell.styleName], cell.style], ctx);
      const tl = layoutTextLines(textOf(v, st, ctx, lc), st, 1e6, lc.m, { wrap: false });
      const w = Math.max(0, ...tl.lines.map((l) => l.width)) + tl.pad[1] + tl.pad[3];
      if (w > nat[ci]) nat[ci] = w;
    }
  };
  const base = { ...tctx, aggRows: rows, fields: rows[0] || null };
  for (const r of item.header || []) measure(r, base);
  for (const r of item.footer || []) measure(r, base);
  const n = Math.min(rows.length, FIT_ROWS);
  for (let i = 0; i < n; i++) for (const r of item.detail || []) measure(r, { ...base, fields: rows[i], aggIndex: i });
  const total = item.fitColumns ? cols.reduce((t, c) => t + (Number(c.width) || 0), 0) || Number(item.w) || 0 : Number(item.w) || 0;
  const fixed2 = cols.reduce((t, c, i) => t + (auto[i] ? 0 : Number(c.width) || 0), 0);
  const room = Math.max(0, total - fixed2);
  const want = nat.reduce((t, w, i) => t + (auto[i] ? Math.max(w, 1) : 0), 0);
  return cols.map((c, i) => auto[i] ? { ...c, width: room * Math.max(nat[i], 1) / want } : c);
}
register("table", {
  label: "Table",
  defaults: () => ({
    type: "table",
    w: 360,
    h: 54,
    dataSet: null,
    repeatHeader: true,
    noRowsText: "No rows",
    columns: [{ width: 120 }, { width: 120 }, { width: 120 }],
    header: [{ height: 18, style: { fontWeight: "bold", backgroundColor: "#f1f3f5", borderBottom: "1 solid #adb5bd" }, cells: [{ value: "Column 1" }, { value: "Column 2" }, { value: "Column 3" }] }],
    groups: [],
    detail: [{ height: 18, style: { borderBottom: "0.5 solid #dee2e6" }, cells: [{ value: "" }, { value: "" }, { value: "" }] }],
    footer: [],
    style: { padding: [3, 4, 3, 4] }
  }),
  props: [
    { key: "dataSet", label: "Data set", type: "dataset", category: "Data" },
    { key: "repeatHeader", label: "Repeat header on each page", type: "bool", category: "Layout" },
    { key: "fitColumns", label: "Column widths from the content", type: "bool", category: "Layout" },
    { key: "printAtBottom", label: "Footer at the bottom of the page", type: "bool", category: "Layout" },
    { key: "overflowTo", label: "Fixed frame: continue rows in", labelKey: "overflowTo", type: "overflowTarget", category: "Layout" },
    { key: "overflow", label: "Wider than the page", type: "select", options: OVERFLOW_OPTIONS, category: "Layout" },
    { key: "repeatColumns", label: "Columns repeated on each page set", type: "number", category: "Layout", showIf: (it) => (it.overflow || "paginate") === "paginate" },
    { key: "pageOrder", label: "Page order", type: "select", options: [{ value: "down", label: "Down, then across" }, { value: "across", label: "Across, then down" }], category: "Layout", showIf: (it) => (it.overflow || "paginate") === "paginate" },
    { key: "noRowsText", label: "Text when no rows", type: "text", category: "Data" },
    { key: "bookmark", label: "Bookmark (document map)", type: "expr", category: "Interactivity" },
    { key: "pageBreakBefore", label: "Page break before", type: "bool", category: "Layout" },
    { key: "pageBreakAfter", label: "Page break after", type: "bool", category: "Layout" },
    { key: "hidden", label: "Hidden", type: "expr", category: "Visibility" }
  ],
  layout(item, lc) {
    const tctx = item.__ctx || lc.ctxFor(item);
    if (hidden(item, tctx, lc)) return { height: 0, units: [] };
    let rows;
    if (item.__body) rows = item.__rows || [];
    else {
      rows = item.dataSet && lc.dataSets[item.dataSet] || [];
      rows = related(rows, tctx);
      if (item.dataSet && !lc.dataSets[item.dataSet]) lc.warn(`${item.name || item.type}: the data set "${item.dataSet}" does not exist`);
      if (item.filters?.length) rows = applyFilters(rows, item.filters, tctx);
      const sort = lc.state?.sort?.[item.name] || item.sort;
      if (sort?.length) rows = applySort(rows, sort, tctx);
    }
    let cols = item.columns || [];
    if (!item.__body && cols.length && (item.fitColumns || cols.some((c) => c.width == null))) cols = fitColumns(item, cols, rows, tctx, lc);
    const room = (lc.bodyWidth ?? Infinity) - item.x;
    const designedW = cols.reduce((s, c) => s + (Number(c.width) || 0), 0);
    const overflow = designedW > room + 1 ? (
      // under 1pt over: a hairline, kept as it was
      ["shrink", "clip", "paginate"].includes(item.overflow) ? item.overflow : "paginate"
    ) : null;
    if (overflow === "shrink" && room > 0) {
      const k = room / designedW;
      cols = cols.map((c) => ({ ...c, width: (Number(c.width) || 0) * k }));
      lc.warn(`${item.name || item.type}: its columns are ${Math.round(designedW)}pt wide, wider than the page (${Math.round(room)}pt), so they are narrowed to fit`);
    } else if (overflow === "clip" || overflow === "paginate" && lc.fixed) {
      lc.warn(`${item.name || item.type}: its columns are ${Math.round(designedW)}pt wide, wider than the page (${Math.round(room)}pt), so the columns past the page edge are cut`, true);
    } else if (overflow === "paginate" && item.overflow !== "paginate") {
      lc.warn(`${item.name || item.type}: its columns are ${Math.round(designedW)}pt wide, wider than the page (${Math.round(room)}pt), so they continue on the next pages`);
    }
    const colX = [];
    let acc = item.x;
    for (const c of cols) {
      colX.push(acc);
      acc += c.width;
    }
    const width = acc - item.x;
    const region = { name: item.name, columns: cols.map((c) => c.width), rows: [] };
    if (lc.tablesSeen) lc.tablesSeen.n++;
    const tableScope = { rows, index: -1, run: [] };
    const scopes = { ...tctx.scopes || {}, [item.name]: tableScope };
    const groupChains = {};
    (item.groups || []).forEach((g, i) => {
      if (g.name) groupChains[g.name] = { rows, keys: item.groups.slice(0, i + 1).map((x) => x.expr) };
    });
    const base = { ...tctx, aggRows: rows, aggIndex: void 0, fields: lc.win?.first || rows[0] || null, scopes, region: tableScope, group: void 0, groupChains: { ...tctx.groupChains || {}, ...groupChains } };
    const units = [];
    let y = 0;
    let repeatH = 0;
    let rowSeq = 0;
    const colWidths = cols.map((c) => c.width);
    const colIdx = colX.map((x) => colX.indexOf(x));
    const regionCell = (c) => {
      const o = { col: Math.round((c.x - item.x) * 100), value: c.raw instanceof Date || typeof c.raw === "boolean" ? c.raw : typeof c.raw === "number" ? roundFor(c.raw, c.st.format) : c.plain, format: c.st.format || null, bold: c.st.fontWeight === "bold" || Number(c.st.fontWeight) >= 600, span: c.span, colIndex: c.ci != null ? colIdx[c.ci] : colX.indexOf(c.x) };
      if (c.left > 1) o.rowSpan = c.left;
      return o;
    };
    let openSpans = [];
    const cover = new Array(cols.length).fill(null);
    const covered = (ci) => cover[ci] !== null;
    const cellsAt = /* @__PURE__ */ new WeakMap();
    const layRow = (row, ctx, kind, extra) => {
      if (row.hidden != null && row.hidden !== false && row.hidden !== "" && hidden({ hidden: row.hidden, name: `${item.name || item.type} row` }, ctx, lc)) {
        if (openSpans.length) {
          for (const s of openSpans) s.left--;
          for (const s of openSpans) if (s.left <= 0) closeSpan(s);
          openSpans = openSpans.filter((s) => s.left > 0);
        }
        return null;
      }
      const rst = resolveStyle([lc.base, lc.named?.[item.styleName], item.style, lc.named?.[row.styleName], row.style], ctx);
      const cells = [];
      let started = null;
      let need = row.height || 18;
      let at = cellsAt.get(row);
      if (!at) cellsAt.set(row, at = rowCells(row.cells, cols.length).at);
      for (let ci = 0; ci < cols.length; ci++) {
        const cell = at[ci];
        if (!cell || covered(ci)) continue;
        const span = Math.max(1, Math.min(cell.colSpan || 1, cols.length - ci));
        let cw = 0;
        for (let k = 0; k < span; k++) cw += cols[ci + k].width;
        const cctx = cell.ctx || ctx;
        let st = resolveStyle([rst, lc.named?.[cell.styleName], cell.style], cctx);
        if (ctx.indent > 0 && !cells.length && !started) {
          const pd = padding(st);
          st = { ...st, padding: [pd[0], pd[1], pd[2], pd[3] + ctx.indent] };
        } else if (cell.indent > 0) {
          const pd = padding(st);
          st = { ...st, padding: [pd[0], pd[1], pd[2], pd[3] + Math.min(Number(cell.indent), cw / 2)] };
        }
        let v;
        if ("raw" in cell) v = cell.raw;
        else try {
          v = evalValue(cell.value ?? "", cctx);
        } catch (e) {
          lc.warn(`${item.name || item.type} cell: ${e.message}`);
          v = "#Error";
        }
        let text = textOf(v, st, cctx, lc);
        const plain2 = text;
        const toggle = cell.toggle || (extra?.toggle && ci === 0 ? extra.toggle : null);
        if (toggle) text = `${toggle.open ? "▼" : "▶"} ${text}`;
        if (cell.sortBy && kind === "header") {
          const cur = (lc.state?.sort?.[item.name] || [])[0];
          if (cur && cur.by === cell.sortBy) text += cur.dir === "desc" ? " ↓" : " ↑";
        }
        const nested = cell.item?.type && ITEMS[cell.item.type] ? layoutInCell(cell.item, colX[ci], cw, st, cctx, row) : null;
        const tl = lc.dataOnly ? DATA_ONLY_TL : nested ? { ...layoutTextLines("", st, cw, lc.m), lines: [], needed: nested.height } : layoutTextLines(text, st, cw, lc.m, { atom: !toggle && (typeof v === "number" || v instanceof Date) });
        const c = { x: colX[ci], w: cw, st, tl, numeric: typeof v === "number", cell, ctx: cctx, raw: v, span, plain: nested ? "" : plain2, toggle, nested, ci };
        const rs = Math.floor(Number(cell.rowSpan)) || 1;
        if (rs > 1) {
          (started || (started = [])).push({ ...c, ci, cols: span, left: rs, units: [], kind, level: extra?.level });
          continue;
        }
        if ((row.canGrow !== false || nested) && tl.needed > need + GROW_TOLERANCE) need = tl.needed;
        cells.push(c);
      }
      if (started) {
        openSpans.push(...started);
        for (const st of started) for (let k = st.ci; k < st.ci + st.cols; k++) cover[k] = st;
      }
      if (openSpans.length) {
        for (const s of openSpans) if (s.left === 1) {
          const above = s.units.reduce((t, u2) => t + u2.height, 0);
          if (s.tl.needed - above > need + GROW_TOLERANCE) need = s.tl.needed - above;
        }
      }
      if (lc.regions) {
        const rcells = (started ? [...cells, ...started].sort((a, b) => a.x - b.x) : cells).map(regionCell);
        if (started) for (const st of started) st.region = rcells.find((rc) => rc.colIndex === colX.indexOf(st.x));
        region.rows.push({ kind, level: extra?.level ?? 0, cells: rcells });
      }
      const paint = (h, lines, first, rowId, chunk) => {
        const items = [];
        if (lc.dataOnly) return items;
        cells.forEach((c, k) => {
          if (c.cell.visual?.type) {
            items.push(...paintBox({ x: c.x, y: 0, w: c.w, h, st: c.st, tl: null, m: lc.m }));
            if (first) items.push(...paintVisual(c.cell.visual, { x: c.x, y: 0, w: c.w, h }, c.ctx, lc, c.st, `${item.name || item.type} cell`, { cell: true }));
            return;
          }
          if (c.nested) {
            items.push(...paintBox({ x: c.x, y: 0, w: c.w, h, st: c.st, tl: null, m: lc.m }));
            if (chunk && chunk.cell === c) items.push(...chunk.items);
            else if (first) items.push(...c.nested.items);
            return;
          }
          const tag3 = lc.regions ? { table: item.name, row: rowId, col: colIdx[c.ci], span: c.span, kind, cols: colWidths, bg: c.st.backgroundColor || null } : null;
          paintBoxAt(c.x, 0, c.w, h, c.st, lines ? { ...c.tl, lines: lines[k] } : c.tl, c.numeric, lc.m, true, items, tag3);
          if (first) cellLinks(items, c, h, kind, extra?.level);
        });
        if (first) {
          for (const c of cells) if (c.cell.toggle) items.push(toggleLink(c, c.w, h));
        }
        if (first && extra?.toggle) {
          const c0 = cells[0];
          items.push(toggleLink({ x: colX[0], toggle: extra.toggle, cell: c0?.cell || {}, st: c0?.st, w: c0?.w }, cols[0]?.width || 20, h));
        }
        OWNED.add(items);
        return items;
      };
      const room2 = (lc.maxUnitHeight ?? Infinity) - repeatH;
      const pieces = [];
      const nc = !lc.fixed && !openSpans.length && !started && need > room2 ? cells.find((c) => c.nested?.units?.length > 1) : null;
      const chunks = nc ? splitNested(nc.nested, room2) : null;
      if (chunks) {
        chunks.forEach((ch, i) => pieces.push({ h: i ? ch.h : Math.max(ch.h, row.height || 18, ...cells.filter((c) => c !== nc).map((c) => c.tl.needed)), lines: i ? cells.map(() => []) : null, chunk: { cell: nc, items: ch.items } }));
      } else if (!lc.fixed && !openSpans.length && need > room2 && cells.some((c) => c.tl.lines.length > 1)) {
        const per = cells.map((c) => Math.max(1, Math.floor((room2 - c.tl.pad[0] - c.tl.pad[2]) / c.tl.lh)));
        const n = Math.max(...cells.map((c, k) => Math.ceil(c.tl.lines.length / per[k])));
        for (let i = 0; i < n; i++) {
          const lines = cells.map((c, k) => c.tl.lines.slice(i * per[k], (i + 1) * per[k]));
          pieces.push({ lines, h: Math.max(...cells.map((c, k) => lines[k].length * c.tl.lh + c.tl.pad[0] + c.tl.pad[2])) });
        }
      } else pieces.push({ lines: null, h: need });
      let u;
      pieces.forEach((pc, i) => {
        u = { top: y, height: pc.h, items: paint(pc.h, pc.lines, i === 0, ++rowSeq, pc.chunk), kind, rowId: rowSeq };
        y += pc.h;
        units.push(u);
      });
      if (openSpans.length) for (const s of openSpans) {
        s.units.push(u);
        s.left--;
      }
      if (openSpans.length && openSpans.some((s) => s.left <= 0)) {
        for (const s of openSpans) if (s.left <= 0) closeSpan(s);
        openSpans = openSpans.filter((s) => s.left > 0);
      }
      return u;
    };
    const layoutInCell = (inner, x, cw, st, cctx, row) => {
      const pd = padding(st);
      const it = { ...inner, name: inner.name || `${item.name || item.type}_cell`, x: x + pd[3], y: 0, w: Math.max(1, cw - pd[1] - pd[3]), h: Number(inner.h) || Math.max(1, (row.height || 18) - pd[0] - pd[2]) };
      const scopeRows2 = cctx.aggIndex != null ? [cctx.fields] : cctx.aggRows || [];
      const current = item.dataSet ? { ...cctx.current || {}, [item.dataSet]: scopeRows2 } : cctx.current;
      const child = {
        ...lc,
        regions: null,
        rowBudget: null,
        maxUnitHeight: Infinity,
        dataSets: item.dataSet ? { ...lc.dataSets, [item.dataSet]: scopeRows2 } : lc.dataSets,
        ctxFor: (x2) => {
          if (!x2.dataSet || x2.dataSet === item.dataSet) return { ...cctx, fields: scopeRows2[0] || null, aggRows: scopeRows2, aggIndex: void 0, current };
          const c = { ...lc.ctxFor(x2), parentFields: cctx.fields, scopes: cctx.scopes, current };
          const kids = related(c.aggRows, c);
          return kids === c.aggRows ? c : { ...c, aggRows: kids, fields: kids[0] || null };
        }
      };
      const budget = lc.cellItems || (lc.cellItems = { left: CELL_ITEM_UNITS });
      const reads = (it.dataSet && it.dataSet !== item.dataSet ? child.ctxFor(it).aggRows?.length : scopeRows2.length) || 1;
      if (budget.left < reads) {
        budget.left = 0;
        lc.warn(`${item.name || item.type}: more than ${CELL_ITEM_UNITS} rows of items inside cells; the rest are left empty`);
        return { items: [], height: 0 };
      }
      budget.left -= reads;
      const res = lc.layoutItems([it], child);
      budget.left -= res.units.length;
      const items = [];
      for (const u of res.units) for (const i of shiftLocal(u.items.filter((i2) => i2.t !== "bookmark"), u.top + pd[0])) items.push(i.cell ? { ...i, cell: void 0 } : i);
      return { items, height: res.height + pd[0] + pd[2], units: res.units, tables: res.tables, pad: [pd[0], pd[2]] };
    };
    const tableLevel = item.bookmark ? (item.bookmarkLevel ?? 0) + 1 : item.bookmarkLevel ?? 0;
    const cellLinks = (items, c, h, kind, level = 0) => {
      const link = lc.linkFor?.(c.cell, c.ctx, { x: c.x, y: 0, w: c.w, h });
      if (link) items.push(link);
      if (cell_bookmark(c.cell)) {
        const b = evalSafe(c.cell.bookmark, c.ctx, lc, "bookmark").v;
        if (b) items.push({ t: "bookmark", label: String(b), x: c.x, y: 0, level: c.cell.bookmarkLevel ?? tableLevel + (kind === "header" || kind === "footer" ? 0 : level) });
      }
      if (c.cell.sortBy && kind === "header") {
        const cur = (lc.state?.sort?.[item.name] || [])[0];
        const dir = cur && cur.by === c.cell.sortBy && cur.dir === "asc" ? "desc" : "asc";
        items.push({ t: "link", x: c.x, y: 0, w: c.w, h, action: { type: "sort", table: item.name, by: c.cell.sortBy, dir } });
      }
    };
    const toggleLink = (c, w, h) => ({ t: "link", x: c.x, y: 0, w: c.cell.action ? Math.min(c.w, padding(c.st)[3] + (Number(c.st.fontSize) || 9) * 1.4) : w, h, action: { type: "toggle", key: c.toggle.key, open: c.toggle.open } });
    const NO_BOX = { backgroundColor: null, backgroundImage: null, border: null, borderTop: null, borderRight: null, borderBottom: null, borderLeft: null };
    const paintSpan = (s) => {
      const kind = s.kind;
      const H = s.units.reduce((t, u) => t + u.height, 0);
      const n = s.units.length;
      s.units.forEach((u, k) => {
        const st = k === 0 && n === 1 ? s.st : { ...s.st, ...k > 0 ? { borderTop: "none" } : {}, ...k < n - 1 ? { borderBottom: "none" } : {} };
        const add2 = paintBox({ x: s.x, y: 0, w: s.w, h: u.height, st, tl: null, m: lc.m });
        if (k === 0) {
          const tag3 = lc.regions ? { table: item.name, row: u.rowId, col: colX.indexOf(s.x), span: s.cols, rowSpan: n, kind, cols: colWidths, bg: s.st.backgroundColor || null } : null;
          const text = paintBox({ x: s.x, y: 0, w: s.w, h: H, st: { ...s.st, ...NO_BOX }, tl: s.tl, numeric: s.numeric, m: lc.m, cell: tag3 });
          add2.splice(s.st.backgroundColor ? 1 : 0, 0, ...text);
          cellLinks(add2, s, u.height, kind, s.level);
          if (s.toggle) add2.push(toggleLink(s, s.w, u.height));
        }
        const at = u.items.findIndex((it) => itemLeft(it) >= s.x + s.w - 0.01);
        u.items.splice(at < 0 ? u.items.length : at, 0, ...add2);
      });
      if (s.tl.needed > s.units[0].height + GROW_TOLERANCE || s.st.verticalAlign && s.st.verticalAlign !== "top") {
        const id = `${item.name || item.type}:span:${lc.nextId()}`;
        for (const u of s.units) u.block || (u.block = id);
      } else {
        let above = s.units[0].height;
        for (let k = 1; k < n; k++) {
          const u = s.units[k];
          const cont = paintBox({ x: s.x, y: 0, w: s.w, h: H - above, st: { ...s.st, ...NO_BOX, verticalAlign: "top" }, tl: s.tl, numeric: s.numeric, m: lc.m });
          (u.cont || (u.cont = [])).push(...cont);
          above += u.height;
        }
      }
    };
    const closeSpan = (s) => {
      for (let k = s.ci; k < s.ci + s.cols; k++) cover[k] = null;
      if (s.region) {
        if (s.units.length > 1) s.region.rowSpan = s.units.length;
        else delete s.region.rowSpan;
      }
      if (s.units.length) paintSpan(s);
    };
    const endBand = () => {
      for (const s of openSpans) closeSpan(s);
      openSpans = [];
    };
    const fl = base.bandRows === "first-last";
    const first0 = lc.win?.first || rows[0];
    const headerUnits = (item.header || []).map((r) => layRow(r, fl && rows.length ? { ...base, pendingRows: [first0] } : base, "header")).filter(Boolean);
    endBand();
    const headerHeight = headerUnits.reduce((s, u) => s + u.height, 0);
    if (item.repeatHeader !== false) repeatH = headerHeight;
    const headerItems = [];
    for (const u of headerUnits) for (const it of shiftLocal(u.items.filter((i) => i.t !== "link" && i.t !== "bookmark"), u.top)) headerItems.push(it);
    if (headerUnits.length) headerUnits[headerUnits.length - 1].keepWithNext = true;
    if ((item.__body ? item.__body.length : rows.length) === 0 && item.noRowsText) {
      const st = resolveStyle([lc.base, item.style, { fontStyle: "italic", color: "#868e96" }], base);
      const tl = layoutTextLines(String(item.noRowsText), st, width, lc.m);
      units.push({ top: y, height: tl.needed, items: paintBox({ x: item.x, y: 0, w: width, h: tl.needed, st, tl, m: lc.m }), kind: "detail" });
      y += tl.needed;
    }
    const groups = item.groups || [];
    let rowNo = lc.win?.rowOffset || 0;
    const groupTables = [];
    const tableKey = `${item.name || item.type}#${lc.nextId()}`;
    const emit = (level, grows, ctx, chain, keyPath) => {
      if (level === groups.length) {
        for (let i = 0; i < grows.length; i++) {
          if (lc.rowBudget && lc.rowBudget.left-- <= 0) {
            lc.rowBudget.cut = true;
            return;
          }
          lc.tick?.();
          lc.tick?.();
          rowNo++;
          for (const s of chain) {
            s.index++;
            s.run.push(grows[i]);
          }
          const dctx = { ...ctx, fields: grows[i], aggRows: grows, aggIndex: i, rowNumber: rowNo };
          const u0 = units.length;
          for (const r of item.detail || []) layRow(r, dctx, "detail", { level: groups.length });
          if (lc.win && units[u0]) {
            units[u0].rowHead = true;
            for (let k = u0; k < units.length; k++) units[k].dataRow = rowNo;
          }
          if (groups.length && item.widowControl !== false) for (let k = u0; k < units.length; k++) {
            units[k].grp = tableKey + keyPath;
            if (ctx.__before) units[k].grpBefore = ctx.__before;
          }
          const every = Math.trunc(Number(item.pageBreakEvery)) || 0;
          if (every > 0 && rowNo > (lc.win?.rowOffset || 0) + 1 && (rowNo - 1) % every === 0 && units[u0]) units[u0].breakBefore = true;
          endBand();
        }
        return;
      }
      const g = groups[level];
      const buckets = groupRows(grows, g.expr, ctx, lc, item.name);
      if (!g.sortBy && (g.sort === "asc" || g.sort === "desc")) {
        buckets.sort((a, b) => cmpKey(a.key, b.key, ctx) * (g.sort === "desc" ? -1 : 1));
      }
      const us = lc.state?.sort?.[item.name] || (g.sortBy ? [{ by: g.sortBy, dir: g.sort === "desc" ? "desc" : "asc" }] : null);
      if (us?.length) {
        const keys = new Map(buckets.map((bk) => [bk, us.map((s) => {
          const r = evalSafe(s.by, { ...ctx, fields: bk.rows[0], aggRows: bk.rows, aggIndex: void 0 }, lc, item.name);
          return r.err ? null : r.v;
        })]));
        buckets.sort((a, b) => {
          for (let k = 0; k < us.length; k++) {
            const x = keys.get(a)[k], y2 = keys.get(b)[k];
            if (x === y2) continue;
            if (x == null) return 1;
            if (y2 == null) return -1;
            return cmpKey(x, y2, ctx) * (us[k].dir === "desc" ? -1 : 1);
          }
          return 0;
        });
      }
      const gname = g.name || `Group${level + 1}`;
      let roots = buckets, kids = null;
      const recOf = /* @__PURE__ */ new Map();
      if (g.parent) {
        const byText = new Map(buckets.map((b) => [b.text, b]));
        kids = /* @__PURE__ */ new Map();
        roots = [];
        for (const b of buckets) {
          const pk = evalSafe(g.parent, { ...ctx, fields: b.rows[0], aggRows: b.rows, aggIndex: void 0 }, lc, `${item.name || item.type} group parent`).v;
          const pr = pk == null || pk === "" ? null : byText.get(pk instanceof Date ? String(pk.getTime()) : String(pk));
          if (!pr || pr === b) roots.push(b);
          else {
            let k = kids.get(pr);
            if (!k) kids.set(pr, k = []);
            k.push(b);
          }
        }
        const seen = /* @__PURE__ */ new Set();
        const rec = (b, d) => {
          seen.add(b);
          let all = b.rows;
          for (const c of kids.get(b) || []) if (!seen.has(c) && d < MAX_TREE_DEPTH) all = all.concat(rec(c, d + 1));
          recOf.set(b, all);
          return all;
        };
        for (const r of roots) rec(r, 0);
        for (const b of buckets) if (!recOf.has(b)) rec(b, 0);
      }
      const shown = /* @__PURE__ */ new Set();
      const node = (bk, bi, sibs, depth, parentPath) => {
        if (lc.rowBudget?.cut || shown.has(bk)) return;
        shown.add(bk);
        const sc = { rows: bk.rows, index: -1, run: [], number: bi + 1, prevRows: bi > 0 ? sibs[bi - 1].rows : null, siblings: sibRows(sibs), ...kids ? { level: depth, recRows: recOf.get(bk) } : {} };
        const cont = bi === 0 && (level === 0 || ctx.__cont) ? lc.win?.cont?.[level] : null;
        const gctx = { ...ctx, fields: cont ? cont.first : bk.rows[0], aggRows: bk.rows, aggIndex: void 0, scopes: { ...ctx.scopes, [gname]: sc }, groupKey: bk.key, group: sc, __cont: !!cont, __before: cont && level === groups.length - 1 ? cont.before : 0 };
        if (kids) {
          gctx.level = depth;
          if (g.indent) gctx.indent = (ctx.indent || 0) + depth * Number(g.indent);
        }
        const path = `${parentPath}/${bk.text}`;
        const tkey = `${item.name || item.type}|${level}|${path}`;
        const dflt = kids && g.expandLevels != null ? depth < Number(g.expandLevels) : !g.initiallyCollapsed;
        const open = !g.collapsible ? true : lc.state?.toggles?.[tkey] ?? dflt;
        const start = units.length;
        const hctx = g.header?.length ? { ...gctx, pendingRows: fl ? [cont ? cont.first : bk.rows[0]] : recOf.get(bk) || bk.rows } : gctx;
        const hu = (cont && !g.repeatHeader ? [] : g.header || []).map((r, ri) => layRow(r, hctx, "groupHeader", { level, ...ri === 0 && g.collapsible ? { toggle: { key: tkey, open } } : {} })).filter(Boolean);
        endBand();
        const before = units.length;
        if (lc.win && !cont && before > start) {
          for (let k = start; k < before; k++) units[k].dataRow = rowNo + 1;
          units[start].rowHead = true;
          units[start].headLevel = level;
        }
        const rep = g.repeatHeader && before > start && !lc.fixed ? [...ctx.__rep || [], (() => {
          const hdr = units.slice(start, before), h0 = hdr[0].top, its = [];
          for (const u of hdr) for (const it of shiftLocal(u.items.filter((i) => i.t !== "link" && i.t !== "bookmark"), u.top - h0)) its.push(it);
          return { items: its, height: hdr.reduce((a, u) => a + u.height, 0) };
        })()] : null;
        if (rep) gctx.__rep = rep;
        const ch = kids?.get(bk) || [];
        if (open) {
          emit(level + 1, bk.rows, gctx, [...chain, sc], path);
          if (ch.length && depth + 1 >= MAX_TREE_DEPTH) lc.warn(`${item.name || item.type}: the group "${gname}" is more than ${MAX_TREE_DEPTH} levels deep; deeper rows are listed at the top level`);
          else ch.forEach((c, ci) => node(c, ci, ch, depth + 1, path));
        } else {
          const rs = recOf.get(bk) || bk.rows;
          for (const s of [...chain, sc]) {
            s.index += rs.length;
            for (const r of rs) s.run.push(r);
          }
          for (const c of ch) markShown(c);
        }
        if (hu.length && units.length > before) hu[hu.length - 1].keepWithNext = true;
        const fctx = fl ? { ...gctx, fields: bk.rows[bk.rows.length - 1] } : gctx;
        const fu = (g.footer || []).map((r) => layRow(r, fctx, "groupFooter", { level })).filter(Boolean);
        endBand();
        if (rep && units.length > before) {
          let off = item.repeatHeader !== false ? headerHeight : 0;
          const its = item.repeatHeader !== false ? [...headerItems] : [];
          for (const r of rep) {
            for (const it of shiftLocal(r.items, off)) its.push(it);
            off += r.height;
          }
          groupTables.push({ top: units[before].top, bottom: y, headerHeight: off, headerItems: its, x0: item.x, x1: item.x + width, owner: tableKey, depth: rep.length });
        }
        if (fu.length && open) fu[0].keepWithPrevious = true;
        if (units.length > start) {
          if ((g.pageBreak === "between" || g.newSection) && bi > 0) units[start].breakBefore = true;
          if (g.newSection) units[start].sectionStart = true;
          if (g.pageBreak === "after" && bi < sibs.length - 1) units[units.length - 1].breakAfter = true;
          if (g.keepTogether) {
            const id = `${item.name || item.type}:g${level}:${path}:${lc.nextId()}`;
            for (let k = start; k < units.length; k++) if (!units[k].block) {
              units[k].block = id;
              if (cont) units[k].blockOpen = true;
            }
          }
        }
      };
      const markShown = (b) => {
        const st = [b];
        while (st.length) {
          const x = st.pop();
          if (shown.has(x)) continue;
          shown.add(x);
          for (const c of kids?.get(x) || []) st.push(c);
        }
      };
      roots.forEach((bk, bi) => node(bk, bi, roots, 0, keyPath));
      if (kids) {
        const rest = buckets.filter((b) => !shown.has(b));
        if (rest.length) {
          lc.warn(`${item.name || item.type}: ${rest.length} rows of the group "${gname}" have no root (a cycle or too deep); they are listed at the top level`);
          rest.forEach((bk, bi) => node(bk, bi, rest, 0, keyPath));
        }
      }
    };
    if (item.__body) {
      for (const b of item.__body) {
        if (lc.rowBudget && lc.rowBudget.left-- <= 0) {
          lc.rowBudget.cut = true;
          break;
        }
        lc.tick?.();
        layRow(b.row, b.ctx || base, b.kind || "detail", { level: b.level ?? 0 });
      }
      endBand();
    } else emit(0, rows, base, [tableScope], "");
    const fStart = units.length;
    const footerUnits = lc.rowBudget?.cut ? [] : (item.footer || []).map((r) => layRow(r, fl && rows.length ? { ...base, fields: rows[rows.length - 1] } : base, "footer")).filter(Boolean);
    endBand();
    if (footerUnits.length) footerUnits[0].keepWithPrevious = true;
    if (item.printAtBottom && footerUnits.length && !lc.fixed) {
      for (let k = fStart; k < units.length; k++) {
        units[k].atBottom = true;
        if (k > fStart) units[k].keepWithPrevious = true;
      }
      units[units.length - 1].breakAfter = true;
    }
    if (item.bookmark && units.length) {
      const b = evalSafe(item.bookmark, base, lc, `${item.name || item.type} bookmark`).v;
      if (b != null && b !== "" && b !== "#Error") units[0].items.unshift({ t: "bookmark", label: String(b), x: item.x, y: 0, level: item.bookmarkLevel ?? 0 });
    }
    if (!lc.fixed) lc.regions?.push(region);
    if (overflow === "paginate" && !lc.fixed && width > room + 0.01) {
      const hc = units.findIndex((u) => u.kind !== "header");
      const sliced = sliceColumns({
        units,
        height: y,
        headerCount: hc < 0 ? units.length : hc,
        headerHeight,
        repeatHeader: item.repeatHeader !== false,
        colX,
        widths: colWidths,
        x: item.x,
        repeat: item.repeatColumns || 0,
        room,
        order: item.pageOrder === "across" ? "across" : "down",
        pageH: lc.maxUnitHeight ?? Infinity,
        name: item.name || "Table",
        nextId: lc.nextId,
        warn: lc.warn,
        shiftLocal,
        block: item.columnBlock
      });
      if (sliced) return sliced;
    }
    return {
      height: y,
      units,
      width,
      table: item.repeatHeader !== false && headerHeight ? { headerHeight, headerItems, x: item.x, owner: tableKey, depth: 0 } : null,
      ...groupTables.length ? { tables: groupTables } : {}
    };
  }
});
var cell_bookmark = (c) => c && c.bookmark;
function splitNested(nested, room) {
  const us = nested.units;
  if (us.some((u) => u.deco)) return null;
  for (let i = 1; i < us.length; i++) if (us[i].top < us[i - 1].top + us[i - 1].height - 0.01) return null;
  const [pt, pb] = nested.pad;
  const head = (y) => {
    for (const t of nested.tables || []) if (t.headerItems && t.top < y - 0.01 && t.bottom > y + 0.01) return t;
    return null;
  };
  const out = [];
  let a = 0;
  while (a < us.length) {
    const t = a ? head(us[a].top) : null;
    const hh = t ? t.headerHeight : 0;
    let b = a + 1;
    while (b < us.length && us[b].top + us[b].height - us[a].top + hh + pt + pb <= room + 0.01) b++;
    if (b < us.length && b - 1 > a && us[b - 1].keepWithNext) b--;
    const items = [];
    if (t) for (const i of shiftLocal(t.headerItems, pt)) items.push(i);
    for (let k = a; k < b; k++) for (const i of shiftLocal(us[k].items.filter((i2) => i2.t !== "bookmark"), us[k].top - us[a].top + hh + pt)) items.push(i.cell ? { ...i, cell: void 0 } : i);
    out.push({ h: us[b - 1].top + us[b - 1].height - us[a].top + hh + pt + pb, items });
    a = b;
  }
  return out.length > 1 ? out : null;
}
{
  const base = ITEMS.table.layout;
  ITEMS.table.layout = (item, lc) => {
    if (!item.overflowTo || !lc.overflow || item.__body || lc.fixed) return base(item, lc);
    if (lc.overflow.repeat) return emptyBox(item);
    const res = base({ ...item, overflowTo: void 0 }, { ...lc, maxUnitHeight: Infinity });
    if (!res.units.length) return res;
    const head = res.units.filter((u) => u.kind === "header");
    const rows = res.units.filter((u) => u.kind !== "header");
    const n = fitRows(rows, item.h - head.reduce((a, u) => a + u.height, 0));
    if (n < rows.length) lc.overflow.pending.set(String(item.overflowTo), { table: item.name || "Table", to: String(item.overflowTo), head, units: rows.slice(n), x: item.x });
    return { height: item.h, units: [{ top: 0, height: item.h, items: stack([...head, ...rows.slice(0, n)], 0) }] };
  };
}
var MAX_TREE_DEPTH = 64;
var CELL_ITEM_UNITS = 1e5;
function roundFor(v, fmt2) {
  return Number.isInteger(v) || !Number.isFinite(v) ? v : Number(v.toPrecision(15));
}
register("container", {
  label: "Container",
  defaults: () => ({ type: "container", w: 240, h: 72, items: [], keepTogether: true, style: { border: "0.75 solid #d0d7de", padding: 0 } }),
  props: [
    { key: "dataSet", label: "Data set (for its hidden expression and style)", type: "dataset", category: "Data" },
    { key: "keepTogether", label: "Keep together on one page", type: "bool", category: "Layout" },
    { key: "pageBreakBefore", label: "Page break before", type: "bool", category: "Layout" },
    { key: "pageBreakAfter", label: "Page break after", type: "bool", category: "Layout" },
    { key: "hidden", label: "Hidden", type: "expr", category: "Visibility" }
  ],
  layout(item, lc) {
    const ctx = lc.ctxFor(item);
    if (hidden(item, ctx, lc)) return { height: 0, units: [] };
    const res = lc.layoutItems(item.items, lc, { dx: item.x });
    return frame2(item, lc, ctx, res, item.keepTogether !== false ? `c:${item.name || item.type}:${lc.nextId()}` : null);
  }
});
function frame2(item, lc, ctx, res, blockId0) {
  let blockId = blockId0;
  const h = Math.max(item.h, res.height);
  const st = resolveStyle([lc.base, lc.named?.[item.styleName], item.style], ctx);
  const deco = paintBox({ x: item.x, y: 0, w: item.w, h, st, tl: null, m: lc.m });
  if (blockId && h > (lc.maxUnitHeight ?? Infinity) + 0.01) blockId = null;
  const units = res.units.map((u) => ({ ...u, block: u.block || blockId }));
  if (deco.length) {
    if (blockId || !units.length) units.unshift({ top: 0, height: h, items: deco, block: blockId, x0: item.x, x1: item.x + item.w, deco: true });
    else {
      const ord = [...units].sort((a, b2) => a.top - b2.top);
      const b = borders(st), none = "none";
      ord.forEach((u, i) => {
        const y0 = i === 0 ? 0 : u.top, y1 = i === ord.length - 1 ? h : ord[i + 1].top;
        if (y1 <= y0) return;
        const sst = {
          ...st,
          border: null,
          borderLeft: b.left ? st.borderLeft ?? st.border : none,
          borderRight: b.right ? st.borderRight ?? st.border : none,
          borderTop: i === 0 && b.top ? st.borderTop ?? st.border : none,
          borderBottom: i === ord.length - 1 && b.bottom ? st.borderBottom ?? st.border : none
        };
        const strip = paintBox({ x: item.x, y: y0 - u.top, w: item.w, h: y1 - y0, st: sst, tl: null, m: lc.m });
        const k = units.indexOf(u);
        units[k] = { ...u, items: [...strip, ...u.items], x0: Math.min(u.x0 ?? item.x, item.x), x1: Math.max(u.x1 ?? item.x + item.w, item.x + item.w) };
      });
    }
  }
  if (!units.length) units.push({ top: 0, height: h, items: [], x0: item.x, x1: item.x + item.w });
  return { height: h, units, tables: res.tables, width: item.w };
}
register("list", {
  label: "List",
  defaults: () => ({ type: "list", w: 360, h: 60, dataSet: null, groupBy: null, items: [], keepTogether: true, style: { borderBottom: "0.5 solid #d0d7de" } }),
  props: [
    { key: "dataSet", label: "Data set", type: "dataset", category: "Data" },
    { key: "groupBy", label: "Group by (one row per group)", type: "expr", category: "Data" },
    { key: "groupAdjacent", label: "A new group at every change (not sorted)", type: "bool", category: "Data" },
    { key: "inheritRows", label: "Rows of the enclosing list row", type: "bool", category: "Data" },
    { key: "keepTogether", label: "Keep each row on one page", type: "bool", category: "Layout" },
    { key: "pageBreakBetween", label: "Page break between rows", type: "bool", category: "Layout" },
    { key: "columns", label: "Records across (grid)", type: "number", category: "Layout" },
    { key: "columnGap", label: "Gap between records across (pt)", type: "number", category: "Layout", showIf: (it) => Number(it.columns) > 1 },
    { key: "newSection", label: "Each row starts a section (page numbers restart)", type: "bool", category: "Layout" },
    { key: "pageBreakBefore", label: "Page break before", type: "bool", category: "Layout" },
    { key: "hidden", label: "Hidden", type: "expr", category: "Visibility" }
  ],
  layout(item, lc) {
    const ctx = lc.ctxFor(item);
    if (hidden(item, ctx, lc)) return { height: 0, units: [] };
    let rows = item.dataSet && lc.dataSets[item.dataSet] || [];
    if (item.inheritRows && item.dataSet && ctx.current?.[item.dataSet]) rows = ctx.current[item.dataSet];
    else rows = related(rows, ctx);
    if (item.dataSet && !lc.dataSets[item.dataSet]) lc.warn(`${item.name || item.type}: the data set "${item.dataSet}" does not exist`);
    if (item.filters?.length) rows = applyFilters(rows, item.filters, ctx);
    if (item.sort?.length) rows = applySort(rows, item.sort, ctx);
    const reps = item.groupBy ? groupRows(rows, item.groupBy, ctx, lc, item.name, item.groupAdjacent === true).map((b) => b.rows) : rows.map((r) => [r]);
    const units = [], tables = [];
    let y = 0;
    const listScope = { rows, index: -1, run: [] };
    const ncol = Math.max(1, Math.min(50, Math.floor(Number(item.columns)) || 1));
    const gap = Number(item.columnGap ?? 6) || 0;
    let cells = null;
    reps.forEach((rs, i) => {
      if (lc.rowBudget && lc.rowBudget.left-- <= 0) {
        lc.rowBudget.cut = true;
        return;
      }
      listScope.index = i;
      listScope.prevRows = i > 0 ? reps[i - 1] : null;
      if (item.groupBy) listScope.number = i + 1;
      for (const r of rs) listScope.run.push(r);
      const current = item.dataSet ? { ...ctx.current || {}, [item.dataSet]: rs } : ctx.current;
      const rctx = { ...ctx, fields: rs[0], aggRows: rs, aggIndex: void 0, rowNumber: i + 1, parentFields: rs[0], scopes: { ...ctx.scopes || {}, [item.name]: listScope }, region: listScope, group: item.groupBy ? listScope : void 0, current };
      const child = { ...lc, ctxFor: (it) => {
        if (!(it.dataSet && it.dataSet !== item.dataSet)) return rctx;
        const c = { ...lc.ctxFor(it), parentFields: rs[0], scopes: rctx.scopes, current };
        const kids = related(c.aggRows, c);
        return kids === c.aggRows ? c : { ...c, aggRows: kids, fields: kids[0] || null };
      } };
      const k = i % ncol;
      const res = lc.layoutItems(item.items, child, { dx: item.x + k * (item.w + gap) });
      const fr = frame2({ ...item, x: item.x + k * (item.w + gap), name: `${item.name || item.type}[${i + 1}]` }, child, rctx, res, item.keepTogether !== false ? `l:${item.name || item.type}:${i}:${lc.nextId()}` : null);
      if (ncol > 1) {
        if (k === 0) {
          cells = { top: y, height: 0, items: [], x0: item.x, x1: item.x + ncol * item.w + (ncol - 1) * gap, block: void 0 };
          units.push(cells);
        }
        for (const u of fr.units) for (const it of shiftLocal(u.items, u.top)) cells.items.push(it);
        cells.height = Math.max(cells.height, fr.height);
        if (k === ncol - 1 || i === reps.length - 1) y += cells.height;
        if (k === 0 && i > 0 && (item.pageBreakBetween || item.newSection)) cells.breakBefore = true;
        if (k === 0 && item.newSection) cells.sectionStart = true;
        return;
      }
      fr.units.forEach((u, j) => units.push({ ...u, top: u.top + y, breakBefore: u.breakBefore || j === 0 && i > 0 && !!(item.pageBreakBetween || item.newSection), ...j === 0 && item.newSection ? { sectionStart: true } : {} }));
      for (const t of fr.tables || []) tables.push({ ...t, top: t.top + y, bottom: t.bottom + y });
      y += fr.height;
    });
    if (!reps.length) units.push({ top: 0, height: 0, items: [] });
    return { height: y, units, tables, width: ncol > 1 ? ncol * item.w + (ncol - 1) * gap : item.w };
  }
});
register("checkbox", {
  label: "Check box",
  defaults: () => ({ type: "checkbox", w: 120, h: 14, value: "=True", text: "Label", style: {} }),
  props: [
    { key: "value", label: "Checked (true/false)", type: "expr", category: "Data" },
    { key: "text", label: "Label", type: "expr", category: "Data" },
    { key: "dataSet", label: "Data set", type: "dataset", category: "Data" },
    { key: "hidden", label: "Hidden", type: "expr", category: "Visibility" }
  ],
  layout(item, lc) {
    const ctx = lc.ctxFor(item);
    if (hidden(item, ctx, lc)) return { height: 0, units: [] };
    const st = resolveStyle([lc.base, lc.named?.[item.styleName], item.style], ctx);
    const r = evalSafe(item.value ?? false, ctx, lc, item.name || "CheckBox");
    const on = r.v === true || r.v === 1 || typeof r.v === "string" && ["true", "yes", "y", "1"].includes(r.v.toLowerCase());
    const size = Math.min(item.h, (Number(st.fontSize) || 9) + 2);
    const by = (item.h - size) / 2;
    const color2 = st.color || "#1f2328";
    const items = [{ t: "rect", x: item.x, y: by, w: size, h: size, fill: "#ffffff", stroke: color2, strokeWidth: 0.75, radius: 1.5 }];
    if (on) items.push({ t: "path", x: item.x, y: by, d: `M ${size * 0.2} ${size * 0.52} L ${size * 0.42} ${size * 0.74} L ${size * 0.8} ${size * 0.26}`, stroke: color2, strokeWidth: Math.max(1, size * 0.12), fill: null });
    const label = item.text != null ? textOf(evalSafe(item.text, ctx, lc, item.name).v, st, ctx, lc) : "";
    if (label) {
      const tst = { ...st, padding: 0, verticalAlign: "middle" };
      const tl = layoutTextLines(label, tst, item.w - size - 4, lc.m, { wrap: false });
      items.push(...paintBox({ x: item.x + size + 4, y: 0, w: item.w - size - 4, h: item.h, st: { ...tst, backgroundColor: null, border: null }, tl, m: lc.m }));
    }
    return { height: item.h, units: [{ top: 0, height: item.h, items }] };
  }
});
function shiftLocal(items, dy) {
  return items.map((it) => {
    let o;
    if (it.t === "text") o = { ...it, lines: it.lines.map((l) => ({ ...l, y: l.y + dy })), clip: it.clip && { ...it.clip, y: it.clip.y + dy } };
    else if (it.t === "line") o = { ...it, y1: it.y1 + dy, y2: it.y2 + dy };
    else if (it.t === "ellipse") o = { ...it, cy: it.cy + dy };
    else if (it.t === "field") o = { ...it, y: it.y + dy, draw: shiftLocal(it.draw, dy) };
    else o = { ...it, y: it.y + dy };
    if (it.rotate) o.rotate = { ...it.rotate, cy: it.rotate.cy + dy };
    return o;
  });
}
register("chart", {
  label: "Chart",
  defaults: () => ({ type: "chart", w: 320, h: 180, chartType: "column", dataSet: null, category: "", series: [{ name: "Value", value: "" }], legend: "bottom", valueFormat: "N0", title: "" }),
  props: [
    { key: "chartType", label: "Chart type", type: "select", options: CHART_TYPES, category: "Chart" },
    { key: "dataSet", label: "Data set", type: "dataset", category: "Chart" },
    { key: "title", label: "Title", type: "expr", category: "Chart" },
    { key: "category", label: "Category (x axis / slices)", type: "expr", category: "Chart", showIf: (i) => !ROW_CHARTS.has(i.chartType) && i.chartType !== "gauge" && i.chartType !== "histogram" },
    { key: "categorySort", label: "Sort categories", type: "select", options: ["asc", "desc"], category: "Chart", showIf: (i) => !ROW_CHARTS.has(i.chartType) && i.chartType !== "gauge" },
    { key: "categoryFormat", label: "Category format", type: "text", category: "Chart", showIf: (i) => !ROW_CHARTS.has(i.chartType) && i.chartType !== "gauge" },
    { key: "maxCategories", label: "Show at most N categories (a number or =Parameters.top)", labelKey: "chartMaxCategories", type: "expr", category: "Chart", showIf: (i) => !ROW_CHARTS.has(i.chartType) && i.chartType !== "gauge" },
    { key: "xValue", label: "X value (scatter, bubble) or angle in degrees (polar)", type: "expr", category: "Chart", showIf: (i) => ROW_CHARTS.has(i.chartType) },
    { key: "series", label: "Series", type: "series", category: "Chart", showIf: (i) => i.chartType !== "gantt" },
    { key: "seriesGroup", label: "One series per value of", type: "expr", category: "Chart", showIf: (i) => !ROW_CHARTS.has(i.chartType) && !["pie", "donut", "gauge", "funnel", "treemap", "histogram", "boxplot", "waterfall"].includes(i.chartType) },
    { key: "binCount", label: "Number of bins (empty: automatic)", type: "number", category: "Chart", showIf: (i) => i.chartType === "histogram" },
    { key: "binWidth", label: "Bin width (instead of a number of bins)", type: "number", category: "Chart", showIf: (i) => i.chartType === "histogram" },
    { key: "showMean", label: "Mark the mean", type: "bool", category: "Chart", showIf: (i) => i.chartType === "boxplot" },
    { key: "waterfallTotals", label: "Subtotal bar when (e.g. =Fields.isTotal)", type: "expr", category: "Chart", showIf: (i) => i.chartType === "waterfall" },
    { key: "showTotal", label: "Total bar at the end", type: "bool", defaultOn: true, category: "Chart", showIf: (i) => i.chartType === "waterfall" },
    { key: "totalLabel", label: "Total bar label", type: "text", category: "Chart", showIf: (i) => i.chartType === "waterfall" && i.showTotal !== false },
    { key: "totalColor", label: "Total colour", type: "color", category: "Chart", showIf: (i) => i.chartType === "waterfall" },
    { key: "ganttStart", label: "Bar start (date or number)", type: "expr", category: "Chart", showIf: (i) => i.chartType === "gantt" },
    { key: "ganttEnd", label: "Bar end (date or number)", type: "expr", category: "Chart", showIf: (i) => i.chartType === "gantt" },
    { key: "ganttToday", label: "Today line", type: "bool", defaultOn: true, category: "Chart", showIf: (i) => i.chartType === "gantt" },
    { key: "todayColor", label: "Today line colour", type: "color", category: "Chart", showIf: (i) => i.chartType === "gantt" && i.ganttToday !== false },
    { key: "stacked", label: "Stacking", type: "stacked", category: "Chart", showIf: (i) => AXIS_CHARTS.has(i.chartType || "column") },
    { key: "line", label: "Lines", type: "select", options: ["straight", "smooth", "step"], category: "Chart", showIf: (i) => AXIS_CHARTS.has(i.chartType || "column") },
    { key: "upColor", label: "Rising colour", type: "color", category: "Chart", showIf: (i) => i.chartType === "candlestick" || i.chartType === "ohlc" || i.chartType === "waterfall" },
    { key: "downColor", label: "Falling colour", type: "color", category: "Chart", showIf: (i) => i.chartType === "candlestick" || i.chartType === "ohlc" || i.chartType === "waterfall" },
    { key: "gaugeShape", label: "Gauge shape", labelKey: "gaugeShape", type: "select", options: [{ value: "half", label: "Half circle" }, { value: "threeQuarter", label: "Three-quarter circle" }, { value: "full", label: "Full circle" }], category: "Chart", showIf: (i) => i.chartType === "gauge" },
    { key: "gaugeIndicator", label: "Value shown by", labelKey: "gaugeIndicator", type: "select", options: [{ value: "needle", label: "Needle" }, { value: "pointer", label: "Pointer on the scale" }, { value: "bar", label: "Bar along the scale" }], category: "Chart", showIf: (i) => i.chartType === "gauge" },
    { key: "pointerColor", label: "Needle or pointer colour", labelKey: "gaugePointerColor", type: "color", category: "Chart", showIf: (i) => i.chartType === "gauge" && i.gaugeIndicator !== "bar" },
    { key: "gaugeTicks", label: "Tick marks and values", labelKey: "gaugeTicks", type: "bool", defaultOn: true, category: "Chart", showIf: (i) => i.chartType === "gauge" },
    { key: "axes", label: "Axes", type: "axes", category: "Axes", showIf: (i) => !["pie", "donut", "funnel", "treemap"].includes(i.chartType) },
    { key: "xTitle", label: "X axis title", type: "text", category: "Axes", showIf: (i) => !i.axes?.x?.title && !["pie", "donut", "funnel", "gauge", "radar", "polar", "treemap"].includes(i.chartType) },
    { key: "overlays", label: "Trend lines, reference lines and bands", type: "overlays", category: "Overlays", showIf: (i) => !["pie", "donut", "funnel", "radar", "polar"].includes(i.chartType) && !MORE_CHARTS.has(i.chartType) },
    { key: "showValues", label: "Show values", type: "bool", category: "Labels" },
    { key: "labelTemplate", label: "Label text: {value} {category} {series} {percent}, or =expression", type: "text", category: "Labels" },
    { key: "labelPosition", label: "Label position", type: "select", options: ["outside", "inside", "center"], category: "Labels" },
    { key: "valueFormat", label: "Value format", type: "text", category: "Labels" },
    { key: "legend", label: "Legend", type: "select", options: ["bottom", "none"], category: "Look" },
    { key: "palette", label: "Palette", labelKey: "chartPalette", type: "palette", options: Object.keys(PALETTES), category: "Look" },
    { key: "animation", label: "Animation in the viewer", type: "select", options: ["none", "grow", "fade"], category: "Look" },
    { key: "fontSize", label: "Text size", type: "number", category: "Look" },
    { key: "background", label: "Background", type: "color", category: "Look" },
    { key: "pointAction", label: "Click on a bar or slice", type: "action", category: "Interactivity" },
    { key: "pointColor", label: "Bar or slice colour (expression, e.g. highlight the selected one)", type: "expr", category: "Interactivity" },
    { key: "tooltips", label: "Tooltips on hover", type: "bool", category: "Interactivity" },
    { key: "keepTogether", label: "Keep on one page", type: "bool", category: "Layout" },
    ALT,
    { key: "hidden", label: "Hidden", type: "expr", category: "Visibility" }
  ],
  styleProps: [],
  layout(item, lc) {
    const ctx = lc.ctxFor(item);
    if (hidden(item, ctx, lc)) return { height: 0, units: [] };
    const meta = {};
    const items = paintChart(item, ctx, lc, lc.base, meta);
    addInteractivity(items, item, ctx, lc, { x: item.x, y: 0, w: item.w, h: item.h });
    return { height: item.h, units: [{ top: 0, height: item.h, items }], alt: meta.alt };
  }
});
var FIELD_KINDS = ["text", "multiline", "checkbox", "choice"];
register("field", {
  label: "Form field",
  defaults: () => ({ type: "field", w: 180, h: 18, kind: "text", fieldName: "field1", value: "", style: {} }),
  props: [
    { key: "kind", label: "Kind", type: "select", options: FIELD_KINDS, category: "Field" },
    { key: "fieldName", label: "Field name (unique; {Fields.x} allowed)", type: "expr", category: "Field" },
    { key: "label", label: "Label (the name a screen reader says)", type: "expr", category: "Field" },
    { key: "value", label: "Starting value", type: "expr", category: "Field" },
    { key: "options", label: "Choices (comma-separated or =expression)", type: "expr", category: "Field" },
    { key: "required", label: "Required", type: "bool", category: "Field" },
    { key: "readOnly", label: "Read only", type: "bool", category: "Field" },
    { key: "dataSet", label: "Data set", type: "dataset", category: "Data" },
    { key: "hidden", label: "Hidden", type: "expr", category: "Visibility" }
  ],
  layout(item, lc) {
    const ctx = lc.ctxFor(item);
    if (hidden(item, ctx, lc)) return { height: 0, units: [] };
    const who = item.name || "Field";
    const st = resolveStyle([lc.base, { border: "0.75 solid #9ca3af", padding: "2 3", backgroundColor: "#ffffff" }, lc.named?.[item.styleName], item.style], ctx);
    const kind = FIELD_KINDS.includes(item.kind) ? item.kind : "text";
    const name = String(evalSafe(item.fieldName || item.name || "field", ctx, lc, who).v || "field").replace(/[.\s]+/g, "_");
    const lab = item.label ?? item.tooltip;
    const label = lab == null || lab === "" ? "" : String(evalSafe(lab, ctx, lc, who).v ?? "");
    const raw = evalSafe(item.value ?? "", ctx, lc, who).v;
    let options = [];
    if (kind === "choice") {
      const o = evalSafe(item.options ?? "", ctx, lc, who).v;
      options = (Array.isArray(o) ? o : String(o ?? "").split(",")).map((s) => String(s).trim()).filter(Boolean);
    }
    const value = kind === "checkbox" ? truthy(raw) : raw == null ? "" : textOf(raw, st, ctx, lc);
    const draw = [];
    if (kind === "checkbox") {
      const size = Math.min(item.w, item.h);
      draw.push({ t: "rect", x: item.x, y: 0, w: size, h: size, fill: st.backgroundColor, stroke: "#9ca3af", strokeWidth: 0.75 });
      if (value) draw.push({ t: "path", x: item.x, y: 0, d: `M ${size * 0.2} ${size * 0.52} L ${size * 0.42} ${size * 0.74} L ${size * 0.8} ${size * 0.26}`, stroke: st.color || "#1f2328", strokeWidth: Math.max(1, size * 0.12), fill: null });
    } else {
      const tl = layoutTextLines(String(value), st, item.w - (kind === "choice" ? 12 : 0), lc.m, { wrap: kind === "multiline" });
      draw.push(...paintBox({ x: item.x, y: 0, w: item.w, h: item.h, st, tl, m: lc.m }));
      if (kind === "choice") draw.push({ t: "path", x: item.x + item.w - 10, y: item.h / 2 - 2, d: "M 0 0 L 3 3 L 6 0", stroke: "#6b7280", strokeWidth: 1, fill: null });
    }
    const field = {
      t: "field",
      kind,
      name,
      ...label ? { label } : {},
      value,
      options,
      required: !!item.required,
      readOnly: !!item.readOnly,
      x: item.x,
      y: 0,
      w: item.w,
      h: item.h,
      font: resolveFontKey(st.fontFamily, st.fontWeight, st.fontStyle),
      size: Number(st.fontSize) || 9,
      draw
    };
    return { height: item.h, units: [{ top: 0, height: item.h, items: [field] }] };
  }
});
register("map", {
  label: "Map",
  defaults: () => ({ type: "map", w: 360, h: 240, geojson: "", shapeKey: "=Fields.name", colorLow: "#dbeafe", colorHigh: "#1e3a8a", legend: "bottom", valueFormat: "N0" }),
  props: [
    { key: "geojson", label: "Shapes: GeoJSON text", type: "text", category: "Shapes" },
    { key: "dataSet", label: "Shapes: data set of features (instead of the text)", type: "dataset", category: "Shapes" },
    { key: "geometry", label: "Shapes: geometry (data set)", type: "expr", category: "Shapes" },
    { key: "shapeKey", label: "Shapes: key (e.g. =Fields.name)", type: "expr", category: "Shapes" },
    { key: "valueDataSet", label: "Colour by: data set", type: "dataset", category: "Colour" },
    { key: "valueKey", label: "Colour by: key that matches the shape key", type: "expr", category: "Colour" },
    { key: "value", label: "Colour by: value (aggregate)", type: "expr", category: "Colour" },
    { key: "valueFormat", label: "Value format", type: "text", category: "Colour" },
    { key: "colorLow", label: "Lowest value colour", type: "color", category: "Colour" },
    { key: "colorHigh", label: "Highest value colour", type: "color", category: "Colour" },
    { key: "legend", label: "Legend", type: "select", options: ["bottom", "none"], category: "Colour" },
    { key: "colorScale", label: "Colour scale", type: "select", options: [{ value: "continuous", label: "Continuous (heat)" }, { value: "classes", label: "Classes (graduated)" }], category: "Colour" },
    { key: "classes", label: "Number of classes (2–9)", type: "number", category: "Colour", showIf: (i) => i.colorScale === "classes" },
    { key: "lineColor", label: "Lines: colour (LineString shapes)", type: "color", category: "Shapes" },
    { key: "lineWidth", label: "Lines: width (pt)", type: "number", category: "Shapes" },
    { key: "regionAction", label: "Click on a region", type: "action", category: "Interactivity" },
    { key: "tooltips", label: "Tooltips on hover", type: "bool", defaultOn: true, category: "Interactivity" },
    { key: "pointDataSet", label: "Points: data set", type: "dataset", category: "Points" },
    { key: "lat", label: "Points: latitude", type: "expr", category: "Points" },
    { key: "lon", label: "Points: longitude", type: "expr", category: "Points" },
    { key: "pointSize", label: "Points: size by", type: "expr", category: "Points" },
    { key: "pointLabel", label: "Points: label", type: "expr", category: "Points" },
    { key: "pointColor", label: "Points: colour", type: "color", category: "Points" },
    { key: "keepTogether", label: "Keep on one page", type: "bool", category: "Layout" },
    ALT,
    { key: "hidden", label: "Hidden", type: "expr", category: "Visibility" }
  ],
  styleProps: [],
  layout(item, lc) {
    const ctx = lc.ctxFor(item);
    if (hidden(item, ctx, lc)) return { height: 0, units: [] };
    const items = paintMap(item, ctx, lc, lc.base);
    addInteractivity(items, item, ctx, lc, { x: item.x, y: 0, w: item.w, h: item.h });
    return { height: item.h, units: [{ top: 0, height: item.h, items }] };
  }
});
for (const [type, label, defaults] of [
  ["sparkline", "Sparkline", { value: "", style: "line" }],
  ["databar", "Data bar", { value: "", max: "" }],
  ["bullet", "Bullet", { value: "", max: "", target: "" }],
  ["iconset", "Icon set", { value: "", iconSet: "trafficLights", lower: "=33", upper: "=67", w: 18, h: 18 }],
  ["rangebar", "Range bar", { low: "", high: "", min: "", max: "" }]
]) {
  register(type, {
    label,
    defaults: () => ({ type, w: 120, h: 18, color: "#2563eb", ...defaults }),
    props: [
      { key: "dataSet", label: "Data set", type: "dataset", category: "Data" },
      ...type === "sparkline" ? [{ key: "category", label: "One point per (e.g. =Fields.month)", type: "expr", category: "Data" }] : [],
      ...type !== "rangebar" ? [{ key: "value", label: type === "sparkline" ? "Value (aggregate when a category is set)" : "Value", type: "expr", category: "Data" }] : [],
      ...type === "sparkline" ? [
        { key: "style", label: "Style", type: "select", options: ["line", "column", "area", "winloss"], category: "Data" },
        { key: "bandLow", label: "Range band from", type: "expr", category: "Data" },
        { key: "bandHigh", label: "Range band to", type: "expr", category: "Data" },
        { key: "bandColor", label: "Range band colour", type: "color", category: "Data" }
      ] : [],
      ...type === "iconset" ? [
        { key: "iconSet", label: "Icons", type: "select", options: ICON_SETS, category: "Data" },
        { key: "lower", label: "Low below", type: "expr", category: "Data" },
        { key: "upper", label: "High from", type: "expr", category: "Data" },
        { key: "reverse", label: "Reverse order (higher is worse)", type: "bool", category: "Data" }
      ] : [],
      ...type === "rangebar" ? [
        { key: "low", label: "From", type: "expr", category: "Data" },
        { key: "high", label: "To", type: "expr", category: "Data" },
        { key: "min", label: "Scale minimum", type: "expr", category: "Data" }
      ] : [],
      ...type !== "sparkline" && type !== "iconset" ? [{ key: "max", label: "Maximum", type: "expr", category: "Data" }] : [],
      ...type === "bullet" ? [{ key: "target", label: "Target", type: "expr", category: "Data" }] : [],
      ...type !== "iconset" ? [{ key: "color", label: "Color", type: "color", category: "Data" }] : [],
      ALT,
      { key: "hidden", label: "Hidden", type: "expr", category: "Visibility" }
    ],
    styleProps: [],
    layout(item, lc) {
      const ctx = lc.ctxFor(item);
      if (hidden(item, ctx, lc)) return { height: 0, units: [] };
      const items = paintVisual({ ...item, type }, { x: item.x, y: 0, w: item.w, h: item.h }, ctx, lc, lc.base, item.name);
      return { height: item.h, units: [{ top: 0, height: item.h, items }] };
    }
  });
}
register("barcode", {
  label: "Barcode",
  defaults: () => ({ type: "barcode", w: 160, h: 48, symbology: "code128", value: "", showText: true, style: { fontSize: 8, textAlign: "center" } }),
  props: [
    { key: "symbology", label: "Symbology", type: "select", options: SYMBOLOGIES.map((s) => ({ value: s.id, label: s.name })), category: "Barcode" },
    { key: "value", label: "Value", type: "expr", category: "Barcode" },
    { key: "dataSet", label: "Data set", type: "dataset", category: "Barcode" },
    { key: "showText", label: "Show the text", type: "bool", category: "Barcode", showIf: (it) => !isTwoD(it.symbology || "code128") },
    { key: "captionPosition", label: "Text position", type: "select", options: ["below", "above"], category: "Barcode", showIf: (it) => !isTwoD(it.symbology || "code128") && it.showText !== false },
    { key: "quietZone", label: "Quiet zone (pt of white around the code)", type: "number", category: "Barcode" },
    { key: "rotate", label: "Rotate", type: "select", options: ["0", "90", "180", "270"], category: "Barcode" },
    ...BARCODE_OPTIONS.map((o) => ({ key: o.key, label: o.label, type: o.enum ? "select" : o.bool ? "bool" : o.size ? "text" : "number", options: o.enum, category: "Barcode options", showIf: (it) => o.for.includes(it.symbology || "code128") })),
    { key: "action", label: "Action", type: "action", category: "Interactivity" },
    ALT,
    { key: "hidden", label: "Hidden", type: "expr", category: "Visibility" }
  ],
  layout(item, lc) {
    const ctx = lc.ctxFor(item);
    if (hidden(item, ctx, lc)) return { height: 0, units: [] };
    const st = resolveStyle([lc.base, lc.named?.[item.styleName], item.style], ctx);
    const who = item.name || `Barcode at (${item.x}, ${item.y})`;
    const r = evalSafe(item.value ?? "", ctx, lc, who);
    const text = r.err ? "" : textOf(r.v, st, ctx, lc);
    const size = Number(st.fontSize) || 8;
    const show = item.showText !== false;
    const th = show ? size * 1.4 : 0;
    const above = item.captionPosition === "above";
    const a = ((Math.round(Number(item.rotate) / 90) || 0) * 90 % 360 + 360) % 360;
    const swap = a === 90 || a === 270;
    const cx = item.x + item.w / 2, cy = item.h / 2;
    const bw = swap ? item.h : item.w, bh = swap ? item.w : item.h;
    const bx = cx - bw / 2, by = cy - bh / 2;
    const q = Math.min(Math.max(0, Number(item.quietZone) || 0), bw / 3, bh / 3);
    const bc = paintBarcode({ type: item.symbology || "code128", text, x: bx + q, y: by + q, w: bw - 2 * q, h: bh - 2 * q, color: st.color || "#000", showText: show, textHeight: th, captionAbove: above, options: bwipOptions(item) });
    let items = [...bc.items];
    if (bc.error) {
      lc.warn(`${who}: ${bc.error}`);
      const tl = layoutTextLines(`Barcode error: ${bc.error}`, { ...st, color: "#b91c1c" }, item.w, lc.m);
      return { height: item.h, units: [{ top: 0, height: item.h, items: paintBox({ x: item.x, y: 0, w: item.w, h: item.h, st: { ...st, color: "#b91c1c", border: "0.5 dashed #b91c1c" }, tl, m: lc.m }) }] };
    }
    if (show && !bc.twoD && text) {
      const tl = layoutTextLines(text, { ...st, padding: 0 }, bw - 2 * q, lc.m, { wrap: false });
      items.push(...paintBox({ x: bx + q, y: above ? by + q : by + bh - q - th, w: bw - 2 * q, h: th, st: { ...st, padding: 0, verticalAlign: above ? "top" : "bottom", textAlign: st.textAlign === "auto" ? "center" : st.textAlign }, tl, m: lc.m }));
    }
    if (a) items = items.map((i) => ({ ...i, rotate: { a, cx, cy } }));
    addInteractivity(items, item, ctx, lc, { x: item.x, y: 0, w: item.w, h: item.h });
    const name = SYMBOLOGIES.find((s) => s.id === (item.symbology || "code128"))?.name || item.symbology || "code128";
    return { height: item.h, units: [{ top: 0, height: item.h, items }], alt: `${name} barcode${text ? `: ${text}` : ""}` };
  }
});
register("matrix", {
  label: "Matrix",
  defaults: () => ({
    type: "matrix",
    w: 360,
    h: 54,
    dataSet: null,
    rowGroup: "",
    columnGroup: "",
    value: "=Count(Fields)",
    valueFormat: "N0",
    corner: "",
    rowHeaderWidth: 110,
    columnWidth: 64,
    rowTotals: true,
    columnTotals: true,
    columnSort: "asc",
    rowSort: "asc",
    headerStyle: { fontWeight: "bold", backgroundColor: "#f1f5f9", borderBottom: "1 solid #94a3b8" },
    style: { padding: [3, 4, 3, 4] }
  }),
  // rows, columns and values: the designer's pivot editor (rowGroups / columnGroups / values, or the old single-group keys)
  props: [
    { key: "dataSet", label: "Data set", type: "dataset", category: "Data" },
    { key: "corner", label: "Corner text", type: "text", category: "Data" },
    { key: "rowHeaderWidth", label: "Row header width", type: "number", category: "Layout" },
    { key: "columnWidth", label: "Column width", type: "number", category: "Layout" },
    { key: "repeatHeader", label: "Repeat header on each page", type: "bool", category: "Layout" },
    { key: "overflow", label: "Wider than the page", type: "select", options: OVERFLOW_OPTIONS, category: "Layout" },
    { key: "pageOrder", label: "Page order", type: "select", options: [{ value: "down", label: "Down, then across" }, { value: "across", label: "Across, then down" }], category: "Layout" },
    { key: "hidden", label: "Hidden", type: "expr", category: "Visibility" }
  ],
  layout(item, lc) {
    const ctx = lc.ctxFor(item);
    if (hidden(item, ctx, lc)) return { height: 0, units: [] };
    let rows = item.dataSet && lc.dataSets[item.dataSet] || [];
    if (item.inheritRows && item.dataSet && ctx.current?.[item.dataSet]) rows = ctx.current[item.dataSet];
    else rows = related(rows, ctx);
    if (item.filters?.length) rows = applyFilters(rows, item.filters, ctx);
    const who = item.name || "Matrix";
    const it = { ...item, name: who };
    let p = buildPivot(it, rows, ctx, lc);
    const { spec, R, V } = p;
    const rhw = item.rowHeaderWidth || 110;
    const hw = spec.rowGroups.map((g) => Number(g.width) || rhw);
    const headW = hw.reduce((a, b) => a + b, 0);
    let cw = item.columnWidth || 64;
    const room = (lc.bodyWidth ?? 1e9) - item.x;
    if (spec.overflow === "shrink" && headW + cw * p.cols.length > room) {
      const nTot = p.cols.filter((c) => c.kind === "total").length;
      const nLeaf = (p.cols.length - nTot) / V;
      const fit = (room - headW) / p.cols.length;
      if (fit < 28) lc.warn(`${who}: ${nLeaf} columns do not fit the page; showing the first ${Math.max(1, Math.floor((room - headW) / 28) - nTot)}`, true);
      else lc.warn(`${who}: its columns are wider than the page, so they are narrowed to fit`);
      cw = Math.max(28, fit);
      const keep = Math.max(1, Math.floor((room - headW) / cw) - nTot);
      if (keep < p.cols.length - nTot) p = buildPivot(it, rows, ctx, { ...lc, colLimit: Math.max(1, Math.floor(keep / V)) });
    }
    const fmtOf = (v) => v.format ?? (["percentOfTotal", "percentOfRow", "percentOfColumn"].includes(v.show) ? "P1" : null);
    const vstyles = spec.values.map((v) => ({ format: fmtOf(v), textAlign: "right", ...v.style || {} }));
    const vbold = vstyles.map((s) => ({ ...s, fontWeight: "bold" }));
    const right = { textAlign: "right" };
    const cellStyle = item.cellStyle || { borderBottom: "0.5 solid #e5e7eb" };
    const totalStyle = item.totalStyle || { fontWeight: "bold", borderTop: "1 solid #94a3b8" };
    const N = R + p.cols.length;
    const columns = [...hw.map((width) => ({ width })), ...p.cols.map((c) => ({ width: Number(spec.values[c.v].width) || cw }))];
    const click = (o, c) => {
      if (c.action) o.action = c.action;
      if (c.bookmark) o.bookmark = c.bookmark;
      if (c.ctx) o.ctx = c.ctx;
      return o;
    };
    const hcell = (c) => {
      const o = c.role === "corner" ? { value: c.text } : { raw: c.text };
      if (c.rowSpan > 1) o.rowSpan = c.rowSpan;
      if (c.colSpan > 1) o.colSpan = c.colSpan;
      if (c.toggle) o.toggle = c.toggle;
      if (c.role !== "corner") o.style = spec.legacy || c.colSpan === 1 ? right : { textAlign: "center" };
      return click(o, c);
    };
    const header = p.header.map((hr) => {
      const cells = new Array(N).fill(null);
      for (const c of hr) cells[c.c] = hcell(c);
      return { height: 18, style: item.headerStyle, cells };
    });
    const bodyRow = (br) => {
      const cells = new Array(N).fill(null);
      for (const c of br.cells) {
        if (c.role === "value") {
          cells[c.c] = click({ raw: c.raw, style: c.colTotal && br.kind !== "total" ? vbold[c.v] : vstyles[c.v] }, c);
          continue;
        }
        const o = { raw: c.text };
        if (c.rowSpan > 1) o.rowSpan = c.rowSpan;
        if (c.colSpan > 1) o.colSpan = c.colSpan;
        if (c.toggle) o.toggle = c.toggle;
        if (c.indent) o.indent = c.indent;
        const gs = spec.rowGroups[c.level]?.style;
        if (gs && c.role !== "total") o.style = gs;
        cells[c.c] = click(o, c);
      }
      const total = br.kind === "total";
      return { height: total && br.level === 0 ? 18 : 16, style: total ? totalStyle : cellStyle, cells };
    };
    const body = [], footer = [];
    p.body.forEach((br, i) => {
      if (br.kind === "total" && br.level === 0 && i === p.body.length - 1) {
        footer.push(bodyRow(br));
        return;
      }
      const kind = br.kind !== "total" ? "detail" : br.level === 0 ? "footer" : spec.rowGroups[br.level].total === "before" ? "groupHeader" : "groupFooter";
      body.push({ row: bodyRow(br), kind, level: br.kind === "total" ? br.level : Math.max(0, br.level) });
    });
    const table = {
      type: "table",
      name: who,
      x: item.x,
      y: item.y,
      w: 0,
      h: item.h,
      dataSet: null,
      repeatHeader: item.repeatHeader !== false,
      style: item.style,
      columns,
      header,
      footer,
      __body: rows.length ? body : [],
      __rows: rows,
      __ctx: ctx,
      noRowsText: "No data",
      // too wide: continues on the next pages (the table warns when the author did not ask for it), "clip" cuts at the edge;
      // "shrink" was done above
      overflow: spec.overflow === "paginate" ? item.overflow : spec.overflow,
      repeatColumns: R,
      pageOrder: spec.pageOrder,
      columnBlock: V
    };
    return ITEMS.table.layout(table, lc);
  }
});
register("subreport", {
  label: "Subreport",
  defaults: () => ({ type: "subreport", w: 360, h: 60, report: "", params: {} }),
  props: [
    { key: "report", label: "Report", labelKey: "subreportTarget", type: "report", category: "Data" },
    { key: "params", label: "Parameters", type: "params", category: "Data" },
    { key: "keepTogether", label: "Keep on one page", type: "bool", category: "Layout" },
    { key: "hidden", label: "Hidden", type: "expr", category: "Visibility" }
  ],
  layout(item, lc) {
    const ctx = lc.ctxFor(item);
    if (hidden(item, ctx, lc)) return { height: 0, units: [] };
    const params = {};
    for (const [k, v] of Object.entries(item.params || {})) {
      const r = evalSafe(v, ctx, lc, `${item.name || item.type} parameter ${k}`);
      params[k] = r.v instanceof Date ? isoDate(r.v, ctx.timeZone) : r.v;
    }
    const key = `${item.report}|${JSON.stringify(params)}`;
    const sub = lc.subreports;
    const placeholder = (msg) => {
      const st = resolveStyle([lc.base, { color: "#b91c1c", fontStyle: "italic", border: "0.5 dashed #b91c1c", padding: 4 }], ctx);
      const tl = layoutTextLines(msg, st, item.w, lc.m);
      return { height: item.h, units: [{ top: 0, height: item.h, items: paintBox({ x: item.x, y: 0, w: item.w, h: item.h, st, tl, m: lc.m }) }] };
    };
    if (!item.report) return placeholder("Pick a report for this subreport");
    if (!sub) return placeholder(`Subreport "${item.report}" needs a report loader`);
    if (sub.mode === "collect") {
      sub.requests.set(key, { report: item.report, params });
      return { height: item.h, units: [{ top: 0, height: item.h, items: [] }] };
    }
    const res = sub.results.get(key);
    if (!res) return placeholder(`Subreport "${item.report}" did not load`);
    if (res.error) {
      lc.warn(`${item.name || item.type}: ${res.error}`);
      return placeholder(`Subreport "${item.report}": ${res.error}`);
    }
    const block = item.keepTogether ? `s:${item.name || item.type}:${lc.nextId()}` : void 0;
    const units = res.units.map((u) => ({ ...u, items: shiftItems(u.items, item.x, 0), ...u.cont ? { cont: shiftItems(u.cont, item.x, 0) } : {}, x0: (u.x0 ?? 0) + item.x, x1: (u.x1 ?? item.w) + item.x, block: u.block || block, tableId: void 0 }));
    const tables = res.tables.map((t) => ({ ...t, x0: t.x0 + item.x, x1: t.x1 + item.x, headerItems: shiftItems(t.headerItems, item.x, 0), id: `sub${lc.nextId()}` }));
    for (const r of res.regions || []) lc.regions?.push(r);
    return { height: res.height, units: units.length ? units : [{ top: 0, height: 0, items: [] }], tables };
  }
});
function withPartProps(lc, props) {
  return { ...lc, ctxFor: (x) => ({ ...lc.ctxFor(x), partProps: props }) };
}
function notice(item, lc, msg) {
  const st = resolveStyle([lc.base, { color: "#b91c1c", fontStyle: "italic", border: "0.5 dashed #b91c1c", padding: 4 }], lc.ctxFor(item));
  const tl = layoutTextLines(msg, st, item.w, lc.m);
  return { height: item.h, units: [{ top: 0, height: item.h, items: paintBox({ x: item.x, y: 0, w: item.w, h: item.h, st, tl, m: lc.m }) }] };
}
var emptyBox = (item) => ({ height: item.h, units: [{ top: 0, height: item.h, items: [] }] });
register("part", {
  label: "Report part",
  styleProps: [],
  // no style of its own
  defaults: () => ({ type: "part", w: 200, h: 60, library: "", part: "", properties: {} }),
  props: [
    { key: "pageBreakBefore", label: "Page break before", type: "bool", category: "Layout" },
    { key: "hidden", label: "Hidden", type: "expr", category: "Visibility" }
  ],
  layout(item, lc) {
    const ctx = lc.ctxFor(item);
    if (hidden(item, ctx, lc)) return { height: 0, units: [] };
    const who = item.name || "Part";
    if (!item.library || !item.part) return notice(item, lc, "Pick a report part");
    if (item.__cycle) return notice(item, lc, `Part "${item.part}" would include itself`);
    const p = lc.parts?.get(`${item.library}\0${item.part}`);
    if (!p) {
      lc.warn(`${who}: the part "${item.part}" of "${item.library}" needs a report loader`);
      return notice(item, lc, `Part "${item.part}" of "${item.library}"`);
    }
    if (p.error) {
      lc.warn(`${who}: ${p.error}`);
      return notice(item, lc, `${p.error}`);
    }
    const it = { ...p.item, x: item.x, y: item.y, name: who, partProps: void 0, layer: void 0 };
    const props = { ...p.item.partProps || {}, ...p.props, ...item.properties && typeof item.properties === "object" ? item.properties : {} };
    const spec = ITEMS[it.type];
    if (!spec) return notice(item, lc, `Unknown item type "${it.type}"`);
    const res = spec.layout(it, withPartProps(lc, props));
    if (item.pageBreakBefore && res.units[0]) res.units[0] = { ...res.units[0], breakBefore: true };
    return res;
  }
});
register("placeholder", {
  label: "Content placeholder",
  styleProps: [],
  // no style of its own
  defaults: () => ({ type: "placeholder", w: 400, h: 160 }),
  props: [],
  layout: (item) => emptyBox(item)
});
function fitRows(units, room) {
  let h = 0, n = 0;
  for (const u of units) {
    if (n && h + u.height > room + 0.01) break;
    h += u.height;
    n++;
  }
  return n;
}
function stack(units, dx) {
  const items = [];
  let y = 0;
  for (const u of units) {
    for (const i of shiftItems(u.items, dx, y)) items.push(i);
    y += u.height;
  }
  return items;
}
register("overflow", {
  label: "Overflow placeholder",
  styleProps: [],
  // no style of its own
  defaults: () => ({ type: "overflow", w: 360, h: 200 }),
  props: [
    { key: "overflowTo", label: "Then continue in", labelKey: "overflowThen", type: "overflowTarget", category: "Data" }
  ],
  layout(item, lc) {
    const o = lc.overflow;
    const p = o?.pending.get(item.name);
    if (!p) return emptyBox(item);
    o.pending.delete(item.name);
    o.head || (o.head = item.name);
    const hh = p.head.reduce((a, u) => a + u.height, 0);
    const n = fitRows(p.units, item.h - hh);
    const items = stack([...p.head, ...p.units.slice(0, n)], item.x - p.x);
    if (n < p.units.length) {
      const rest = { ...p, units: p.units.slice(n) };
      if (item.overflowTo) o.pending.set(item.overflowTo, { ...rest, to: item.overflowTo });
      else {
        o.pending.set(o.head, rest);
        o.more = item.name;
      }
    }
    return { height: item.h, units: [{ top: 0, height: item.h, items }] };
  }
});
register("toc", {
  label: "Table of contents",
  defaults: () => ({ type: "toc", w: 400, h: 40, title: "Contents", levels: 3, style: {} }),
  props: [
    { key: "title", label: "Title", type: "text", category: "Data" },
    { key: "levels", label: "Levels to show", type: "number", category: "Data" },
    { key: "source", label: "Entries from", type: "select", options: ["bookmarks", "headings"], category: "Data" },
    { key: "numbering", label: "Numbering (decimal, roman, alpha; one per level: roman,alpha)", type: "text", category: "Data" },
    { key: "styleName", label: "Named style", type: "stylename", category: "Text" },
    { key: "pageBreakAfter", label: "Page break after", type: "bool", category: "Layout" }
  ],
  layout(item, lc) {
    const ctx = lc.ctxFor(item);
    const st = resolveStyle([lc.base, lc.named?.[item.styleName], item.style], ctx);
    const units = [];
    let y = 0;
    if (item.title) {
      const tst = { ...st, fontWeight: "bold", fontSize: (Number(st.fontSize) || 9) * 1.5, padding: [0, 0, 6, 0] };
      const tl = layoutTextLines(String(item.title), tst, item.w, lc.m);
      const ti = paintBox({ x: item.x, y: 0, w: item.w, h: tl.needed, st: tst, tl, m: lc.m });
      for (const x of ti) if (x.t === "text") x.tocTitle = true;
      units.push({ top: 0, height: tl.needed, items: ti, keepWithNext: true });
      y += tl.needed;
    }
    const fromHeadings = item.source === "headings";
    const entries = (lc.toc || []).map((e, i) => ({ ...e, i })).filter((e) => !!e.heading === fromHeadings && (e.level || 0) < (item.levels || 3));
    const kinds = (Array.isArray(item.numbering) ? item.numbering : String(item.numbering || "").split(",")).map((k) => String(k).trim()).filter((k) => ["decimal", "roman", "alpha"].includes(k));
    const nums2 = kinds.length ? tocNumbers(entries, kinds) : null;
    if (!entries.length) {
      const tl = layoutTextLines("Entries appear here: add bookmarks to items or cells.", { ...st, fontStyle: "italic", color: "#9ca3af" }, item.w, lc.m);
      units.push({ top: y, height: tl.needed, items: paintBox({ x: item.x, y: 0, w: item.w, h: tl.needed, st: { ...st, fontStyle: "italic", color: "#9ca3af" }, tl, m: lc.m }) });
      return { height: Math.max(item.h, y + tl.needed), units };
    }
    const key = resolveFontKey(st.fontFamily, st.fontWeight, st.fontStyle);
    const size = Number(st.fontSize) || 9;
    const lh = size * 1.6;
    const { ascent } = lc.m.metrics(key, size);
    for (const [ei, e] of entries.entries()) {
      const indent = (e.level || 0) * 12;
      const num4 = String(e.page);
      const nw = lc.m.width(num4, key, size);
      const label = lc.m.ellipsize(nums2 ? `${nums2[ei]} ${e.label}` : e.label, key, size, item.w - indent - Math.max(nw, lc.m.width("0000", key, size)) - 24);
      const lw = lc.m.width(label, key, size);
      const base = (lh - size) / 2 + ascent * 0.9;
      const items = [
        { t: "text", font: key, size, color: st.color || "#111", lines: [{ x: item.x + indent, y: base, text: label, w: lw }], tocEntry: e.i },
        { t: "line", x1: item.x + indent + lw + 4, y1: base, x2: item.x + item.w - nw - 4, y2: base, stroke: "#9ca3af", strokeWidth: 0.6, dash: [0.6, 2.4], tocDots: e.i },
        { t: "text", font: key, size, color: st.color || "#111", lines: [{ x: item.x + item.w - nw, y: base, text: num4, w: nw }], tocPage: e.i, tocEntry: e.i },
        { t: "link", x: item.x, y: 0, w: item.w, h: lh, action: e.heading && typeof e.page === "number" ? { type: "bookmark", target: e.label, page: e.page, y: e.y } : { type: "bookmark", target: e.label }, tocLink: e.i, tocEntry: e.i }
      ];
      units.push({ top: y, height: lh, items });
      y += lh;
    }
    return { height: Math.max(item.h, y), units };
  }
});

// src/engine/paginate/index.js
var EPS2 = 0.01;
function paginate(units, tables, pageH, warn, stats) {
  const end = units.reduce((m, u) => Math.max(m, u.top + u.height), 0);
  const pages = [];
  if (!units.length || end <= EPS2) return [{ top: 0, bottom: 0, offset: 0, repeat: [], units }];
  const cand = [...new Set(units.flatMap((u) => [u.top, u.top + u.height]).map((v) => Math.round(v * 100) / 100))].sort((a, b) => a - b);
  const blockMap = /* @__PURE__ */ new Map();
  for (const u of units) if (u.block) {
    const b = blockMap.get(u.block);
    if (b) {
      b.top = Math.min(b.top, u.top);
      b.bottom = Math.max(b.bottom, u.top + u.height);
      if (u.blockOpen) b.open = true;
    } else blockMap.set(u.block, { top: u.top, bottom: u.top + u.height, open: !!u.blockOpen });
  }
  const blockUnits = /* @__PURE__ */ new Map();
  for (const u of units) if (u.block) {
    let l = blockUnits.get(u.block);
    if (!l) blockUnits.set(u.block, l = []);
    l.push(u);
  }
  const blocks = [...blockMap.values()].filter((b) => !b.open && b.bottom - b.top <= pageH + EPS2);
  for (const b of blocks) cand.push(b.top, b.bottom);
  cand.sort((a, b) => a - b);
  const grpRows = /* @__PURE__ */ new Map();
  for (const u of units) if (u.grp) {
    let g = grpRows.get(u.grp);
    if (!g) grpRows.set(u.grp, g = { tops: /* @__PURE__ */ new Set(), first: u.top, last: 0, block: u.block || null, before: u.grpBefore || 0 });
    g.tops.add(u.top);
    g.last = Math.max(g.last, u.top + u.height);
    if (g.block !== (u.block || null)) g.block = void 0;
  }
  const widowGroups = [...grpRows.values()].map((g) => ({ first: g.first, last: g.last, tops: [...g.tops].sort((a, b) => a - b), block: g.block, before: g.before, n: g.tops.size + g.before })).filter((g) => g.n >= 4 || !g.before && g.n >= 2 && g.last - g.first <= pageH + EPS2).sort((a, b) => a.first - b.first);
  const wFirst = widowGroups.map((g) => g.first);
  const wMaxLast = [];
  widowGroups.forEach((g, i) => wMaxLast.push(Math.max(i ? wMaxLast[i - 1] : -Infinity, g.last)));
  const rowsAbove = (tops, y) => {
    let lo = 0, hi = tops.length;
    while (lo < hi) {
      const mid = lo + hi >> 1;
      if (tops[mid] < y - EPS2) lo = mid + 1;
      else hi = mid;
    }
    return lo;
  };
  const tick = (n) => {
    if (stats) stats.work += n;
  };
  const splitOk = (y, withBlocks = false) => {
    let lo = 0, hi = widowGroups.length;
    while (lo < hi) {
      const mid = lo + hi >> 1;
      if (wFirst[mid] < y - EPS2) lo = mid + 1;
      else hi = mid;
    }
    for (let i = lo - 1; i >= 0 && wMaxLast[i] > y + EPS2; i--) {
      tick(1);
      const g = widowGroups[i];
      if (g.last <= y + EPS2 || g.block && !withBlocks) continue;
      if (g.n < 4) return false;
      const above = g.before + rowsAbove(g.tops, y);
      if (above < 2 || g.n - above < 2) return false;
    }
    return true;
  };
  const maxH = units.reduce((m, u) => Math.max(m, u.height), 0);
  const firstAtOrAfter = (v) => {
    let lo = 0, hi = units.length;
    while (lo < hi) {
      const mid = lo + hi >> 1;
      if (units[mid].top < v) lo = mid + 1;
      else hi = mid;
    }
    return lo;
  };
  const placed = /* @__PURE__ */ new Set();
  const cutsUnit = (y) => {
    const from = firstAtOrAfter(y - maxH - 1), to = firstAtOrAfter(y + EPS2 * 2);
    for (let i = from; i < to + 1 && i < units.length; i++) {
      tick(1);
      const u = units[i];
      if (!placed.has(u) && u.top < y - EPS2 && u.top + u.height > y + EPS2) return true;
    }
    return false;
  };
  const valid = (y) => {
    if (!splitOk(y)) return false;
    const from = firstAtOrAfter(y - maxH - 1);
    const to = firstAtOrAfter(y + EPS2 * 2);
    for (let i = from; i < to + 1 && i < units.length; i++) {
      tick(1);
      const u = units[i];
      if (placed.has(u)) continue;
      const b = u.top + u.height;
      if (u.top < y - EPS2 && b > y + EPS2) return false;
      if (u.keepWithNext && Math.abs(b - y) < EPS2 && b < end - EPS2) return false;
      if (u.keepWithPrevious && Math.abs(u.top - y) < EPS2) return false;
    }
    for (const bl of blocks) if (bl.top < y - EPS2 && bl.bottom > y + EPS2) return false;
    return true;
  };
  const emptyFor = (top2, y) => {
    let f4 = firstAtOrAfter(top2 - EPS2);
    while (f4 < units.length && placed.has(units[f4])) f4++;
    return f4 >= units.length || units[f4].top >= y - EPS2;
  };
  const ragged = (top2, y, room) => {
    const moved = [];
    const movedBlocks = /* @__PURE__ */ new Set();
    for (let i = firstAtOrAfter(y - maxH - 1); i < units.length && units[i].top < y - EPS2; i++) {
      const u = units[i];
      if (placed.has(u) || u.top + u.height <= y + EPS2) continue;
      if (u.top <= top2 + EPS2 || u.height > room + EPS2 || u.keepWithPrevious) return null;
      if (u.block) {
        const bl = blockMap.get(u.block);
        if (movedBlocks.has(bl)) continue;
        if (!bl || bl.open || bl.bottom - bl.top > room + EPS2 || bl.top <= top2 + EPS2) return null;
        movedBlocks.add(bl);
        for (const m of blockUnits.get(u.block)) if (!placed.has(m)) moved.push(m);
        continue;
      }
      moved.push(u);
    }
    if (!moved.length) return null;
    if (!splitOk(moved.reduce((m, u) => Math.min(m, u.top), Infinity))) return null;
    for (const u of units) if (u.keepWithNext && !placed.has(u) && u.top + u.height <= y + EPS2 && moved.some((m) => Math.abs(m.top - (u.top + u.height)) < EPS2)) return null;
    for (const bl of blocks) if (!movedBlocks.has(bl) && bl.top < y - EPS2 && bl.bottom > y + EPS2) return null;
    return new Set(moved);
  };
  const fitsFrom = (y) => {
    if (y + pageH >= end - EPS2) return true;
    for (const c of cand) if (c > y + EPS2 && c <= y + pageH + EPS2 && valid(c)) return true;
    return false;
  };
  const useless = (top2, y) => emptyFor(top2, y) && !fitsFrom(y);
  const gridBreaks = /* @__PURE__ */ new Map();
  const mirror = (u) => !!(u.hgrid && u.hgrid.set > 0 && u.hgrid.row > 0 && gridBreaks.get(u.hgrid.id)?.has(u.hgrid.row));
  let top = 0, guard = 0, cut = false;
  while (top < end - EPS2) {
    if (++guard > 1e5) {
      warn("Pagination stopped: too many pages");
      break;
    }
    if (cut) {
      cut = false;
      let f4 = firstAtOrAfter(top - EPS2);
      while (f4 < units.length && placed.has(units[f4])) f4++;
      if (f4 >= units.length) break;
      top = Math.max(top, units[f4].top);
    }
    if (pages.length) {
      const f4 = firstAtOrAfter(top - EPS2);
      for (let i = f4; i < units.length && units[i].top < units[f4].top + EPS2; i++) {
        if ((units[i].breakBefore || mirror(units[i])) && units[i].top > top + EPS2) {
          top = units[i].top;
          break;
        }
      }
    }
    let repeat = pages.length ? tables.filter((t) => t.top < top - EPS2 && t.bottom > top + EPS2) : [];
    if (repeat.length > 1) repeat = repeat.filter((t) => !t.owner || !repeat.some((r) => r !== t && r.owner === t.owner && r.depth > t.depth));
    const offset = repeat.reduce((m, t) => Math.max(m, t.headerHeight), 0);
    let limit = top + Math.max(pageH - offset, 1);
    const firstHere = units[firstAtOrAfter(top - EPS2)];
    for (let i = firstAtOrAfter(top - maxH - 1); i < units.length && units[i].top < limit; i++) {
      const u = units[i];
      if (placed.has(u)) continue;
      if ((u.breakBefore || mirror(u)) && u.top > top + EPS2 && u.top < limit && firstHere.top < u.top - EPS2) limit = u.top;
      const ub = u.top + u.height;
      if (u.breakAfter && ub > top + EPS2 && ub < limit && ub < end - EPS2) limit = ub;
    }
    const forced = limit < top + Math.max(pageH - offset, 1) - EPS2;
    let bottom, moved = null;
    if (limit >= end - EPS2) bottom = end;
    else if (forced && valid(limit)) bottom = limit;
    else {
      bottom = -1;
      let lo = 0, hi = cand.length;
      while (lo < hi) {
        const mid = lo + hi >> 1;
        if (cand[mid] > limit + EPS2) hi = mid;
        else lo = mid + 1;
      }
      const last = lo - 1;
      for (let i = last; i >= 0; i--) {
        const y = cand[i];
        if (y > limit + EPS2) continue;
        if (y <= top + EPS2) break;
        if (valid(y) && !useless(top, y)) {
          bottom = y;
          break;
        }
      }
      if (!forced && bottom >= 0 && bottom < limit - pageH / 4) {
        const mv = ragged(top, limit, pageH - offset);
        if (mv) {
          bottom = limit;
          moved = mv;
        }
      }
      if (bottom < 0) {
        const mv = ragged(top, limit, pageH - offset);
        if (mv) {
          bottom = limit;
          moved = mv;
        }
      }
      if (bottom < 0) {
        for (const widowRule of [true, false]) {
          for (let i = last; i >= 0 && bottom < 0; i--) {
            const y = cand[i];
            if (y > limit + EPS2) continue;
            if (y <= top + EPS2) break;
            if ((!widowRule || splitOk(y, true)) && !cutsUnit(y) && !useless(top, y)) bottom = y;
          }
          if (bottom >= 0) break;
        }
        if (bottom < 0) {
          bottom = limit;
          cut = true;
          warn(`An item is taller than the page (page ${pages.length + 1}). Its lower part is cut.`, true);
        }
      }
    }
    if (!moved && !cut) {
      let g = firstAtOrAfter(top - EPS2);
      while (g < units.length && placed.has(units[g])) g++;
      if (g < units.length && units[g].top >= bottom - EPS2) {
        top = units[g].top;
        continue;
      }
    }
    const onPage = [];
    for (let i = firstAtOrAfter(top - EPS2); i < units.length && units[i].top < bottom - EPS2; i++) {
      const u = units[i];
      if (placed.has(u) || moved?.has(u)) continue;
      onPage.push(u);
      if (moved || placed.size) placed.add(u);
    }
    const g0 = onPage.find((u) => u.hgrid && u.hgrid.set === 0);
    if (g0 && g0.hgrid.row > 0) {
      let set = gridBreaks.get(g0.hgrid.id);
      if (!set) gridBreaks.set(g0.hgrid.id, set = /* @__PURE__ */ new Set());
      set.add(g0.hgrid.row);
    }
    pages.push({ top, bottom, offset, repeat, units: onPage });
    top = moved ? Math.min(...[...moved].map((u) => u.top)) : bottom;
  }
  return pages;
}

// src/engine/layout.js
var EPS3 = 0.01;
var FIGURES = /* @__PURE__ */ new Set(["image", "chart", "map", "barcode", "shape", "line", "sparkline", "databar", "bullet", "iconset", "rangebar"]);
var HOLDS = /* @__PURE__ */ new WeakMap();
function holdsSubreport(it) {
  let h = HOLDS.get(it);
  if (h === void 0) {
    const find = (n, d) => !!n && typeof n === "object" && d < 64 && (n.type === "subreport" || Object.values(n).some((v) => v && typeof v === "object" && find(v, d + 1)));
    h = find(it, 0);
    HOLDS.set(it, h);
  }
  return h;
}
function layoutItems(items, lc, { dx = 0 } = {}) {
  const shown = lc.layerOff ? (items || []).filter((it) => !lc.layerOff(it)) : items || [];
  const sorted = [...shown].sort((a, b) => a.y - b.y || a.x - b.x);
  const laid = sorted.map((it0) => {
    const it = dx ? { ...it0, x: it0.x + dx } : it0;
    const spec = ITEMS[it.type];
    if (!spec) {
      lc.warn(`Unknown item type "${it.type}"`);
      return { it, res: { height: 0, units: [] } };
    }
    if (lc.subreports?.mode === "collect" && !holdsSubreport(it0)) return { it, res: { height: it.h, units: [] } };
    return { it, res: spec.layout(it, it.partProps && typeof it.partProps === "object" ? withPartProps(lc, it.partProps) : lc) };
  });
  const shift = new Array(laid.length).fill(0);
  const units = [], tables = [];
  let height = 0;
  laid.forEach((L, i) => {
    const it = L.it;
    let s = 0;
    for (let j = 0; j < i; j++) {
      const J = laid[j].it;
      const overlapX = J.x < it.x + Math.max(it.w, 1) - EPS3 && it.x < J.x + Math.max(J.w, 1) - EPS3;
      if (overlapX && J.y + J.h <= it.y + EPS3) {
        let delta = laid[j].res.height - J.h;
        if (delta < 0 && !(J.canShrink || laid[j].res.units.length === 0)) delta = 0;
        s = Math.max(s, shift[j] + delta);
      }
    }
    shift[i] = s;
    const top = it.y + s;
    const x0 = it.x, x1 = it.x + (L.res.width ?? it.w);
    const own = L.res.table ? { id: lc.nextId(), ...L.res.table } : null;
    const us = L.res.units;
    const alt = it.alt || L.res.alt;
    const tag3 = alt || it.headingLevel || FIGURES.has(it.type) ? { k: it.type, id: lc.nextId(), alt: alt ? String(alt).slice(0, 2e3) : void 0, h: Number(it.headingLevel) || void 0 } : null;
    for (let k = 0; k < us.length; k++) {
      const u = us[k];
      u.x0 = u.x0 ?? x0;
      u.x1 = u.x1 ?? x1;
      u.top = top + u.top;
      u.tableId = own ? own.id : u.tableId;
      u.breakBefore = u.breakBefore || k === 0 && !!it.pageBreakBefore;
      u.breakAfter = u.breakAfter || k === us.length - 1 && !!it.pageBreakAfter;
      if (tag3) for (const d of u.items) d.tag ?? (d.tag = tag3);
      units.push(u);
    }
    if (own) tables.push({ ...own, top, bottom: top + L.res.height, x0, x1 });
    for (const t of L.res.tables || []) tables.push({ ...t, top: t.top + top, bottom: t.bottom + top });
    height = Math.max(height, top + (us.length ? L.res.height : 0), L.res.units.length ? 0 : 0);
  });
  for (let i = 0; i < laid.length; i++) {
    const L = laid[i];
    if (L.res.units.length) height = Math.max(height, L.it.y + shift[i] + L.res.height);
  }
  units.sort((a, b) => a.top - b.top);
  return { units, tables, height };
}
function layerFilter(layers, target) {
  const off = /* @__PURE__ */ new Set();
  for (const l of Array.isArray(layers) ? layers : []) {
    if (!l || typeof l.name !== "string") continue;
    const t = l.target || "all";
    if (l.visible === false || t === "design" || t !== "all" && t !== target) off.add(l.name);
  }
  return off.size ? (it) => it.layer != null && off.has(it.layer) : null;
}

// src/engine/schema/report.schema.js
var REPORT_SCHEMA = {
  "$schema": "https://json-schema.org/draft/2020-12/schema",
  "$id": "https://github.com/MrArun005/reportwright/blob/main/src/engine/schema/report.schema.js",
  "title": "ReportWright report definition",
  "$ref": "#/$defs/Report",
  "$defs": {
    "Expr": {
      "x-ts-decl": "export type Expr<T = string | number | boolean> = T | `=${string}`;",
      "description": 'A literal value or an expression ("=Sum(Fields.amount)").'
    },
    "Style": {
      "type": "object",
      "properties": {
        "fontFamily": {
          "type": "string"
        },
        "fontSize": {
          "x-ts": "number | string"
        },
        "fontWeight": {
          "x-ts": "'normal' | 'bold' | number | string"
        },
        "fontStyle": {
          "x-ts": "'normal' | 'italic' | string"
        },
        "color": {
          "type": "string"
        },
        "backgroundColor": {
          "type": "string"
        },
        "backgroundImage": {
          "type": "string"
        },
        "backgroundFit": {
          "x-ts": "'contain' | 'cover' | 'fill' | string"
        },
        "textAlign": {
          "x-ts": "'left' | 'center' | 'right' | 'justify' | 'auto' | string"
        },
        "verticalAlign": {
          "x-ts": "'top' | 'middle' | 'bottom' | string"
        },
        "textDecoration": {
          "type": "string"
        },
        "lineHeight": {
          "x-ts": "number | string"
        },
        "padding": {
          "x-ts": "number | [number, number, number, number] | string"
        },
        "border": {
          "type": "string"
        },
        "borderTop": {
          "type": "string"
        },
        "borderRight": {
          "type": "string"
        },
        "borderBottom": {
          "type": "string"
        },
        "borderLeft": {
          "type": "string"
        },
        "format": {
          "type": "string"
        },
        "writingMode": {
          "type": "string"
        },
        "stroke": {
          "type": "string"
        },
        "strokeWidth": {
          "x-ts": "number | string"
        },
        "strokeDash": {
          "type": "string"
        },
        "fill": {
          "type": "string"
        },
        "radius": {
          "x-ts": "number | string"
        }
      },
      "additionalProperties": true,
      "description": "Text and box style. Values may also be expressions. Unknown keys are allowed (newer engine versions add more)."
    },
    "Action": {
      "description": "What a click does: open a URL, drill to another report, jump to a bookmark, or set parameters and run again.",
      "anyOf": [
        {
          "type": "object",
          "properties": {
            "type": {
              "const": "none"
            }
          },
          "required": [
            "type"
          ]
        },
        {
          "type": "object",
          "properties": {
            "type": {
              "const": "url"
            },
            "url": {
              "x-ts": "Expr<string>"
            }
          },
          "required": [
            "type",
            "url"
          ]
        },
        {
          "type": "object",
          "properties": {
            "type": {
              "const": "report"
            },
            "report": {
              "x-ts": "Expr<string>"
            },
            "params": {
              "x-ts": "Record<string, Expr>",
              "type": "object"
            }
          },
          "required": [
            "type",
            "report"
          ]
        },
        {
          "type": "object",
          "properties": {
            "type": {
              "const": "bookmark"
            },
            "target": {
              "x-ts": "Expr<string>"
            }
          },
          "required": [
            "type",
            "target"
          ]
        },
        {
          "type": "object",
          "properties": {
            "type": {
              "const": "params"
            },
            "params": {
              "x-ts": "Record<string, Expr>",
              "type": "object"
            },
            "toggle": {
              "type": "boolean"
            }
          },
          "required": [
            "type",
            "params"
          ]
        }
      ]
    },
    "ItemBase": {
      "type": "object",
      "properties": {
        "id": {
          "type": "string"
        },
        "name": {
          "type": "string"
        },
        "x": {
          "type": "number"
        },
        "y": {
          "type": "number"
        },
        "w": {
          "type": "number"
        },
        "h": {
          "type": "number"
        },
        "style": {
          "$ref": "#/$defs/Style"
        },
        "styleName": {
          "type": "string"
        },
        "hidden": {
          "x-ts": "Expr<boolean>"
        },
        "dataSet": {
          "x-ts": "string | null"
        },
        "alt": {
          "type": "string",
          "description": "alternative text for screen readers (accessible PDF, Word, HTML)"
        },
        "keepTogether": {
          "type": "boolean"
        },
        "pageBreakBefore": {
          "type": "boolean"
        },
        "pageBreakAfter": {
          "type": "boolean"
        },
        "bookmark": {
          "x-ts": "Expr<string>"
        },
        "tooltip": {
          "x-ts": "Expr<string>"
        },
        "action": {
          "$ref": "#/$defs/Action"
        }
      },
      "required": [
        "x",
        "y",
        "w",
        "h"
      ],
      "x-internal": true
    },
    "TextBox": {
      "allOf": [
        {
          "$ref": "#/$defs/ItemBase"
        },
        {
          "type": "object",
          "properties": {
            "type": {
              "const": "textbox"
            },
            "value": {
              "x-ts": "Expr"
            },
            "canGrow": {
              "type": "boolean"
            },
            "canShrink": {
              "type": "boolean"
            },
            "shrinkToFit": {
              "type": "boolean"
            },
            "minFontSize": {
              "type": "number"
            },
            "shrinkStep": {
              "type": "number"
            },
            "rotate": {
              "type": "number"
            },
            "headingLevel": {
              "x-ts": "1 | 2 | 3 | 4 | 5 | 6 | '1' | '2' | '3' | '4' | '5' | '6'",
              "enum": [
                1,
                2,
                3,
                4,
                5,
                6,
                "1",
                "2",
                "3",
                "4",
                "5",
                "6"
              ],
              "description": '1–6: listed by a table of contents with source "headings"'
            },
            "dir": {
              "enum": [
                "ltr",
                "rtl",
                "auto"
              ],
              "description": "text direction: auto (default) from the first strong character"
            }
          },
          "required": [
            "type"
          ]
        }
      ]
    },
    "RichText": {
      "allOf": [
        {
          "$ref": "#/$defs/ItemBase"
        },
        {
          "type": "object",
          "properties": {
            "type": {
              "const": "richtext"
            },
            "value": {
              "type": "string"
            },
            "htmlFromData": {
              "type": "boolean"
            },
            "canGrow": {
              "type": "boolean"
            },
            "canShrink": {
              "type": "boolean"
            },
            "listIndent": {
              "type": "number"
            },
            "paragraphSpacing": {
              "type": "number"
            }
          },
          "required": [
            "type"
          ]
        }
      ]
    },
    "Image": {
      "allOf": [
        {
          "$ref": "#/$defs/ItemBase"
        },
        {
          "type": "object",
          "properties": {
            "type": {
              "const": "image"
            },
            "src": {
              "x-ts": "Expr<string>",
              "description": `URL, data URI, "embedded:name" (the report's images), or a field holding base64 text or bytes`
            },
            "fit": {
              "enum": [
                "contain",
                "cover",
                "fill",
                "clip"
              ]
            },
            "autoSize": {
              "type": "boolean",
              "description": "size the box to the image (96 dpi); data and embedded images only"
            }
          },
          "required": [
            "type"
          ]
        }
      ]
    },
    "Line": {
      "allOf": [
        {
          "$ref": "#/$defs/ItemBase"
        },
        {
          "type": "object",
          "properties": {
            "type": {
              "const": "line"
            },
            "direction": {
              "enum": [
                "down",
                "up"
              ]
            }
          },
          "required": [
            "type"
          ]
        }
      ]
    },
    "Shape": {
      "allOf": [
        {
          "$ref": "#/$defs/ItemBase"
        },
        {
          "type": "object",
          "properties": {
            "type": {
              "const": "shape"
            },
            "shape": {
              "enum": [
                "rect",
                "ellipse"
              ]
            }
          },
          "required": [
            "type"
          ]
        }
      ]
    },
    "SortSpec": {
      "type": "object",
      "description": "One sort key: the rows (or groups) are ordered by by, ascending or descending.",
      "properties": {
        "by": {
          "x-ts": "Expr",
          "description": "the expression to sort by, e.g. =Fields.name"
        },
        "dir": {
          "enum": [
            "asc",
            "desc"
          ],
          "description": "asc (default) or desc"
        }
      },
      "required": [
        "by"
      ],
      "additionalProperties": false
    },
    "TableCell": {
      "type": "object",
      "properties": {
        "value": {
          "x-ts": "Expr"
        },
        "sortBy": {
          "x-ts": "Expr",
          "description": "a header cell's interactive sort: the viewer orders the rows by this expression when the header is clicked"
        },
        "style": {
          "$ref": "#/$defs/Style"
        },
        "colSpan": {
          "type": "number",
          "description": "columns this cell spans. Either list one entry per column (null under the span), or omit the spanned cells (RDL/HTML style: a row with fewer cells than columns)"
        },
        "rowSpan": {
          "type": "number",
          "description": "merged down over this many rows of the same band (header, a group's rows, one record's detail rows, footer)"
        },
        "item": {
          "$ref": "#/$defs/Item",
          "description": "an item laid out inside the cell, scoped to the row (a related data set gets that row's children)"
        },
        "action": {
          "$ref": "#/$defs/Action"
        }
      },
      "additionalProperties": true
    },
    "TableRow": {
      "type": "object",
      "properties": {
        "cells": {
          "type": "array",
          "items": {
            "x-ts": "TableCell | null",
            "anyOf": [
              {
                "$ref": "#/$defs/TableCell"
              },
              {
                "type": "null"
              }
            ]
          }
        },
        "height": {
          "type": "number"
        },
        "style": {
          "$ref": "#/$defs/Style"
        }
      },
      "required": [
        "cells"
      ],
      "additionalProperties": true
    },
    "TableGroup": {
      "type": "object",
      "properties": {
        "expr": {
          "type": "string"
        },
        "name": {
          "type": "string"
        },
        "header": {
          "type": "array",
          "items": {
            "$ref": "#/$defs/TableRow"
          }
        },
        "footer": {
          "type": "array",
          "items": {
            "$ref": "#/$defs/TableRow"
          }
        },
        "sort": {
          "enum": [
            "asc",
            "desc",
            "none"
          ],
          "description": "orders the groups by their value (asc or desc); sortBy orders them by an expression"
        },
        "sortBy": {
          "x-ts": "Expr",
          "description": "orders the groups by this expression, evaluated in each group's scope (e.g. =Sum(Fields.amount)); the interactive sort on a header wins"
        },
        "pageBreak": {
          "type": "string"
        },
        "collapsible": {
          "type": "boolean"
        },
        "initiallyCollapsed": {
          "type": "boolean"
        },
        "parent": {
          "x-ts": "Expr",
          "description": "recursive hierarchy: the parent's id; expr is the node's id. Level() is the depth."
        },
        "indent": {
          "type": "number"
        },
        "expandLevels": {
          "type": "number"
        },
        "newSection": {
          "type": "boolean",
          "description": "each instance starts on a new page and restarts Globals.PageNumber / TotalPages"
        }
      },
      "required": [
        "expr"
      ],
      "additionalProperties": true
    },
    "Table": {
      "allOf": [
        {
          "$ref": "#/$defs/ItemBase"
        },
        {
          "type": "object",
          "properties": {
            "type": {
              "const": "table"
            },
            "columns": {
              "type": "array",
              "items": {
                "type": "object",
                "properties": {
                  "width": {
                    "type": "number"
                  }
                },
                "required": [
                  "width"
                ],
                "additionalProperties": true
              }
            },
            "header": {
              "type": "array",
              "items": {
                "$ref": "#/$defs/TableRow"
              }
            },
            "groups": {
              "type": "array",
              "items": {
                "$ref": "#/$defs/TableGroup"
              }
            },
            "detail": {
              "type": "array",
              "items": {
                "$ref": "#/$defs/TableRow"
              }
            },
            "footer": {
              "type": "array",
              "items": {
                "$ref": "#/$defs/TableRow"
              }
            },
            "repeatHeader": {
              "type": "boolean"
            },
            "widowControl": {
              "type": "boolean",
              "description": "Default true: a group of four or more rows never leaves one of its rows alone at a page foot or head, and a group of two or three rows that fits a page moves whole to the next page. false lets a break fall anywhere inside a group."
            },
            "fitColumns": {
              "type": "boolean",
              "description": "Column widths from the content: the header, the first 50 rows and the footer, in proportion, filling the table's width. Columns without a width are measured anyway."
            },
            "noRowsText": {
              "type": "string"
            },
            "sort": {
              "type": "array",
              "items": {
                "$ref": "#/$defs/SortSpec"
              },
              "description": "rows ordered by these entries, in order"
            },
            "filters": {
              "type": "array",
              "items": {}
            },
            "printAtBottom": {
              "type": "boolean",
              "description": "the footer at the bottom of the page the table ends on"
            },
            "overflow": {
              "enum": [
                "clip",
                "paginate",
                "shrink"
              ],
              "description": "wider than the page: continue on the next page set, repeating the first repeatColumns columns"
            },
            "repeatColumns": {
              "type": "number"
            },
            "pageOrder": {
              "enum": [
                "down",
                "across"
              ]
            },
            "overflowTo": {
              "type": "string",
              "description": "fixed frame: continue rows in"
            }
          },
          "required": [
            "type",
            "columns"
          ]
        }
      ]
    },
    "Container": {
      "allOf": [
        {
          "$ref": "#/$defs/ItemBase"
        },
        {
          "type": "object",
          "properties": {
            "type": {
              "const": "container"
            },
            "items": {
              "type": "array",
              "items": {
                "$ref": "#/$defs/Item"
              }
            }
          },
          "required": [
            "type",
            "items"
          ]
        }
      ]
    },
    "List": {
      "allOf": [
        {
          "$ref": "#/$defs/ItemBase"
        },
        {
          "type": "object",
          "properties": {
            "type": {
              "const": "list"
            },
            "items": {
              "type": "array",
              "items": {
                "$ref": "#/$defs/Item"
              }
            },
            "groupBy": {
              "x-ts": "Expr<string>"
            },
            "pageBreakBetween": {
              "type": "boolean"
            },
            "sort": {
              "type": "array",
              "items": {
                "$ref": "#/$defs/SortSpec"
              },
              "description": "rows ordered by these entries, in order"
            },
            "filters": {
              "type": "array",
              "items": {}
            },
            "columns": {
              "type": "number",
              "description": "records across (a grid list)"
            },
            "columnGap": {
              "type": "number"
            },
            "newSection": {
              "type": "boolean"
            },
            "groupAdjacent": {
              "type": "boolean",
              "description": "a new group at every change (not sorted)"
            },
            "inheritRows": {
              "type": "boolean",
              "description": "rows of the enclosing list row"
            }
          },
          "required": [
            "type",
            "items"
          ]
        }
      ]
    },
    "CheckBox": {
      "allOf": [
        {
          "$ref": "#/$defs/ItemBase"
        },
        {
          "type": "object",
          "properties": {
            "type": {
              "const": "checkbox"
            },
            "value": {
              "x-ts": "Expr<boolean>"
            },
            "text": {
              "x-ts": "Expr<string>"
            }
          },
          "required": [
            "type"
          ]
        }
      ]
    },
    "ChartAxis": {
      "type": "object",
      "properties": {
        "title": {
          "type": "string"
        },
        "format": {
          "type": "string"
        },
        "min": {
          "type": "number"
        },
        "max": {
          "type": "number"
        },
        "log": {
          "type": "boolean"
        },
        "gridlines": {
          "type": "boolean"
        },
        "labelAngle": {
          "type": "number",
          "description": "category axis only: turn the labels, e.g. -45"
        },
        "reversed": {
          "type": "boolean"
        }
      }
    },
    "ChartSeries": {
      "type": "object",
      "properties": {
        "name": {
          "type": "string"
        },
        "value": {
          "x-ts": "Expr"
        },
        "color": {
          "type": "string"
        },
        "type": {
          "enum": [
            "column",
            "bar",
            "line",
            "area"
          ],
          "description": "combo charts: draw this series as columns, a line or an area"
        },
        "axis": {
          "enum": [
            "primary",
            "secondary"
          ]
        },
        "low": {
          "x-ts": "Expr",
          "description": "a range series (low + high), or with open + close a candlestick / OHLC series"
        },
        "high": {
          "x-ts": "Expr"
        },
        "open": {
          "x-ts": "Expr"
        },
        "close": {
          "x-ts": "Expr"
        },
        "size": {
          "x-ts": "Expr",
          "description": "bubble size, per row"
        },
        "line": {
          "enum": [
            "straight",
            "smooth",
            "step"
          ]
        }
      },
      "additionalProperties": true
    },
    "ChartOverlay": {
      "anyOf": [
        {
          "type": "object",
          "properties": {
            "type": {
              "const": "trend"
            },
            "kind": {
              "enum": [
                "linear",
                "exp",
                "poly"
              ]
            },
            "order": {
              "type": "number"
            },
            "series": {
              "type": "number"
            },
            "color": {
              "type": "string"
            },
            "label": {
              "type": "string"
            }
          },
          "required": [
            "type"
          ]
        },
        {
          "type": "object",
          "properties": {
            "type": {
              "const": "movingAverage"
            },
            "period": {
              "type": "number"
            },
            "series": {
              "type": "number"
            },
            "color": {
              "type": "string"
            },
            "label": {
              "type": "string"
            }
          },
          "required": [
            "type"
          ]
        },
        {
          "type": "object",
          "properties": {
            "type": {
              "const": "line"
            },
            "value": {
              "x-ts": "number | Expr"
            },
            "axis": {
              "enum": [
                "primary",
                "secondary"
              ]
            },
            "color": {
              "type": "string"
            },
            "label": {
              "type": "string"
            },
            "showValue": {
              "type": "boolean"
            }
          },
          "required": [
            "type",
            "value"
          ]
        },
        {
          "type": "object",
          "properties": {
            "type": {
              "const": "band"
            },
            "from": {
              "x-ts": "number | Expr"
            },
            "to": {
              "x-ts": "number | Expr"
            },
            "axis": {
              "enum": [
                "primary",
                "secondary"
              ]
            },
            "color": {
              "type": "string"
            },
            "label": {
              "type": "string"
            }
          },
          "required": [
            "type",
            "from",
            "to"
          ]
        }
      ]
    },
    "ChartPalette": {
      "enum": [
        "default",
        "office",
        "colorblind",
        "vivid",
        "pastel",
        "ocean",
        "sunset",
        "forest",
        "berry",
        "earth",
        "grayscale",
        "highContrast"
      ]
    },
    "Chart": {
      "allOf": [
        {
          "$ref": "#/$defs/ItemBase"
        },
        {
          "type": "object",
          "properties": {
            "type": {
              "const": "chart"
            },
            "chartType": {
              "enum": [
                "column",
                "bar",
                "line",
                "area",
                "pie",
                "donut",
                "scatter",
                "bubble",
                "radar",
                "polar",
                "candlestick",
                "ohlc",
                "gauge",
                "funnel",
                "treemap",
                "histogram",
                "boxplot",
                "waterfall",
                "gantt"
              ]
            },
            "title": {
              "x-ts": "Expr<string>"
            },
            "category": {
              "x-ts": "Expr<string>"
            },
            "categorySort": {
              "enum": [
                "asc",
                "desc"
              ]
            },
            "categoryFormat": {
              "type": "string"
            },
            "series": {
              "type": "array",
              "items": {
                "$ref": "#/$defs/ChartSeries"
              }
            },
            "seriesGroup": {
              "x-ts": "Expr<string>"
            },
            "stacked": {
              "x-ts": "boolean | 'percent'"
            },
            "showValues": {
              "type": "boolean"
            },
            "valueFormat": {
              "type": "string"
            },
            "legend": {
              "enum": [
                "bottom",
                "none"
              ]
            },
            "xValue": {
              "x-ts": "Expr"
            },
            "pointAction": {
              "$ref": "#/$defs/Action"
            },
            "pointColor": {
              "x-ts": "Expr<string>"
            },
            "tooltips": {
              "type": "boolean"
            },
            "xTitle": {
              "type": "string"
            },
            "fontSize": {
              "type": "number"
            },
            "background": {
              "type": "string"
            },
            "maxCategories": {
              "type": "number"
            },
            "outliers": {
              "enum": [
                "clip",
                "none"
              ],
              "description": "Scatter and bubble. clip: the axes stop at the 1st and 99th percentiles; points beyond are drawn at the edge with a ring and a warning. none: the full range. Unset: clip when 20 or more points have an extreme spread (full range over 5x the 1st-99th percentile range), else none"
            },
            "line": {
              "enum": [
                "straight",
                "smooth",
                "step"
              ]
            },
            "axes": {
              "type": "object",
              "properties": {
                "x": {
                  "$ref": "#/$defs/ChartAxis"
                },
                "y": {
                  "$ref": "#/$defs/ChartAxis"
                },
                "y2": {
                  "$ref": "#/$defs/ChartAxis"
                }
              }
            },
            "overlays": {
              "type": "array",
              "items": {
                "$ref": "#/$defs/ChartOverlay"
              }
            },
            "labelTemplate": {
              "type": "string",
              "description": "{value} {category} {series} {percent}, or an =expression in the point's scope"
            },
            "labelPosition": {
              "enum": [
                "outside",
                "inside",
                "center"
              ]
            },
            "palette": {
              "x-ts": "ChartPalette | string[]"
            },
            "colorByCategory": {
              "type": "boolean",
              "description": "opt-in: each category (pie, donut, funnel slices; seriesGroup series) keeps one colour in every chart of the report that sets it; off: colours by position"
            },
            "animation": {
              "enum": [
                "none",
                "grow",
                "fade"
              ],
              "description": "viewer only; exports stay static"
            },
            "upColor": {
              "type": "string"
            },
            "downColor": {
              "type": "string"
            },
            "binCount": {
              "type": "number",
              "description": "number of bins (empty: automatic)"
            },
            "binWidth": {
              "type": "number",
              "description": "bin width (instead of a number of bins)"
            },
            "showMean": {
              "type": "boolean",
              "description": "mark the mean"
            },
            "waterfallTotals": {
              "x-ts": "Expr",
              "description": "subtotal bar when (e.g. =Fields.isTotal)"
            },
            "showTotal": {
              "type": "boolean",
              "description": "total bar at the end"
            },
            "totalLabel": {
              "type": "string",
              "description": "total bar label"
            },
            "totalColor": {
              "type": "string",
              "description": "total colour"
            },
            "ganttStart": {
              "x-ts": "Expr",
              "description": "bar start (date or number)"
            },
            "ganttEnd": {
              "x-ts": "Expr",
              "description": "bar end (date or number)"
            },
            "ganttToday": {
              "type": "boolean",
              "description": "today line"
            },
            "todayColor": {
              "type": "string",
              "description": "today line colour"
            },
            "gaugeShape": {
              "enum": [
                "half",
                "threeQuarter",
                "full"
              ],
              "description": "gauge shape"
            },
            "gaugeIndicator": {
              "enum": [
                "needle",
                "pointer",
                "bar"
              ],
              "description": "value shown by"
            },
            "pointerColor": {
              "type": "string",
              "description": "needle or pointer colour"
            },
            "gaugeTicks": {
              "type": "boolean",
              "description": "tick marks and values"
            }
          },
          "required": [
            "type"
          ]
        }
      ]
    },
    "FormField": {
      "allOf": [
        {
          "$ref": "#/$defs/ItemBase"
        },
        {
          "type": "object",
          "properties": {
            "type": {
              "const": "field"
            },
            "kind": {
              "enum": [
                "text",
                "multiline",
                "checkbox",
                "choice"
              ]
            },
            "fieldName": {
              "x-ts": "Expr<string>"
            },
            "label": {
              "x-ts": "Expr<string>"
            },
            "value": {
              "x-ts": "Expr"
            },
            "options": {
              "x-ts": "Expr"
            },
            "required": {
              "type": "boolean"
            },
            "readOnly": {
              "type": "boolean"
            }
          },
          "required": [
            "type"
          ]
        }
      ]
    },
    "MapItem": {
      "allOf": [
        {
          "$ref": "#/$defs/ItemBase"
        },
        {
          "type": "object",
          "properties": {
            "type": {
              "const": "map"
            },
            "geojson": {
              "type": "string"
            },
            "geometry": {
              "x-ts": "Expr"
            },
            "shapeKey": {
              "x-ts": "Expr<string>"
            },
            "valueDataSet": {
              "type": "string"
            },
            "valueKey": {
              "x-ts": "Expr<string>"
            },
            "value": {
              "x-ts": "Expr<number>"
            },
            "valueFormat": {
              "type": "string"
            },
            "colorLow": {
              "type": "string"
            },
            "colorHigh": {
              "type": "string"
            },
            "legend": {
              "enum": [
                "bottom",
                "none"
              ]
            },
            "pointDataSet": {
              "type": "string"
            },
            "lat": {
              "x-ts": "Expr<number>"
            },
            "lon": {
              "x-ts": "Expr<number>"
            },
            "pointSize": {
              "x-ts": "Expr<number>"
            },
            "pointLabel": {
              "x-ts": "Expr<string>"
            },
            "pointColor": {
              "type": "string"
            },
            "colorScale": {
              "enum": [
                "continuous",
                "classes"
              ],
              "description": "colour scale"
            },
            "classes": {
              "type": "number",
              "description": "number of classes (2–9)"
            },
            "lineColor": {
              "type": "string",
              "description": "lines: colour (LineString shapes)"
            },
            "lineWidth": {
              "type": "number",
              "description": "lines: width (pt)"
            },
            "regionAction": {
              "$ref": "#/$defs/Action",
              "description": "click on a region"
            },
            "tooltips": {
              "type": "boolean",
              "description": "tooltips on hover"
            }
          },
          "required": [
            "type"
          ]
        }
      ]
    },
    "Sparkline": {
      "allOf": [
        {
          "$ref": "#/$defs/ItemBase"
        },
        {
          "type": "object",
          "properties": {
            "type": {
              "const": "sparkline"
            },
            "category": {
              "x-ts": "Expr"
            },
            "value": {
              "x-ts": "Expr<number>"
            },
            "color": {
              "type": "string"
            },
            "style": {
              "x-ts": "'line' | 'column' | 'area' | 'winloss'",
              "enum": [
                "line",
                "column",
                "area",
                "winloss"
              ]
            },
            "bandLow": {
              "x-ts": "Expr<number>"
            },
            "bandHigh": {
              "x-ts": "Expr<number>"
            },
            "bandColor": {
              "type": "string"
            },
            "negColor": {
              "type": "string"
            },
            "negativeColor": {
              "type": "string",
              "description": "data bars: the colour of a bar with a negative value (default #dc2626)"
            }
          },
          "required": [
            "type"
          ]
        }
      ]
    },
    "DataBar": {
      "allOf": [
        {
          "$ref": "#/$defs/ItemBase"
        },
        {
          "type": "object",
          "properties": {
            "type": {
              "const": "databar"
            },
            "value": {
              "x-ts": "Expr<number>"
            },
            "max": {
              "x-ts": "Expr<number>"
            },
            "color": {
              "type": "string"
            },
            "negativeColor": {
              "type": "string",
              "description": "the colour of a bar with a negative value (default #dc2626)"
            }
          },
          "required": [
            "type"
          ]
        }
      ]
    },
    "Bullet": {
      "allOf": [
        {
          "$ref": "#/$defs/ItemBase"
        },
        {
          "type": "object",
          "properties": {
            "type": {
              "const": "bullet"
            },
            "value": {
              "x-ts": "Expr<number>"
            },
            "max": {
              "x-ts": "Expr<number>"
            },
            "target": {
              "x-ts": "Expr<number>"
            },
            "color": {
              "type": "string"
            }
          },
          "required": [
            "type"
          ]
        }
      ]
    },
    "IconSet": {
      "allOf": [
        {
          "$ref": "#/$defs/ItemBase"
        },
        {
          "type": "object",
          "properties": {
            "type": {
              "const": "iconset"
            },
            "value": {
              "x-ts": "Expr<number>"
            },
            "iconSet": {
              "enum": [
                "trafficLights",
                "arrows",
                "symbols",
                "flags",
                "ratings"
              ]
            },
            "lower": {
              "x-ts": "Expr<number>"
            },
            "upper": {
              "x-ts": "Expr<number>"
            },
            "reverse": {
              "type": "boolean",
              "description": "reverse order (higher is worse)"
            }
          },
          "required": [
            "type"
          ]
        }
      ]
    },
    "RangeBar": {
      "allOf": [
        {
          "$ref": "#/$defs/ItemBase"
        },
        {
          "type": "object",
          "properties": {
            "type": {
              "const": "rangebar"
            },
            "low": {
              "x-ts": "Expr<number>"
            },
            "high": {
              "x-ts": "Expr<number>"
            },
            "min": {
              "x-ts": "Expr<number>"
            },
            "max": {
              "x-ts": "Expr<number>"
            },
            "color": {
              "type": "string"
            }
          },
          "required": [
            "type"
          ]
        }
      ]
    },
    "Barcode": {
      "allOf": [
        {
          "$ref": "#/$defs/ItemBase"
        },
        {
          "type": "object",
          "properties": {
            "type": {
              "const": "barcode"
            },
            "symbology": {
              "type": "string",
              "description": "a bwip-js id: code128, qrcode, datamatrix, pdf417, ean13, gs1-128, …"
            },
            "value": {
              "x-ts": "Expr<string>"
            },
            "showText": {
              "type": "boolean"
            },
            "captionPosition": {
              "enum": [
                "below",
                "above"
              ]
            },
            "quietZone": {
              "type": "number",
              "description": "points of white around the code"
            },
            "rotate": {
              "x-ts": "0 | 90 | 180 | 270 | '0' | '90' | '180' | '270'",
              "enum": [
                0,
                90,
                180,
                270,
                "0",
                "90",
                "180",
                "270"
              ]
            },
            "qrErrorLevel": {
              "enum": [
                "L",
                "M",
                "Q",
                "H"
              ]
            },
            "qrVersion": {
              "type": "number"
            },
            "qrMask": {
              "type": "number"
            },
            "dmShape": {
              "enum": [
                "square",
                "rectangle"
              ]
            },
            "dmSize": {
              "type": "string"
            },
            "pdfColumns": {
              "type": "number"
            },
            "pdfRows": {
              "type": "number"
            },
            "pdfErrorLevel": {
              "type": "number"
            },
            "pdfCompact": {
              "type": "boolean"
            },
            "aztecLayers": {
              "type": "number"
            },
            "aztecErrorPercent": {
              "type": "number"
            },
            "maxiMode": {
              "type": "number"
            },
            "checkDigit": {
              "type": "boolean"
            },
            "barRatio": {
              "type": "number"
            }
          },
          "required": [
            "type"
          ]
        }
      ]
    },
    "PivotGroup": {
      "type": "object",
      "properties": {
        "expr": {
          "x-ts": "Expr"
        },
        "name": {
          "type": "string"
        },
        "label": {
          "x-ts": "Expr<string>"
        },
        "format": {
          "type": "string"
        },
        "sort": {
          "enum": [
            "asc",
            "desc",
            "none"
          ]
        },
        "sortBy": {
          "x-ts": "Expr"
        },
        "total": {
          "enum": [
            "none",
            "before",
            "after"
          ],
          "description": "a total of this group's instances inside the group above (the first group's total is the grand total)"
        },
        "totalLabel": {
          "type": "string"
        },
        "collapsible": {
          "type": "boolean"
        },
        "initiallyCollapsed": {
          "type": "boolean"
        },
        "width": {
          "type": "number",
          "description": "row groups: the header column's width and title"
        },
        "header": {
          "type": "string"
        },
        "style": {
          "$ref": "#/$defs/Style"
        }
      },
      "required": [
        "expr"
      ]
    },
    "PivotValue": {
      "type": "object",
      "properties": {
        "value": {
          "x-ts": "Expr"
        },
        "name": {
          "type": "string"
        },
        "label": {
          "type": "string"
        },
        "format": {
          "type": "string"
        },
        "show": {
          "enum": [
            "value",
            "percentOfTotal",
            "percentOfRow",
            "percentOfColumn"
          ]
        },
        "width": {
          "type": "number"
        },
        "style": {
          "$ref": "#/$defs/Style"
        }
      },
      "required": [
        "value"
      ]
    },
    "Matrix": {
      "allOf": [
        {
          "$ref": "#/$defs/ItemBase"
        },
        {
          "type": "object",
          "properties": {
            "type": {
              "const": "matrix"
            },
            "rowGroups": {
              "type": "array",
              "items": {
                "$ref": "#/$defs/PivotGroup"
              },
              "description": "the tablix form: nested row and column groups, several values"
            },
            "columnGroups": {
              "type": "array",
              "items": {
                "$ref": "#/$defs/PivotGroup"
              }
            },
            "values": {
              "type": "array",
              "items": {
                "$ref": "#/$defs/PivotValue"
              }
            },
            "overflow": {
              "enum": [
                "paginate",
                "shrink",
                "clip"
              ]
            },
            "pageOrder": {
              "enum": [
                "down",
                "across"
              ]
            },
            "rowGroup": {
              "x-ts": "Expr<string>",
              "description": "the older single-group form (still read when the arrays are absent)"
            },
            "columnGroup": {
              "x-ts": "Expr<string>"
            },
            "value": {
              "x-ts": "Expr"
            },
            "valueFormat": {
              "type": "string"
            },
            "rowSort": {
              "enum": [
                "asc",
                "desc",
                "none"
              ]
            },
            "columnSort": {
              "enum": [
                "asc",
                "desc",
                "none"
              ]
            },
            "rowTotals": {
              "type": "boolean"
            },
            "columnTotals": {
              "type": "boolean"
            },
            "corner": {
              "type": "string"
            },
            "rowHeaderWidth": {
              "type": "number"
            },
            "columnWidth": {
              "type": "number"
            },
            "repeatHeader": {
              "type": "boolean"
            },
            "headerStyle": {
              "$ref": "#/$defs/Style"
            },
            "cellStyle": {
              "$ref": "#/$defs/Style"
            },
            "totalStyle": {
              "$ref": "#/$defs/Style"
            }
          },
          "required": [
            "type"
          ]
        }
      ]
    },
    "Subreport": {
      "allOf": [
        {
          "$ref": "#/$defs/ItemBase"
        },
        {
          "type": "object",
          "properties": {
            "type": {
              "const": "subreport"
            },
            "report": {
              "type": "string"
            },
            "params": {
              "x-ts": "Record<string, Expr>",
              "type": "object"
            }
          },
          "required": [
            "type",
            "report"
          ]
        }
      ]
    },
    "TableOfContents": {
      "allOf": [
        {
          "$ref": "#/$defs/ItemBase"
        },
        {
          "type": "object",
          "properties": {
            "type": {
              "const": "toc"
            },
            "title": {
              "type": "string"
            },
            "levels": {
              "type": "number"
            },
            "source": {
              "enum": [
                "bookmarks",
                "headings"
              ],
              "description": "bookmarks (default) or text boxes with a headingLevel"
            },
            "numbering": {
              "x-ts": "string | ('decimal' | 'roman' | 'alpha')[]",
              "description": 'decimal, roman or alpha; one per level as an array or "roman,alpha" (the last repeats)'
            }
          },
          "required": [
            "type"
          ]
        }
      ]
    },
    "Item": {
      "anyOf": [
        {
          "$ref": "#/$defs/TextBox"
        },
        {
          "$ref": "#/$defs/RichText"
        },
        {
          "$ref": "#/$defs/Image"
        },
        {
          "$ref": "#/$defs/Line"
        },
        {
          "$ref": "#/$defs/Shape"
        },
        {
          "$ref": "#/$defs/Table"
        },
        {
          "$ref": "#/$defs/Container"
        },
        {
          "$ref": "#/$defs/List"
        },
        {
          "$ref": "#/$defs/CheckBox"
        },
        {
          "$ref": "#/$defs/Chart"
        },
        {
          "$ref": "#/$defs/FormField"
        },
        {
          "$ref": "#/$defs/MapItem"
        },
        {
          "$ref": "#/$defs/Sparkline"
        },
        {
          "$ref": "#/$defs/DataBar"
        },
        {
          "$ref": "#/$defs/Bullet"
        },
        {
          "$ref": "#/$defs/IconSet"
        },
        {
          "$ref": "#/$defs/RangeBar"
        },
        {
          "$ref": "#/$defs/Barcode"
        },
        {
          "$ref": "#/$defs/Matrix"
        },
        {
          "$ref": "#/$defs/Subreport"
        },
        {
          "$ref": "#/$defs/TableOfContents"
        }
      ]
    },
    "ItemType": {
      "x-ts-decl": "export type ItemType = Item['type'];"
    },
    "Band": {
      "type": "object",
      "properties": {
        "height": {
          "type": "number"
        },
        "items": {
          "type": "array",
          "items": {
            "$ref": "#/$defs/Item"
          }
        },
        "printOnFirstPage": {
          "type": "boolean"
        },
        "printOnLastPage": {
          "type": "boolean"
        },
        "columns": {
          "type": "object",
          "properties": {
            "count": {
              "type": "number"
            },
            "gap": {
              "type": "number"
            }
          },
          "required": [
            "count"
          ]
        }
      },
      "required": [
        "items"
      ]
    },
    "BodySection": {
      "description": "A body section with its own page settings (missing keys come from the report's page).",
      "allOf": [
        {
          "$ref": "#/$defs/Band"
        },
        {
          "type": "object",
          "properties": {
            "name": {
              "type": "string"
            },
            "page": {
              "x-ts": "Report['page']",
              "type": "object"
            }
          }
        }
      ]
    },
    "Field": {
      "type": "object",
      "properties": {
        "name": {
          "type": "string"
        },
        "type": {
          "enum": [
            "string",
            "number",
            "integer",
            "boolean",
            "date",
            "datetime"
          ],
          "description": "'string' keeps text as text: an ISO date string in it is not turned into a date"
        },
        "path": {
          "type": "string"
        },
        "expr": {
          "type": "string"
        }
      },
      "required": [
        "name"
      ]
    },
    "Parameter": {
      "type": "object",
      "properties": {
        "name": {
          "type": "string"
        },
        "type": {
          "enum": [
            "string",
            "number",
            "integer",
            "boolean",
            "date",
            "datetime"
          ]
        },
        "prompt": {
          "type": "string"
        },
        "default": {},
        "required": {
          "type": "boolean"
        },
        "multi": {
          "type": "boolean"
        },
        "hidden": {
          "type": "boolean"
        },
        "options": {
          "type": "array",
          "items": {
            "x-ts": "string | number | { value: unknown; label?: string }"
          }
        },
        "optionsFrom": {
          "type": "object",
          "properties": {
            "dataSet": {
              "type": "string"
            },
            "value": {
              "type": "string"
            },
            "label": {
              "type": "string"
            }
          },
          "required": [
            "dataSet",
            "value"
          ]
        },
        "editor": {
          "type": "string"
        }
      },
      "required": [
        "name"
      ],
      "additionalProperties": true
    },
    "DataSource": {
      "anyOf": [
        {
          "type": "object",
          "properties": {
            "name": {
              "type": "string"
            },
            "type": {
              "const": "json"
            },
            "data": {}
          },
          "required": [
            "name",
            "type",
            "data"
          ]
        },
        {
          "type": "object",
          "properties": {
            "name": {
              "type": "string"
            },
            "type": {
              "const": "csv"
            },
            "data": {
              "type": "string"
            },
            "url": {
              "type": "string"
            }
          },
          "required": [
            "name",
            "type"
          ],
          "additionalProperties": true
        },
        {
          "type": "object",
          "properties": {
            "name": {
              "type": "string"
            },
            "type": {
              "enum": [
                "rest",
                "graphql"
              ]
            },
            "url": {
              "type": "string"
            },
            "method": {
              "type": "string"
            },
            "headers": {
              "x-ts": "Record<string, string>",
              "type": "object"
            },
            "query": {
              "type": "string"
            }
          },
          "required": [
            "name",
            "type",
            "url"
          ],
          "additionalProperties": true
        },
        {
          "type": "object",
          "properties": {
            "name": {
              "type": "string"
            },
            "type": {
              "const": "sql"
            },
            "connection": {
              "type": "string"
            },
            "query": {
              "type": "string"
            }
          },
          "required": [
            "name",
            "type",
            "connection",
            "query"
          ],
          "additionalProperties": true
        }
      ]
    },
    "DataSet": {
      "type": "object",
      "properties": {
        "name": {
          "type": "string"
        },
        "source": {
          "type": "string"
        },
        "path": {
          "type": "string"
        },
        "detectDates": {
          "type": "boolean",
          "description": "false: strings that look like ISO dates stay text (default true: they become dates when fields are detected)"
        },
        "fields": {
          "type": "array",
          "items": {
            "$ref": "#/$defs/Field"
          },
          "description": "the fields, typed; none: detected from the rows"
        },
        "filters": {
          "type": "array",
          "items": {}
        },
        "sort": {
          "type": "array",
          "items": {
            "$ref": "#/$defs/SortSpec"
          },
          "description": "rows ordered by these entries, in order"
        }
      },
      "required": [
        "name",
        "source"
      ],
      "additionalProperties": true
    },
    "Report": {
      "description": "A ReportWright report definition (pagewright/report@1).",
      "type": "object",
      "properties": {
        "$schema": {
          "description": "pagewright/report@1; reportwright/report@1 is the same format under the new name.",
          "enum": [
            "pagewright/report@1",
            "reportwright/report@1"
          ]
        },
        "name": {
          "type": "string"
        },
        "description": {
          "type": "string"
        },
        "locale": {
          "type": "string"
        },
        "currency": {
          "type": "string",
          "description": "ISO 4217 code for C formats; none: the locale's own currency (en-IN: INR)"
        },
        "nonFinite": {
          "enum": [
            "blank",
            "error"
          ],
          "description": "how Infinity and NaN (1/0, 0/0) print: as SSRS (default), blank, or #Error"
        },
        "grouping": {
          "enum": [
            "always",
            "never"
          ],
          "description": "digit grouping of numbers: as the locale's rule (default, Intl/CLDR: es-ES 1234,50), always, or never"
        },
        "page": {
          "type": "object",
          "properties": {
            "size": {
              "x-ts": "'A4' | 'A3' | 'A5' | 'Letter' | 'Legal' | 'Pageless' | string | [number, number]"
            },
            "orientation": {
              "enum": [
                "portrait",
                "landscape"
              ]
            },
            "margins": {
              "x-ts": "[number, number, number, number] | number",
              "description": "top, right, bottom, left in points"
            },
            "width": {
              "type": "number"
            },
            "height": {
              "type": "number"
            }
          },
          "additionalProperties": true
        },
        "parameters": {
          "type": "array",
          "items": {
            "$ref": "#/$defs/Parameter"
          }
        },
        "parameterLayout": {},
        "liveParameters": {
          "type": "boolean"
        },
        "dataSources": {
          "type": "array",
          "items": {
            "$ref": "#/$defs/DataSource"
          }
        },
        "dataSets": {
          "type": "array",
          "items": {
            "$ref": "#/$defs/DataSet"
          }
        },
        "styles": {
          "type": "object",
          "properties": {
            "base": {
              "$ref": "#/$defs/Style"
            },
            "named": {
              "x-ts": "Record<string, Style>",
              "type": "object"
            }
          }
        },
        "images": {
          "x-ts": "Record<string, `data:image/${string}`>",
          "type": "object",
          "description": `images the report carries, by name, as data:image/… URIs; an image's src "embedded:<name>" uses one`
        },
        "sections": {
          "type": "object",
          "properties": {
            "pageHeader": {
              "$ref": "#/$defs/Band"
            },
            "body": {
              "x-ts": "Band | BodySection[]"
            },
            "pageFooter": {
              "$ref": "#/$defs/Band"
            }
          },
          "required": [
            "body"
          ]
        }
      },
      "required": [
        "$schema",
        "sections"
      ],
      "examples": [
        {
          "$schema": "pagewright/report@1",
          "name": "Invoice",
          "page": {
            "size": "A4",
            "margins": [
              36,
              36,
              36,
              36
            ]
          },
          "dataSources": [
            {
              "name": "orders",
              "type": "json",
              "data": {
                "rows": [
                  {
                    "customer": "Asha Rao",
                    "amount": 1200.5
                  }
                ]
              }
            }
          ],
          "dataSets": [
            {
              "name": "Rows",
              "source": "orders",
              "path": "$.rows"
            }
          ],
          "sections": {
            "body": {
              "items": [
                {
                  "type": "textbox",
                  "name": "Title",
                  "x": 0,
                  "y": 0,
                  "w": 300,
                  "h": 24,
                  "value": "Invoice",
                  "style": {
                    "fontSize": 18,
                    "fontWeight": "bold"
                  }
                },
                {
                  "type": "table",
                  "name": "Lines",
                  "x": 0,
                  "y": 40,
                  "w": 400,
                  "h": 40,
                  "dataSet": "Rows",
                  "columns": [
                    {
                      "width": 250
                    },
                    {
                      "width": 150
                    }
                  ],
                  "header": [
                    {
                      "height": 18,
                      "cells": [
                        {
                          "value": "Customer",
                          "colSpan": 1
                        },
                        {
                          "value": "Amount"
                        }
                      ]
                    }
                  ],
                  "detail": [
                    {
                      "height": 18,
                      "cells": [
                        {
                          "value": "=Fields.customer"
                        },
                        {
                          "value": "=Fields.amount",
                          "style": {
                            "format": "C2"
                          }
                        }
                      ]
                    }
                  ],
                  "footer": [
                    {
                      "height": 18,
                      "cells": [
                        {
                          "value": "Total",
                          "colSpan": 2
                        }
                      ]
                    }
                  ]
                }
              ]
            }
          }
        }
      ]
    }
  }
};

// src/engine/schema/validate.js
var SCHEMA_ID = "pagewright/report@1";
var SCHEMA_ALIAS = "reportwright/report@1";
var ITEM_KEYS = new Set("id type name x y w h style styleName items hidden layer locked label alt value dataSet canGrow canShrink action bookmark tooltip keepTogether pageBreakBefore pageBreakAfter pageBreakBetween newSection filters sort groups groupBy groupAdjacent inheritRows columns header detail footer repeatHeader widowControl noRowsText pageBreakEvery cells rows rowGroup rowGroups columnGro\
up columnGroups values value valueFormat rowSort columnSort rowTotals columnTotals cellStyle headerStyle totalStyle corner partProps library part properties overflow overflowTo src fit headingLevel rotate shrinkToFit minFontSize shrinkStep tocDots tocLink tocPage format chartType series seriesGroup category title legend palette stacked valueAxis xTitle maxCategories outliers categorySort categoryF\
ormat showValues labelPosition symbology quietZone report params text toggle initiallyCollapsed collapsible expandLevels repeatColumns columnGap rowHeaderWidth anim animation visual comment notes description".split(" "));
var NO_SERIES_CHARTS = /* @__PURE__ */ new Set(["gantt"]);
function looksLikeLink(it) {
  if (it.type !== "textbox" || it.action && it.action.type && it.action.type !== "none") return false;
  const st = it.style && typeof it.style === "object" ? it.style : {};
  if (!/underline/i.test(String(st.textDecoration || ""))) return false;
  const m = /^#?([0-9a-f]{2})([0-9a-f]{2})([0-9a-f]{2})$/i.exec(String(st.color || "").trim());
  if (!m) return false;
  const [r, g, b] = m.slice(1).map((h) => parseInt(h, 16));
  return b > 150 && b > r + 60 && b > g + 30;
}
var DEF_KEYS = new Set("$schema name description locale currency timeZone page parameters dataSources dataSets styles sections functions layers images theme themeDef master nullPropagation caseSensitive naturalSort nullOrder collation arithmetic bandRows version id tags author folder stylesheet parts partProperties dashboard comment notes customCode libraries liveParameters parameterLayout drafts \
history nonFinite".split(" "));
for (const k of Object.keys(REPORT_SCHEMA.$defs.Report.properties)) DEF_KEYS.add(k);
var lev = (a, b) => {
  if (Math.abs(a.length - b.length) > 2) return 3;
  const d = Array.from({ length: b.length + 1 }, (_, i) => i);
  for (let i = 1; i <= a.length; i++) {
    let prev = d[0];
    d[0] = i;
    for (let j = 1; j <= b.length; j++) {
      const t = d[j];
      d[j] = Math.min(d[j] + 1, d[j - 1] + 1, prev + (a[i - 1].toLowerCase() === b[j - 1].toLowerCase() ? 0 : 1));
      prev = t;
    }
  }
  return d[b.length];
};
function didYouMean(k, known) {
  let best = null, bd = 3;
  for (const c of known) {
    const dd = c.toLowerCase().startsWith(k.toLowerCase()) && k.length >= 3 ? 1 : lev(k, c);
    if (dd < bd) {
      bd = dd;
      best = c;
    }
  }
  return best;
}
var COLOUR_NAMES = ["black", "white", "red", "green", "blue", "gray", "grey", "orange", "yellow"];
var COLOUR_KEYS = ["color", "backgroundColor", "fill", "stroke", "textDecorationColor"];
var NUMERIC_FORMAT = /^([CcNnFfPpEeXxGgRr])(\d{1,2})[A-Za-z]/;
var LOCAL_IMAGE = /^(?:[a-z]:[\\/]|\\\\|\.{1,2}[\\/]|file:|[^:/\\\s]+\.(?:png|jpe?g|gif|webp|svg)$)/i;
var SORT_ALIAS = { expr: "by", expression: "by", field: "by", direction: "dir", order: "dir" };
function styleIssues(st, label, out) {
  if (!st || typeof st !== "object" || Array.isArray(st)) return;
  for (const k of COLOUR_KEYS) {
    const v = st[k];
    if (typeof v !== "string" || v.startsWith("=")) continue;
    const s = v.trim().toLowerCase();
    if (!/^[a-z]+$/.test(s) || COLOUR_NAMES.includes(s) || s === "none" || s === "transparent") continue;
    const g = didYouMean(s, COLOUR_NAMES);
    out.push(`${label}: "${v}" is not a colour name the report can draw${g ? ` (did you mean "${g}"?)` : ""}; use a name such as "red" or a hex colour such as "#dc2626"`);
  }
  formatIssue(st.format, label, out);
}
function formatIssue(f4, label, out) {
  const m = typeof f4 === "string" ? NUMERIC_FORMAT.exec(f4) : null;
  if (m) out.push(`${label}: the format "${f4}" is not a format code (did you mean "${m[1]}${m[2]}"?)`);
}
function sortIssues(sort, label, out) {
  sort.forEach((s, i) => {
    const at = `${label}, sort ${i + 1}`;
    if (!s || typeof s !== "object" || Array.isArray(s) || !("by" in s)) {
      out.push(`${at}: a sort entry is {by, dir}, e.g. {"by": "=Fields.Name", "dir": "asc"}; this one has no "by" and is ignored`);
      return;
    }
    for (const k of Object.keys(s)) {
      if (k === "by" || k === "dir" || k.startsWith("_")) continue;
      const g = SORT_ALIAS[k] || didYouMean(k, ["by", "dir"]);
      out.push(`${at}: "${k}" is ignored; a sort entry is {by, dir}${g ? ` (did you mean "${g}"?)` : ""}`);
    }
    if (s.dir != null && !["asc", "desc"].includes(s.dir)) out.push(`${at}: "dir" is ${JSON.stringify(s.dir)}; expected "asc" or "desc"`);
  });
}
var SCHEMA_ITEMS = (() => {
  const defs = (
    /** @type {Record<string, any>} */
    REPORT_SCHEMA.$defs
  );
  const of = (s) => s?.$ref ? defs[s.$ref.replace("#/$defs/", "")] : s;
  const out = /* @__PURE__ */ new Map();
  for (const r of defs.Item.anyOf) {
    const props = /* @__PURE__ */ new Map();
    for (const part2 of of(r).allOf || []) for (const [k, v] of Object.entries(of(part2).properties || {})) props.set(k, v);
    out.set(props.get("type").const, props);
  }
  return out;
})();
var offEnum = (sch, v) => {
  const list = sch?.enum || (sch?.anyOf?.every((x) => "const" in x) ? sch.anyOf.map((x) => x.const) : null);
  if (!list || v == null || typeof v === "string" && v.startsWith("=")) return null;
  return list.includes(v) ? null : list;
};
var ownKeys = (type) => {
  const spec = ITEMS[type];
  let dflt = {};
  try {
    dflt = spec?.defaults?.() || {};
  } catch {
  }
  return [...(spec?.props || []).map((p) => p.key), ...Object.keys(dflt), ...SCHEMA_ITEMS.get(type)?.keys() || []];
};
function validate(def) {
  const errors = [], warnings = [], exprErrors = [], checkOnly = [];
  if (!def || typeof def !== "object") return { errors: ["The report definition is empty"], warnings, exprErrors, checkOnly };
  if (!def.$schema) warnings.push(`The report has no "$schema", so an editor cannot check it; add "$schema": "${SCHEMA_ID}" at the top. It renders as before.`);
  if (def.$schema && def.$schema !== SCHEMA_ID && def.$schema !== SCHEMA_ALIAS) warnings.push(`Unknown schema "${def.$schema}". Expected "${SCHEMA_ID}".`);
  for (const k of Object.keys(def)) if (!DEF_KEYS.has(k) && !k.startsWith("_")) {
    const g = didYouMean(k, DEF_KEYS);
    warnings.push(`Unknown report property "${k}"${g ? ` (did you mean "${g}"?)` : ""}; it is ignored`);
  }
  const body = def.sections?.body;
  if (!body || Array.isArray(body) && !body.length) errors.push("The report has no body section");
  const size = def.page?.size;
  if (typeof size === "string" && !normalizePageSize(size)) {
    const g = didYouMean(size.trim(), [...Object.keys(PAGE_SIZES), "Pageless"]);
    warnings.push(`Unknown page size "${size}"${g ? ` (did you mean "${g}"?)` : ""}; the page falls back to A4 unless width and height are set`);
  }
  for (const [n, st] of Object.entries(def.styles?.named || {})) styleIssues(st, `Named style "${n}"`, warnings);
  styleIssues(def.styles?.base, "Base style", warnings);
  if (Array.isArray(body)) body.forEach((b, i) => {
    if (!b || typeof b !== "object" || Array.isArray(b)) errors.push(`Body section ${i + 1} is not an object`);
    else if (b.page != null && (typeof b.page !== "object" || Array.isArray(b.page))) errors.push(`Body section ${i + 1}: "page" must be an object`);
    for (const k of ["pageHeader", "pageFooter"]) if (b && b[k] != null && (typeof b[k] !== "object" || Array.isArray(b[k]))) errors.push(`Body section ${i + 1}: "${k}" must be an object`);
  });
  errors.push(...checkFunctions(def.functions));
  for (const p of def.parameters || []) {
    if (p?.hidden && p.required && (p.default == null || p.default === "") && !p.nullable) {
      warnings.push(`Parameter "${p.name}" is hidden and required but has no default: only a URL, the API or a drill-through can set it`);
    }
    if (p?.required && p.nullable && !p.multi && (p.default == null || p.default === "")) {
      warnings.push(`Parameter "${p.name}" is required and nullable with no default: when no value is given it is null and the report can draw blank; give it a default, or drop "nullable" to require a value`);
    }
    if (p && !p.required && !p.multi && (p.nullable === false || p.allowBlank === false) && (p.default == null || p.default === "")) {
      warnings.push(`Parameter "${p.name}" is ${p.nullable === false ? "nullable: false" : "allowBlank: false"} but is not required and has no default, so when no value is given it is null; add "required": true or a default`);
    }
    if (p?.type === "date" && typeof p.default === "string" && p.default.trim() && !p.default.startsWith("=") && !toDate(p.default)) {
      warnings.push(`Parameter "${p.name}": its default "${p.default}" is not a date; write it as 2026-12-31 (year-month-day)`);
    }
  }
  const srcNames = /* @__PURE__ */ new Set();
  for (const s of def.dataSources || []) {
    if (!s.name) errors.push("A data source has no name");
    if (srcNames.has(s.name)) errors.push(`Two data sources have the name "${s.name}"`);
    srcNames.add(s.name);
  }
  const dsNames = /* @__PURE__ */ new Set();
  for (const d of def.dataSets || []) {
    if (!d.name) errors.push("A data set has no name");
    if (dsNames.has(d.name)) errors.push(`Two data sets have the name "${d.name}"`);
    if (d.relation) {
      if (!d.relation.parent || !dsNames.has(d.relation.parent)) errors.push(`Data set "${d.name}": its parent "${d.relation.parent}" must be a data set declared above it`);
      if (d.relation.path != null && typeof d.relation.path !== "string") errors.push(`Data set "${d.name}": the relation path must be text, e.g. $.items[*]`);
    } else if (!srcNames.has(d.source)) errors.push(`Data set "${d.name}" uses the source "${d.source}", which does not exist`);
    dsNames.add(d.name);
    if (Array.isArray(d.sort)) sortIssues(d.sort, `Data set "${d.name}"`, warnings);
  }
  const names = /* @__PURE__ */ new Set();
  const check = (where, v, label) => {
    if (v == null) return;
    const err = checkValue(v);
    if (err) {
      errors.push(`${label}: ${err}`);
      exprErrors.push(`${label}: ${err}`);
    }
  };
  const PAGE_GLOBALS = /Globals\s*[.!]\s*(PageNumber|TotalPages)/i;
  const paged = /* @__PURE__ */ new Set();
  const scan = (n, label, depth) => {
    if (depth > 64 || n == null) return;
    if (typeof n === "string") {
      if (PAGE_GLOBALS.test(n) && !paged.has(label)) {
        paged.add(label);
        warnings.push(`${label}: PageNumber and TotalPages work only in the page header and footer`);
      }
      return;
    }
    if (Array.isArray(n)) {
      for (const x of n) scan(x, label, depth + 1);
      return;
    }
    if (typeof n === "object") {
      const own = n.type && n.name ? n.name : label;
      for (const [k, v] of Object.entries(n)) scan(v, k === "cells" && own === label ? `${label} cell` : own, depth + 1);
    }
  };
  const lists = [];
  const fields = inlineFields(def), params = new Set((Array.isArray(def.parameters) ? def.parameters : []).map((p) => p?.name));
  for (const where of ["pageHeader", "body", "pageFooter"]) {
    const sec = def.sections?.[where];
    if (!sec) continue;
    for (const b of Array.isArray(sec) ? sec : [sec]) if (b && typeof b === "object") lists.push([where, b.items]);
  }
  if (Array.isArray(body)) {
    for (const b of body) for (const k of ["pageHeader", "pageFooter"]) if (b?.[k] && typeof b[k] === "object") lists.push([k, b[k].items]);
  }
  for (const [where, items] of lists) {
    if (where === "body") for (const it of Array.isArray(items) ? items : []) scan(it, it?.name || it?.type, 0);
    for (const it of Array.isArray(items) ? items : []) {
      const label = it.name || it.type;
      if (!ITEMS[it.type]) {
        warnings.push(`Unknown item type "${it.type}"`);
        continue;
      }
      walkItems(it, (x) => itemRefs(x, warnings, fields, params));
      if (it.name) {
        if (names.has(it.name)) warnings.push(`Two items have the name "${it.name}"`);
        names.add(it.name);
      }
      for (const k of ["x", "y", "w", "h"]) if (typeof it[k] !== "number" || Number.isNaN(it[k])) errors.push(`${label}: "${k}" must be a number`);
      if (looksLikeLink(it)) warnings.push(`${label}: its text looks like a link (underlined, in a link colour) but it has no action; give it one (Action) or a plain style`);
      styleIssues(it.style, label, warnings);
      formatIssue(it.format, label, warnings);
      if (it.styleName != null && typeof it.styleName === "string" && !it.styleName.startsWith("=") && !def.styles?.sheet && !def.master && !def.theme && !Object.hasOwn(def.styles?.named || {}, it.styleName)) {
        const g = didYouMean(it.styleName, Object.keys(def.styles?.named || {}));
        warnings.push(`${label}: there is no named style "${it.styleName}"${g ? ` (did you mean "${g}"?)` : ""}; it is ignored`);
      }
      if (Array.isArray(it.sort)) sortIssues(it.sort, label, warnings);
      if (it.type === "chart" && it.legend != null && it.legend !== "bottom" && it.legend !== "none") {
        const shown = typeof it.legend === "object" ? `is an object (${JSON.stringify(it.legend).slice(0, 60)})` : `is ${JSON.stringify(it.legend)}`;
        warnings.push(`${label}: "legend" ${shown}; only "bottom" (show the legend) or "none" (hide it) is supported, and the legend is drawn at the bottom`);
      }
      if (it.type === "chart" && !NO_SERIES_CHARTS.has(it.chartType) && !(Array.isArray(it.series) && it.series.length)) warnings.push(`${label}: the chart has no series, so it plots a count of its rows; add one, e.g. series: [{ "name": "Value", "value": "=Sum(Fields.Amount)" }]`);
      if (it.type === "chart" && it.chartType === "polar" && it.xValue == null) warnings.push(`${label}: a polar chart needs xValue, the angle of each point in degrees (0 at the top, clockwise); without it no point is drawn`);
      if (it.type === "image" && typeof it.src === "string" && !it.src.startsWith("=") && LOCAL_IMAGE.test(it.src.trim())) warnings.push(`${label}: "${it.src}" is a local file path, which a browser cannot load; embed the image (images: { name: "data:image/png;base64,..." } and src: "embedded:name") or use an https:// address`);
      if (it.style != null && (typeof it.style !== "object" || Array.isArray(it.style))) warnings.push(`${label}: "style" must be an object of style properties, such as { "fontWeight": "bold" }; ${JSON.stringify(it.style).slice(0, 40)} is ignored`);
      const own = ownKeys(it.type);
      for (const k of Object.keys(it)) {
        if (k.startsWith("_") || k.startsWith("$") || ITEM_KEYS.has(k) || own.includes(k)) continue;
        const g = didYouMean(k, [...own, "value", "style", "hidden", "name", "dataSet"]);
        warnings.push(`${label}: unknown property "${k}"${g ? ` (did you mean "${g}"?)` : ""}; it is ignored`);
      }
      for (const [k, sch] of SCHEMA_ITEMS.get(it.type) || []) {
        if (it.type === "chart" && k === "legend") continue;
        const list = k === "type" ? null : offEnum(sch, it[k]);
        if (list) warnings.push(`${label}: "${k}" is ${JSON.stringify(it[k])}; expected one of ${list.map((x) => JSON.stringify(x)).join(", ")}`);
      }
      check(where, it.value, label);
      check(where, it.src, label);
      check(where, it.hidden, label);
      if (it.dataSet && !dsNames.has(it.dataSet)) warnings.push(`${label}: the data set "${it.dataSet}" does not exist`);
      if (it.type === "matrix") {
        for (const k of ["rowGroups", "columnGroups", "values"]) {
          if (it[k] == null) continue;
          if (!Array.isArray(it[k])) {
            errors.push(`${label}: "${k}" must be a list`);
            continue;
          }
          it[k].forEach((g, i) => {
            if (!g || typeof g !== "object") {
              errors.push(`${label}: ${k} ${i + 1} is not an object`);
              return;
            }
            for (const e of ["expr", "label", "sortBy", "value", "parent"]) check(where, g[e], `${label} ${k} ${i + 1}`);
          });
        }
      }
      if (it.type === "table") {
        for (const g of it.groups || []) for (const e of ["expr", "parent", "sortBy"]) check(where, g?.[e], `${label} group`);
        if (!Array.isArray(it.columns) || !it.columns.length) errors.push(`${label}: the table has no columns`);
        if (where !== "body") errors.push(`${label}: tables can only be in the body`);
        for (const part2 of ["header", "detail", "footer"]) {
          for (const row of it[part2] || []) for (const c of row.cells || []) if (c) check(where, c.value, `${label} ${part2} cell`);
        }
        const n = Array.isArray(it.columns) ? it.columns.length : 0;
        const rowsOf = [["header", it.header], ["detail", it.detail], ["footer", it.footer], ...(it.groups || []).flatMap((g, gi) => [[`group ${gi + 1} header`, g?.header], [`group ${gi + 1} footer`, g?.footer]])];
        for (const [part2, rows] of rowsOf) (Array.isArray(rows) ? rows : []).forEach((row, ri) => {
          const cells = Array.isArray(row?.cells) ? row.cells : [];
          const placed = cells.length < n && cells.some((c) => Number(c?.colSpan) > 1) ? cells.reduce((s, c) => s + Math.max(1, Math.floor(Number(c?.colSpan)) || 1), 0) : cells.length;
          if (placed < n) warnings.push(`${label} ${part2} row ${ri + 1}: the row has ${placed} of ${n} cells and no colSpan covers the other ${n - placed}; add the cells or a colSpan`);
          for (const [k, j] of rowCells(row?.cells, n).covered) warnings.push(`${label} ${part2} row ${ri + 1}: cell ${k} is covered by colSpan of cell ${j}, so it is not drawn (leave it null, or omit the spanned cells: a row with fewer cells than columns places each cell after the previous one's span)`);
        });
      }
    }
  }
  const custom = new Set((Array.isArray(def.functions) ? def.functions : []).map((f4) => String(f4?.name ?? "").toLowerCase()));
  const callErr = (label, msg) => {
    const e = `${label}: ${msg}`;
    if (!errors.includes(e)) {
      errors.push(e);
      exprErrors.push(e);
      checkOnly.push(e);
    }
  };
  const asts = (v, key) => {
    if (typeof v !== "string" || !(v.startsWith("=") || TEMPLATE_KEYS.has(key) && v.includes("{"))) return [];
    try {
      const p = parseValue(v);
      return p.kind === "expr" ? [p.ast] : p.kind === "tpl" ? p.parts.filter((x) => typeof x === "object").map((x) => x.ast) : [];
    } catch {
      return [];
    }
  };
  const calls = (n, label, depth, key, items = false) => {
    if (depth > 64 || n == null) return;
    if (typeof n === "string") {
      for (const a of asts(n, key)) for (const m of callIssues(a, custom, didYouMean)) callErr(label, m);
      return;
    }
    if (Array.isArray(n)) {
      for (const x of n) calls(x, label, depth + 1, key, items);
      return;
    }
    if (typeof n === "object") for (const [k, v] of Object.entries(n)) calls(v, items && n.type && n.name ? n.name : label, depth + 1, k, items);
  };
  for (const [, items] of lists) for (const it of Array.isArray(items) ? items : []) {
    calls(it, it?.name || it?.type, 0, null, true);
    walkItems(it, (x) => {
      if (x.type === "barcode" && x.symbology != null) {
        const e = symbologyError(x.symbology);
        if (e) callErr(x.name || "Barcode", e);
      }
    });
  }
  const REGIONS = /* @__PURE__ */ new Set(["table", "list", "matrix", "chart", "subreport", "part"]);
  const bare = (n, out, depth = 0) => {
    if (!n || typeof n !== "object" || depth > 200) return;
    if (Array.isArray(n)) {
      for (const x of n) bare(x, out, depth + 1);
      return;
    }
    if (n.type === "call" && !n.obj && isAggregate(String(n.name).toLowerCase()) && n.args?.length === 1) out.add(n.name);
    for (const k in n) if (k !== "p" && n[k] && typeof n[k] === "object") bare(n[k], out, depth + 1);
  };
  const strs = (n, f4, key = null, depth = 0) => {
    if (depth > 64 || n == null) return;
    if (typeof n === "string") {
      f4(n, key);
      return;
    }
    if (Array.isArray(n)) {
      for (const x of n) strs(x, f4, key, depth + 1);
      return;
    }
    if (typeof n === "object") {
      for (const [k, v] of Object.entries(n)) if (k !== "items") strs(v, f4, k, depth + 1);
    }
  };
  const unscoped = (it) => {
    if (!it || typeof it !== "object" || it.dataSet || REGIONS.has(it.type)) return;
    const found = /* @__PURE__ */ new Set();
    strs(it, (v, key) => {
      for (const a of asts(v, key)) bare(a, found);
    });
    if (found.size) warnings.push(`${it.name || it.type}: ${[...found].join(", ")} is outside a table or list and names no scope, so it uses the first data set; name one as the last argument, e.g. ${[...found][0]}(Fields.x, "DataSetName"), or give the item a dataSet`);
    for (const c of Array.isArray(it.items) ? it.items : []) unscoped(c);
  };
  for (const [, items] of lists) for (const it of Array.isArray(items) ? items : []) unscoped(it);
  for (const d of def.dataSets || []) calls(d, `Data set "${d?.name}"`, 0, null);
  for (const p of def.parameters || []) calls(p, `Parameter "${p?.name}"`, 0, null);
  for (const f4 of Array.isArray(def.functions) ? def.functions : []) {
    if (typeof f4?.body !== "string") continue;
    try {
      for (const m of callIssues(compile(f4.body.replace(/^=/, "")), custom, didYouMean)) callErr(`Function "${f4.name}"`, m);
    } catch {
    }
  }
  return { errors, warnings, exprErrors, checkOnly };
}
var TEMPLATE_KEYS = /* @__PURE__ */ new Set(["value", "text", "label", "tooltip", "title", "noRowsText"]);
function inlineFields(def) {
  const srcs = Array.isArray(def.dataSources) ? def.dataSources : [];
  if (!srcs.length || srcs.some((x) => x?.type !== "json" || !x.data || typeof x.data !== "object")) return null;
  const names = /* @__PURE__ */ new Set();
  for (const x of srcs) for (const v of Object.values(x.data)) for (const r of Array.isArray(v) ? v.slice(0, 200) : [v]) if (r && typeof r === "object" && !Array.isArray(r)) for (const k of Object.keys(r)) names.add(k);
  for (const d of Array.isArray(def.dataSets) ? def.dataSets : []) for (const f4 of Array.isArray(d?.fields) ? d.fields : []) if (f4?.name) names.add(f4.name);
  return names.size ? names : null;
}
function itemRefs(it, warnings, fields, params) {
  const label = it.name || it.type;
  if (!/line/i.test(String(it.type))) for (const [k, what] of [["w", "width"], ["h", "height"]]) {
    if (typeof it[k] === "number" && it[k] <= 0) warnings.push(`${label}: ${what} is ${it[k]}, so the item is not drawn; give it a positive ${what}`);
  }
  const seen = /* @__PURE__ */ new Set();
  const scan = (node, depth) => {
    if (depth > 64 || node == null) return;
    if (typeof node === "string") {
      if (!(node.startsWith("=") || node.includes("{"))) return;
      for (const m of node.matchAll(/\b(Fields|Parameters)\.([A-Za-z_]\w*)/g)) {
        const key = `${m[1]}.${m[2]}`;
        if (seen.has(key)) continue;
        seen.add(key);
        if (m[1] === "Parameters" && !params.has(m[2])) warnings.push(`${label}: The parameter "${m[2]}" does not exist; declare it under parameters, or check the spelling`);
        if (m[1] === "Fields" && fields && !fields.has(m[2])) warnings.push(`${label}: The field "${m[2]}" does not exist; check the spelling, or the data set that has it`);
      }
      return;
    }
    if (Array.isArray(node)) {
      for (const x of node) scan(x, depth + 1);
      return;
    }
    if (typeof node === "object") {
      for (const [k, v] of Object.entries(node)) if (k !== "items" && !(v && typeof v === "object" && v.type && v.name)) scan(v, depth + 1);
    }
  };
  scan(it, 0);
}
function walkItems(it, fn, depth = 0) {
  if (!it || typeof it !== "object" || depth > 64) return;
  if (it.type) fn(it);
  for (const v of Object.values(it)) {
    if (Array.isArray(v)) for (const x of v) {
      if (x && typeof x === "object") walkItems(x, fn, depth + 1);
    }
    else if (v && typeof v === "object") walkItems(v, fn, depth + 1);
  }
}

// src/engine/reuse.js
var REUSE_LIMITS = { depth: 4, reports: 50, items: 2e4, reportItems: 2e4, parts: 500, layers: 200, styleDepth: 10, repeats: 500 };
var fmt = (n) => n.toLocaleString("en-US");
function countItems(def, stop = Infinity) {
  let n = 0;
  eachItem(def, () => {
    n++;
  }, () => n > stop);
  return n;
}
var ID = /^[a-z0-9][a-z0-9-]{0,63}$/;
var isId = (v) => typeof v === "string" && ID.test(v);
var isSubreportId = (v) => typeof v === "string" && /^[A-Za-z0-9][A-Za-z0-9_-]{0,127}$/.test(v);
function makeLoader(load2, cache2 = /* @__PURE__ */ new Map()) {
  return (id) => {
    if (!isId(id)) return Promise.reject(new Error(`"${String(id).slice(0, 80)}" is not a report id`));
    let p = cache2.get(id);
    if (!p) {
      if (!load2) return Promise.reject(new Error("this render has no report loader (render it on the server or in the viewer)"));
      if (cache2.size >= REUSE_LIMITS.reports) return Promise.reject(new Error(`the report uses more than ${REUSE_LIMITS.reports} reports`));
      p = Promise.resolve().then(() => load2(id)).then((d) => {
        if (!d || typeof d !== "object" || Array.isArray(d)) throw new Error("it is not a report");
        if (countItems(d, REUSE_LIMITS.reportItems) > REUSE_LIMITS.reportItems) throw new Error(`it has more than ${fmt(REUSE_LIMITS.reportItems)} items`);
        return d;
      });
      cache2.set(id, p);
    }
    return p;
  };
}
function eachItem(def, fn, stop = () => false) {
  const go = (list, depth) => {
    if (!Array.isArray(list) || depth > 64) return;
    for (const it of list) {
      if (stop()) return;
      if (!it || typeof it !== "object") continue;
      fn(it);
      go(it.items, depth + 1);
    }
  };
  for (const s of Object.values(def.sections || {})) for (const b of Array.isArray(s) ? s : [s]) go(b?.items, 0);
}
function findItemNamed(def, name) {
  let hit = null;
  eachItem(def, (it) => {
    if (!hit && it.name === name) hit = it;
  });
  return hit;
}
function byName2(a, b) {
  const al = Array.isArray(a) ? a : [], bl = Array.isArray(b) ? b : [];
  const names = new Set(bl.map((x) => x?.name));
  return [...al.filter((x) => !names.has(x?.name)), ...bl];
}
async function applyMaster(def, get, warn, chain = []) {
  if (def.master == null || def.master === "") return def;
  const { master: id, ...content } = def;
  if (chain.includes(id)) {
    warn(`Master "${id}" would include itself; it is left out.`);
    return content;
  }
  if (chain.length >= REUSE_LIMITS.depth) {
    warn(`Master reports are nested more than ${REUSE_LIMITS.depth} levels; "${id}" is left out.`);
    return content;
  }
  let m;
  try {
    m = await get(id);
  } catch (e) {
    warn(`The master report "${id}" did not load: ${e.message}`);
    return content;
  }
  m = await applyMaster(m, get, warn, [...chain, id]);
  return mergeMaster(content, m, warn);
}
function mergeMaster(c, m, warn = (_m) => {
}) {
  const ms = m.sections || {}, cs = c.sections || {};
  const mBody = (Array.isArray(ms.body) ? ms.body[0] : ms.body) || {};
  const mItems = Array.isArray(mBody.items) ? mBody.items : [];
  const phs = mItems.filter((i) => i?.type === "placeholder");
  const ph = phs[0];
  const others = mItems.filter((i) => i && i.type !== "placeholder");
  const named = (Array.isArray(cs.content) ? cs.content : []).filter((x) => x && typeof x === "object" && !Array.isArray(x));
  const extra = phs.slice(1);
  for (const e of named) if (!extra.some((p) => p.name != null && p.name === e.placeholder)) warn(`The master has no other content placeholder "${String(e.placeholder ?? "").slice(0, 80)}"; its content is left out.`);
  const blank2 = { border: "none", backgroundColor: null, backgroundImage: null, padding: 0 };
  const boxOf = (p) => ({ x: Number(p.x) || 0, y: Number(p.y) || 0, w: Number(p.w) || 0, h: Number(p.h) || 0 });
  const below = others.length ? Math.max(...others.map((i) => (Number(i.y) || 0) + (Number(i.h) || 0))) + 6 : 0;
  const wrap = (b, k) => {
    const items = Array.isArray(b?.items) ? b.items : [];
    const box = ph ? boxOf(ph) : { x: 0, y: below, w: Math.max(0, ...items.map((i) => (Number(i.x) || 0) + (Number(i.w) || 0))), h: Math.max(0, ...items.map((i) => (Number(i.y) || 0) + (Number(i.h) || 0))) };
    const content = { type: "container", name: k ? `MasterContent${k + 1}` : "MasterContent", ...box, keepTogether: false, style: blank2, items };
    const mine = k ? others.map((i) => i.name ? { ...i, name: `${i.name}_${k + 1}` } : i) : others;
    const more = k ? [] : extra.map((p, j) => {
      const e = named.find((x) => p.name != null && x.placeholder === p.name);
      return { type: "container", name: `MasterContent_${String(p.name ?? j + 2).replace(/\W/g, "_").slice(0, 64)}`, ...boxOf(p), keepTogether: false, style: blank2, items: Array.isArray(e?.items) ? e.items : [] };
    });
    return { ...b || {}, items: [...mine, content, ...more] };
  };
  const body = Array.isArray(cs.body) ? cs.body.map(wrap) : wrap(cs.body, 0);
  const st = (x) => x.styles || {};
  return {
    ...c,
    $schema: c.$schema ?? m.$schema,
    locale: c.locale ?? m.locale,
    currency: c.currency ?? m.currency,
    nullPropagation: c.nullPropagation ?? m.nullPropagation,
    timeZone: c.timeZone ?? m.timeZone,
    caseSensitive: c.caseSensitive ?? m.caseSensitive,
    naturalSort: c.naturalSort ?? m.naturalSort,
    nullOrder: c.nullOrder ?? m.nullOrder,
    collation: c.collation ?? m.collation,
    arithmetic: c.arithmetic ?? m.arithmetic,
    bandRows: c.bandRows ?? m.bandRows,
    page: m.page || c.page,
    parameters: byName2(m.parameters, c.parameters),
    dataSources: byName2(m.dataSources, c.dataSources),
    // the content's data sets first: its unscoped aggregates and items use the first data set, not the master's (N3)
    dataSets: [...Array.isArray(c.dataSets) ? c.dataSets : [], ...byName2(m.dataSets, []).filter((x) => !(c.dataSets || []).some((y) => y?.name === x?.name))],
    functions: byName2(m.functions, c.functions),
    layers: byName2(m.layers, c.layers),
    images: { ...m.images || {}, ...c.images || {} },
    styles: { ...st(m), ...st(c), base: { ...st(m).base || {}, ...st(c).base || {} }, named: { ...st(m).named || {}, ...st(c).named || {} } },
    theme: c.theme ?? m.theme,
    themeDef: c.themeDef ?? m.themeDef,
    // the content's own page header and footer are replaced by the master's (its items are not in the report)
    sections: { ...cs, content: void 0, pageHeader: ms.pageHeader || { height: 0, items: [] }, pageFooter: ms.pageFooter || { height: 0, items: [] }, body }
  };
}
function flattenNamed(named, warn = (_m) => {
}) {
  const out = {};
  if (!named || typeof named !== "object") return out;
  const get = (name, seen) => {
    if (out[name]) return out[name];
    const s = named[name];
    if (!s || typeof s !== "object") return null;
    const { parent, ...own } = s;
    let base = null;
    if (parent != null && parent !== "") {
      if (seen.includes(parent)) warn(`Named style "${name}": its parent "${parent}" leads back to itself; the chain is cut there.`);
      else if (seen.length >= REUSE_LIMITS.styleDepth) warn(`Named style "${name}": more than ${REUSE_LIMITS.styleDepth} parents; the chain is cut there.`);
      else if (!named[parent]) warn(`Named style "${name}": there is no named style "${parent}" to inherit from.`);
      else base = get(parent, [...seen, parent]);
    }
    return out[name] = base ? { ...base, ...own } : own;
  };
  for (const k of Object.keys(named)) get(k, [k]);
  return out;
}
async function applySheet(def, get, warn) {
  const id = def.styles?.sheet;
  if (id == null || id === "") return def;
  let sheet;
  try {
    sheet = await get(id);
  } catch (e) {
    warn(`The stylesheet "${id}" did not load: ${e.message}`);
    return def;
  }
  const s = sheet.styles || {};
  return { ...def, styles: { ...def.styles, base: { ...s.base || {}, ...def.styles.base || {} }, named: { ...s.named || {}, ...def.styles.named || {} } } };
}
async function loadParts(def, get, warn, budget) {
  const parts = /* @__PURE__ */ new Map();
  const libs = /* @__PURE__ */ new Map();
  const keyOf2 = (it) => `${it.library}\0${it.part}`;
  const resolve = async (lib, name, chain) => {
    const key = `${lib}\0${name}`;
    if (parts.has(key)) return;
    if (chain.length >= REUSE_LIMITS.depth) {
      parts.set(key, { error: `parts are nested more than ${REUSE_LIMITS.depth} levels` });
      return;
    }
    let d;
    try {
      d = await get(lib);
    } catch (e) {
      parts.set(key, { error: `the library "${lib}" did not load: ${e.message}` });
      return;
    }
    const p = (Array.isArray(d.parts) ? d.parts.slice(0, REUSE_LIMITS.parts) : []).find((x) => x?.name === name);
    const src = p && findItemNamed(d, p.item);
    if (!p || !src) {
      parts.set(key, { error: `the library "${lib}" has no part "${name}"` });
      return;
    }
    const item = structuredClone(src);
    const props = {};
    for (const q of Array.isArray(p.properties) ? p.properties : []) if (q?.name) props[q.name] = q.default ?? null;
    const inner = [];
    let own = 0;
    const walk = (list) => {
      for (const x of list || []) {
        if (!x || typeof x !== "object") continue;
        own++;
        if (x.type === "part") inner.push(x);
        walk(x.items);
      }
    };
    walk([item]);
    parts.set(key, { item, props, own, inner: inner.filter((x) => x !== item) });
    libs.set(lib, d);
    for (const x of inner) {
      if (x === item) continue;
      const k2 = keyOf2(x);
      if (k2 === key || chain.includes(k2)) {
        x.__cycle = true;
        warn(`Part "${name}" of "${lib}" would include itself; that inner part is left out.`);
      } else await resolve(x.library, x.part, [...chain, key]);
    }
  };
  const used = [];
  eachItem(def, (it) => {
    if (it.type === "part") used.push(it);
  });
  for (const it of used) await resolve(String(it.library ?? ""), String(it.part ?? ""), []);
  const size = /* @__PURE__ */ new Map();
  const sizeOf = (key) => {
    if (size.has(key)) return size.get(key);
    size.set(key, 1);
    const e = parts.get(key);
    let n = 1;
    if (e && !e.error) {
      n = e.own;
      for (const x of e.inner) if (!x.__cycle) n += sizeOf(`${x.library}\0${x.part}`);
    }
    size.set(key, n);
    return n;
  };
  let total = 0;
  for (const it of used) total += sizeOf(`${String(it.library ?? "")}\0${String(it.part ?? "")}`);
  budget.items += total;
  if (budget.items > REUSE_LIMITS.items) {
    const msg = `the report parts would draw more than ${fmt(REUSE_LIMITS.items)} items (with subreports); they are left out`;
    for (const k of parts.keys()) parts.set(k, { error: msg });
    warn(`Report parts: ${msg}.`);
  }
  return { parts, libs: [...libs.values()] };
}
function mergeLibraries(def, libs) {
  let d = def;
  for (const l of libs) {
    d = {
      ...d,
      dataSources: byName2(l.dataSources, d.dataSources),
      dataSets: byName2(l.dataSets, d.dataSets),
      parameters: byName2(l.parameters, d.parameters),
      functions: byName2(l.functions, d.functions),
      images: { ...l.images || {}, ...d.images || {} },
      styles: { ...d.styles || {}, named: { ...l.styles?.named || {}, ...d.styles?.named || {} } }
    };
  }
  return d;
}
async function resolveReuse(def, get, warn, chain = [], budget = { items: 0 }) {
  let d = await applyMaster(def, get, warn, chain);
  d = await applySheet(d, get, warn);
  if (Array.isArray(d.layers) && d.layers.length > REUSE_LIMITS.layers) {
    warn(`The report has more than ${REUSE_LIMITS.layers} layers; the others are ignored.`);
    d = { ...d, layers: d.layers.slice(0, REUSE_LIMITS.layers) };
  }
  let parts = null;
  let hasPart = false;
  eachItem(d, (it) => {
    if (it.type === "part") hasPart = true;
  });
  if (hasPart) {
    const r = await loadParts(d, get, warn, budget);
    parts = r.parts;
    d = mergeLibraries(d, r.libs);
  }
  return { def: d, parts };
}
var DEFAULT_THEME = {
  colors: { Dark1: "#000000", Light1: "#FFFFFF", Dark2: "#44546A", Light2: "#E7E6E6", Accent1: "#4472C4", Accent2: "#ED7D31", Accent3: "#A5A5A5", Accent4: "#FFC000", Accent5: "#5B9BD5", Accent6: "#70AD47", Hyperlink: "#0563C1" },
  fonts: { major: { family: "Inter", size: 14, weight: "bold", style: "normal" }, minor: { family: "Inter", size: 9, weight: "normal", style: "normal" } },
  constants: {}
};
var THEME_COLORS = Object.keys(DEFAULT_THEME.colors);
function themeContext(td) {
  const t = td && typeof td === "object" ? td : {};
  const font = (k) => {
    const f4 = { ...DEFAULT_THEME.fonts[k], ...t.fonts?.[k] && typeof t.fonts[k] === "object" ? t.fonts[k] : {} };
    return { Family: f4.family, Size: f4.size, Weight: f4.weight, Style: f4.style };
  };
  const consts = t.constants && typeof t.constants === "object" && !Array.isArray(t.constants) ? t.constants : {};
  return { Colors: { ...DEFAULT_THEME.colors, ...t.colors && typeof t.colors === "object" ? t.colors : {} }, Fonts: { MajorFont: font("major"), MinorFont: font("minor") }, Constants: { ...consts } };
}
async function resolveTheme(def, ctx, get, warn) {
  let td = def.themeDef;
  const src = def.theme;
  if (typeof src === "string" && src.trim()) {
    let id = src;
    if (src.startsWith("=")) {
      try {
        id = evalValue(src, ctx);
      } catch (e) {
        warn(`Theme: ${e.message}`);
        id = null;
      }
    }
    if (id != null && id !== "") {
      try {
        const t = await get(String(id));
        if (t.themeDef && typeof t.themeDef === "object") td = t.themeDef;
        else warn(`The report "${id}" has no theme (set its colours and fonts under Report → Theme).`);
      } catch (e) {
        warn(`The theme "${id}" did not load: ${e.message}`);
      }
    }
  }
  return themeContext(td);
}

// src/engine/notices.js
var NO_CJK_FONTS = "Text in Japanese/Chinese/Korean needs the optional CJK fonts: npm i @reportwright/fonts-cjk, then npx reportwright-fonts-cjk (npm); in the app, npm run fonts:cjk";

// src/engine/index.js
var fetchOpts = (o, deadline = o.deadline) => ({ unsafeFetch: !!o.unsafeFetch, allowHosts: o.allowHosts, fetchTimeoutMs: o.fetchTimeoutMs, maxFetchBytes: o.maxFetchBytes, deadline });
var ReportError = class extends Error {
  /** @param {string} msg @param {object} [extra] */
  constructor(msg, extra = {}) {
    super(msg);
    Object.assign(this, extra);
    this.name = "ReportError";
  }
};
var EPS4 = 0.01;
var MAX_SUBREPORTS = 2e3;
var BAND_ITEMS = 25e4;
function* textsOf(def, dataSets) {
  yield JSON.stringify(def);
  for (const rows of Object.values(dataSets)) {
    const n = Math.min(rows.length, 5e4);
    for (let i = 0; i < n; i++) {
      const r = rows[i];
      if (!r || typeof r !== "object") {
        yield r;
        continue;
      }
      for (const k in r) {
        const v = r[k];
        if (typeof v === "string") yield v;
        else if (v && typeof v === "object") for (const x of Object.values(v)) yield x;
      }
    }
  }
}
async function render(def0, opts = {}) {
  const t0 = Date.now();
  const reuseWarnings = [];
  const getReport = makeLoader(opts.loadReport, opts.reportCache || (opts.reportCache = /* @__PURE__ */ new Map()));
  let def = def0, parts = null;
  if (def0 && typeof def0 === "object" && !Array.isArray(def0)) {
    ({ def, parts } = await resolveReuse(def0, getReport, (m2) => {
      if (!reuseWarnings.includes(m2)) reuseWarnings.push(m2);
    }, opts.reportId ? [opts.reportId] : [], opts.reuseBudget || (opts.reuseBudget = { items: 0 })));
  }
  const v = validate(def);
  const cellErrors = new Set(v.exprErrors);
  const fatal = v.errors.filter((e) => !cellErrors.has(e));
  if (fatal.length) throw new ReportError(fatal[0], { errors: v.errors });
  const checkOnly = new Set(v.checkOnly);
  const warnings = [.../* @__PURE__ */ new Set([...v.warnings, ...[...cellErrors].filter((e) => !checkOnly.has(e)).slice(0, 100), ...reuseWarnings])].slice(0, 200);
  const clips = /* @__PURE__ */ new Set();
  const warn = (msg, clip) => {
    if (warnings.length < 200 && !warnings.includes(msg)) warnings.push(msg);
    if (clip) clips.add(msg);
  };
  const clipped = () => warnings.filter((w) => clips.has(w));
  const page = resolvePage(def.page);
  if (["pageHeader", "body", "pageFooter"].some((k) => hasType(k === "body" && Array.isArray(def.sections?.body) ? def.sections.body.flatMap((b) => [...b?.items || [], ...b?.pageHeader?.items || [], ...b?.pageFooter?.items || []]) : def.sections?.[k]?.items, "barcode"))) await loadBarcodes();
  let timeZone = def.timeZone || opts.timeZone;
  if (timeZone && !validTimeZone(timeZone)) {
    warn(`The time zone "${String(timeZone).slice(0, 60)}" is not known, so dates show in the server's zone.`);
    timeZone = void 0;
  }
  const params = resolveParameters(def, opts.parameters || {}, { now: opts.now, timeZone, locale: def.locale });
  const unknownFonts = /* @__PURE__ */ new Set();
  const store2 = opts.fontStore || new FontStore(
    /** @type {any} */
    opts.loadFont
  );
  const defFonts = fontsForDef(def, unknownFonts);
  const standardOnly = defFonts.length > 0 && defFonts.every(isStandard);
  await store2.load([.../* @__PURE__ */ new Set([...standardOnly ? [] : [CORE_FONT_KEY, ...opts.lazyFonts ? [] : PRELOAD_KEYS], ...defFonts])]);
  if (!store2.fonts.size) await store2.load([CORE_FONT_KEY]);
  let m = new TextMeasurer(store2);
  const deadline = opts.deadline ?? (Number(opts.timeoutMs) > 0 ? t0 + Number(opts.timeoutMs) : null);
  const clock = deadline ? { until: deadline, n: 0, over: false } : null;
  const overTime = () => {
    if (clock && (clock.over || Date.now() > clock.until)) {
      throw new ReportError(`The report ran longer than ${Math.round(Number(opts.timeoutMs || deadline - t0) / 100) / 10} s, the time limit on this server. Filter the data, or avoid aggregates over the whole data set in every row.`, { status: 504, timeout: true });
    }
  };
  const now = opts.now || /* @__PURE__ */ new Date();
  const fnCount = opts.fnCount || { n: 0 };
  const baseCtx = baseContext(def, { params, now, timeZone, fnCount, clock });
  baseCtx.theme = await resolveTheme(def, baseCtx, getReport, warn);
  const target = opts.target || opts.state?.target || "export";
  const layerOff = layerFilter(def.layers, target);
  const named = flattenNamed(def.styles?.named, warn);
  const sources = opts.sources || await loadSources(def, { params, fetch: opts.fetch, baseUrl: opts.baseUrl, sql: opts.sql, reportId: opts.reportId, ...fetchOpts(opts, deadline) });
  opts.onSources?.(sources);
  const dataSets = buildDataSets(def, sources, { ...baseCtx, warn });
  baseCtx.dataSets = dataSets;
  overTime();
  const defaultDs = def.dataSets?.[0]?.name;
  await store2.load(fontsFor(textsOf(def, dataSets)));
  const kept = warnings.length;
  const sec = def.sections || {};
  const bodies = Array.isArray(sec.body) ? sec.body.length ? sec.body : [{}] : [sec.body || {}];
  const allBody = bodies.flatMap((b) => b.items || []);
  const header = sec.pageHeader?.height ? sec.pageHeader : null;
  const footer = sec.pageFooter?.height ? sec.pageFooter : null;
  const headerH = header?.height || 0;
  const footerH = footer?.height || 0;
  const contentH = page.height - page.margins.top - page.margins.bottom - headerH - footerH;
  if (contentH < 24) throw new ReportError("The page header and footer leave no room for the body. Make them shorter or the margins smaller.");
  const base = { ...BASE_STYLE, ...def.styles?.base || {} };
  let idSeq = 0;
  const regions = [];
  const tablesSeen = { n: 0 };
  const imageBudget = opts.imageBudget || { seen: /* @__PURE__ */ new Set(), bytes: 0 };
  const makeLc = (globals, fixed2) => {
    const lc = {
      m,
      base,
      dataSets,
      warn,
      fixed: fixed2,
      maxUnitHeight: contentH,
      state: opts.state || {},
      tablesSeen,
      regions: opts.exportData || opts.dataOnly ? regions : null,
      dataOnly: !!opts.dataOnly,
      // exportData: true: table data and cell tags (Excel, CSV, Word, HTML, accessible PDF)
      named,
      parts,
      layerOff,
      nextId: () => ++idSeq,
      // the time limit, read every 256 rows of tables and lists (expr/evaluate.js counts evaluations the same way)
      tick: clock ? () => {
        if (clock.over || (++clock.n & 255) === 0 && Date.now() > clock.until) {
          clock.over = true;
          overTime();
        }
      } : null,
      layoutItems: (items, l, o) => layoutItems(items, l, o),
      linkFor: (it, ctx, rect) => linkFor(it, ctx, rect, warn, opts.state),
      ctxFor: (item) => {
        const ds = item.dataSet || defaultDs;
        const rows = ds && dataSets[ds] || [];
        return { ...baseCtx, globals, fields: (opts.pageWindow?.first && ds === defaultDs ? opts.pageWindow.first : rows[0]) || null, aggRows: rows };
      },
      subreports: null,
      bodyWidth: opts.bodyWidth ?? page.bodyWidth,
      images: def.images || {},
      imageBudget,
      cellItems: { left: 1e5 },
      // rows of items inside table cells, for the whole render (items/index.js)
      win: opts.pageWindow || null
      // paged.js: units carry their row number (dataRow, rowHead), rows and groups continue
    };
    return lc;
  };
  const firstPages = Number(opts.firstPages) || 0;
  let cutRows = () => false;
  let layoutPasses = 0;
  const layoutAll = async () => {
    layoutPasses++;
    warnings.length = kept;
    idSeq = 0;
    if (!opts.fnCount) fnCount.n = 0;
    const lc = makeLc(baseCtx.globals, false);
    const budget = () => ({ left: Math.ceil(firstPages * contentH / 8), cut: false });
    const hasToc = hasType(allBody, "toc");
    lc.rowBudget = firstPages > 0 && !opts.bodyOnly && !hasToc ? budget() : null;
    cutRows = () => !!lc.rowBudget?.cut;
    if (hasType(allBody, "subreport")) {
      if (!opts.loadReport) lc.subreports = null;
      else {
        const depth = opts.depth || 0;
        if (depth > 3) throw new ReportError("Subreports are nested more than 3 levels deep");
        const requests = /* @__PURE__ */ new Map();
        layoutItems(allBody, { ...lc, regions: [], warn: () => {
        }, subreports: { mode: "collect", requests } });
        const budget2 = opts.budget || { used: 0 };
        if (budget2.used + requests.size > MAX_SUBREPORTS) throw new ReportError(`This report would render more than ${MAX_SUBREPORTS} subreports. Filter the data, or show the rows in a table.`);
        budget2.used += requests.size;
        const results = /* @__PURE__ */ new Map();
        const defs = /* @__PURE__ */ new Map();
        for (const [key, rq] of requests) {
          try {
            const id = subreportId(rq.report, baseCtx);
            if ((opts.chain || []).includes(id)) throw new Error("it includes itself");
            if (!defs.has(id)) defs.set(id, await opts.loadReport(id));
            const child = defs.get(id);
            const r = await render(child, { ...opts, dataOnly: false, target, onSources: void 0, deadline: deadline ?? void 0, reportId: id, budget: budget2, fnCount, imageBudget, parameters: rq.params, bodyOnly: true, depth: depth + 1, chain: [...opts.chain || [], def.name, id], bodyWidth: page.bodyWidth, state: {} });
            results.set(key, r);
            for (const w of r.warnings) warn(`Subreport ${rq.report}: ${w}`, r.clipped?.includes(w));
          } catch (e) {
            if (e.timeout) throw e;
            results.set(key, { error: e.message });
          }
        }
        lc.subreports = { mode: "use", results };
      }
    }
    const geometry = (b, bi) => {
      const pg = bi === 0 && !b.page ? page : resolvePage({ ...def.page || {}, ...b.page || {} });
      const hdr = sectionBand(b.pageHeader, header), ftr = sectionBand(b.pageFooter, footer);
      const hH = hdr?.height || 0, fH = ftr?.height || 0;
      const cH = pg.height - pg.margins.top - pg.margins.bottom - hH - fH;
      if (cH < 24) throw new ReportError(`Body section ${bi + 1}: the page header and footer leave no room for the body.`);
      const colCount = Math.max(1, Math.min(6, Number(b.columns?.count) || 1));
      const colGap = Number(b.columns?.gap ?? 18);
      const colW = (pg.bodyWidth - colGap * (colCount - 1)) / colCount;
      return { pg, cH, colCount, colGap, colW, hdr, ftr, hH, fH, own: { h: hdr !== header, f: ftr !== footer }, bodyWidth: colCount > 1 ? colW : bi === 0 && !b.page ? lc.bodyWidth : pg.bodyWidth };
    };
    const geos = bodies.map(geometry);
    lc.bodyWidth = geos[0].bodyWidth;
    const edge = (items, dx, W2, depth) => {
      if (!Array.isArray(items) || depth > 32) return;
      for (const it of items) {
        if (!it || typeof it !== "object") continue;
        const right = dx + (Number(it.x) || 0) + (Number(it.w) || 0);
        if (it.type !== "table" && it.type !== "matrix" && right > W2 + 1) warn(`${it.name || it.type}: it reaches ${Math.round(right)}pt, past the ${Math.round(W2)}pt the page has for the body, so the part past the edge is not printed`, true);
        else edge(it.items, dx + (Number(it.x) || 0), W2, depth + 1);
      }
    };
    if (!page.pageless) bodies.forEach((b, i) => edge(b.items, 0, geos[i].bodyWidth, 0));
    const assemble = (tocEntries) => {
      regions.length = 0;
      lc.toc = tocEntries;
      const overflow = lc.overflow = { pending: /* @__PURE__ */ new Map(), more: null, repeat: false, head: null };
      const parts2 = [];
      sections: for (let bi = 0; bi < bodies.length; bi++) {
        const g = geos[bi];
        const blc = bi === 0 && !bodies[0].page && g.cH === contentH ? lc : { ...lc, bodyWidth: g.bodyWidth, maxUnitHeight: g.cH };
        for (let rep = 0; ; rep++) {
          overflow.more = null;
          overflow.repeat = rep > 0;
          overflow.head = null;
          const body = layoutItems(bodies[bi].items || [], blc);
          if (opts.bodyOnly) return { body };
          if (opts.dataOnly) continue sections;
          if (g.pg.pageless) for (const u of body.units) {
            u.breakBefore = false;
            u.breakAfter = false;
          }
          const slices = paginate(body.units, body.tables, g.cH, warn);
          parts2.push({ body, slices, g });
          if (lc.rowBudget?.cut) break sections;
          if (!overflow.more) break;
          if (rep + 1 >= REUSE_LIMITS.repeats) {
            warn(`${overflow.more}: the rows need more than ${REUSE_LIMITS.repeats} continuation pages; the rest are left out.`);
            overflow.pending.clear();
            break;
          }
        }
      }
      if (opts.dataOnly) return null;
      if (!lc.rowBudget?.cut) for (const p of overflow.pending.values()) warn(`${p.table}: ${p.units.length} rows did not fit its frame and there is no overflow placeholder "${p.to}" after it.`);
      const list = [];
      for (const part2 of parts2) {
        const nk = Math.ceil(part2.slices.length / part2.g.colCount);
        for (let k = 0; k < nk; k++) list.push({ part: part2, k, last: k === nk - 1 });
      }
      if (lc.rowBudget?.cut) list.length = Math.min(list.length, firstPages);
      const total = list.length;
      const secStart = new Array(total).fill(0);
      list.forEach((e, i) => {
        var _a;
        if (i === 0) return;
        const p = e.part.slices[e.k * e.part.g.colCount];
        (_a = e.part).starts || (_a.starts = new Set(e.part.body.units.filter((u) => u.sectionStart).map((u) => Math.round(u.top * 100))));
        secStart[i] = e.part.starts.has(Math.round(p.top * 100)) ? i : secStart[i - 1];
      });
      const secLen = /* @__PURE__ */ new Map();
      for (const st of secStart) secLen.set(st, (secLen.get(st) || 0) + 1);
      const first = parts2[0].g.pg;
      let pageH = first.height;
      if (first.pageless && parts2.length === 1) {
        const sl = parts2[0].slices;
        if (sl.length === 1) pageH = Math.max(first.minHeight, first.margins.top + parts2[0].g.hH + sl[0].bottom - sl[0].top + parts2[0].g.fH + first.margins.bottom);
        else warn(`This pageless report is taller than 200 inches, the largest PDF page, so it is split into ${sl.length} pages.`);
      }
      const bandCache = /* @__PURE__ */ new Map();
      const bandWork = { left: BAND_ITEMS };
      const bookmarks2 = [];
      const headings = [];
      const pages2 = [];
      list.forEach(({ part: part2, k, last }, n) => {
        const { body, slices, g } = part2;
        const { pg, colCount, colW, colGap, cH } = g;
        const ph = parts2.length === 1 ? pageH : pg.height;
        const ml = pg.margins.left, mt = pg.margins.top;
        const bodyTop = mt + g.hH;
        const items = [];
        const cut = lc.rowBudget?.cut;
        const win = opts.pageWindow, off = win ? win.offset : 0, all = win ? win.total ?? "…" : null;
        const globals = { ...baseCtx.globals, PageNumber: n - secStart[n] + 1 + (secStart[n] ? 0 : off), TotalPages: cut ? "…" : all ?? secLen.get(secStart[n]), OverallPageNumber: n + 1 + off, OverallTotalPages: cut ? "…" : all ?? total };
        const isFirst = n + off === 0, isLast = n === total - 1 && (!win || win.final);
        const plc = makeLc(globals, true);
        const band = (section, y0, isFirst2, isLast2) => {
          if (!section) return;
          if (isFirst2 && section.printOnFirstPage === false) return;
          if (isLast2 && section.printOnLastPage === false) return;
          const capped2 = () => warn(`The page headers and footers would draw more than ${BAND_ITEMS.toLocaleString("en-US")} items in this report; they are left out of the later pages. Make them lighter, or the report shorter.`);
          if (bandWork.left <= 0) {
            capped2();
            return;
          }
          plc.tick?.();
          let c = bandCache.get(section);
          if (!c) bandCache.set(section, c = { paged: pagedBand(section, def.functions), units: null });
          const r = c.units ? { units: c.units } : layoutItems(section.items || [], plc);
          if (!c.units) for (const u of r.units) for (const d of u.items) d.art = 1;
          if (!c.paged) c.units = r.units;
          let n2 = 0;
          for (const u of r.units) n2 += u.items.length;
          if ((bandWork.left -= n2) < 0) {
            capped2();
            return;
          }
          for (const u of r.units) if (c.paged) placeItems(u.items, ml, y0 + u.top, items);
          else for (const it of shiftItems(u.items, ml, y0 + u.top)) items.push(it);
        };
        band(g.hdr, mt, g.own.h ? k === 0 : isFirst, g.own.h ? last : isLast);
        const frozen = [];
        for (let c = 0; c < colCount; c++) {
          const p = slices[k * colCount + c];
          if (!p) break;
          const cx = ml + c * (colW + colGap);
          for (const t of p.repeat) placeItems(t.headerItems, cx, bodyTop, items);
          for (const t of body.tables) {
            if (!(t.top < p.bottom - EPS4 && t.bottom > p.top + EPS4)) continue;
            const cont = p.repeat.includes(t);
            let off2 = 0;
            if (!cont) {
              for (const r of p.repeat) if (t.x0 < r.x1 - EPS4 && r.x0 < t.x1 - EPS4) off2 = Math.max(off2, r.headerHeight);
            }
            const y = cont ? bodyTop : bodyTop + off2 + t.top - p.top;
            frozen.push({ x: cx + t.x0, y, w: t.x1 - t.x0, h: t.headerHeight, end: bodyTop + (cont ? t.headerHeight : off2) + Math.min(t.bottom, p.bottom) - p.top });
          }
          for (const u of p.units) {
            let off2 = 0;
            for (const t of p.repeat) if (u.x0 < t.x1 - EPS4 && t.x0 < u.x1 - EPS4) off2 = Math.max(off2, t.headerHeight);
            if (u.atBottom) off2 += Math.max(0, cH - off2 - (p.bottom - p.top));
            if (u.cont && u.top <= p.top + EPS4) placeItems(u.cont, cx, bodyTop + off2, items);
            placeItems(u.items, cx, bodyTop + off2 + (u.top - p.top), items);
          }
        }
        band(g.ftr, ph - pg.margins.bottom - g.fH, g.own.f ? k === 0 : isFirst, g.own.f ? last : isLast);
        let j = 0;
        for (let i = 0; i < items.length; i++) {
          const it = items[i];
          if (it.t === "bookmark") (it.heading ? headings : bookmarks2).push({ label: it.label, page: n + 1 + off, y: it.y, level: it.level || 0, ...secStart[n] ? { shown: n - secStart[n] + 1 } : {} });
          else items[j++] = it;
        }
        items.length = j;
        const out = frozen.length ? { items, frozen } : { items };
        if (win) {
          const u = slices[k * colCount]?.units[0];
          if (u?.dataRow != null) {
            out.firstRow = u.dataRow;
            out.rowHead = !!u.rowHead;
            if (u.headLevel != null) out.headLevel = u.headLevel;
          }
        }
        if (pg.width !== first.width || ph !== pageH) {
          out.width = pg.width;
          out.height = ph;
        }
        pages2.push(out);
      });
      const found = [...bookmarks2, ...headings];
      if (tocEntries.length && !lc.rowBudget?.cut && found.length === tocEntries.length && found.every((f4, i) => f4.label === tocEntries[i].label)) {
        for (const pg of pages2) {
          const shift = /* @__PURE__ */ new Map();
          for (const it of pg.items) {
            if (it.tocPage == null) continue;
            const f4 = found[it.tocPage], ln = it.lines[0], num4 = String(f4.shown ?? f4.page);
            const nw = m.width(num4, it.font, it.size);
            shift.set(it.tocPage, ln.w - nw);
            ln.x += ln.w - nw;
            ln.w = nw;
            ln.text = num4;
          }
          for (const it of pg.items) {
            if (it.tocDots != null) it.x2 += shift.get(it.tocDots) || 0;
            if (it.tocLink != null && it.action.page != null) {
              it.action.page = found[it.tocLink].page;
              it.action.y = found[it.tocLink].y;
            }
          }
        }
      }
      for (const pg of pages2) for (const it of pg.items) if (it.tocPage != null || it.tocDots != null || it.tocLink != null) {
        delete it.tocPage;
        delete it.tocDots;
        delete it.tocLink;
      }
      return { pages: pages2, bookmarks: bookmarks2, headings, pageStarts: [...new Set(secStart)].filter((i) => i > 0), height: pageH, width: first.width };
    };
    const tocOf = (r, pending) => [...r.bookmarks.map((b) => ({ label: b.label, level: b.level, page: pending ? "…" : b.page })), ...r.headings.map((b) => ({ label: b.label, level: b.level, page: pending ? "…" : b.page, y: pending ? void 0 : b.y, heading: true }))];
    let result2 = assemble([]);
    if (opts.bodyOnly || opts.dataOnly) return result2;
    if (hasToc) {
      if (firstPages > 0) {
        lc.rowBudget = budget();
        const part2 = assemble(tocOf(result2, true));
        if (lc.rowBudget.cut) return part2;
        lc.rowBudget = null;
      }
      for (let pass = 0; pass < 3; pass++) {
        const entries = tocOf(result2, false);
        result2 = assemble(entries);
        const found = [...result2.bookmarks, ...result2.headings];
        if (found.length === entries.length && found.every((f4, i) => f4.label === entries[i].label)) break;
      }
    }
    return result2;
  };
  let result = await layoutAll();
  for (let pass = 0; m.missing.size && pass < 3; pass++) {
    await store2.load([...m.missing]);
    m = new TextMeasurer(store2);
    result = await layoutAll();
  }
  overTime();
  if (opts.stats) opts.stats.layoutPasses = layoutPasses;
  for (const k of store2.failed) if (k !== SHAPER && !OPTIONAL_KEYS.includes(k)) warn(`The font "${k}" did not load, so its text is drawn in a bundled face instead.`);
  for (const f4 of [...unknownFonts, ...m.unknownFonts]) warn(`Font "${f4}" is not available; using ${familyOf(f4).family}.`);
  const lacking = /* @__PURE__ */ new Map();
  for (const [k, chars] of m.substituted) {
    const f4 = fontCss(k).family, l = lacking.get(f4) || { sub: fontCss(embeddedFace(k)).family, chars: /* @__PURE__ */ new Set() };
    for (const c of chars) l.chars.add(c);
    lacking.set(f4, l);
  }
  for (const [f4, l] of lacking) warn(`Font "${f4}" can't show "${[...l.chars].slice(0, 20).join("")}"; used ${l.sub} for them.`);
  if (m.unshaped) warn("The text shaper (harfbuzz.wasm) did not load, so Arabic, Hebrew, Indic and Thai text is not shaped (letters unjoined, marks misplaced). A font loader must map each key with fontFile(key).");
  if (m.noGlyph.size) {
    const cjk2 = [...m.noGlyph].some((c) => /[\u1100-\u11ff\u2600-\u27bf\u2b00-\u2bff\u3000-\u9fff\uac00-\ud7af\uf900-\ufaff\uff00-\uffef]|[\u{1f000}-\u{1faff}]/u.test(c));
    const list = [...m.noGlyph].slice(0, 20).join(" ");
    warn(cjk2 ? `${NO_CJK_FONTS}. Until then these characters show as boxes: ${list}.` : `No font has these characters, so they show as boxes: ${list}. Upload a font that has them and use it for this text.`);
  }
  if (opts.bodyOnly) return { units: result.body.units, tables: result.body.tables, height: result.body.height, regions, warnings, clipped: clipped() };
  if (opts.dataOnly) return {
    pages: [],
    regions,
    warnings,
    name: def.name || "",
    timeZone: timeZone || null,
    locale: def.locale || null,
    currency: def.currency || null,
    dataOnly: true,
    stats: { ms: Date.now() - t0, pages: 0, rows: Object.fromEntries(Object.entries(dataSets).map(([k, r]) => [k, r.length])) }
  };
  const { pages, bookmarks, height } = result;
  for (const pg of pages) finishText(pg.items, m);
  const keepItem = (it) => {
    if (it.t === "field") {
      it.draw = it.draw.filter(keepItem);
      return true;
    }
    if (it.t !== "image") return true;
    it.src = resolveImageSrc(it.src, "Background image", { images: def.images || {}, budget: imageBudget, warn });
    return !!it.src;
  };
  for (const pg of pages) {
    let j = 0;
    for (const it of pg.items) if (keepItem(it)) pg.items[j++] = it;
    pg.items.length = j;
  }
  return {
    width: result.width ?? page.width,
    height,
    pages,
    warnings,
    clipped: clipped(),
    bookmarks,
    headings: result.headings || [],
    pageStarts: result.pageStarts || [],
    regions: opts.exportData ? regions : null,
    hasTables: tablesSeen.n > 0,
    name: def.name || "",
    partial: cutRows(),
    timeZone: timeZone || null,
    // the zone dates were shown in (exports write their dates on that clock)
    locale: def.locale || null,
    // exports format numbers the report's way (Excel: Indian lakh grouping)
    currency: def.currency || null,
    // Excel's currency symbol (else the locale's, as the page)
    stats: { ms: Date.now() - t0, pages: pages.length, rows: Object.fromEntries(Object.entries(dataSets).map(([k, r]) => [k, r.length])) }
  };
}
function subreportId(raw, ctx) {
  const id = typeof raw === "string" && raw.startsWith("=") ? evalValue(raw, ctx) : raw;
  if (!isSubreportId(id)) throw new Error(`"${String(id).slice(0, 80)}" is not a report id`);
  return id;
}
function baseContext(def, { params, now, timeZone, fnCount, clock }) {
  return {
    params,
    globals: { ExecutionTime: now, ReportName: def.name || "", PageNumber: 1, TotalPages: 1 },
    dataSets: {},
    fields: null,
    locale: def.locale,
    currency: def.currency,
    nonFinite: def.nonFinite,
    grouping: def.grouping,
    // neither set: en-US numbers, no currency symbol (expr/format.js)
    nullPropagation: def.nullPropagation === true,
    // Nothing: VB semantics unless the report asks for SQL nulls (expr/evaluate.js)
    // + - * and Sum on decimal values (SSRS Decimal: 0.1 + 0.2 = 0.3) unless the report asks for IEEE doubles, as Java and JavaScript compute (imported JasperReports and BIRT reports)
    doubles: def.arithmetic === "double",
    bandRows: def.bandRows,
    // "first-last": table headers read the first data row, footers the last (imported BIRT reports; items/index.js)
    // dates on the wall clock of the report's time zone, else the render's (the server passes the viewer's), else the host's
    timeZone: timeZone || void 0,
    caseSensitive: def.caseSensitive === true,
    // text order and grouping (expr/evaluate.js sortCompare)
    nullOrder: def.nullOrder,
    // "low": nulls sort as the smallest value (imported JasperReports and BIRT reports)
    collation: def.collation,
    // "ordinal" (BIRT) or "java" (JasperReports): text order as the source engine compares
    naturalSort: def.naturalSort === true,
    // "9" before "10" in text (default: text order, as SSRS)
    functions: functionTable(def, fnCount),
    clock,
    aggCache: /* @__PURE__ */ new WeakMap(),
    // aggregate results for this render (expr/evaluate.js)
    fmtMemo: /* @__PURE__ */ new Map()
    // formatted dates for this render (expr/format.js)
  };
}
function sectionBand(own, shared) {
  if (!own || typeof own !== "object" || Array.isArray(own)) return shared;
  return own.hidden || !(Number(own.height) > 0) ? null : own;
}
function pagedBand(section, functions) {
  return /globals/i.test(JSON.stringify(section.items || [])) || functions != null && /globals/i.test(JSON.stringify(functions));
}
function hasType(items, type) {
  return (items || []).some((i) => i.type === type || hasType(i.items, type));
}
function linkFor(it, ctx, rect, warn, state) {
  let tip;
  if (it?.tooltip) {
    try {
      const t = evalValue(it.tooltip, ctx);
      if (t != null && t !== "") tip = String(t);
    } catch (e) {
      warn(`${it.name || "Tooltip"}: ${e.message}`);
    }
  }
  const l = linkAction(it, ctx, rect, warn, state);
  if (l) return tip ? { ...l, tip } : l;
  return tip ? { t: "link", ...rect, action: null, tip } : null;
}
function linkAction(it, ctx, rect, warn, state) {
  const a = it?.action;
  if (!a || !a.type || a.type === "none") return null;
  try {
    if (a.type === "toggleItem") {
      const key = `item:${String(a.target || "")}`;
      return a.target ? { t: "link", ...rect, action: { type: "toggle", key, open: !!state?.toggles?.[key] } } : null;
    }
    if (a.type === "params") {
      const params = {};
      for (const [k, v] of Object.entries(a.params || {})) {
        const x = evalValue(v, ctx);
        params[k] = x instanceof Date ? isoDate(x, ctx.timeZone) : x == null ? "" : x;
      }
      return { t: "link", ...rect, action: { type: "params", params, toggle: a.toggle !== false } };
    }
    if (a.type === "url") {
      const href = safeUrl(String(evalValue(a.url ?? "", ctx) ?? ""));
      if (!href) return null;
      return { t: "link", ...rect, action: { type: "url", href } };
    }
    if (a.type === "report") {
      const params = {};
      for (const [k, v] of Object.entries(a.params || {})) {
        const x = evalValue(v, ctx);
        params[k] = x instanceof Date ? isoDate(x, ctx.timeZone) : x;
      }
      return { t: "link", ...rect, action: { type: "drill", report: String(evalValue(a.report, ctx)), params } };
    }
    if (a.type === "bookmark") return { t: "link", ...rect, action: { type: "bookmark", target: String(evalValue(a.target, ctx)) } };
  } catch (e) {
    warn(`${it.name || "Link"}: ${e.message}`);
  }
  return null;
}
function splitMulti(s, options) {
  const known = new Set((Array.isArray(options) ? options : []).map((o) => String(typeof o === "object" && o ? o.value : o)));
  if (known.has(s.trim())) return [s.trim()];
  const parts = s.split(/(?<!\\),/).map((x) => x.replace(/\\,/g, ","));
  const out = [];
  for (let i = 0; i < parts.length; i++) {
    let j = parts.length;
    for (; j > i + 1; j--) if (known.has(parts.slice(i, j).join(",").trim())) break;
    out.push(parts.slice(i, j).join(",").trim());
    i = j - 1;
  }
  return out.filter(Boolean);
}
function resolveParameters(def, given, o = {}) {
  const { lenient = false, now, timeZone, locale } = o;
  const out = {}, missing = [];
  const ctx = { params: {}, globals: { ExecutionTime: now || /* @__PURE__ */ new Date() }, dataSets: {}, fields: null, functions: functionTable(def), timeZone, locale };
  const copt = { timeZone };
  for (const p of def.parameters || []) {
    let val = given[p.name];
    const chosenNull = val === null && p.nullable && !p.multi && Object.hasOwn(given, p.name);
    if (!chosenNull && (val == null || val === "") && p.default != null && p.default !== "") {
      try {
        val = evalValue(p.default, ctx);
      } catch {
        val = null;
      }
    }
    if (p.multi) {
      let list = Array.isArray(val) ? val : val == null || val === "" ? [] : splitMulti(String(val), p.options);
      val = list.map((x) => coerce(x, p.type || "string", copt));
      if (p.required && !val.length) missing.push(p.name);
    } else {
      if (val === "" && (p.type !== "string" || p.nullable && !p.allowBlank)) val = null;
      else val = coerce(val, p.type || "string", copt);
      if (p.required && (val == null && !p.nullable || val === "" && !p.allowBlank)) missing.push(p.name);
    }
    out[p.name] = val;
    ctx.params[p.name] = val;
  }
  if (missing.length && !lenient) throw new ReportError(`Enter a value for: ${missing.join(", ")}`, { missingParameters: missing });
  return out;
}

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
function setFetchPolicy({ allowHosts, unsafeFetch = false, fetch: f4 = null } = {}) {
  policy = { allowHosts: (allowHosts || []).map((h) => String(h).toLowerCase().replace(/^\[|\]$/g, "")), unsafeFetch: !!unsafeFetch, fetch: typeof f4 === "function" ? f4 : null };
}
function failed(e, url) {
  if (e?.status || !(e instanceof TypeError)) return e;
  return Object.assign(new Error(`the request to ${redactUrl(url)} failed (${e.message}): the server may not allow this page to read it (CORS: it must send Access-Control-Allow-Origin), the network or the server may be down, or the browser blocked it (a content security policy or an extension)`), { cause: e });
}
var DATA = [/^\/api\/sample\//, /^\/api\/data\/proxy$/];
var OURS = /^\/(?:$|api(?:\/|$)|admin(?:\/|$)|designer(?:\/|$)|viewer(?:\/|$)|login(?:\/|$)|embed(?:\/|$)|_next(?:\/|$))/i;
var BUSY = /* @__PURE__ */ new Set([429, 502, 503, 504]);
function withRetry(f4, { onRetry, retries = 3, wait = (ms) => new Promise((r) => setTimeout(r, ms)) } = {}) {
  return (
    /** @type {any} */
    (async (url, init = {}) => {
      const method = String(init.method || "GET").toUpperCase();
      const read = method === "GET" || method === "HEAD" || method === "POST" && /\/api\/data\/sql$/.test(new URL(String(url), "http://x").pathname);
      for (let attempt = 1; ; attempt++) {
        const res = await f4(url, init);
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
  const self2 = new URL(base).origin;
  const { allowHosts, unsafeFetch } = policy;
  const send2 = (url, init) => f0(url, init).catch((e) => {
    throw failed(e, url);
  });
  const f4 = withRetry(send2, { onRetry, retries, wait });
  const guarded = unsafeFetch ? f4 : guardedFetch({ allowHosts, viaBase: true }, f4);
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
      if (u.origin !== self2) return other(u.href, { ...init, credentials: "omit" });
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
      return f4(u.href, { ...init, credentials: ours ? "same-origin" : "omit", redirect: "error" });
    })
  );
  if (!unsafeFetch) out.hostRule = { allowHosts };
  return out;
}

// src/worker/engine.worker.js
var fid = 0;
var fontWait = /* @__PURE__ */ new Map();
var store = new FontStore((key) => new Promise((resolve, reject) => {
  const n = ++fid;
  fontWait.set(n, { resolve, reject });
  self.postMessage({ font: key, fid: n });
}));
var PART = 50;
function send(id, msg, model) {
  const { pages, ...rest } = model;
  if (!Array.isArray(pages)) {
    self.postMessage({ id, ...msg, model });
    return;
  }
  for (let i = 0; i < pages.length; i += PART) self.postMessage({ id, pagesPart: pages.slice(i, i + PART) });
  self.postMessage({ id, ...msg, model: rest, inParts: true });
}
self.onmessage = async (e) => {
  if (e.data.fid) {
    const w = fontWait.get(e.data.fid);
    fontWait.delete(e.data.fid);
    if (e.data.error) w?.reject(new Error(e.data.error));
    else w?.resolve(e.data.buf);
    return;
  }
  const { id, def, params, state, reportId, fonts, firstPages, exportData, dataOnly, env = {} } = e.data;
  try {
    setCustomFonts(fonts || []);
    setFetchPolicy(env.fetchPolicy);
    const origin = env.origin || self.location.origin;
    const loadReport = async (rid) => {
      if (env.reports && Object.hasOwn(env.reports, rid)) return structuredClone(env.reports[rid]);
      if (env.standalone) throw new Error(`Report "${rid}" is not loaded: pass it in reports: { "${rid}": definition }, or set server (a self-hosted ReportWright server)`);
      const r = await fetch(`${origin}/api/reports/${encodeURIComponent(rid)}`, { redirect: "error" });
      if (!r.ok) throw new Error(`Report "${rid}" not found`);
      return r.json();
    };
    const opts = { parameters: params, state, reportId, exportData: !!exportData, dataOnly: !!dataOnly, fontStore: store, lazyFonts: true, baseUrl: origin, fetch: reportFetch(origin, void 0, { onRetry: (retry) => self.postMessage({ id, retry }) }), loadReport };
    let sources;
    if (firstPages) {
      const part2 = await render(def, { ...opts, firstPages, onSources: (s) => {
        sources = s;
      } });
      if (!part2.partial) {
        send(id, { ok: true }, part2);
        return;
      }
      send(id, { ok: true, partial: true }, part2);
    }
    const model = await render(def, { ...opts, sources });
    send(id, { ok: true }, model);
  } catch (err) {
    if (err instanceof TypeError && /import/i.test(err.message)) {
      self.postMessage({ id, mainThread: err.message });
      return;
    }
    self.postMessage({ id, ok: false, error: { message: err.message, missingParameters: err.missingParameters || null } });
  }
};

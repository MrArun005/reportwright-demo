// src/engine/lazylibs.js
var fontkit;
var PDFDocument;
var PDFName;
var PDFString;
var PDFHexString;
var PDFRawStream;
var PDFStream;
var PDFArray;
var PDFDict;
var PDFNumber;
var PDFBool;
var rgb;
var pushGraphicsState;
var popGraphicsState;
var concatTransformationMatrix;
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
var pl;
var loadFontkit = () => fk || (fk = load("@pdf-lib/fontkit", () => import("@pdf-lib/fontkit")).then((m) => {
  const d = m.default || m;
  fontkit = d.default || d;
}));
var loadPdfLib = () => pl || (pl = Promise.all([load("pdf-lib", () => import("pdf-lib")), loadFontkit()]).then(([L]) => {
  ({
    PDFDocument,
    PDFName,
    PDFString,
    PDFHexString,
    PDFRawStream,
    PDFStream,
    PDFArray,
    PDFDict,
    PDFNumber,
    PDFBool,
    rgb,
    pushGraphicsState,
    popGraphicsState,
    concatTransformationMatrix
  } = L);
}));

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
var STANDARD_KEYS = new Set(STANDARD_FACES.map((f) => String(f[1])));
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
  PLAIN.forEach((f, i) => {
    const s = x.malloc(f.length + 1);
    new Uint8Array(memory.buffer).set([...f].map((c) => c.charCodeAt(0)).concat(0), s);
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
    shape(font, text, rtl, plain = false) {
      const n = text.length;
      const p = x.malloc(n * 2 + 2);
      const u16 = new Uint16Array(memory.buffer, p, n);
      for (let i = 0; i < n; i++) u16[i] = text.charCodeAt(i);
      const b = x.hb_buffer_create();
      x.hb_buffer_add_utf16(b, p, n, 0, n);
      x.hb_buffer_set_direction(b, rtl ? RTL : LTR);
      x.hb_buffer_guess_segment_properties(b);
      x.hb_shape(font.ptr, b, plain ? featPtr : 0, plain ? PLAIN.length : 0);
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
var addFace = (f) => {
  var _a;
  (FONT_FAMILIES[_a = f.family] || (FONT_FAMILIES[_a] = [])).push(f);
  FACES.set(f.key, f);
};
for (const [family, key, weight, style = "normal", file] of BUNDLED) {
  addFace({ family: String(family), key: String(key), weight: Number(weight), style: style === "italic" ? "italic" : "normal", file: String(file || `${key}.ttf`) });
}
for (const [family, key, weight, style] of STANDARD_FACES) {
  addFace({ family: String(family), key: String(key), weight: Number(weight), style: style === "italic" ? "italic" : "normal", file: "", standard: true });
}
var BUNDLED_FAMILIES = Object.keys(FONT_FAMILIES);
var DEFAULT_FAMILY = "Inter";
var ALL_FONT_KEYS = [...FONT_FAMILIES.Inter, ...FONT_FAMILIES["JetBrains Mono"]].map((f) => f.key);
var CORE_FONT_KEY = "Inter-Regular";
var PRELOAD_KEYS = [...ALL_FONT_KEYS];
var SHAPER = "harfbuzz";
function fontFile(key) {
  if (key === SHAPER) return "harfbuzz.wasm";
  return FACES.get(key)?.file || `${key}.ttf`;
}
function setCustomFonts(list) {
  familyCache.clear();
  for (const [k, f] of FACES) if (k.startsWith("u-")) {
    FACES.delete(k);
    const left = FONT_FAMILIES[f.family].filter((x) => x.key !== k);
    if (left.length) FONT_FAMILIES[f.family] = left;
    else delete FONT_FAMILIES[f.family];
  }
  for (const f of list || []) {
    if (BUNDLED_FAMILIES.includes(f.family) || !/^[a-f0-9]{8,64}$/.test(String(f.id))) continue;
    addFace({ key: `u-${f.id}`, family: String(f.family), weight: Number(f.weight) || 400, style: f.style === "italic" ? "italic" : "normal", file: `custom/${f.id}` });
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
    const f = familyOf(String(family));
    if (f.unknown && unknown && !f.unknown.startsWith("=")) unknown.add(f.unknown);
    faces = FONT_FAMILIES[f.family] || FONT_FAMILIES[DEFAULT_FAMILY];
  }
  const w = weight === "bold" ? 700 : weight === "normal" || weight == null ? 400 : Number(weight) || 400;
  const italic = faces.filter((f) => f.style === "italic");
  const list = style === "italic" && italic.length ? italic : faces.filter((f) => f.style !== "italic").length ? faces.filter((f) => f.style !== "italic") : faces;
  const rank = (f) => {
    const fw = f.weight;
    if (w >= 400 && w <= 500) return fw >= w && fw <= 500 ? fw - w : fw < w ? 1e3 + w - fw : 2e3 + fw - w;
    if (w < 400) return fw <= w ? w - fw : 1e3 + fw - w;
    return fw >= w ? fw - w : 1e3 + w - fw;
  };
  return list.reduce((best, f) => rank(f) < rank(best) ? f : best).key;
}
function embeddedFace(key) {
  if (!isStandard(key)) return key;
  const f = (
    /** @type {Face} */
    FACES.get(key)
  );
  return resolveFontKey(f.family === "Courier" ? "JetBrains Mono" : DEFAULT_FAMILY, f.weight, f.style);
}
var CSS_STACK = {
  Helvetica: 'Helvetica, Arial, "Liberation Sans", sans-serif',
  "Times-Roman": '"Times New Roman", Times, "Liberation Serif", serif',
  Courier: '"Courier New", Courier, "Liberation Mono", monospace',
  Symbol: "Symbol",
  ZapfDingbats: '"Zapf Dingbats", ZapfDingbats'
};
var standardCss = (key) => isStandard(key) ? CSS_STACK[
  /** @type {Face} */
  FACES.get(key).family
] : null;
function officeFamily(key) {
  const fam = fontCss(key).family;
  return { Helvetica: "Arial", "Times-Roman": "Times New Roman", Courier: "Courier New" }[fam] || fam;
}
function fontCss(key) {
  const f = FACES.get(key);
  return f ? { family: f.family, weight: f.weight, style: f.style } : { family: DEFAULT_FAMILY, weight: 400, style: "normal" };
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
var allFontKeys = () => [...FACES.keys()];
function fallbackKeys(key) {
  const c = fontCss(key);
  return [...new Set(FALLBACK.map((f) => String(f[2])))].map((family) => resolveFontKey(family, c.weight, c.style));
}
function unicodeRange(key) {
  const family = FACES.get(key)?.family;
  const r = FALLBACK.filter((f) => f[2] === family).map(([a, b]) => `U+${Number(a).toString(16)}-${Number(b).toString(16)}`);
  return r.length ? [...r, "U+300-36F", "U+2000-206F", "U+25CC", "U+FE00-FE0F"].join(",") : null;
}
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
    let f = this.hb.get(key);
    if (!f) {
      f = this.shaper.font(this.bytes.get(key));
      this.hb.set(key, f);
    }
    return f;
  }
  /** @param {string} key */
  get(key) {
    const f = this.fonts.get(key);
    if (!f) throw new Error(`Font "${key}" is not loaded`);
    return f;
  }
};

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
function dataUriBytesOf(uri) {
  return dataUriHead(uri, Infinity);
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
var isSpace = (c) => c === " " || c === "	" || c === "\n" || c === "\r";
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
    const self = body.endsWith("/");
    if (self) body = body.slice(0, -1);
    let k = 0;
    while (k < body.length && isName(body[k])) k++;
    const name = body.slice(0, k);
    if (!/^[a-zA-Z]/.test(name)) continue;
    yield { close, name, attrs: body.slice(k), self };
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
    while (i < n && isSpace(s[i])) i++;
    if (s[i] !== "=") continue;
    i++;
    while (i < n && isSpace(s[i])) i++;
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
  const memo = c.budget ? (_a = c.budget).memo || (_a.memo = /* @__PURE__ */ new Map()) : null;
  let u = memo?.get(v);
  if (u === void 0) {
    u = toDataUri(v);
    memo?.set(v, u);
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

export {
  fontkit,
  PDFDocument,
  PDFName,
  PDFString,
  PDFHexString,
  PDFRawStream,
  PDFStream,
  PDFArray,
  PDFDict,
  PDFNumber,
  PDFBool,
  rgb,
  pushGraphicsState,
  popGraphicsState,
  concatTransformationMatrix,
  loadFontkit,
  loadPdfLib,
  isStandard,
  OPTIONAL_KEYS,
  FONT_FAMILIES,
  BUNDLED_FAMILIES,
  DEFAULT_FAMILY,
  ALL_FONT_KEYS,
  CORE_FONT_KEY,
  PRELOAD_KEYS,
  SHAPER,
  fontFile,
  setCustomFonts,
  familyOf,
  resolveFontKey,
  embeddedFace,
  standardCss,
  officeFamily,
  fontCss,
  allFontKeys,
  fallbackKeys,
  unicodeRange,
  fallbackKey,
  fontsForDef,
  fontsFor,
  FontStore,
  IMAGE_LIMITS,
  PX,
  dataUriBytes,
  dataUriBytesOf,
  svgLength,
  xmlTags,
  xmlAttrs,
  svgRootAttrs,
  imageInfoOf,
  imageInfo,
  resolveImageSrc
};

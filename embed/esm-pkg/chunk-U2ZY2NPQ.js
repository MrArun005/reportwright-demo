import {
  IMAGE_LIMITS,
  dataUriBytesOf,
  fontCss,
  fontFile,
  imageInfoOf,
  isStandard,
  standardCss,
  unicodeRange
} from "./chunk-MS2LQC2O.js";

// src/exporters/color.js
var NAMED = { black: "#000000", white: "#ffffff", red: "#ff0000", green: "#008000", blue: "#0000ff", gray: "#808080", grey: "#808080", orange: "#ffa500", yellow: "#ffff00" };
function parseColor(c) {
  if (!c || c === "none" || c === "transparent") return null;
  let s = String(c).trim().toLowerCase();
  if (NAMED[s]) s = NAMED[s];
  let m = /^#([0-9a-f]{3,8})$/.exec(s);
  if (m) {
    let h = m[1];
    if (h.length === 3 || h.length === 4) h = [...h].map((x) => x + x).join("");
    const n2 = parseInt(h.slice(0, 6), 16);
    const a = h.length === 8 ? parseInt(h.slice(6, 8), 16) / 255 : 1;
    return { r: (n2 >> 16 & 255) / 255, g: (n2 >> 8 & 255) / 255, b: (n2 & 255) / 255, a };
  }
  m = /^rgba?\(([^)]+)\)$/.exec(s);
  if (m) {
    const [r, g, b, a = 1] = m[1].split(/[\s,/]+/).map(Number);
    return { r: r / 255, g: g / 255, b: b / 255, a };
  }
  return null;
}
function cssColor(c) {
  const p = parseColor(c);
  if (!p) return "none";
  return `rgba(${Math.round(p.r * 255)},${Math.round(p.g * 255)},${Math.round(p.b * 255)},${p.a})`;
}

// src/exporters/svg.js
var fontFamilyCss = (key) => `pw-${key}`;
var esc = (s) => String(s).replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;").replace(/'/g, "&#39;");
var fontAttrs = (key) => {
  const stack = standardCss(key);
  if (!stack) return `font-family="${fontFamilyCss(key)}"`;
  const c = fontCss(key);
  return `font-family="${esc(stack)}"${c.weight !== 400 ? ` font-weight="${c.weight}"` : ""}${c.style === "italic" ? ' font-style="italic"' : ""}`;
};
function imageHref(src, proxyBase = "") {
  const s = String(src ?? "").trim();
  if (/^data:image\/(png|jpe?g|gif|webp|bmp|svg\+xml)[;,]/i.test(s)) return s;
  if (/^https?:\/\//i.test(s)) return `${proxyBase}/api/data/proxy?url=${encodeURIComponent(s)}`;
  if (s && !/^[a-z][a-z0-9+.-]*:/i.test(s) && !s.startsWith("//") && !s.includes("\\")) return s;
  return "";
}
var n = (v) => Math.round(v * 100) / 100;
var ANIM_CSS = "<style>@media (prefers-reduced-motion:no-preference){.pw-a{transform-box:fill-box;animation:pw-fade .55s ease-out both}.pw-a-growY{animation-name:pw-growY}.pw-a-growX{animation-name:pw-growX}.pw-a-scale{animation-name:pw-scale}@keyframes pw-fade{from{opacity:0}}@keyframes pw-growY{from{transform:scaleY(0)}}@keyframes pw-growX{from{transform:scaleX(0)}}@keyframes pw-scale{from{trans\
form:scale(0);opacity:0}}}</style>";
var ANIM_KINDS = /* @__PURE__ */ new Set(["growY", "growX", "scale", "fade"]);
var ANIM_ORIGIN = { bottom: "center bottom", top: "center top", left: "left center", right: "right center" };
function pageToSvg(page, w, h, { background = true, animate = false, box = void 0, outline = null, proxyBase = "" } = {}) {
  const vb = box ? `${n(box.x)} ${n(box.y)} ${n(box.w)} ${n(box.h)}` : `0 0 ${n(w)} ${n(h)}`;
  const out = [`<svg xmlns="http://www.w3.org/2000/svg" viewBox="${vb}" width="${n(w)}" height="${n(h)}" style="font-kerning:none;font-variant-ligatures:none;text-rendering:geometricPrecision">`];
  if (background) out.push(`<rect width="${n(w)}" height="${n(h)}" fill="#ffffff"/>`);
  let animated = false;
  for (const it of page.items.flatMap((i) => i.t === "field" ? i.draw : [i])) {
    const an = animate && it.anim && ANIM_KINDS.has(it.anim.k) ? it.anim : null;
    if (an) {
      if (!animated) {
        out.push(ANIM_CSS);
        animated = true;
      }
      const origin = ANIM_ORIGIN[an.o] || "center";
      out.push(`<g class="pw-a pw-a-${an.k}" style="transform-origin:${origin};animation-delay:${Math.min(40, Math.max(0, Math.round(Number(an.i)) || 0)) * 25}ms">`);
    }
    if (it.rotate) out.push(`<g transform="rotate(${n(it.rotate.a)} ${n(it.rotate.cx)} ${n(it.rotate.cy)})">`);
    switch (it.t) {
      case "rect": {
        const r = it.radius ? ` rx="${n(it.radius)}"` : "";
        const stroke = it.stroke ? ` stroke="${cssColor(it.stroke)}" stroke-width="${n(it.strokeWidth || 1)}"${it.dash ? ` stroke-dasharray="${it.dash.join(" ")}"` : ""}` : "";
        out.push(`<rect x="${n(it.x)}" y="${n(it.y)}" width="${n(it.w)}" height="${n(it.h)}"${r} fill="${cssColor(it.fill)}"${stroke}/>`);
        break;
      }
      case "ellipse": {
        const stroke = it.stroke ? ` stroke="${cssColor(it.stroke)}" stroke-width="${n(it.strokeWidth || 1)}"` : "";
        out.push(`<ellipse cx="${n(it.cx)}" cy="${n(it.cy)}" rx="${n(it.rx)}" ry="${n(it.ry)}" fill="${cssColor(it.fill)}"${stroke}/>`);
        break;
      }
      case "line":
        out.push(`<line x1="${n(it.x1)}" y1="${n(it.y1)}" x2="${n(it.x2)}" y2="${n(it.y2)}" stroke="${cssColor(it.stroke)}" stroke-width="${n(it.strokeWidth)}"${it.dash ? ` stroke-dasharray="${it.dash.join(" ")}"` : ""}/>`);
        break;
      case "text": {
        const d = outline ? textOutline(it, outline) : null;
        if (d) {
          out.push(`<path d="${d}" fill="${cssColor(it.color)}"/>`);
          break;
        }
        const paint = `font-size="${n(it.size)}" fill="${cssColor(it.color)}"`;
        const attrs = `${fontAttrs(it.font)} ${paint}`;
        for (const l of it.lines) {
          if (!l.runs) {
            out.push(`<text x="${n(l.x)}" y="${n(l.y)}" ${attrs} xml:space="preserve">${esc(l.text)}</text>`);
            continue;
          }
          for (const r of l.runs) {
            if (!r.text.trim()) continue;
            const font = `${fontAttrs(r.font)} ${paint}`;
            if (!r.shaped && !r.rtl) {
              out.push(`<text x="${n(l.x + r.x)}" y="${n(l.y)}" ${font}>${esc(r.text)}</text>`);
              continue;
            }
            const style = (r.rtl ? "direction:rtl;unicode-bidi:bidi-override;" : "") + (r.shaped ? "font-kerning:normal;font-variant-ligatures:normal" : "");
            out.push(`<text x="${n(l.x + r.x + r.w / 2)}" y="${n(l.y)}" text-anchor="middle" ${font} style="${style}">${esc(r.text)}</text>`);
          }
        }
        break;
      }
      case "path": {
        const stroke = it.stroke ? ` stroke="${cssColor(it.stroke)}" stroke-width="${n(it.strokeWidth || 1)}" stroke-linecap="${it.lineCap || "round"}" stroke-linejoin="round"${it.dash ? ` stroke-dasharray="${it.dash.join(" ")}"` : ""}` : "";
        out.push(`<path transform="translate(${n(it.x)} ${n(it.y)})" d="${esc(it.d)}" fill="${cssColor(it.fill)}"${stroke}/>`);
        break;
      }
      case "link": {
        const tip = it.tip ?? (it.action ? linkTitle(it.action) : "");
        const title = tip ? `<title>${esc(tip)}</title>` : "";
        const tag = it.d ? "path" : "rect";
        const geo = it.d ? `transform="translate(${n(it.x - (it.x0 ?? it.x))} ${n(it.y - (it.y0 ?? it.y))})" d="${esc(it.d)}"` : `x="${n(it.x)}" y="${n(it.y)}" width="${n(it.w)}" height="${n(it.h)}"`;
        if (!it.action) out.push(`<${tag} class="pw-tip" ${geo} fill="transparent">${title}</${tag}>`);
        else out.push(`<${tag} class="pw-link" ${geo} fill="transparent" data-action="${esc(JSON.stringify(it.action))}" style="cursor:pointer">${title}</${tag}>`);
        break;
      }
      case "image": {
        if (it.fit === "clip") out.push(`<svg x="${n(it.x)}" y="${n(it.y)}" width="${n(it.cw)}" height="${n(it.ch)}" overflow="hidden"><image x="0" y="0" width="${n(it.w)}" height="${n(it.h)}" href="${esc(imageHref(it.src, proxyBase))}" preserveAspectRatio="none"/></svg>`);
        else {
          const par = it.fit === "fill" ? "none" : it.fit === "cover" ? "xMidYMid slice" : "xMidYMid meet";
          out.push(`<image x="${n(it.x)}" y="${n(it.y)}" width="${n(it.w)}" height="${n(it.h)}" href="${esc(imageHref(it.src, proxyBase))}" preserveAspectRatio="${par}"/>`);
        }
        break;
      }
    }
    if (it.rotate) out.push("</g>");
    if (an) out.push("</g>");
  }
  out.push("</svg>");
  return out.join("");
}
function linkTitle(a) {
  if (a.type === "url") return a.href;
  if (a.type === "drill") return `Open ${a.report}`;
  if (a.type === "toggle") return "Show or hide details";
  if (a.type === "sort") return "Sort";
  if (a.type === "bookmark") return `Go to ${a.target}`;
  if (a.type === "params") return "Filter the report";
  return "";
}
function fontFaceCss(keys, base = "/fonts") {
  return keys.filter((k) => !isStandard(k)).map((k) => {
    const file = fontFile(k), range = unicodeRange(k);
    return `@font-face{font-family:"${fontFamilyCss(k)}";src:url("${base}/${file}")${file.endsWith(".ttf") ? ' format("truetype")' : ""};font-display:block${range ? `;unicode-range:${range}` : ""}}`;
  }).join("\n");
}
function fontKeysOf(model) {
  const keys = /* @__PURE__ */ new Set();
  for (const pg of model?.pages || []) for (const it of pg.items.flatMap((i) => i.t === "field" ? [i, ...i.draw] : [i])) {
    if (it.font) keys.add(it.font);
    if (it.t === "text") for (const l of it.lines) for (const r of l.runs || []) keys.add(r.font);
  }
  return [...keys];
}

// src/exporters/figures.js
var FIGURE_KINDS = /* @__PURE__ */ new Set(["image", "chart", "map", "barcode", "shape", "line", "sparkline", "databar", "bullet", "iconset", "rangebar"]);
function figures(items) {
  const shared = items.some((it, i) => i > 0 && it.tag && it.tag === items[i - 1].tag);
  const same = (a, b) => a === b || !!a && !!b && (a.id != null ? a.id === b.id : !shared && a.k === b.k && a.alt === b.alt && a.h === b.h);
  const out = [];
  let cur = null;
  items.forEach((it, i) => {
    const t = it.tag;
    if (!t || !FIGURE_KINDS.has(t.k)) {
      cur = null;
      return;
    }
    if (cur && same(cur.tag, t) && cur.last === i - 1) {
      cur.items.push(it);
      cur.last = i;
      return;
    }
    cur = { tag: t, items: [it], at: i, last: i };
    out.push(cur);
  });
  for (const f of out) f.box = boxOf(f.items);
  return out.filter((f) => f.box && f.box.w > 0.5 && f.box.h > 0.5);
}
function boxOf(items) {
  let x0 = Infinity, y0 = Infinity, x1 = -Infinity, y1 = -Infinity;
  const add = (x, y, rot) => {
    if (rot) {
      const a = rot.a * Math.PI / 180, dx = x - rot.cx, dy = y - rot.cy;
      x = rot.cx + dx * Math.cos(a) - dy * Math.sin(a);
      y = rot.cy + dx * Math.sin(a) + dy * Math.cos(a);
    }
    if (!Number.isFinite(x) || !Number.isFinite(y)) return;
    if (x < x0) x0 = x;
    if (x > x1) x1 = x;
    if (y < y0) y0 = y;
    if (y > y1) y1 = y;
  };
  const rect = (x, y, w, h, r) => {
    add(x, y, r);
    add(x + w, y, r);
    add(x, y + h, r);
    add(x + w, y + h, r);
  };
  for (const it of items) {
    const r = it.rotate;
    const sw = (it.stroke ? Number(it.strokeWidth) || 1 : 0) / 2;
    switch (it.t) {
      case "rect":
      case "image":
        rect(it.x - sw, it.y - sw, (it.cw ?? it.w) + 2 * sw, (it.ch ?? it.h) + 2 * sw, r);
        break;
      case "ellipse":
        rect(it.cx - it.rx - sw, it.cy - it.ry - sw, 2 * (it.rx + sw), 2 * (it.ry + sw), r);
        break;
      case "line":
        rect(Math.min(it.x1, it.x2) - sw, Math.min(it.y1, it.y2) - sw, Math.abs(it.x2 - it.x1) + 2 * sw, Math.abs(it.y2 - it.y1) + 2 * sw, r);
        break;
      case "text":
        for (const l of it.lines) rect(l.x, l.y - it.size, l.w ?? l.text.length * it.size * 0.6, it.size * 1.3, r);
        break;
      case "path": {
        const b = pathBox(it.d);
        if (b) rect(it.x + b.x0 - sw, it.y + b.y0 - sw, b.x1 - b.x0 + 2 * sw, b.y1 - b.y0 + 2 * sw, r);
        break;
      }
    }
  }
  return x0 === Infinity ? null : { x: x0, y: y0, w: x1 - x0, h: y1 - y0 };
}
function pathBox(d) {
  const toks = String(d).match(/[a-zA-Z]|-?(?:\d+\.?\d*|\.\d+)(?:e[-+]?\d+)?/g) || [];
  let x0 = Infinity, y0 = Infinity, x1 = -Infinity, y1 = -Infinity;
  const add = (x, y) => {
    if (x < x0) x0 = x;
    if (x > x1) x1 = x;
    if (y < y0) y0 = y;
    if (y > y1) y1 = y;
  };
  let cx = 0, cy = 0, sx = 0, sy = 0, cmd = "M", i = 0;
  const num = () => Number(toks[i++]);
  const ARGS = { M: 2, L: 2, H: 1, V: 1, C: 6, S: 4, Q: 4, T: 2, A: 7, Z: 0 };
  let guard = 0;
  while (i < toks.length && guard++ < 1e6) {
    if (/[a-zA-Z]/.test(toks[i])) cmd = toks[i++];
    const C = cmd.toUpperCase(), rel = cmd !== C, n2 = ARGS[C];
    if (n2 === void 0) break;
    if (C === "Z") {
      cx = sx;
      cy = sy;
      continue;
    }
    if (i + n2 > toks.length) break;
    const a = Array.from({ length: n2 }, num);
    if (a.some((v) => !Number.isFinite(v))) break;
    const ox = rel ? cx : 0, oy = rel ? cy : 0;
    if (C === "H") {
      cx = a[0] + ox;
      add(cx, cy);
    } else if (C === "V") {
      cy = a[0] + oy;
      add(cx, cy);
    } else if (C === "A") {
      const ex = a[5] + ox, ey = a[6] + oy;
      add(cx, cy);
      add(ex, ey);
      for (const [px, py] of arcExtremes(cx, cy, a[0], a[1], a[2], a[3], a[4], ex, ey)) add(px, py);
      cx = ex;
      cy = ey;
    } else {
      for (let k = 0; k < n2; k += 2) add(a[k] + ox, a[k + 1] + oy);
      cx = a[n2 - 2] + ox;
      cy = a[n2 - 1] + oy;
      if (C === "M") {
        sx = cx;
        sy = cy;
        cmd = rel ? "l" : "L";
      }
    }
  }
  return x0 === Infinity ? null : { x0, y0, x1, y1 };
}
function arcExtremes(x1, y1, rx, ry, phi, large, sweep, x2, y2) {
  rx = Math.abs(rx);
  ry = Math.abs(ry);
  if (!rx || !ry || x1 === x2 && y1 === y2) return [];
  const f = phi % 360 * Math.PI / 180, cf = Math.cos(f), sf = Math.sin(f);
  const dx = (x1 - x2) / 2, dy = (y1 - y2) / 2;
  const x1p = cf * dx + sf * dy, y1p = -sf * dx + cf * dy;
  const lam = x1p * x1p / (rx * rx) + y1p * y1p / (ry * ry);
  if (lam > 1) {
    rx *= Math.sqrt(lam);
    ry *= Math.sqrt(lam);
  }
  const num = rx * rx * ry * ry - rx * rx * y1p * y1p - ry * ry * x1p * x1p;
  const k = (large !== sweep ? 1 : -1) * Math.sqrt(Math.max(0, num / (rx * rx * y1p * y1p + ry * ry * x1p * x1p)));
  const cxp = k * rx * y1p / ry, cyp = -k * ry * x1p / rx;
  const cx = cf * cxp - sf * cyp + (x1 + x2) / 2, cy = sf * cxp + cf * cyp + (y1 + y2) / 2;
  if (Math.abs(sf) > 1e-9) {
    const R = Math.max(rx, ry);
    return [[cx - R, cy - R], [cx + R, cy + R]];
  }
  const ang = (ux, uy) => Math.atan2(uy, ux);
  const t1 = ang((x1p - cxp) / rx, (y1p - cyp) / ry);
  let dt = ang((-x1p - cxp) / rx, (-y1p - cyp) / ry) - t1;
  if (sweep && dt < 0) dt += 2 * Math.PI;
  else if (!sweep && dt > 0) dt -= 2 * Math.PI;
  const out = [];
  for (let q = -4; q <= 4; q++) {
    const t = q * Math.PI / 2, rel = dt >= 0 ? t - t1 : t1 - t;
    const nrm = (rel % (2 * Math.PI) + 2 * Math.PI) % (2 * Math.PI);
    if (nrm <= Math.abs(dt) + 1e-9) out.push([cx + rx * Math.cos(t) * cf, cy + ry * Math.sin(t)]);
  }
  return out;
}
function textOutline(it, fontOf) {
  let d = "";
  const glyph = (f, g, x, y, size) => {
    const s = size / f.unitsPerEm;
    const p = g.path;
    for (const c of p.commands) {
      const a = [];
      for (let k = 0; k < c.args.length; k += 2) a.push(r2(x + c.args[k] * s), r2(y - c.args[k + 1] * s));
      d += { moveTo: "M", lineTo: "L", quadraticCurveTo: "Q", bezierCurveTo: "C", closePath: "Z" }[c.command] + a.join(" ");
    }
  };
  for (const l of it.lines) {
    if (!l.runs) {
      const f = fontOf(it.font);
      if (!f || f.standard) return null;
      let x = l.x;
      for (const ch of l.text.replace(/\t/g, "    ")) {
        const g = f.glyphForCodePoint(
          /** @type {number} */
          ch.codePointAt(0)
        );
        glyph(f, g, x, l.y, it.size);
        x += g.advanceWidth * it.size / f.unitsPerEm;
      }
      continue;
    }
    for (const r of l.runs) {
      const f = fontOf(r.font);
      if (!f || f.standard) return null;
      const gs = r.glyphs || [];
      for (let k = 0; k < gs.length; k += 4) glyph(f, f.getGlyph(gs[k]), l.x + r.x + gs[k + 1], l.y - gs[k + 2], it.size);
    }
  }
  return d;
}
var r2 = (v) => Math.round(v * 100) / 100;
function figureSvg(fig, fontStore) {
  const fontOf = (k) => {
    try {
      return fontStore?.get(k) || null;
    } catch {
      return null;
    }
  };
  return pageToSvg({ items: fig.items.filter((i) => i.t !== "link" && i.t !== "bookmark") }, fig.box.w, fig.box.h, { background: false, box: fig.box, outline: fontStore ? fontOf : null });
}
async function rasterize(svg, w, h, opt = {}) {
  const scale = opt.scale || 2;
  const W = Math.max(1, Math.min(8e3, Math.round(w * scale))), H = Math.max(1, Math.min(8e3, Math.round(h * scale)));
  try {
    if (opt.rasterize) return await opt.rasterize(svg, w, h, scale);
    if (typeof document !== "undefined" && typeof Image !== "undefined") {
      const url = URL.createObjectURL(new Blob([svg], { type: "image/svg+xml" }));
      try {
        const img = new Image();
        img.src = url;
        await img.decode();
        const c = document.createElement("canvas");
        c.width = W;
        c.height = H;
        c.getContext("2d")?.drawImage(img, 0, 0, W, H);
        const blob = await new Promise((res) => c.toBlob(res, "image/png"));
        return blob ? new Uint8Array(await /** @type {Blob} */
        blob.arrayBuffer()) : null;
      } finally {
        URL.revokeObjectURL(url);
      }
    }
    if (
      /** @type {any} */
      globalThis.process?.versions?.node
    ) {
      const name = "sharp";
      const sharp = (await import(
        /* @vite-ignore */
        /* webpackIgnore: true */
        /* turbopackIgnore: true */
        name
      )).default;
      return new Uint8Array(await sharp(Buffer.from(svg), { density: 72 * scale }).resize(W, H, { fit: "fill" }).png().toBuffer());
    }
  } catch {
  }
  return null;
}
async function figurePicture(fig, opt = {}) {
  const bytesOf = async (src) => {
    try {
      const b = /^data:/i.test(src) ? dataUriBytesOf(src) : opt.fetchImage ? await opt.fetchImage(src) : null;
      const info = b && b.length <= IMAGE_LIMITS.bytes ? imageInfoOf(b) : null;
      return info && ["png", "jpeg", "svg"].includes(info.type) ? { b, info } : null;
    } catch {
      return null;
    }
  };
  const items = [];
  for (const it of fig.items) {
    if (it.t !== "image") {
      items.push(it);
      continue;
    }
    const got = await bytesOf(it.src);
    if (!got) continue;
    const alone = fig.items.every((i) => i === it || i.t === "link" || i.t === "bookmark");
    if (alone && (got.info.type === "png" || got.info.type === "jpeg") && (it.fit === "fill" || (it.fit || "contain") === "contain" && got.info.w > 0)) {
      if (it.fit === "fill") return { [got.info.type]: got.b, w: it.w, h: it.h, x: it.x, y: it.y };
      const s = Math.min(it.w / got.info.w, it.h / got.info.h);
      const w = got.info.w * s, h = got.info.h * s;
      return { [got.info.type]: got.b, w, h, x: it.x + (it.w - w) / 2, y: it.y + (it.h - h) / 2 };
    }
    items.push({ ...it, src: `data:image/${got.info.type === "svg" ? "svg+xml" : got.info.type};base64,${b64(got.b)}` });
  }
  const svg = figureSvg({ items, box: fig.box }, opt.fontStore);
  const png = await rasterize(svg, fig.box.w, fig.box.h, opt);
  return { svg, png, w: fig.box.w, h: fig.box.h, x: fig.box.x, y: fig.box.y };
}
function b64(u8) {
  if (typeof Buffer !== "undefined") return Buffer.from(u8).toString("base64");
  let s = "";
  for (let i = 0; i < u8.length; i += 32768) s += String.fromCharCode.apply(
    null,
    /** @type {any} */
    u8.subarray(i, i + 32768)
  );
  return btoa(s);
}
var hexOrNull = (c) => {
  const s = String(c || "").trim();
  const m = /^#?([0-9a-f]{6})([0-9a-f]{2})?$/i.exec(s) || /^#?([0-9a-f]{3})$/i.exec(s);
  if (!m || m[2] === "00") return null;
  return (m[1].length === 3 ? [...m[1]].map((x) => x + x).join("") : m[1]).toUpperCase();
};
var altOf = (tag) => tag?.alt || { chart: "Chart", image: "Picture", map: "Map", barcode: "Barcode", shape: "Shape", line: "Line", sparkline: "Sparkline", databar: "Data bar", bullet: "Bullet chart", iconset: "Status icon", rangebar: "Range bar" }[tag?.k] || "Graphic";
function boxDecor(items, i) {
  const it = items[i], c = it.clip;
  if (!c) return null;
  const near = (a, b) => Math.abs(a - b) < 0.05;
  const isBox = (r) => r && r.t === "rect" && !r.tag && near(r.x, c.x) && near(r.y, c.y) && near(r.w, c.w) && near(r.h, c.h);
  let fill = null, radius = 0;
  for (let k = i - 1; k >= Math.max(0, i - 2); k--) if (isBox(items[k]) && items[k].fill) {
    fill = hexOrNull(items[k].fill);
    radius = items[k].radius || 0;
    break;
  }
  const sides = {};
  for (let k = i + 1; k < items.length && k <= i + 6 + 2 * it.lines.length; k++) {
    const o = items[k];
    if (o.tag || o.art !== it.art) break;
    if (o.t === "rect" && isBox(o) && o.stroke) {
      for (const s of ["top", "right", "bottom", "left"]) sides[s] = o;
      radius = o.radius || radius;
      break;
    }
    if (o.t !== "line") break;
    if (near(o.y1, o.y2) && near(o.y1, c.y) && near(Math.min(o.x1, o.x2), c.x)) sides.top = o;
    else if (near(o.y1, o.y2) && near(o.y1, c.y + c.h) && near(Math.min(o.x1, o.x2), c.x)) sides.bottom = o;
    else if (near(o.x1, o.x2) && near(o.x1, c.x) && near(Math.min(o.y1, o.y2), c.y)) sides.left = o;
    else if (near(o.x1, o.x2) && near(o.x1, c.x + c.w) && near(Math.min(o.y1, o.y2), c.y)) sides.right = o;
  }
  return fill || Object.keys(sides).length ? { fill, radius, sides } : null;
}
function cellVisuals(items, used, tables) {
  const out = /* @__PURE__ */ new Map();
  if (!tables.size) return out;
  const geo = [...tables.entries()].map(([key, b]) => {
    const rows = /* @__PURE__ */ new Map();
    let left = Infinity;
    for (const it of b.cells) {
      const c = it.clip;
      if (!c) continue;
      if (!rows.has(it.cell.row)) rows.set(it.cell.row, { y: c.y, h: c.h });
      left = Math.min(left, c.x - it.cell.cols.slice(0, it.cell.col).reduce((s, w) => s + w, 0));
    }
    const cols = b.cells[0].cell.cols;
    const edges = [left];
    for (const w of cols) edges.push(edges[edges.length - 1] + w);
    return { key, rows: [...rows.entries()], left, cols, edges, right: edges[edges.length - 1] };
  });
  const near = (a, b) => Math.abs(a - b) < 0.05;
  items.forEach((it, i) => {
    if (used.has(i) || it.tag || it.art || !["path", "ellipse", "rect"].includes(it.t)) return;
    const bx = boxOf([it]);
    if (!bx) return;
    const cx = bx.x + bx.w / 2, cy = bx.y + bx.h / 2;
    for (const g of geo) {
      if (cx < g.left || cx > g.right) continue;
      const row = g.rows.find(([, r3]) => cy >= r3.y && cy <= r3.y + r3.h);
      if (!row) continue;
      const [rid, r] = row;
      if (it.t === "rect" && g.edges.some((e) => near(e, it.x)) && g.edges.some((e) => near(e, it.x + it.w))) return;
      let col = 0, x = g.left;
      while (col < g.cols.length - 1 && cx > x + g.cols[col]) x += g.cols[col++];
      const m = out.get(g.key) || out.set(g.key, /* @__PURE__ */ new Map()).get(g.key);
      const k = `${rid}|${col}`;
      const v = m.get(k) || m.set(k, { items: [], box: null }).get(k);
      v.items.push(it);
      used.add(i);
      return;
    }
  });
  for (const m of out.values()) for (const v of m.values()) v.box = boxOf(v.items);
  return out;
}

export {
  parseColor,
  figures,
  boxOf,
  figureSvg,
  rasterize,
  figurePicture,
  hexOrNull,
  altOf,
  boxDecor,
  cellVisuals,
  fontFamilyCss,
  pageToSvg,
  linkTitle,
  fontFaceCss,
  fontKeysOf
};

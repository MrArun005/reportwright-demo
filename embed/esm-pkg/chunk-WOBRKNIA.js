import {
  withDeadline
} from "./chunk-D2NTLAKL.js";
import {
  mergedRegions,
  needsTableData
} from "./chunk-F6RMRXIN.js";
import {
  fontFamilyCss,
  pageToSvg
} from "./chunk-U2ZY2NPQ.js";
import {
  drillUrl,
  safeUrl
} from "./chunk-72S6DETS.js";
import "./chunk-MS2LQC2O.js";
import {
  formatValue,
  isoDate,
  toWall
} from "./chunk-GJS242RR.js";
import "./chunk-OLLMACWA.js";

// src/exporters/htmldata.js
var dateKey = (d, tz) => tz ? toWall(d, tz) : Date.UTC(d.getFullYear(), d.getMonth(), d.getDate(), d.getHours(), d.getMinutes(), d.getSeconds(), d.getMilliseconds());
var MAX_DATA_ROWS = 2e4;
var DATA_STRINGS = { pages: "Pages", tables: "Tables", all: "All", filter: "Filter", toggle: "Show or hide the rows of this group", sortAsc: "Sort ascending", sortDesc: "Sort descending" };
function tablesData(model, o = {}) {
  const regions = mergedRegions(model);
  if (!regions.length || regions.reduce((n, r) => n + r.rows.length, 0) > MAX_DATA_ROWS) return null;
  const sortable = /* @__PURE__ */ new Map();
  for (const pg of model.pages) {
    const heads = pg.items.filter((i) => i.t === "text" && i.cell?.kind === "header" && i.clip);
    for (const l of pg.items) {
      if (l.t !== "link" || l.action?.type !== "sort") continue;
      const h = heads.find((t) => t.cell.table === l.action.table && Math.abs(t.clip.x - l.x) < 1);
      if (h) (sortable.get(h.cell.table) || sortable.set(h.cell.table, /* @__PURE__ */ new Set()).get(h.cell.table)).add(h.cell.col);
    }
  }
  const show = (c) => c.value instanceof Date ? isoDate(c.value, model.timeZone || void 0) : typeof c.value === "boolean" ? String(c.value) : formatValue(c.value, c.format, { locale: o.locale, currency: o.currency });
  return regions.map((r) => ({
    name: String(r.name || "Table"),
    cols: r.columns.length,
    sort: [...sortable.get(r.name) || []],
    rows: r.rows.map((row) => ({
      k: row.kind,
      l: row.level || 0,
      c: row.cells.filter((c) => c.colIndex >= 0).map((c) => [c.colIndex, String(show(c) ?? ""), c.value instanceof Date ? dateKey(c.value, model.timeZone || void 0) : typeof c.value === "number" ? c.value : String(c.value ?? "").toLowerCase(), c.span || 1])
    }))
  }));
}
var DATA_SCRIPT = `(() => {
const d = JSON.parse(document.getElementById('pw-data').textContent), S = d.strings;
const bar = document.getElementById('pw-bar'), box = document.getElementById('pw-tables');
const el = (tag, cls, text) => { const e = document.createElement(tag); if (cls) e.className = cls; if (text != null) e.textContent = text; return e; };
bar.hidden = false;
bar.addEventListener('click', (e) => {
  const b = e.target.closest('button[data-view]');
  if (!b) return;
  const tables = b.dataset.view === 'tables';
  document.body.classList.toggle('pw-show-tables', tables);
  box.hidden = !tables;
  for (const x of bar.querySelectorAll('button')) x.setAttribute('aria-pressed', String(x === b));
  if (tables && !box.firstChild) for (const t of d.tables) box.appendChild(view(t));
});
function view(t) {
  const sec = el('section', 'pw-t');
  sec.appendChild(el('h2', null, t.name));
  const heads = t.rows.filter(r => r.k === 'header');
  const body = t.rows.filter(r => r.k !== 'header');
  const label = (c) => { for (const h of heads) for (const x of h.c) if (x[0] === c) return x[1]; return String(c + 1); };
  // filters: text columns of detail rows with a few distinct values
  const active = new Map();
  const bar2 = el('div', 'pw-f');
  for (let c = 0; c < t.cols; c++) {
    const vals = new Set(); let text = true;
    for (const r of body) if (r.k === 'detail') for (const x of r.c) if (x[0] === c && x[1] !== '') { vals.add(x[1]); if (typeof x[2] === 'number') text = false; }
    if (!text || vals.size < 2 || vals.size > 30) continue;
    const lab = el('label', null, label(c) + ' ');
    const s = el('select');
    s.appendChild(new Option(S.all, ''));
    for (const v of [...vals].sort()) s.appendChild(new Option(v, v));
    s.addEventListener('change', () => { if (s.value) active.set(c, s.value); else active.delete(c); draw(); });
    lab.appendChild(s);
    bar2.appendChild(lab);
  }
  if (bar2.firstChild) { bar2.prepend(el('span', 'pw-fl', S.filter)); sec.appendChild(bar2); }
  const table = el('table'), thead = el('thead'), tbody = el('tbody');
  let order = null; // { c, dir }
  const closed = new Set();
  for (const h of heads) {
    const tr = el('tr');
    for (const x of h.c) {
      const th = el('th');
      th.scope = 'col';
      if (x[3] > 1) th.colSpan = x[3];
      if (t.sort.includes(x[0])) {
        const b = el('button', 'pw-s', x[1]);
        b.type = 'button';
        b.title = S.sortAsc;
        b.addEventListener('click', () => {
          order = order && order.c === x[0] && order.dir === 1 ? { c: x[0], dir: -1 } : { c: x[0], dir: 1 };
          for (const o of thead.querySelectorAll('th')) o.removeAttribute('aria-sort');
          th.setAttribute('aria-sort', order.dir === 1 ? 'ascending' : 'descending');
          b.title = order.dir === 1 ? S.sortDesc : S.sortAsc;
          draw();
        });
        th.appendChild(b);
      } else th.textContent = x[1];
      tr.appendChild(th);
    }
    thead.appendChild(tr);
  }
  table.append(thead, tbody);
  sec.appendChild(table);
  const key = (r) => { const x = r.c.find(y => y[0] === order.c); return x ? x[2] : ''; };
  const cmp = (a, b) => { const p = key(a), q = key(b); return (typeof p === typeof q ? (p < q ? -1 : p > q ? 1 : 0) : typeof p === 'number' ? -1 : 1) * order.dir; };
  function draw() {
    // detail rows sorted within each run between group rows; groups keep their place
    let rows = body;
    if (order) {
      rows = [];
      for (let i = 0; i < body.length;) {
        if (body[i].k !== 'detail') { rows.push(body[i++]); continue; }
        const run = [];
        while (i < body.length && body[i].k === 'detail') run.push(body[i++]);
        for (const x of run.sort(cmp)) rows.push(x);
      }
    }
    const keep = (r) => { for (const [c, v] of active) { const x = r.c.find(y => y[0] === c); if (!x || x[1] !== v) return false; } return true; };
    tbody.textContent = '';
    let hideFrom = -1; // the level of a closed group whose rows are hidden
    rows.forEach((r) => {
      if (hideFrom >= 0 && (r.k === 'header' || r.k === 'footer' || (r.k === 'groupHeader' && r.l <= hideFrom) || (r.k === 'groupFooter' && r.l <= hideFrom))) hideFrom = -1;
      if (hideFrom >= 0) return;
      if (r.k === 'detail' && !keep(r)) return;
      const tr = el('tr', 'pw-' + r.k);
      let c0 = true;
      for (const x of r.c) {
        const td = el('td', typeof x[2] === 'number' ? 'pw-n' : null);
        if (x[3] > 1) td.colSpan = x[3];
        if (c0 && r.k === 'groupHeader') {
          const b = el('button', 'pw-g', closed.has(r) ? '▶' : '▼');
          b.type = 'button';
          b.title = S.toggle;
          b.setAttribute('aria-expanded', String(!closed.has(r)));
          b.addEventListener('click', () => { if (closed.has(r)) closed.delete(r); else closed.add(r); draw(); });
          td.append(b, ' ');
        }
        td.append(x[1]);
        tr.appendChild(td);
        c0 = false;
      }
      tbody.appendChild(tr);
      if (r.k === 'groupHeader' && closed.has(r)) hideFrom = r.l;
    });
  }
  draw();
  return sec;
}
})();`;
var DATA_CSS = `.pw-bar{position:sticky;top:0;z-index:2;display:flex;gap:4px;padding:4px;background:#fff;border-radius:8px;box-shadow:0 1px 3px rgba(0,0,0,.15)}
.pw-bar button{font:inherit;border:1px solid #c9d1d9;background:#fff;border-radius:6px;padding:4px 12px;cursor:pointer}.pw-bar button[aria-pressed=true]{background:#1f2937;color:#fff;border-color:#1f2937}
body.pw-show-tables .page{display:none}#pw-tables{width:100%;max-width:none;display:flex;flex-direction:column;gap:24px}
.pw-t{background:#fff;padding:16px;border-radius:8px;overflow-x:auto}.pw-t h2{font-size:16px;margin:0 0 8px}
.pw-t table{border-collapse:collapse;width:100%;font-size:13px}.pw-t th,.pw-t td{border-bottom:1px solid #e5e7eb;padding:4px 8px;text-align:left}.pw-t td.pw-n{text-align:right;font-variant-numeric:tabular-nums}
.pw-t th{background:#f1f5f9}.pw-t .pw-groupHeader td,.pw-t .pw-groupFooter td,.pw-t .pw-footer td{font-weight:600}
.pw-s,.pw-g{font:inherit;border:0;background:none;padding:0;cursor:pointer;color:inherit}.pw-s:after{content:" ⇅";opacity:.5}
.pw-f{display:flex;flex-wrap:wrap;gap:12px;align-items:center;margin-bottom:8px;font-size:13px}.pw-fl{font-weight:600}
@media print{.pw-bar,#pw-tables{display:none}}`;
async function cspHash(text) {
  const d = await crypto.subtle.digest("SHA-256", new TextEncoder().encode(text));
  const u8 = new Uint8Array(d);
  let s = "";
  for (const b of u8) s += String.fromCharCode(b);
  return btoa(s);
}

// src/exporters/html.js
function exportHtml(model, options, legacyOpt) {
  const isStore = (x) => !!x && typeof x.load === "function" && typeof x.get === "function" && x.bytes instanceof Map;
  let fontStore, opt;
  if (isStore(options)) {
    if (!warnedLegacy) {
      warnedLegacy = true;
      console.warn("[reportwright] DEPRECATED: exportHtml(model, fontStore, options) is replaced by exportHtml(model, { fonts: fontStore, ...options }); the old form will be removed in 1.0");
    }
    fontStore = options;
    opt = legacyOpt || {};
  } else {
    opt = /** @type {any} */
    options || {};
    fontStore = opt.fonts || opt.fontStore;
    if (!isStore(fontStore)) throw new TypeError("exportHtml(model, { fonts }): fonts must be a FontStore (defaultFontStore() or new FontStore(loader)), got " + (fontStore === void 0 ? "nothing" : typeof fontStore));
  }
  return withDeadline(
    htmlOf(model, fontStore, opt),
    /** @type {any} */
    opt.timeoutMs
  );
}
var warnedLegacy = false;
async function htmlOf(model, fontStore, opt) {
  const used = /* @__PURE__ */ new Map();
  const layout = /* @__PURE__ */ new Set();
  const add = (key, text) => {
    let s = used.get(key);
    if (!s) {
      s = /* @__PURE__ */ new Set([32]);
      used.set(key, s);
    }
    for (const ch of text) s.add(
      /** @type {number} */
      ch.codePointAt(0)
    );
  };
  for (const pg of model.pages) for (const it of pg.items.flatMap((i) => i.t === "field" ? i.draw : [i])) if (it.t === "text") {
    for (const l of it.lines) {
      if (!l.runs) {
        add(it.font, l.text);
        continue;
      }
      for (const r of l.runs) {
        add(r.font, r.text);
        if (r.shaped || r.rtl) layout.add(r.font);
      }
    }
  }
  const faces = [];
  for (const [key, cps] of used) {
    let bytes = fontStore.bytes.get(key);
    if (!bytes) continue;
    if (opt.subset) {
      try {
        bytes = await opt.subset(bytes, cps, layout.has(key) ? { layout: true } : void 0);
      } catch {
      }
    }
    faces.push(`@font-face{font-family:"${fontFamilyCss(key)}";src:url(data:font/ttf;base64,${b64(bytes)}) format("truetype")}`);
  }
  const esc = (s) => String(s).replace(/&/g, "&amp;").replace(/</g, "&lt;");
  const anchors = /* @__PURE__ */ new Map();
  const jumpTo = (a) => {
    const to = a.page ? a : model.bookmarks?.find((b) => b.label === a.target) || model.headings?.find((b) => b.label === a.target);
    if (!to?.page) return null;
    const y = Math.max(0, Math.round(to.y || 0));
    const key = `${to.page}:${y}`;
    if (!anchors.has(key)) anchors.set(key, { id: `at-${to.page}-${y}`, page: to.page, y });
    return `#${anchors.get(key).id}`;
  };
  const drillHref = (a) => drillUrl(opt.drillBase, a);
  const target = (a) => {
    if (a?.type === "url") {
      const h = safeUrl(a.href);
      return h ? { href: h, external: true } : null;
    }
    if (a?.type === "bookmark") {
      const h = jumpTo(a);
      return h ? { href: h } : null;
    }
    if (a?.type === "drill") {
      const h = drillHref(a);
      return h ? { href: h, external: true } : { off: `Opens the report "${a.report}" in the ReportWright viewer` };
    }
    return null;
  };
  const svgs = model.pages.map((p) => pageToSvg({ items: p.items.filter((it) => it.t !== "link" || target(it.action)) }, p.width ?? model.width, p.height ?? model.height, { proxyBase: opt.drillBase || "" }).replace(/<rect class="pw-link"([^>]*?)data-action="([^"]*)"[^>]*>(<title>[^<]*<\/title>)?<\/rect>/g, (m, a, act, ttl = "") => {
    let t = null;
    try {
      t = target(JSON.parse(act.replace(/&quot;/g, '"').replace(/&lt;/g, "<").replace(/&gt;/g, ">").replace(/&#39;/g, "'").replace(/&amp;/g, "&")));
    } catch {
    }
    if (t && "href" in t) return `<a href="${attr(t.href)}"${t.external ? ' target="_blank" rel="noopener"' : ""}><rect${a}/>${ttl}</a>`;
    if (t && "off" in t) return `<g class="pw-off"><rect${a}/><title>${esc(t.off)}</title></g>`;
    return `<rect${a}/>`;
  }));
  const pages = model.pages.map((p, i) => {
    const H = p.height ?? model.height;
    const marks = [...anchors.values()].filter((x) => x.page === i + 1).map((x) => `<a class="pw-at" id="${x.id}" style="top:${(Math.min(x.y, H) / H * 100).toFixed(3)}%"></a>`).join("");
    return `<section class="page${p.width ? " wide" : ""}" id="page-${i + 1}"${p.width ? ` style="width:min(100%,${Math.round(p.width * 96 / 72)}px)"` : ""}>${marks}${svgs[i]}</section>`;
  }).join("\n");
  if (!opt.static) needsTableData(model, "Interactive HTML (or pass static: true)");
  const data = opt.static ? null : tablesData(model, { locale: opt.locale, currency: opt.currency });
  const S = { ...DATA_STRINGS, ...opt.strings || {} };
  const csp = data ? `<meta http-equiv="Content-Security-Policy" content="default-src 'none'; script-src 'sha256-${await cspHash(DATA_SCRIPT)}'; style-src 'unsafe-inline'; font-src data:; img-src data: https: http:; base-uri 'none'; form-action 'none'">
` : "";
  const lang = opt.lang && /^[A-Za-z]{2,3}(-[A-Za-z0-9]{2,8})*$/.test(opt.lang) ? opt.lang : "en";
  return `<!doctype html>
<html lang="${data ? lang : "en"}"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1">
${csp}<title>${esc(opt.title || model.name || "Report")}</title>
<style>
${faces.join("\n")}
html{background:#e6eaee}body{margin:0;padding:24px 12px;display:flex;flex-direction:column;align-items:center;gap:18px;font-family:system-ui,sans-serif}
.page{position:relative;width:min(100%,${Math.round(model.width * 96 / 72)}px);background:#fff;box-shadow:0 1px 2px rgba(0,0,0,.08),0 6px 20px rgba(0,0,0,.08)}
.pw-at{position:absolute;left:0;width:1px;height:1px;scroll-margin-top:12px}.pw-off{cursor:not-allowed}
.page svg{display:block;width:100%;height:auto}
@media print{html{background:#fff}body{padding:0;gap:0}.page{box-shadow:none;width:100%;break-after:page}@page{size:${model.width}pt ${model.height}pt;margin:0}}
${data ? DATA_CSS + "\n" : ""}</style></head><body>
${data ? `<nav class="pw-bar" id="pw-bar" hidden><button type="button" data-view="pages" aria-pressed="true">${esc(S.pages)}</button><button type="button" data-view="tables" aria-pressed="false">${esc(S.tables)}</button></nav>
` : ""}${pages}
${data ? `<div id="pw-tables" hidden></div>
<script type="application/json" id="pw-data">${JSON.stringify({ tables: data, strings: S }).replace(/</g, "\\u003c")}<\/script>
<script>${DATA_SCRIPT}<\/script>
` : ""}</body></html>`;
}
var attr = (s) => String(s).replace(/&/g, "&amp;").replace(/"/g, "&quot;").replace(/</g, "&lt;").replace(/'/g, "&#39;");
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
export {
  exportHtml
};

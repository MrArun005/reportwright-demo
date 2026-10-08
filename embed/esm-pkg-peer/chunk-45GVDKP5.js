"use client";
import {
  customFonts,
  fetchReport,
  origin,
  pruneSnapshot,
  reportFetch
} from "./chunk-MKY3SDXU.js";
import {
  drillRefs,
  loadSources,
  resolveParameters,
  reuseRefs
} from "./chunk-EK5CJY22.js";
import "./chunk-BR5K6SBL.js";
import "./chunk-72S6DETS.js";
import "./chunk-GJS242RR.js";
import {
  fontKeysOf
} from "./chunk-UJL7C2AS.js";
import {
  ALL_FONT_KEYS,
  SHAPER,
  fontFile,
  isStandard
} from "./chunk-QFLVVM3H.js";

// src/viewer/interactiveHtml.js
var toB64 = (buf) => {
  const u8 = new Uint8Array(buf);
  let s = "";
  for (let i = 0; i < u8.length; i += 32768) s += String.fromCharCode.apply(null, u8.subarray(i, i + 32768));
  return btoa(s);
};
var getBuf = async (url) => {
  const r = await fetch(url);
  if (!r.ok) throw new Error(`HTTP ${r.status} for ${url}`);
  return r.arrayBuffer();
};
function reachableReportIds(def) {
  const out = reuseRefs(def);
  for (const r of drillRefs(def)) out.add(r.report);
  return out;
}
async function collectReports(def, rootId) {
  const reports = {};
  if (rootId) reports[rootId] = def;
  const queue = [...reachableReportIds(def)];
  const missing = [];
  while (queue.length) {
    const id = queue.shift();
    if (reports[id] || missing.includes(id)) continue;
    try {
      const d = await fetchReport(id);
      reports[id] = d;
      queue.push(...reachableReportIds(d));
    } catch {
      missing.push(id);
    }
  }
  return { reports, missing };
}
var MAX_DRILL_SNAPSHOTS = 250;
async function snapshotData(def, params, model, reports) {
  const snapshot = {};
  const base = origin();
  const recording = async (url, init) => {
    if (url in snapshot) return new Response(JSON.stringify(snapshot[url]), { status: 200, headers: { "content-type": "application/json" } });
    const res = await reportFetch(base)(url, init);
    if (res.ok) {
      try {
        snapshot[url] = await res.clone().json();
      } catch {
      }
    }
    return res;
  };
  const load = async (d, p) => {
    try {
      await loadSources(d, { params: resolveParameters(d, p, { lenient: true }), fetch: recording, baseUrl: base });
    } catch {
    }
  };
  await load(def, params);
  const seen = /* @__PURE__ */ new Set(), jobs = [];
  for (const pg of model?.pages || []) for (const it of pg.items) {
    const a = it.t === "link" && it.action;
    if (!a || a.type !== "drill" || !reports[a.report]) continue;
    const key = a.report + JSON.stringify(a.params || {});
    if (seen.has(key)) continue;
    seen.add(key);
    jobs.push([reports[a.report], Object.fromEntries(Object.entries(a.params || {}).map(([k, v]) => [k, v == null ? "" : String(v)]))]);
  }
  const todo = jobs.slice(0, MAX_DRILL_SNAPSHOTS);
  for (let i = 0; i < todo.length; i += 6) await Promise.all(todo.slice(i, i + 6).map(([d, p]) => load(d, p)));
  return { snapshot, drillTargets: jobs.length, drillSnapshots: todo.length };
}
async function exportInteractiveHtml(def, opt = {}) {
  const base = origin();
  const bundleRes = await fetch(`${base}/embed/reportwright-viewer.full.js`);
  if (!bundleRes.ok) throw Object.assign(new Error('The viewer bundle is missing. Run "npm run build:embed" (it also runs in "npm run build").'), { code: "NO_BUNDLE" });
  const bundle = (await bundleRes.text()).replace(/<\/script/gi, "<\\/script");
  const used = fontKeysOf(opt.model);
  const shaped = (opt.model?.pages || []).some((pg) => pg.items.some((it) => it.t === "text" && it.lines.some((l) => l.runs?.some((r) => r.shaped || r.rtl))));
  const keys = [.../* @__PURE__ */ new Set([...ALL_FONT_KEYS, ...used, ...shaped ? [SHAPER] : []])].filter((k) => !isStandard(k));
  const fonts = {};
  await Promise.all(keys.map(async (k) => {
    fonts[k] = toB64(await getBuf(`${base}/fonts/${fontFile(k)}`));
  }));
  const uploaded = (await customFonts()).filter((f) => keys.includes(`u-${f.id}`));
  let uiCss = "";
  try {
    const faces = [["PW UI", "ibm-plex-sans-latin-400-normal", 400], ["PW UI", "ibm-plex-sans-latin-600-normal", 600], ["PW Mono", "ibm-plex-mono-latin-400-normal", 400]];
    const parts = await Promise.all(faces.map(async ([fam, file, w]) => `@font-face{font-family:"${fam}";src:url(data:font/woff2;base64,${toB64(await getBuf(`${base}/fonts/ui/${file}.woff2`))}) format("woff2");font-weight:${w};font-display:swap}`));
    uiCss = parts.join("\n");
  } catch {
  }
  const { reports, missing } = await collectReports(def, opt.reportId);
  const { snapshot: raw, drillTargets, drillSnapshots } = await snapshotData(def, opt.params || {}, opt.model, reports);
  const snapshot = pruneSnapshot(raw, [def, ...Object.values(reports)]);
  const config = {
    server: base,
    definition: def,
    params: opt.params || {},
    lang: opt.lang || "en",
    reports,
    fonts,
    customFonts: uploaded,
    uiFontCss: uiCss,
    snapshot,
    height: "100vh",
    title: def.name
  };
  const json = JSON.stringify(config).replace(/</g, "\\u003c");
  const esc = (s) => String(s).replace(/&/g, "&amp;").replace(/</g, "&lt;");
  const html = `<!doctype html>
<html lang="${esc(opt.lang || "en")}"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1">
<title>${esc(def.name || "Report")}</title>
<meta name="generator" content="ReportWright interactive HTML">
<style>html,body{margin:0;height:100%;background:#e6eaee}#report{height:100vh}#report-note{position:fixed;right:8px;bottom:6px;font:11px system-ui,sans-serif;color:#5f6b77;pointer-events:none}</style>
</head><body>
<div id="report"></div>
<div id="report-note">Exported ${esc((/* @__PURE__ */ new Date()).toLocaleString())} · data refreshes when online</div>
<script>${bundle}<\/script>
<script type="application/json" id="pw-config">${json}<\/script>
<script>
(function(){var c=JSON.parse(document.getElementById('pw-config').textContent);
var el=document.getElementById('report');var s=el.style;s.height='100vh';
ReportWright.mountViewer(el,c);})();
<\/script>
</body></html>`;
  return { html, info: { reports: Object.keys(reports).length || 1, missing, bytes: html.length, drillTargets, drillSnapshots } };
}
export {
  exportInteractiveHtml,
  reachableReportIds
};

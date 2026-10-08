// src/exporters/regions.js
function needsTableData(model, what) {
  if (model && model.regions === null && model.hasTables !== false) throw Object.assign(new Error(`${what} needs the report's table data: render it with { exportData: true }`), { code: "NO_EXPORT_DATA" });
}
var needsExportData = (fmt, o = {}) => ["xlsx", "csv", "docx", "pptx", "html", "json"].includes(fmt) || fmt === "pdf" && !!(o.pdfua || o.ua || o.tagged);
function mergedRegions(model) {
  const map = /* @__PURE__ */ new Map();
  for (const r of model.regions || []) {
    const m = map.get(r.name);
    if (!m) map.set(r.name, { ...r, rows: [...r.rows] });
    else {
      const hasHeader = m.rows.some((x) => x.kind === "header");
      for (const row of r.rows) if (row.kind !== "header" || !hasHeader) m.rows.push(row);
    }
  }
  return [...map.values()];
}
function visualLines(it) {
  const rows = /* @__PURE__ */ new Map();
  for (const l of it.lines) {
    let r = rows.get(l.y);
    if (!r) {
      r = [];
      rows.set(l.y, r);
    }
    r.push(l);
  }
  return [...rows.keys()].sort((a, b) => a - b).map((y) => rows.get(y).sort((a, b) => a.x - b.x).map((l) => l.text).join(" "));
}
var isJustified = (it) => new Set(it.lines.map((l) => l.y)).size < it.lines.length;
function textRows(items) {
  const out = [];
  let group = /* @__PURE__ */ new Map(), groupId = null;
  const flushGroup = () => {
    for (const r of [...group.values()].sort((a, b) => a.y - b.y)) out.push(r.frags.sort((a, b) => a.x - b.x).map((l) => l.text).join(""));
    group = /* @__PURE__ */ new Map();
    groupId = null;
  };
  for (const it of items) {
    if (it.t !== "text" || !it.lines?.length) continue;
    if (!it.rich) {
      if (groupId !== null) flushGroup();
      for (const l of visualLines(it)) out.push(l);
      continue;
    }
    if (it.rich.id !== groupId) {
      if (groupId !== null) flushGroup();
      groupId = it.rich.id;
    }
    const k = String(it.rich.l);
    let r = group.get(k);
    if (!r) {
      r = { y: it.rich.l, frags: [] };
      group.set(k, r);
    }
    for (const l of it.lines) r.frags.push(l);
  }
  if (groupId !== null) flushGroup();
  return out;
}

export {
  needsTableData,
  needsExportData,
  mergedRegions,
  visualLines,
  isJustified,
  textRows
};

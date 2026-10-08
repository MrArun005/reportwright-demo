import {
  withDeadline
} from "./chunk-D2NTLAKL.js";
import {
  mergedRegions,
  needsTableData,
  textRows
} from "./chunk-F6RMRXIN.js";
import {
  altOf,
  figurePicture,
  figures
} from "./chunk-MXR6JBMP.js";
import "./chunk-JQTRDHQP.js";
import {
  currencyOf,
  standardDate,
  toWall
} from "./chunk-GJS242RR.js";

// src/exporters/xlsxchart.js
import { unzipSync, zipSync, strToU8, strFromU8 } from "fflate";
var esc = (s) => String(s ?? "").replace(/[^\t\n\r\u0020-\uD7FF\uE000-\uFFFD\u{10000}-\u{10FFFF}]/gu, "").replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;").replace(/'/g, "&apos;");
var NS = 'xmlns:c="http://schemas.openxmlformats.org/drawingml/2006/chart" xmlns:a="http://schemas.openxmlformats.org/drawingml/2006/main" xmlns:r="http://schemas.openxmlformats.org/officeDocument/2006/relationships"';
var ref = (sheet, c1, r1, c2, r2) => esc(`'${String(sheet).replace(/'/g, "''")}'!$${col(c1)}$${r1}:$${col(c2)}$${r2}`);
var col = (c) => {
  let s = "";
  for (let n = c; n > 0; n = Math.floor((n - 1) / 26)) s = String.fromCharCode(65 + (n - 1) % 26) + s;
  return s;
};
var hex = (c) => /^#[0-9a-f]{6}/i.test(String(c || "")) ? String(c).slice(1, 7).toUpperCase() : null;
function chartTable(spec) {
  if (spec.categories) {
    const head2 = ["", ...spec.series.map((s) => s.name)];
    return [head2, ...spec.categories.map((c, i) => [c, ...spec.series.map((s) => s.values[i] ?? null)])];
  }
  const n = Math.max(0, ...spec.series.map((s) => s.x.length));
  const per = spec.type === "bubble" ? 3 : 2;
  const head = spec.series.flatMap((s) => [`${s.name} X`, s.name, ...per === 3 ? [`${s.name} size`] : []]);
  const rows = Array.from({ length: n }, (_, i) => spec.series.flatMap((s) => [s.x[i] ?? null, s.y[i] ?? null, ...per === 3 ? [s.size?.[i] ?? null] : []]));
  return [head, ...rows];
}
var strCache = (vals) => `<c:strCache><c:ptCount val="${vals.length}"/>${vals.map((v, i) => `<c:pt idx="${i}"><c:v>${esc(v)}</c:v></c:pt>`).join("")}</c:strCache>`;
var numCache = (vals, fmt = "General") => `<c:numCache><c:formatCode>${esc(fmt)}</c:formatCode><c:ptCount val="${vals.length}"/>${vals.map((v, i) => typeof v !== "number" || !Number.isFinite(v) ? "" : `<c:pt idx="${i}"><c:v>${v}</c:v></c:pt>`).join("")}</c:numCache>`;
var fill = (c, line) => {
  const h = hex(c);
  if (!h) return "";
  return line ? `<c:spPr><a:ln w="22225"><a:solidFill><a:srgbClr val="${h}"/></a:solidFill></a:ln></c:spPr>` : `<c:spPr><a:solidFill><a:srgbClr val="${h}"/></a:solidFill></c:spPr>`;
};
var title = (t) => t ? `<c:title><c:tx><c:rich><a:bodyPr/><a:p><a:r><a:t>${esc(t)}</a:t></a:r></a:p></c:rich></c:tx><c:overlay val="0"/></c:title>` : "";
function chartXml(spec, sheet) {
  const t = spec.type;
  const fmt = excelFormat(spec.format, "", spec.locale) || "General";
  let plot = "", axes = "";
  const AX = { cat: 500001, val: 500002, cat2: 500003, val2: 500004 };
  const axIds = (two) => `<c:axId val="${two ? AX.cat2 : AX.cat}"/><c:axId val="${two ? AX.val2 : AX.val}"/>`;
  if (spec.categories) {
    const n = spec.categories.length;
    const cat = `<c:cat><c:strRef><c:f>${ref(sheet, 1, 2, 1, n + 1)}</c:f>${strCache(spec.categories)}</c:strRef></c:cat>`;
    const ser = (s, i, kind) => {
      const c = i + 2;
      const line = kind === "line" || kind === "radar";
      return `<c:ser><c:idx val="${i}"/><c:order val="${i}"/><c:tx><c:strRef><c:f>${ref(sheet, c, 1, c, 1)}</c:f>${strCache([s.name])}</c:strRef></c:tx>${t === "pie" || t === "donut" ? "" : fill(s.color, line)}${line ? '<c:marker><c:symbol val="none"/></c:marker>' : ""}${cat}<c:val><c:numRef><c:f>${ref(sheet, c, 2, c, n + 1)}</c:f>${numCache(s.values, fmt)}</c:numRef></c:val>${kind === "line" ? '<\
c:smooth val="0"/>' : ""}</c:ser>`;
    };
    if (t === "pie" || t === "donut") {
      const s = spec.series[0];
      const pts = spec.categories.map((_, i) => `<c:dPt><c:idx val="${i}"/><c:bubble3D val="0"/>${fill(spec.colors?.[i] || PALETTE[i % PALETTE.length])}</c:dPt>`).join("");
      const one = ser(s, 0, "pie").replace("<c:cat>", `${pts}<c:cat>`);
      plot = t === "pie" ? `<c:pieChart><c:varyColors val="1"/>${one}<c:firstSliceAng val="0"/></c:pieChart>` : `<c:doughnutChart><c:varyColors val="1"/>${one}<c:firstSliceAng val="0"/><c:holeSize val="55"/></c:doughnutChart>`;
    } else if (t === "radar") {
      plot = `<c:radarChart><c:radarStyle val="marker"/><c:varyColors val="0"/>${spec.series.map((s, i) => ser(s, i, "radar")).join("")}${axIds(false)}</c:radarChart>`;
      axes = catAx(AX.cat, AX.val, "b", false, null) + valAx(AX.val, AX.cat, "l", false, fmt, null);
    } else {
      const groups = /* @__PURE__ */ new Map();
      spec.series.forEach((s, i) => {
        const kind = t === "bar" ? "bar" : s.kind || t;
        const k = `${kind}|${s.secondary ? 2 : 1}`;
        if (!groups.has(k)) groups.set(k, { kind, two: !!s.secondary, list: [] });
        groups.get(k).list.push([s, i]);
      });
      const grouping = spec.stacked === "percent" ? "percentStacked" : spec.stacked ? "stacked" : null;
      for (const gr of groups.values()) {
        const body = gr.list.map(([s, i]) => ser(s, i, gr.kind)).join("");
        if (gr.kind === "column" || gr.kind === "bar") plot += `<c:barChart><c:barDir val="${t === "bar" ? "bar" : "col"}"/><c:grouping val="${grouping || "clustered"}"/><c:varyColors val="0"/>${body}<c:gapWidth val="80"/>${grouping ? '<c:overlap val="100"/>' : ""}${axIds(gr.two)}</c:barChart>`;
        else if (gr.kind === "line") plot += `<c:lineChart><c:grouping val="${grouping || "standard"}"/><c:varyColors val="0"/>${body}<c:marker val="1"/>${axIds(gr.two)}</c:lineChart>`;
        else plot += `<c:areaChart><c:grouping val="${grouping || "standard"}"/><c:varyColors val="0"/>${body}${axIds(gr.two)}</c:areaChart>`;
      }
      const horiz = t === "bar";
      axes = catAx(AX.cat, AX.val, horiz ? "l" : "b", false, spec.xTitle) + valAx(AX.val, AX.cat, horiz ? "b" : "l", false, spec.stacked === "percent" ? "0%" : fmt, spec.yTitle);
      if ([...groups.values()].some((g) => g.two)) axes += catAx(AX.cat2, AX.val2, horiz ? "r" : "t", true, null) + valAx(AX.val2, AX.cat2, horiz ? "t" : "r", true, fmt, null);
    }
  } else {
    const per = t === "bubble" ? 3 : 2;
    const body = spec.series.map((s, i) => {
      const c = 1 + i * per, n = s.x.length;
      return `<c:ser><c:idx val="${i}"/><c:order val="${i}"/><c:tx><c:strRef><c:f>${ref(sheet, c + 1, 1, c + 1, 1)}</c:f>${strCache([s.name])}</c:strRef></c:tx>${t === "bubble" ? fill(s.color) : `<c:spPr><a:ln w="19050"><a:noFill/></a:ln></c:spPr><c:marker><c:symbol val="circle"/><c:size val="5"/>${fill(s.color)}</c:marker>`}<c:xVal><c:numRef><c:f>${ref(sheet, c, 2, c, n + 1)}</c:f>${numCache(s.x)}\
</c:numRef></c:xVal><c:yVal><c:numRef><c:f>${ref(sheet, c + 1, 2, c + 1, n + 1)}</c:f>${numCache(s.y, fmt)}</c:numRef></c:yVal>` + (t === "bubble" ? `<c:bubbleSize><c:numRef><c:f>${ref(sheet, c + 2, 2, c + 2, n + 1)}</c:f>${numCache(s.size || [])}</c:numRef></c:bubbleSize><c:bubble3D val="0"/>` : '<c:smooth val="0"/>') + "</c:ser>";
    }).join("");
    plot = t === "bubble" ? `<c:bubbleChart><c:varyColors val="0"/>${body}<c:bubbleScale val="100"/>${axIds(false)}</c:bubbleChart>` : `<c:scatterChart><c:scatterStyle val="lineMarker"/><c:varyColors val="0"/>${body}${axIds(false)}</c:scatterChart>`;
    axes = valAx(AX.cat, AX.val, "b", false, "General", spec.xTitle) + valAx(AX.val, AX.cat, "l", false, fmt, spec.yTitle);
  }
  const legend = spec.legend && (spec.series.length > 1 || t === "pie" || t === "donut") ? '<c:legend><c:legendPos val="b"/><c:overlay val="0"/></c:legend>' : "";
  return `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<c:chartSpace ${NS}><c:roundedCorners val="0"/><c:chart>${title(spec.title)}<c:autoTitleDeleted val="${spec.title ? 0 : 1}"/><c:plotArea><c:layout/>${plot}${axes}</c:plotArea>${legend}<c:plotVisOnly val="1"/><c:dispBlanksAs val="gap"/></c:chart></c:chartSpace>`;
}
var axTitle = (t) => t ? title(t) : "";
function catAx(id, cross, pos, second, t) {
  return `<c:catAx><c:axId val="${id}"/><c:scaling><c:orientation val="minMax"/></c:scaling><c:delete val="${second ? 1 : 0}"/><c:axPos val="${pos}"/>${axTitle(t)}<c:numFmt formatCode="General" sourceLinked="0"/><c:majorTickMark val="out"/><c:minorTickMark val="none"/><c:tickLblPos val="nextTo"/><c:crossAx val="${cross}"/><c:crosses val="autoZero"/><c:auto val="1"/><c:lblAlgn val="ctr"/><c:lblOffs\
et val="100"/><c:noMultiLvlLbl val="0"/></c:catAx>`;
}
function valAx(id, cross, pos, second, fmt, t) {
  return `<c:valAx><c:axId val="${id}"/><c:scaling><c:orientation val="minMax"/></c:scaling><c:delete val="0"/><c:axPos val="${pos}"/>${second ? "" : "<c:majorGridlines/>"}${axTitle(t)}<c:numFmt formatCode="${esc(fmt)}" sourceLinked="0"/><c:majorTickMark val="out"/><c:minorTickMark val="none"/><c:tickLblPos val="nextTo"/><c:crossAx val="${cross}"/><c:crosses val="${second ? "max" : "autoZero"}"/><\
c:crossBetween val="between"/></c:valAx>`;
}
var PALETTE = ["#2563eb", "#16a34a", "#f59e0b", "#dc2626", "#7c3aed", "#0891b2", "#db2777", "#65a30d", "#ea580c", "#475569"];
var drawingXml = (c0, r0, cols, rows) => `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<xdr:wsDr xmlns:xdr="http://schemas.openxmlformats.org/drawingml/2006/spreadsheetDrawing" xmlns:a="http://schemas.openxmlformats.org/drawingml/2006/main"><xdr:twoCellAnchor editAs="oneCell"><xdr:from><xdr:col>${c0}</xdr:col><xdr:colOff>0</xdr:colOff><xdr:row>${r0}</xdr:row><xdr:rowOff>0</xdr:rowOff></xdr:from><xdr:to><xdr:col>${c0 + cols}</xdr:col><xdr:colOff>0</xdr:colOff><xdr:row>${r0 + rows}</x\
dr:row><xdr:rowOff>0</xdr:rowOff></xdr:to><xdr:graphicFrame macro=""><xdr:nvGraphicFramePr><xdr:cNvPr id="2" name="Chart 1"/><xdr:cNvGraphicFramePr/></xdr:nvGraphicFramePr><xdr:xfrm><a:off x="0" y="0"/><a:ext cx="0" cy="0"/></xdr:xfrm><a:graphic><a:graphicData uri="http://schemas.openxmlformats.org/drawingml/2006/chart"><c:chart xmlns:c="http://schemas.openxmlformats.org/drawingml/2006/chart" xmln\
s:r="http://schemas.openxmlformats.org/officeDocument/2006/relationships" r:id="rId1"/></a:graphicData></a:graphic></xdr:graphicFrame><xdr:clientData/></xdr:twoCellAnchor></xdr:wsDr>`;
var rels = (list) => `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<Relationships xmlns="http://schemas.openxmlformats.org/package/2006/relationships">${list.join("")}</Relationships>`;
var rel = (id, type, target) => `<Relationship Id="${id}" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/${type}" Target="${target}"/>`;
function addCharts(bytes, charts) {
  if (!charts.length) return bytes;
  const files = unzipSync(bytes);
  const read = (p) => files[p] ? strFromU8(files[p]) : null;
  const write = (p, s) => {
    files[p] = strToU8(s);
  };
  const wb = read("xl/workbook.xml") || "";
  const wbRels = read("xl/_rels/workbook.xml.rels") || "";
  const target = (rid) => {
    const m = new RegExp(`<Relationship[^>]*Id="${rid}"[^>]*Target="([^"]+)"`).exec(wbRels) || new RegExp(`<Relationship[^>]*Target="([^"]+)"[^>]*Id="${rid}"`).exec(wbRels);
    return m ? m[1].replace(/^\/?xl\//, "") : null;
  };
  const partOf = /* @__PURE__ */ new Map();
  for (const m of wb.matchAll(/<sheet\b[^>]*>/g)) {
    const name = /name="([^"]*)"/.exec(m[0])?.[1], rid = /r:id="([^"]*)"/.exec(m[0])?.[1];
    if (name != null && rid) partOf.set(name.replace(/&amp;/g, "&").replace(/&lt;/g, "<").replace(/&gt;/g, ">").replace(/&quot;/g, '"').replace(/&apos;/g, "'"), target(rid));
  }
  let types = read("[Content_Types].xml") || "";
  charts.forEach((c, i) => {
    const part = partOf.get(c.sheet);
    if (!part) return;
    const n = i + 1;
    const sheetPath = `xl/${part}`, file = part.split("/").pop();
    const relPath = `xl/worksheets/_rels/${file}.rels`;
    write(`xl/charts/chartPW${n}.xml`, chartXml(c.spec, c.sheet));
    write(`xl/drawings/drawingPW${n}.xml`, drawingXml(c.at.col, c.at.row, 9, 20));
    write(`xl/drawings/_rels/drawingPW${n}.xml.rels`, rels([rel("rId1", "chart", `../charts/chartPW${n}.xml`)]));
    const old = read(relPath);
    const relEntry = rel("rIdPW1", "drawing", `../drawings/drawingPW${n}.xml`);
    write(relPath, old ? old.replace("</Relationships>", `${relEntry}</Relationships>`) : rels([relEntry]));
    let ws = read(sheetPath) || "";
    if (!/xmlns:r=/.test(ws.slice(0, 600))) ws = ws.replace("<worksheet ", '<worksheet xmlns:r="http://schemas.openxmlformats.org/officeDocument/2006/relationships" ');
    const before = ["<legacyDrawing", "<legacyDrawingHF", "<picture", "<oleObjects", "<controls", "<webPublishItems", "<tableParts", "<extLst", "</worksheet>"].map((t) => ws.indexOf(t)).filter((k) => k >= 0);
    const at = Math.min(...before);
    write(sheetPath, ws.slice(0, at) + '<drawing r:id="rIdPW1"/>' + ws.slice(at));
    types = types.replace("</Types>", `<Override PartName="/xl/charts/chartPW${n}.xml" ContentType="application/vnd.openxmlformats-officedocument.drawingml.chart+xml"/><Override PartName="/xl/drawings/drawingPW${n}.xml" ContentType="application/vnd.openxmlformats-officedocument.drawing+xml"/></Types>`);
  });
  write("[Content_Types].xml", types);
  return zipSync(files, { level: 6 });
}

// src/exporters/xlsxwriter.js
import { zipSync as zipSync2, strToU8 as strToU82 } from "fflate";
var colName = (c) => {
  let s = "";
  for (let n = c; n > 0; n = Math.floor((n - 1) / 26)) s = String.fromCharCode(65 + (n - 1) % 26) + s;
  return s;
};
var XML = '<?xml version="1.0" encoding="UTF-8" standalone="yes"?>\n';
var R = "http://schemas.openxmlformats.org/officeDocument/2006/relationships";
var rels2 = (list) => `${XML}<Relationships xmlns="http://schemas.openxmlformats.org/package/2006/relationships">${list.map(([id, type, target]) => `<Relationship Id="${id}" Type="${type.startsWith("http") ? type : `${R}/${type}`}" Target="${target}"/>`).join("")}</Relationships>`;
var HEADER_FILL = "FFE8EEF3";
var Sheet = class {
  /** @param {Book} book @param {string} name */
  constructor(book, name) {
    this.book = book;
    this.name = name;
    this.xml = [];
    this.widths = [];
    this.merges = [];
    this.images = [];
    this.rowCount = 0;
    this.frozenRows = 0;
    this.outlineLevelRow = 0;
  }
  /**
   * Add a row (1-based number returned). cells: one per column (null = empty).
   * @param {(Cell|null)[]} cells @param {{ outlineLevel?: number }} [opt]
   */
  addRow(cells, opt = {}) {
    const n = ++this.rowCount;
    let s = `<row r="${n}"${opt.outlineLevel ? ` outlineLevel="${opt.outlineLevel}" hidden="0"` : ""}>`;
    cells.forEach((c, i) => {
      if (c) s += this.book.cell(`${colName(i + 1)}${n}`, c);
    });
    this.xml.push(s + "</row>");
    return n;
  }
  /** Merge (1-based, inclusive). */
  merge(r1, c1, r2, c2) {
    if (r2 > r1 || c2 > c1) this.merges.push(`${colName(c1)}${r1}:${colName(c2)}${r2}`);
  }
  /** A picture with its top-left at (col, row), 0-based, w × h pixels. */
  addImage(bytes, ext, col2, row, w, h) {
    this.images.push({ bytes, ext, col: col2, row, w, h });
  }
  /** @param {number} i */
  toXml(i) {
    return sheetHead(this) + this.xml.join("") + sheetTail(this.merges, this.images.length > 0);
  }
};
function sheetHead({ widths, frozenRows, outlineLevelRow }) {
  const cols = widths.map((w, c) => w ? `<col min="${c + 1}" max="${c + 1}" width="${w}" customWidth="1"/>` : "").join("");
  const view = frozenRows ? `<sheetViews><sheetView workbookViewId="0"><pane ySplit="${frozenRows}" topLeftCell="A${frozenRows + 1}" activePane="bottomLeft" state="frozen"/></sheetView></sheetViews>` : '<sheetViews><sheetView workbookViewId="0"/></sheetViews>';
  return `${XML}<worksheet xmlns="http://schemas.openxmlformats.org/spreadsheetml/2006/main" xmlns:r="${R}"><sheetPr><outlinePr summaryBelow="1"/></sheetPr>${view}<sheetFormatPr defaultRowHeight="15"${outlineLevelRow ? ` outlineLevelRow="${outlineLevelRow}"` : ""}/>${cols ? `<cols>${cols}</cols>` : ""}<sheetData>`;
}
function sheetTail(merges, drawing = false) {
  return `</sheetData>${merges.length ? `<mergeCells count="${merges.length}">${merges.map((m) => `<mergeCell ref="${m}"/>`).join("")}</mergeCells>` : ""}<pageMargins left="0.7" right="0.7" top="0.75" bottom="0.75" header="0.3" footer="0.3"/>${drawing ? `<drawing r:id="rId1"/>` : ""}</worksheet>`;
}
var Book = class {
  constructor({ title: title2 = "Report", creator = "ReportWright" } = {}) {
    this.title = title2;
    this.creator = creator;
    this.fullCalcOnLoad = false;
    this.sheets = [];
    this.styles = /* @__PURE__ */ new Map([["0|0|0", 0]]);
    this.numFmts = /* @__PURE__ */ new Map();
  }
  /** @param {string} name */
  addSheet(name) {
    const s = new Sheet(this, name);
    this.sheets.push(s);
    return s;
  }
  /** cellXfs index for a style */
  style(st) {
    if (!st) return 0;
    let fmt = 0;
    if (st.numFmt) {
      if (!this.numFmts.has(st.numFmt)) this.numFmts.set(st.numFmt, 164 + this.numFmts.size);
      fmt = /** @type {number} */
      this.numFmts.get(st.numFmt);
    }
    const key = `${fmt}|${st.bold ? 1 : 0}|${st.fill ? 1 : 0}`;
    if (!this.styles.has(key)) this.styles.set(key, this.styles.size);
    return (
      /** @type {number} */
      this.styles.get(key)
    );
  }
  /** One <c> element. @param {string} ref @param {Cell} c */
  cell(ref2, c) {
    const s = this.style(c.style), sa = s ? ` s="${s}"` : "";
    let v = c.v;
    if (v instanceof Date) v = Number.isFinite(v.getTime()) ? v.getTime() / 864e5 + 25569 : null;
    if (c.f) return `<c r="${ref2}"${sa}${typeof v === "string" ? ' t="str"' : typeof v === "boolean" ? ' t="b"' : ""}><f>${esc(c.f)}</f>${v == null ? "" : `<v>${typeof v === "boolean" ? +v : esc(v)}</v>`}</c>`;
    if (v == null) return s ? `<c r="${ref2}"${sa}/>` : "";
    if (typeof v === "number") return Number.isFinite(v) ? `<c r="${ref2}"${sa}><v>${v}</v></c>` : `<c r="${ref2}"${sa} t="inlineStr"><is><t>${esc(String(v))}</t></is></c>`;
    if (typeof v === "boolean") return `<c r="${ref2}"${sa} t="b"><v>${+v}</v></c>`;
    return `<c r="${ref2}"${sa} t="inlineStr"><is><t xml:space="preserve">${esc(typeof v === "object" ? JSON.stringify(v) : v)}</t></is></c>`;
  }
  stylesXml() {
    const fmts = [...this.numFmts].map(([f, id]) => `<numFmt numFmtId="${id}" formatCode="${esc(f)}"/>`).join("");
    const xfs = [...this.styles.keys()].map((k) => {
      const [fmt, bold, fill2] = k.split("|").map(Number);
      return `<xf numFmtId="${fmt || 0}" fontId="${bold ? 1 : 0}" fillId="${fill2 ? 2 : 0}" borderId="0" xfId="0"${fmt ? ' applyNumberFormat="1"' : ""}${bold ? ' applyFont="1"' : ""}${fill2 ? ' applyFill="1"' : ""}/>`;
    }).join("");
    return `${XML}<styleSheet xmlns="http://schemas.openxmlformats.org/spreadsheetml/2006/main">${fmts ? `<numFmts count="${this.numFmts.size}">${fmts}</numFmts>` : ""}<fonts count="2"><font><sz val="11"/><name val="Calibri"/><family val="2"/></font><font><b/><sz val="11"/><name val="Calibri"/><family val="2"/></font></fonts><fills count="3"><fill><patternFill patternType="none"/></fill><fill><pat\
ternFill patternType="gray125"/></fill><fill><patternFill patternType="solid"><fgColor rgb="${HEADER_FILL}"/><bgColor indexed="64"/></patternFill></fill></fills><borders count="1"><border><left/><right/><top/><bottom/><diagonal/></border></borders><cellStyleXfs count="1"><xf numFmtId="0" fontId="0" fillId="0" borderId="0"/></cellStyleXfs><cellXfs count="${this.styles.size}">${xfs}</cellXfs><cellSt\
yles count="1"><cellStyle name="Normal" xfId="0" builtinId="0"/></cellStyles></styleSheet>`;
  }
  /** The .xlsx bytes. */
  write() {
    const files = {};
    const put = (p, s) => {
      files[p] = typeof s === "string" ? strToU82(s) : s;
    };
    const over = [];
    let img = 0;
    this.sheets.forEach((sh, i) => {
      const n = i + 1;
      put(`xl/worksheets/sheet${n}.xml`, sh.toXml(i));
      sh.xml = [];
      over.push([`/xl/worksheets/sheet${n}.xml`, "application/vnd.openxmlformats-officedocument.spreadsheetml.worksheet+xml"]);
      if (!sh.images.length) return;
      put(`xl/worksheets/_rels/sheet${n}.xml.rels`, rels2([["rId1", "drawing", `../drawings/drawing${n}.xml`]]));
      const anchors = sh.images.map((im, k) => {
        img++;
        put(`xl/media/image${img}.${im.ext}`, im.bytes);
        return `<xdr:oneCellAnchor><xdr:from><xdr:col>${im.col}</xdr:col><xdr:colOff>0</xdr:colOff><xdr:row>${im.row}</xdr:row><xdr:rowOff>0</xdr:rowOff></xdr:from><xdr:ext cx="${Math.round(im.w * 9525)}" cy="${Math.round(im.h * 9525)}"/><xdr:pic><xdr:nvPicPr><xdr:cNvPr id="${k + 2}" name="Picture ${k + 1}"/><xdr:cNvPicPr><a:picLocks noChangeAspect="1"/></xdr:cNvPicPr></xdr:nvPicPr><xdr:blipFill><\
a:blip r:embed="rId${k + 1}"/><a:stretch><a:fillRect/></a:stretch></xdr:blipFill><xdr:spPr><a:xfrm><a:off x="0" y="0"/><a:ext cx="${Math.round(im.w * 9525)}" cy="${Math.round(im.h * 9525)}"/></a:xfrm><a:prstGeom prst="rect"><a:avLst/></a:prstGeom></xdr:spPr></xdr:pic><xdr:clientData/></xdr:oneCellAnchor>`;
      });
      let first = img - sh.images.length;
      put(`xl/drawings/_rels/drawing${n}.xml.rels`, rels2(sh.images.map((im, k) => [`rId${k + 1}`, "image", `../media/image${++first}.${im.ext}`])));
      put(`xl/drawings/drawing${n}.xml`, `${XML}<xdr:wsDr xmlns:xdr="http://schemas.openxmlformats.org/drawingml/2006/spreadsheetDrawing" xmlns:a="http://schemas.openxmlformats.org/drawingml/2006/main" xmlns:r="${R}">${anchors.join("")}</xdr:wsDr>`);
      over.push([`/xl/drawings/drawing${n}.xml`, "application/vnd.openxmlformats-officedocument.drawing+xml"]);
    });
    for (const [p, x] of this.bookParts(over)) put(p, x);
    return zipSync2(files, { level: 6 });
  }
  /**
   * The workbook's own parts, written after the sheets (their names, the styles they used): styles, workbook,
   * relationships, properties and content types. over: [part, content type] of the sheets and drawings.
   * @param {[string, string][]} over @returns {[string, string][]}
   */
  bookParts(over) {
    const out = [];
    const put = (p, s) => out.push([p, s]);
    put("xl/styles.xml", this.stylesXml());
    put("xl/workbook.xml", `${XML}<workbook xmlns="http://schemas.openxmlformats.org/spreadsheetml/2006/main" xmlns:r="${R}"><bookViews><workbookView/></bookViews><sheets>${this.sheets.map((s, i) => `<sheet name="${esc(s.name)}" sheetId="${i + 1}" r:id="rId${i + 1}"/>`).join("")}</sheets><calcPr calcId="171027"${this.fullCalcOnLoad ? ' fullCalcOnLoad="1"' : ""}/></workbook>`);
    put("xl/_rels/workbook.xml.rels", rels2([...this.sheets.map((s, i) => [`rId${i + 1}`, "worksheet", `worksheets/sheet${i + 1}.xml`]), [`rId${this.sheets.length + 1}`, "styles", "styles.xml"]]));
    put("docProps/core.xml", `${XML}<cp:coreProperties xmlns:cp="http://schemas.openxmlformats.org/package/2006/metadata/core-properties" xmlns:dc="http://purl.org/dc/elements/1.1/" xmlns:dcterms="http://purl.org/dc/terms/" xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance"><dc:title>${esc(this.title)}</dc:title><dc:creator>${esc(this.creator)}</dc:creator><dcterms:created xsi:type="dcterms:W3C\
DTF">${(/* @__PURE__ */ new Date()).toISOString().replace(/\.\d+Z$/, "Z")}</dcterms:created></cp:coreProperties>`);
    put("_rels/.rels", rels2([["rId1", "officeDocument", "xl/workbook.xml"], ["rId2", "http://schemas.openxmlformats.org/package/2006/relationships/metadata/core-properties", "docProps/core.xml"]]));
    put("[Content_Types].xml", `${XML}<Types xmlns="http://schemas.openxmlformats.org/package/2006/content-types"><Default Extension="rels" ContentType="application/vnd.openxmlformats-package.relationships+xml"/><Default Extension="xml" ContentType="application/xml"/><Default Extension="png" ContentType="image/png"/><Default Extension="jpeg" ContentType="image/jpeg"/><Override PartName="/xl/workbo\
ok.xml" ContentType="application/vnd.openxmlformats-officedocument.spreadsheetml.sheet.main+xml"/><Override PartName="/xl/styles.xml" ContentType="application/vnd.openxmlformats-officedocument.spreadsheetml.styles+xml"/><Override PartName="/docProps/core.xml" ContentType="application/vnd.openxmlformats-package.core-properties+xml"/>${over.map(([p, t]) => `<Override PartName="${p}" ContentType="${t}\
"/>`).join("")}</Types>`);
    return out;
  }
};

// src/exporters/xlsx.js
var excelDate = (f) => f.replace(/'([^']*)'/g, (_, t) => /^[\s./:,-]*$/.test(t) ? t : `"${t}"`).replace(/M/g, "m").replace(/tt?/g, "AM/PM").replace(/HH?/g, "hh").replace(/f+/g, (x) => `.${"0".repeat(Math.min(3, x.length))}`).replace(/\s*zzz?/g, "");
var javaDateToExcel = (f) => f.replace(/'([^']*)'/g, '"$1"').replace(/E{4,}/g, "dddd").replace(/E{1,3}/g, "ddd").replace(/a+/g, "AM/PM").replace(/H+/g, "hh").replace(/M/g, "m").replace(/[kKuDwWFGzZXL]+/g, "");
function excelFormat(fmt, currencySymbol2 = "", locale, value) {
  if (!fmt) return null;
  if (fmt.startsWith("java:") || fmt.startsWith("icu:")) {
    const p = fmt.slice(fmt.indexOf(":") + 1).replace(/\{RoundingMode=\w+\}/, "");
    if (!p || p.startsWith("@")) return value instanceof Date ? p.includes("time") && !p.includes("date") ? "h:mm AM/PM" : "m/d/yyyy" : null;
    if (value instanceof Date) return javaDateToExcel(p) || null;
    if (/[‰\u2030]|E0/.test(p)) return null;
    return p.replace(/¤+/g, `"${currencySymbol2}"`).replace(/'([^']*)'/g, '"$1"');
  }
  if (value instanceof Date && fmt.length === 1) {
    const US = { d: "m/d/yyyy", D: "dddd, mmmm d, yyyy", t: "h:mm AM/PM", T: "h:mm:ss AM/PM", g: "m/d/yyyy h:mm AM/PM", G: "m/d/yyyy h:mm:ss AM/PM", M: "mmmm d", m: "mmmm d", Y: "mmmm yyyy", y: "mmmm yyyy", f: "dddd, mmmm d, yyyy h:mm AM/PM", F: "dddd, mmmm d, yyyy h:mm:ss AM/PM", s: "yyyy-mm-ddThh:mm:ss" };
    if (!locale || /^en-US$/i.test(locale)) return US[fmt] || null;
    const g = (k) => {
      const p = standardDate(k, locale);
      return p ? excelDate(p) : null;
    };
    const both = (a, b) => {
      const x = g(a), y = g(b);
      return x && y ? `${x} ${y}` : null;
    };
    return { g: () => both("d", "t"), G: () => both("d", "T"), f: () => both("D", "t"), F: () => both("D", "T") }[fmt]?.() ?? g(fmt) ?? US[fmt] ?? null;
  }
  const m = /^([CcNnFfPpDd])(\d{0,2})$/.exec(fmt);
  if (m) {
    const d = m[2] === "" ? 2 : Number(m[2]);
    const dec = d ? "." + "0".repeat(d) : "";
    const lakh = /-IN$/i.test(locale || "") ? (s) => {
      if (typeof value === "number" && value < 0) {
        const a = Math.abs(value);
        return a >= 1e7 ? `${s}##\\,##\\,##\\,##0${dec}` : a >= 1e5 ? `${s}##\\,##\\,##0${dec}` : `${s}##,##0${dec}`;
      }
      return `[>=10000000]${s}##\\,##\\,##\\,##0${dec};[>=100000]${s}##\\,##\\,##0${dec};${s}##,##0${dec}`;
    } : null;
    switch (m[1].toUpperCase()) {
      case "C":
        return lakh ? lakh(`"${currencySymbol2}"`) : `"${currencySymbol2}"#,##0${dec}`;
      case "N":
        return lakh ? lakh("") : `#,##0${dec}`;
      case "F":
        return `0${dec}`;
      case "P":
        return `0${dec}%`;
      case "D":
        return "0".repeat(Math.max(1, d));
    }
  }
  if (/[yMd]/.test(fmt) && !/[#0]/.test(fmt)) return excelDate(fmt);
  if (/[#0]/.test(fmt)) return fmt;
  return null;
}
function currencySymbol(iso, locale) {
  if (!iso) return "";
  try {
    return new Intl.NumberFormat(locale || "en-US", { style: "currency", currency: iso }).formatToParts(1).find((p) => p.type === "currency")?.value || iso;
  } catch {
    return SYMBOL[iso] || iso;
  }
}
var SYMBOL = { INR: "₹", USD: "$", EUR: "€", GBP: "£", JPY: "¥" };
var decimalsOf = (fmt) => {
  const m = /^[CcNnFfPp](\d{0,2})$/.exec(fmt || "");
  if (m) return (m[1] === "" ? 2 : Number(m[1])) + (/^[Pp]/.test(fmt) ? 2 : 0);
  const d = /\.(0+)/.exec(fmt || "");
  return d ? d[1].length : fmt ? 0 : null;
};
function colStats() {
  const s = {
    vals: 0,
    nums: 0,
    sum: 0,
    min: Infinity,
    max: -Infinity,
    first: void 0,
    differ: false,
    /** @param {any} v a region cell's value */
    add(v) {
      if (v == null || v === "") return;
      s.vals++;
      if (typeof v !== "number" || !Number.isFinite(v)) return;
      if (s.nums === 0) s.first = v;
      else if (v !== s.first) s.differ = true;
      s.nums++;
      s.sum += v;
      if (v < s.min) s.min = v;
      if (v > s.max) s.max = v;
    }
  };
  return s;
}
function subtotalFn(c, st) {
  const d = decimalsOf(c.format);
  const tol = d == null ? 1e-9 * Math.max(1, Math.abs(c.value)) : 0.5 * 10 ** -d + 1e-9;
  const same = (v) => Math.abs(v - c.value) <= tol;
  if (st.nums && same(st.sum)) return 9;
  if (same(st.vals)) return st.nums === st.vals ? 2 : 3;
  if (st.nums > 1 && st.differ) {
    if (same(st.sum / st.nums)) return 1;
    if (same(st.min)) return 5;
    if (same(st.max)) return 4;
  }
  return null;
}
function totalFormula(rows, at, c, made) {
  const row = rows[at];
  if (typeof c.value !== "number" || !Number.isFinite(c.value)) return null;
  const covered = [];
  for (let k = at - 1; k >= 0; k--) {
    const r = rows[k];
    if (r.kind === "header") break;
    if (row.kind === "groupFooter" && (r.kind === "groupFooter" || r.kind === "groupHeader") && r.level <= row.level) break;
    if (r.kind === "detail") covered.push(k);
  }
  if (!covered.length) return null;
  covered.reverse();
  const st = colStats();
  for (const k of covered) st.add(rows[k].cells.find((x) => x.colIndex === c.colIndex)?.value);
  const fn = subtotalFn(c, st);
  if (!fn) return null;
  const col2 = colName(c.colIndex + 1);
  const runs = [];
  for (const k of covered) {
    const last = runs[runs.length - 1];
    if (last && rows[k].n === last[1] + 1) last[1] = rows[k].n;
    else runs.push([rows[k].n, rows[k].n]);
  }
  let refs = runs.map(([a, b]) => a === b ? `${col2}${a}` : `${col2}${a}:${col2}${b}`);
  if (refs.length > 30) {
    const first = covered[0], last = covered[covered.length - 1];
    for (let k = first; k <= last; k++) {
      if (rows[k].kind === "detail") continue;
      const v = rows[k].cells.find((x) => x.colIndex === c.colIndex)?.value;
      if (v != null && v !== "" && !made.has(`${k}|${c.colIndex}`)) return null;
    }
    refs = [`${col2}${rows[first].n}:${col2}${rows[last].n}`];
  }
  return `SUBTOTAL(${fn},${refs.join(",")})`;
}
function sheetNamer() {
  const used = /* @__PURE__ */ new Set();
  return (n, suffix = "") => {
    let s = String(n || "Sheet").replace(/[\\/?*[\]:\u0000-\u001f\u007f\uFFFE\uFFFF]|[\uD800-\uDFFF]/g, " ").replace(/^['\s]+|['\s]+$/g, "").slice(0, 28).trim() || "Sheet";
    if (suffix) s = `${s.slice(0, 31 - suffix.length)}${suffix}`;
    let k = s, i = 2;
    while (used.has(k.toLowerCase())) k = `${s.slice(0, 28)} ${i++}`;
    used.add(k.toLowerCase());
    return k;
  };
}
function xlsxCell({ sym, locale, tz }) {
  const cellValue = (v) => v === "" ? null : v instanceof Date ? new Date(toWall(v, tz)) : v;
  return (c, header) => {
    const nf = excelFormat(c.format, sym, locale, c.value);
    const numFmt = nf && (typeof c.value === "number" || c.value instanceof Date) ? nf : c.value instanceof Date ? "dd mmm yyyy" : null;
    return (
      /** @type {any} */
      { v: cellValue(c.value), style: { numFmt, bold: !!(c.bold || header), fill: header } }
    );
  };
}
function exportXlsx(model, opt = {}, legacy = void 0) {
  if (legacy || opt && (typeof opt === "function" || /** @type {any} */
  opt.Workbook)) opt = legacy || {};
  return withDeadline(
    xlsxOf(model, opt),
    /** @type {any} */
    opt.timeoutMs
  );
}
async function xlsxOf(model, opt) {
  const { currency, title: title2, formulas = true, pictures = true, charts = true, fetchImage, rasterize, timeZone } = opt;
  const fontStore = opt.fontStore || opt.fonts;
  needsTableData(model, "Excel");
  const tz = timeZone ?? model.timeZone ?? void 0;
  const sym = currencySymbol(currency || model.currency || currencyOf(model.locale), model.locale);
  const toCell = xlsxCell({ sym, locale: model.locale, tz });
  const wb = new Book({ title: title2 || model.name || "Report" });
  const regions = mergedRegions(model);
  const sheetName = sheetNamer();
  if (!regions.length) {
    const ws = wb.addSheet(sheetName(title2 || "Report"));
    model.pages.forEach((p, pi) => {
      for (const l of textRows(p.items)) ws.addRow([{ v: pi + 1 }, { v: l }]);
    });
    ws.widths = [6, 80];
  }
  for (const r of regions) {
    const ws = wb.addSheet(sheetName(r.name));
    ws.widths = r.columns.map((w) => Math.max(6, Math.round(w / 5.5)));
    let headerRows = 0;
    const merges = [];
    const rows = r.rows.map((row) => ({ ...row, n: 0 }));
    const made = /* @__PURE__ */ new Map();
    rows.forEach((row, ri) => {
      row.n = ws.rowCount + 1;
      const cells = new Array(r.columns.length).fill(null);
      const header = row.kind === "header";
      for (const c of row.cells) {
        if (c.colIndex < 0) continue;
        const cell = toCell(c, header);
        if (c.span > 1 || c.rowSpan > 1) merges.push([row.n, c.colIndex + 1, row.n + Math.max(1, c.rowSpan || 1) - 1, c.colIndex + Math.max(1, c.span || 1)]);
        if (formulas && (row.kind === "groupFooter" || row.kind === "footer") && !(c.span > 1)) {
          const f = totalFormula(rows, ri, c, made);
          if (f) {
            cell.f = f;
            made.set(`${ri}|${c.colIndex}`, f);
          }
        }
        cells[c.colIndex] = cell;
      }
      if (header) for (let i = 0; i < cells.length; i++) cells[i] || (cells[i] = { v: null, style: { fill: true } });
      ws.addRow(cells, { outlineLevel: row.kind === "detail" && row.level > 0 ? Math.min(7, row.level) : 0 });
      if (header) headerRows++;
    });
    const last = ws.rowCount, taken = /* @__PURE__ */ new Set();
    for (const [r1, c1, r2, c2] of merges) {
      const box = [];
      let clash = false;
      for (let y = r1; y <= Math.min(r2, last); y++) for (let x = c1; x <= c2; x++) {
        const k = `${y},${x}`;
        if (taken.has(k)) clash = true;
        box.push(k);
      }
      if (clash) continue;
      box.forEach((k) => taken.add(k));
      ws.merge(r1, c1, Math.min(r2, last), c2);
    }
    ws.frozenRows = headerRows;
    ws.outlineLevelRow = Math.min(7, r.rows.reduce((m, x) => Math.max(m, x.kind === "detail" ? x.level || 0 : 0), 0));
  }
  const native = [];
  const nativeFigs = /* @__PURE__ */ new Set();
  if (charts) {
    for (const pg of model.pages) for (const f of figures(pg.items)) {
      const spec = f.tag.k === "chart" ? f.items.find((it) => it.xchart)?.xchart : null;
      if (!spec || native.length >= 100) continue;
      const ws = wb.addSheet(sheetName(spec.title || f.tag.alt || `Chart ${native.length + 1}`));
      const rows = chartTable(spec);
      rows.forEach((r, ri) => ws.addRow(r.map((v) => ({ v, style: ri === 0 ? { bold: true } : void 0 }))));
      ws.widths = rows[0].map((_, ci) => ci === 0 && spec.categories ? 18 : 12);
      native.push({ sheet: ws.name, spec, at: { col: rows[0].length + 1, row: 1 } });
      nativeFigs.add(f.tag);
    }
  }
  if (pictures) {
    let ws = null, row = 1;
    for (const pg of model.pages) for (const f of figures(pg.items)) {
      if (f.tag.k === "shape" || f.tag.k === "line" || nativeFigs.has(f.tag)) continue;
      const pic = await figurePicture(f, { fontStore, fetchImage, rasterize });
      const bytes = pic.png || pic.jpeg;
      if (!bytes) continue;
      ws || (ws = wb.addSheet(sheetName("Charts")));
      while (ws.rowCount < row - 1) ws.addRow([]);
      ws.addRow([{ v: altOf(f.tag), style: { bold: true } }]);
      const w = Math.round(pic.w * 4 / 3), h = Math.round(pic.h * 4 / 3);
      ws.addImage(bytes, pic.png ? "png" : "jpeg", 0, row, w, h);
      row += 2 + Math.ceil(h / 20);
    }
  }
  wb.fullCalcOnLoad = !!formulas;
  return addCharts(wb.write(), native);
}
export {
  colStats,
  currencySymbol,
  excelFormat,
  exportXlsx,
  sheetNamer,
  subtotalFn,
  xlsxCell
};

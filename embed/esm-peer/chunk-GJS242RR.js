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
      const parts = (f, v) => f.formatToParts(v);
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
      const f = new Intl.NumberFormat(locale, { style: "currency", currency: iso });
      const ps = f.formatToParts(1), i = ps.findIndex((p) => p.type === "currency");
      const sym = i < 0 ? iso : ps[i].value + (/^[\u200e\u200f\u061c]+$/.test(ps[i + 1]?.value || "") ? ps[i + 1].value : "");
      return { sym, iso, digits: f.resolvedOptions().maximumFractionDigits ?? 2 };
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
function roundTo(d, f, mode, neg) {
  if (d.s <= f) return { M: d.M * P10(f - d.s), s: f };
  const k = P10(d.s - f), q = d.M / k, r = d.M % k, half = k / 2n;
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
  return { M: up ? q + 1n : q, s: f };
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
    const num = pos.num;
    const ei = num.indexOf("E");
    const mant = ei >= 0 ? num.slice(0, ei) : num;
    const expPart = ei >= 0 ? num.slice(ei + 1) : null;
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
  const num = (n, width) => localDigits(String(n).padStart(width, "0"), sy);
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
        if (c === "u" && !icu) return num(w.getUTCDay() || 7, n);
        const y = c === "Y" ? weekOf(w, weekInfo(locale)).year : w.getUTCFullYear();
        return n === 2 ? num(y % 100, 2) : num(y, n);
      }
      case "M":
      case "L": {
        const m = w.getUTCMonth() + 1;
        if (n <= 2) return num(m, n);
        const style = n === 3 ? "short" : n === 5 && icu ? "narrow" : "long";
        const fmtForm = c === "M" ? part(locale, { day: "numeric", month: style }, w, "month") : "";
        return fmtForm && !/^[\d\u0660-\u0669\u06f0-\u06f9]+$/.test(fmtForm) ? fmtForm : dtf(locale, { month: style }).format(w);
      }
      case "d":
        return num(w.getUTCDate(), n);
      case "D":
        return num(Math.round((Date.UTC(w.getUTCFullYear(), w.getUTCMonth(), w.getUTCDate()) - Date.UTC(w.getUTCFullYear(), 0, 1)) / DAY_MS) + 1, n);
      case "F":
        return num(Math.floor((w.getUTCDate() - 1) / 7) + 1, n);
      case "w":
        return num(weekOf(w, weekInfo(locale)).week, n);
      case "W": {
        const info = weekInfo(locale), first = new Date(Date.UTC(w.getUTCFullYear(), w.getUTCMonth(), 1));
        const off = ((first.getUTCDay() || 7) - info.first + 7) % 7;
        const startWeek1 = 7 - off >= info.min ? -off : 7 - off;
        return num(Math.floor((w.getUTCDate() - 1 - startWeek1) / 7) + 1, n);
      }
      case "E":
      case "c":
      case "e":
        if ((c === "e" || c === "c") && n <= 2) return num((w.getUTCDay() - weekInfo(locale).first + 7) % 7 + 1, n);
        return part(locale, { weekday: n >= 4 && !(n === 5 && icu) ? "long" : n === 5 && icu ? "narrow" : "short", day: "numeric", month: "long" }, w, "weekday");
      case "a":
        return part(locale, { hour: "numeric", hour12: true }, w, "dayPeriod") || (h < 12 ? "AM" : "PM");
      case "H":
        return num(h, n);
      case "k":
        return num(h || 24, n);
      case "K":
        return num(h % 12, n);
      case "h":
        return num(h % 12 || 12, n);
      case "m":
        return num(w.getUTCMinutes(), n);
      case "s":
        return num(w.getUTCSeconds(), n);
      case "S": {
        const ms = w.getUTCMilliseconds();
        if (!icu) return num(ms, n);
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
var isJavaFormat = (fmt) => typeof fmt === "string" && (fmt.startsWith("java:") || fmt.startsWith("icu:"));
function formatJava(value, fmt, opt = {}) {
  if (value == null) return "";
  capPattern("Format", fmt);
  const icu = fmt.startsWith("icu:");
  const pat = fmt.slice(icu ? 4 : 5);
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
function javaFormatString(f, args, locale = "en-US", tz) {
  const sy = symbols(locale);
  let next = 0, out = "";
  const re = /%(?:(\d{1,4})\$)?([-#+ 0,(]{0,7})(\d{1,9})?(?:\.(\d{1,9}))?([a-zA-Z%])/g;
  capText("JavaFormat", f.length);
  let last = 0, m;
  const lit = (a, b) => {
    const t = f.slice(a, b);
    if (t.includes("%")) throw new ExprError(`JavaFormat: "${t.slice(t.indexOf("%"), t.indexOf("%") + 12)}…" is not a format specifier`);
    return t;
  };
  while (m = re.exec(f)) {
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
    capText("JavaFormat", out.length + s.length + (f.length - last));
    out += s;
  }
  return out + lit(last, f.length);
}

// src/engine/expr/format.js
var nfCache = /* @__PURE__ */ new Map();
function nf(locale, opts) {
  const key = locale + JSON.stringify(opts);
  let f = nfCache.get(key);
  if (!f) {
    f = new Intl.NumberFormat(locale, { numberingSystem: "latn", ...opts });
    if (nfCache.size >= 500) nfCache.clear();
    nfCache.set(key, f);
  }
  return f;
}
var DAY_MS2 = 864e5;
var zoneFmt = /* @__PURE__ */ new Map();
function offsetAt(t, tz) {
  if (!tz) return -new Date(t).getTimezoneOffset();
  if (tz === "UTC" || tz === "Etc/UTC") return 0;
  let z = zoneFmt.get(tz);
  if (!z) {
    let f = null;
    try {
      f = new Intl.DateTimeFormat("en-US", { timeZone: tz, hourCycle: "h23", year: "numeric", month: "numeric", day: "numeric", hour: "numeric", minute: "numeric", second: "numeric" });
    } catch {
    }
    z = { f, cache: /* @__PURE__ */ new Map() };
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
    let dec = ".", grp = ",";
    try {
      for (const p of new Intl.NumberFormat(l).formatToParts(12345.6)) {
        if (p.type === "decimal") dec = p.value;
        else if (p.type === "group") grp = p.value;
      }
    } catch {
    }
    r = { dec, grp };
    if (sepCache.size >= 200) sepCache.clear();
    sepCache.set(l, r);
  }
  return r;
}
function parseNumber(text, locale) {
  let s = String(text).trim();
  if (s === "") return NaN;
  if (/^[+-]?(\d+\.?\d*|\.\d+)(e[+-]?\d+)?$/i.test(s)) {
    const { dec: dec2, grp: grp2 } = separators(locale);
    if (dec2 === "," && grp2 === "." && /^[+-]?\d{1,3}(\.\d{3})+$/.test(s)) return Number(s.replace(/\./g, ""));
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
  const { dec, grp } = separators(locale);
  const g = grp === " " || grp === " " || grp === " " ? "[   ]" : grp === "." ? "\\." : grp === "'" || grp === "’" ? "['’]" : grp;
  const d = dec === "." ? "\\." : dec;
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
  const f = Math.floor(x), diff = x - f;
  const r = diff > 0.5 || diff === 0.5 && f % 2 !== 0 ? f + 1 : f;
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
function formatValue(value, fmt, opt = {}) {
  if (value == null) return "";
  if (typeof fmt === "string") capPattern("Format", fmt);
  if (isJavaFormat(fmt)) {
    if (typeof value === "string" && /^\d{4}-\d{2}-\d{2}/.test(value)) {
      const d = toDate(value, opt);
      if (d) value = d;
    }
    return formatJava(
      value,
      /** @type {string} */
      fmt,
      opt
    );
  }
  const locale = opt.locale || "en-US";
  if (value instanceof Date) {
    const t = value.getTime();
    if (Number.isNaN(t)) return "";
    const tz = opt.timeZone;
    if (!fmt && toWall(value, tz) % DAY_MS2 !== 0) fmt = `dd MMM yyyy ${standardDate("t", locale)}`;
    if (!opt.fmtMemo) return formatDate(value, fmt || "dd MMM yyyy", locale, tz);
    const memo2 = memoFor(opt.fmtMemo, "i", fmt || "dd MMM yyyy", locale);
    let out = memo2.get(t);
    if (out === void 0) {
      out = formatDate(value, fmt || "dd MMM yyyy", locale, tz);
      memo2.set(t, out);
    }
    return out;
  }
  if (typeof value === "number") {
    if (!Number.isFinite(value)) return opt.nonFinite === "blank" ? "" : opt.nonFinite === "error" ? "#Error" : String(value);
    if (!fmt) return Number.isSafeInteger(value) && !Object.is(value, -0) ? String(value) : general(value, 15, "E", void 0, locale);
    return numberFn(fmt, locale, opt.currency || currencyOf(opt.locale), opt.grouping)(value);
  }
  if (typeof value === "boolean") return value ? "True" : "False";
  if (typeof value === "object") return plainText(value);
  if (typeof value === "string" && fmt && /^\d{4}-\d{2}-\d{2}/.test(value)) {
    const memo2 = opt.fmtMemo && value.length <= 40 ? memoFor(opt.fmtMemo, "s", fmt, locale) : null;
    let out = memo2?.get(value);
    if (out === void 0) {
      const d = toDate(value, opt);
      out = d && /[yMd]/.test(fmt) ? formatDate(d, fmt, locale, opt.timeZone) : value;
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
function memoFor(all, kind, fmt, locale) {
  const key = `${kind}${fmt}${locale}`;
  let memo2 = all.get(key);
  if (!memo2) {
    if (all.size >= 50) all.clear();
    memo2 = /* @__PURE__ */ new Map();
    all.set(key, memo2);
  } else if (memo2.size >= 5e3) memo2.clear();
  return memo2;
}
var numberFns = /* @__PURE__ */ new Map();
function numberFn(fmt, locale, currency2, grouping) {
  const key = `${fmt}${locale}${currency2 ?? ""}${grouping ?? ""}`;
  let fn = numberFns.get(key);
  if (!fn) {
    fn = compileNumber(fmt, locale, currency2, grouping);
    if (key.length <= 128) {
      if (numberFns.size >= 2e3) numberFns.clear();
      numberFns.set(key, fn);
    }
  }
  return fn;
}
var BIDI_MARKS = /[\u200e\u061c]/g;
function compileNumber(fmt, locale, currency2, grouping) {
  const m = /^([CcNnFfPpDdEeXxGgRr])(\d{0,2})$/.exec(fmt);
  if (m) {
    const k = m[1].toUpperCase();
    const d = m[2] === "" ? null : Number(m[2]);
    const useGrouping = grouping === "always" ? "always" : grouping === "never" ? false : "auto";
    const fixed2 = { minimumFractionDigits: d ?? 2, maximumFractionDigits: d ?? 2, signDisplay: "negative", useGrouping };
    switch (k) {
      // ja-JP JPY comes out as the full-width ￥ (U+FFE5), which the bundled fonts lack; .NET ja-JP writes ¥ (U+00A5)
      case "C": {
        const f = nf(locale, currency2 ? { style: "currency", currency: currency2, ...fixed2 } : fixed2);
        return (v) => f.format(v).replace(/\uFFE5/g, "¥");
      }
      case "N": {
        const f = nf(locale, fixed2);
        return (v) => f.format(v).replace(BIDI_MARKS, "");
      }
      // .NET's plain "-" (CLDR ar adds U+200E)
      case "F": {
        const f = nf(locale, { ...fixed2, useGrouping: false });
        return (v) => f.format(v);
      }
      // the locale's decimal sign, no grouping
      case "P": {
        const f = nf(locale, { style: "percent", ...fixed2 });
        return (v) => f.format(v).replace(BIDI_MARKS, "");
      }
      case "D":
        return (value) => {
          const t = Math.trunc(value);
          return (t < 0 ? "-" : "") + String(Math.abs(t)).padStart(d ?? 0, "0");
        };
      case "E": {
        const dec = latinDecimal(locale);
        return (v) => scientific(v, d ?? 6, m[1] === "e" ? "e" : "E", 3).replace(".", dec);
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
  if (/[#0]/.test(fmt)) return (v) => customNumber(v, fmt, locale);
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
  const dec = locale ? latinDecimal(locale) : ".";
  if (x > -5 && x < p) return nf("en-US", { maximumFractionDigits: 20, maximumSignificantDigits: 21, useGrouping: false }).format(Number(`${digits}e${x}`)).replace(".", dec);
  return `${digits.replace(".", dec)}${e}${x < 0 ? "-" : "+"}${String(Math.abs(x)).padStart(2, "0")}`;
}
function sections(fmt) {
  const out = [""];
  for (let i = 0; i < fmt.length; i++) {
    const c = fmt[i];
    if (c === "\\") {
      out[out.length - 1] += fmt.slice(i, i + 2);
      i++;
      continue;
    }
    if (c === '"' || c === "'") {
      const j = fmt.indexOf(c, i + 1);
      const end = j < 0 ? fmt.length : j;
      out[out.length - 1] += fmt.slice(i, end + 1);
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
function customNumber(v, fmt, locale) {
  const secs = sections(fmt);
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
  let f = dtfCache.get(key);
  if (f === void 0) {
    try {
      f = new Intl.DateTimeFormat(locale, { [kind]: style, timeZone: "UTC" });
    } catch {
      f = null;
    }
    if (dtfCache.size >= 500) dtfCache.clear();
    dtfCache.set(key, f);
  }
  return f ? f.format(w) : null;
}
function localPart(locale, opts, w, type) {
  const key = `p|${locale}|${JSON.stringify(opts)}`;
  let f = dtfCache.get(key);
  if (f === void 0) {
    try {
      f = new Intl.DateTimeFormat(locale, { ...opts, timeZone: "UTC" });
    } catch {
      f = null;
    }
    if (dtfCache.size >= 500) dtfCache.clear();
    dtfCache.set(key, f);
  }
  return f ? f.formatToParts(w).find((p) => p.type === type)?.value ?? null : null;
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
function standardDate(fmt, locale) {
  const p = !locale || /^en-US$/i.test(locale) ? US_DATES : localePatterns(locale);
  switch (fmt) {
    case "d":
    case "D":
    case "t":
    case "T":
      return p[fmt];
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
      return INVARIANT[fmt];
    case "O":
      return INVARIANT.o;
  }
  return null;
}
function formatDate(d, fmt, locale, tz) {
  if (fmt.length === 1) {
    const std = standardDate(fmt, locale);
    if (std) return formatDate(d, std, locale, tz);
  }
  if (fmt.length === 2 && fmt[0] === "%") fmt = fmt[1];
  const w = wallDate(d, tz);
  const en = english(locale);
  const name = (kind, style, fallback) => en ? fallback : localName(locale, kind, style, w) ?? fallback;
  const withDay = /(^|[^d])d{1,2}([^d]|$)/.test(fmt.replace(/'[^']*'|"[^"]*"/g, " "));
  const month = (style, fallback) => {
    if (en) return fallback;
    if (withDay) {
      const g = localPart(locale, { day: "numeric", month: style }, w, "month");
      if (g && !/^\d+$/.test(g)) return g;
    }
    return localName(locale, "month", style, w) ?? fallback;
  };
  const p2 = (n) => String(n).padStart(2, "0");
  return fmt.replace(/(y+|M+|d+|H+|h+|m+|s+|f+|F+|t+|z+|\/)|'([^']*)'?|"([^"]*)"?|\\(.?)/g, (tok, run, q1, q2, esc) => {
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
        const f = String(w.getUTCMilliseconds()).padStart(3, "0").padEnd(7, "0").slice(0, Math.min(n, 7));
        return run[0] === "F" ? f.replace(/0+$/, "") : f;
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

export {
  ExprError,
  capText,
  parse,
  javaString,
  jsString,
  javaFormatString,
  validTimeZone,
  toWall,
  fromWall,
  toDate,
  isoDate,
  parseNumber,
  roundHalfAway,
  roundHalfEven,
  currencyOf,
  formatValue,
  plainText,
  english,
  standardDate,
  formatDate
};

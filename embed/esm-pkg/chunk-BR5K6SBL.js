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
function toPt(v, unit) {
  return v * UNITS[unit];
}
function fromPt(pt, unit) {
  return pt / UNITS[unit];
}
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

// src/engine/notices.js
var NO_CJK_FONTS = "Text in Japanese/Chinese/Korean needs the optional CJK fonts: npm i @reportwright/fonts-cjk, then npx reportwright-fonts-cjk (npm); in the app, npm run fonts:cjk";

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
    const req = (url.protocol === "https:" ? https : http).request(url, { method: init.method || "GET", headers, lookup, signal: init.signal }, (res) => {
      const pairs = [];
      for (let i = 0; i < res.rawHeaders.length; i += 2) pairs.push([res.rawHeaders[i], res.rawHeaders[i + 1]]);
      const none = [101, 204, 205, 304].includes(res.statusCode) || (init.method || "GET").toUpperCase() === "HEAD";
      if (none) res.resume();
      const enc = String(res.headers["content-encoding"] || "").trim().toLowerCase();
      let body = res, decoded = false;
      if (!none && enc && enc !== "identity") {
        const zlib = nodeMod("node:zlib");
        const dec = enc === "gzip" || enc === "x-gzip" ? zlib.createGunzip() : enc === "deflate" ? zlib.createInflate() : enc === "br" ? zlib.createBrotliDecompress() : null;
        if (!dec) {
          res.resume();
          return reject(Object.assign(new Error(`the response is encoded as "${enc}", which the data fetch cannot decode`), { status: 415 }));
        }
        body = stream.pipeline(res, dec, () => {
        });
        decoded = true;
      }
      const kept = decoded ? pairs.filter(([k]) => !/^(content-encoding|content-length)$/i.test(k)) : pairs;
      resolve(new Response(none ? null : stream.Readable.toWeb(body), { status: res.statusCode, statusText: res.statusMessage, headers: (
        /** @type {any} */
        kept
      ) }));
    });
    req.on("error", reject);
    req.end(init.body ?? void 0);
  });
}
var CROSS_ORIGIN_KEEP = /* @__PURE__ */ new Set(["accept", "accept-language", "content-type"]);
function redirectRequest(from, to, req, status) {
  if (from.protocol === "https:" && to.protocol !== "https:") throw Object.assign(new Error(`${from.host} redirects from https to http; not followed`), { status: 403 });
  const headers = new Headers(req.headers || {});
  if (to.origin !== from.origin) {
    for (const k of [...headers.keys()]) if (!CROSS_ORIGIN_KEEP.has(k)) headers.delete(k);
  }
  const get = status === 303 || (status === 301 || status === 302) && (req.method || "GET").toUpperCase() !== "GET";
  return get ? { ...req, method: "GET", body: void 0, headers } : { ...req, headers };
}
function guardedFetch(opt, base) {
  const allow = (opt.allowHosts || []).map((h) => String(h).toLowerCase().replace(/^\[|\]$/g, ""));
  const node = !opt.viaBase && inNode();
  return (
    /** @type {any} */
    (async (input, init = {}) => {
      let url = checkUrl(String(input), allow);
      let req = { ...init };
      for (let hop = 0; ; hop++) {
        const trusted = allow.includes(url.hostname.replace(/^\[|\]$/g, "").toLowerCase());
        const res = node ? await nodeRequest(url, req, trusted) : await base(url.href, { ...req, redirect: "manual" });
        if (res.type === "opaqueredirect") throw new Error(`${url.host} redirects; a redirect cannot be checked here (pass your own fetch to render)`);
        const loc = res.status >= 300 && res.status < 400 ? res.headers.get("location") : null;
        if (!loc) return res;
        await res.body?.cancel().catch(() => {
        });
        if (hop >= FETCH_DEFAULTS.hops) throw new Error(`Too many redirects from ${url.host}`);
        const next = checkUrl(new URL(loc, url).href, allow);
        req = redirectRequest(url, next, req, res.status);
        url = next;
      }
    })
  );
}
function boundedFetch(f, opt) {
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
        res = await Promise.race([f(input, { ...init, signal }), stop]);
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
  const S = (
    /** @type {any} */
    AbortSignal
  );
  if (S.any) return S.any(list);
  const c = new AbortController();
  for (const s of list) {
    if (s.aborted) c.abort(s.reason);
    else s.addEventListener("abort", () => c.abort(s.reason), { once: true });
  }
  return c.signal;
}

export {
  guardedFetch,
  boundedFetch,
  redactUrl,
  PAGE_SIZES,
  toPt,
  fromPt,
  normalizePageSize,
  resolvePage,
  normBox,
  NO_CJK_FONTS
};

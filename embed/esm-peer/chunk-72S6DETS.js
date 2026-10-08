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
function drillUrl(base, a) {
  if (!base || !a?.report) return null;
  const q = new URLSearchParams();
  for (const [k, v] of Object.entries(a.params || {})) for (const x of Array.isArray(v) ? v : [v]) q.append(k, x == null ? "" : String(x));
  const s = q.toString();
  return safeUrl(`${String(base).replace(/\/$/, "")}/viewer/${encodeURIComponent(a.report)}${s ? `?${s}` : ""}`);
}
function asciiUrl(href) {
  try {
    return new URL(href).href;
  } catch {
    return encodeURI(href);
  }
}

export {
  safeUrl,
  drillUrl,
  asciiUrl
};

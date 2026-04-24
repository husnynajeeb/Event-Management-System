import axios from "axios";
import http from "node:http";
import https from "node:https";
import { URL } from "node:url";

// RFC 2616 §13.5.1 — hop-by-hop headers must never be forwarded by a proxy.
// Using Set for O(1) lookup (consistent with METHODS_WITH_BODY below).
const HOP_BY_HOP_HEADERS = new Set([
  "connection",
  "keep-alive",
  "transfer-encoding",
  "te",
  "trailer",
  "upgrade",
  "proxy-authorization",
  "proxy-authenticate",
  "host", // Gateway's host — upstream resolves its own
  "content-length", // Axios recalculates after body serialization
  "accept-encoding", // Prevents pre-compressed responses axios cannot decode
]);

// HTTP methods that carry a request body per RFC 7231 §4.3
const METHODS_WITH_BODY = new Set(["POST", "PUT", "PATCH"]);

// Safely joins a base URL and a path, avoiding double slashes
function joinUrl(base, path) {
  const cleanBase = base.replace(/\/+$/, "");
  const cleanPath = path.replace(/^\/+/, "");
  return cleanPath ? `${cleanBase}/${cleanPath}` : cleanBase;
}

// Filters hop-by-hop headers from a raw headers object.
// Applied to BOTH request and response headers per RFC 2616 §13.5.1.
// k.toLowerCase() handles case-insensitive header names per RFC 7230 §3.2.
function sanitizeHeaders(rawHeaders) {
  return Object.fromEntries(
    Object.entries(rawHeaders).filter(
      ([k]) => !HOP_BY_HOP_HEADERS.has(k.toLowerCase()),
    ),
  );
}

/** Request headers we do not forward on raw stream proxy (keep Content-Length for multipart). */
const STREAM_PROXY_REQ_SKIP = new Set([
  "connection",
  "keep-alive",
  "transfer-encoding",
  "te",
  "trailer",
  "upgrade",
  "proxy-authorization",
  "proxy-authenticate",
  "host",
  "accept-encoding",
]);

/** Response headers we do not forward back to the client. */
const STREAM_PROXY_RES_SKIP = new Set([
  "connection",
  "keep-alive",
  "transfer-encoding",
  "trailer",
]);

function shouldStreamRawBody(req) {
  if (!METHODS_WITH_BODY.has(req.method.toUpperCase())) return false;
  const ct = (req.headers["content-type"] || "").toLowerCase();
  return ct.includes("multipart/form-data");
}

/**
 * Pipe the incoming request stream to upstream (for multipart/form-data).
 * express.json() does not consume multipart, so req is still readable.
 */
function proxyRawBodyStream(req, res, targetUrlString) {
  return new Promise((resolve) => {
    let settled = false;
    const finish = () => {
      if (settled) return;
      settled = true;
      resolve();
    };

    let target;
    try {
      target = new URL(targetUrlString);
    } catch {
      if (!res.headersSent) {
        res.status(503).json({ message: "Invalid upstream URL" });
      }
      finish();
      return;
    }

    const isHttps = target.protocol === "https:";
    const lib = isHttps ? https : http;

    /** @type {http.OutgoingHttpHeaders} */
    const outHeaders = {};
    for (const [k, v] of Object.entries(req.headers)) {
      if (v === undefined) continue;
      if (STREAM_PROXY_REQ_SKIP.has(k.toLowerCase())) continue;
      outHeaders[k] = v;
    }
    outHeaders.host = target.host;

    const upstreamReq = lib.request(
      {
        hostname: target.hostname,
        port: target.port || (isHttps ? 443 : 80),
        path: target.pathname + target.search,
        method: req.method,
        headers: outHeaders,
        timeout: 30000,
      },
      (upstreamRes) => {
        console.log(
          `[Gateway] ← ${upstreamRes.statusCode} from ${targetUrlString}`,
        );
        if (!res.headersSent) {
          res.status(upstreamRes.statusCode || 502);
        }
        for (const [k, v] of Object.entries(upstreamRes.headers)) {
          if (v === undefined) continue;
          const lk = k.toLowerCase();
          if (STREAM_PROXY_RES_SKIP.has(lk)) continue;
          if (Array.isArray(v)) {
            for (const item of v) res.appendHeader(k, item);
          } else {
            res.setHeader(k, v);
          }
        }
        upstreamRes.pipe(res);
        upstreamRes.on("end", finish);
        upstreamRes.on("error", (err) => {
          console.error(
            `[Gateway] upstream response error ${targetUrlString}: ${err.message}`,
          );
          finish();
        });
      },
    );

    upstreamReq.on("timeout", () => {
      upstreamReq.destroy();
      if (!res.headersSent) {
        res.status(504).json({ message: "Upstream service timed out" });
      }
      finish();
    });

    upstreamReq.on("error", (err) => {
      console.error(
        `[Gateway] ❌ ${req.method} ${req.originalUrl} → ${targetUrlString} FAILED (stream): ${err.message}`,
      );
      if (!res.headersSent) {
        res.status(503).json({
          message: "Service unavailable (gateway could not reach upstream)",
          error: err.message,
        });
      }
      finish();
    });

    req.on("aborted", () => upstreamReq.destroy());
    req.pipe(upstreamReq);
  });
}

export async function proxyToService(req, res, targetBaseUrl, stripPrefix) {
  try {
    // Strip the gateway's route prefix so the upstream service
    // receives a path it actually understands.
    // stripPrefix is escaped to handle special regex chars (e.g. /api/v1+)
    const strippedPath = stripPrefix
      ? req.originalUrl.replace(
          new RegExp(`^${stripPrefix.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")}`),
          "",
        )
      : req.originalUrl;

    const targetUrl = joinUrl(targetBaseUrl, strippedPath || "/");

    // ✅ Log every incoming request and where it's being forwarded
    console.log(`[Gateway] ${req.method} ${req.originalUrl} → ${targetUrl}`);

    if (shouldStreamRawBody(req)) {
      await proxyRawBodyStream(req, res, targetUrl);
      return;
    }

   const axiosConfig = {
  method: req.method,
  url: targetUrl,
  headers: sanitizeHeaders(req.headers),
  timeout: 30000,
  validateStatus: () => true,
  maxRedirects: 0, // ✅ ADD THIS — don't follow redirects, pass them to browser
};

if (METHODS_WITH_BODY.has(req.method.toUpperCase())) {
  axiosConfig.data = req.body;
}

const response = await axios(axiosConfig);

// ✅ ADD THIS BLOCK — forward 301/302/307/308 straight to the browser
if ([301, 302, 307, 308].includes(response.status)) {
  const location = response.headers["location"];
  if (location) {
    console.log(`[Gateway] ↪ Redirecting browser to ${location}`);
    return res.redirect(response.status, location);
  }
}

    // ✅ Log the upstream response status
    console.log(`[Gateway] ← ${response.status} from ${targetUrl}`);

    // Forward upstream status code
    res.status(response.status);

    // Forward upstream response headers — sanitize again (RFC 2616 §13.5.1)
    Object.entries(response.headers || {}).forEach(([k, v]) => {
      if (!HOP_BY_HOP_HEADERS.has(k.toLowerCase())) {
        res.setHeader(k, v);
      }
    });

    // Forward response body — ?? guards against null/undefined upstream body
    res.send(response.data ?? "");
  } catch (err) {
    const isTimeout = err.code === "ECONNABORTED";
    const isUnreachable = err.code === "ECONNREFUSED";
    const message = isTimeout
      ? "Upstream service timed out"
      : isUnreachable
        ? "Upstream service is unreachable"
        : "Service unavailable (gateway could not reach upstream)";

    // ✅ Log which service failed and why
    console.error(
      `[Gateway] ❌ ${req.method} ${req.originalUrl} → ${targetBaseUrl} FAILED: ${message}`,
    );
    res.status(503).json({ message, error: err.message });
  }
}

/**
 * Vercel serverless proxy for CadPilot CRM API.
 * Mirrors the Vite /api/cadpilot proxy used in local `npm run dev`.
 *
 * Browser:  POST /api/cadpilot/api/integrations/crm/projects
 * Upstream: POST {CADPILOT_URL}/api/integrations/crm/projects
 * Auth:     X-API-Key from CADPILOT_CRM_API_KEY (server env only)
 */
export const config = {
  api: {
    bodyParser: false,
    responseLimit: false,
  },
};

function readRawBody(req) {
  return new Promise((resolve, reject) => {
    const chunks = [];
    req.on("data", (chunk) => chunks.push(chunk));
    req.on("end", () => resolve(Buffer.concat(chunks)));
    req.on("error", reject);
  });
}

export default async function handler(req, res) {
  const base = (process.env.CADPILOT_URL || "").replace(/\/$/, "");
  const apiKey =
    process.env.CADPILOT_CRM_API_KEY || process.env.CADPILOT_API_KEY || "";

  if (!base) {
    res.status(500).json({ detail: "CADPILOT_URL is not configured on Vercel" });
    return;
  }
  if (!apiKey) {
    res
      .status(500)
      .json({ detail: "CADPILOT_CRM_API_KEY is not configured on Vercel" });
    return;
  }

  const parts = req.query.path;
  const suffix = Array.isArray(parts)
    ? parts.join("/")
    : parts
      ? String(parts)
      : "";
  if (!suffix) {
    res.status(400).json({ detail: "Missing CadPilot path" });
    return;
  }

  const qIndex = req.url.indexOf("?");
  const qs = qIndex >= 0 ? req.url.slice(qIndex) : "";
  const target = `${base}/${suffix}${qs}`;

  const headers = { "X-API-Key": apiKey };
  const contentType = req.headers["content-type"];
  if (contentType) headers["Content-Type"] = contentType;

  let body;
  if (req.method !== "GET" && req.method !== "HEAD") {
    body = await readRawBody(req);
  }

  try {
    const upstream = await fetch(target, {
      method: req.method,
      headers,
      body: body && body.length ? body : undefined,
      // CadPilot may be plain http
      redirect: "manual",
    });

    const buf = Buffer.from(await upstream.arrayBuffer());
    const outType = upstream.headers.get("content-type");
    if (outType) res.setHeader("Content-Type", outType);
    const disposition = upstream.headers.get("content-disposition");
    if (disposition) res.setHeader("Content-Disposition", disposition);

    res.status(upstream.status).send(buf);
  } catch (err) {
    res.status(502).json({
      detail: "CadPilot proxy error: " + (err.message || String(err)),
    });
  }
}

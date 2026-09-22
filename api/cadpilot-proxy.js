/**
 * Flat Vercel serverless proxy for CadPilot.
 * Browser calls: /api/cadpilot-proxy?path=/api/integrations/crm/projects
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
  const base = String(process.env.CADPILOT_URL || "").replace(/\/$/, "");
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

  let suffix = req.query.path || "";
  if (Array.isArray(suffix)) suffix = suffix[0] || "";
  suffix = String(suffix);
  if (!suffix.startsWith("/")) suffix = "/" + suffix;
  if (suffix === "/") {
    res.status(400).json({ detail: "Missing path query param" });
    return;
  }

  const target = base + suffix;

  const headers = { "X-API-Key": apiKey };
  if (req.headers["content-type"]) {
    headers["Content-Type"] = req.headers["content-type"];
  }

  let body;
  if (req.method !== "GET" && req.method !== "HEAD") {
    body = await readRawBody(req);
  }

  try {
    const upstream = await fetch(target, {
      method: req.method,
      headers,
      body: body && body.length ? body : undefined,
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
      detail:
        "CadPilot proxy error: " +
        (err && err.message ? err.message : String(err)),
    });
  }
}

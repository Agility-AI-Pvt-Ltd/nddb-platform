const CREATE_PATH =
  import.meta.env.VITE_CADPILOT_CREATE_PATH ||
  "/api/integrations/crm/projects";
const STATUS_PATH =
  import.meta.env.VITE_CADPILOT_STATUS_PATH ||
  "/api/integrations/crm/projects/{id}";
const DXF_PATH =
  import.meta.env.VITE_CADPILOT_DXF_PATH ||
  "/api/integrations/crm/projects/{id}/dxf";
const FILE_A_FIELD =
  import.meta.env.VITE_CADPILOT_FILE_A_FIELD || "mass_balance";
const FILE_B_FIELD =
  import.meta.env.VITE_CADPILOT_FILE_B_FIELD || "design_data";

const PROXY_BASE = "/api/cadpilot";
const CRM_PUBLIC_URL =
  typeof __CRM_PUBLIC_URL__ !== "undefined" ? __CRM_PUBLIC_URL__ : "";
const USE_WEBHOOK =
  typeof __CADPILOT_USE_WEBHOOK__ !== "undefined"
    ? __CADPILOT_USE_WEBHOOK__
    : false;

function joinPath(path) {
  if (!path.startsWith("/")) path = "/" + path;
  return PROXY_BASE + path;
}

async function readBody(res) {
  const text = await res.text();
  if (!text) return null;
  try {
    return JSON.parse(text);
  } catch {
    return { raw: text };
  }
}

function apiError(res, body) {
  const detail = body && body.detail;
  let msg =
    (body && (body.message || body.error)) ||
    res.statusText ||
    "Request failed";
  if (typeof detail === "string") msg = detail;
  else if (Array.isArray(detail)) {
    msg = detail
      .map(
        (d) =>
          (d.loc ? d.loc.join(".") + ": " : "") + (d.msg || JSON.stringify(d)),
      )
      .join("; ");
  } else if (detail && typeof detail === "object") {
    msg = JSON.stringify(detail);
  }
  const err = new Error(typeof msg === "string" ? msg : JSON.stringify(msg));
  err.status = res.status;
  err.body = body;
  return err;
}

/** POST create CRM project → project_id, launch_url, state */
export async function createPidProject({
  externalId,
  name,
  workbookA,
  workbookB,
}) {
  const fd = new FormData();
  fd.append("external_id", externalId);
  fd.append("name", name);
  if (workbookA) fd.append(FILE_A_FIELD, workbookA);
  if (workbookB) fd.append(FILE_B_FIELD, workbookB);

  // CadPilot expects return_url (and optional callback_url) from the CRM
  const returnUrl =
    CRM_PUBLIC_URL ||
    (typeof window !== "undefined" ? window.location.origin : "");
  if (returnUrl) {
    fd.append("return_url", returnUrl);
    if (USE_WEBHOOK) {
      fd.append("callback_url", returnUrl.replace(/\/$/, "") + "/webhooks/cadpilot");
    }
  }

  const res = await fetch(joinPath(CREATE_PATH), { method: "POST", body: fd });
  const body = await readBody(res);
  if (!res.ok) throw apiError(res, body);
  return normalizePid(body, externalId);
}

/** GET status by external_id / record id */
export async function fetchPidStatus(recordId) {
  const path = STATUS_PATH.replace("{id}", encodeURIComponent(recordId));
  const res = await fetch(joinPath(path), { method: "GET" });
  const body = await readBody(res);
  if (!res.ok) throw apiError(res, body);
  return normalizePid(body, recordId);
}

/** Download DXF bytes through the proxy (API key attached) */
export async function fetchPidDxf(recordId) {
  const path = DXF_PATH.replace("{id}", encodeURIComponent(recordId));
  const res = await fetch(joinPath(path), { method: "GET" });
  if (!res.ok) {
    const body = await readBody(res);
    throw apiError(res, body);
  }
  return res.blob();
}

export function normalizePid(raw, fallbackExternalId) {
  if (!raw || typeof raw !== "object") {
    return emptyPid(fallbackExternalId);
  }
  const rev = raw.approved_revision || raw.revision || null;
  const revObj = typeof rev === "object" && rev ? rev : null;
  const state = (raw.state || raw.status || "").toString().toLowerCase() || null;

  const dxf =
    raw.dxf ||
    (revObj && (revObj.dxf || { url: revObj.dxf_url })) ||
    null;

  return {
    external_id:
      raw.external_id || raw.externalId || fallbackExternalId || null,
    project_id: raw.project_id || raw.projectId || raw.id || null,
    name: raw.name || null,
    state,
    launch_url: raw.launch_url || raw.launchUrl || null,
    revision:
      (revObj && (revObj.revision || revObj.label)) ||
      (typeof rev === "string" ? rev : null) ||
      raw.revision ||
      null,
    approved_by: raw.approved_by || (revObj && revObj.approved_by) || null,
    approved_at: raw.approved_at || (revObj && revObj.approved_at) || null,
    svg_url:
      raw.svg_url ||
      (revObj && (revObj.svg_url || revObj.svg)) ||
      null,
    dxf_url:
      (dxf && (dxf.url || dxf.dxf_url)) ||
      raw.dxf_url ||
      (revObj && revObj.dxf_url) ||
      null,
    dxf_filename: (dxf && dxf.filename) || raw.dxf_filename || null,
    dxf_base64: (dxf && dxf.content_base64) || raw.dxf_base64 || null,
    raw,
  };
}

function emptyPid(externalId) {
  return {
    external_id: externalId || null,
    project_id: null,
    name: null,
    state: null,
    launch_url: null,
    revision: null,
    approved_by: null,
    approved_at: null,
    svg_url: null,
    dxf_url: null,
    dxf_filename: null,
    dxf_base64: null,
    raw: null,
  };
}

export function newExternalId(prefix = "PID") {
  if (typeof crypto !== "undefined" && crypto.randomUUID) {
    return prefix + "-" + crypto.randomUUID().slice(0, 8).toUpperCase();
  }
  return prefix + "-" + Date.now().toString(36).toUpperCase();
}

export function downloadBlob(blob, filename) {
  const a = document.createElement("a");
  const href = URL.createObjectURL(blob);
  a.href = href;
  a.download = filename || "drawing.dxf";
  a.click();
  URL.revokeObjectURL(href);
}

export function downloadBase64(b64, filename, mime) {
  const bin = atob(String(b64).replace(/\s/g, ""));
  const bytes = new Uint8Array(bin.length);
  for (let i = 0; i < bin.length; i++) bytes[i] = bin.charCodeAt(i);
  downloadBlob(new Blob([bytes], { type: mime || "application/dxf" }), filename);
}

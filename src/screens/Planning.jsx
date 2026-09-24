import { useState, useEffect, useCallback } from "react";
import { useStore } from "../store.js";
import { sel } from "../selectors.js";
import { Card, Status, Bar, Panel } from "../ui.jsx";
import {
  createPidProject,
  fetchPidStatus,
  fetchPidDxf,
  newExternalId,
  downloadBlob,
  downloadBase64,
  proxyCadpilotAssetUrl,
} from "../cadpilotApi.js";

/* ============================================================
   04 · PLANNING AND DESIGN + 05 · GATE APPROVAL PANEL
   ============================================================ */
export function PlanningTab({ go, params }) {
  const { s, d, toast } = useStore();
  const [focus, setFocus] = useState(params.focus || "M3");
  const [gate, setGate] = useState(!!params.openGate);
  useEffect(() => {
    if (params.openGate) setGate(true);
    if (params.focus) setFocus(params.focus);
  }, [params.openGate, params.focus]);
  const m3 = s.milestones.find((m) => m.id === "M3");

  return (
    <>
      <div className="two">
        <div className="stack">
          {s.milestones.map((m, idx) => {
            const c = sel.deliv(s, m.id),
              open = focus === m.id;
            const prev = idx > 0 ? s.milestones[idx - 1] : null;
            const prevOk = !prev || prev.status === "Approved";
            return (
              <section
                key={m.id}
                className={"card " + (m.gate ? "gate-rule" : "")}
              >
                <button
                  className="clickable"
                  onClick={() => setFocus(open ? null : m.id)}
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: 10,
                    padding: "11px 14px",
                  }}
                  aria-expanded={open}
                >
                  <span
                    style={{
                      fontSize: 13,
                      fontWeight: 500,
                      flex: 1,
                      minWidth: 0,
                    }}
                  >
                    {m.code} {m.title}
                    {m.gate && <span className="mut"> (gate)</span>}
                  </span>
                  <Status s={m.status} />
                  <span className="tiny mut" style={{ whiteSpace: "nowrap" }}>
                    Target {m.target} · {c.done} of {c.total}
                  </span>
                </button>
                {open && (
                  <div
                    style={{
                      borderTop: "1px solid var(--rule)",
                      padding: "12px 14px",
                    }}
                  >
                    <h4
                      style={{
                        margin: "0 0 8px",
                        fontSize: 11,
                        color: "var(--mut)",
                      }}
                    >
                      Deliverables
                    </h4>
                    {c.list.map((dv) => (
                      <div
                        className="row"
                        key={dv.id}
                        style={{
                          padding: "7px 0",
                          borderBottom: "1px solid var(--rule)",
                          flexWrap: "wrap",
                        }}
                      >
                        <div style={{ flex: 1, minWidth: 160 }}>
                          <div style={{ fontSize: 13 }}>{dv.name}</div>
                          <div className="s tiny mut">
                            {dv.note || dv.owner}
                          </div>
                        </div>
                        <Status s={dv.status} />
                        {dv.status !== "Approved" && (
                          <button
                            className="btn sm"
                            onClick={() => {
                              const completes =
                                !m.gate &&
                                c.list.every(
                                  (item) =>
                                    item.id === dv.id ||
                                    item.status === "Approved",
                                );
                              d({
                                type: "DELIV",
                                mid: m.id,
                                did: dv.id,
                                status: "Approved",
                              });
                              toast(
                                completes
                                  ? m.code + " approved — all deliverables are in"
                                  : dv.name + " approved",
                              );
                            }}
                          >
                            Approve
                          </button>
                        )}
                        {dv.status === "Approved" && (
                          <button
                            className="btn sm danger"
                            onClick={() => {
                              d({
                                type: "DELIV",
                                mid: m.id,
                                did: dv.id,
                                status: "Returned",
                                remarks: "revise and resubmit",
                              });
                              toast(dv.name + " returned");
                            }}
                          >
                            Return
                          </button>
                        )}
                      </div>
                    ))}
                    <div
                      className="row"
                      style={{ marginTop: 11, flexWrap: "wrap", gap: 8 }}
                    >
                      <Bar
                        pct={
                          c.total ? Math.round((c.done / c.total) * 100) : 0
                        }
                      />
                      <span className="tiny mut num">
                        {c.total ? Math.round((c.done / c.total) * 100) : 0}%
                      </span>
                      {m.gate && m.status !== "Approved" && (
                        <button
                          className="btn pri sm"
                          onClick={() => {
                            if (!prevOk) {
                              toast(
                                "Gate " +
                                  m.gateNo +
                                  " opens once " +
                                  prev.code +
                                  " is approved",
                              );
                              return;
                            }
                            if (m.id === "M3") {
                              setGate(true);
                              return;
                            }
                            const left = sel.blockingDeliv(s, m.id);
                            if (left.length) {
                              toast(
                                "Approve deliverables first: " +
                                  left.map((b) => b.name).join(", "),
                              );
                              return;
                            }
                            d({
                              type: "MSTATUS",
                              mid: m.id,
                              status: "Approved",
                            });
                            toast(m.code + " " + m.title + " approved");
                          }}
                        >
                          Submit gate
                        </button>
                      )}
                      {m.gate && m.status === "Approved" && (
                        <span className="pill g">
                          <i className="dot" />
                          Deliverables frozen
                        </span>
                      )}
                    </div>
                    {m.gate && m.status !== "Approved" && !prevOk && (
                      <p className="print-note">
                        Submit opens once {prev.code} is approved.
                      </p>
                    )}
                    {m.status === "Approved" && (
                      <p className="print-note">
                        Approved milestones freeze their deliverables. Later
                        edits need a change request.
                      </p>
                    )}
                    {m.returnRemarks && (
                      <p
                        className="print-note"
                        style={{ color: "var(--r)" }}
                      >
                        Returned: {m.returnRemarks}
                      </p>
                    )}
                    {m.id === "M2" && (
                      <p className="print-note" style={{ marginTop: 10 }}>
                        P&ID design is handled in <b>Design · CadPilot P&ID</b>{" "}
                        on the right. Gate 3 needs CadPilot <em>approved</em>.
                      </p>
                    )}
                  </div>
                )}
              </section>
            );
          })}
          <p className="print-note">
            Design P&ID runs through CadPilot under M2 · Basic engineering. Gate
            3 stays blocked until CadPilot state is <em>approved</em>.
          </p>
        </div>

        <div className="stack">
          <CadPilotDesignPanel />
          <Card
            title="Gate 3 approval chain"
            sub={m3.status === "Approved" ? "Complete" : "In progress"}
            pad={false}
          >
            {s.gate3chain.map((c) => (
              <div className="lrow" key={c.step}>
                <div style={{ flex: 1 }}>
                  <div className="t">{c.step}</div>
                  <div className="s">{c.who}</div>
                </div>
                <span
                  className={
                    "pill " +
                    (c.state.startsWith("Done")
                      ? "g"
                      : c.state === "Pending"
                        ? "a"
                        : c.state.startsWith("Returned")
                          ? "r"
                          : "n")
                  }
                >
                  {c.state}
                </span>
              </div>
            ))}
            <div
              className="card-b"
              style={{ borderTop: "1px solid var(--rule)" }}
            >
              <button
                className="btn pri sm"
                disabled={m3.status === "Approved"}
                onClick={() => setGate(true)}
              >
                Open gate 3 approval
              </button>
            </div>
          </Card>
          <Card
            title="Blocked by this gate"
            sub={
              m3.status === "Approved"
                ? "Cleared"
                : s.gate3blocks.length + " items"
            }
            pad={false}
          >
            {s.gate3blocks.map((b) => (
              <div className="lrow" key={b}>
                <div style={{ flex: 1 }} className="t">
                  {b}
                </div>
                <span
                  className={"pill " + (m3.status === "Approved" ? "g" : "r")}
                >
                  {m3.status === "Approved" ? "Released" : "Held"}
                </span>
              </div>
            ))}
            <div className="card-b">
              <p className="print-note" style={{ margin: 0 }}>
                Showing what a pending approval is holding up is what makes
                approvals move.
              </p>
            </div>
          </Card>
        </div>
      </div>
      {gate && <GatePanel onClose={() => setGate(false)} go={go} />}
    </>
  );
}

function CadPilotDesignPanel() {
  const { s, d, toast } = useStore();
  const pid = s.pid;
  const [name, setName] = useState(pid?.name || "");
  const [fileA, setFileA] = useState(null);
  const [fileB, setFileB] = useState(null);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState(null);

  const persist = useCallback(
    (next) => {
      d({ type: "PID_UPSERT", pid: next });
    },
    [d],
  );

  const refreshStatus = useCallback(async () => {
    const id = s.pid?.external_id;
    if (!id) return;
    try {
      const next = await fetchPidStatus(id);
      persist({ ...s.pid, ...next });
      setError(null);
    } catch (e) {
      setError(e.message || String(e));
    }
  }, [s.pid, persist]);

  useEffect(() => {
    if (!s.pid?.external_id) return;
    refreshStatus();
    const onVis = () => {
      if (document.visibilityState === "visible") refreshStatus();
    };
    document.addEventListener("visibilitychange", onVis);
    return () => document.removeEventListener("visibilitychange", onVis);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [s.pid?.external_id]);

  const state = (pid?.state || "").toLowerCase();
  const hasProject = !!(pid && pid.external_id && (state || pid.launch_url));

  const onSend = async (e) => {
    e.preventDefault();
    setError(null);
    if (!name.trim() || !fileA || !fileB) {
      setError("Name, mass balance, and design data workbooks are required.");
      return;
    }
    setBusy(true);
    try {
      const externalId = pid?.external_id || newExternalId("PID");
      const created = await createPidProject({
        externalId,
        name: name.trim(),
        workbookA: fileA,
        workbookB: fileB,
      });
      persist({ ...created, name: name.trim(), external_id: externalId });
      toast("Sent to CadPilot — open the draft to generate and approve");
    } catch (err) {
      setError(err.message || String(err));
    } finally {
      setBusy(false);
    }
  };

  const openCadPilot = () => {
    if (!pid?.launch_url) return;
    // Same tab so CadPilot "Back to CRM" returns here instead of opening another tab
    window.location.assign(pid.launch_url);
  };

  const onDownloadDxf = async () => {
    try {
      if (pid?.dxf_base64) {
        downloadBase64(
          pid.dxf_base64,
          pid.dxf_filename || (pid.name || "drawing") + ".dxf",
        );
        return;
      }
      if (pid?.dxf_url) {
        const res = await fetch(proxyCadpilotAssetUrl(pid.dxf_url));
        if (!res.ok) throw new Error("DXF download failed (" + res.status + ")");
        downloadBlob(
          await res.blob(),
          pid.dxf_filename || (pid.name || "drawing") + ".dxf",
        );
        return;
      }
      const id = pid?.external_id;
      if (!id) throw new Error("No CadPilot project id");
      const blob = await fetchPidDxf(id);
      downloadBlob(
        blob,
        pid.dxf_filename || (pid.name || "drawing") + ".dxf",
      );
    } catch (e) {
      setError(e.message || String(e));
    }
  };

  const statusLabel = !hasProject
    ? "Not started"
    : state === "approved"
      ? "Approved"
      : state === "in_review"
        ? "In review"
        : state === "draft_pending"
          ? "In progress"
          : "Submitted";

  const body = (
    <>
      {!hasProject && (
        <form onSubmit={onSend}>
          <div className="sect">
            <h4>P&ID name</h4>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="e.g. Process utilities P&ID"
              disabled={busy}
            />
          </div>
          <div className="sect">
            <h4>Mass balance (.xlsx)</h4>
            <input
              type="file"
              accept=".xlsx,application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
              onChange={(e) => setFileA(e.target.files?.[0] || null)}
              disabled={busy}
            />
          </div>
          <div className="sect">
            <h4>Design data (.xlsx)</h4>
            <input
              type="file"
              accept=".xlsx,application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
              onChange={(e) => setFileB(e.target.files?.[0] || null)}
              disabled={busy}
            />
          </div>
          <button
            className="btn pri"
            type="submit"
            disabled={busy || !name.trim() || !fileA || !fileB}
          >
            {busy ? "Sending…" : "Send to CadPilot"}
          </button>
        </form>
      )}

      {hasProject && state === "draft_pending" && (
        <div>
          <p style={{ margin: "0 0 10px" }}>
            Waiting for the engineer to generate the draft in CadPilot.
          </p>
          <div className="row" style={{ gap: 8, flexWrap: "wrap" }}>
            <button className="btn pri" type="button" onClick={openCadPilot}>
              Open in CadPilot
            </button>
            <button className="btn" type="button" onClick={refreshStatus}>
              Refresh status
            </button>
          </div>
        </div>
      )}

      {hasProject && state === "in_review" && (
        <div>
          <p style={{ margin: "0 0 10px" }}>
            Draft{pid.revision ? ` rev ${pid.revision}` : ""} in review.
          </p>
          <div className="row" style={{ gap: 8, flexWrap: "wrap" }}>
            <button
              className="btn pri"
              type="button"
              disabled={!pid.launch_url}
              onClick={openCadPilot}
            >
              Continue in CadPilot
            </button>
            <button className="btn" type="button" onClick={refreshStatus}>
              Refresh status
            </button>
          </div>
        </div>
      )}

      {hasProject && state === "approved" && (
        <div>
          <p className="small mut" style={{ margin: "0 0 10px" }}>
            Approved
            {pid.revision ? ` rev ${pid.revision}` : ""}
            {pid.approved_by ? ` by ${pid.approved_by}` : ""}
            {pid.approved_at ? ` on ${pid.approved_at}` : ""}
          </p>
          {pid.svg_url ? (
            <img
              className="cadpilot-preview-img"
              src={proxyCadpilotAssetUrl(pid.svg_url)}
              alt="Approved P&ID"
            />
          ) : (
            <div className="empty">No SVG preview URL yet.</div>
          )}
          <div
            className="row"
            style={{ gap: 8, marginTop: 12, flexWrap: "wrap" }}
          >
            <button className="btn pri" type="button" onClick={onDownloadDxf}>
              Download DXF
            </button>
            <button className="btn" type="button" onClick={refreshStatus}>
              Refresh status
            </button>
          </div>
        </div>
      )}

      {hasProject &&
        state &&
        !["draft_pending", "in_review", "approved"].includes(state) && (
          <div>
            <p style={{ margin: "0 0 10px" }}>State: {state}</p>
            <div className="row" style={{ gap: 8, flexWrap: "wrap" }}>
              {pid.launch_url && (
                <button
                  className="btn pri"
                  type="button"
                  onClick={openCadPilot}
                >
                  Open in CadPilot
                </button>
              )}
              <button className="btn" type="button" onClick={refreshStatus}>
                Refresh status
              </button>
            </div>
          </div>
        )}

      {hasProject && !state && pid.launch_url && (
        <div>
          <div className="row" style={{ gap: 8, flexWrap: "wrap" }}>
            <button className="btn pri" type="button" onClick={openCadPilot}>
              Open in CadPilot
            </button>
            <button className="btn" type="button" onClick={refreshStatus}>
              Refresh status
            </button>
          </div>
        </div>
      )}

      {error && (
        <div
          className="dashbox"
          style={{
            marginTop: 12,
            color: "var(--r)",
            borderColor: "var(--r)",
          }}
        >
          {error}
        </div>
      )}

      {hasProject && (
        <button
          className="btn sm"
          type="button"
          style={{ marginTop: 12 }}
          onClick={() => {
            d({ type: "PID_CLEAR" });
            setName("");
            setFileA(null);
            setFileB(null);
            setError(null);
          }}
        >
          Start over
        </button>
      )}
    </>
  );

  return (
    <Card
      title="Design · CadPilot P&ID"
      sub={
        hasProject
          ? (pid.external_id || "") +
            (pid.revision ? " · rev " + pid.revision : "")
          : "Name + mass_balance + design_data"
      }
      right={<Status s={statusLabel} />}
    >
      {body}
    </Card>
  );
}

export function GatePanel({ onClose, go }) {
  const { s, d, toast } = useStore();
  const m3 = s.milestones.find((m) => m.id === "M3");
  const list = sel.gateReady(s);
  const missing = list.filter((c) => !c.on);
  const [decision, setDecision] = useState("Approve");
  const [remarks, setRemarks] = useState("");
  const blockers = sel.blockingDeliv(s, "M3");
  const needRemarks = decision !== "Approve" && remarks.trim().length < 4;
  const canApprove =
    decision === "Approve" ? missing.length === 0 : !needRemarks;

  const submit = () => {
    if (decision === "Approve") {
      d({ type: "GATE_APPROVE", mid: "M3" });
      toast(
        "Gate 3 approved — BOQ frozen, T-118 unblocked, Rs 42 cr released",
      );
    } else if (decision === "Return with comments") {
      d({ type: "GATE_RETURN", mid: "M3", remarks });
      toast("Returned to the preparer with remarks");
    } else {
      d({ type: "GATE_REJECT", mid: "M3", remarks });
      toast("Gate 3 rejected");
    }
    onClose();
  };

  return (
    <Panel
      title="Approve gate 3"
      sub="Detailed estimate and BOQ  ·  APDDC dairy"
      onClose={onClose}
      footer={
        <>
          <button
            className="btn pri"
            disabled={!canApprove}
            onClick={submit}
          >
            {decision === "Approve" ? "Approve gate" : decision}
          </button>
          <button className="btn" onClick={onClose}>
            Cancel
          </button>
          <span className="spacer" />
          {decision === "Approve" && missing.length > 0 && (
            <span
              className="tiny"
              style={{ color: "var(--r)", textAlign: "right" }}
            >
              Blocked by: {missing[0].label}
            </span>
          )}
          {needRemarks && (
            <span className="tiny" style={{ color: "var(--r)" }}>
              Remarks required
            </span>
          )}
        </>
      }
    >
      <div className="sect">
        <h4>Checklist</h4>
        {list.map((c) => {
          const locked = !!c.auto;
          return (
            <label
              key={c.id}
              className={"chk " + (locked ? "locked " : "") + (c.on ? "on" : "")}
            >
              <input
                type="checkbox"
                checked={c.on}
                disabled={locked}
                onChange={(e) =>
                  d({ type: "CHECK", id: c.id, on: e.target.checked })
                }
              />
              <span style={{ flex: 1 }}>
                {c.label}
                {locked && (
                  <span
                    className="tiny mut"
                    style={{ display: "block" }}
                  >
                    {c.auto === "deliverables"
                      ? c.on
                        ? "All deliverables approved"
                        : `${blockers.length} not approved: ${blockers.map((b) => b.name).join(", ")}`
                      : c.auto === "cadpilot"
                        ? c.on
                          ? "CadPilot returned approved"
                          : "Send workbooks, generate in CadPilot, then Approve there"
                        : "Rs 199.6 cr of Rs 214.6 cr sanctioned"}
                  </span>
                )}
              </span>
              {c.on ? (
                <span className="pill g">met</span>
              ) : (
                <span className="pill r">open</span>
              )}
            </label>
          );
        })}
      </div>

      <div className="sect">
        <h4>Estimate vs sanction</h4>
        <div
          className="row"
          style={{ justifyContent: "space-between", marginBottom: 6 }}
        >
          <span className="num" style={{ fontSize: 16, fontWeight: 600 }}>
            Rs 199.6 cr
          </span>
          <span className="small mut">of Rs 214.6 cr</span>
        </div>
        <Bar pct={(199.6 / 214.6) * 100} />
      </div>

      <div className="sect">
        <h4>Decision</h4>
        <div className="seg">
          {["Approve", "Return with comments", "Reject"].map((o) => (
            <button
              key={o}
              aria-pressed={decision === o}
              onClick={() => setDecision(o)}
            >
              {o}
            </button>
          ))}
        </div>
        <textarea
          style={{ marginTop: 9 }}
          value={remarks}
          onChange={(e) => setRemarks(e.target.value)}
          placeholder={
            decision === "Approve"
              ? "Remarks (optional)"
              : "Remarks (required) — state exactly what to fix"
          }
        />
      </div>

      <div className="sect">
        <h4>This approval will</h4>
        {s.gate3consequences.map((c) => (
          <div className="kv" key={c}>
            <span>— {c}</span>
          </div>
        ))}
      </div>
    </Panel>
  );
}

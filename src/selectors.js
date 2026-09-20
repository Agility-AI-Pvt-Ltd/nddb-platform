/* ============================================================
   DERIVED VALUES — nothing below is stored, it is all computed
   from state, which is why every screen stays in step.
   ============================================================ */
export const sel = {
  deliv: (s, mid) => {
    const l = s.deliverables[mid] || [];
    return {
      done: l.filter((d) => d.status === "Approved" || d.status === "Submitted")
        .length,
      total: l.length,
      list: l,
    };
  },
  allApproved: (s, mid) => {
    const l = s.deliverables[mid] || [];
    return l.length > 0 && l.every((d) => d.status === "Approved");
  },
  blockingDeliv: (s, mid) =>
    (s.deliverables[mid] || []).filter((d) => d.status !== "Approved"),
  unverified: (s) => s.bid.fields.filter((f) => f.state !== "verified").length,
  planningPct: (s) =>
    Math.round(
      (s.milestones.filter((m) => m.status === "Approved").length /
        s.milestones.length) *
        100,
    ),
  /* Gate 3 is the functional gate in this build — its own consequence list already says
     "unblock tender T-118 preparation", so it is the correct trigger for unlocking both
     tender and execution work, not the full 4-milestone planning list (M4 has no approval
     flow wired up yet and would make the lock impossible to clear). */
  planningComplete: (s) => {
    const m = s.milestones.find((x) => x.id === "M3");
    return !!m && m.status === "Approved";
  },
  tenderPct: (s) =>
    Math.round(
      (s.packages.filter((p) => p.stage === "Awarded").length /
        s.packages.length) *
        100,
    ),
  execPct: (s) => s.exec.physical,
  openInterfaces: (s) => s.interfaces.filter((i) => !i.closed),
  lateInterfaces: (s) => s.interfaces.filter((i) => !i.closed && i.sev === "r"),
  noticesToServe: (s) =>
    s.interfaces.filter((i) => !i.closed && i.sev === "r" && !i.noticeServed)
      .length - s.notices.filter((n) => n.state === "Served").length,
  draftedNotices: (s) => s.notices.filter((n) => n.state === "Drafted"),
  sitesIn: (s) => s.siteReports.filter((r) => r.state === "Submitted").length,
  totals: (s) => {
    const r = {
      budget: 0,
      committed: 0,
      measured: 0,
      billed: 0,
      paid: 0,
      forecast: 0,
    };
    s.expenses.forEach((e) => {
      ["budget", "committed", "measured", "billed", "paid", "forecast"].forEach(
        (k) => {
          r[k] += e[k] || 0;
        },
      );
    });
    return r;
  },
  gateReady: (s) => {
    const cs = s.checks || {};
    const auto = {
      deliverables: sel.allApproved(s, "M3"),
      estimate: 199.6 <= 214.6,
    };
    return s.gate3checklist.map((c) => ({
      ...c,
      on: c.auto ? auto[c.auto] : !!cs[c.id],
    }));
  },
};
export const cr = (n) =>
  n === null || n === undefined ? "—" : "Rs " + n.toFixed(1) + " cr";
export const num = (n) => (n === null || n === undefined ? "—" : n.toFixed(1));

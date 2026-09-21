import { seed, blankPortfolioProject } from "./data.js";

const wf = () => seed();

/** Scenarios you can layer onto a fresh demo (figures from the wireframe). */
export const DEMO_EXAMPLES = [
  {
    key: "gate3-review",
    label: "Gate 3 in review",
    blurb: "M1–M2 approved, M3 deliverables and approval chain as in the wireframe. Tender and execution stay locked.",
  },
  {
    key: "gate3-approved",
    label: "Gate 3 approved",
    blurb: "Clears the gate so tender and execution tabs unlock; keeps planning data from the wireframe.",
  },
  {
    key: "tender-pipeline",
    label: "Tender pipeline & bid",
    blurb: "Packages, calendar, vendors, and T-114 bid verification (loads Gate 3 approved if needed).",
  },
  {
    key: "execution",
    label: "Execution snapshot",
    blurb: "Schedule, interfaces, billing, hindrances, and site reports (loads Gate 3 approved if needed).",
  },
  {
    key: "inbox",
    label: "My actions inbox",
    blurb: "All six wireframe action rows so you can walk every deep link.",
  },
  {
    key: "portfolio-peers",
    label: "Portfolio peers",
    blurb: "Adds the other three portfolio projects for list and timeline views.",
  },
  {
    key: "append-project",
    label: "Add example project (end of list)",
    blurb: "Appends one more blank greenfield row to the portfolio — same shape as a newly registered project.",
  },
  {
    key: "project-home",
    label: "Project home activity",
    blurb: "Waiting approvals, week changes, documents, and BOQ record.",
  },
];

function mergeActions(existing, add) {
  const ids = new Set(existing.map((a) => a.id));
  return [...existing, ...add.filter((a) => !ids.has(a.id))];
}

function withWireframePlanning(state) {
  const w = wf();
  return {
    ...state,
    milestones: w.milestones,
    deliverables: w.deliverables,
    gate3chain: w.gate3chain,
    gate3blocks: w.gate3blocks,
    gate3consequences: w.gate3consequences,
    gate3checklist: w.gate3checklist,
  };
}

function ensureGate3Approved(state) {
  const w = wf();
  let t = withWireframePlanning(state);
  const ms = t.milestones.map((m) =>
    m.id === "M3" ? { ...m, status: "Approved", frozen: true } : m,
  );
  const ch = t.gate3chain.map((c) =>
    c.state === "Pending" || c.state === "Waiting"
      ? { ...c, state: "Done (example)" }
      : c,
  );
  const pk = w.packages.map((p) =>
    p.blockedByGate === 3
      ? { ...p, blockedByGate: null, waiting: "Cleared by gate 3" }
      : p,
  );
  return {
    ...t,
    milestones: ms,
    gate3chain: ch,
    packages: pk,
    gateApproved: { ...(t.gateApproved || {}), 3: true },
  };
}

function syncPrimaryProject(state, fromProject) {
  if (!state.projects?.length || !fromProject) return state;
  const cur = state.projects[0];
  const merged = {
    ...cur,
    phase: fromProject.phase,
    portfolioPhase: fromProject.portfolioPhase,
    current: fromProject.current,
    time: fromProject.time,
    cost: fromProject.cost,
    claims: fromProject.claims,
    capacity: fromProject.capacity,
    sanctioned: fromProject.sanctioned,
    committed: fromProject.committed,
    billed: fromProject.billed,
    paid: fromProject.paid,
    measured: fromProject.measured,
    forecastCost: fromProject.forecastCost,
    start: fromProject.start,
    handover: fromProject.handover,
    forecast: fromProject.forecast,
    packages: fromProject.packages,
    milestonesDone: fromProject.milestonesDone,
    milestonesTotal: fromProject.milestonesTotal,
  };
  return { ...state, projects: [merged, ...state.projects.slice(1)] };
}

export function applyExample(state, key) {
  const w = wf();
  const p1 = w.projects[0];
  switch (key) {
    case "gate3-review":
      return syncPrimaryProject(
        {
          ...withWireframePlanning(state),
          checks: { ...(state.checks || {}) },
          actions: mergeActions(state.actions, w.actions.filter((a) => a.go === "gate3")),
        },
        p1,
      );
    case "gate3-approved":
      return syncPrimaryProject(ensureGate3Approved(state), {
        ...p1,
        portfolioPhase: "Tender",
        current: "Gate 3 cleared — tender ready",
      });
    case "tender-pipeline": {
      let t = ensureGate3Approved(state);
      t = syncPrimaryProject(t, p1);
      return {
        ...t,
        stages: w.stages,
        packages: w.packages,
        pkgMilestones: w.pkgMilestones,
        tenderCalendar: w.tenderCalendar,
        vendors: w.vendors,
        bid: w.bid,
        actions: mergeActions(t.actions, w.actions.filter((a) => a.go === "bid")),
        documents: w.documents,
      };
    }
    case "execution": {
      let t = ensureGate3Approved(state);
      t = syncPrimaryProject(t, { ...p1, phase: "Execution", portfolioPhase: "Execution" });
      return {
        ...t,
        exec: w.exec,
        schedule: w.schedule,
        interfaces: w.interfaces,
        siteReports: w.siteReports,
        bills: w.bills,
        hindrances: w.hindrances,
        expenses: w.expenses,
        split: w.split,
        cashflow: w.cashflow,
        nextMilestones: w.nextMilestones,
        notices: w.notices,
        queued: w.queued,
        actions: mergeActions(t.actions, w.actions.filter((a) =>
          ["notice", "execution", "rfi", "site"].includes(a.go),
        )),
      };
    }
    case "inbox":
      return { ...state, actions: w.actions };
    case "portfolio-peers":
      return {
        ...state,
        projects: [state.projects[0], ...w.projects.slice(1)],
      };
    case "append-project": {
      const index = state.projects.length + 1;
      return {
        ...state,
        projects: [...state.projects, blankPortfolioProject(index)],
      };
    }
    case "project-home":
      return syncPrimaryProject(
        {
          ...state,
          approvalsWaiting: w.approvalsWaiting,
          changesThisWeek: w.changesThisWeek,
          weekChanges: w.weekChanges,
          documents: w.documents,
          record: w.record,
          history: w.history,
        },
        p1,
      );
    default:
      return state;
  }
}

export function exampleLabel(key) {
  return DEMO_EXAMPLES.find((e) => e.key === key)?.label || key;
}

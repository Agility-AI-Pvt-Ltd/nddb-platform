import { useState, useEffect, useReducer, useRef } from "react";
import { reducer, load, Ctx, useStore, KEY } from "./store.js";
import { exampleLabel } from "./demoExamples.js";
import { sel } from "./selectors.js";
import { Crumb, Card } from "./ui.jsx";
import { MyActions } from "./screens/MyActions.jsx";
import { Portfolio } from "./screens/Portfolio.jsx";
import {
  ProjectHeader,
  MilestoneRail,
  Anchors,
  ProjectHome,
  TABS,
  TABKEY,
} from "./screens/ProjectShell.jsx";
import { PlanningTab } from "./screens/Planning.jsx";
import { TenderTab } from "./screens/Tender.jsx";
import { BidVerify } from "./screens/Bid.jsx";
import { ExecutionTab } from "./screens/Execution.jsx";
import { ExpensesTab } from "./screens/Expenses.jsx";
import { TimelineTab, DocumentsTab, ChangesTab } from "./screens/Misc.jsx";
import { RecordScreen } from "./screens/Record.jsx";
import { SiteCapture } from "./screens/Site.jsx";
import { VendorsScreen, ReportsScreen, AdminScreen } from "./screens/Other.jsx";

const NAV = [
  ["My actions", "actions"],
  ["Portfolio", "portfolio"],
  ["Project", "project"],
  ["Vendors", "vendors"],
  ["Reports", "reports"],
  ["Admin", "admin"],
];

export function App() {
  const [s, d] = useReducer(reducer, null, load);
  const [msg, setMsg] = useState(null);
  const [route, setRoute] = useState({ screen: "actions", params: {} });
  const [q, setQ] = useState("");
  const timer = useRef(null);

  useEffect(() => {
    try {
      localStorage.setItem(KEY, JSON.stringify(s));
    } catch (e) {}
  }, [s]);
  useEffect(() => {
    window.scrollTo({ top: 0, behavior: "instant" });
  }, [route.screen, route.params.tab]);

  const toast = (t) => {
    setMsg(t);
    clearTimeout(timer.current);
    timer.current = setTimeout(() => setMsg(null), 3200);
  };
  const LOCKED_TABS = { tender: 1, execution: 1 };
  const redirectLockedToGate = () => {
    toast(
      "Locked until Gate 3, planning and design, is approved — taking you there instead",
    );
    setRoute({
      screen: "project",
      params: { tab: "planning", focus: "M3", openGate: true },
    });
  };
  const go = (screen, params = {}) => {
    const planOk = sel.planningComplete(s);
    let nextParams = { ...params };
    // Opening a project with no tab → jump to the current incomplete phase/milestone
    if (screen === "project" && !nextParams.tab) {
      nextParams = { ...nextParams, ...sel.currentProjectRoute(s) };
    }
    const wantsLockedTab =
      screen === "project" && nextParams.tab && LOCKED_TABS[nextParams.tab];
    const wantsLockedScreen = screen === "bid"; // bid evaluation lives inside tender
    if (!planOk && (wantsLockedTab || wantsLockedScreen)) {
      redirectLockedToGate();
      return false;
    }
    setRoute({ screen, params: nextParams });
    return true;
  };
  const resetWireframe = () => {
    d({ type: "RESET" });
    toast("Demo data reset to the wireframe figures");
    go("actions");
  };
  const startFreshDemo = () => {
    d({ type: "RESET_FRESH" });
    toast(
      "Fresh demo started — use Admin to load example scenarios as you walk the platform",
    );
    go("project", { tab: "planning" });
  };
  const loadExample = (key) => {
    d({ type: "LOAD_EXAMPLE", key });
    toast(`Loaded example: ${exampleLabel(key)}`);
  };
  const addExampleProject = () => {
    d({ type: "ADD_PROJECT" });
    toast("Example project added to the end of the portfolio list");
  };

  const p = s.projects[0];
  const tab = route.params.tab || null;
  const openCount = s.actions.length;

  const search = (e) => {
    if (e.key !== "Enter") return;
    const t = q.trim().toLowerCase();
    if (!t) return;
    let navigated = true;
    if (t.includes("bid") || t.includes("t-114")) navigated = go("bid");
    else if (t.includes("boq") || t.includes("2.14")) go("record");
    else if (t.includes("expen") || t.includes("cost"))
      go("project", { tab: "expenses" });
    else if (s.packages.some((x) => x.id.toLowerCase() === t))
      navigated = go("project", { tab: "tender" });
    else if (s.projects.some((x) => x.name.toLowerCase().includes(t)))
      go("portfolio");
    else {
      go("portfolio");
    }
    if (navigated) toast("Jumped to the closest match for “" + q + "”");
    setQ("");
  };

  const body = () => {
    switch (route.screen) {
      case "actions":
        return <MyActions go={go} />;
      case "portfolio":
        return (
          <Portfolio
            go={go}
            startFreshDemo={startFreshDemo}
            addExampleProject={addExampleProject}
          />
        );
      case "bid":
        return <BidVerify go={go} />;
      case "record":
        return <RecordScreen go={go} />;
      case "site":
        return <SiteCapture go={go} />;
      case "vendors":
        return <VendorsScreen />;
      case "reports":
        return <ReportsScreen go={go} />;
      case "admin":
        return (
          <AdminScreen
            resetWireframe={resetWireframe}
            startFreshDemo={startFreshDemo}
            loadExample={loadExample}
          />
        );
      case "project":
        return <ProjectScreen go={go} tab={tab} params={route.params} />;
      default:
        return <MyActions go={go} />;
    }
  };

  return (
    <Ctx.Provider value={{ s, d, toast }}>
      <div className="app">
        <header className="topbar">
          <div className="topbar-row1">
            <span className="brand">NDDB Engineering Projects</span>
            <input
              className="search"
              placeholder="Search projects, packages, vendors, drawings"
              value={q}
              onChange={(e) => setQ(e.target.value)}
              onKeyDown={search}
              aria-label="Search"
            />
            <span className="scope">
              {route.screen === "project" ||
              route.screen === "bid" ||
              route.screen === "record"
                ? p.name + (s.demoMode === "fresh" ? " · fresh demo" : "")
                : s.demoMode === "fresh"
                  ? "Fresh demo"
                  : "All projects"}
            </span>
            <span className="avatar" title={s.user.name}>
              {s.user.initials}
            </span>
          </div>
          <nav className="nav">
            {NAV.map(([label, key]) => (
              <button
                key={key}
                aria-current={route.screen === key ? "page" : undefined}
                onClick={() => go(key, key === "project" ? {} : {})}
              >
                {label}
                {key === "actions" && openCount > 0 && (
                  <span className="badgecount">{openCount}</span>
                )}
              </button>
            ))}
            <button
              onClick={() => go("site")}
              aria-current={route.screen === "site" ? "page" : undefined}
            >
              Site capture
            </button>
          </nav>
        </header>
        <main className="main">{body()}</main>
        {msg && (
          <div className="toast" role="status">
            {msg}
          </div>
        )}
      </div>
    </Ctx.Provider>
  );
}

function LockedTabNotice({ openGate3, what }) {
  const { s } = useStore();
  const m3 = s.milestones.find((m) => m.id === "M3");
  return (
    <Card title={what + " is locked"} className="gate-rule">
      <p style={{ margin: "0 0 10px" }}>
        Planning and design has to clear Gate 3 — <em>{m3.title}</em> — before
        {" " + what.toLowerCase() + " "}work opens up. This keeps procurement
        and site execution from starting against a BOQ that hasn't been approved
        yet.
      </p>
      <div className="row" style={{ gap: 8, flexWrap: "wrap" }}>
        <span
          className={
            "pill " +
            (m3.status === "In review"
              ? "a"
              : m3.status === "Returned"
                ? "r"
                : "n")
          }
        >
          <i className="dot" />
          Gate 3: {m3.status}
        </span>
        <button className="btn pri sm" onClick={openGate3}>
          Go to Gate 3 approval
        </button>
      </div>
    </Card>
  );
}

function ProjectScreen({ go, tab, params }) {
  const { s } = useStore();
  const p = s.projects[0];
  const label = Object.keys(TABKEY).find((k) => TABKEY[k] === tab);
  const planOk = sel.planningComplete(s);
  const LOCKED = { tender: 1, execution: 1 };
  const openGate3 = () =>
    go("project", { tab: "planning", focus: "M3", openGate: true });
  return (
    <>
      <Crumb
        parts={[
          { t: "Portfolio", go: () => go("portfolio") },
          { t: p.name, go: () => go("project", {}) },
          ...(label ? [{ t: label }] : []),
        ]}
      />
      <div className="stack">
        <ProjectHeader p={p} />
        <MilestoneRail go={go} tab={tab} />
        <div className="card" style={{ padding: "0 6px" }}>
          <nav className="nav" style={{ padding: 0 }}>
            {TABS.map((t) => {
              const key = TABKEY[t],
                locked = !planOk && LOCKED[key];
              return (
                <button
                  key={t}
                  aria-current={tab === key ? "page" : undefined}
                  aria-disabled={locked || undefined}
                  className={locked ? "locked-tab" : ""}
                  title={
                    locked
                      ? "Locked until Gate 3 (planning and design) is approved"
                      : undefined
                  }
                  onClick={() => go("project", { tab: key })}
                >
                  {locked && <span aria-hidden="true">🔒 </span>}
                  {t}
                </button>
              );
            })}
          </nav>
        </div>
        {!planOk && (tab === "tender" || tab === "execution") && (
          <LockedTabNotice
            openGate3={openGate3}
            what={tab === "tender" ? "Tender and vendor" : "Execution"}
          />
        )}
        <Anchors go={go} />
        {!tab && <ProjectHome go={go} />}
        {tab === "planning" && <PlanningTab go={go} params={params} />}
        {tab === "tender" && planOk && <TenderTab go={go} />}
        {tab === "execution" && planOk && (
          <ExecutionTab go={go} params={params} />
        )}
        {tab === "expenses" && <ExpensesTab go={go} />}
        {tab === "timeline" && <TimelineTab />}
        {tab === "documents" && <DocumentsTab />}
        {tab === "changes" && <ChangesTab go={go} />}
      </div>
    </>
  );
}

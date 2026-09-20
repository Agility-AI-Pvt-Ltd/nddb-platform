import { useState } from "react";
import { useStore } from "../store.js";
import { sel, cr } from "../selectors.js";
import { Card, Bar, Status, Panel, Empty } from "../ui.jsx";

/* ============================================================
   03 · PROJECT SHELL — header, milestone rail, tabs
   The header, anchors and rail never reload; only the tab body changes.
   ============================================================ */
export const TABS = [
  "Planning and design",
  "Tender and vendor",
  "Execution",
  "Expenses",
  "Timeline",
  "Documents",
  "Changes",
];
export const TABKEY = {
  "Planning and design": "planning",
  "Tender and vendor": "tender",
  Execution: "execution",
  Expenses: "expenses",
  Timeline: "timeline",
  Documents: "documents",
  Changes: "changes",
};

export function ProjectHeader({ p }) {
  const { s } = useStore();
  const items = [
    ["Capacity", p.capacity],
    ["Sanctioned", cr(p.sanctioned)],
    ["Committed", cr(p.committed)],
    ["Start", p.start],
    ["Target handover", p.handover],
    ["Forecast", p.forecast],
    ["Packages", p.packages],
    ["Project head", p.head],
  ];
  return (
    <Card
      title={p.long || p.name}
      sub={p.phase + " phase"}
      right={<button className="btn sm">Project settings</button>}
    >
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit,minmax(118px,1fr))",
          gap: 10,
        }}
      >
        {items.map(([k, v]) => (
          <div key={k}>
            <div className="tiny mut">{k}</div>
            <div style={{ fontSize: 13, fontWeight: 500 }}>{v}</div>
          </div>
        ))}
      </div>
      <p className="print-note">
        Project characteristics are fixed to the header: visible in every tab,
        editable only through a change request.
      </p>
    </Card>
  );
}

export function MilestoneRail({ go, tab }) {
  const { s } = useStore();
  const gate3 = s.milestones.find((m) => m.id === "M3");
  const segs = [
    {
      k: "planning",
      name: "Planning and design",
      pct: sel.planningPct(s),
      sub: `${s.milestones.filter((m) => m.status === "Approved").length} of ${s.milestones.length} milestones`,
    },
    {
      k: "tender",
      name: "Tender and vendor",
      pct: sel.tenderPct(s),
      sub: `${s.packages.filter((p) => p.stage === "Awarded").length} of ${s.packages.length} packages awarded`,
    },
    {
      k: "execution",
      name: "Execution",
      pct: sel.execPct(s),
      sub: `${s.exec.physical}% physical, plan ${s.exec.plan}%`,
    },
  ];
  const gateLabel =
    gate3.status === "Approved" ? "Gate 3 cleared" : "Gate 3 pending";
  const planOk = sel.planningComplete(s);
  return (
    <Card
      title="Milestones"
      sub={`${s.projects[0].milestonesDone} of ${s.projects[0].milestonesTotal} complete · all three phases at once`}
    >
      <div className="rail">
        <div className={"railseg " + (tab === "planning" ? "cur" : "")}>
          <div className="rt">
            <span>{segs[0].name}</span>
            <span className="num mut">{segs[0].pct}%</span>
          </div>
          <Bar pct={segs[0].pct} />
          <div className="tiny mut" style={{ marginTop: 5 }}>
            {segs[0].sub}
          </div>
        </div>
        <div
          className="railgate"
          title="A gate milestone blocks the next phase"
        >
          {gateLabel}
        </div>
        <div
          className={
            "railseg " +
            (tab === "tender" ? "cur " : "") +
            (!planOk ? "locked" : "")
          }
        >
          <div className="rt">
            <span>
              {planOk ? "" : "🔒 "}
              {segs[1].name}
            </span>
            <span className="num mut">{segs[1].pct}%</span>
          </div>
          <Bar pct={segs[1].pct} />
          <div className="tiny mut" style={{ marginTop: 5 }}>
            {planOk ? segs[1].sub : "Locked until Gate 3 is approved"}
          </div>
        </div>
        <div className="railgate">Gate 4 · Group head</div>
        <div
          className={
            "railseg " +
            (tab === "execution" ? "cur " : "") +
            (!planOk ? "locked" : "")
          }
        >
          <div className="rt">
            <span>
              {planOk ? "" : "🔒 "}
              {segs[2].name}
            </span>
            <span className="num mut">{segs[2].pct}%</span>
          </div>
          <Bar pct={segs[2].pct} plan={s.exec.plan} />
          <div className="tiny mut" style={{ marginTop: 5 }}>
            {planOk ? segs[2].sub : "Locked until Gate 3 is approved"}
          </div>
        </div>
      </div>
    </Card>
  );
}

export function Anchors({ go }) {
  const { s } = useStore();
  return (
    <div className="cols2">
      <Card title="Next milestones" sub="What is next" pad={false}>
        {s.nextMilestones.map((m) => (
          <div className="lrow" key={m.what}>
            <div style={{ flex: 1 }}>
              <div className="t">{m.what}</div>
              <div className="s">{m.who}</div>
            </div>
            <span className="pill n">{m.when}</span>
          </div>
        ))}
      </Card>
      <Card title="Money" sub="Where the money stands" pad={false}>
        <div className="card-b">
          {[
            ["Sanction", 214.6],
            [
              "Committed",
              s.expenses.reduce((a, e) => a + (e.committed || 0), 0),
            ],
            ["Billed", s.expenses.reduce((a, e) => a + (e.billed || 0), 0)],
            ["Paid", s.expenses.reduce((a, e) => a + (e.paid || 0), 0)],
          ].map(([k, v]) => (
            <div className="kv" key={k}>
              <span className="k">{k}</span>
              <span className="num">{cr(v)}</span>
            </div>
          ))}
          <button
            className="btn sm"
            style={{ marginTop: 9 }}
            onClick={() => go("project", { tab: "expenses" })}
          >
            Open expense tracker
          </button>
        </div>
      </Card>
    </div>
  );
}

/* project home body */
export function ProjectHome({ go }) {
  const { s, d, toast } = useStore();
  const [decide, setDecide] = useState(null);
  return (
    <>
      <div className="cols2">
        <Card
          title="Waiting on approval"
          sub={s.approvalsWaiting.length + " items"}
          pad={false}
        >
          {s.approvalsWaiting.map((a) => (
            <div className="lrow" key={a.id}>
              <div style={{ flex: 1 }}>
                <div className="t">{a.what}</div>
                <div className="s">{a.with}</div>
              </div>
              <span className={"pill " + (a.age === "today" ? "a" : "n")}>
                {a.age}
              </span>
              <button className="btn sm" onClick={() => setDecide(a)}>
                Decide
              </button>
            </div>
          ))}
          {s.approvalsWaiting.length === 0 && (
            <Empty>
              Nothing is waiting. New approvals appear here the moment they are
              raised.
            </Empty>
          )}
        </Card>
        <Card
          title="Changed this week"
          sub={
            s.changesThisWeek +
            s.log.filter((l) => l.tag === "change").length +
            " changes"
          }
          pad={false}
        >
          {s.log.slice(0, 3).map((l) => (
            <div className="lrow" key={l.id}>
              <div style={{ flex: 1 }}>
                <div className="t">{l.what}</div>
                <div className="s">
                  {l.who} · {l.when}
                </div>
              </div>
              <span className="pill acc">new</span>
            </div>
          ))}
          {s.weekChanges.map((c) => (
            <button
              className={"lrow clickable"}
              key={c.what}
              onClick={() => c.link && go("record")}
            >
              <div style={{ flex: 1 }}>
                <div className="t">{c.what}</div>
                <div className="s">{c.who}</div>
              </div>
              {c.link && <span className="pill n">open record</span>}
            </button>
          ))}
        </Card>
      </div>
      {decide && (
        <Panel
          title={decide.what}
          sub={"With " + decide.with + " · raised " + decide.age}
          onClose={() => setDecide(null)}
          footer={
            <>
              <button
                className="btn pri"
                onClick={() => {
                  d({
                    type: "CLEAR_APPROVAL",
                    id: decide.id,
                    decision: "approved",
                  });
                  toast("Approved");
                  setDecide(null);
                }}
              >
                Approve
              </button>
              <button
                className="btn"
                onClick={() => {
                  d({
                    type: "CLEAR_APPROVAL",
                    id: decide.id,
                    decision: "returned with comments",
                  });
                  toast("Returned to preparer");
                  setDecide(null);
                }}
              >
                Return with comments
              </button>
              <span className="spacer" />
              <button className="btn" onClick={() => setDecide(null)}>
                Cancel
              </button>
            </>
          }
        >
          <div className="sect">
            <h4>Approval chain</h4>
            <div className="chain">
              {[
                "Prepared by",
                "Checked by",
                "Recommended by",
                "Approved by",
              ].map((c, i) => (
                <div key={c} className={i < 2 ? "on" : ""}>
                  <div className="tiny mut">{c}</div>
                  <div style={{ fontSize: 12.5 }}>
                    {i < 2 ? "Done" : "Pending"}
                  </div>
                </div>
              ))}
            </div>
            <p className="print-note">
              Delegation rules decide who, by value band. Return sends it back
              to the preparer with required remarks.
            </p>
          </div>
          <div className="sect">
            <h4>This approval will</h4>
            <ul style={{ margin: 0, paddingLeft: 18, fontSize: 13 }}>
              <li>Commit the value against package budget</li>
              <li>Release the next certification step</li>
            </ul>
          </div>
        </Panel>
      )}
    </>
  );
}

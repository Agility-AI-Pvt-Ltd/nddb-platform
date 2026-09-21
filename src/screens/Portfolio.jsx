import { useState } from "react";
import { useStore } from "../store.js";
import { Card, Letter, Empty } from "../ui.jsx";

/* ============================================================
   02 · PORTFOLIO — all projects
   ============================================================ */
export function Portfolio({ go, startFreshDemo, addExampleProject }) {
  const {s} = useStore();
  const [phase,setPhase] = useState("all");
  const [status,setStatus] = useState("all");
  const [q,setQ] = useState("");
  const rows = s.projects.filter(p =>
    (phase==="all" || p.portfolioPhase===phase) &&
    (status==="all" || (status==="at risk" ? p.time.l!=="G" : p.time.l==="G")) &&
    (q==="" || p.name.toLowerCase().includes(q.toLowerCase())));
  const openApprovals = (p) => {
    if (p.id === "p1" || p.id === "p-new") return s.approvalsWaiting.length;
    if (String(p.id).startsWith("p-fresh-")) return 0;
    return ({ p2: 5, p3: 1, p4: 2 })[p.id] ?? 0;
  };
  const onFresh = () => {
    if (!startFreshDemo) return;
    if (window.confirm(
      "Start a fresh demo with one new project and no prefilled activity? You can load examples from Admin as you go.",
    )) startFreshDemo();
  };

  return <>
    <h1 className="page">Portfolio</h1>
    <p className="lead">All projects. Time and cost use one status letter plus the number behind it,
      so the table stays readable in black and white.</p>
    <Card
      title="Projects"
      right={
        <div className="row" style={{ gap: 6, flexWrap: "wrap" }}>
          {s.demoMode === "fresh" && addExampleProject && (
            <button className="btn sm" type="button" onClick={addExampleProject}>
              Add example project
            </button>
          )}
          <button className="btn sm" type="button" onClick={onFresh}>
            Start fresh demo
          </button>
        </div>
      }
      pad={false}
    >
      <div className="card-b" style={{display:"flex",gap:8,flexWrap:"wrap",borderBottom:"1px solid var(--rule)"}}>
        <input className="search" style={{maxWidth:200}} placeholder="Filter by name" value={q} onChange={e=>setQ(e.target.value)}/>
        <select style={{width:"auto"}} value={phase} onChange={e=>setPhase(e.target.value)}>
          <option value="all">Phase: all</option><option>Planning</option><option>Tender</option><option>Execution</option>
        </select>
        <select style={{width:"auto"}} value={status} onChange={e=>setStatus(e.target.value)}>
          <option value="all">Status: all</option><option value="on track">On track</option><option value="at risk">At risk</option>
        </select>
        <select style={{width:"auto"}} defaultValue="2026"><option>2026</option><option>2025</option></select>
      </div>
      <div className="tw"><table>
        <thead><tr><th>Project</th><th>Phase</th><th>Current milestone</th><th>Time</th><th>Cost</th>
          <th className="n">Open approvals</th><th>Claims risk</th></tr></thead>
        <tbody>{rows.map(p=>
          <tr key={p.id}>
            <td><button className="clickable" style={{fontWeight:500,padding:0}} onClick={()=>go("project",{id:p.id})}>{p.name}</button></td>
            <td className="small mut">{p.portfolioPhase}</td>
            <td className="small">{p.current}</td>
            <td><Letter l={p.time.l} v={p.time.v}/></td>
            <td><Letter l={p.cost.l} v={p.cost.v}/></td>
            <td className="n">{openApprovals(p)}</td>
            <td><span className={"pill "+(p.claims==="High"?"r":p.claims==="Medium"?"a":p.claims==="Low"?"g":"n")}>{p.claims}</span></td>
          </tr>)}</tbody>
      </table></div>
      {rows.length===0 && <Empty>No project matches these filters. Clear one to see the rest.</Empty>}
    </Card>

    <Card title="Portfolio timeline" sub="Same bar language as the project timeline" className="" >
      <div className="gantt">
        <div className="gscale"><div/><div className="ticks"><span>2025</span><span>2026</span><span>2027</span><span>2028</span></div></div>
        {[["APDDC dairy",18,88],["Sabar feed",6,70],["Banas powder",42,100],["Cold store",2,56]].map(([n,a,b],i)=>
          <div className="grow" key={n}>
            <div className="mut">{n}</div>
            <div className="gtrack">
              <div className="gbase" style={{left:a+"%",width:(b-a)+"%"}}/>
              <div className="gtoday" style={{left:"52%"}} title="today"/>
            </div>
          </div>)}
        <div className="legend" style={{marginTop:8}}>
          <span><i style={{background:"var(--rule)"}}/>Duration</span>
          <span><i style={{background:"var(--acc)",width:2}}/>Today</span>
        </div>
      </div>
      <p className="print-note">Claims risk counts open interface slips that have no notice served — the number
        unique to the split-package model.</p>
    </Card>
  </>;
}

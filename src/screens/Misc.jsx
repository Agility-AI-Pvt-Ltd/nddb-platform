import { useState } from "react";
import { useStore } from "../store.js";
import { sel } from "../selectors.js";
import { Card, Status, Empty } from "../ui.jsx";
import { Gantt } from "./Execution.jsx";

/* ============================================================
   TIMELINE · DOCUMENTS · CHANGES
   ============================================================ */
export function TimelineTab(){
  const {s} = useStore();
  return <>
    <Card title="Integrated schedule" sub="Baseline 2 · week view"><Gantt/></Card>
    <Card title="Milestone timeline" sub="All three phases in one line" pad={false}>
      {s.milestones.map(m=>
        <div className="lrow" key={m.id}>
          <span className="pill n" style={{minWidth:56,justifyContent:"center"}}>{m.target}</span>
          <div style={{flex:1}}><div className="t">{m.code} {m.title}{m.gate?" (gate)":""}</div>
            <div className="s">{sel.deliv(s,m.id).done} of {sel.deliv(s,m.id).total} deliverables</div></div>
          <Status s={m.status}/>
        </div>)}
      {s.tenderCalendar.map(c=>
        <div className="lrow" key={c.what}>
          <span className="pill n" style={{minWidth:56,justifyContent:"center"}}>{c.date}</span>
          <div style={{flex:1}}><div className="t">{c.what}</div><div className="s">Tender and vendor</div></div>
          <span className="pill n">Planned</span>
        </div>)}
    </Card>
  </>;
}

export function DocumentsTab(){
  const {s} = useStore();
  const [f,setF] = useState("all");
  const rows = s.documents.filter(d=>f==="all"||d.phase===f);
  return <Card title="Documents" sub="Shared across all three phases, always reachable from the project header" pad={false}>
    <div className="card-b" style={{borderBottom:"1px solid var(--rule)"}}>
      <div className="seg">{["all","Planning and design","Tender and vendor","Execution"].map(x=>
        <button key={x} aria-pressed={f===x} onClick={()=>setF(x)}>{x==="all"?"All phases":x}</button>)}</div>
    </div>
    <div className="tw"><table>
      <thead><tr><th>Document</th><th>Type</th><th>Revision</th><th>Phase</th><th>Updated</th><th>By</th></tr></thead>
      <tbody>{rows.map(d=>
        <tr key={d.name}><td>{d.name}</td><td className="small mut">{d.kind}</td>
          <td className="small">{d.rev}</td><td className="small mut">{d.phase}</td>
          <td className="small">{d.when}</td><td className="small mut">{d.who}</td></tr>)}</tbody>
    </table></div>
    {rows.length===0 && <Empty>No document filed against this phase yet.</Empty>}
  </Card>;
}

export function ChangesTab({go}){
  const {s} = useStore();
  return <>
    <Card title="Change history" sub={s.log.length+" this session · newest first"} pad={false}>
      {s.log.length===0 && <Empty>Nothing changed yet in this session. Approve a gate or verify a bid field and it lands here.</Empty>}
      {s.log.map(l=>
        <div className="lrow" key={l.id}>
          <span className="pill acc" style={{minWidth:82,justifyContent:"center"}}>{l.tag}</span>
          <div style={{flex:1}}><div className="t">{l.what}</div><div className="s">{l.when} · {l.who}</div></div>
        </div>)}
    </Card>
    <Card title="Earlier this week" pad={false}>
      {s.weekChanges.map(c=>
        <button className="lrow clickable" key={c.what} onClick={()=>c.link&&go("record")}>
          <div style={{flex:1}}><div className="t">{c.what}</div><div className="s">{c.who}</div></div>
          {c.link && <span className="pill n">open record</span>}
        </button>)}
      <div className="card-b"><p className="print-note" style={{margin:0}}>Nothing is overwritten.
        Every entry carries who, when, what and why.</p></div>
    </Card>
  </>;
}

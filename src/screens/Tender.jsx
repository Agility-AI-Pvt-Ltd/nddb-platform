import { useState } from "react";
import { useStore } from "../store.js";
import { sel } from "../selectors.js";
import { Card, Empty } from "../ui.jsx";

/* ============================================================
   06 · TENDER AND VENDOR — package pipeline
   ============================================================ */
export function TenderTab({go}){
  const {s, d, toast} = useStore();
  const [pick,setPick] = useState("M-03");
  const pkg = s.packages.find(p=>p.id===pick);
  const steps = (s.pkgMilestones[pick] || {steps:[]}).steps;
  const unv = sel.unverified(s);

  return <>
    <Card title="Package pipeline" sub="Columns mirror the real procurement stages, portal stages included" pad={false}>
      <div className="card-b">
        <div className="kb">
          {s.stages.map(st=>{
            const cards = s.packages.filter(p=>p.stage===st);
            return <div className="kbcol" key={st}>
              <h4>{st}<span>{cards.length}</span></h4>
              {cards.map(p=>
                <button className="pcard" key={p.id} aria-pressed={pick===p.id} onClick={()=>setPick(p.id)}>
                  <div className="n1">{p.id} {p.name}</div>
                  <div className="n2">{p.value?("Rs "+p.value.toFixed(1)+" cr"):("Est. Rs "+p.est.toFixed(1)+" cr")}
                    {p.bidders?` · ${p.bidders} bidders`:""}</div>
                  <div className="n3">{p.l1 ? ("L1: "+p.l1)
                    : (p.id==="M-03" ? (unv>0? unv+" fields unverified":"Verified, statement open") : p.waiting)}</div>
                </button>)}
              {cards.length===0 && <div className="tiny mut" style={{padding:"10px 2px"}}>Nothing here yet.</div>}
            </div>;
          })}
        </div>
        <p className="print-note">Each card shows the package milestone it is waiting on, not just its stage.
          Select a card to see its milestones.</p>
      </div>
    </Card>

    <div className="two" style={{marginTop:12}}>
      <Card title={"Package "+pick+" milestones"} sub={(s.pkgMilestones[pick]||{}).sub || `${pkg.name}, estimate Rs ${pkg.est.toFixed(1)} cr`} pad={false}>
        {steps.length>0 ? steps.map(st=>
          <div className="lrow" key={st.name}>
            <div style={{flex:1}} className="t">{st.name}</div>
            <span className={"pill "+(st.state.startsWith("Done")?"g":st.state==="In progress"?"a":"n")}>{st.state}</span>
          </div>)
          : <Empty>Package milestones are created when the package leaves scoping. {pick} is at “{pkg.waiting}”.</Empty>}
        {pick==="M-03" && <div className="card-b" style={{borderTop:"1px solid var(--rule)"}}>
          <button className="btn pri sm" onClick={()=>go("bid")}>
            {unv>0 ? `Verify ${unv} bid fields` : "Open comparative statement"}
          </button>
          <p className="print-note" style={{margin:"8px 0 0"}}>Package milestones use the same lifecycle and approval
            pattern as project milestones.</p>
        </div>}
      </Card>

      <div className="stack">
        <Card title="Tender calendar" sub="Next 30 days" pad={false}>
          {s.tenderCalendar.map(c=>
            <div className="lrow" key={c.what}><span className="pill n" style={{minWidth:60,justifyContent:"center"}}>{c.date}</span>
              <div style={{flex:1}} className="t">{c.what}</div></div>)}
        </Card>
        <Card title="Vendor watch" sub="Across packages" pad={false}>
          {s.vendors.map(v=>
            <div className="lrow" key={v.name}>
              <div style={{flex:1}}><div className="t">{v.name}</div><div className="s">{v.note}</div></div>
              <span className={"pill "+v.flag}><i className="dot"/></span>
            </div>)}
          <div className="card-b"><p className="print-note" style={{margin:0}}>Vendor exposure is read across packages,
            because the same contractor often holds several.</p></div>
        </Card>
      </div>
    </div>
  </>;
}

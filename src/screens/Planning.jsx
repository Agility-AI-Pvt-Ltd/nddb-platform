import { useState, useEffect } from "react";
import { useStore } from "../store.js";
import { sel } from "../selectors.js";
import { Card, Status, Bar, Panel } from "../ui.jsx";

/* ============================================================
   04 · PLANNING AND DESIGN + 05 · GATE APPROVAL PANEL
   ============================================================ */
export function PlanningTab({go, params}){
  const {s, d, toast} = useStore();
  const [focus,setFocus] = useState(params.focus || "M3");
  const [gate,setGate] = useState(!!params.openGate);
  useEffect(()=>{ if(params.openGate) setGate(true); if(params.focus) setFocus(params.focus); },[params.openGate,params.focus]);
  const m3 = s.milestones.find(m=>m.id==="M3");

  return <>
    <div className="two">
      <div className="stack">
        {s.milestones.map(m=>{
          const c = sel.deliv(s,m.id), open = focus===m.id;
          return <section key={m.id} className={"card "+(m.gate?"gate-rule":"")}>
            <button className="clickable" onClick={()=>setFocus(open?null:m.id)}
              style={{display:"flex",alignItems:"center",gap:10,padding:"11px 14px"}} aria-expanded={open}>
              <span style={{fontSize:13,fontWeight:500,flex:1,minWidth:0}}>
                {m.code}  {m.title}{m.gate && <span className="mut"> (gate)</span>}
              </span>
              <Status s={m.status}/>
              <span className="tiny mut" style={{whiteSpace:"nowrap"}}>Target {m.target} · {c.done} of {c.total}</span>
            </button>
            {open && <div style={{borderTop:"1px solid var(--rule)",padding:"12px 14px"}}>
              <h4 style={{margin:"0 0 8px",fontSize:11,color:"var(--mut)"}}>Deliverables</h4>
              {c.list.map(dv=>
                <div className="row" key={dv.id} style={{padding:"7px 0",borderBottom:"1px solid var(--rule)",flexWrap:"wrap"}}>
                  <div style={{flex:1,minWidth:160}}>
                    <div style={{fontSize:13}}>{dv.name}</div>
                    <div className="s tiny mut">{dv.note || dv.owner}</div>
                  </div>
                  <Status s={dv.status}/>
                  {dv.status!=="Approved" &&
                    <button className="btn sm" onClick={()=>{d({type:"DELIV",mid:m.id,did:dv.id,status:"Approved"});toast(dv.name+" approved");}}>Approve</button>}
                  {dv.status==="Approved" &&
                    <button className="btn sm danger" onClick={()=>{d({type:"DELIV",mid:m.id,did:dv.id,status:"Returned",remarks:"revise and resubmit"});toast(dv.name+" returned");}}>Return</button>}
                </div>)}
              <div className="row" style={{marginTop:11,flexWrap:"wrap",gap:8}}>
                <Bar pct={c.total?Math.round(c.done/c.total*100):0}/>
                <span className="tiny mut num">{c.total?Math.round(c.done/c.total*100):0}%</span>
                {m.gate && m.status!=="Approved" &&
                  <button className="btn pri sm" onClick={()=>{ if(m.id==="M3") setGate(true); else toast("Gate "+m.gateNo+" opens once the phase before it is approved"); }}>Submit gate</button>}
                {m.gate && m.status==="Approved" && <span className="pill g"><i className="dot"/>Deliverables frozen</span>}
              </div>
              {m.status==="Approved" && <p className="print-note">Approved milestones freeze their deliverables.
                Later edits need a change request.</p>}
              {m.returnRemarks && <p className="print-note" style={{color:"var(--r)"}}>Returned: {m.returnRemarks}</p>}
            </div>}
          </section>;
        })}
        <p className="print-note">A gate milestone has a left rule and blocks the next phase; a normal milestone does not.
          Only the milestone in focus expands.</p>
      </div>

      <div className="stack">
        <Card title="Gate 3 approval chain" sub={m3.status==="Approved"?"Complete":"In progress"} pad={false}>
          {s.gate3chain.map((c,i)=>
            <div className="lrow" key={c.step}>
              <div style={{flex:1}}><div className="t">{c.step}</div><div className="s">{c.who}</div></div>
              <span className={"pill "+(c.state.startsWith("Done")?"g":c.state==="Pending"?"a":c.state.startsWith("Returned")?"r":"n")}>{c.state}</span>
            </div>)}
          <div className="card-b" style={{borderTop:"1px solid var(--rule)"}}>
            <button className="btn pri sm" disabled={m3.status==="Approved"} onClick={()=>setGate(true)}>Open gate 3 approval</button>
          </div>
        </Card>
        <Card title="Blocked by this gate" sub={m3.status==="Approved"?"Cleared":s.gate3blocks.length+" items"} pad={false}>
          {s.gate3blocks.map(b=>
            <div className="lrow" key={b}><div style={{flex:1}} className="t">{b}</div>
              <span className={"pill "+(m3.status==="Approved"?"g":"r")}>{m3.status==="Approved"?"Released":"Held"}</span></div>)}
          <div className="card-b"><p className="print-note" style={{margin:0}}>Showing what a pending approval is
            holding up is what makes approvals move.</p></div>
        </Card>
      </div>
    </div>
    {gate && <GatePanel onClose={()=>setGate(false)} go={go}/>}
  </>;
}

export function GatePanel({onClose, go}){
  const {s, d, toast} = useStore();
  const m3 = s.milestones.find(m=>m.id==="M3");
  const list = sel.gateReady(s);
  const missing = list.filter(c=>!c.on);
  const [decision,setDecision] = useState("Approve");
  const [remarks,setRemarks] = useState("");
  const blockers = sel.blockingDeliv(s,"M3");
  const needRemarks = decision!=="Approve" && remarks.trim().length<4;
  const canApprove = decision==="Approve" ? missing.length===0 : !needRemarks;

  const submit = () => {
    if(decision==="Approve"){
      d({type:"GATE_APPROVE", mid:"M3"});
      toast("Gate 3 approved — BOQ frozen, T-118 unblocked, Rs 42 cr released");
    } else if(decision==="Return with comments"){
      d({type:"GATE_RETURN", mid:"M3", remarks});
      toast("Returned to the preparer with remarks");
    } else {
      d({type:"GATE_REJECT", mid:"M3", remarks});
      toast("Gate 3 rejected");
    }
    onClose();
  };

  return <Panel title="Approve gate 3" sub="Detailed estimate and BOQ  ·  APDDC dairy" onClose={onClose}
    footer={<>
      <button className="btn pri" disabled={!canApprove} onClick={submit}>
        {decision==="Approve"?"Approve gate":decision}
      </button>
      <button className="btn" onClick={onClose}>Cancel</button>
      <span className="spacer"/>
      {decision==="Approve" && missing.length>0 &&
        <span className="tiny" style={{color:"var(--r)",textAlign:"right"}}>Blocked by: {missing[0].label}</span>}
      {needRemarks && <span className="tiny" style={{color:"var(--r)"}}>Remarks required</span>}
    </>}>
    <div className="sect"><h4>Checklist</h4>
      {list.map(c=>{
        const locked = !!c.auto;
        return <label key={c.id} className={"chk "+(locked?"locked ":"")+(c.on?"on":"")}>
          <input type="checkbox" checked={c.on} disabled={locked}
            onChange={e=>d({type:"CHECK",id:c.id,on:e.target.checked})}/>
          <span style={{flex:1}}>{c.label}
            {locked && <span className="tiny mut" style={{display:"block"}}>
              {c.auto==="deliverables"
                ? (c.on ? "All 8 deliverables approved" : `${blockers.length} not approved: ${blockers.map(b=>b.name).join(", ")}`)
                : "Rs 199.6 cr of Rs 214.6 cr sanctioned"}
            </span>}
          </span>
          {c.on ? <span className="pill g">met</span> : <span className="pill r">open</span>}
        </label>;
      })}
      <p className="print-note">The checklist is hard: an unticked mandatory item disables the approve button
        and says which item. Fix the returned deliverable on the tab behind and this unlocks itself.</p>
    </div>

    <div className="sect"><h4>Estimate vs sanction</h4>
      <div className="row" style={{justifyContent:"space-between",marginBottom:6}}>
        <span className="num" style={{fontSize:16,fontWeight:600}}>Rs 199.6 cr</span>
        <span className="small mut">of Rs 214.6 cr</span>
      </div>
      <Bar pct={199.6/214.6*100}/>
      <div className="tiny mut" style={{marginTop:4}}>Rs 15.0 cr headroom</div>
    </div>

    <div className="sect"><h4>Decision</h4>
      <div className="seg">
        {["Approve","Return with comments","Reject"].map(o=>
          <button key={o} aria-pressed={decision===o} onClick={()=>setDecision(o)}>{o}</button>)}
      </div>
      <textarea style={{marginTop:9}} value={remarks} onChange={e=>setRemarks(e.target.value)}
        placeholder={decision==="Approve"?"Remarks (optional)":"Remarks (required) — state exactly what to fix"}/>
    </div>

    <div className="sect"><h4>This approval will</h4>
      {s.gate3consequences.map(c=><div className="kv" key={c}><span>— {c}</span></div>)}
      <p className="print-note">Consequences are stated before signing, not discovered afterwards.
        The screen behind stays visible: approval is a side panel, never a new page.</p>
    </div>
  </Panel>;
}

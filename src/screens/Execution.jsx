import { useState, useEffect } from "react";
import { useStore } from "../store.js";
import { sel } from "../selectors.js";
import { Card, Metric, Panel, Empty } from "../ui.jsx";

/* ============================================================
   08 · EXECUTION — schedule, interfaces, progress
   ============================================================ */
export function Gantt(){
  const {s} = useStore();
  return <div className="gantt">
    <div className="gscale"><div className="mut">Baseline 2 · week view</div>
      <div className="ticks">{["W36","W38","W40","W42","W44","W46"].map(w=><span key={w}>{w}</span>)}</div></div>
    {s.schedule.map(r=>
      <div className="grow" key={r.name}>
        <div className="mut" style={{overflow:"hidden",textOverflow:"ellipsis",whiteSpace:"nowrap"}} title={r.name}>{r.name}</div>
        <div className="gtrack">
          {r.type==="bar" && <>
            <div className="gbase" style={{left:r.base[0]+"%",width:(r.base[1]-r.base[0])+"%"}}/>
            {r.done && <div className="gdone" style={{left:r.done[0]+"%",width:(r.done[1]-r.done[0])+"%"}}/>}
            {r.fc && <div className="gfc" style={{left:r.fc[0]+"%",width:(r.fc[1]-r.fc[0])+"%"}} title="forecast"/>}
          </>}
          {r.type==="diamond" && <div className={"gdiamond "+(r.late?"late":"")} style={{left:r.at+"%"}} title="Interface owned by two packages"/>}
          <div className="gtoday" style={{left:"50%"}} title="today"/>
        </div>
      </div>)}
    <div className="legend" style={{marginTop:8}}>
      <span><i style={{background:"var(--rule)"}}/>Baseline</span>
      <span><i style={{background:"var(--acc)"}}/>Forecast</span>
      <span><i style={{background:"var(--mut)",opacity:.55}}/>Done</span>
      <span><i style={{background:"var(--r)",transform:"rotate(45deg)"}}/>Interface</span>
      <span><i style={{background:"var(--acc)",width:2}}/>Today</span>
    </div>
  </div>;
}

export function ExecutionTab({go, params}){
  const {s, d, toast} = useStore();
  const [notice,setNotice] = useState(null);
  const [body,setBody] = useState("");
  const [sign,setSign] = useState(params.openNotice ? "open" : null);
  useEffect(()=>{ if(params.openNotice) setSign("open"); },[params.openNotice]);

  const late = sel.openInterfaces(s).filter(i=>i.sev!=="g").length;  // wireframe counts all at-risk rows
  const toServe = Math.max(0, sel.draftedNotices(s).length);
  const sites = sel.sitesIn(s);

  const openDraft = it => {
    setNotice(it);
    setBody(`Hindrance notice under clause 8.3.\nInterface: ${it.name}\nResponsibility: ${it.owes}\nStatus: ${it.state}\nEvidence: interface register entry, daily progress reports and site hand-over record for the affected grid.\nAction required: complete the owed work within the contract notice period.`);
  };

  return <>
    <Card pad={false}><div className="metrics">
      <Metric k="Physical progress" v={s.exec.physical+"%"} x={"plan "+s.exec.plan+"%"} tone={s.exec.physical<s.exec.plan?"a":"g"}/>
      <Metric k="Time" v={"+"+s.exec.timeSlip+" days"} x={"against "+s.exec.baseline} tone="a"/>
      <Metric k="Open interfaces" v={late+" late"} x={"of "+s.exec.interfacesTotal} tone={late?"r":"g"}/>
      <Metric k="Notices to serve" v={toServe} x={toServe?"due in 2 days":"none outstanding"} tone={toServe?"r":"g"}/>
    </div>
    <div className="card-b" style={{borderTop:"1px solid var(--rule)"}}>
      <p className="print-note" style={{margin:0}}>Four numbers only. Anything else belongs one click deeper.</p>
    </div></Card>

    <Card title="Integrated schedule" sub="Baseline 2 · week view" className="" ><Gantt/></Card>

    <div className="two">
      <div className="stack">
        <Card title="Interfaces at risk" sub={`${sel.openInterfaces(s).filter(i=>i.sev!=="g").length} of ${s.exec.interfacesTotal}`} pad={false}>
          {s.interfaces.map(it=>
            <div className="lrow" key={it.id}>
              <div style={{flex:1,minWidth:0}}><div className="t">{it.name}</div><div className="s">{it.owes}</div></div>
              <span className={"pill "+it.sev}>{it.state}</span>
              {!it.closed && (s.notices.some(n=>n.iface===it.name)
                ? <span className="pill acc">{s.notices.find(n=>n.iface===it.name).state}</span>
                : <button className="btn sm" onClick={()=>openDraft(it)}>Draft notice</button>)}
            </div>)}
          <div className="card-b"><p className="print-note" style={{margin:0}}>When an interface slips, the notice is one click
            from the slip, pre-filled from the evidence record.</p></div>
        </Card>

        <Card title="Site reports this week" sub={`${sites} of ${s.siteReports.length} packages`} pad={false}>
          {s.siteReports.map(r=>
            <div className="lrow" key={r.pkg}>
              <div style={{flex:1}}><div className="t">{r.pkg}</div><div className="s">{r.at}</div></div>
              <span className={"pill "+(r.state==="Submitted"?"g":"r")}>{r.state}</span>
            </div>)}
          <div className="card-b"><button className="btn sm" onClick={()=>go("site")}>Open site capture</button></div>
        </Card>
      </div>

      <div className="stack">
        <Card title="Billing" sub={"Rs "+s.expenses.reduce((a,e)=>a+(e.billed||0),0).toFixed(1)+" cr billed"} pad={false}>
          {s.bills.map(b=>
            <div className="lrow" key={b.id}>
              <span className="pill n" style={{minWidth:52,justifyContent:"center"}}>{b.id}</span>
              <div style={{flex:1}} className="t">{b.pkg}</div>
              <span className={"pill "+b.sev}>{b.state}</span>
            </div>)}
        </Card>
        <Card title="Hindrances and claims" sub={s.hindrances.length+" open"} pad={false}>
          {s.hindrances.map(h=>
            <div className="lrow" key={h.what}>
              <div style={{flex:1}}><div className="t">{h.what}</div><div className="s">{h.who}</div></div>
            </div>)}
          <div className="card-b"><p className="print-note" style={{margin:0}}>The lower band answers the three questions
            asked in every review: is site reporting, is billing moving, what is blocked.</p></div>
        </Card>
      </div>
    </div>

    {notice && <Panel title="Draft hindrance notice" sub={notice.name+"  ·  "+notice.owes} onClose={()=>setNotice(null)}
      footer={<>
        <button className="btn pri" onClick={()=>{d({type:"DRAFT_NOTICE",id:notice.id,body});toast("Notice drafted — now waiting on signature");setNotice(null);setSign("open");}}>Save draft</button>
        <button className="btn" onClick={()=>setNotice(null)}>Cancel</button>
      </>}>
      <div className="sect"><h4>Pre-filled from the evidence record</h4>
        <textarea style={{minHeight:170}} value={body} onChange={e=>setBody(e.target.value)}/>
      </div>
      <div className="sect"><h4>Evidence attached</h4>
        <div className="kv"><span>Interface register entry</span><span className="mut small">auto</span></div>
        <div className="kv"><span>Daily progress, last 6 days</span><span className="mut small">auto</span></div>
        <div className="kv"><span>Hand-over record, grid C4–C7</span><span className="mut small">auto</span></div>
      </div>
      <p className="print-note">Serving the notice is what closes the claims exposure this slip creates.</p>
    </Panel>}

    {sign==="open" && <Panel title="Sign and serve notices" sub={sel.draftedNotices(s).length+" drafted"} onClose={()=>setSign(null)}>
      {sel.draftedNotices(s).length===0 && <Empty>No notice is drafted. Draft one from an interface at risk first.</Empty>}
      {sel.draftedNotices(s).map(n=>
        <div className="field pending" key={n.id}>
          <div className="row" style={{gap:8,flexWrap:"wrap"}}>
            <div style={{flex:1,minWidth:160}}><div style={{fontWeight:500,fontSize:13}}>{n.ref} · {n.iface}</div>
              <div className="tiny mut">{n.owes} · drafted {n.when}</div></div>
            <button className="btn sm pri" onClick={()=>{d({type:"SIGN_NOTICE",id:n.id,iface:n.iface});toast("Notice served to the contractor");}}>Sign and serve</button>
          </div>
          <div className="dashbox tiny" style={{marginTop:8,whiteSpace:"pre-wrap"}}>{n.body}</div>
        </div>)}
      {s.notices.filter(n=>n.state==="Served").map(n=>
        <div className="field done" key={n.id}>
          <div style={{fontWeight:500,fontSize:13}}>{n.ref} · {n.iface}</div>
          <div className="tiny mut">Served {n.servedAt} · claims exposure closed</div>
        </div>)}
    </Panel>}
  </>;
}

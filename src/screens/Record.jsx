import { useState } from "react";
import { useStore } from "../store.js";
import { Card, Panel, Crumb } from "../ui.jsx";

/* ============================================================
   10 · CURRENT STATE AND CHANGE HISTORY
   ============================================================ */
export function RecordScreen({go}){
  const {s, d, toast} = useStore();
  const r = s.record;
  const [cr_,setCr] = useState(false);
  const [qty,setQty] = useState(String(r.qty));
  const [reason,setReason] = useState("");
  const stale = r.impacted.length;

  return <>
    <Crumb parts={[{t:"Portfolio", go:()=>go("portfolio")},{t:"APDDC dairy", go:()=>go("project",{})},{t:"BOQ line 2.14"}]}/>
    <div className="banner" style={{marginBottom:12}}>
      <div className="row" style={{flexWrap:"wrap",gap:8}}>
        <div style={{flex:1,minWidth:200}}>
          <div style={{fontSize:16,fontWeight:600}}>{r.id}  {r.title}</div>
          <div className="small mut" style={{marginTop:3}}>
            State: {r.state} · Changed {r.lastWhen} by {r.lastBy} · <span style={{color:"var(--acc)"}}>{stale} downstream records need review</span>
          </div>
        </div>
        <button className="btn pri" onClick={()=>setCr(true)}>Raise change request</button>
      </div>
      <p className="print-note" style={{margin:"9px 0 0"}}>The state banner is the first thing on every record:
        state, last change, and whether anything downstream is now stale.</p>
    </div>

    <div className="two">
      <Card title="History" sub="Newest first">
        <div className="hist">{s.history.map(h=>
          <div className={"hitem "+(h.fresh?"new":"")} key={h.id}>
            <div style={{fontSize:13,fontWeight:500}}>{h.what}</div>
            <div className="tiny mut">{h.when}  ·  {h.who}</div>
            {h.why && <div className="small mut" style={{marginTop:3}}>{h.why}</div>}
            {h.before && <div className="row small" style={{gap:16,marginTop:5}}>
              <span className="mut">Before <b className="num" style={{color:"var(--ink)"}}>{h.before}</b></span>
              <span className="mut">After <b className="num" style={{color:"var(--ink)"}}>{h.after}</b></span>
            </div>}
          </div>)}</div>
      </Card>

      <div className="stack">
        <Card title="Impacted by this change" sub="Pushed as tasks" pad={false}>
          {r.impacted.map(i=>
            <div className="lrow" key={i.what}>
              <div style={{flex:1}}><div className="t">{i.what}</div><div className="s">{i.act}</div></div>
              <span className="pill a">review</span>
            </div>)}
          <div className="card-b"><p className="print-note" style={{margin:0}}>Impact is pushed to the affected
            records as tasks, not left for someone to notice.</p></div>
        </Card>
        <Card title="Who is watching" pad={false}>
          {r.watchers.map(w=><div className="lrow" key={w}><div className="t" style={{flex:1}}>{w}</div></div>)}
          <div className="card-b"><p className="print-note" style={{margin:0}}>Daily digest at 18:00.
            Critical events sent at once.</p></div>
        </Card>
      </div>
    </div>

    {cr_ && <Panel title="Raise change request" sub={r.id+"  ·  "+r.title} onClose={()=>setCr(false)}
      footer={<>
        <button className="btn pri" disabled={reason.trim().length<4 || Number(qty)===r.qty}
          onClick={()=>{
            d({type:"CHANGE_REQ", what:`Quantity ${r.qty.toLocaleString()} → ${Number(qty).toLocaleString()} cum`,
               reason, before:r.qty.toLocaleString()+" cum", after:Number(qty).toLocaleString()+" cum",
               newQty:Number(qty), impacts:"RA bill 04 and package C-01 budget"});
            toast("Change recorded — downstream records marked for review"); setCr(false); setReason("");}}>
          Record change</button>
        <button className="btn" onClick={()=>setCr(false)}>Cancel</button>
        <span className="spacer"/>
        {reason.trim().length<4 && <span className="tiny" style={{color:"var(--r)"}}>Reason required</span>}
      </>}>
      <div className="sect"><h4>Quantity, cum</h4>
        <input type="number" value={qty} onChange={e=>setQty(e.target.value)}/>
        <div className="tiny mut" style={{marginTop:4}}>Current value {r.qty.toLocaleString()} cum, frozen at contract</div>
      </div>
      <div className="sect"><h4>Reason</h4>
        <textarea value={reason} onChange={e=>setReason(e.target.value)} placeholder="Why this changes, in one line"/>
      </div>
      <div className="sect"><h4>This will mark for review</h4>
        {r.impacted.map(i=><div className="kv" key={i.what}><span>— {i.what}</span><span className="mut small">{i.act}</span></div>)}
      </div>
    </Panel>}
  </>;
}

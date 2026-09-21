import { useState } from "react";
import { useStore } from "../store.js";
import { sel } from "../selectors.js";
import { Card, Crumb, Empty } from "../ui.jsx";

/* ============================================================
   07 · BID VERIFICATION — source beside the field
   ============================================================ */
export function BidVerify({go}){
  const {s, d, toast} = useStore();
  const b = s.bid;
  const left = sel.unverified(s);
  const [cur,setCur] = useState(() => (b.fields.find(f=>f.state!=="verified")||{}).id);
  const [edit,setEdit] = useState(null);
  const [draft,setDraft] = useState("");
  const active = b.fields.find(f=>f.id===cur) || b.fields[0];

  if (!b.fields.length) {
    return <>
      <Crumb parts={[{t:"Tender", go:()=>go("project",{tab:"tender"})},{t:"Bid evaluation"}]}/>
      <h1 className="page">Bid verification</h1>
      <Card title="No bid loaded">
        <Empty>Load the “Tender pipeline &amp; bid” example from Admin, or open a package evaluation from the tender tab.</Empty>
        <button className="btn" style={{marginTop:10}} type="button" onClick={()=>go("project",{tab:"tender"})}>Back to project</button>
      </Card>
    </>;
  }

  const accept = f => { d({type:"FIELD",id:f.id,value:f.value,mode:"accept"}); toast("Accepted from page "+f.page);
    const nx = b.fields.find(x=>x.state!=="verified" && x.id!==f.id); setCur(nx?nx.id:f.id); };
  const correct = f => { if(draft.trim()==="") return;
    d({type:"FIELD",id:f.id,value:draft.trim(),mode:"correct"}); toast("Corrected and verified");
    setEdit(null); setDraft("");
    const nx = b.fields.find(x=>x.state!=="verified" && x.id!==f.id); setCur(nx?nx.id:f.id); };

  return <>
    <Crumb parts={[{t:"Tender "+b.tender, go:()=>go("project",{tab:"tender"})},{t:"Bid evaluation"},{t:b.bidder}]}/>
    <h1 className="page">Verify bid data · {b.bidder}</h1>
    <p className="lead">{left} of {b.totalFields} fields unverified. The source page sits beside the field —
      verification without looking at the document is not possible.</p>

    <div className="bidsplit">
      <Card title="Bid document preview" sub={`Technical bid, page ${active?active.page:b.page} of ${b.pages}`}>
        <div className="doc">
          <div className="tiny mut" style={{marginBottom:8}}>Highlighted source of the suggested value</div>
          <div style={{marginBottom:10,lineHeight:1.9}}>
            Clause 4.2 — Financial capacity of the bidder for the preceding financial year is declared as{" "}
            <span className={active && active.state!=="verified" ? "hl" : ""}>{active?active.value:"—"}</span>{" "}
            and is supported by audited statements attached at annexure III.
          </div>
          <div className="tiny mut" style={{marginBottom:6}}>Priced BOQ read by template parser, not by AI</div>
          <table>
            <thead><tr><th>Line</th><th>Description</th><th className="n">Qty</th><th className="n">Rate</th></tr></thead>
            <tbody>{b.boq.map(r=>
              <tr key={r.l}><td>{r.l}</td><td>{r.d}</td><td className="n">{r.q}</td><td className="n">{r.r}</td></tr>)}</tbody>
          </table>
        </div>
      </Card>

      <div className="stack">
        <Card title="Fields" sub="One field at a time. Bulk accept is not available." pad={false}>
          <div className="card-b">
            {b.fields.map(f=>{
              const done = f.state==="verified";
              return <div key={f.id} className={"field "+(done?"done":"pending")} aria-current={cur===f.id}
                onClick={()=>setCur(f.id)} style={{cursor:"pointer"}}>
                <div className="row" style={{gap:8,flexWrap:"wrap"}}>
                  <div style={{flex:1,minWidth:150}}>
                    <div style={{fontSize:12.5,color:"var(--mut)"}}>{f.name}</div>
                    {done
                      ? <div style={{fontSize:13,fontWeight:500}}>{f.value}</div>
                      : <div className="dashbox" style={{marginTop:4,fontSize:13}}>{f.value}</div>}
                    <div className="tiny mut" style={{marginTop:4}}>
                      {done ? ("Verified · confirmed by "+(f.by||"A. Rao")+(f.mode==="correct"?" (corrected)":""))
                            : ("Suggested, page "+f.page)}
                    </div>
                  </div>
                  {!done && <div className="row" style={{gap:6}}>
                    <button className="btn sm pri" onClick={e=>{e.stopPropagation();accept(f);}}>Accept</button>
                    <button className="btn sm" onClick={e=>{e.stopPropagation();setEdit(f.id);setDraft(f.value);setCur(f.id);}}>Correct</button>
                  </div>}
                  {done && <span className="pill g"><i className="dot"/>Verified</span>}
                </div>
                {edit===f.id && <div className="row" style={{marginTop:8,gap:6}} onClick={e=>e.stopPropagation()}>
                  <input type="text" value={draft} onChange={e=>setDraft(e.target.value)} autoFocus/>
                  <button className="btn sm pri" onClick={()=>correct(f)}>Save</button>
                  <button className="btn sm" onClick={()=>setEdit(null)}>Cancel</button>
                </div>}
              </div>;
            })}
            <p className="print-note">AI output is a suggestion in a dashed box until a person accepts or corrects it,
              one field at a time.</p>
          </div>
        </Card>

        <div className={"lockbar "+(left===0?"ok":"")}>
          {left===0
            ? <><strong>Comparative statement is open.</strong> All fields verified for {b.bidder}. Award recommendation can be prepared.</>
            : <><strong>Comparative statement is locked.</strong> {left} fields unverified across {b.otherBidders+1} bidders. Bulk accept is not available.</>}
        </div>
        <button className="btn" onClick={()=>go("project",{tab:"tender"})}>Back to tender pipeline</button>
      </div>
    </div>
  </>;
}

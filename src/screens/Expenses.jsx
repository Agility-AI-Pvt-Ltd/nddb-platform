import { useState } from "react";
import { useStore } from "../store.js";
import { sel, cr, num } from "../selectors.js";
import { Card, Bar, Panel } from "../ui.jsx";

/* ============================================================
   09 · EXPENSE TRACKER
   ============================================================ */
export function ExpensesTab({go}){
  const {s} = useStore();
  const t = sel.totals(s);
  const [drill,setDrill] = useState(null);
  const chain = [
    {k:"Sanctioned", v:214.6, note:"Board sanction, revision 1"},
    {k:"Committed", v:t.committed, note:"Signed contract value across awarded packages"},
    {k:"Measured", v:t.measured, note:"Joint measurement recorded at site"},
    {k:"Billed", v:t.billed, note:"RA bills raised by contractors"},
    {k:"Paid", v:t.paid, note:"Released by finance"},
  ];
  const sp = s.split, saving = (sp.turnkey - sp.direct - sp.integration);
  const maxcf = Math.max(...s.cashflow.map(c=>Math.max(c.plan,c.draw)));

  return <>
    <Card pad={false}>
      <div className="card-b">
        <div className="chain">
          {chain.map((c,i)=>
            <button className="pcard" key={c.k} onClick={()=>setDrill(c)} style={{margin:0}}>
              <div className="tiny mut">{c.k}</div>
              <div className="num" style={{fontSize:16,fontWeight:600}}>{cr(c.v)}</div>
              <div className="n3">open records ›</div>
            </button>)}
        </div>
        <div className="row" style={{marginTop:11,justifyContent:"space-between",flexWrap:"wrap",gap:8}}>
          <span className="small mut">Forecast at completion</span>
          <span className="num" style={{fontSize:16,fontWeight:600,
            color: t.forecast>214.6 ? "var(--r)" : "var(--g)"}}>{cr(t.forecast)}</span>
        </div>
        <Bar pct={t.paid/214.6*100} plan={Math.round(t.committed/214.6*100)}/>
        <p className="print-note">One chain from sanction to payment. Every figure opens the records behind it.</p>
      </div>
    </Card>

    <Card title="By package" sub="Staff effort sits in the same table" pad={false}>
      <div className="tw"><table>
        <thead><tr><th>Package</th><th className="n">Budget</th><th className="n">Committed</th>
          <th className="n">Billed</th><th className="n">Paid</th><th className="n">Forecast</th><th className="n">Variance</th></tr></thead>
        <tbody>{s.expenses.map(e=>{
          const v = e.forecast - e.budget;
          return <tr key={e.pkg}>
            <td>{e.pkg}{e.staff && <span className="tiny mut" style={{display:"block"}}>from the time tracker</span>}
            {e.roll && <span className="tiny mut" style={{display:"block"}}>rolled up, open to expand</span>}</td>
            <td className="n">{num(e.budget)}</td><td className="n">{num(e.committed)}</td>
            <td className="n">{num(e.billed)}</td><td className="n">{num(e.paid)}</td><td className="n">{num(e.forecast)}</td>
            <td className="n" style={{color: v>0?"var(--r)":v<0?"var(--g)":"var(--mut)"}}>
              {v>0?"+":v<0?"−":""}{Math.abs(v).toFixed(1)}</td>
          </tr>;})}
        </tbody>
        <tfoot><tr style={{fontWeight:600,borderTop:"1px solid var(--rule)"}}>
          <td>Total</td><td className="n">{num(sel.totals(s).budget)}</td><td className="n">{num(t.committed)}</td>
          <td className="n">{num(t.billed)}</td><td className="n">{num(t.paid)}</td><td className="n">{num(t.forecast)}</td>
          <td className="n">{(t.forecast-t.budget>0?"+":"")+(t.forecast-t.budget).toFixed(1)}</td>
        </tr></tfoot>
      </table></div>
      <div className="card-b" style={{borderTop:"1px solid var(--rule)"}}>
        <p className="print-note" style={{margin:0}}>All figures in Rs crore. Staff effort is the true cost of
          running packages ourselves rather than buying a turnkey plant.</p>
      </div>
    </Card>

    <div className="cols2">
      <Card title="Split vs turnkey" sub="Live comparison, measured from actuals">
        {[["Turnkey equivalent",sp.turnkey],["Split, direct cost",sp.direct],["Integration cost so far",sp.integration]]
          .map(([k,v])=><div className="kv" key={k}><span className="k">{k}</span><span className="num">{cr(v)}</span></div>)}
        <div className="row" style={{marginTop:10,justifyContent:"space-between"}}>
          <span style={{fontWeight:600}}>Saving to date</span>
          <span className="num pill g" style={{fontSize:13}}>{cr(saving)}</span>
        </div>
        <Bar pct={saving/sp.turnkey*100}/>
        <p className="print-note">The savings claim is measured from actuals, not assumed at the start.</p>
      </Card>

      <Card title="Cash flow" sub="Planned release against forecast draw, by month">
        <div className="cf">{s.cashflow.map(c=>
          <div className="m" key={c.m}>
            <div className="pair">
              <div className="pl" style={{height:(c.plan/maxcf*100)+"%"}} title={"plan Rs "+c.plan+" cr"}/>
              <div className="dr" style={{height:(c.draw/maxcf*100)+"%"}} title={"draw Rs "+c.draw+" cr"}/>
            </div>
            <div className="lb">{c.m}</div>
          </div>)}</div>
        <div className="legend" style={{marginTop:8}}>
          <span><i style={{background:"var(--fill)",border:"1px solid var(--rule)"}}/>Planned release</span>
          <span><i style={{background:"var(--acc)"}}/>Forecast draw</span>
        </div>
      </Card>
    </div>

    {drill && <Panel title={drill.k} sub={drill.note} onClose={()=>setDrill(null)}>
      <div className="sect"><h4>Records behind {cr(drill.v)}</h4>
        <div className="tw"><table><thead><tr><th>Package</th><th className="n">Amount</th><th>State</th></tr></thead>
          <tbody>{s.expenses.filter(e=>e[drill.k.toLowerCase()]!=null || drill.k==="Sanctioned").map(e=>
            <tr key={e.pkg}><td>{e.pkg}</td>
              <td className="n">{drill.k==="Sanctioned"?num(e.budget):num(e[drill.k.toLowerCase()])}</td>
              <td className="small mut">{drill.k==="Paid"?"Released":drill.k==="Billed"?"Certified":"Open"}</td></tr>)}
          </tbody></table></div>
      </div>
      <p className="print-note">Every figure in the chain opens the records behind it, so no number is a dead end.</p>
    </Panel>}
  </>;
}

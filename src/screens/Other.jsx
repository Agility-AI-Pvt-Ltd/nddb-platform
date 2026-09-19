import { useStore } from "../store.js";
import { sel, cr } from "../selectors.js";
import { Card, Metric, Empty } from "../ui.jsx";

/* ============================================================
   VENDORS · REPORTS · ADMIN
   ============================================================ */
export function VendorsScreen(){
  const {s} = useStore();
  return <>
    <h1 className="page">Vendors</h1>
    <p className="lead">Exposure is read across packages, because the same contractor often holds several.</p>
    <Card pad={false}><div className="tw"><table>
      <thead><tr><th>Vendor</th><th>Packages held</th><th className="n">Score</th><th>Watch</th></tr></thead>
      <tbody>{s.vendors.map(v=>{
        const held = s.packages.filter(p=>p.l1 && v.name.startsWith(p.l1.split(" ")[0]));
        return <tr key={v.name}><td>{v.name}</td>
          <td className="small mut">{held.length? held.map(p=>p.id).join(", ") : "bidding only"}</td>
          <td className="n">{(v.note.match(/score (\d+)/)||[,"—"])[1]}</td>
          <td className="small"><span className={"pill "+v.flag}><i className="dot"/>{v.note}</span></td></tr>;})}
      </tbody></table></div></Card>
  </>;
}
export function ReportsScreen({go}){
  const {s} = useStore();
  const t = sel.totals(s);
  return <>
    <h1 className="page">Reports</h1>
    <p className="lead">The four questions asked in every review, across the portfolio.</p>
    <Card pad={false}><div className="metrics">
      <Metric k="Projects in execution" v={s.projects.filter(p=>p.portfolioPhase==="Execution").length}/>
      <Metric k="Open approvals" v={s.approvalsWaiting.length} tone={s.approvalsWaiting.length?"a":"g"}/>
      <Metric k="Late interfaces" v={sel.lateInterfaces(s).length} tone={sel.lateInterfaces(s).length?"r":"g"}/>
      <Metric k="Forecast at completion" v={cr(t.forecast)} x="against Rs 214.6 cr sanction"/>
    </div></Card>
    <Card title="Session activity" sub={s.log.length+" entries"} pad={false}>
      {s.log.length===0 && <Empty>Use the app and every action lands here, as it would in the real audit trail.</Empty>}
      {s.log.slice(0,12).map(l=><div className="lrow" key={l.id}>
        <span className="pill n" style={{minWidth:80,justifyContent:"center"}}>{l.tag}</span>
        <div style={{flex:1}}><div className="t">{l.what}</div><div className="s">{l.when} · {l.who}</div></div></div>)}
    </Card>
  </>;
}
export function AdminScreen({reset}){
  const {s} = useStore();
  return <>
    <h1 className="page">Admin</h1>
    <p className="lead">Delegation of financial powers decides who approves, by value band.</p>
    <Card title="Approval bands" pad={false}><div className="tw"><table>
      <thead><tr><th>Value band</th><th>Prepared by</th><th>Checked by</th><th>Recommended by</th><th>Approved by</th></tr></thead>
      <tbody>
        <tr><td>Up to Rs 5 cr</td><td>Engineer</td><td>Manager</td><td>Project head</td><td>Project head</td></tr>
        <tr><td>Rs 5–50 cr</td><td>Manager</td><td>Project head</td><td>Group head</td><td>Group head</td></tr>
        <tr><td>Above Rs 50 cr</td><td>Project head</td><td>Group head</td><td>Director</td><td>Board</td></tr>
      </tbody></table></div></Card>
    <Card title="Demo data" sub="This build runs on the wireframe's own figures">
      <p className="small mut" style={{marginTop:0}}>Everything you change is kept in this browser only.
        Reset puts every figure back to the wireframe starting state.</p>
      <button className="btn danger" onClick={reset}>Reset demo data</button>
    </Card>
  </>;
}

/* ============================================================
   APP SHELL
   ============================================================ */

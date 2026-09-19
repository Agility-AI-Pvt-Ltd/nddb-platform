import { useMemo } from "react";
import { useStore } from "../store.js";
import { Card, Empty } from "../ui.jsx";

/* ============================================================
   01 · MY ACTIONS — the landing screen
   One inbox for every action type. Sorted by consequence.
   ============================================================ */
export function MyActions({go}){
  const {s, d, toast} = useStore();
  const items = useMemo(()=>[...s.actions].sort((a,b)=>a.days-b.days), [s.actions]);
  const dueTone = t => t.startsWith("Overdue") ? "r" : t==="Due today" ? "a" : "n";

  const open = it => {
    if(it.go==="gate3") go("project",{tab:"planning", focus:"M3", openGate:true});
    else if(it.go==="bid") go("bid");
    else if(it.go==="execution") go("project",{tab:"execution"});
    else if(it.go==="notice") go("project",{tab:"execution", openNotice:true});
    else if(it.go==="site") go("site");
    else if(it.go==="rfi") go("project",{tab:"execution"});
  };

  return <>
    <h1 className="page">My actions</h1>
    <p className="lead">Everything waiting on you, across all projects.</p>
    <Card title="Waiting on you" sub="Sorted by what breaks first"
      right={<span className="pill acc">{items.length} open</span>} pad={false}>
      {items.length===0 && <Empty>Nothing is waiting on you. New approvals, verifications and notices land here.</Empty>}
      {items.map(it=>
        <div className="lrow" key={it.id}>
          <span className="pill acc" style={{minWidth:64,justifyContent:"center"}}>{it.verb}</span>
          <div style={{flex:1,minWidth:0}}>
            <div className="t">{it.what}</div>
            <div className="s">{it.why || "Routine update"}</div>
          </div>
          <span className={"pill "+dueTone(it.due)}>{it.due}</span>
          <button className="btn sm" onClick={()=>open(it)}>Open</button>
        </div>)}
    </Card>
    <div className="cols2" style={{marginTop:12}}>
      <Card title="Why this order">
        <p className="small mut" style={{margin:0}}>Each row says why it matters, not just what it is.
        Consequence drives the sort, not the date alone. Opening an item goes straight to the record
        with the action panel already open.</p>
      </Card>
      <Card title="Cleared today" sub={s.log.filter(l=>l.tag==="approval"||l.tag==="action").length+" entries"} pad={false}>
        {s.log.filter(l=>l.tag==="approval"||l.tag==="action").slice(0,4).map(l=>
          <div className="lrow" key={l.id}><div style={{flex:1}}><div className="t">{l.what}</div>
            <div className="s">{l.when} · {l.who}</div></div></div>)}
        {s.log.filter(l=>l.tag==="approval"||l.tag==="action").length===0 && <Empty>Nothing cleared yet in this session.</Empty>}
      </Card>
    </div>
  </>;
}

import { useState, useEffect, useReducer, useRef } from "react";
import { reducer, load, Ctx, useStore, KEY } from "./store.js";
import { Crumb } from "./ui.jsx";
import { MyActions } from "./screens/MyActions.jsx";
import { Portfolio } from "./screens/Portfolio.jsx";
import { ProjectHeader, MilestoneRail, Anchors, ProjectHome, TABS, TABKEY } from "./screens/ProjectShell.jsx";
import { PlanningTab } from "./screens/Planning.jsx";
import { TenderTab } from "./screens/Tender.jsx";
import { BidVerify } from "./screens/Bid.jsx";
import { ExecutionTab } from "./screens/Execution.jsx";
import { ExpensesTab } from "./screens/Expenses.jsx";
import { TimelineTab, DocumentsTab, ChangesTab } from "./screens/Misc.jsx";
import { RecordScreen } from "./screens/Record.jsx";
import { SiteCapture } from "./screens/Site.jsx";
import { VendorsScreen, ReportsScreen, AdminScreen } from "./screens/Other.jsx";

const NAV = [["My actions","actions"],["Portfolio","portfolio"],["Project","project"],
             ["Vendors","vendors"],["Reports","reports"],["Admin","admin"]];

export function App(){
  const [s, d] = useReducer(reducer, null, load);
  const [msg, setMsg] = useState(null);
  const [route, setRoute] = useState({screen:"actions", params:{}});
  const [q, setQ] = useState("");
  const timer = useRef(null);

  useEffect(()=>{ try{ localStorage.setItem(KEY, JSON.stringify(s)); }catch(e){} },[s]);
  useEffect(()=>{ window.scrollTo({top:0,behavior:"instant"}); },[route.screen, route.params.tab]);

  const toast = t => { setMsg(t); clearTimeout(timer.current); timer.current = setTimeout(()=>setMsg(null), 3200); };
  const go = (screen, params={}) => setRoute({screen, params});
  const reset = () => { d({type:"RESET"}); toast("Demo data reset to the wireframe figures"); go("actions"); };

  const p = s.projects[0];
  const tab = route.params.tab || null;
  const openCount = s.actions.length;

  const search = e => {
    if(e.key!=="Enter") return;
    const t = q.trim().toLowerCase();
    if(!t) return;
    if(t.includes("bid")||t.includes("t-114")) go("bid");
    else if(t.includes("boq")||t.includes("2.14")) go("record");
    else if(t.includes("expen")||t.includes("cost")) go("project",{tab:"expenses"});
    else if(s.packages.some(x=>x.id.toLowerCase()===t)) go("project",{tab:"tender"});
    else if(s.projects.some(x=>x.name.toLowerCase().includes(t))) go("portfolio");
    else { go("portfolio"); }
    toast("Jumped to the closest match for “"+q+"”");
    setQ("");
  };

  const body = () => {
    switch(route.screen){
      case "actions": return <MyActions go={go}/>;
      case "portfolio": return <Portfolio go={go}/>;
      case "bid": return <BidVerify go={go}/>;
      case "record": return <RecordScreen go={go}/>;
      case "site": return <SiteCapture go={go}/>;
      case "vendors": return <VendorsScreen/>;
      case "reports": return <ReportsScreen go={go}/>;
      case "admin": return <AdminScreen reset={reset}/>;
      case "project": return <ProjectScreen go={go} tab={tab} params={route.params}/>;
      default: return <MyActions go={go}/>;
    }
  };

  return <Ctx.Provider value={{s, d, toast}}>
    <div className="app">
      <header className="topbar">
        <div className="topbar-row1">
          <span className="brand">NDDB Engineering Projects</span>
          <input className="search" placeholder="Search projects, packages, vendors, drawings"
            value={q} onChange={e=>setQ(e.target.value)} onKeyDown={search} aria-label="Search"/>
          <span className="scope">{route.screen==="project"||route.screen==="bid"||route.screen==="record" ? p.name : "All projects"}</span>
          <span className="avatar" title={s.user.name}>{s.user.initials}</span>
        </div>
        <nav className="nav">
          {NAV.map(([label,key])=>
            <button key={key} aria-current={route.screen===key?"page":undefined}
              onClick={()=>go(key, key==="project"?{}:{})}>
              {label}{key==="actions" && openCount>0 && <span className="badgecount">{openCount}</span>}
            </button>)}
          <button onClick={()=>go("site")} aria-current={route.screen==="site"?"page":undefined}>Site capture</button>
        </nav>
      </header>
      <main className="main">{body()}</main>
      {msg && <div className="toast" role="status">{msg}</div>}
    </div>
  </Ctx.Provider>;
}

function ProjectScreen({go, tab, params}){
  const {s} = useStore();
  const p = s.projects[0];
  const label = Object.keys(TABKEY).find(k=>TABKEY[k]===tab);
  return <>
    <Crumb parts={[
      {t:"Portfolio", go:()=>go("portfolio")},
      {t:p.name, go:()=>go("project",{})},
      ...(label?[{t:label}]:[])]}/>
    <div className="stack">
      <ProjectHeader p={p}/>
      <MilestoneRail go={go} tab={tab}/>
      <div className="card" style={{padding:"0 6px"}}>
        <nav className="nav" style={{padding:0}}>
          {TABS.map(t=>
            <button key={t} aria-current={tab===TABKEY[t]?"page":undefined}
              onClick={()=>go("project",{tab:TABKEY[t]})}>{t}</button>)}
        </nav>
      </div>
      <Anchors go={go}/>
      {!tab && <ProjectHome go={go}/>}
      {tab==="planning" && <PlanningTab go={go} params={params}/>}
      {tab==="tender" && <TenderTab go={go}/>}
      {tab==="execution" && <ExecutionTab go={go} params={params}/>}
      {tab==="expenses" && <ExpensesTab go={go}/>}
      {tab==="timeline" && <TimelineTab/>}
      {tab==="documents" && <DocumentsTab/>}
      {tab==="changes" && <ChangesTab go={go}/>}
    </div>
  </>;
}

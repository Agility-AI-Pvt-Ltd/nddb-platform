import { useEffect } from "react";

/* ============================================================
   UI PRIMITIVES
   ============================================================ */
export function Card({title, sub, right, children, pad=true, className=""}){
  return <section className={"card "+className}>
    {(title||right) && <div className="card-h"><div><h3>{title}</h3>{sub&&<div className="sub">{sub}</div>}</div><div>{right}</div></div>}
    {pad ? <div className="card-b">{children}</div> : children}
  </section>;
}
export function Metric({k, v, x, tone}){
  return <div className="metric"><div className="k">{k}</div>
    <div className="v" style={tone?{color:`var(--${tone})`}:null}>{v}</div>
    {x && <div className="x">{x}</div>}</div>;
}
export const toneOf = st => ({
  "Approved":"g","Closed":"g","Submitted":"a","In review":"a","In progress":"a",
  "Returned":"r","On hold":"r","Not started":"n","Served":"g","Drafted":"a","Handed over":"g"}[st]||"n");
export function Status({s}){ return <span className={"pill "+toneOf(s)}><i className="dot"/>{s}</span>; }
export function Letter({l,v}){ return <span className="row" style={{gap:6}}><span className={"letter "+l}>{l}</span><span className="num small">{v}</span></span>; }
export function Bar({pct, plan}){
  return <div className="bar" role="progressbar" aria-valuenow={pct} aria-valuemin="0" aria-valuemax="100">
    <i style={{width:Math.max(0,Math.min(100,pct))+"%"}}/>
    {plan!==undefined && <span className="plan" style={{left:plan+"%"}} title={"plan "+plan+"%"}/>}
  </div>;
}
export function Panel({title, sub, onClose, children, footer}){
  useEffect(()=>{
    const k = e => { if(e.key==="Escape") onClose(); };
    document.addEventListener("keydown",k);
    document.body.style.overflow="hidden";
    return ()=>{document.removeEventListener("keydown",k); document.body.style.overflow="";};
  },[onClose]);
  return <div className="scrim" onMouseDown={e=>{ if(e.target===e.currentTarget) onClose(); }}>
    <div className="panel" role="dialog" aria-modal="true" aria-label={title}>
      <div className="panel-h">
        <div style={{flex:1}}>
          <div style={{fontSize:15,fontWeight:600}}>{title}</div>
          {sub && <div className="small mut" style={{marginTop:2}}>{sub}</div>}
        </div>
        <button className="btn sm" onClick={onClose}>Close</button>
      </div>
      <div className="panel-b">{children}</div>
      {footer && <div className="panel-f">{footer}</div>}
    </div>
  </div>;
}
export function Crumb({parts}){
  return <div className="crumb">{parts.map((p,i)=><span key={i}>
    {i>0 && " / "}
    {p.go ? <button onClick={p.go}>{p.t}</button> : p.t}
  </span>)}</div>;
}
export function Empty({children}){ return <div className="empty">{children}</div>; }

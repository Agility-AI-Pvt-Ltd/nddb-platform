import { useState } from "react";
import { useStore } from "../store.js";

/* ============================================================
   11 · SITE CAPTURE ON MOBILE
   ============================================================ */
const SITE_ACTIONS = ["Daily progress","Measurement entry","Material receipt","EHS observation","Hindrance","Interface hand-over"];

export function SiteCapture({go}){
  const {s, d, toast} = useStore();
  const [form,setForm] = useState(null);
  const [pkg,setPkg] = useState("C-01");
  const [v,setV] = useState({activity:"Raft pour, grid C4–C7", qty:"68", manpower:"42", photos:0,
    accepted:"M-02 site in-charge", punch:"2", sign:false, note:""});
  const set = (k,x) => setV(p=>({...p,[k]:x}));

  const saveProgress = () => {
    d({type:"SITE", pkg, kind:"Daily progress", synced:true,
       payload:{activity:v.activity, qty:v.qty, manpower:v.manpower, photos:v.photos},
       summary:`${v.activity}, ${v.qty} cum, ${v.manpower} on site`});
    toast("Saved offline with geotag and time"); setForm(null);
  };
  const saveHandover = () => {
    d({type:"HANDOVER", ifaceId:"i1",
       payload:{what:"C-01 hands foundations to M-02", accepted:v.accepted, punch:v.punch}});
    toast("Hand-over recorded and signed by both parties"); setForm(null);
  };

  return <>
    <h1 className="page">Site capture</h1>
    <p className="lead">Offline first. Everything captured on site becomes evidence with time and location.
      Six actions, no menus.</p>
    <div className="phone">
      <div className="phone-h">
        <div><div style={{fontWeight:600}}>Today at {pkg}</div>
          <div className="tiny mut">{s.queued>0 ? s.queued+" items queued to sync" : "All synced"}</div></div>
        {s.queued>0
          ? <button className="offline" onClick={()=>{d({type:"SYNC"});toast("Queue synced");}}>Offline · sync</button>
          : <span className="pill g"><i className="dot"/>Online</span>}
      </div>

      <div className="card-b" style={{paddingBottom:0}}>
        <select value={pkg} onChange={e=>setPkg(e.target.value)}>
          {["C-01","M-02","E-02","R-01","U-01"].map(p=><option key={p}>{p}</option>)}
        </select>
      </div>

      {!form && <>
        <div className="sixgrid">
          {SITE_ACTIONS.map(a=><button key={a} onClick={()=>setForm(a)}>{a}</button>)}
        </div>
        <div className="card-b" style={{borderTop:"1px solid var(--rule)"}}>
          <div className="tiny mut" style={{marginBottom:6}}>Captured today</div>
          {s.siteSubmissions.length===0 && s.handovers.length===0 && <div className="tiny mut">Nothing captured yet. Tap an action above.</div>}
          {s.siteSubmissions.slice(0,3).map(x=>
            <div className="kv" key={x.id}><span className="small">{x.activity||"Entry"} · {x.pkg}</span><span className="tiny mut">{x.when}</span></div>)}
          {s.handovers.slice(0,2).map(x=>
            <div className="kv" key={x.id}><span className="small">Hand-over signed</span><span className="tiny mut">{x.when}</span></div>)}
        </div>
      </>}

      {form==="Daily progress" && <div className="card-b">
        <div style={{fontWeight:600,marginBottom:9}}>Daily progress</div>
        <div className="tiny mut">Activity</div>
        <input type="text" value={v.activity} onChange={e=>set("activity",e.target.value)} style={{marginBottom:8}}/>
        <div className="row" style={{gap:8,marginBottom:8}}>
          <div style={{flex:1}}><div className="tiny mut">Quantity, cum</div>
            <input type="number" value={v.qty} onChange={e=>set("qty",e.target.value)}/></div>
          <div style={{flex:1}}><div className="tiny mut">Manpower</div>
            <input type="number" value={v.manpower} onChange={e=>set("manpower",e.target.value)}/></div>
        </div>
        <div className="row" style={{gap:8}}>
          {[0,1].map(i=>
            <div key={i} className={"photo "+(v.photos>i?"set":"")} style={{flex:1}}
              onClick={()=>set("photos", v.photos>i ? i : i+1)}>{v.photos>i?"Photo attached":"Photo"}</div>)}
        </div>
        <div className="tiny mut" style={{margin:"7px 0 11px"}}>Geotag and time attached automatically</div>
        <div className="row" style={{gap:8}}>
          <button className="btn pri" style={{flex:1}} onClick={saveProgress}>Save offline</button>
          <button className="btn" onClick={()=>setForm(null)}>Back</button>
        </div>
      </div>}

      {form==="Interface hand-over" && <div className="card-b">
        <div style={{fontWeight:600,marginBottom:9}}>Interface hand-over</div>
        <div className="dashbox small" style={{marginBottom:9}}>C-01 hands foundations to M-02</div>
        <div className="tiny mut">Accepted by</div>
        <input type="text" value={v.accepted} onChange={e=>set("accepted",e.target.value)} style={{marginBottom:8}}/>
        <div className="tiny mut">Punch items recorded</div>
        <input type="number" value={v.punch} onChange={e=>set("punch",e.target.value)} style={{marginBottom:9}}/>
        <label className="chk"><input type="checkbox" checked={v.sign} onChange={e=>set("sign",e.target.checked)}/>
          <span>Signature captured, both parties</span></label>
        <div className="tiny mut" style={{margin:"3px 0 11px"}}>Locks 24 hours after capture. Corrections added as amendments.</div>
        <div className="row" style={{gap:8}}>
          <button className="btn pri" style={{flex:1}} disabled={!v.sign} onClick={saveHandover}>Record hand-over</button>
          <button className="btn" onClick={()=>setForm(null)}>Back</button>
        </div>
        {!v.sign && <div className="tiny" style={{color:"var(--r)",marginTop:6}}>Both parties must sign on site.</div>}
      </div>}

      {form && form!=="Daily progress" && form!=="Interface hand-over" && <div className="card-b">
        <div style={{fontWeight:600,marginBottom:9}}>{form}</div>
        <div className="tiny mut">Note</div>
        <textarea value={v.note} onChange={e=>set("note",e.target.value)} placeholder="Short enough to finish standing up"/>
        <div className="row" style={{gap:8,marginTop:9}}>
          <button className="btn pri" style={{flex:1}} disabled={v.note.trim().length<3}
            onClick={()=>{d({type:"SITE",pkg,kind:form,synced:true,payload:{activity:form+": "+v.note},summary:v.note});
              toast("Saved offline"); setForm(null); set("note","");}}>Save offline</button>
          <button className="btn" onClick={()=>setForm(null)}>Back</button>
        </div>
      </div>}
    </div>
    <p className="print-note" style={{textAlign:"center",maxWidth:390,margin:"10px auto 0"}}>
      Hand-over records are the evidence behind every future claim, so both parties sign on site.
      Recording the hand-over closes the interface on the execution tab.</p>
  </>;
}

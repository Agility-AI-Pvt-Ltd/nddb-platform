import { createContext, useContext } from "react";
import { seed, seedFresh, blankPortfolioProject } from "./data.js";
import { applyExample, exampleLabel } from "./demoExamples.js";

/* ============================================================
   STORE — one reducer. Every screen reads from it, so an
   approval on one tab moves the numbers on all the others.
   ============================================================ */
export const KEY = "nddb.epp.v1";
const nowStamp = () => {
  const d = new Date();
  return "Today " + String(d.getHours()).padStart(2,"0") + ":" + String(d.getMinutes()).padStart(2,"0");
};
let uid = 0; const nid = p => p + "_" + (++uid) + "_" + Date.now().toString(36);

/* Non-gate milestones (M1) complete when every deliverable is approved.
   Returning one reopens the milestone so later gates stay blocked. */
function syncPlanning(s) {
  if (!s?.milestones) return s;
  let changed = false;
  const milestones = s.milestones.map((m) => {
    if (m.gate || m.frozen) return m;
    const list = s.deliverables?.[m.id] || [];
    if (!list.length) return m;
    const allApproved = list.every((d) => d.status === "Approved");
    if (allApproved && m.status !== "Approved") {
      changed = true;
      return { ...m, status: "Approved" };
    }
    if (!allApproved && m.status === "Approved") {
      changed = true;
      return { ...m, status: "In progress" };
    }
    return m;
  });
  return reflectFreshProject(changed ? { ...s, milestones } : s);
}

function reflectFreshProject(s) {
  if (s.demoMode !== "fresh" || !s.projects?.length) return s;
  const done = (s.milestones || []).filter((m) => m.status === "Approved").length;
  const open = (s.milestones || []).find((m) => m.status !== "Approved");
  const current = open
    ? `${open.code}: ${open.title.charAt(0).toLowerCase()}${open.title.slice(1)}`
    : "Planning complete";
  const head = s.projects[0];
  if (head.current === current && head.milestonesDone === done) return s;
  const projects = s.projects.slice();
  projects[0] = { ...head, current, milestonesDone: done };
  return { ...s, projects };
}

function logged(s, what, who, tag){
  return {...s, log:[{id:nid("l"), what, who:who||"R. Kulkarni", when:nowStamp(), tag:tag||"change"}, ...s.log]};
}

export function reducer(s, a){
  switch(a.type){

    /* --- deliverables (planning tab) --- */
    case "DELIV": {
      const list = s.deliverables[a.mid].map(d =>
        d.id===a.did ? {...d, status:a.status, note:a.status==="Returned"?("Returned: "+a.remarks):null, owner:d.owner} : d);
      let t = syncPlanning({...s, deliverables:{...s.deliverables, [a.mid]:list}});
      const d = list.find(x=>x.id===a.did);
      return logged(t, `${a.mid} deliverable “${d.name}” set to ${a.status}`, s.user.name, "deliverable");
    }

    /* --- milestone status --- */
    case "MSTATUS": {
      const ms = s.milestones.map(m => m.id===a.mid ? {...m, status:a.status, holdReason:a.reason||null} : m);
      return logged(reflectFreshProject({...s, milestones:ms}), `Milestone ${a.mid} moved to ${a.status}` + (a.reason?` — ${a.reason}`:""), s.user.name, "milestone");
    }

    /* --- approval chain step --- */
    case "CHAIN": {
      const ch = s.gate3chain.map((c,i) => i===a.i ? {...c, state:a.state} : c);
      return logged({...s, gate3chain:ch}, `Gate 3 ${s.gate3chain[a.i].step.toLowerCase()} by ${s.gate3chain[a.i].who}`, s.user.name, "approval");
    }

    /* --- gate decision --- */
    case "GATE_APPROVE": {
      const ms = s.milestones.map(m => m.id===a.mid ? {...m, status:"Approved", frozen:true} : m);
      const ch = s.gate3chain.map(c => c.state==="Pending"||c.state==="Waiting" ? {...c, state:"Done "+nowStamp().replace("Today ","today ")} : c);
      // unblock everything the gate was holding
      const pk = s.packages.map(p => p.blockedByGate===3 ? {...p, blockedByGate:null, waiting:"Cleared by gate 3"} : p);
      let t = reflectFreshProject({...s, milestones:ms, gate3chain:ch, packages:pk,
        actions:s.actions.filter(x=>x.id!=="t1"),
        approvalsWaiting:s.approvalsWaiting,
        gateApproved:{...(s.gateApproved||{}), 3:true}});
      t = logged(t, "Gate 3 approved — BOQ frozen at revision 4, tender T-118 unblocked, Q4 funds Rs 42 cr released", s.user.name, "approval");
      return t;
    }
    case "GATE_RETURN": {
      const ms = s.milestones.map(m => m.id===a.mid ? {...m, status:"Returned", returnRemarks:a.remarks} : m);
      const ch = s.gate3chain.map(c => c.step==="Prepared" ? {...c, state:"Returned, redo"} : c);
      let t = reflectFreshProject({...s, milestones:ms, gate3chain:ch});
      return logged(t, `Gate 3 returned to preparer — ${a.remarks}`, s.user.name, "approval");
    }
    case "GATE_REJECT": {
      const ms = s.milestones.map(m => m.id===a.mid ? {...m, status:"On hold", holdReason:a.remarks} : m);
      return logged(reflectFreshProject({...s, milestones:ms}), `Gate 3 rejected — ${a.remarks}`, s.user.name, "approval");
    }
    case "CHECK": {
      const c = {...(s.checks||{})}; c[a.id] = a.on;
      return {...s, checks:c};
    }

    /* --- bid verification --- */
    case "FIELD": {
      const fl = s.bid.fields.map(f => f.id===a.id
        ? {...f, state:"verified", value:a.value, by:s.user.name, mode:a.mode} : f);
      const left = fl.filter(f=>f.state!=="verified").length;
      let t = {...s, bid:{...s.bid, fields:fl}};
      if(left===0) t = {...t, actions:t.actions.filter(x=>x.id!=="t3")};
      const f = fl.find(x=>x.id===a.id);
      return logged(t, `Bid field “${f.name}” ${a.mode==="correct"?"corrected to":"accepted as"} ${a.value}`, s.user.name, "verification");
    }

    /* --- interface notices --- */
    case "DRAFT_NOTICE": {
      const it = s.interfaces.find(x=>x.id===a.id);
      const n = {id:nid("n"), ref:"HN-"+(s.notices.length+21), iface:it.name, owes:it.owes,
                 state:"Drafted", body:a.body, when:nowStamp()};
      return logged({...s, notices:[n, ...s.notices]}, `Hindrance notice drafted for “${it.name}”`, s.user.name, "notice");
    }
    case "SIGN_NOTICE": {
      const ns = s.notices.map(n => n.id===a.id ? {...n, state:"Served", servedAt:nowStamp()} : n);
      const it = s.interfaces.map(i => i.name===a.iface ? {...i, noticeServed:true} : i);
      let t = {...s, notices:ns, interfaces:it, actions:s.actions.filter(x=>x.id!=="t2")};
      return logged(t, `Notice served for “${a.iface}” — claims exposure closed`, s.user.name, "notice");
    }

    /* --- site capture --- */
    case "SITE": {
      const rep = s.siteReports.map(r => r.pkg.startsWith(a.pkg) ? {...r, at:nowStamp(), state:"Submitted"} : r);
      let t = {...s, siteReports:rep,
        siteSubmissions:[{id:nid("s"), ...a.payload, pkg:a.pkg, when:nowStamp()}, ...s.siteSubmissions],
        queued:Math.max(0, s.queued - (a.synced?1:0))};
      if(a.pkg.startsWith("E-02")) t = {...t, actions:t.actions.filter(x=>x.id!=="t6")};
      return logged(t, `${a.kind} captured at ${a.pkg} — ${a.summary}`, "Site engineer", "site");
    }
    case "HANDOVER": {
      const it = s.interfaces.map(i => i.id===a.ifaceId ? {...i, state:"Handed over", sev:"g", closed:true} : i);
      return logged({...s, interfaces:it,
        handovers:[{id:nid("h"), ...a.payload, when:nowStamp()}, ...s.handovers]},
        `Interface hand-over recorded and signed by both parties — ${a.payload.what}`, "Site engineer", "site");
    }
    case "SYNC": return logged({...s, queued:0}, "Offline queue synced, 3 items uploaded with geotag and time", "Site engineer", "site");

    /* --- record / change request --- */
    case "CHANGE_REQ": {
      const h = {id:nid("h"), what:a.what, when:nowStamp(), who:s.user.name, why:"Reason: "+a.reason,
                 before:a.before, after:a.after, fresh:true};
      const sys = {id:nid("h"), what:"Marked "+a.impacts+" for review", when:nowStamp(), who:"System", fresh:true};
      return logged({...s, history:[sys, h, ...s.history], record:{...s.record, qty:a.newQty||s.record.qty,
        lastBy:s.user.name, lastWhen:"just now"}, changesThisWeek:s.changesThisWeek+1},
        a.what, s.user.name, "change");
    }

    /* --- approvals on project home --- */
    case "CLEAR_APPROVAL": {
      const ap = s.approvalsWaiting.filter(x=>x.id!==a.id);
      const item = s.approvalsWaiting.find(x=>x.id===a.id);
      return logged({...s, approvalsWaiting:ap}, `${item.what} — ${a.decision}`, s.user.name, "approval");
    }
    case "RESOLVE": return logged({...s, actions:s.actions.filter(x=>x.id!==a.id)}, a.note, s.user.name, "action");

    /* --- package stage --- */
    case "STAGE": {
      const pk = s.packages.map(p => p.id===a.id ? {...p, stage:a.stage, waiting:a.waiting||p.waiting} : p);
      return logged({...s, packages:pk}, `Package ${a.id} moved to ${a.stage}`, s.user.name, "tender");
    }

    case "RESET": return seed();
    case "RESET_FRESH": return seedFresh();
    case "LOAD_EXAMPLE": {
      const next = applyExample(s, a.key);
      return logged(
        next,
        `Example loaded: ${exampleLabel(a.key)}`,
        s.user.name,
        "demo",
      );
    }
    case "ADD_PROJECT": {
      const index = s.projects.length + 1;
      const project = a.project || blankPortfolioProject(index);
      return logged(
        { ...s, projects: [...s.projects, project] },
        `Project “${project.name}” added to portfolio`,
        s.user.name,
        "demo",
      );
    }

    /* --- CadPilot P&ID (design) — persisted via localStorage with the rest of state --- */
    case "PID_UPSERT": {
      const prev = s.pid || {};
      const pid = { ...prev, ...a.pid };
      let t = { ...s, pid };
      // Keep M2 P&I diagrams deliverable in step with CadPilot
      if (pid.state === "approved" && t.deliverables?.M2) {
        const list = t.deliverables.M2.map((d) =>
          d.name.toLowerCase().includes("p&i") || d.id === "d202"
            ? { ...d, status: "Approved", note: "Approved via CadPilot" + (pid.revision ? ` rev ${pid.revision}` : "") }
            : d,
        );
        t = { ...t, deliverables: { ...t.deliverables, M2: list } };
      }
      return logged(
        t,
        pid.state === "approved"
          ? `CadPilot P&ID approved` + (pid.revision ? ` rev ${pid.revision}` : "")
          : `CadPilot P&ID updated` + (pid.state ? ` (${pid.state})` : ""),
        s.user.name,
        "cadpilot",
      );
    }
    case "PID_CLEAR":
      return logged({ ...s, pid: null }, "CadPilot P&ID cleared", s.user.name, "cadpilot");

    default: return s;
  }
}

export function load(){
  try{
    const raw = localStorage.getItem(KEY);
    if(raw){
      const p = JSON.parse(raw);
      if(p && p.projects){
        const next = { pid: null, ...p };
        if (
          Array.isArray(next.gate3checklist) &&
          !next.gate3checklist.some((c) => c.id === "c5")
        ) {
          next.gate3checklist = [
            ...next.gate3checklist,
            {
              id: "c5",
              label: "CadPilot P&ID approved",
              auto: "cadpilot",
            },
          ];
        }
        return syncPlanning(next);
      }
    }
  }catch(e){}
  return seed();
}

export const Ctx = createContext(null);
export const useStore = () => useContext(Ctx);

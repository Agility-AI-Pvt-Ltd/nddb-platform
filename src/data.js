/* ============================================================
   SEED DATA — every figure below is taken from the NDDB wireframe.
   Items marked EXTRA were added only to satisfy a count the
   wireframe states but does not draw (e.g. "7 of 8 deliverables").
   ============================================================ */
export const seed = () => ({
  demoMode:"wireframe",
  user:{initials:"RK", name:"R. Kulkarni", role:"Project head"},

  projects:[
    {id:"p1", name:"APDDC dairy, 6 LLPD", long:"APDDC dairy plant, 6 LLPD", phase:"Execution",
     portfolioPhase:"Tender", current:"Package C-01 award",
     time:{l:"A", v:"+12 d"}, cost:{l:"G", v:"−1%"}, claims:"Low",
     capacity:"6 LLPD, to 10", sanctioned:214.6, committed:168.2, billed:96.4, paid:88.1,
     measured:104.9, forecastCost:209.4,
     start:"12 Jan 2026", handover:"30 Nov 2027", forecast:"12 Dec 2027",
     packages:11, head:"R. Kulkarni", milestonesDone:18, milestonesTotal:31},
    {id:"p2", name:"Sabar cattle feed plant", phase:"Execution", portfolioPhase:"Execution",
     current:"Structure completion", time:{l:"R",v:"+34 d"}, cost:{l:"A",v:"+6%"}, claims:"High",
     sanctioned:96.0, committed:81.3, billed:44.0, paid:39.2, measured:47.1, forecastCost:101.8,
     capacity:"300 TPD", start:"04 Mar 2025", handover:"30 Jun 2027", forecast:"03 Aug 2027",
     packages:7, head:"S. Patel", milestonesDone:21, milestonesTotal:29},
    {id:"p3", name:"Banas milk powder", phase:"Planning", portfolioPhase:"Planning",
     current:"Gate 2: basic engineering", time:{l:"G",v:"on time"}, cost:{l:"G",v:"on est."}, claims:"—",
     sanctioned:142.0, committed:0, billed:0, paid:0, measured:0, forecastCost:142.0,
     capacity:"20 MTPD", start:"18 Aug 2026", handover:"31 Mar 2028", forecast:"31 Mar 2028",
     packages:5, head:"A. Rao", milestonesDone:4, milestonesTotal:26},
    {id:"p4", name:"Mother Dairy cold store", phase:"Execution", portfolioPhase:"Execution",
     current:"Commissioning", time:{l:"A",v:"+8 d"}, cost:{l:"G",v:"−2%"}, claims:"Medium",
     sanctioned:58.4, committed:55.1, billed:49.6, paid:47.0, measured:51.2, forecastCost:57.2,
     capacity:"8,000 pallet", start:"02 Feb 2025", handover:"15 Dec 2026", forecast:"23 Dec 2026",
     packages:4, head:"R. Kulkarni", milestonesDone:24, milestonesTotal:27},
  ],

  /* ---- 04 Planning and design ---- */
  milestones:[
    {id:"M1", code:"M1", title:"Requirement and mass balance", gate:false, status:"Approved", target:"18 Feb"},
    {id:"M2", code:"M2", title:"Basic engineering", gate:true, status:"Approved", target:"22 Apr"},
    {id:"M3", code:"M3", title:"Detailed estimate and BOQ", gate:true, status:"In review", target:"30 Sep",
     gateNo:3, estimate:199.6, sanction:214.6},
    {id:"M4", code:"M4", title:"Package strategy approved", gate:true, status:"Not started", target:"15 Oct", gateNo:4},
  ],
  deliverables:{
    M1:[{id:"d101",name:"Process requirement note",status:"Approved",owner:"A. Rao"},
        {id:"d102",name:"Mass balance sheet",status:"Approved",owner:"A. Rao"},
        {id:"d103",name:"Utility load summary",status:"Approved",owner:"S. Patel"},
        {id:"d104",name:"Plot plan option study",status:"Approved",owner:"S. Patel"}],
    M2:[{id:"d201",name:"Basic engineering package",status:"Approved",owner:"S. Patel"},
        {id:"d202",name:"P&I diagrams",status:"Approved",owner:"S. Patel"},
        {id:"d203",name:"Equipment list rev 2",status:"Approved",owner:"A. Rao"},
        {id:"d204",name:"Civil concept drawings",status:"Approved",owner:"S. Patel"},
        {id:"d205",name:"Electrical single line",status:"Approved",owner:"A. Rao"},
        {id:"d206",name:"HAZOP closure note",status:"Approved",owner:"R. Kulkarni"}],
    M3:[{id:"d301",name:"Detailed BOQ, civil",status:"Approved",owner:"S. Patel"},
        {id:"d302",name:"Detailed BOQ, equipment",status:"Approved",owner:"S. Patel"},
        {id:"d303",name:"Cost estimate summary",status:"Submitted",owner:"A. Rao"},
        {id:"d304",name:"Fund flow plan",status:"Returned",owner:"A. Rao",note:"Returned: revise Q3 phasing"},
        /* EXTRA ×4 so the count reads 7 of 8 as the wireframe states */
        {id:"d305",name:"Rate analysis, civil",status:"Approved",owner:"S. Patel"},
        {id:"d306",name:"Equipment specification sheets",status:"Approved",owner:"S. Patel"},
        {id:"d307",name:"Package strategy comparison",status:"Approved",owner:"R. Kulkarni"},
        {id:"d308",name:"Rate basis note, Jun 2026",status:"Approved",owner:"A. Rao"}],
    M4:[{id:"d401",name:"Package split matrix",status:"Not started",owner:"S. Patel"},
        {id:"d402",name:"Interface register draft",status:"Not started",owner:"A. Rao"},
        {id:"d403",name:"Procurement calendar",status:"Not started",owner:"Tender cell"}],
  },
  gate3chain:[
    {step:"Prepared", who:"A. Rao", state:"Done 26 Sep"},
    {step:"Checked", who:"S. Patel", state:"Done 27 Sep"},
    {step:"Recommended", who:"R. Kulkarni", state:"Pending"},
    {step:"Approved", who:"Group head", state:"Waiting"},
  ],
  gate3blocks:["Tender T-118 preparation","Package C-02 NIT","Fund release Q4"],
  gate3consequences:["Freeze the BOQ at revision 4","Unblock tender T-118 preparation","Release Q4 funds of Rs 42 cr"],
  gate3checklist:[
    {id:"c1", label:"All deliverables approved", auto:"deliverables"},
    {id:"c2", label:"Estimate within sanction", auto:"estimate"},
    {id:"c3", label:"Rate basis dated within 6 months", auto:null},
    {id:"c4", label:"Package strategy comparison attached", auto:null},
  ],

  /* ---- 06 Tender and vendor ---- */
  stages:["Scoping","Tender ready","Published on GeM","Bids received","Evaluation","Awarded"],
  packages:[
    {id:"U-01", name:"Utilities", stage:"Scoping", est:18.4, waiting:"Scope draft"},
    {id:"A-01", name:"Automation", stage:"Scoping", est:9.2, waiting:"Waiting gate 4"},
    {id:"E-02", name:"Electrical", stage:"Tender ready", est:22.1, waiting:"NIT approved"},
    {id:"C-02", name:"Civil ph.2", stage:"Published on GeM", est:40.6, waiting:"Closes 04 Oct"},
    /* EXTRA — wireframe states 2 published, draws 1 */
    {id:"T-118", name:"Instrumentation", stage:"Published on GeM", est:12.4, waiting:"Closes 11 Oct", blockedByGate:3},
    {id:"R-01", name:"Refrigeration", stage:"Bids received", est:31.0, bidders:4, waiting:"Technical opened"},
    {id:"M-03", name:"Piping", stage:"Evaluation", est:27.8, bidders:6, waiting:"8 fields unverified", tender:"T-114"},
    /* EXTRA — wireframe states 2 in evaluation, draws 1 */
    {id:"E-01", name:"Electrical ph.1", stage:"Evaluation", est:14.6, bidders:5, waiting:"Comparative statement drafted"},
    {id:"C-01", name:"Civil ph.1", stage:"Awarded", est:64.0, value:61.2, l1:"Shah Constr."},
    /* EXTRA ×2 — wireframe states 3 awarded, draws 1 */
    {id:"M-02", name:"Mechanical", stage:"Awarded", est:48.5, value:47.9, l1:"Krishna Engg."},
    {id:"E-03", name:"Cable trays", stage:"Awarded", est:7.0, value:6.8, l1:"Deep Electricals"},
  ],
  pkgMilestones:{
    "M-03":{sub:"Piping, estimate Rs 27.8 cr", steps:[
      {name:"NIT approved", state:"Done 02 Aug"},
      {name:"Published", state:"Done 09 Aug"},
      {name:"Pre-bid replies", state:"Done 21 Aug"},
      {name:"Bids opened", state:"Done 05 Sep"},
      {name:"Technical evaluation", state:"In progress"},
      {name:"Award", state:"Target 12 Oct"},
      {name:"Contract signed", state:"Target 20 Oct"}]},
  },
  tenderCalendar:[
    {date:"28 Sep", what:"C-02 pre-bid meeting"},
    {date:"04 Oct", what:"C-02 bid closing"},
    {date:"12 Oct", what:"M-03 award target"},
    {date:"18 Oct", what:"E-02 publication on GeM"},
  ],
  vendors:[
    {name:"Shah Constructions", note:"2 packages, score 78, BG expires 14 Nov", flag:"a"},
    {name:"Krishna Engineering", note:"1 package, score 64, 2 open NCRs", flag:"a"},
    {name:"Deep Refrigeration", note:"Bidding M-03, debarred by NDDB? No", flag:"g"},
  ],

  /* ---- 07 Bid verification, tender T-114, Shah Constructions ---- */
  bid:{tender:"T-114", bidder:"Shah Constructions", totalFields:34, page:12, pages:86,
    boq:[{l:"1.1",d:"Excavation",q:"4,200 cum",r:"182.00"},
         {l:"1.2",d:"PCC 1:4:8",q:"310 cum",r:"4,860.00"},
         {l:"2.1",d:"RCC M25",q:"1,180 cum",r:"7,240.00"}],
    fields:[
      {id:"f1", name:"Annual turnover, FY25", value:"Rs 412.6 cr", page:12, state:"suggested"},
      {id:"f2", name:"Similar work, largest", value:"Rs 58.4 cr", page:21, state:"suggested"},
      /* EXTRA ×6 so 8 fields are unverified, as the wireframe states */
      {id:"f3", name:"Net worth, FY25", value:"Rs 188.2 cr", page:12, state:"suggested"},
      {id:"f4", name:"Working capital available", value:"Rs 46.0 cr", page:13, state:"suggested"},
      {id:"f5", name:"Bid security amount", value:"Rs 1.22 cr", page:4, state:"suggested"},
      {id:"f6", name:"GST registration", value:"24AAECS8841R1ZP", page:7, state:"suggested"},
      {id:"f7", name:"Completion certificate, Mehsana", value:"09 Feb 2025", page:24, state:"suggested"},
      {id:"f8", name:"Plant and machinery declared", value:"Rs 31.4 cr", page:33, state:"suggested"},
      {id:"f9", name:"EPF registration", value:"Verified", page:9, state:"verified", by:"A. Rao"},
      {id:"f10", name:"ISO 9001 validity", value:"14 Mar 2027", page:11, state:"verified", by:"A. Rao"},
    ],
    otherBidders:2},

  /* ---- 08 Execution ---- */
  exec:{physical:54, plan:61, timeSlip:12, baseline:"baseline 2", interfacesTotal:14},
  schedule:[
    {name:"C-01 Civil phase 1", base:[0,58], done:[0,52], type:"bar"},
    {name:"M-02 Silo erection", base:[46,78], fc:[52,86], type:"bar"},
    {name:"Interface: foundations → mech.", at:50, type:"diamond", late:true},
    {name:"E-02 Cable laying", base:[62,86], fc:[66,92], type:"bar"},
    {name:"R-01 Refrigeration", base:[70,94], type:"bar"},
    {name:"Commissioning", base:[90,100], type:"bar"},
  ],
  interfaces:[
    {id:"i1", name:"Foundations → mech. erection", owes:"C-01 owes M-02", state:"Late 6 days", sev:"r"},
    {id:"i2", name:"Cable trench → E-02", owes:"C-01 owes E-02", state:"Late 2 days", sev:"r"},
    {id:"i3", name:"Utilities tie-in → R-01", owes:"U-01 owes R-01", state:"At risk", sev:"a"},
  ],
  siteReports:[
    {pkg:"C-01 Civil", at:"Today 18:04", state:"Submitted"},
    {pkg:"M-02 Mechanical", at:"Today 17:40", state:"Submitted"},
    {pkg:"E-02 Electrical", at:"Yesterday", state:"Submitted"},
    /* EXTRA — wireframe states 4 of 5, draws 4 rows */
    {pkg:"U-01 Utilities", at:"Today 16:20", state:"Submitted"},
    {pkg:"R-01 Refrigeration", at:"—", state:"Missing 2 days"},
  ],
  bills:[
    {id:"RA 04", pkg:"M-02", state:"Measurement flagged", sev:"a"},
    {id:"RA 07", pkg:"C-01", state:"With finance", sev:"n"},
    {id:"RA 03", pkg:"R-01", state:"Paid 12 Sep", sev:"g"},
    {id:"RA 02", pkg:"E-02", state:"Paid 28 Aug", sev:"g"},
  ],
  hindrances:[
    {what:"Drawing awaited, raft C8", who:"NDDB, 4 days"},
    {what:"Power shutdown", who:"External, 2 days"},
    {what:"Labour shortage", who:"C-01, 9 days"},
    {what:"Idle-time claim, M-02", who:"Rs 42 lakh, under review"},
    {what:"Access road blocked", who:"External, 3 days"},
    {what:"Steel delivery delayed", who:"M-02, 5 days"},
  ],

  /* ---- 09 Expenses ---- */
  expenses:[
    {pkg:"C-01 Civil phase 1", budget:64.0, committed:61.2, measured:41.0, billed:38.4, paid:35.0, forecast:63.8},
    {pkg:"M-02 Mechanical", budget:48.5, committed:47.9, measured:31.5, billed:29.1, paid:27.4, forecast:50.6},
    {pkg:"E-02 Electrical", budget:22.1, committed:null, measured:null, billed:null, paid:null, forecast:22.1},
    {pkg:"R-01 Refrigeration", budget:31.0, committed:30.4, measured:16.0, billed:14.2, paid:12.8, forecast:30.4},
    {pkg:"NDDB staff effort", budget:4.2, committed:null, measured:null, billed:null, paid:2.6, forecast:5.4, staff:true},
    /* EXTRA — the other 7 of 11 packages, rolled into one line so the table
       ties exactly to the header figures the wireframe states. */
    {pkg:"Other packages (7)", budget:44.8, committed:28.7, measured:16.4, billed:14.7, paid:10.3, forecast:37.1, roll:true},
  ],
  split:{turnkey:232.8, direct:201.4, integration:8.0},
  cashflow:[
    {m:"Apr", plan:14, draw:11},{m:"May", plan:17, draw:15},{m:"Jun", plan:19, draw:16},
    {m:"Jul", plan:21, draw:18},{m:"Aug", plan:23, draw:21},{m:"Sep", plan:26, draw:22},
    {m:"Oct", plan:24, draw:19},{m:"Nov", plan:22, draw:17},{m:"Dec", plan:18, draw:13},
  ],

  /* ---- 10 Record and change history ---- */
  record:{id:"BOQ 2.14", title:"RCC M25 in raft foundation", state:"frozen at contract",
    lastBy:"S. Patel", lastWhen:"2 days ago", qty:1214, rate:7240.0,
    impacted:[
      {what:"RA bill 04, package C-01", act:"Review before certifying"},
      {what:"Package C-01 budget", act:"Recompute commitment"},
      {what:"Drawing S-114 rev 3", act:"Check quantity note"}],
    watchers:["R. Kulkarni (project head)","Finance team","C-01 site engineer"]},
  history:[
    {id:"h1", what:"Quantity 1,180 → 1,214 cum", when:"Today 09:14", who:"S. Patel",
     why:"Reason: revised raft layout rev 4", before:"1,180 cum", after:"1,214 cum"},
    {id:"h2", what:"Marked RA bill 04 and package C-01 budget for review", when:"Today 09:14", who:"System"},
    {id:"h3", what:"Rate approved at Rs 7,240.00", when:"12 Sep 16:02", who:"A. Rao", why:"Gate 3 approval"},
    {id:"h4", what:"Line created from estimate BOQ rev 3", when:"02 Sep 11:37", who:"S. Patel"},
  ],

  /* ---- 03 Project home ---- */
  nextMilestones:[
    {what:"Silo erection complete", when:"28 Sep", who:"M-02 Mech."},
    {what:"Interface: foundations to mech.", when:"04 Oct", who:"C-01 Civil"},
    {what:"RA bill 04 certified", when:"08 Oct", who:"Finance"},
  ],
  approvalsWaiting:[
    {id:"a1", what:"Variation V-07, package C-01", with:"Project head", age:"2 days"},
    {id:"a2", what:"RA bill 04, package M-02", with:"Finance", age:"1 day"},
    {id:"a3", what:"Gate 4: package strategy", with:"Group head", age:"5 days"},
    {id:"a4", what:"Extra item rate, C-01", with:"Project head", age:"today"},
  ],
  changesThisWeek:11,
  weekChanges:[
    {what:"BOQ 2.14 quantity 1,180 → 1,214 cum", who:"S. Patel", link:"record"},
    {what:"Baseline 2 approved", who:"R. Kulkarni"},
    {what:"Package E-02 NIT approved", who:"Tender cell"},
    {what:"Interface C-01 → M-02 slipped 6 days", who:"System"},
  ],

  /* ---- 01 My actions ---- */
  actions:[
    {id:"t1", verb:"Approve", what:"Gate 3: detailed estimate  ·  APDDC dairy", why:"Blocks tender publication", due:"Due today", days:0, go:"gate3"},
    {id:"t2", verb:"Sign", what:"Hindrance notice to Civil contractor  ·  Package C-01", why:"Contract notice period", due:"Due in 2 days", days:2, go:"notice"},
    {id:"t3", verb:"Verify", what:"8 unverified fields  ·  Tender T-114 bid evaluation", why:"Blocks comparative statement", due:"Due in 3 days", days:3, go:"bid"},
    {id:"t4", verb:"Review", what:"RA bill 04  ·  Package M-02", why:"Payment terms 30 days", due:"Due in 4 days", days:4, go:"execution"},
    {id:"t5", verb:"Answer", what:"RFI 219: foundation bolt layout", why:"Contractor waiting", due:"Overdue 1 day", days:-1, go:"rfi"},
    {id:"t6", verb:"Update", what:"Weekly progress  ·  Package E-02", why:"", due:"Due Friday", days:5, go:"site"},
  ],

  /* ---- 11 Site capture ---- */
  queued:3,
  documents:[
    {name:"BOQ rev 4, civil", kind:"Estimate", rev:"rev 4", when:"26 Sep", who:"S. Patel", phase:"Planning and design"},
    {name:"Drawing S-114 raft layout", kind:"Drawing", rev:"rev 3", when:"24 Sep", who:"S. Patel", phase:"Execution"},
    {name:"NIT, package E-02", kind:"Tender", rev:"rev 1", when:"21 Sep", who:"Tender cell", phase:"Tender and vendor"},
    {name:"Contract, package C-01", kind:"Contract", rev:"signed", when:"14 Jul", who:"Legal", phase:"Tender and vendor"},
    {name:"HAZOP closure note", kind:"Report", rev:"final", when:"22 Apr", who:"R. Kulkarni", phase:"Planning and design"},
    {name:"Baseline 2 schedule", kind:"Schedule", rev:"rev 2", when:"11 Sep", who:"R. Kulkarni", phase:"Execution"},
  ],
  log:[],   // every live action appends here
  notices:[{id:"n_seed", ref:"HN-20", iface:"Foundations → mech. erection", owes:"C-01 owes M-02",
            state:"Drafted", when:"Yesterday 16:12",
            body:"Hindrance notice under clause 8.3.\nInterface: Foundations → mech. erection\nResponsibility: C-01 owes M-02\nStatus: Late 6 days\nEvidence: interface register entry, daily progress reports and site hand-over record for grid C4–C7.\nAction required: complete the owed work within the contract notice period."}],
  siteSubmissions:[], handovers:[],
});

/** Portfolio row for a new greenfield project (appends to `projects`; detail tabs still use `projects[0]`). */
export function blankPortfolioProject(index = 2) {
  return {
    id: `p-fresh-${index}`,
    name: `Greenfield project ${index}`,
    long: `Greenfield project ${index}`,
    phase: "Planning",
    portfolioPhase: "Planning",
    current: "M1: not started",
    time: { l: "G", v: "not started" },
    cost: { l: "G", v: "on est." },
    claims: "—",
    capacity: "To be confirmed",
    sanctioned: 85.0,
    committed: 0,
    billed: 0,
    paid: 0,
    measured: 0,
    forecastCost: 85.0,
    start: "To be set",
    handover: "To be set",
    forecast: "To be set",
    packages: 0,
    head: "R. Kulkarni",
    milestonesDone: 0,
    milestonesTotal: 4,
  };
}

/** Empty-ish portfolio project — load example slices from Admin to walk each flow. */
export const seedFresh = () => ({
  demoMode:"fresh",
  user:{initials:"RK", name:"R. Kulkarni", role:"Project head"},

  projects:[
    {id:"p-new", name:"New greenfield project", long:"New greenfield project", phase:"Planning",
     portfolioPhase:"Planning", current:"M1: requirement and mass balance",
     time:{l:"G", v:"not started"}, cost:{l:"G", v:"on est."}, claims:"—",
     capacity:"To be confirmed", sanctioned:120.0, committed:0, billed:0, paid:0,
     measured:0, forecastCost:120.0,
     start:"To be set", handover:"To be set", forecast:"To be set",
     packages:0, head:"R. Kulkarni", milestonesDone:0, milestonesTotal:4},
  ],

  milestones:[
    {id:"M1", code:"M1", title:"Requirement and mass balance", gate:false, status:"In progress", target:"Set target"},
    {id:"M2", code:"M2", title:"Basic engineering", gate:true, status:"Not started", target:"—", gateNo:2},
    {id:"M3", code:"M3", title:"Detailed estimate and BOQ", gate:true, status:"Not started", target:"—",
     gateNo:3, estimate:null, sanction:120.0},
    {id:"M4", code:"M4", title:"Package strategy approved", gate:true, status:"Not started", target:"—", gateNo:4},
  ],
  deliverables:{
    M1:[{id:"d101",name:"Process requirement note",status:"Not started",owner:"Assign owner"},
        {id:"d102",name:"Mass balance sheet",status:"Not started",owner:"Assign owner"}],
    M2:[{id:"d201",name:"Basic engineering package",status:"Not started",owner:"—"}],
    M3:[{id:"d301",name:"Detailed BOQ",status:"Not started",owner:"—"}],
    M4:[{id:"d401",name:"Package split matrix",status:"Not started",owner:"—"}],
  },
  gate3chain:[
    {step:"Prepared", who:"—", state:"Waiting"},
    {step:"Checked", who:"—", state:"Waiting"},
    {step:"Recommended", who:"—", state:"Waiting"},
    {step:"Approved", who:"—", state:"Waiting"},
  ],
  gate3blocks:[],
  gate3consequences:["Freeze the BOQ at the approved revision","Unblock tender packages","Release staged funds per fund flow"],
  gate3checklist:[
    {id:"c1", label:"All deliverables approved", auto:"deliverables"},
    {id:"c2", label:"Estimate within sanction", auto:"estimate"},
    {id:"c3", label:"Rate basis dated within 6 months", auto:null},
    {id:"c4", label:"Package strategy comparison attached", auto:null},
  ],

  stages:["Scoping","Tender ready","Published on GeM","Bids received","Evaluation","Awarded"],
  packages:[],
  pkgMilestones:{},
  tenderCalendar:[],
  vendors:[],

  bid:{tender:"—", bidder:"—", totalFields:0, page:1, pages:1, boq:[], fields:[], otherBidders:0},

  exec:{physical:0, plan:0, timeSlip:0, baseline:"—", interfacesTotal:0},
  schedule:[],
  interfaces:[],
  siteReports:[],
  bills:[],
  hindrances:[],

  expenses:[{pkg:"Project (no packages yet)", budget:120.0, committed:0, measured:0, billed:0, paid:0, forecast:120.0}],
  split:{turnkey:0, direct:0, integration:0},
  cashflow:[],

  record:{id:"—", title:"No BOQ line selected", state:"not created",
    lastBy:"—", lastWhen:"—", qty:null, rate:null, impacted:[], watchers:[]},
  history:[],

  nextMilestones:[],
  approvalsWaiting:[],
  changesThisWeek:0,
  weekChanges:[],

  actions:[],
  queued:0,
  documents:[],
  log:[],
  notices:[],
  siteSubmissions:[],
  handovers:[],
  checks:{},
  gateApproved:{},
});

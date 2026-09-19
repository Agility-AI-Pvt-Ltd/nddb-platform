# NDDB Engineering Project Platform

A React (Vite) build of the NDDB Engineering Project Platform wireframes — the same
app as the published artifact, as a normal multi-file project you can run locally,
edit, and deploy.

## Run it

```bash
npm install
npm run dev
```

Open the printed local URL (usually http://localhost:5173).

To build a production bundle:

```bash
npm run build
npm run preview
```

## How it's organized

```
src/
  data.js              seed data — every figure taken from the wireframe
  store.js              the single reducer; every screen reads from it, so an
                         approval on one tab moves the numbers on every other tab
  selectors.js          derived values computed from state (sel, cr, num)
  ui.jsx                shared primitives: Card, Panel, Bar, Status, Crumb, etc.
  App.jsx                top-level shell: nav, routing, search, the project screen
  main.jsx               Vite/React entry point
  styles.css              all styling, as CSS custom properties (light + dark mode)
  screens/
    MyActions.jsx         01 — the landing screen, one inbox for every action
    Portfolio.jsx         02 — all projects
    ProjectShell.jsx       03 — project header, milestone rail, anchors, project home
    Planning.jsx          04 & 05 — planning and design tab + the gate approval panel
    Tender.jsx            06 — tender and vendor pipeline
    Bid.jsx                07 — bid verification, source beside the field
    Execution.jsx          08 — schedule, interfaces, progress
    Expenses.jsx           09 — expense tracker
    Misc.jsx                timeline, documents and changes tabs
    Record.jsx              10 — a record and its change history
    Site.jsx                11 — mobile site capture
    Other.jsx                vendors, reports and admin screens
```

## What's live

Nothing is hardcoded twice. Every number on screen is computed from one reducer's
state, so approving a gate, verifying a bid field, serving a notice, or filing a
site report immediately moves every other screen that depends on it — the
milestone rail, the My actions badge, the tender pipeline, the expense totals,
and the change log all update from the same action.

State is kept in `localStorage` so your changes survive a refresh. Admin →
Reset demo data puts every figure back to the wireframe's starting state.

## Data notes

A few dummy-data rows are marked `EXTRA` in `src/data.js`. The wireframe
sometimes *states* a count (e.g. "7 of 8 deliverables") without drawing all of
it; those rows were added only to make the stated counts true.

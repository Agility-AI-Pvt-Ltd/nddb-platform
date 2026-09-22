import { Card, Crumb } from "../ui.jsx";

const CADPILOT_URL = (
  import.meta.env.VITE_CADPILOT_URL ||
  "http://ec2-18-212-99-22.compute-1.amazonaws.com"
).replace(/\/$/, "");

export function CadPilotScreen({ go }) {
  const openCadPilot = () => {
    window.open(CADPILOT_URL, "_blank", "noopener,noreferrer");
  };

  return (
    <>
      <Crumb
        parts={[
          { t: "Portfolio", go: () => go("portfolio") },
          { t: "CadPilot P&ID" },
        ]}
      />

      <div className="banner" style={{ marginBottom: 12 }}>
        <div style={{ fontSize: 16, fontWeight: 600 }}>CadPilot P&ID</div>
        <div className="small mut" style={{ marginTop: 3 }}>
          Open CadPilot to upload workbooks, generate the P&ID, and download the
          drawing there.
        </div>
      </div>

      <Card title="CadPilot" sub={CADPILOT_URL}>
        <p style={{ margin: "0 0 14px" }}>
          CadPilot handles the full flow: upload the two Excel workbooks, choose
          options, generate, review, approve, and download the DXF.
        </p>
        <button className="btn pri" type="button" onClick={openCadPilot}>
          Send to CadPilot
        </button>
      </Card>
    </>
  );
}

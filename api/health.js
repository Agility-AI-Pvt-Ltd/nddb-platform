/** Health check: GET /api/health */
export default function handler(req, res) {
  res.status(200).json({
    ok: true,
    cadpilotUrl: Boolean(process.env.CADPILOT_URL),
    cadpilotKey: Boolean(
      process.env.CADPILOT_CRM_API_KEY || process.env.CADPILOT_API_KEY,
    ),
  });
}

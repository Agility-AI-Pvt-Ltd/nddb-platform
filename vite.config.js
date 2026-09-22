import { defineConfig, loadEnv } from "vite";
import react from "@vitejs/plugin-react";

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), "");
  const target = (env.CADPILOT_URL || "").replace(/\/$/, "");
  const apiKey =
    env.CADPILOT_CRM_API_KEY || env.CADPILOT_API_KEY || "";
  const crmPublicUrl = (env.CRM_PUBLIC_URL || "").replace(/\/$/, "");
  const useWebhook =
    String(env.CADPILOT_USE_WEBHOOK || "").toLowerCase() === "true";

  return {
    plugins: [react()],
    define: {
      __CRM_PUBLIC_URL__: JSON.stringify(crmPublicUrl),
      __CADPILOT_USE_WEBHOOK__: JSON.stringify(useWebhook),
    },
    server: {
      port: 5173,
      proxy: target
        ? {
            // Same contract as Vercel api/cadpilot-proxy.js
            "/api/cadpilot-proxy": {
              target,
              changeOrigin: true,
              secure: false,
              rewrite: (path) => {
                const q = path.includes("?")
                  ? path.slice(path.indexOf("?") + 1)
                  : "";
                const params = new URLSearchParams(q);
                return params.get("path") || "/";
              },
              configure: (proxy) => {
                proxy.on("proxyReq", (proxyReq) => {
                  if (apiKey) proxyReq.setHeader("X-API-Key", apiKey);
                });
              },
            },
          }
        : undefined,
    },
  };
});

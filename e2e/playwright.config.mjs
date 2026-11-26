import { defineConfig } from "playwright/test";
import { fileURLToPath } from "node:url";

const frontend = "http://127.0.0.1:3100";
const backend = "http://127.0.0.1:3334";

export default defineConfig({
  testDir: ".",
  testMatch: "*.spec.mjs",
  workers: 1,
  timeout: 120_000,
  expect: { timeout: 20_000 },
  outputDir: "./test-results",
  reporter: [["list"], ["html", { outputFolder: fileURLToPath(new URL("./report/", import.meta.url)), open: "never" }]],
  use: { baseURL: frontend, browserName: "chromium", trace: "retain-on-failure" },
  webServer: [
    {
      cwd: fileURLToPath(new URL("../backend/", import.meta.url)),
      command: "npx --no-install prisma generate --config prisma7.config.ts && npx --no-install prisma migrate deploy --config prisma7.config.ts && npx --no-install tsx src/server.ts",
      url: backend + "/health",
      env: {
        NODE_ENV: "test",
        PORT: "3334",
        FRONTEND_ORIGIN: frontend,
        DATABASE_URL: "postgresql://evidence_test:evidence_test@127.0.0.1:55434/evidence_e2e",
      },
      reuseExistingServer: false,
      timeout: 120_000,
    },
    {
      cwd: fileURLToPath(new URL("../frontend/", import.meta.url)),
      command: "npm run dev -- --hostname 127.0.0.1 --port 3100",
      url: frontend + "/login",
      env: { BACKEND_URL: backend, NEXT_PUBLIC_API_URL: "" },
      reuseExistingServer: false,
      timeout: 120_000,
    },
  ],
});

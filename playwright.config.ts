import { defineConfig } from "@playwright/test";

export default defineConfig({
  testDir: "lectures/01-playwright/tests",
  timeout: 30_000,
  reporter: [["html", { open: "never" }]],
  use: {
    headless: true,
    screenshot: "only-on-failure",
    video: "retain-on-failure"
  },
});

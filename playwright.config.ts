import { defineConfig, devices } from '@playwright/test'

const port = Number(process.env.ATLAS_TEST_PORT) || 4173
const baseURL = `http://127.0.0.1:${port}`
export default defineConfig({
  testDir: './tests',
  workers: 1,
  timeout: 60_000,
  use: {
    ...devices['Desktop Chrome'],
    channel: process.env.ATLAS_CHROME_CHANNEL || undefined,
    baseURL,
    actionTimeout: 7_000,
    trace: 'retain-on-failure',
    viewport: { width: 1440, height: 900 },
    launchOptions: { args: ['--enable-webgl', '--ignore-gpu-blocklist'] },
  },
  webServer: {
    command: `npm run preview -- --host 127.0.0.1 --port ${port} --strictPort`,
    url: baseURL,
    reuseExistingServer: !process.env.CI,
  },
})

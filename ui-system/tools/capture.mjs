/**
 * UI-only visual smoke capture. Requires the playwright package & Chromium in the host project.
 * Usage: node ui-system/tools/capture.mjs http://127.0.0.1:3000 ui-system/output/capture
 * Changes no application source, backend config, or business logic.
 */
import fs from 'node:fs/promises';
import path from 'node:path';

const [url = 'http://127.0.0.1:3000', dest = 'ui-system/output/capture'] = process.argv.slice(2);
if (!/^https?:\/\//i.test(url)) throw new Error('Provide a complete http(s) URL');

let chromium;
try {
  ({ chromium } = await import('playwright'));
} catch {
  console.error('Playwright is not installed. Use existing project tooling or install it with approval.');
  process.exit(2);
}

await fs.mkdir(dest, { recursive: true });
const browser = await chromium.launch({ headless: true });
const presets = [
  { name: 'desktop', width: 1440, height: 900 },
  { name: 'tablet', width: 768, height: 1024 },
  { name: 'mobile', width: 390, height: 844 },
];
const report = { url, created_at: new Date().toISOString(), viewports: [] };
try {
  for (const size of presets) {
    const page = await browser.newPage({ viewport: { width: size.width, height: size.height }, deviceScaleFactor: 1 });
    const consoleErrors = [];
    const pageErrors = [];
    page.on('console', message => { if (message.type() === 'error') consoleErrors.push(message.text()); });
    page.on('pageerror', error => pageErrors.push(error.message));
    const response = await page.goto(url, { waitUntil: 'networkidle', timeout: 30000 });
    await page.screenshot({ path: path.join(dest, `${size.name}.png`), fullPage: true, animations: 'disabled' });
    const signals = await page.evaluate(() => ({
      documentWidth: document.documentElement.scrollWidth,
      viewportWidth: document.documentElement.clientWidth,
      hasHorizontalOverflow: document.documentElement.scrollWidth > document.documentElement.clientWidth + 1,
      brokenImages: [...document.images].filter(i => i.complete && i.naturalWidth === 0).map(i => i.currentSrc || i.src).slice(0, 20),
      emptyHrefCount: [...document.querySelectorAll('a[href]')].filter(a => !a.getAttribute('href')?.trim()).length,
      title: document.title,
    }));
    report.viewports.push({ ...size, httpStatus: response?.status() ?? null, screenshot: `${size.name}.png`, ...signals, consoleErrors, pageErrors });
    await page.close();
  }
} finally {
  await browser.close();
}
await fs.writeFile(path.join(dest, 'report.json'), JSON.stringify(report, null, 2), 'utf8');
console.log(JSON.stringify(report, null, 2));
if (report.viewports.some(v => v.hasHorizontalOverflow || v.pageErrors.length || (v.httpStatus && v.httpStatus >= 400))) process.exitCode = 1;

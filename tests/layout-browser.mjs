// Exercise the published layout, including resizing and native fullscreen.
import assert from 'node:assert/strict';
import { createRequire } from 'node:module';
import { mkdir } from 'node:fs/promises';
import path from 'node:path';
const require = createRequire(path.resolve(process.env.TEST_DEPENDENCIES || '_viewer/package.json'));
const { default: puppeteer } = await import(require.resolve('puppeteer'));
const base = process.env.SITE_URL || 'http://127.0.0.1:4190/collectionbuilder-3dxr';
const output = process.env.TEST_OUTPUT || '/private/tmp/collectionbuilder-3dxr-layout';
await mkdir(output, { recursive: true });
const browser = await puppeteer.launch({ headless: true });
try {
    const page = await browser.newPage(), errors = [];
    await page.setCacheEnabled(false);
    page.on('pageerror', error => errors.push(error.message));
    page.setDefaultTimeout(60000);
    for (const asset of ['scattering-skull', 'sakura-garden']) {
        await page.setViewport({ width: 1400, height: 1000 });
        await page.goto(`${base}/items/${asset}.html`);
        await page.waitForSelector('.selection-toolbar button:not(:disabled)');
        for (const [width, height] of [[2560, 1440], [1400, 900], [1024, 768], [390, 844]]) {
            await page.setViewport({ width, height });
            await page.evaluate(() => window.scrollTo(0, 0));
            await page.waitForFunction(() => {
                const frame = document.querySelector('.viewer-frame').getBoundingClientRect();
                const viewer = document.querySelector('[data-3dxr-viewer]');
                const top = viewer.getBoundingClientRect().top + scrollY;
                const available = parseFloat(viewer.style.getPropertyValue('--cb-viewer-available-height'));
                return Math.abs((visualViewport?.height ?? innerHeight) - innerHeight) < 1
                    && Math.abs(available - (innerHeight - top)) < 1
                    && frame.width > 0 && frame.bottom <= innerHeight;
            });
            const size = await page.$eval('.viewer-frame', frame => {
                const rect = frame.getBoundingClientRect();
                return { width: rect.width, height: rect.height, left: rect.left, bottom: rect.bottom,
                    viewportWidth: innerWidth, viewportHeight: innerHeight,
                    overflow: document.documentElement.scrollWidth > innerWidth };
            });
            assert(Math.abs(size.width / size.height - 1.8) < .01, 'Viewer lost 9:5 proportions');
            assert(Math.abs(size.left - (width-size.width)/2) < 2, 'Viewer is not centered');
            assert(!size.overflow, 'Horizontal overflow');
            assert(size.width <= 1224.5, 'Viewer exceeds original portal width');
            if (width === 2560) assert(Math.abs(size.width - 1224) < 1, 'Large-screen viewer should match original portal size');
            await page.screenshot({ path: `${output}/${asset}-${width}.png` });
            console.log('PASS', asset, `${width}×${height}`, size);
        }
        await page.setViewport({ width: 1400, height: 900 });
        await page.locator('[aria-label="Fullscreen"]').click();
        await page.waitForFunction(() => !!document.fullscreenElement);
        const fullscreen = await page.$eval('.viewer-frame', element => [element.clientWidth, element.clientHeight]);
        assert.deepEqual(fullscreen, [1400, 900]);
        await page.locator('[aria-label="Exit fullscreen"]').click();
        await page.waitForFunction(() => !document.fullscreenElement);
        // Expanding the mobile navigation changes the shell height without a resize.
        await page.setViewport({ width: 600, height: 1000 });
        await page.locator('.navbar-toggler').click();
        await page.waitForSelector('#page-nav.show');
        await page.waitForFunction(() => document.querySelector('.viewer-frame').getBoundingClientRect().bottom <= innerHeight);
        await page.locator('.navbar-toggler').click();
        await page.waitForFunction(() => !document.querySelector('#page-nav').classList.contains('show'));
    }
    assert.deepEqual(errors, []);
} finally { await browser.close(); }

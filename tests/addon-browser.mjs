// Run against a fresh stock CB-CSV checkout prepared by install-addon.py.
import assert from 'node:assert/strict';
import { createRequire } from 'node:module';
import path from 'node:path';
const require = createRequire(path.resolve(process.env.TEST_DEPENDENCIES || '_viewer/package.json'));
const puppeteer = require('puppeteer');
const base = process.env.SITE_URL;
assert(base, 'Set SITE_URL to the generated fresh-install site');
const browser = await puppeteer.launch({ headless: true });
try {
    const page = await browser.newPage(), errors = [], requests = [];
    page.setDefaultTimeout(45000);
    page.on('pageerror', error => errors.push(error.message));
    page.on('response', response => { if (response.status() >= 400) errors.push(`${response.status()} ${response.url()}`); });
    page.on('request', request => requests.push(request.url()));
    await page.setViewport({ width: 1400, height: 1000 });
    await page.goto(`${base}/items/native-image.html`);
    await page.waitForSelector('#metadata');
    const image = await page.$eval('main .spotlight img', element => ({ loaded: element.complete && element.naturalWidth > 0 }));
    assert(image.loaded, 'Native image item failed to load');
    assert(!requests.some(url => url.includes('/3dxr/')), 'Native image loaded viewer resources');
    for (const id of ['scattering-skull', 'sakura-garden']) {
        await page.goto(`${base}/embed-${id}.html`);
        await page.waitForSelector('.selection-toolbar button:not(:disabled)');
        assert.equal(await page.$$eval('[data-3dxr-viewer]', nodes => nodes.length), 1);
        assert.equal(await page.$eval('figcaption a', element => element.href), `${base}/items/${id}.html`);
        const dimensions = await page.$eval('.viewer-frame', element => {
            const rect = element.getBoundingClientRect();
            return [rect.width, rect.height];
        });
        assert(dimensions[0] > 100 && Math.abs(dimensions[0] / dimensions[1] - 1.8) < .01);
        await page.locator('[aria-label="Measure distance"]').click();
        await page.waitForSelector('.measurement-actions');
        await page.keyboard.press('q');
        // Tool readiness precedes the first streamed draw. Verify actual pixels,
        // rather than accepting an empty canvas as a successful embed.
        const clip = await page.$eval('.viewer-canvas', element => {
            const r = element.getBoundingClientRect();
            return { x: r.x + r.width * .2, y: r.y + r.height * .2,
                width: r.width * .6, height: r.height * .6 };
        });
        let visible = false;
        for (let attempt = 0; attempt < 30 && !visible; attempt++) {
            const png = await page.screenshot({ clip, encoding: 'base64' });
            visible = await page.evaluate(async png => {
                const image = new Image(); image.src = `data:image/png;base64,${png}`;
                await image.decode();
                const canvas = document.createElement('canvas'); canvas.width = canvas.height = 32;
                const context = canvas.getContext('2d'); context.drawImage(image, 0, 0, 32, 32);
                const pixels = context.getImageData(0, 0, 32, 32).data;
                let changed = 0;
                for (let i = 0; i < pixels.length; i += 4) {
                    if (Math.max(...pixels.slice(i, i + 3)) - Math.min(...pixels.slice(i, i + 3)) > 12
                        || Math.abs(pixels[i] - 191) > 18) changed++;
                }
                return changed > 30;
            }, png);
            if (!visible) await new Promise(resolve => setTimeout(resolve, 150));
        }
        assert(visible, `Embedded ${id} canvas remained empty`);
        await page.screenshot({ path: `/private/tmp/cb-addon-embed-${id}.png`, fullPage: true });
        console.log('PASS content embed', id, 'CSS, streaming, tool activation and teardown');
    }
    assert(!requests.some(url => /\/api\/|\/files\//.test(new URL(url).pathname)));
    assert.deepEqual(errors, []);
    console.log('PASS native image isolation; no backend calls or browser/asset errors');
} finally { await browser.close(); }

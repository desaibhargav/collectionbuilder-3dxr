// Integration tests against actual Jekyll output, with real pointer/keyboard input.
// Run from this repository; see docs/3dxr.md. No API responses are intercepted.
import assert from 'node:assert/strict';
import { createRequire } from 'node:module';
import { mkdir, readFile } from 'node:fs/promises';
import path from 'node:path';

const require = createRequire(path.resolve(process.env.TEST_DEPENDENCIES || '_viewer/package.json'));
const { default: puppeteer } = await import(require.resolve('puppeteer'));
const base = process.env.SITE_URL || 'http://127.0.0.1:4190/collectionbuilder-3dxr';
const output = process.env.TEST_OUTPUT || '/private/tmp/collectionbuilder-3dxr-browser';
await mkdir(output, { recursive: true });
const browser = await puppeteer.launch({ headless: true, args: ['--enable-webgl', '--ignore-certificate-errors'] });
const page = await browser.newPage();
await page.setViewport({ width: 1400, height: 1150 });
page.setDefaultTimeout(45000);
const errors = [], requests = [];
page.on('pageerror', error => errors.push(error.message));
page.on('response', response => { if (response.status() >= 400) errors.push(`${response.status()} ${response.url()}`); });
page.on('request', request => requests.push(request.url()));
const settle = () => new Promise(resolve => setTimeout(resolve, 350));
const click = async (scope, text) => {
    const button = await page.evaluateHandle((scope, text) => [...document.querySelectorAll(`${scope} button`)]
        .find(button => button.textContent.trim() === text), scope, text);
    assert(await button.asElement(), `Missing button ${text}`);
    await button.asElement().click(); await button.dispose(); await settle();
};
const handle = () => page.evaluateHandle(() => {
    const node = document.querySelector('.selection-toolbar');
    let fiber = node[Object.keys(node).find(key => key.startsWith('__reactFiber$'))];
    while (fiber && !fiber.memoizedProps?.handle) fiber = fiber.return;
    return fiber.memoizedProps.handle;
});
async function surfacePoints(h) {
    // Use the actual engine picker to locate retained surfaces, then click them.
    return h.evaluate(async h => {
        const node = document.querySelector('.measurement-actions');
        let fiber = node[Object.keys(node).find(key => key.startsWith('__reactFiber$'))];
        while (fiber && !fiber.memoizedProps?.measurement) fiber = fiber.return;
        let hook = fiber.memoizedState;
        while (hook && !hook.memoizedState?.current?.picker?.capture) hook = hook.next;
        const pick = hook.memoizedState.current.picker.capture(h.camera());
        const canvas = h.app.graphicsDevice.canvas.getBoundingClientRect();
        const points = [];
        for (let v = .2; v < .8; v += .1) for (let u = .2; u < .7; u += .1) {
            const x = canvas.x + canvas.width * u, y = canvas.y + canvas.height * v;
            if (document.elementFromPoint(x, y)?.tagName === 'CANVAS' && await pick(u, v)) points.push({ x, y });
        }
        let pair = [], distance = 0;
        for (const a of points) for (const b of points) {
            const next = (a.x-b.x)**2 + (a.y-b.y)**2;
            if (next > distance) { pair = [a,b]; distance = next; }
        }
        return pair;
    });
}
try {
    await page.goto(`${base}/`);
    assert.match(await page.title(), /3D \/ XR Collection/);
    await page.goto(`${base}/browse.html`);
    await page.waitForSelector('#browseItems .card');
    assert.equal(await page.$$eval('#browseItems .card', cards => cards.length), 2);
    await page.locator('#filterTextBox').fill('Skull');
    await page.keyboard.press('Enter'); await settle();
    assert.equal(await page.$$eval('#browseItems .card', cards => cards.length), 1, 'CB filter failed');
    await page.screenshot({ path: `${output}/browse.png`, fullPage: true });
    for (const id of ['scattering-skull', 'sakura-garden']) {
        await page.goto(`${base}/items/${id}.html`);
        await page.waitForSelector('.selection-toolbar button:not(:disabled)');
        await settle();
        const h = await handle();
        assert.equal(await page.$('.viewer-error'), null);
        await page.locator('[aria-label="Select"]').click();
        const canvas = await page.$eval('canvas', element => element.getBoundingClientRect().toJSON());
        await page.mouse.move(canvas.x + canvas.width*.35, canvas.y + canvas.height*.25);
        await page.mouse.down();
        await page.mouse.move(canvas.x + canvas.width*.59, canvas.y + canvas.height*.7, { steps: 8 });
        await page.mouse.up();
        await page.waitForFunction(() => [...document.querySelectorAll('.selection-options button')]
            .some(button => button.textContent === 'Save selection' && !button.disabled));
        await click('.selection-options', 'Save selection');
        await page.waitForSelector('[aria-label="Saved selections"]');
        await page.locator('[aria-label="Color selection yellow"]').click();
        await page.locator('[aria-label="Views"]').click();
        await click('.view-options', 'Create view');
        await page.locator('[aria-label="View name"]').fill('Reference');
        await click('.view-options', 'Save view');
        await page.waitForSelector('[aria-label="Edit view Reference"]');
        await page.locator('[aria-label="Cross section"]').click();
        await page.select('[aria-label="Section reference"]', '1');
        await click('.section-options', 'Enable section');
        await page.locator('[aria-label="Section name"]').fill('Cut');
        await click('.section-options', 'Save section');
        await page.locator('[aria-label="Measure distance"]').click();
        const points = await surfacePoints(h);
        assert.equal(points.length, 2, `No retained surfaces for ${id}`);
        await page.mouse.click(points[0].x, points[0].y);
        await page.waitForFunction(() => document.querySelector('.measurement-actions [role=status]')?.textContent === 'Click the second surface point');
        await page.mouse.click(points[1].x, points[1].y);
        await page.waitForSelector('[aria-label="Measured distance"]');
        await page.locator('[aria-label="Measurement name"]').fill('Retained span');
        await click('.measurement-actions', 'Save measurement');
        await page.waitForSelector('[aria-label="Saved measurements"]');
        await page.locator('[aria-label="Annotate"]').click();
        await click('.annotation-actions', 'Annotate with a point');
        await page.mouse.click(points[0].x, points[0].y);
        await page.waitForSelector('.annotation-actions input[name="title"]');
        await page.locator('.annotation-actions input[name="title"]').fill('Surface note');
        await page.locator('.annotation-actions textarea').fill('A session-local note on the exposed surface.');
        await click('.annotation-actions', 'Save annotation');
        await page.waitForSelector('[aria-label="Saved annotations"]');
        await page.screenshot({ path: `${output}/${id}-composed.png`, fullPage: true });
        await page.locator('[aria-label="Navigate (Q)"]').click();
        await page.mouse.move(canvas.x + canvas.width*.3, canvas.y + canvas.height*.4);
        await page.keyboard.press('Space');
        await page.waitForFunction(() => document.querySelectorAll('.viewport-label').length === 4);
        await page.screenshot({ path: `${output}/${id}-four-views.png` });
        await page.locator('[aria-label="Capture view"]').click();
        const session = await page.createCDPSession();
        await session.send('Browser.setDownloadBehavior', { behavior: 'allow', downloadPath: output, eventsEnabled: true });
        const download = new Promise(resolve => session.on('Browser.downloadProgress', event => { if (event.state === 'completed') resolve(); }));
        await click('.capture-actions', 'Download with annotations');
        await Promise.race([download, new Promise((_, reject) => setTimeout(() => reject(Error('PNG download timed out')), 20000))]);
        await page.goto(`${base}/browse.html`); await page.waitForSelector('#browseItems .card');
        console.log('PASS', id, 'select/save/paint → view/save → section/save → measure/save → annotate/save → four-view PNG → teardown');
    }
    assert(!requests.some(url => /\/api\/|\/files\//.test(new URL(url).pathname)), 'Unexpected portal backend request');
    assert(requests.some(url => url.endsWith('/stream/lod-meta.json')), 'Native streamed SOG was not loaded');
    assert(requests.some(url => url.endsWith('/editing/centers.bin')), 'Static edit map was not loaded');
    assert.deepEqual(errors, []);
    console.log('PASS static hosting, repository paths, CB filtering, no backend calls');
} catch (error) {
    await page.screenshot({ path: `${output}/failure.png`, fullPage: true });
    console.error('Browser errors:', errors);
    throw error;
} finally { await browser.close(); }

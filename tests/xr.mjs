// Native PlayCanvas session integration with Meta's test-only IWER runtime.
// This validates integration, not physical Quest rendering speed or ergonomics.
import assert from 'node:assert/strict';
import { createRequire } from 'node:module';
import { readFile, mkdir } from 'node:fs/promises';
import path from 'node:path';
const require = createRequire(path.resolve(process.env.TEST_DEPENDENCIES || '_viewer/package.json'));
const { default: puppeteer } = await import(require.resolve('puppeteer'));
const iwer = await readFile(process.env.IWER_BUNDLE || path.resolve('_viewer/node_modules/iwer/build/iwer.js'), 'utf8');
const semPath = process.env.SEM_BUNDLE || path.resolve('_viewer/node_modules/@iwer/sem/build/iwer-sem.js');
const sem = await readFile(semPath, 'utf8');
const room = JSON.parse(await readFile(path.resolve(path.dirname(semPath), '../captures/office_small.json'), 'utf8'));
room.spatialEntities = room.spatialEntities.filter(entity => entity.semanticLabel_META === 'FLOOR');
const base = process.env.SITE_URL || 'http://127.0.0.1:4190/collectionbuilder-3dxr';
const output = process.env.TEST_OUTPUT || '/private/tmp/collectionbuilder-3dxr-xr';
await mkdir(output, { recursive: true });
const browser = await puppeteer.launch({ headless: true, args: ['--enable-webgl', '--ignore-certificate-errors'] });
try {
    for (const id of ['scattering-skull', 'sakura-garden']) {
        const page = await browser.newPage(), errors = [];
        await page.setViewport({ width: 1400, height: 1150 });
        page.setDefaultTimeout(45000);
        page.on('pageerror', error => errors.push(error.message));
        await page.evaluateOnNewDocument(iwer + sem + `
            window.xrDevice = new IWER.XRDevice(IWER.metaQuest3, { stereoEnabled: true });
            window.xrDevice.installSEM(IWER_SEM.SyntheticEnvironmentModule);
            window.xrDevice.installRuntime({ forceInstall: true });
        `);
        await page.goto(`${base}/items/${id}.html`);
        await page.evaluate(room => window.xrDevice.sem.loadEnvironment(room), room);
        await page.waitForSelector('.selection-toolbar button:not(:disabled)');
        const h = await page.evaluateHandle(() => {
            const node = document.querySelector('.selection-toolbar');
            let fiber = node[Object.keys(node).find(key => key.startsWith('__reactFiber$'))];
            while (fiber && !fiber.memoizedProps?.handle) fiber = fiber.return;
            return fiber.memoizedProps.handle;
        });
        for (const mode of ['View in VR', 'View in your room']) {
            await page.locator(`[aria-label="${mode}"]`).click();
            await page.waitForFunction(h => h.app.xr.active, {}, h);
            await page.waitForFunction(h => !!h.app.root.findByName('XR tool bar'), { timeout: 15000 }, h);
            await page.waitForFunction(() => document.querySelector('.viewer-frame')?.dataset.immersive === 'true');
            await h.evaluate(async h => {
                while (h.app.xr.views.list.length !== 2) await new Promise(requestAnimationFrame);
                for (let i = 0; i < 6; i++) await new Promise(resolve => h.app.once('postrender', resolve));
            });
            if (mode === 'View in your room') {
                await page.evaluate(() => {
                    const c = window.xrDevice.controllers.left;
                    c.position.set(.3, 1.3, -.5);
                    c.quaternion.set(-Math.sin(7*Math.PI/36), 0, 0, Math.cos(7*Math.PI/36));
                });
                await page.waitForFunction(h => h.app.root.findByName('AR placement target')?.enabled, {}, h);
                await page.evaluate(() => window.xrDevice.controllers.left.updateButtonValue('trigger', 1));
                await page.waitForFunction(h => h.app.root.findByName('Immersive artifact')?.enabled, {}, h);
                await page.evaluate(() => window.xrDevice.controllers.left.updateButtonValue('trigger', 0));
            }
            await new Promise(resolve => setTimeout(resolve, 1200));
            await page.screenshot({ path: `${output}/${id}-${mode.includes('VR')?'vr':'ar'}.png` });
            // Native session end represents the headset/browser system exit action.
            await h.evaluate(h => new Promise(resolve => h.app.xr.end(resolve)));
            await page.waitForFunction(h => !h.app.xr.active, {}, h);
            assert.equal(await h.evaluate(h => !!h.app.root.findByName('Immersive artifact')), false, 'XR teardown leaked presentation');
            await page.waitForSelector('.selection-toolbar button:not(:disabled)');
            console.log('PASS', id, mode, 'native stereo session → shared toolbar → exit → desktop');
        }
        assert.deepEqual(errors, []);
        await page.goto(`${base}/browse.html`); await page.close();
    }
} finally { await browser.close(); }

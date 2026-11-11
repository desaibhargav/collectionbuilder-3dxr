// Verify CollectionBuilder's native location cloud, map and year-grouped timeline.
import assert from 'node:assert/strict';
import { createRequire } from 'node:module';
import { mkdir } from 'node:fs/promises';
import path from 'node:path';
const require = createRequire(path.resolve(process.env.TEST_DEPENDENCIES || '_viewer/package.json'));
const { default: puppeteer } = await import(require.resolve('puppeteer'));
const base = process.env.SITE_URL || 'http://127.0.0.1:4190/collectionbuilder-3dxr';
const output = process.env.TEST_OUTPUT || '/private/tmp/collectionbuilder-3dxr-metadata';
await mkdir(output, { recursive: true });
const browser = await puppeteer.launch({ headless: true, args: ['--ignore-certificate-errors'] });
const page = await browser.newPage(), errors = [];
await page.setViewport({ width: 1400, height: 1000 });
page.setDefaultTimeout(20000);
page.on('pageerror', error => errors.push(error.message));
try {
    for (const [place, title] of [['Myles Brand Hall', 'Scattering Skull'], ['Luddy Hall', 'Sakura Garden']]) {
        await page.goto(`${base}/locations.html`);
        const label = '#cloud-div-location a';
        await page.waitForSelector(label);
        assert.equal(await page.$$eval(label, elements => elements.length), 2);
        const link = await page.evaluateHandle((selector, place) => [...document.querySelectorAll(selector)]
            .find(element => element.textContent.toLowerCase().includes(place.toLowerCase())), label, place);
        await link.asElement().click();
        await page.waitForSelector('#browseItems .card');
        assert.equal(await page.$$eval('#browseItems .card', cards => cards.length), 1);
        assert.match(await page.$eval('#browseItems', element => element.textContent), new RegExp(title));
    }
    await page.goto(`${base}/locations.html`);
    await page.waitForSelector('#cloud-div-location a');
    await page.screenshot({ path: `${output}/locations.png`, fullPage: true });
    await page.goto(`${base}/timeline.html`);
    assert.equal(await page.$$eval('#y2026 .timeline-thumb', nodes => nodes.length), 2);
    await page.screenshot({ path: `${output}/timeline.png`, fullPage: true });
    await page.goto(`${base}/map.html`);
    await page.waitForSelector('.leaflet-marker-icon');
    const geo = await page.evaluate(async base => (await fetch(`${base}/assets/data/geodata.json`)).json(), base);
    assert.equal(geo.features.length, 2);
    assert.deepEqual(geo.features.map(feature => feature.geometry.coordinates).sort(),
        [[-86.52316, 39.17198], [-86.52302, 39.17298]].sort());
    // Native map auto-framing should show two independent, clickable markers.
    await page.waitForFunction(() => document.querySelectorAll('.leaflet-marker-icon').length === 2);
    const places = new Set();
    for (let index = 0; index < 2; index++) {
        const markers = await page.$$('.leaflet-marker-icon');
        await markers[index].click();
        await page.waitForSelector('.leaflet-popup-content');
        const text = await page.$eval('.leaflet-popup-content', element => element.textContent);
        places.add(text.includes('Myles Brand Hall') ? 'Myles Brand Hall' : text.includes('Luddy Hall') ? 'Luddy Hall' : 'Unknown');
        await new Promise(resolve => setTimeout(resolve, 300));
        await page.screenshot({ path: `${output}/map-${index}.png`, fullPage: true });
        await page.click('.leaflet-popup-close-button');
        await page.waitForSelector('.leaflet-popup-content', { hidden: true });
    }
    assert.deepEqual([...places].sort(), ['Luddy Hall', 'Myles Brand Hall']);
    await page.goto(`${base}/items/scattering-skull.html`, { waitUntil: 'domcontentloaded' });
    assert.match(await page.$eval('#item-metadata', element => element.textContent), /2026-11-07T21:32:03-05:00/);
    assert.match(await page.$eval('#item-metadata', element => element.textContent), /not the original capture location/);
    assert.deepEqual(errors, []);
    console.log('PASS two locations → distinct filtered records, separate map pins/popups, timeline and demo timestamp');
} catch (error) {
    await page.screenshot({ path: `${output}/failure.png`, fullPage: true });
    throw error;
} finally { await browser.close(); }

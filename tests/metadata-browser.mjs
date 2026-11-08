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
    await page.goto(`${base}/locations.html`);
    const label = '#cloud-div-location a';
    await page.waitForSelector(label);
    assert.match(await page.$eval(label, element => element.textContent), /Luddy Hall/i);
    await page.screenshot({ path: `${output}/locations.png`, fullPage: true });
    await page.click(label);
    await page.waitForSelector('#browseItems .card');
    assert.equal(await page.$$eval('#browseItems .card', cards => cards.length), 2);
    assert.match(decodeURIComponent(page.url()), /location:Luddy Hall/i);
    await page.goto(`${base}/timeline.html`);
    assert.equal(await page.$$eval('#y2026 .timeline-thumb', nodes => nodes.length), 2);
    await page.screenshot({ path: `${output}/timeline.png`, fullPage: true });
    await page.goto(`${base}/map.html`);
    await page.waitForSelector('.leaflet-marker-icon');
    const geo = await page.evaluate(async base => (await fetch(`${base}/assets/data/geodata.json`)).json(), base);
    assert.equal(geo.features.length, 2);
    for (const feature of geo.features) assert.deepEqual(feature.geometry.coordinates, [-86.52302, 39.17298]);
    // CB uses singleMarkerMode: individual records also have cluster styling.
    await page.click('.marker-cluster');
    await page.waitForFunction(() => [...document.querySelectorAll('.leaflet-marker-icon')]
        .some(element => /cluster of 1 items/.test(element.textContent)));
    const marker = await page.evaluateHandle(() => [...document.querySelectorAll('.leaflet-marker-icon')]
        .find(element => /cluster of 1 items/.test(element.textContent)));
    await marker.asElement().click();
    await page.waitForSelector('.leaflet-popup-content');
    assert.match(await page.$eval('.leaflet-popup-content', element => element.textContent), /Luddy Hall/i);
    await page.screenshot({ path: `${output}/map.png`, fullPage: true });
    await page.goto(`${base}/items/scattering-skull.html`, { waitUntil: 'domcontentloaded' });
    assert.match(await page.$eval('#item-metadata', element => element.textContent), /2026-11-07T21:32:03-05:00/);
    assert.match(await page.$eval('#item-metadata', element => element.textContent), /not the original capture location/);
    assert.deepEqual(errors, []);
    console.log('PASS location cloud → filtered collection, two timeline records, map cluster/popup and demo timestamp');
} catch (error) {
    await page.screenshot({ path: `${output}/failure.png`, fullPage: true });
    throw error;
} finally { await browser.close(); }

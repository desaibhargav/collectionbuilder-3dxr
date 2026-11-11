# 3D / XR template

This independent CollectionBuilder-based template combines CollectionBuilder's
metadata generation, browsing, facets, search and rights presentation with a
precompiled React/PlayCanvas viewer. It is not an official CollectionBuilder release.
No API, database, derivative-processing service or Node installation is required
for ordinary website builds.

## Curator workflow

1. Supply prepared **public derivatives**, never preservation masters.
2. Put files under `objects/`, or host them at HTTPS URLs allowing cross-origin
   requests. Preserve the complete directory structure of streamed SOG bundles.
   The starter `.gitignore` permits only the approved sample directories under
   `objects/`. Add an explicit exception such as `!objects/my-public-model/` for
   each additional derivative directory you intend to publish. This prevents
   accidentally committing unrelated/private objects.
3. Copy `_data/3dxr-metadata.csv`, edit its records and set `_config.yml`'s
   `metadata` to your new filename without `.csv`.
4. Configure the site identity, `url` and `baseurl` in `_config.yml`.
5. Push to your repository. In GitHub Settings → Pages, select **GitHub Actions**.
   The included workflow builds Jekyll and publishes `_site`. It does not compile
   the viewer or process geometry.

For a project named `collectionbuilder-3dxr` at `username.github.io`, use
`url: https://username.github.io` and `baseurl: /collectionbuilder-3dxr`.
For a domain-root deployment set `baseurl: ""`. Object paths in CSV are
site-relative, e.g. `/objects/skull/content.glb`; do not manually prepend baseurl.

## Metadata

Keep CollectionBuilder's descriptive fields, `type`, `format`, thumbnails and
rights. `type` describes the object; it does not select the rendering engine.

| Field | Meaning |
| --- | --- |
| `display_template` | `3dxr`, one layout shared by meshes and splats |
| `viewer_type` | `mesh` or `splat` |
| `object_location` | Public GLB, SOG `meta.json`/`.sog`, or native `lod-meta.json` |
| `viewer_lod` | Optional: our streamed-splat edit-correspondence descriptor |
| `image_thumb`, `image_small` | Prepared preview images; no gallery WebGL instances |

Sakura uses `stream/lod-meta.json` as `object_location` and `lod.json` as
`viewer_lod`. The latter references edit maps for stable canonical selection and
paint across native detail levels. It is not a replacement for PlayCanvas's
native stream index. An arbitrary third-party streamed bundle without these maps
is not yet guaranteed full editing support. Non-streamed SOG does not need them.
The current adapter retains the original three-level 30/15/7.5% policy; generalized
external streamed editing is a documented future integration, not silently inferred.

Our server normally sends `.bin.gz` edit maps with `Content-Encoding: gzip`.
Static hosts need no custom headers: the included example publishes decompressed
`.bin` files and updates **only** their references in `lod.json`. No geometry is
regenerated and no runtime decompression is added.

## Editing and XR

Selection, paint, measurements, annotations, segments, views, sections and capture
run locally in the browser. Save keeps tool records in the current viewing session.
Reloading/navigating away discards them. Persistent/shared editing is out of scope.
Edits do not change source files. Distances remain unitless without calibration.

XR requires HTTPS, device support and user permission. Supported sessions expose
VR/AR controls; unsupported browsers keep desktop tools. XR currently exposes Navigate, Select, Measure, Annotate, Views and Sectioning;
Segment and Capture editors remain desktop-only. Four views are
desktop-only. Do not claim hardware compatibility from emulator results alone.

Controller models currently come from PlayCanvas's input-profile CDN. The site
and sample geometry require no AWS service, but XR controller-model downloads still
require network access; a fully offline XR package is not claimed.

## Integration boundaries

- `_plugins/cb_page_gen.rb` remains unchanged: `display_template` chooses the layout.
- `_layouts/item/3dxr.html` composes standard metadata/rights/navigation includes.
- `_includes/item/playcanvas-viewer.html` passes escaped public metadata attributes.
- `_includes/js/3dxr.html` loads the bundle through documented `custom-foot`.
- `_sass/_custom.scss` owns scoped viewer and collection presentation styles.
- CollectionBuilder's existing browse/search scripts and config CSVs remain intact.
- `_viewer/` contains excluded developer source; see its README for rebuilding.

## Publication and viewer updates

The GitHub Actions workflow at `.github/workflows/pages.yml` is an addition made
by this 3D/XR extension. The inherited template revision did not contain a Pages
workflow. It runs on pushes to `main` or manual dispatch, builds Jekyll, and deploys
`_site` to GitHub Pages. Select GitHub Actions in the repository's Pages settings.

**Jekyll does not compile React/TypeScript.** It generates the collection pages
and copies the committed viewer resources into the generated site. In the browser,
the compiled viewer mounts inside the item layout's container. CSV/configuration
changes need only the Jekyll build; viewer source or dependency changes require
the developer build before publication.

`_viewer/` is our extension's developer-source convention, not a directory required
by CollectionBuilder. It is explicitly excluded in `_config.yml`. Compiled output
belongs in `assets/lib/3dxr/runtime/`; scoped styles belong in `_sass/_custom.scss`.
CollectionBuilder's `CONTRIBUTING.md` directs project technical documentation to
`docs/`, so this document explains the integration and
[`_viewer/README.md`](../_viewer/README.md) supplies the build instructions.

When changing the viewer:

1. Use Node 24 and run `npm ci`, `npm test`, and `npm run build` under `_viewer/`.
   The build checks TypeScript and compiles the production JavaScript, workers,
   chunks and imported resources.
2. Build Jekyll and test the generated site using the browser checks below,
   including root and repository-subpath URLs. Recheck physical headset behavior
   for XR changes; emulation alone cannot establish it.
3. Commit the source, any changed lockfile, and regenerated runtime files together.
   Preserve third-party notices and update them when dependencies change.
4. Push the reviewed changes; the Pages workflow publishes those committed files.

The Pages workflow does not currently rebuild or check whether the viewer bundle
matches its source. A source-only change will therefore leave the published viewer
unchanged. Updates to the original mesh-splat portal repository are not automatically
synchronized into this template either. Follow the provenance and adaptation notes
in `_viewer/README.md` when updating the copied viewer.

## Verification

Build production Jekyll output and serve it over HTTP before running browser tests.
Test both `--baseurl /collectionbuilder-3dxr` and `--baseurl ''`; assert requests use
that path and do not call our old `/api` or `/files` services. Browser tests use
only the static site. Capture screenshots and fail on application/asset errors.
The source viewer unit tests remain available with `npm test` under `_viewer`.

### Repeatable browser tests (developer only)

After `npm ci` under `_viewer`, serve the production `_site` directory using any
static HTTP server. From the repository root run:

```sh
SITE_URL=http://127.0.0.1:4000/collectionbuilder-3dxr node tests/browser.mjs
SITE_URL=http://127.0.0.1:4000/collectionbuilder-3dxr node tests/xr.mjs
```

The developer dependencies include Puppeteer and Meta IWER; none is loaded by
ordinary site visitors. `TEST_OUTPUT` selects the screenshots/download directory.
The first suite exercises metadata filtering, selection/save/paint, shared views,
sectioned measurement, four-view PNG capture and teardown. The second checks
native VR/AR entry, toolbar creation, exit and desktop recovery on both formats.
These integration checks supplement the inherited viewer unit tests and do not
replace physical headset testing.

## Demonstration geographic and temporal metadata

The skull uses Myles Brand Hall and Sakura uses Luddy Hall, both at Indiana
University Bloomington. Both records use
`2026-11-07T21:32:03-05:00` (America/Indiana/Indianapolis) for demonstration.
These values are explicitly **not original scan provenance**. The standard `date`
field contains `2026-11-07` for the native year-grouped Timeline; the added
`demo_recorded_at` field preserves the time and offset on item pages.

Locations groups place-name labels by frequency and links to filtered browsing;
Map plots latitude/longitude at the two distinct demonstration locations.
Coordinates are approximate building-centre coordinates, not surveyed positions.
Address reference: https://luddy.iu.edu/about/contact.html
Coordinate references (OpenStreetMap-based): https://mapcarta.com/W630774103
and https://mapcarta.com/W154762733.
Replace/remove the demo fields and labels when supplying real collection metadata.

## Item layout

Items use the original mesh/splat portal's centered 1320px page with responsive
gutters (1224px viewer width on large screens). The viewer retains a 9:5 ratio
and shrinks when needed to fit the space below the actual collection header and
item heading. Metadata remains below the viewer in the centered page column.
Native ResizeObserver/viewport events update the available height only on layout
changes; no animation loop or new engine render pass is used. Fullscreen fills
the window independently of the embedded viewer dimensions.

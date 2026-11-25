# Integration verification — 2026-11-07

The precompiled production viewer was built from the adapted source and exercised
inside actual Jekyll-generated pages, served by a plain static HTTP server.

- 121 inherited viewer unit tests passed; TypeScript and Vite production build passed.
- Production Jekyll builds passed at `/collectionbuilder-3dxr` and at the domain root.
- Browser checks on both public samples passed: CollectionBuilder metadata filtering,
  selection/save, color, view/save → section/save → retained-surface measurement/save,
  point annotation/save, four-view annotated PNG download, and navigation teardown.
- Requests used local `objects/` files and relative bundled worker/lighting resources;
  no `/api/` or `/files/` backend requests occurred. Plain binary correspondence data
  loaded without custom Content-Encoding response headers.
- Meta IWER checks passed for both formats: native two-eye VR rendering, AR floor
  hit-test preview and left-controller placement, spatial toolbar, system-session exit
  and desktop recovery. Rendered screenshots were inspected.
- No application exceptions or missing-resource responses occurred in the completed
  desktop integration runs. Source, tests and processing inputs are absent from the
  generated public site; only the selected derivatives are included.

Domain-root tests covered paint and four-view capture; the expanded annotated-capture
suite was also run on the repository-path build. See `tests/browser.mjs` and
`tests/xr.mjs` for repeatable checks. Screenshots/downloads remain test artifacts,
not collection objects or repository source.

This does not certify physical Quest performance, every XR tool gesture, or all
third-party SOG layouts. No derivative generation, shared editing, persistent saving,
or cross-repository synchronization was added.

## Copy-in add-on verification

The actual `assets/downloads/virtual-heritage-viewer.zip` was installed into a
clean checkout of upstream CollectionBuilder-CSV revision
`eced880e325a96667b31af6b846ce5d1f9af180b`. Installation asserted that every existing
file retained its original SHA-256 digest, with no path collisions. Only afterwards
were normal curator configuration and public sample fixtures supplied for testing.

- The ZIP contains 32 allowlisted files: layouts, includes, scoped SCSS, compiled
  runtime/resources, licenses and a README. No demo site configuration, developer
  source, processing code or geometry is included. Two package builds were
  byte-identical; the Pages workflow checks that the committed ZIP is current.
- Jekyll production builds passed for repository-subpath and domain-root hosting.
  No Node compilation is required by an installed collection.
- Real browser cross-tool workflows passed on the fresh installation for both
  formats and both URL configurations, using `tests/browser.mjs` with three
  collection records: mesh, streamed splat and an ordinary image item.
- Content-page embeds passed native-image isolation, caption links, measurement
  activation, rendered-asset pixel checks and page teardown. A second clean install
  checked `viewer_type` inference when the explicit metadata value is omitted.
- Native image pages loaded without viewer scripts/styles. The existing demo's
  desktop/mobile sizing and fullscreen checks passed after stylesheet extraction.
- This packaging change does not establish new physical headset compatibility or
  performance results. The one-interactive-viewer-per-page support limit remains.

To repeat: clone stock CB-CSV into an empty temporary directory and run
`python3 tests/install-addon.py /path/to/checkout`. It installs the real ZIP,
checks preservation, then prepares test metadata, public assets and embed pages.
Build that checkout using its normal Jekyll dependencies and serve the generated
output. From this repository run the following with the served URL:

```sh
TEST_COLLECTION_SIZE=3 TEST_FILTERED_SIZE=2 SITE_URL=http://127.0.0.1:4192/collectionbuilder-3dxr node tests/browser.mjs
SITE_URL=http://127.0.0.1:4192/collectionbuilder-3dxr node tests/addon-browser.mjs
```

Install developer test dependencies with `npm ci` under `_viewer/` first. For a
domain-root check, rebuild with an empty baseurl and set SITE_URL to the origin.
The broader inherited display-type matrix is not covered by the single image
regression, and emulated XR checks do not replace target-device testing.

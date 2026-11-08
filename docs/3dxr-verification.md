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

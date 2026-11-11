# Viewer source (developer use only)

The website uses the precompiled resources in `assets/lib/3dxr/runtime/`.
Normal collection changes require only Jekyll. This directory is excluded from
publication; it does not contain asset-processing or server code.

## Reproduce the bundle

Use Node 24, then from this directory:

```sh
npm ci
npm test
npm run build
```

Commit the resulting runtime files along with source changes. Vite uses relative
chunk/worker/image URLs so the bundle works at a domain root or repository path.
**Rebuild after every viewer source or dependency change.** Jekyll and the Pages
Action only copy the committed bundle; they do not compile this directory or check
that the bundle matches its source. Source-only commits do not update the viewer
seen by visitors. This directory is our extension's addition, not an upstream
CollectionBuilder requirement. See the
[publication and update procedure](../docs/3dxr.md#publication-and-viewer-updates)
for the complete developer workflow and verification steps.
Viewer styles are scoped under `.cb-viewer` in `_sass/_custom.scss` to follow
CollectionBuilder's customization convention. Rebuild Jekyll after changing them.

## Provenance and changes

Copied from `mesh-splat-portal-web` commit
`44c972880779c190f77a80cf341a9bd6030fbd71` (Apache-2.0; see LICENSE).
Original engine/library notices remain in `assets/lib/3dxr/licenses/`.
The surrounding CollectionBuilder code retains its original license.

The integration replaces the API schema with a viewer input interface, adds
`src/mount.tsx`, and makes the lighting URL bundle-relative. Rendering, tools,
worker algorithms, shared documents and XR adapters retain their original logic.
Inherited source keeps its original formatting to make future comparison possible;
new integration HTML/JS uses four spaces and YAML uses two.

Do not introduce server dependencies, forced high-detail rendering, separate
mesh/splat editing UX, or persistent edit promises. XR uses native PlayCanvas
sessions and the same tool records. Test minified production output, real pointer
workflows, streaming selection/paint, view → section → measurement, and teardown.
Emulated XR does not establish physical Quest performance or ergonomics.

Source documentation: https://github.com/desaibhargav/mesh-splat-portal-web/tree/main/docs

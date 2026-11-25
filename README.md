# Virtual Heritage Viewer

CollectionBuilder-CSV Add-on: Mesh, Gaussian Splat and XR Viewer

This project provides files to add an interactive heritage viewer to an existing
[CollectionBuilder-CSV](https://github.com/CollectionBuilder/collectionbuilder-csv)
collection. The [add-on ZIP](https://desaibhargav.github.io/collectionbuilder-3dxr/assets/downloads/virtual-heritage-viewer.zip)
contains the files to copy into your project. This repository also contains the
[working demonstration](https://desaibhargav.github.io/collectionbuilder-3dxr/)
and developer source; do not copy the whole repository over an existing collection.

**Note:** compatible with CB-CSV; other CollectionBuilder templates are not supported
out of the box. This is an independent contribution, not an official CB release.

## Virtual Heritage Viewer

The viewer uses [PlayCanvas](https://playcanvas.com/) to display prepared GLB
meshes and SOG Gaussian splats, including streamed SOG. It provides selection,
paint, measurement, annotation, views, sectioning, segmentation and capture tools,
with immersive AR/VR tools on supported devices.

Viewer libraries and styles are bundled in the add-on. Curators need no Node
build, application server or database. XR requires HTTPS and device support;
controller models currently download from PlayCanvas's CDN. Save actions retain
edits only for the current viewing session. See [supported features and limits](docs/addon-installation.md#inputs-and-limits).

## How To Use

Add to a CB-CSV project:

- Start with an existing CollectionBuilder-CSV project.
- Download the [add-on ZIP](https://desaibhargav.github.io/collectionbuilder-3dxr/assets/downloads/virtual-heritage-viewer.zip) and unzip it.
- Copy its `_includes/`, `_layouts/`, `_sass/` and `assets/` contents into the
  matching folders of your project. **Add the files without replacing existing
  folders or overwriting existing files.** Keep the ZIP's README as instructions;
  do not replace your project's README.
- Publish with your existing Jekyll workflow. Your homepage, browse cards,
  navigation, metadata configuration and `_custom.scss` remain unchanged.

Prepare your objects:

- Supply public derivatives and thumbnails, never preservation masters.
- Put objects under `objects/` or another HTTPS-accessible location. Preserve
  the complete directory structure of streamed SOG bundles.
- Asset conversion, recovery and derivative generation happen beforehand and
  are not included in the add-on. Streamed editing has additional correspondence
  requirements described in the [installation guide](docs/addon-installation.md).

### Embed on a Content Page

Use the objectid of a mesh or splat record in your metadata:

```liquid
{% include feature/virtual-heritage-viewer.html objectid="my-mesh" %}
```

Optional: `caption="Your caption"` or `caption=false`. Use one interactive viewer
per page. No site-wide scripts or stylesheet changes are needed.

### Add to Item Pages

- Set `object_location` to the GLB file, SOG file/metadata or streamed `lod-meta.json`.
- Set `display_template` to `mesh` or `splat`.
- Provide `title`, `image_thumb`, `image_small`, `image_alt_text` and your usual
  descriptive metadata. For our streamed-editing workflow, also supply `viewer_lod`.
- Native CB item headings, metadata, attribution, rights and navigation surround
  the viewer. Non-3D item types continue to use their existing layouts.

See [installation, updates and removal](docs/addon-installation.md),
[developer source and builds](_viewer/README.md),
[integration details](docs/3dxr.md) and [sample provenance](objects/3dxr-sources.md).

## Licenses

The adapted viewer remains Apache-2.0; CollectionBuilder code retains MIT.
Bundled third-party notices are in `assets/lib/3dxr/licenses/`. Collection objects
have their own rights. No licensing change is included in this packaging work.

# Virtual Heritage Viewer — CollectionBuilder-CSV add-on

CollectionBuilder-CSV Add-on: Mesh, Gaussian Splat and XR Viewer

Adds mesh and Gaussian-splat viewing, session-local inspection tools and supported
immersive AR/VR to an existing CollectionBuilder-CSV project. This independent
add-on is not an official CollectionBuilder release. CB-GH is not supported.

## How To Use

1. Back up or commit your existing collection. Unzip the add-on download.
2. Merge the ZIP's `_layouts/`, `_includes/`, `_sass/` and `assets/` folders into
   the matching folders of your CB-CSV repository. **Add the new files; do not
   replace whole folders or overwrite existing files.** Keep this README as
   reference rather than replacing your collection's README.
3. Supply prepared public GLB or SOG assets and thumbnails under `objects/`, or
   use HTTPS hosting with suitable cross-origin access. Never publish masters.
   Preserve all files and relative paths in streamed-SOG directories. Check your
   repository's `.gitignore` before committing public derivatives.
4. Add records to your existing metadata CSV. Keep CB's usual descriptive fields;
   set the fields below. Keep `_config.yml`'s metadata pointer on your own CSV.
5. Build and publish using your existing CB-CSV workflow. No Node compilation,
   processing service, database or new deployment workflow is required.

| Field | Mesh | Splat |
| --- | --- | --- |
| `objectid` | A unique lowercase ID, such as `my-mesh` | A unique lowercase ID, such as `my-splat` |
| `title` | Your descriptive title | Your descriptive title |
| `display_template` | `mesh` | `splat` |
| `object_location` | `/objects/my-mesh/content.glb` | `/objects/my-splat/stream/lod-meta.json`, SOG `meta.json` or `.sog` |
| `image_small`, `image_thumb` | Prepared thumbnail paths | Prepared thumbnail paths |
| `image_alt_text` | Description of the preview | Description of the preview |
| `viewer_type` | Optional `mesh`; inferred from display_template | Optional `splat`; inferred from display_template |
| `viewer_lod` | Leave blank | Optional edit-correspondence descriptor; see limits below |

Use site-relative paths without your deployment's `baseurl`; full HTTPS URLs are
also supported. Existing records using `display_template: 3dxr` must still provide
`viewer_type: mesh` or `splat`. Native item headings, metadata, rights, navigation,
homepage and browse cards remain supplied by CB-CSV.

## Embed in a content page

Use a mesh/splat record already in the metadata CSV. Add this to a Markdown page
with normal Jekyll front matter:

```liquid
{% include feature/virtual-heritage-viewer.html objectid="my-mesh" %}
```

Optional `caption="Your caption"` replaces the title, or `caption=false` hides it.
Use **one interactive viewer per page**. Viewer resources load only on pages that
embed it; galleries and browse pages continue to use previews. The include loads
its resources automatically; do not add site-wide scripts or styles.

## Inputs and limits

- Save retains edits only for the current viewing session. Reloading discards
  them; no source object is modified and there is no shared/persistent saving.
- Full editing of arbitrary third-party streamed SOG is not guaranteed. The
  demonstrated streamed workflow requires our correspondence descriptor/maps
  and currently assumes three levels, 30/15/7.5%. Non-streamed SOG needs no maps.
  Prepare these assets offline; processing is not part of the add-on.
- Static hosts should serve correspondence maps as plain `.bin` files, with
  matching descriptor references, rather than relying on gzip response headers.
- XR requires HTTPS and device support. Navigate, Select, Measure, Annotate,
  Views and Sectioning have XR interfaces; Segment and Capture editors and four
  views remain desktop-only. Controller models currently use PlayCanvas's CDN.
  A fully offline XR experience is not claimed. Test actual target headsets.
- Interactive 3D accessibility has not been fully audited. Supply useful textual
  descriptions and preview alternatives; metadata remains available without JS.
- Sample data and derivative processing are not included. The demonstration is
  https://desaibhargav.github.io/collectionbuilder-3dxr/ and its public objects
  and provenance are in that repository.

## Update or remove

For an update, commit/back up first and review the new ZIP's file list. Replace
only files from the previous add-on installation. Remove the previous add-on's
`assets/lib/3dxr/runtime/` before copying its replacement so obsolete hashed
workers/chunks do not accumulate. Preserve your own files and collection config.
Test both existing ordinary items and mesh/splat records before publishing.

To remove, change viewer records to a native display type such as `record`, remove
content-page viewer includes, then remove only the installed add-on files.
Retain your metadata, objects, `_config.yml`, custom styles and existing workflow.

## Maintenance and licenses

The ZIP contains compiled JavaScript, workers, library resources, scoped SCSS and
licenses. Jekyll compiles `assets/lib/3dxr/viewer.scss` into `viewer.css`, using
`_sass/_virtual-heritage-viewer.scss`; your `_sass/_custom.scss` is untouched.

Developer source and reproducible build/test instructions are maintained in
https://github.com/desaibhargav/collectionbuilder-3dxr/tree/main/_viewer . They are
not required for installation. Build packages with `python3 scripts/package-addon.py`
from the development repository after updating and testing the committed runtime.

The adapted viewer remains Apache-2.0; CB code and third-party libraries retain
their own licenses. Notices are in `assets/lib/3dxr/licenses/`. This package does
not change licenses or resolve the separate program licensing discussion.

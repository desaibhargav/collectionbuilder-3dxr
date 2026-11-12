# Review against CollectionBuilder conventions

Reviewed 2026-11-10 against this repository's `HUMANS.md`, `AGENTS.md` and
`CONTRIBUTING.md`, comparing the extension with inherited revision `6018353`.
This is an implementation review, not approval from the CollectionBuilder team.

## Architecture

`HUMANS.md` distinguishes routine configuration changes from deliberately
commissioned new templates. Its “Going bigger” section explicitly permits new
layouts/includes and gives a 3D object viewer as an example. This extension uses
that path; the presence of new templates is not itself a violation.

| Convention | Implementation reviewed |
| --- | --- |
| Prefer CSV/YAML for collection configuration | Identity, metadata pointer, map settings and displayed fields remain in `_config.yml`, `_data/theme.yml` and config CSVs. |
| Generate items from metadata | Existing `_plugins/cb_page_gen.rb` is unchanged; `display_template: 3dxr` resolves to the new layout. No item pages are hand-authored. |
| Retain native metadata and navigation | The new item layout composes existing breadcrumb, metadata, citation, rights and browse-button includes. Existing includes and browse/search configuration logic are unchanged. |
| Use feature includes for authored content | The custom home layout uses the existing `feature/gallery.html`; its new hero is extension-specific markup. |
| Keep custom styling in `_sass/_custom.scss` | Base styles are unchanged. Viewer styles are scoped under `.cb-viewer`; collection presentation rules use extension classes or the existing browse container. |
| Use extension hooks | Item JavaScript is loaded through the existing `custom-foot` hook. Public paths use `relative_url`. |
| Keep normal publication simple | The committed bundle lets the Pages Action run Jekyll without Node, a database, an API or geometry processing. |
| Keep technical documentation under `docs/` | `docs/3dxr.md` describes curator inputs and integration; `_viewer/README.md` documents the reproducible developer build. |
| Preserve existing item types | Existing item layouts, generator and core includes are unchanged; the new renderer runs only on `3dxr` items. |

## Deliberate costs and remaining limits

- React/PlayCanvas adds considerably more source and browser code than a normal
  CollectionBuilder image viewer. It is confined to the optional 3D display type;
  galleries use thumbnails rather than live 3D canvases. This is a specialized
  template, not a claim that every CollectionBuilder collection needs these tools.
- Maintainers need Node 24 to change the viewer. Curators do not. Source and
  compiled output must be updated together; the current Pages workflow does not
  detect stale bundles. Portal-to-template synchronization is not automated.
- The copied viewer retains its original formatting for source comparison;
  new integration HTML/JavaScript follows CollectionBuilder's four-space
  convention. The large inherited viewer should not be presented as introductory
  CollectionBuilder code.
- Metadata remains readable without JavaScript and a `noscript` message explains
  the viewer requirement. Full accessibility of interactive 3D/XR controls has
  not been established by this architecture review.
- Existing non-3D layouts are preserved by source comparison. A complete mixed
  collection regression covering every built-in display type has not been run.
- Session-only editing, physical headset verification, external streamed-SOG
  correspondence requirements and controller-model CDN requests remain documented
  in `3dxr.md`. They are not hidden server requirements.
- Program licensing is a separate unresolved delivery issue: the inherited
  CollectionBuilder code is MIT, while the adapted viewer is Apache-2.0. The
  program's MIT-code/CC-SA-content requirement needs explicit resolution; this
  review does not relicense code or establish new rights to sample objects.

## Future changes

Keep framework architecture rules in `AGENTS.md`, as `HUMANS.md` requests; do not
duplicate them into a competing human/agent ruleset. Keep implementation explanations
in `docs/`. Before changing core includes or algorithms, check the configuration
hierarchy and existing feature includes. Test generated production pages after
behavioral changes, including repository-subpath URLs and cross-tool workflows.

---
title: About
layout: about
permalink: /about.html
# include CollectionBuilder info at bottom
credits: true
# featured-image value can be one objectid for a photo object in this collection, a relative path to an image in this project, or a full url to any image. If left blank, no featured image will appear at top of About page.
about-featured-image: scattering-skull
# set background-position for featured image, "center", "top", "bottom"
position: bottom
# major heading to display over featured image
heading: About the Collection
# paragraph text below heading in featured image
sub-heading: 
# additional padding added to the feature to increase size. Give value in em or px, e.g. "5em".
padding: 6em
# Edit the markdown on in this file to describe your collection
# Look in _includes/feature for options to easily add features to the page
---

## About this demonstration

This independent template extends [CollectionBuilder-CSV](https://github.com/CollectionBuilder/collectionbuilder-csv)
with a PlayCanvas viewer for meshes and Gaussian splats. CollectionBuilder supplies
the metadata, browsing, search, maps, timeline and static page generation. On supported
devices, the viewer also offers immersive AR and VR over HTTPS.

The collection contains two prepared public derivatives: Scattering Skull by
Vladimir Petkovic, from the Khronos sample collection, and Sakura Garden by
WakuFactory. Attribution and rights are recorded on their item pages; preparation
and source notes are in the repository's `objects/3dxr-sources.md`.

The Indiana University Bloomington locations and November 7, 2026 timestamps are
demonstration metadata, not the objects' capture locations or creation dates.
They show how CollectionBuilder's geographic and temporal browsing works.

## Using the template

Supply prepared public GLB or SOG derivatives, thumbnails and a metadata CSV.
The included GitHub Actions workflow builds Jekyll and publishes the static site.
No processing service or database is required. Viewer Save actions retain edits
only for the current viewing session; they do not change the published objects.

The repository README and `docs/3dxr.md` explain setup and supported features.
Replace this demonstration text with your own collection's purpose, curators,
credits and provenance when adapting the template. See [CB Docs](https://collectionbuilder.github.io/cb-docs/)
for the underlying CollectionBuilder conventions.

{% include feature/image.html objectid="scattering-skull" width="75" %}

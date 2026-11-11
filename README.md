# CollectionBuilder 3D / XR

An independent CollectionBuilder-CSV-based template for mesh and Gaussian-splat
collections, with the tools and immersive AR/VR while CollectionBuilder supplies metadata, browsing, search and page
generation. Prepared public derivatives are the inputs; asset processing is outside
this repository.

## Publish your collection

1. Use this template to create your repository.
2. Supply public GLB/SOG derivatives and preview images; edit `_data/3dxr-metadata.csv`.
3. Set site identity, `url` and `baseurl` in `_config.yml`.
4. Under GitHub Settings → Pages, choose **GitHub Actions**, then push to `main`.

The included Action builds Jekyll and publishes GitHub Pages. The viewer is
precompiled: curators do not need Node, an application server or an AWS account.
The small skull and streamed Sakura examples load directly from `objects/`.

For local preview, install Ruby/Bundler, then:

```sh
bundle install
bundle exec jekyll serve
```

See [3D/XR integration and metadata](docs/3dxr.md),
[viewer source and reproducible build](_viewer/README.md), and
[example provenance](objects/3dxr-sources.md).

Viewer developers must rebuild and commit the compiled bundle after changing
React/TypeScript or its dependencies. Jekyll does not compile these sources; see
the [publication and update procedure](docs/3dxr.md#publication-and-viewer-updates).

Save actions keep edits for the current browser viewing session. Persistent or
shared editing is not included. XR availability depends on HTTPS and browser/device
support. Existing hardware performance is not established by automated emulation.

## CollectionBuilder

Built on [CollectionBuilder-CSV](https://github.com/CollectionBuilder/collectionbuilder-csv)
from University of Idaho Library's CDIL. Follow its [documentation](https://collectionbuilder.github.io/cb-docs/)
and [contribution conventions](CONTRIBUTING.md). This is not an official release.

CollectionBuilder code retains its MIT license. The adapted viewer source is
Apache-2.0 (see `_viewer/LICENSE`); bundled third-party notices are under
`assets/lib/3dxr/licenses/`. Collection objects have their own licenses and rights.

"""Build a deterministic copy-in ZIP; never include site configuration or objects."""
from pathlib import Path
from zipfile import ZIP_DEFLATED, ZipFile, ZipInfo
import argparse

ROOT = Path(__file__).resolve().parents[1]
FILES = [
    "_layouts/item/3dxr.html",
    "_layouts/item/mesh.html",
    "_layouts/item/splat.html",
    "_includes/item/playcanvas-viewer.html",
    "_includes/feature/virtual-heritage-viewer.html",
    "_includes/js/3dxr.html",
    "_sass/_virtual-heritage-viewer.scss",
    "assets/js/3dxr-layout.js",
    "assets/lib/3dxr/viewer.scss",
]


def package(output):
    entries = {name: ROOT / name for name in FILES}
    for directory in ["assets/lib/3dxr/runtime", "assets/lib/3dxr/licenses"]:
        for source in sorted((ROOT / directory).rglob("*")):
            if source.is_file():
                entries[source.relative_to(ROOT).as_posix()] = source
    entries["README.md"] = ROOT / "docs/addon-installation.md"
    entries["assets/lib/3dxr/licenses/collectionbuilder-MIT.txt"] = ROOT / "LICENSE"
    output.parent.mkdir(parents=True, exist_ok=True)
    with ZipFile(output, "w", compression=ZIP_DEFLATED) as archive:
        for name, source in sorted(entries.items()):
            if source.is_symlink():
                raise ValueError(f"Refusing to package symlink: {source}")
            info = ZipInfo(name, date_time=(1980, 1, 1, 0, 0, 0))
            info.compress_type = ZIP_DEFLATED
            info.external_attr = 0o100644 << 16
            archive.writestr(info, source.read_bytes())
    print(f"Packaged {len(entries)} files: {output}")


if __name__ == "__main__":
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("--output", type=Path,
                        default=ROOT / "assets/downloads/virtual-heritage-viewer.zip")
    package(parser.parse_args().output)

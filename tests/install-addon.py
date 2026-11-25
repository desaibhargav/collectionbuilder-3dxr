"""Install the actual ZIP into an untouched CB-CSV checkout and prepare fixtures."""
from pathlib import Path
from zipfile import ZipFile
import csv
import hashlib
import shutil
import subprocess
import sys

root = Path(__file__).resolve().parents[1]
target = Path(sys.argv[1]).resolve()
revision = subprocess.check_output(["git", "-C", str(target), "rev-parse", "HEAD"], text=True).strip()
assert not subprocess.check_output(["git", "-C", str(target), "status", "--porcelain"], text=True)
originals = {p: hashlib.sha256(p.read_bytes()).digest()
             for p in target.rglob("*") if p.is_file() and ".git" not in p.parts}
with ZipFile(root / "assets/downloads/virtual-heritage-viewer.zip") as archive:
    assert archive.testzip() is None
    for name in archive.namelist():
        if name == "README.md":
            continue  # Installation instructions never replace the site's README.
        assert name.startswith(("_includes/", "_layouts/item/", "_sass/", "assets/")), name
        assert ".." not in Path(name).parts and not Path(name).is_absolute()
        destination = target / name
        assert not destination.exists(), f"Add-on would overwrite an existing file: {name}"
        destination.parent.mkdir(parents=True, exist_ok=True)
        destination.write_bytes(archive.read(name))
assert all(hashlib.sha256(p.read_bytes()).digest() == digest for p, digest in originals.items())
print(f"PASS copy-in installation: no existing files changed (CB-CSV {revision})")

# Ordinary curator configuration follows installation; no template source changes.
for name in ["scattering-skull", "sakura-garden"]:
    shutil.copytree(root / "objects" / name, target / "objects" / name)
with (root / "_data/3dxr-metadata.csv").open() as file:
    reader = csv.DictReader(file)
    fields, rows = reader.fieldnames, list(reader)
for row in rows:
    row["viewer_type"] = ""  # Verify mesh/splat layout inference, not only the demo's explicit field.
rows.append(dict(objectid="native-image", title="Native image regression", display_template="image",
                 object_location="/objects/scattering-skull/thumbnail.webp",
                 image_small="/objects/scattering-skull/thumbnail.webp",
                 image_thumb="/objects/scattering-skull/thumbnail.webp", image_alt_text="Skull preview"))
with (target / "_data/addon-verification.csv").open("w") as file:
    writer = csv.DictWriter(file, fieldnames=fields)
    writer.writeheader()
    writer.writerows(rows)
config = (target / "_config.yml").read_text().splitlines()
updates = {"metadata": "addon-verification", "title": "Virtual Heritage Collection"}
(target / "_config.yml").write_text("\n".join(
    f"{key}: {updates[key]}" if (key := line.split(":", 1)[0]) in updates else line
    for line in config) + "\n")
theme = target / "_data/theme.yml"
theme.write_text("\n".join("featured-image: native-image" if line.startswith("featured-image:") else line
                           for line in theme.read_text().splitlines()) + "\n")
for name in ["scattering-skull", "sakura-garden"]:
    (target / "pages" / f"embed-{name}.md").write_text(
        f'---\nlayout: page\ntitle: Embedded viewer\npermalink: /embed-{name}.html\n---\n'
        f'{{% include feature/virtual-heritage-viewer.html objectid="{name}" %}}\n')
print("Prepared mesh, streamed-splat, native-image and content-page fixtures")

import { createRoot } from "react-dom/client";
import { ArtifactViewer } from "./components/viewer/ArtifactViewer";
import type { Artifact } from "./api/artifacts";

// Liquid emits escaped attributes; React renders user metadata as plain text.
// No catalog API, router, or server-side application is required.
for (const element of document.querySelectorAll<HTMLElement>("[data-3dxr-viewer]")) {
    const { objectid, title, description, viewerType, content, lod } = element.dataset;
    if (!objectid || !content || (viewerType !== "mesh" && viewerType !== "splat")) {
        element.textContent = "Viewer configuration is incomplete. Check object_location and viewer_type in the metadata CSV.";
        element.setAttribute("role", "alert");
        continue;
    }
    const artifact: Artifact = {
        id: objectid, title: title || objectid, description: description || "",
        type: viewerType, contentUrl: content, lodUrl: lod || null,
        thumbnailUrl: null, sizeBytes: 0
    };
    createRoot(element).render(<ArtifactViewer artifact={artifact} />);
}

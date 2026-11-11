// Jekyll's header and title can change height with wrapping, fonts or navigation.
// Measure their actual space, rather than guessing a fixed header height in CSS.
// This runs on layout/viewport changes only; there is no animation-frame loop.
const viewer = document.querySelector("[data-3dxr-viewer]");
if (viewer) {
    const updateSize = () => {
        const pageTop = viewer.getBoundingClientRect().top + window.scrollY;
        const viewportHeight = window.visualViewport?.height ?? window.innerHeight;
        viewer.style.setProperty("--cb-viewer-available-height", `${Math.max(0, viewportHeight - pageTop)}px`);
    };
    const observer = new ResizeObserver(updateSize);
    const heading = document.querySelector(".cb-3dxr-heading");
    if (heading) observer.observe(heading);
    // Observe the existing CollectionBuilder shell without replacing its includes.
    for (let sibling = document.querySelector("#maincontent")?.previousElementSibling;
        sibling; sibling = sibling.previousElementSibling) {
        observer.observe(sibling);
    }
    window.addEventListener("resize", updateSize);
    window.visualViewport?.addEventListener("resize", updateSize);
    updateSize();
}

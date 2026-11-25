// Jekyll's header and title can change height with wrapping, fonts or navigation.
// Measure their actual space, rather than guessing a fixed header height in CSS.
// This runs on layout/viewport changes only; there is no animation-frame loop.
// Content-page embeds keep their natural 9:5 size even below the first screen.
const viewer = document.querySelector("[data-3dxr-fit]");
if (viewer) {
    const updateSize = () => {
        const pageTop = viewer.getBoundingClientRect().top + window.scrollY;
        const viewportHeight = window.visualViewport?.height ?? window.innerHeight;
        viewer.style.setProperty("--cb-viewer-available-height", `${Math.max(0, viewportHeight - pageTop)}px`);
    };
    const observer = new ResizeObserver(updateSize);
    // The item title comes from CB's unmodified item-page-base layout.
    const heading = document.querySelector("#maincontent h2");
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

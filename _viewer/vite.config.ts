import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

// Precompiled resources are committed. Curators only run Jekyll.
export default defineConfig({
    plugins: [react()],
    base: "./",
    build: {
        outDir: "../assets/lib/3dxr/runtime",
        emptyOutDir: true,
        rollupOptions: {
            input: "src/mount.tsx",
            output: { entryFileNames: "viewer.js", assetFileNames: "[name]-[hash][extname]" }
        }
    }
});

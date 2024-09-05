import { defineConfig } from "vite";

export default defineConfig({
  root: "./src",
  base: "/speech-test/",
  build: {
    outDir: "../dist",
    emptyOutDir: true,
    rollupOptions: {
      input: {
        main: "./src/index.html",
      },
    },
  },
});

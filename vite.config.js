import { defineConfig, loadEnv } from "vite";
import { svelte } from "@sveltejs/vite-plugin-svelte";
import { svelteTesting } from "@testing-library/svelte/vite";
import tailwindcss from "@tailwindcss/vite";
import process from "process";

// Menyisipkan CSS hasil build langsung ke index.html agar tidak ada permintaan CSS yang memblokir render
function inlineCss() {
  return {
    name: "inline-css",
    enforce: "post",
    apply: "build",
    transformIndexHtml(html, ctx) {
      if (!ctx.bundle) return html;
      let result = html;
      for (const [fileName, asset] of Object.entries(ctx.bundle)) {
        if (asset.type === "asset" && fileName.endsWith(".css")) {
          const link = new RegExp(
            `<link[^>]*href="[^"]*${fileName.split("/").pop()}"[^>]*>`
          );
          if (link.test(result)) {
            result = result.replace(link, () => `<style>${asset.source}</style>`);
            delete ctx.bundle[fileName];
          }
        }
      }
      return result;
    },
  };
}

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), "");

  return {
    plugins: [
      svelte({
        prebundleSvelteLibraries: false,
      }),
      tailwindcss(),
      inlineCss(),
      svelteTesting(),
    ],
    server: {
      port: Number(env.APP_PORT) || 3004,
    },
    preview: {
      port: Number(env.APP_PORT) || 3004,
    },
    build: {
      chunkSizeWarningLimit: 1500,
    },
    define: {
      // Saat test, selalu pakai URL tetap agar hasil tes tidak bergantung pada isi .env
      DELCOM_BASEURL: JSON.stringify(
        mode === "test"
          ? "http://localhost:8000/api/v1"
          : env.VITE_DELCOM_BASEURL || "http://localhost:8000/api/v1"
      ),
    },
    test: {
      globals: true,
      environment: "jsdom",
      setupFiles: "./src/setupTests.js",
      coverage: {
        provider: "v8",
        reporter: ["text", "json", "html", "lcov"],
        include: ["src/**/*.{js,svelte}"],
        exclude: [
          "src/main.js",
          "src/setupTests.js",
          "src/test-utils.js",
          "**/*.test.{js,jsx}",
          "node_modules/**",
          ".docs/**",
        ],
        thresholds: {
          lines: 100,
          functions: 100,
          branches: 100,
          statements: 100,
        },
      },
    },
  };
});

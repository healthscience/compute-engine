import { defineConfig } from 'vitest/config';
import wasm from "vite-plugin-wasm";
import topLevelAwait from "vite-plugin-top-level-await";

export default defineConfig({
  test: {
    environment: 'node',
    include: ['test/**/*.test.js'],
     environmentOptions: {
      env: {
        VITEST: 'true'
      }
    }
  },
  plugins: [
    wasm(),
    topLevelAwait()
  ]
});
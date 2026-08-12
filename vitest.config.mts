import path from "node:path";
import { defineConfig } from "vitest/config";

const rootDir = import.meta.dirname;

export default defineConfig({
  resolve: {
    alias: {
      // Mirrors tsconfig's "@/*" path alias.
      "@": rootDir,
      // `import "server-only"` throws by default outside a Next.js/React
      // Server Component build (see node_modules/server-only/index.js) -
      // point it at the package's own no-op build instead so lib/server
      // modules can be unit tested directly with plain Node/Vitest.
      "server-only": path.join(rootDir, "node_modules/server-only/empty.js"),
    },
  },
  test: {
    environment: "node",
    include: ["**/*.test.ts"],
    exclude: ["**/node_modules/**", "**/.next/**", "**/.open-next/**", "**/.wrangler/**"],
  },
});

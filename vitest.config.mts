import { fileURLToPath } from "node:url";
import { defineConfig } from "vitest/config";
import tsconfigPaths from "vite-tsconfig-paths";

export default defineConfig({
  plugins: [tsconfigPaths()],
  test: {
    environment: "node",
    include: ["**/*.test.ts"],
    exclude: ["node_modules", ".next"],
    alias: {
      // O pacote "server-only" lança erro por padrão fora do bundler do
      // Next.js (que resolve uma condição especial pra torná-lo um no-op).
      // O Vitest não conhece essa condição, então apelidamos direto para um
      // módulo vazio — nos testes já sabemos que só rodamos código de
      // servidor, o aviso não faz sentido aqui.
      "server-only": fileURLToPath(new URL("./vitest.server-only-stub.js", import.meta.url)),
    },
  },
});

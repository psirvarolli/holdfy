import type { NextConfig } from "next";
import { withSentryConfig } from "@sentry/nextjs";

const nextConfig: NextConfig = {
  /* config options here */
};

// Sem SENTRY_AUTH_TOKEN/org/project cadastrados ainda — o build funciona
// normalmente, só sem enviar source maps (então o rastro de erro no painel
// do Sentry aponta pro código minificado, não pro TypeScript original). Dá
// pra melhorar depois gerando um Auth Token em sentry.io/settings/account/api/auth-tokens/.
export default withSentryConfig(nextConfig, {
  silent: true,
});

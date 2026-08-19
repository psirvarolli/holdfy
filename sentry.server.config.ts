import * as Sentry from "@sentry/nextjs";

Sentry.init({
  dsn: process.env.SENTRY_DSN,
  tracesSampleRate: process.env.NODE_ENV === "production" ? 0.1 : 1.0,
  // Não guarda exceção nenhuma se a DSN não estiver configurada (ex: ambiente
  // local de quem clonar o repo sem criar uma conta Sentry própria) — Sentry
  // simplesmente vira um no-op nesse caso.
});

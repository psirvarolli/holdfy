import * as Sentry from "@sentry/nextjs";

Sentry.init({
  dsn: process.env.NEXT_PUBLIC_SENTRY_DSN,
  tracesSampleRate: process.env.NODE_ENV === "production" ? 0.1 : 1.0,
  // Sem Session Replay de propósito — gravar a tela do usuário é um passo a
  // mais em coleta de dados que a política de privacidade (app/privacidade)
  // não cobre; captura de erro/exceção é o suficiente pro que a auditoria
  // pediu.
});

export const onRouterTransitionStart = Sentry.captureRouterTransitionStart;

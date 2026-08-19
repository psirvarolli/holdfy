"use client";

import * as Sentry from "@sentry/nextjs";
import NextError from "next/error";
import { useEffect } from "react";

// Único jeito de capturar um erro de renderização que acontece fora de
// qualquer error.tsx local — sem isso, esse tipo de erro nunca chegava ao
// Sentry (ver auditoria de mainnet, ponto 6).
export default function GlobalError({ error }: { error: Error & { digest?: string } }) {
  useEffect(() => {
    Sentry.captureException(error);
  }, [error]);

  return (
    <html>
      <body>
        <NextError statusCode={0} />
      </body>
    </html>
  );
}

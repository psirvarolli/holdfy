This is a [Next.js](https://nextjs.org) project bootstrapped with [`create-next-app`](https://nextjs.org/docs/app/api-reference/cli/create-next-app).

## Banco de dados (Postgres)

O app usa Postgres via Prisma. Em desenvolvimento, sobe um container local com
Docker Compose:

```bash
docker compose up -d       # sobe o Postgres local (uma vez só, fica rodando)
npx prisma migrate deploy  # aplica as migrações
npx prisma db seed         # popula com dados de demonstração
```

A connection string já está em `.env` (`DATABASE_URL`), apontando para esse
container (`localhost:5432`). Em produção, troque só essa URL pela do
Neon/Supabase/etc. escolhido na hospedagem — o schema e o resto do código não
mudam.

## Testes

```bash
npm test
```

Cobre o caminho crítico (pagar → enviar → confirmar recebimento → liberar) e
as peças de segurança (login do admin, limite de tentativas, validação de
entrada, conversão de câmbio) com Vitest — sem depender da Trustless Work,
Pollar ou do banco de verdade (tudo mockado). Ficam em arquivos
`*.test.ts` ao lado do código que testam, dentro de `lib/server/`.

## Getting Started

First, run the development server:

```bash
npm run dev
# or
yarn dev
# or
pnpm dev
# or
bun dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

You can start editing the page by modifying `app/page.tsx`. The page auto-updates as you edit the file.

This project uses [`next/font`](https://nextjs.org/docs/app/building-your-application/optimizing/fonts) to automatically optimize and load [Geist](https://vercel.com/font), a new font family for Vercel.

## Learn More

To learn more about Next.js, take a look at the following resources:

- [Next.js Documentation](https://nextjs.org/docs) - learn about Next.js features and API.
- [Learn Next.js](https://nextjs.org/learn) - an interactive Next.js tutorial.

You can check out [the Next.js GitHub repository](https://github.com/vercel/next.js) - your feedback and contributions are welcome!

## Deploy on Vercel

The easiest way to deploy your Next.js app is to use the [Vercel Platform](https://vercel.com/new?utm_medium=default-template&filter=next.js&utm_source=create-next-app&utm_campaign=create-next-app-readme) from the creators of Next.js.

Check out our [Next.js deployment documentation](https://nextjs.org/docs/app/building-your-application/deploying) for more details.

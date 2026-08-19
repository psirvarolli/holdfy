import { NextResponse } from "next/server";
import { randomBytes, createCipheriv } from "node:crypto";
import { put } from "@vercel/blob";
import { prisma } from "@/lib/prisma";

// Segunda camada de segurança independente do retention/PITR do Neon (ver
// auditoria de mainnet — o banco de produção zerou uma vez sem causa
// confirmada). Não é um backup "restaurável com um clique": em caso de
// necessidade, é baixar o arquivo do Blob e descriptografar+reinserir via
// script. Chamada pelo Cron Job diário definido em vercel.json.
//
// O Vercel Blob só tem armazenamento "público" (qualquer um com a URL lê,
// sem autenticação) — como o dump carrega nome/telefone de compradores e
// carteiras de vendedores, o conteúdo é cifrado com AES-256-GCM antes do
// upload, então uma URL vazada sozinha não expõe nada sem
// BACKUP_ENCRYPTION_KEY.
function encrypt(plaintext: string): Buffer {
  const key = Buffer.from(process.env.BACKUP_ENCRYPTION_KEY!, "base64");
  const iv = randomBytes(12);
  const cipher = createCipheriv("aes-256-gcm", key, iv);
  const ciphertext = Buffer.concat([cipher.update(plaintext, "utf8"), cipher.final()]);
  const authTag = cipher.getAuthTag();
  // iv (12) + authTag (16) + ciphertext — tudo que o decrypt precisa, num
  // único arquivo.
  return Buffer.concat([iv, authTag, ciphertext]);
}

export async function GET(request: Request) {
  const secret = process.env.CRON_SECRET;
  const auth = request.headers.get("authorization");
  if (!secret || auth !== `Bearer ${secret}`) {
    return NextResponse.json({ error: "Não autorizado." }, { status: 401 });
  }

  const [orders, plans, leads, sellerSubscriptions, sellerWhatsapp] = await Promise.all([
    prisma.order.findMany({ include: { items: true, timeline: true, evidence: true } }),
    prisma.plan.findMany(),
    prisma.lead.findMany(),
    prisma.sellerSubscription.findMany(),
    prisma.sellerWhatsapp.findMany(),
  ]);

  const takenAt = new Date().toISOString();
  const snapshot = { takenAt, orders, plans, leads, sellerSubscriptions, sellerWhatsapp };

  const path = `backups/${takenAt.replace(/[:.]/g, "-")}.enc`;
  const blob = await put(path, encrypt(JSON.stringify(snapshot)), {
    access: "public",
    contentType: "application/octet-stream",
  });

  return NextResponse.json({
    ok: true,
    url: blob.url,
    counts: {
      orders: orders.length,
      plans: plans.length,
      leads: leads.length,
      sellerSubscriptions: sellerSubscriptions.length,
      sellerWhatsapp: sellerWhatsapp.length,
    },
  });
}

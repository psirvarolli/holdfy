import { prisma } from "@/lib/prisma";

export interface SellerWhatsappLink {
  sellerAddress: string;
  phone: string;
}

// Um vendedor pode ter no máximo um número vinculado, e um número só pode
// apontar para uma carteira — por isso upsert por sellerAddress + limpeza de
// qualquer registro anterior que já usasse esse mesmo phone (ex: vendedor
// trocou de número).
export async function linkSellerWhatsapp(sellerAddress: string, phone: string): Promise<SellerWhatsappLink> {
  await prisma.sellerWhatsapp.deleteMany({ where: { phone, NOT: { sellerAddress } } });
  const link = await prisma.sellerWhatsapp.upsert({
    where: { sellerAddress },
    create: { sellerAddress, phone },
    update: { phone },
  });
  return { sellerAddress: link.sellerAddress, phone: link.phone };
}

export async function getSellerWhatsapp(sellerAddress: string): Promise<SellerWhatsappLink | null> {
  const link = await prisma.sellerWhatsapp.findUnique({ where: { sellerAddress } });
  return link ? { sellerAddress: link.sellerAddress, phone: link.phone } : null;
}

export async function findSellerAddressByPhone(phone: string): Promise<string | null> {
  const link = await prisma.sellerWhatsapp.findUnique({ where: { phone } });
  return link?.sellerAddress ?? null;
}

export async function unlinkSellerWhatsapp(sellerAddress: string): Promise<void> {
  await prisma.sellerWhatsapp.deleteMany({ where: { sellerAddress } });
}

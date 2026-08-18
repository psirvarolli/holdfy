import { NextResponse } from "next/server";
import { z } from "zod";
import {
  linkSellerWhatsapp,
  getSellerWhatsapp,
  findSellerAddressByPhone,
  unlinkSellerWhatsapp,
} from "@/lib/server/seller-whatsapp";
import { parseJsonBody, stellarAddress, e164Phone } from "@/lib/server/validation";

// Aceita `sellerAddress` (tela de Configurações, consultando o próprio
// vínculo) ou `phone` (bot de WhatsApp, resolvendo de qual vendedor é esse
// número antes de criar um pedido) — nunca os dois ao mesmo tempo.
export async function GET(request: Request) {
  const params = new URL(request.url).searchParams;
  const sellerAddressParam = params.get("sellerAddress");
  const phoneParam = params.get("phone");

  if (phoneParam) {
    const parsed = e164Phone.safeParse(phoneParam);
    if (!parsed.success) {
      return NextResponse.json({ error: "Parâmetro 'phone' inválido." }, { status: 400 });
    }
    const sellerAddress = await findSellerAddressByPhone(parsed.data);
    return NextResponse.json({ link: sellerAddress ? { sellerAddress, phone: parsed.data } : null });
  }

  const parsed = stellarAddress.safeParse(sellerAddressParam);
  if (!parsed.success) {
    return NextResponse.json({ error: "Informe 'sellerAddress' ou 'phone'." }, { status: 400 });
  }

  const link = await getSellerWhatsapp(parsed.data);
  return NextResponse.json({ link });
}

const linkSchema = z.object({
  sellerAddress: stellarAddress,
  phone: e164Phone,
});

export async function POST(request: Request) {
  const parsed = await parseJsonBody(request, linkSchema);
  if ("error" in parsed) return parsed.error;

  try {
    const link = await linkSellerWhatsapp(parsed.data.sellerAddress, parsed.data.phone);
    return NextResponse.json({ link });
  } catch (error) {
    console.error("Falha ao vincular WhatsApp", error);
    return NextResponse.json({ error: "Falha ao vincular o WhatsApp. Tente novamente." }, { status: 500 });
  }
}

const unlinkSchema = z.object({ sellerAddress: stellarAddress });

export async function DELETE(request: Request) {
  const parsed = await parseJsonBody(request, unlinkSchema);
  if ("error" in parsed) return parsed.error;

  await unlinkSellerWhatsapp(parsed.data.sellerAddress);
  return NextResponse.json({ ok: true });
}

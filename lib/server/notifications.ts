import { prisma } from "@/lib/prisma";
import type { Notification, UserRole } from "@/lib/types";

// Notificação dentro do próprio app — sem e-mail/push por enquanto, isso
// exigiria uma conta num provedor externo (Resend, etc.) que ainda não
// existe. Ainda assim resolve o problema real: hoje nada avisa ninguém de
// nada, só descobre atualizando a página.
//
// recipientAddress vem de quem chama (order.sellerAddress ou
// order.buyerAddress, já em mãos em todo call site) em vez de ser
// recalculado aqui — evita uma consulta extra e evita divergir do endereço
// real gravado no pedido. Pode ser null (ex: comprador que nunca chegou a
// pagar não tem buyerAddress ainda); nesse caso não há pra quem notificar e
// a gravação é pulada.
export async function createNotification(
  orderId: string,
  recipientRole: UserRole,
  recipientAddress: string | null | undefined,
  message: string
): Promise<void> {
  if (!recipientAddress) return;
  await prisma.notification.create({
    data: { orderId, recipientRole, recipientAddress, message },
  });
}

export async function listNotifications(recipientAddress: string): Promise<Notification[]> {
  const rows = await prisma.notification.findMany({
    where: { recipientAddress },
    include: { order: { select: { displayId: true } } },
    orderBy: { createdAt: "desc" },
    take: 50,
  });

  return rows.map((row) => ({
    id: row.id,
    orderId: row.orderId,
    orderDisplayId: row.order.displayId,
    message: row.message,
    read: row.read,
    createdAt: row.createdAt.toISOString(),
  }));
}

export async function markNotificationRead(id: string, recipientAddress: string): Promise<void> {
  await prisma.notification.updateMany({ where: { id, recipientAddress }, data: { read: true } });
}

export async function markAllNotificationsRead(recipientAddress: string): Promise<void> {
  await prisma.notification.updateMany({
    where: { recipientAddress, read: false },
    data: { read: true },
  });
}
